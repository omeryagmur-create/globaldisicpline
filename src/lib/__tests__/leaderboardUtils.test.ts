import { describe, it, expect } from 'vitest';
import { calculateFallbackRanks, FallbackProfile, checkIsAllZero } from '../leaderboardUtils';

describe('leaderboardUtils', () => {
    const mockProfiles: FallbackProfile[] = [
        { id: 'user1', total_xp: 100, current_season_xp: 10, current_league: 'Gold' },
        { id: 'user2', total_xp: 200, current_season_xp: 5, current_league: 'Gold' },
        { id: 'user3', total_xp: 150, current_season_xp: 15, current_league: 'Silver' },
        { id: 'user4', total_xp: 150, current_season_xp: 20, current_league: 'Gold' }, // Tie-break case with user3 on total_xp
    ];

    describe('calculateFallbackRanks', () => {
        it('uses current_season_xp for seasonal scopes', () => {
            const { data } = calculateFallbackRanks(mockProfiles, 'overall', null, 0, 10);

            // Expected order by current_season_xp DESC:
            // user4 (20), user3 (15), user1 (10), user2 (5)
            expect(data[0].user_id).toBe('user4');
            expect(data[1].user_id).toBe('user3');
            expect(data[2].user_id).toBe('user1');
            expect(data[3].user_id).toBe('user2');
            expect(data[0].season_xp).toBe(20);
        });

        it('uses total_xp for all_time scope', () => {
            const { data } = calculateFallbackRanks(mockProfiles, 'all_time', null, 0, 10);

            // Expected order by total_xp DESC:
            // user2 (200), user3 (150, id user3), user4 (150, id user4), user1 (100)
            // Wait, id comparison: 'user3' vs 'user4'. 'user3' < 'user4', so user3 comes first.
            expect(data[0].user_id).toBe('user2');
            expect(data[1].user_id).toBe('user3');
            expect(data[2].user_id).toBe('user4');
            expect(data[3].user_id).toBe('user1');
            expect(data[0].season_xp).toBe(200); // In all_time, season_xp field in result represents basis
        });

        it('respects deterministic tie-break (id ASC) for equal seasonal XP', () => {
            const extraProfiles: FallbackProfile[] = [
                { id: 'b_user', total_xp: 100, current_season_xp: 50 },
                { id: 'a_user', total_xp: 100, current_season_xp: 50 },
            ];
            const { data } = calculateFallbackRanks(extraProfiles, 'overall', null, 0, 10);
            expect(data[0].user_id).toBe('a_user');
            expect(data[1].user_id).toBe('b_user');
        });

        it('filters by league correcty', () => {
            const { data, total_count } = calculateFallbackRanks(mockProfiles, 'overall', 'Gold', 0, 10);
            expect(total_count).toBe(3);
            expect(data.every(p => p.league === 'Gold')).toBe(true);
        });
    });

    describe('checkIsAllZero', () => {
        it('returns true if top 20 users have 0 XP', () => {
            const zeroData = Array(25).fill(0).map((_, i) => ({ season_xp: 0 }));
            expect(checkIsAllZero(zeroData)).toBe(true);
        });

        it('returns false if any of top 20 users has > 0 XP', () => {
            const someData = Array(25).fill(0).map((_, i) => ({ season_xp: i === 19 ? 1 : 0 }));
            expect(checkIsAllZero(someData)).toBe(false);
        });
    });
});
