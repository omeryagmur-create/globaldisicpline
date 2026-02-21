import { createClient } from '@/lib/supabase/client';
import { FocusSession } from '@/types/user';
import { useUserStore } from '@/stores/useUserStore';
import { toast } from 'react-hot-toast';

/** Minimal shape of a focus_sessions row returned by Supabase */
export type FocusSessionRow = {
    id?: string;
    user_id: string;
    session_type: string | null;
    duration_minutes: number;
    is_completed?: boolean;
    completed_at?: string | null;
    xp_earned?: number;
};

/** Definition of a daily mission rule */
export interface MissionRule {
    id: string;
    reward: number;
    titleKey: string;
    descKey: string;
    /** Returns true when sessions/minutes satisfy the mission condition */
    isMet: (sessions: FocusSessionRow[], totalMinutes: number) => boolean;
    /** Returns 0-100 progress percentage */
    getProgress: (sessions: FocusSessionRow[], totalMinutes: number) => number;
}

export const DAILY_MISSION_RULES: MissionRule[] = [
    {
        id: '1',
        reward: 150,
        titleKey: 'mission1Title',
        descKey: 'mission1Desc',
        isMet: (sessions) => sessions.some(s => s.session_type === 'deep_focus'),
        getProgress: (sessions) =>
            sessions.some(s => s.session_type === 'deep_focus') ? 100 : 0,
    },
    {
        id: '2',
        reward: 300,
        titleKey: 'mission2Title',
        descKey: 'mission2Desc',
        isMet: (_, totalMinutes) => totalMinutes >= 120,
        getProgress: (_, totalMinutes) =>
            Math.min(100, Math.round((totalMinutes / 120) * 100)),
    },
    {
        id: '3',
        reward: 100,
        titleKey: 'mission3Title',
        descKey: 'mission3Desc',
        isMet: (sessions) =>
            sessions.filter(s => !s.session_type?.startsWith('reward_')).length >= 3,
        getProgress: (sessions) => {
            const count = sessions.filter(s => !s.session_type?.startsWith('reward_')).length;
            return Math.min(100, Math.round((count / 3) * 100));
        },
    },
];

export interface Mission {
    id: string;
    titleKey?: string;
    descKey?: string;
    reward: number;
    progress: number;
    isCompleted: boolean;
}

export class MissionEngine {
    /** Pure: compute mission state from session data — no side effects */
    static getDailyMissions(todaySessions: FocusSession[], todayMinutes: number): Mission[] {
        return DAILY_MISSION_RULES.map(rule => ({
            id: rule.id,
            reward: rule.reward,
            titleKey: rule.titleKey,
            descKey: rule.descKey,
            progress: rule.getProgress(todaySessions as unknown as FocusSessionRow[], todayMinutes),
            isCompleted: rule.isMet(todaySessions as unknown as FocusSessionRow[], todayMinutes),
        }));
    }

    /**
     * Idempotently awards XP for any newly completed missions.
     * Safe to call multiple times — checks alreadyAwarded before inserting.
     */
    static async awardMissionRewards(
        userId: string,
        todaySessions: FocusSessionRow[],
        totalMinutes: number,
        getTranslations: () => { title: string }
    ): Promise<void> {
        const supabase = createClient();

        for (const rule of DAILY_MISSION_RULES) {
            const missionKey = `reward_mission_${rule.id}`;
            const alreadyAwarded = todaySessions.some(s => s.session_type === missionKey);

            if (alreadyAwarded) continue;
            if (!rule.isMet(todaySessions, totalMinutes)) continue;

            try {
                const { error: insertError } = await supabase.from('focus_sessions').insert({
                    user_id: userId,
                    duration_minutes: 0,
                    session_type: missionKey,
                    xp_earned: rule.reward,
                    started_at: new Date().toISOString(),
                    completed_at: new Date().toISOString(),
                    is_completed: true,
                    notes: `Daily Mission ${rule.id} Reward`,
                });

                if (insertError) {
                    console.error(
                        `[Observability] EVENT: MISSION_AWARD_FAIL | mission=${rule.id}`,
                        insertError
                    );
                    continue;
                }

                const { error: rpcError } = await supabase.rpc('update_user_xp', {
                    p_user_id: userId,
                    p_xp_amount: rule.reward,
                });

                if (rpcError) {
                    console.error(
                        `[Observability] EVENT: XP_RPC_FAIL | mission=${rule.id}`,
                        rpcError
                    );
                    continue;
                }

                const t = getTranslations();
                toast.success(`${t.title}: +${rule.reward} XP`, { icon: '🏆', duration: 5000 });
                useUserStore.getState().fetchProfile();

            } catch (e) {
                console.error(
                    `[Observability] EVENT: MISSION_SYNC_EXCEPTION | mission=${rule.id}`,
                    e
                );
            }
        }
    }

    /**
     * syncDailyMissions: fetches today's sessions from DB then calls awardMissionRewards.
     * Used by Dashboard's useEffect to re-check on session count change.
     */
    static async syncDailyMissions(
        userId: string,
        getTranslations: () => { title: string }
    ): Promise<void> {
        const supabase = createClient();
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const { data: allTodaySessions } = await supabase
            .from('focus_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('is_completed', true)
            .gte('completed_at', startOfToday.toISOString());

        if (!allTodaySessions) return;

        const totalMinutes = allTodaySessions
            .filter(s => !s.session_type?.startsWith('reward_'))
            .reduce((acc, s) => acc + (s.duration_minutes || 0), 0);

        await MissionEngine.awardMissionRewards(
            userId,
            allTodaySessions as FocusSessionRow[],
            totalMinutes,
            getTranslations
        );
    }
}
