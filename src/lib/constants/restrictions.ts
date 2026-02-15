export const RESTRICTION_TYPES = {
    FEATURE_LOCK: {
        id: 'feature_lock',
        level1: ['advanced_analytics', 'ai_planner'],
        level2: ['create_challenge', 'premium_templates'],
        level3: ['all_premium_features']
    },
    SOCIAL_REDUCTION: {
        id: 'social_reduction',
        level1: ['leaderboard_visibility_reduced'],
        level2: ['profile_private', 'no_friend_requests'],
        level3: ['social_features_disabled']
    },
    XP_PENALTY: {
        id: 'xp_penalty',
        level1: 0.5, // 50% XP
        level2: 0.3, // 30% XP
        level3: 0.1  // 10% XP
    },
    CHALLENGE_LOCK: {
        id: 'challenge_lock',
        level1: ['no_high_stake_challenges'],
        level2: ['no_new_challenges'],
        level3: ['all_challenges_disabled']
    }
};

export const RESTRICTION_DURATION = {
    1: 7,   // 7 days
    2: 14,  // 14 days
    3: 30   // 30 days
};

export interface ActiveRestriction {
    id: string; // UUID
    userId: string;
    type: string; // 'feature_lock' | 'social_reduction' | 'xp_penalty' | 'challenge_lock'
    level: number; // 1 | 2 | 3
    features: string[]; // List of restricted feature keys
    reason: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
}
