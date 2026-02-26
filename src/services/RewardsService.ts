import { SupabaseClient } from '@supabase/supabase-js';
import { MissionEngine } from '@/lib/missionEngine';

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
        progress: number;
    }[];
}

export class RewardsService {
    static async getDailyMissions(supabase: SupabaseClient, userId: string): Promise<RewardsDashboard['missions']> {
        const todayDate = new Date().toISOString().split('T')[0];

        // 1. Get stats
        const { data: sessions } = await supabase
            .from('focus_sessions')
            .select('started_at, duration_minutes')
            .eq('user_id', userId)
            .eq('is_completed', true)
            .gte('started_at', todayDate);

        const { count: tasksDoneToday } = await supabase
            .from('daily_tasks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_completed', true)
            .gte('completed_at', todayDate);

        const stats = {
            morning_session: 0,
            total_minutes: 0,
            task_count: tasksDoneToday || 0
        };

        (sessions || []).forEach(s => {
            const startDate = new Date(s.started_at);
            if (startDate.getHours() < 9) {
                stats.morning_session++;
            }
            stats.total_minutes += (s.duration_minutes || 0);
        });

        // 2. Get claims
        const { data: claims } = await supabase
            .from('daily_mission_claims')
            .select('mission_id')
            .eq('user_id', userId)
            .eq('day', todayDate);

        const claimedMissionIds = new Set(claims?.map(c => c.mission_id) || []);

        // 3. Get definitions
        const { data: missionDefs } = await supabase
            .from('mission_definitions')
            .select('*');

        return (missionDefs || []).map(m => {
            const isClaimed = claimedMissionIds.has(m.id);
            let progress = 0;

            if (isClaimed) {
                progress = 100;
            } else {
                progress = MissionEngine.calculateMissionProgress(
                    m.id,
                    m.requirement_type,
                    m.requirement_value,
                    stats
                );
            }

            return {
                id: m.id,
                title: m.title,
                description: m.description,
                rewardXP: m.reward_xp,
                isClaimed,
                progress
            };
        });
    }

    static async getBadgeProgress(supabase: SupabaseClient, userId: string): Promise<RewardsDashboard['badges']> {
        const { data: profile } = await supabase
            .from('profiles')
            .select('longest_streak')
            .eq('id', userId)
            .single();

        const [badgesRes, userBadgesRes, sessionsRes] = await Promise.all([
            supabase.from('badge_definitions').select('*'),
            supabase.from('user_badges').select('badge_id').eq('user_id', userId),
            supabase.from('focus_sessions').select('started_at, duration_minutes').eq('user_id', userId).eq('is_completed', true)
        ]);

        const unlockedBadgeIds = new Set(userBadgesRes.data?.map(b => b.badge_id) || []);

        const stats = {
            early_sessions: 0,
            daily_minutes: 0,
            streak_days: profile?.longest_streak || 0,
            helpful_actions: 0 // TODO: Track in DB
        };

        if (sessionsRes.data) {
            const dayMinutes = new Map<string, number>();
            sessionsRes.data.forEach(s => {
                const startDate = new Date(s.started_at);
                const dateKey = startDate.toISOString().split('T')[0];
                if (startDate.getHours() < 8) stats.early_sessions++;
                dayMinutes.set(dateKey, (dayMinutes.get(dateKey) || 0) + (s.duration_minutes || 0));
            });
            stats.daily_minutes = Math.max(0, ...Array.from(dayMinutes.values()));
        }

        return (badgesRes.data || []).map(b => {
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
        });
    }

    static async getRewardsDashboard(supabase: SupabaseClient, userId: string): Promise<RewardsDashboard> {
        // 1. Get profile XP
        const { data: profile } = await supabase
            .from('profiles')
            .select('total_xp')
            .eq('id', userId)
            .single();

        // 2. Get modular parts
        const [missions, badges, catalogRes, purchasesRes] = await Promise.all([
            this.getDailyMissions(supabase, userId),
            this.getBadgeProgress(supabase, userId),
            supabase.from('reward_catalog').select('*').eq('is_active', true).order('cost_xp', { ascending: true }),
            supabase.from('user_reward_purchases').select('reward_id, expires_at').eq('user_id', userId)
        ]);

        const now = new Date();
        const activePurchases = new Map<string, string | null>();
        (purchasesRes.data || []).forEach(p => {
            if (!p.expires_at || new Date(p.expires_at) > now) {
                activePurchases.set(p.reward_id, p.expires_at);
            }
        });

        return {
            availableXP: Number(profile?.total_xp || 0),
            badges,
            missions,
            catalog: (catalogRes.data || []).map(r => ({
                id: r.id,
                title: r.title,
                description: r.description,
                costXP: r.cost_xp,
                category: r.category,
                imageUrl: r.image_url,
                durationMinutes: r.duration_minutes,
                isPurchased: activePurchases.has(r.id),
                expiresAt: activePurchases.get(r.id) || null
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

    static async claimMission(supabase: SupabaseClient, userId: string, missionId: string): Promise<any> {
        // Defense in depth: Check if mission is actually complete before calling RPC
        const dashboard = await this.getRewardsDashboard(supabase, userId);
        const mission = dashboard.missions.find(m => m.id === missionId);

        if (!mission) {
            return { success: false, message: "Mission not found" };
        }

        if (mission.isClaimed) {
            return { success: false, message: "Already claimed" };
        }

        if (mission.progress < 100) {
            return {
                success: false,
                message: "Mission not completed yet",
                progress: mission.progress
            };
        }

        const today = new Date().toISOString().split('T')[0];
        const idempotencyKey = `claim:${userId}:${missionId}:${today}`;
        const { data, error } = await supabase.rpc('claim_mission_reward', {
            p_user_id: userId,
            p_mission_id: missionId,
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
