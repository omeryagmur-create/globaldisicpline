import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const scope = searchParams.get('scope') || 'overall'; // 'overall', 'league', 'premium'
        const leagueFilter = searchParams.get('league');
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const offset = parseInt(searchParams.get('offset') || '0', 10);

        const supabase = await createClient();

        // 1. Get active season ID - fast indexed query
        const { data: activeSeason, error: seasonError } = await supabase
            .from('league_seasons')
            .select('id')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        // If no active season, fall back to profiles table for basic ranking
        if (seasonError || !activeSeason) {
            const profileQuery = supabase
                .from('profiles')
                .select('id, full_name, avatar_url, country, total_xp, current_level, current_league, subscription_tier')
                .order('total_xp', { ascending: false })
                .range(offset, offset + limit - 1);

            if (leagueFilter) {
                profileQuery.eq('current_league', leagueFilter);
            }
            if (scope === 'premium') {
                profileQuery.neq('subscription_tier', 'free');
            }

            const { data: profiles, error: profileError } = await profileQuery;

            if (profileError) {
                return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
            }

            // Convert to snapshot-like format
            const formatted = (profiles || []).map((p, i) => ({
                user_id: p.id,
                season_xp: p.total_xp,
                league: p.current_league || 'Bronze',
                rank_overall: scope === 'overall' ? offset + i + 1 : null,
                rank_in_league: scope === 'league' ? offset + i + 1 : null,
                rank_premium_in_league: scope === 'premium' ? offset + i + 1 : null,
                profiles: {
                    id: p.id,
                    full_name: p.full_name,
                    avatar_url: p.avatar_url,
                    country: p.country,
                    current_level: p.current_level,
                    subscription_tier: p.subscription_tier,
                }
            }));

            return NextResponse.json({ data: formatted, metadata: { scope, league: leagueFilter, fallback: true } });
        }

        const activeSeasonId = activeSeason.id;

        // 2. Query the LIVE leaderboard view (always up to date)
        let snapshotQuery = supabase
            .from('live_league_leaderboard')
            .select('user_id, season_xp, league, rank_overall, rank_in_league, rank_premium_in_league')
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

        const { data: snapshots, error: snapError } = await snapshotQuery;

        if (snapError || !snapshots || snapshots.length === 0) {
            // Fallback to basic profiles query if view is empty or errors
            let fallbackQuery = supabase
                .from('profiles')
                .select('id, full_name, avatar_url, country, total_xp, current_level, current_league, subscription_tier')
                .order('total_xp', { ascending: false })
                .range(offset, offset + limit - 1);

            if (leagueFilter) {
                fallbackQuery = fallbackQuery.eq('current_league', leagueFilter);
            }
            if (scope === 'premium') {
                fallbackQuery = fallbackQuery.neq('subscription_tier', 'free');
            }

            const { data: profiles } = await fallbackQuery;

            const formatted = (profiles || []).map((p, i) => ({
                user_id: p.id,
                season_xp: p.total_xp,
                league: p.current_league || 'Bronze',
                rank_overall: scope === 'overall' ? offset + i + 1 : null,
                rank_in_league: scope === 'league' ? offset + i + 1 : null,
                rank_premium_in_league: scope === 'premium' ? offset + i + 1 : null,
                profiles: { id: p.id, full_name: p.full_name, avatar_url: p.avatar_url, country: p.country, current_level: p.current_level, subscription_tier: p.subscription_tier }
            }));
            return NextResponse.json({ data: formatted, metadata: { seasonId: activeSeasonId, scope, league: leagueFilter, fallback: true } });
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

        return NextResponse.json({
            data,
            metadata: { seasonId: activeSeasonId, scope, league: leagueFilter }
        });

    } catch (error: any) {
        console.error('Leaderboard API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
