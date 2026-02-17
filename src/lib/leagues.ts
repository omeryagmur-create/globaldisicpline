export type LeagueTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Elite';

export interface LeagueInfo {
    name: LeagueTier;
    title: string;
    minXp: number;
    multiplier: number;
    color: string;
    description: string;
}

export const LEAGUE_CONFIG: Record<LeagueTier, LeagueInfo> = {
    Bronze: {
        name: 'Bronze',
        title: 'Bronze Initiate',
        minXp: 0,
        multiplier: 1.0,
        color: '#cd7f32',
        description: 'The foundation of discipline. Focus on consistency.'
    },
    Silver: {
        name: 'Silver',
        title: 'Silver Strategist',
        minXp: 1000,
        multiplier: 1.1,
        color: '#c0c0c0',
        description: 'Applying logic to the grind. Strategy emerges.'
    },
    Gold: {
        name: 'Gold',
        title: 'Gold Operator',
        minXp: 5000,
        multiplier: 1.2,
        color: '#ffd700',
        description: 'Elite focus in progress. Operative status achieved.'
    },
    Diamond: {
        name: 'Diamond',
        title: 'Diamond Vanguard',
        minXp: 15000,
        multiplier: 1.5,
        color: '#b9f2ff',
        description: 'At the forefront of productivity. Unmatched willpower.'
    },
    Elite: {
        name: 'Elite',
        title: 'Elite Commander',
        minXp: 50000,
        multiplier: 2.0,
        color: '#ff4d4d',
        description: 'Supreme discipline. COMMAND status recognized.'
    },
};

export function calculateLeague(xp: number, consistency: number): LeagueTier {
    if (xp >= 50000 && consistency > 0.9) return 'Elite';
    if (xp >= 15000 && consistency > 0.8) return 'Diamond';
    if (xp >= 5000 && consistency > 0.7) return 'Gold';
    if (xp >= 1000 && consistency > 0.5) return 'Silver';
    return 'Bronze';
}

export function getLeagueMultiplier(tier: LeagueTier): number {
    return LEAGUE_CONFIG[tier]?.multiplier || 1.0;
}

export function getLeagueTitle(tier: LeagueTier): string {
    return LEAGUE_CONFIG[tier]?.title || 'Recruit';
}
