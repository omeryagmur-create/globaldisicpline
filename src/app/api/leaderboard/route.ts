import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

import { calculateFallbackRanks, checkIsAllZero } from '@/lib/leaderboardUtils';

export const dynamic = 'force-dynamic';

async function getAllTimeLeaderboard(supabase: any, leagueFilter: string | null, offset: number, limit: number) {
    let query = supabase
        .from('profiles')
        .select('id, full_name, avatar_url, country, total_xp, current_level, current_league, subscription_tier', { count: 'exact' })
        .order('total_xp', { ascending: false })
        .order('id', { ascending: true });

    if (leagueFilter) {
        query = query.eq('current_league', leagueFilter);
    }

    query = query.range(offset, offset + limit - 1);

    const { data: profiles, count, error } = await query;
    if (error || !profiles) return { error: 'Failed to fetch all-time leaderboard' };

    const data = profiles.map((p: any, i: number) => ({
        user_id: p.id,
        total_xp: p.total_xp || 0,
        season_xp: p.total_xp || 0,
        league: p.current_league || 'Bronze',
        rank_overall: offset + i + 1,
        rank_in_league: offset + i + 1,
        rank_premium_in_league: p.subscription_tier !== 'free' ? offset + i + 1 : null,
        profiles: {
            id: p.id,
            full_name: p.full_name,
            avatar_url: p.avatar_url,
            country: p.country,
            current_level: p.current_level,
            subscription_tier: p.subscription_tier,
        }
    }));

    return {
        data,
        metadata: {
            seasonId: null,
            scope: 'all_time',
            league: leagueFilter,
            total_count: count || 0,
            is_all_zero_top: checkIsAllZero(data),
            xp_basis: 'total_xp',
            all_time: true,
        }
    };
}

async function getFallbackLeaderboard(supabase: any, scope: string, leagueFilter: string | null, offset: number, limit: number, activeSeasonId: string | null) {
    const { data: allProfiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, country, total_xp, current_level, current_league, subscription_tier');

    if (error || !allProfiles) return { error: 'Failed to fetch leaderboard' };

    const { data, total_count } = calculateFallbackRanks(allProfiles, scope, leagueFilter, offset, limit);

    // Check if top results (first 20) are all 0 XP
    const isAllZero = checkIsAllZero(data);

    return {
        data,
        metadata: {
            seasonId: activeSeasonId,
            scope,
            league: leagueFilter,
            fallback: true,
            total_count,
            is_all_zero_top: isAllZero,
            xp_basis: 'total_xp',
        }
    };
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const scope = searchParams.get('scope') || 'overall'; // 'overall', 'league', 'premium', 'all_time'
        const leagueFilter = searchParams.get('league');
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const offset = parseInt(searchParams.get('offset') || '0', 10);

        // Enforce league filter for specific scopes
        if ((scope === 'league' || scope === 'premium') && !leagueFilter) {
            return NextResponse.json({ error: 'League filter is required for league and premium scopes' }, { status: 400 });
        }

        const supabase = await createClient();

        if (scope === 'all_time') {
            const result = await getAllTimeLeaderboard(supabase, leagueFilter, offset, limit);
            if ((result as any).error) {
                return NextResponse.json({ error: (result as any).error }, { status: 500 });
            }
            return NextResponse.json(result);
        }

        // 1. Get active season ID - fast indexed query
        const { data: activeSeason, error: seasonError } = await supabase
            .from('league_seasons')
            .select('id, starts_at, ends_at')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        // If no active season, fall back to profiles table for basic ranking
        if (seasonError || !activeSeason) {
            const fallback = await getFallbackLeaderboard(supabase, scope, leagueFilter, offset, limit, null);
            if (fallback.error) return NextResponse.json({ error: fallback.error }, { status: 500 });
            return NextResponse.json(fallback);
        }

        const activeSeasonId = activeSeason.id;

        // 2. Query the LIVE leaderboard view (always up to date)
        let snapshotQuery = supabase
            .from('live_league_leaderboard')
            .select('user_id, season_xp, league, rank_overall, rank_in_league, rank_premium_in_league', { count: 'exact' })
            .eq('season_id', activeSeasonId);

        if (leagueFilter) {
            snapshotQuery = snapshotQuery.eq('league', leagueFilter);
        }

        switch (scope) {
            case 'league':
                snapshotQuery = snapshotQuery.not('rank_in_league', 'is', null).order('rank_in_league');
                break;
            case 'premium':
                snapshotQuery = snapshotQuery.not('rank_premium_in_league', 'is', null).order('rank_premium_in_league');
                break;
            default:
                snapshotQuery = snapshotQuery.not('rank_overall', 'is', null).order('rank_overall');
        }

        snapshotQuery = snapshotQuery.range(offset, offset + limit - 1);

        const { data: snapshots, count, error: snapError } = await snapshotQuery;

        if (snapError || !snapshots || snapshots.length === 0) {
            const fallback = await getFallbackLeaderboard(supabase, scope, leagueFilter, offset, limit, activeSeasonId);
            if (fallback.error) return NextResponse.json({ error: fallback.error }, { status: 500 });
            return NextResponse.json(fallback);
        }

        // 3. Fetch profiles for these user IDs
        const userIds = snapshots.map(s => s.user_id);
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, country, current_level, subscription_tier')
            .in('id', userIds);

        const profileMap = new Map((profiles || []).map(p => [p.id, p]));

        const data = snapshots.map(snap => ({
            ...snap,
            profiles: profileMap.get(snap.user_id) || {
                id: snap.user_id,
                full_name: null,
                avatar_url: null,
                country: null,
                current_level: 1,
                subscription_tier: 'free',
            }
        }));

        // Check if top results (first 20) are all 0 XP
        const isAllZero = checkIsAllZero(snapshots);

        return NextResponse.json({
            data,
            metadata: {
                seasonId: activeSeasonId,
                scope,
                league: leagueFilter,
                total_count: count,
                season_starts_at: activeSeason.starts_at,
                season_ends_at: activeSeason.ends_at,
                is_all_zero_top: isAllZero,
                xp_basis: 'season_xp'
            }
        });

    } catch (error: any) {
        console.error('Leaderboard API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
