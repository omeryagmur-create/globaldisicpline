import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: activeSeason, error: seasonError } = await supabase
            .rpc('get_active_season');

        if (seasonError || !activeSeason || activeSeason.length === 0) {
            return NextResponse.json({ error: 'No active season found' }, { status: 404 });
        }

        const activeSeasonId = activeSeason[0].id;

        // Fetch user snapshot
        const { data: snapshot, error: snapshotError } = await supabase
            .from('league_snapshots')
            .select('rank_overall, rank_in_league, rank_premium_in_league, season_xp, league')
            .eq('season_id', activeSeasonId)
            .eq('user_id', user.id)
            .single();

        if (snapshotError && snapshotError.code !== 'PGRST116') {
            console.error('Error fetching snapshot:', snapshotError);
            return NextResponse.json({ error: 'Failed to fetch personal leaderboard rank' }, { status: 500 });
        }

        // Get total users in the league to calculate distances
        let totalInLeague = 0;
        if (snapshot?.league) {
            const { count, error: countError } = await supabase
                .from('league_snapshots')
                .select('*', { count: 'exact', head: true })
                .eq('season_id', activeSeasonId)
                .eq('league', snapshot.league);
            if (!countError) {
                totalInLeague = count || 0;
            }
        }

        let distances = null;
        if (snapshot && totalInLeague > 0) {
            const promoteCount = Math.floor(totalInLeague * 0.10);
            const relegateCount = Math.floor(totalInLeague * 0.10);

            distances = {
                total_users: totalInLeague,
                promote_threshold: promoteCount,
                relegate_threshold: totalInLeague - relegateCount,
                distance_to_promote: snapshot.rank_in_league - promoteCount,
                distance_to_relegate: (totalInLeague - relegateCount) - snapshot.rank_in_league
            };
        }

        return NextResponse.json({
            data: snapshot || null,
            distances
        });

    } catch (error: any) {
        console.error('Leaderboard ME API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
