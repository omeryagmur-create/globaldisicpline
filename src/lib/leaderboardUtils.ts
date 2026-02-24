export interface FallbackProfile {
    id: string;
    current_league?: string | null;
    subscription_tier?: string;
    total_xp?: number;
    current_season_xp?: number;
    full_name?: string | null;
    avatar_url?: string | null;
    country?: string | null;
    current_level?: number;
}

export function calculateFallbackRanks(allProfiles: FallbackProfile[], scope: string, leagueFilter: string | null, offset: number, limit: number) {
    const isAllTime = scope === 'all_time';

    // Sort by correct XP basis (season or total) and id ASC for deterministic ranking
    const sortedProfiles = [...allProfiles].sort((a, b) => {
        const valA = isAllTime ? (a.total_xp || 0) : (a.current_season_xp || 0);
        const valB = isAllTime ? (b.total_xp || 0) : (b.current_season_xp || 0);

        const xpDiff = valB - valA;
        if (xpDiff !== 0) return xpDiff;
        return a.id.localeCompare(b.id);
    });

    const leagueCounters: Record<string, number> = {};
    const premiumLeagueCounters: Record<string, number> = {};

    let processedAll = sortedProfiles.map((p, index) => {
        const league = p.current_league || 'Bronze';
        const isPremium = p.subscription_tier !== 'free';
        const xp = isAllTime ? (p.total_xp || 0) : (p.current_season_xp || 0);

        leagueCounters[league] = (leagueCounters[league] || 0) + 1;
        if (isPremium) {
            premiumLeagueCounters[league] = (premiumLeagueCounters[league] || 0) + 1;
        }

        return {
            user_id: p.id,
            season_xp: xp,
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

    return {
        data: processedAll.slice(offset, offset + limit),
        total_count: processedAll.length
    };
}

export function checkIsAllZero(data: { season_xp?: number }[]): boolean {
    if (!data || data.length === 0) return false;
    return data.slice(0, 20).every(u => (u.season_xp || 0) === 0);
}
