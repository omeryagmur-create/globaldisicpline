import { SupabaseClient } from '@supabase/supabase-js';

export interface RewardsDashboard {
    availableXP: number;
    badges: {
        id: string;
        title: string;
        description: string | null;
        progress: number;
        unlocked: boolean;
        category: string;
        imageUrl: string | null;
        requirementType: string;
        requirementValue: number;
    }[];
    catalog: {
        id: string;
        title: string;
        description: string | null;
        costXP: number;
        imageUrl: string | null;
        category: string;
        durationMinutes: number | null;
        isPurchased: boolean;
        expiresAt: string | null;
    }[];
    missions: {
        id: string;
        title: string;
        description: string;
        rewardXP: number;
        isClaimed: boolean;
    }[];
}

export class RewardsService {
    static async getRewardsDashboard(supabase: SupabaseClient, userId: string): Promise<RewardsDashboard> {
        // 1. Get profile (XP, Streaks)
        const { data: profile } = await supabase
            .from('profiles')
            .select('total_xp, current_streak, longest_streak')
            .eq('id', userId)
            .single();

        // 2. Get Rewards Catalog
        const { data: catalog } = await supabase
            .from('reward_catalog')
            .select('*')
            .eq('is_active', true)
            .order('cost_xp', { ascending: true });

        // 3. Get User Purchases (including those not expired)
        const { data: purchases } = await supabase
            .from('user_reward_purchases')
            .select('reward_id, expires_at')
            .eq('user_id', userId);

        const now = new Date();
        const activePurchases = new Map<string, string | null>();
        (purchases || []).forEach(p => {
            if (!p.expires_at || new Date(p.expires_at) > now) {
                activePurchases.set(p.reward_id, p.expires_at);
            }
        });

        // 4. Get Badges & User Unlocks
        const [badgesRes, userBadgesRes] = await Promise.all([
            supabase.from('badge_definitions').select('*'),
            supabase.from('user_badges').select('badge_id').eq('user_id', userId)
        ]);

        const unlockedBadgeIds = new Set(userBadgesRes.data?.map(b => b.badge_id) || []);

        // 5. Fetch Session Stats for Badge Progress
        // early_sessions: count focus_sessions started before 08:00 AM (local time approx)
        // daily_minutes: max sum(duration_minutes) in a single day

        const { data: sessions } = await supabase
            .from('focus_sessions')
            .select('started_at, duration_minutes')
            .eq('user_id', userId)
            .eq('is_completed', true);

        // Calculate progress for each requirement type
        const stats = {
            early_sessions: 0,
            daily_minutes: 0,
            streak_days: profile?.longest_streak || 0,
            helpful_actions: 0 // Placeholder
        };

        if (sessions) {
            const dayMinutes = new Map<string, number>();
            sessions.forEach(s => {
                const startDate = new Date(s.started_at);
                const dateKey = startDate.toISOString().split('T')[0];

                // Early sessions: hour < 8
                if (startDate.getHours() < 8) {
                    stats.early_sessions++;
                }

                // Daily minutes
                dayMinutes.set(dateKey, (dayMinutes.get(dateKey) || 0) + s.duration_minutes);
            });

            stats.daily_minutes = Math.max(0, ...Array.from(dayMinutes.values()));
        }

        // 6. Get Mission Claims for today
        const today = new Date().toISOString().split('T')[0];
        const { data: claims } = await supabase
            .from('daily_mission_claims')
            .select('mission_id')
            .eq('user_id', userId)
            .eq('day', today);

        const claimedMissionIds = new Set(claims?.map(c => c.mission_id) || []);

        // Daily Missions Definition (Source of Truth)
        const missions = [
            { id: "morning_monk", title: "Morning Monk", description: "Start a focus session before 9 AM", rewardXP: 200 },
            { id: "deep_thinker", title: "Deep Thinker", description: "Focus for 2 hours total today", rewardXP: 500 },
            { id: "planner_pro", title: "Planner Pro", description: "Mark 5 tasks as completed", rewardXP: 300 }
        ];

        return {
            availableXP: Number(profile?.total_xp || 0),
            badges: (badgesRes.data || []).map(b => {
                const isUnlocked = unlockedBadgeIds.has(b.id);
                let progress = 0;

                if (isUnlocked) {
                    progress = 100;
                } else {
                    const currentVal = (stats as any)[b.requirement_type] || 0;
                    progress = Math.min(100, Math.floor((currentVal / b.requirement_value) * 100));
                }

                return {
                    id: b.id,
                    title: b.title,
                    description: b.description,
                    progress,
                    unlocked: isUnlocked,
                    category: b.category,
                    imageUrl: b.image_url,
                    requirementType: b.requirement_type,
                    requirementValue: b.requirement_value
                };
            }),
            catalog: (catalog || []).map(r => ({
                id: r.id,
                title: r.title,
                description: r.description,
                costXP: r.cost_xp,
                category: r.category,
                imageUrl: r.image_url,
                durationMinutes: r.duration_minutes,
                isPurchased: activePurchases.has(r.id),
                expiresAt: activePurchases.get(r.id) || null
            })),
            missions: missions.map(m => ({
                ...m,
                isClaimed: claimedMissionIds.has(m.id)
            }))
        };
    }

    static async purchaseReward(supabase: SupabaseClient, userId: string, rewardId: string, idempotencyKey: string): Promise<any> {
        const { data, error } = await supabase.rpc('purchase_reward', {
            p_user_id: userId,
            p_reward_id: rewardId,
            p_idempotency_key: idempotencyKey
        });
        if (error) throw error;
        return data;
    }

    static async claimMission(supabase: SupabaseClient, userId: string, missionId: string, xpReward: number): Promise<any> {
        const today = new Date().toISOString().split('T')[0];
        const idempotencyKey = `claim:${userId}:${missionId}:${today}`;
        const { data, error } = await supabase.rpc('claim_mission_reward', {
            p_user_id: userId,
            p_mission_id: missionId,
            p_xp_reward: xpReward,
            p_idempotency_key: idempotencyKey
        });
        if (error) throw error;
        return data;
    }

    static async getActiveChallenges(supabase: SupabaseClient): Promise<any[]> {
        const { data, error } = await supabase
            .from('challenges')
            .select('*')
            .eq('status', 'active')
            .order('end_date', { ascending: true });

        if (error) {
            console.error('Error fetching active challenges:', error);
            throw error;
        }

        return data;
    }
}
