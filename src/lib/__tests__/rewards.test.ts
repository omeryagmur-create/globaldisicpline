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
            // Mock profile
            mockSupabase.from.mockImplementation((table: string) => {
                if (table === 'profiles') {
                    return {
                        select: () => ({
                            eq: () => ({
                                single: () => Promise.resolve({ data: { total_xp: 1000, current_streak: 5, longest_streak: 5 } })
                            })
                        })
                    };
                }
                if (table === 'reward_catalog') {
                    return {
                        select: () => ({
                            eq: () => ({
                                order: () => Promise.resolve({ data: [] })
                            })
                        })
                    };
                }
                if (table === 'user_reward_purchases') {
                    return {
                        select: () => ({
                            eq: () => Promise.resolve({ data: [] })
                        })
                    };
                }
                if (table === 'badge_definitions') {
                    return {
                        select: () => Promise.resolve({
                            data: [
                                { id: 'b1', title: 'Streak Badge', requirement_type: 'streak_days', requirement_value: 10 }
                            ]
                        })
                    };
                }
                if (table === 'user_badges') {
                    return {
                        select: () => ({
                            eq: () => Promise.resolve({ data: [] })
                        })
                    };
                }
                if (table === 'focus_sessions') {
                    return {
                        select: () => ({
                            eq: () => ({
                                eq: () => Promise.resolve({ data: [] })
                            })
                        })
                    };
                }
                if (table === 'daily_mission_claims') {
                    return {
                        select: () => ({
                            eq: () => ({
                                eq: () => Promise.resolve({ data: [] })
                            })
                        })
                    };
                }
                return { select: () => Promise.resolve({ data: [] }) };
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
        it('should call claim_mission_reward RPC', async () => {
            mockSupabase.rpc.mockResolvedValue({ data: { success: true }, error: null });

            const result = await RewardsService.claimMission(mockSupabase as unknown as SupabaseClient, 'user-1', 'm1', 200);

            expect(mockSupabase.rpc).toHaveBeenCalledWith('claim_mission_reward', expect.objectContaining({
                p_user_id: 'user-1',
                p_mission_id: 'm1',
                p_xp_reward: 200
            }));
            expect(result.success).toBe(true);
        });
    });
});
