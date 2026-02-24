import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const scope = searchParams.get('scope') || 'overall'; // 'overall', 'league', 'premium'
        const leagueFilter = searchParams.get('league');
        const seasonId = searchParams.get('season');
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const offset = parseInt(searchParams.get('offset') || '0', 10);

        const supabase = await createClient();

        let activeSeasonId = seasonId;
        if (!activeSeasonId) {
            const { data: activeSeason, error: seasonError } = await supabase
                .rpc('get_active_season');

            if (seasonError || !activeSeason || activeSeason.length === 0) {
                return NextResponse.json({ error: 'No active season found' }, { status: 404 });
            }
            activeSeasonId = activeSeason[0].id;
        }

        let query = supabase
            .from('league_snapshots')
            .select(`
        rank_overall,
        rank_in_league,
        rank_premium_in_league,
        season_xp,
        league,
        user_id,
        profiles (
          id,
          full_name,
          avatar_url,
          country,
          subscription_tier,
          current_level
        )
      `)
            .eq('season_id', activeSeasonId);

        // Filter by league if provided
        if (leagueFilter) {
            query = query.eq('league', leagueFilter);
        }

        // Sort and filter based on scope
        switch (scope) {
            case 'league':
                query = query.not('rank_in_league', 'is', null).order('rank_in_league', { ascending: true });
                break;
            case 'premium':
                query = query.not('rank_premium_in_league', 'is', null).order('rank_premium_in_league', { ascending: true });
                break;
            case 'overall':
            default:
                query = query.not('rank_overall', 'is', null).order('rank_overall', { ascending: true });
                break;
        }

        // Pagination
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching leaderboard:', error);
            return NextResponse.json({ error: 'Failed to fetch leaderboard data' }, { status: 500 });
        }

        return NextResponse.json({
            data,
            metadata: {
                seasonId: activeSeasonId,
                scope,
                league: leagueFilter,
            }
        });

    } catch (error: any) {
        console.error('Leaderboard API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
