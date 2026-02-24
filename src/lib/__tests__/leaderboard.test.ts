import { describe, it, expect } from 'vitest';
import { calculateFallbackRanks } from '../leaderboardUtils';

describe('calculateFallbackRanks', () => {
    const mockProfiles = [
        { id: '1', current_league: 'Bronze', total_xp: 1000, subscription_tier: 'free' },
        { id: '2', current_league: 'Bronze', total_xp: 1500, subscription_tier: 'pro' },
        { id: '3', current_league: 'Silver', total_xp: 3000, subscription_tier: 'free' },
        { id: '4', current_league: 'Silver', total_xp: 2500, subscription_tier: 'free' },
        { id: '5', current_league: 'Gold', total_xp: 6000, subscription_tier: 'premium' },
    ];

    it('ranks overall correctly', () => {
        const result = calculateFallbackRanks(mockProfiles, 'overall', null, 0, 10);
        expect(result).toHaveLength(5);

        // Highest XP first
        expect(result[0].user_id).toBe('5'); // 6000 XP
        expect(result[0].rank_overall).toBe(1);

        expect(result[1].user_id).toBe('3'); // 3000 XP
        expect(result[1].rank_overall).toBe(2);

        expect(result[4].user_id).toBe('1'); // 1000 XP
        expect(result[4].rank_overall).toBe(5);
    });

    it('filters and ranks by league correctly', () => {
        const result = calculateFallbackRanks(mockProfiles, 'league', 'Silver', 0, 10);
        expect(result).toHaveLength(2);

        expect(result[0].user_id).toBe('3'); // 3000 XP, 1st in Silver
        expect(result[0].rank_in_league).toBe(1);

        expect(result[1].user_id).toBe('4'); // 2500 XP, 2nd in Silver
        expect(result[1].rank_in_league).toBe(2);
    });

    it('filters and ranks by premium correctly', () => {
        const result = calculateFallbackRanks(mockProfiles, 'premium', null, 0, 10);
        expect(result).toHaveLength(2); // Only users 2 & 5 are premium

        // Highest premium XP first (user 5)
        expect(result[0].user_id).toBe('5');
        expect(result[0].rank_premium_in_league).toBe(1); // 1st in Gold premium

        expect(result[1].user_id).toBe('2');
        expect(result[1].rank_premium_in_league).toBe(1); // 1st in Bronze premium
    });
});
