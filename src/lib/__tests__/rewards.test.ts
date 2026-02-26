import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RewardsService } from '@/services/RewardsService';
import { SupabaseClient } from '@supabase/supabase-js';

describe('RewardsService', () => {
    let mockSupabase: any;

    beforeEach(() => {
        mockSupabase = {
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            single: vi.fn().mockReturnThis(),
            rpc: vi.fn(),
        };
        vi.clearAllMocks();
    });

    describe('getRewardsDashboard', () => {
        it('should correctly calculate badge progress', async () => {
            const mockSelect = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockReturnThis();
            const mockGte = vi.fn().mockReturnThis();
            const mockOrder = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockImplementation(() => Promise.resolve({ data: { total_xp: 1000, longest_streak: 5 } }));

            mockSupabase.from.mockImplementation((table: string) => {
                const chain = {
                    select: mockSelect,
                    eq: mockEq,
                    gte: mockGte,
                    order: mockOrder,
                    single: mockSingle,
                    then: (resolve: any) => {
                        if (table === 'profiles') resolve({ data: { total_xp: 1000, longest_streak: 5 } });
                        else if (table === 'badge_definitions') resolve({ data: [{ id: 'b1', title: 'Streak', requirement_type: 'streak_days', requirement_value: 10 }] });
                        else resolve({ data: [], count: 0 });
                        return Promise.resolve();
                    }
                };
                return chain;
            });

            const dashboard = await RewardsService.getRewardsDashboard(mockSupabase as unknown as SupabaseClient, 'user-1');

            expect(dashboard.availableXP).toBe(1000);
            expect(dashboard.badges[0].progress).toBe(50); // 5/10
            expect(dashboard.badges[0].unlocked).toBe(false);
        });
    });

    describe('purchaseReward', () => {
        it('should call purchase_reward RPC', async () => {
            mockSupabase.rpc.mockResolvedValue({ data: { success: true }, error: null });

            const result = await RewardsService.purchaseReward(mockSupabase as unknown as SupabaseClient, 'user-1', 'reward-1', 'key-1');

            expect(mockSupabase.rpc).toHaveBeenCalledWith('purchase_reward', {
                p_user_id: 'user-1',
                p_reward_id: 'reward-1',
                p_idempotency_key: 'key-1'
            });
            expect(result.success).toBe(true);
        });

        it('should throw error if RPC fails', async () => {
            mockSupabase.rpc.mockResolvedValue({ data: null, error: new Error('Insufficient XP') });

            await expect(RewardsService.purchaseReward(mockSupabase as unknown as SupabaseClient, 'user-1', 'reward-1', 'key-1'))
                .rejects.toThrow('Insufficient XP');
        });
    });

    describe('claimMission', () => {
        beforeEach(() => {
            // Setup default mock for dashboard (needed by guard)
            vi.spyOn(RewardsService, 'getDailyMissions').mockResolvedValue([
                { id: 'm1', title: 'test', description: 'test', rewardXP: 100, isClaimed: false, progress: 100 },
                { id: 'm2', title: 'test', description: 'test', rewardXP: 100, isClaimed: false, progress: 50 },
                { id: 'm3', title: 'test', description: 'test', rewardXP: 100, isClaimed: true, progress: 100 },
            ]);
            vi.spyOn(RewardsService, 'getBadgeProgress').mockResolvedValue([]);
        });

        it('should call claim_mission_reward RPC if progress is 100%', async () => {
            mockSupabase.rpc.mockResolvedValue({ data: { success: true }, error: null });

            const result = await RewardsService.claimMission(mockSupabase as unknown as SupabaseClient, 'user-1', 'm1');

            expect(mockSupabase.rpc).toHaveBeenCalledWith('claim_mission_reward', expect.objectContaining({
                p_user_id: 'user-1',
                p_mission_id: 'm1'
            }));
            expect(result.success).toBe(true);
        });

        it('should fail if mission is not found', async () => {
            const result = await RewardsService.claimMission(mockSupabase as unknown as SupabaseClient, 'user-1', 'unknown');
            expect(result.success).toBe(false);
            expect(result.message).toBe('Mission not found');
        });

        it('should fail if progress is < 100%', async () => {
            const result = await RewardsService.claimMission(mockSupabase as unknown as SupabaseClient, 'user-1', 'm2');
            expect(result.success).toBe(false);
            expect(result.message).toBe('Mission not completed yet');
        });

        it('should fail if already claimed', async () => {
            const result = await RewardsService.claimMission(mockSupabase as unknown as SupabaseClient, 'user-1', 'm3');
            expect(result.success).toBe(false);
            expect(result.message).toBe('Already claimed');
        });
    });
});
