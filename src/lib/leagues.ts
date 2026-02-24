export type LeagueTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Emerald' | 'Diamond' | 'Master' | 'Grandmaster';

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
    Platinum: {
        name: 'Platinum',
        title: 'Platinum Specialist',
        minXp: 10000,
        multiplier: 1.3,
        color: '#e5e4e2',
        description: 'Advanced tactical focus.'
    },
    Emerald: {
        name: 'Emerald',
        title: 'Emerald Guardian',
        minXp: 20000,
        multiplier: 1.4,
        color: '#50c878',
        description: 'Consistent high performance.'
    },
    Diamond: {
        name: 'Diamond',
        title: 'Diamond Vanguard',
        minXp: 40000,
        multiplier: 1.5,
        color: '#b9f2ff',
        description: 'At the forefront of productivity. Unmatched willpower.'
    },
    Master: {
        name: 'Master',
        title: 'Master Sentinel',
        minXp: 75000,
        multiplier: 1.8,
        color: '#9076D4',
        description: 'Unbreakable discipline.'
    },
    Grandmaster: {
        name: 'Grandmaster',
        title: 'Grandmaster Commander',
        minXp: 150000,
        multiplier: 2.0,
        color: '#FF0055',
        description: 'Supreme discipline. Highest achievable tier.'
    },
};

export function calculateLeague(xp: number, consistency: number): LeagueTier {
    if (xp >= 150000 && consistency > 0.95) return 'Grandmaster';
    if (xp >= 75000 && consistency > 0.9) return 'Master';
    if (xp >= 40000 && consistency > 0.8) return 'Diamond';
    if (xp >= 20000 && consistency > 0.75) return 'Emerald';
    if (xp >= 10000 && consistency > 0.7) return 'Platinum';
    if (xp >= 5000 && consistency > 0.6) return 'Gold';
    if (xp >= 1000 && consistency > 0.5) return 'Silver';
    return 'Bronze';
}

export function getLeagueMultiplier(tier: LeagueTier): number {
    return LEAGUE_CONFIG[tier]?.multiplier || 1.0;
}

export function getLeagueTitle(tier: LeagueTier): string {
    return LEAGUE_CONFIG[tier]?.title || 'Recruit';
}
