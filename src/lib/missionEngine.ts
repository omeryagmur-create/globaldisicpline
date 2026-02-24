import { createClient } from '@/lib/supabase/client';
import { FocusSession } from '@/types/user';
import { useUserStore } from '@/stores/useUserStore';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/logger';

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
                    logger.error('Failed to insert reward session for mission', insertError, { ruleId: rule.id, userId });
                    continue;
                }

                const missionDay = new Date().toISOString().slice(0, 10);
                const idempotencyKey = `mission-reward-${rule.id}-${userId}-${missionDay}`;
                const { error: rpcError } = await supabase.rpc('grant_xp', {
                    p_user_id: userId,
                    p_amount: rule.reward,
                    p_reason: `mission_reward:${rule.id}`,
                    p_idempotency_key: idempotencyKey,
                });

                if (rpcError) {
                    logger.error('Failed to update user XP via RPC for mission', rpcError, { ruleId: rule.id, userId });
                    continue;
                }

                const t = getTranslations();
                toast.success(`${t.title}: +${rule.reward} XP`, { icon: '🏆', duration: 5000 });
                useUserStore.getState().fetchProfile();

            } catch (e) {
                logger.error('Unexpected exception during mission reward awarding', e, { ruleId: rule.id, userId });
            }
        }
    }


}
