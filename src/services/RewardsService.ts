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
        refreshMode: 'weekly' | 'permanent';
        isPurchased: boolean;
        expiresAt: string | null;
        nextResetAt: string | null;
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
    private static computeWeekStartUTC(date: Date): string {
        const utcDay = date.getUTCDay();
        const diffToMonday = utcDay === 0 ? -6 : 1 - utcDay;
        const monday = new Date(Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate() + diffToMonday,
            0, 0, 0, 0
        ));
        return monday.toISOString().split('T')[0];
    }

    static async getWeeklyKey(supabase: SupabaseClient): Promise<string> {
        const fallback = this.computeWeekStartUTC(new Date());
        const { data, error } = await supabase.rpc('get_week_start_utc');

        if (error) return fallback;

        if (typeof data === 'string' && !Number.isNaN(new Date(data).getTime())) {
            return data;
        }

        return fallback;
    }

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
        // 1. Fetch all necessary data in parallel
        const [profileRes, badgesRes, userBadgesRes, sessionsRes, claimsRes, snapshotsRes] = await Promise.all([
            supabase.from('profiles').select('longest_streak').eq('id', userId).single(),
            supabase.from('badge_definitions').select('*'),
            supabase.from('user_badges').select('badge_id').eq('user_id', userId),
            supabase.from('focus_sessions').select('started_at, duration_minutes').eq('user_id', userId).eq('is_completed', true),
            supabase.from('daily_mission_claims').select('id, created_at').eq('user_id', userId),
            supabase.rpc('get_active_season').then(async ({ data: season }) => {
                if (!season?.[0]) return { data: null };
                return supabase.from('league_snapshots').select('rank_overall').eq('user_id', userId).eq('season_id', (season[0] as any).id).maybeSingle();
            })
        ]);

        const profile = profileRes.data;
        const unlockedBadgeIds = new Set(userBadgesRes.data?.map(b => b.badge_id) || []);

        // 2. Process stats
        const now = new Date();
        const activeDates = new Set<string>();
        const stats = {
            early_sessions: 0,
            daily_minutes: 0,
            total_focus_minutes: 0,
            streak_days: profile?.longest_streak || 0,
            total_tasks: 0, // Will be filled from sessions logic if counting completions
            mission_claims: claimsRes.data?.length || 0,
            league_rank: snapshotsRes.data?.rank_overall || 999999, // Lower is better for rank
            active_days_7: 0,
            active_days_30: 0
        };

        const dayMinutes = new Map<string, number>();
        (sessionsRes.data || []).forEach(s => {
            const startDate = new Date(s.started_at);
            const dateKey = startDate.toISOString().split('T')[0];
            activeDates.add(dateKey);

            if (startDate.getHours() < 9) stats.early_sessions++;
            stats.total_focus_minutes += (s.duration_minutes || 0);
            dayMinutes.set(dateKey, (dayMinutes.get(dateKey) || 0) + (s.duration_minutes || 0));
        });

        stats.daily_minutes = dayMinutes.size > 0 ? Math.max(...Array.from(dayMinutes.values())) : 0;

        // Active days count
        const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(now.getDate() - 7);
        const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(now.getDate() - 30);

        activeDates.forEach(dateStr => {
            const d = new Date(dateStr);
            if (d >= sevenDaysAgo) stats.active_days_7++;
            if (d >= thirtyDaysAgo) stats.active_days_30++;
        });

        return (badgesRes.data || []).map(b => {
            const isUnlocked = unlockedBadgeIds.has(b.id);
            let progress = 0;

            if (isUnlocked) {
                progress = 100;
            } else {
                const currentVal = (stats as any)[b.requirement_type] ?? 0;
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
        // 1. Get current week key from DB to ensure sync
        const currentWeekKey = await this.getWeeklyKey(supabase);
        const nextResetAtDate = new Date(currentWeekKey);
        nextResetAtDate.setDate(nextResetAtDate.getDate() + 7);
        const nextResetAt = nextResetAtDate.toISOString();

        // 2. Get profile XP
        const { data: profile } = await supabase
            .from('profiles')
            .select('total_xp')
            .eq('id', userId)
            .single();

        // 3. Get modular parts
        const [missions, badges, catalogRes, purchasesRes] = await Promise.all([
            this.getDailyMissions(supabase, userId),
            this.getBadgeProgress(supabase, userId),
            supabase.from('reward_catalog').select('*').eq('is_active', true).order('cost_xp', { ascending: true }),
            supabase.from('user_reward_purchases').select('reward_id, expires_at, week_key').eq('user_id', userId)
        ]);

        const now = new Date();
        const permanentPurchases = new Set<string>();
        const weeklyPurchases = new Map<string, string | null>(); // rewardId -> expires_at

        (purchasesRes.data || []).forEach(p => {
            if (p.week_key === null) {
                permanentPurchases.add(p.reward_id);
            } else if (p.week_key === currentWeekKey) {
                weeklyPurchases.set(p.reward_id, p.expires_at);
            }
        });

        return {
            availableXP: Number(profile?.total_xp || 0),
            badges,
            missions,
            catalog: (catalogRes.data || []).map(r => {
                const isWeekly = r.refresh_mode === 'weekly';
                let isPurchased = false;
                let expiresAt = null;

                if (isWeekly) {
                    isPurchased = weeklyPurchases.has(r.id);
                    expiresAt = weeklyPurchases.get(r.id) || null;
                } else {
                    isPurchased = permanentPurchases.has(r.id);
                }

                return {
                    id: r.id,
                    title: r.title,
                    description: r.description,
                    costXP: r.cost_xp,
                    category: r.category,
                    imageUrl: r.image_url,
                    durationMinutes: r.duration_minutes,
                    refreshMode: r.refresh_mode as 'weekly' | 'permanent',
                    isPurchased,
                    expiresAt,
                    nextResetAt: isWeekly ? nextResetAt : null
                };
            })
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
