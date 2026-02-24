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

        // 1. Get user profile first (always exists)
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, current_league, total_xp, current_season_xp, full_name, subscription_tier')
            .eq('id', user.id)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        // 2. Get active season
        const { data: activeSeason } = await supabase.from('league_seasons').select('id').eq('status', 'active').limit(1).single();

        if (!activeSeason) {
            // Fallback for no active season
            return NextResponse.json({
                data: {
                    rank_overall: 0,
                    rank_in_league: 0,
                    rank_premium_in_league: null,
                    season_xp: profile.current_season_xp || 0,
                    league: profile.current_league || 'Bronze'
                },
                distances: null,
                fallback: true
            });
        }

        // 3. Fetch user status from LIVE view
        const { data: snapshot } = await supabase
            .from('live_league_leaderboard')
            .select('rank_overall, rank_in_league, rank_premium_in_league, season_xp, league')
            .eq('season_id', activeSeason.id)
            .eq('user_id', user.id)
            .single();

        // 4. If no status found
        if (!snapshot) {
            return NextResponse.json({
                data: {
                    rank_overall: 0,
                    rank_in_league: 0,
                    rank_premium_in_league: null,
                    season_xp: 0,
                    league: profile.current_league || 'Bronze'
                },
                distances: null,
                is_new: true
            });
        }

        // 5. Get total users in league for distances FROM THE LIVE VIEW
        const { count: totalInLeague } = await supabase
            .from('live_league_leaderboard')
            .select('*', { count: 'exact', head: true })
            .eq('season_id', activeSeason.id)
            .eq('league', snapshot.league);

        const total = totalInLeague || 1;

        // Match the logic in the settlement function (15%, min 1 if total >= 2)
        const promoteCount = total >= 2 ? Math.max(1, Math.floor(total * 0.15)) : 0;
        const relegateCount = total >= 5 ? Math.max(1, Math.floor(total * 0.15)) : 0;

        const distances = {
            total_users: total,
            promote_threshold: promoteCount,
            relegate_threshold: total - relegateCount,
            distance_to_promote: Math.max(0, snapshot.rank_in_league - promoteCount),
            distance_to_relegate: Math.max(0, (total - relegateCount) - snapshot.rank_in_league)
        };

        // 6. Get all-time rank with deterministic tie-break (XP DESC, ID ASC)
        // Rank = (count of users with more XP) + (count of users with same XP but smaller ID) + 1
        const { count: higherXPCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gt('total_xp', profile.total_xp);

        const { count: sameXPSmallerIdCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('total_xp', profile.total_xp)
            .lt('id', profile.id);

        const rankAllTime = (higherXPCount || 0) + (sameXPSmallerIdCount || 0) + 1;

        return NextResponse.json({
            data: {
                ...snapshot,
                total_xp: profile.total_xp,
                rank_all_time: rankAllTime
            },
            distances
        });

    } catch (error: any) {
        console.error('Leaderboard ME API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
