export interface FallbackProfile {
    id: string;
    current_league?: string | null;
    subscription_tier?: string;
    total_xp?: number;
    full_name?: string | null;
    avatar_url?: string | null;
    country?: string | null;
    current_level?: number;
}

export function calculateFallbackRanks(allProfiles: FallbackProfile[], scope: string, leagueFilter: string | null, offset: number, limit: number) {
    // Sort initially by total_xp DESC
    const sortedProfiles = [...allProfiles].sort((a, b) => (b.total_xp || 0) - (a.total_xp || 0));

    const leagueCounters: Record<string, number> = {};
    const premiumLeagueCounters: Record<string, number> = {};

    let processedAll = sortedProfiles.map((p, index) => {
        const league = p.current_league || 'Bronze';
        const isPremium = p.subscription_tier !== 'free';

        leagueCounters[league] = (leagueCounters[league] || 0) + 1;
        if (isPremium) {
            premiumLeagueCounters[league] = (premiumLeagueCounters[league] || 0) + 1;
        }

        return {
            user_id: p.id,
            season_xp: p.total_xp,
            league: league,
            rank_overall: index + 1,
            rank_in_league: leagueCounters[league],
            rank_premium_in_league: isPremium ? premiumLeagueCounters[league] : null,
            profiles: {
                id: p.id,
                full_name: p.full_name,
                avatar_url: p.avatar_url,
                country: p.country,
                current_level: p.current_level,
                subscription_tier: p.subscription_tier || 'free',
            }
        };
    });

    if (leagueFilter) {
        processedAll = processedAll.filter(p => p.league === leagueFilter);
    }

    if (scope === 'premium') {
        processedAll = processedAll.filter(p => p.profiles.subscription_tier !== 'free');
        processedAll.sort((a, b) => (a.rank_premium_in_league || 0) - (b.rank_premium_in_league || 0));
    } else if (scope === 'league') {
        processedAll.sort((a, b) => (a.rank_in_league || 0) - (b.rank_in_league || 0));
    } else {
        processedAll.sort((a, b) => (a.rank_overall || 0) - (b.rank_overall || 0));
    }

    return processedAll.slice(offset, offset + limit);
}
