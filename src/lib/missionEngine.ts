import { FocusSession } from '@/types/user';

/** Minimal shape of a focus_sessions row returned by Supabase */
export type FocusSessionRow = {
    id?: string;
    user_id: string;
    session_type: string | null;
    duration_minutes: number;
    is_completed?: boolean;
    completed_at?: string | null;
    started_at?: string;
    xp_earned?: number;
};

export interface Mission {
    id: string;
    title: string;
    description: string;
    rewardXP: number;
    progress: number;
    isClaimed: boolean;
}

/**
 * Pure Mission Engine: calculates progress and completion state locally.
 * This should match the login in RewardsService.getRewardsDashboard.
 */
export class MissionEngine {
    static calculateMissionProgress(
        missionId: string,
        requirementType: string,
        requirementValue: number,
        stats: { morning_session: number, total_minutes: number, task_count: number }
    ): number {
        const currentVal = (stats as any)[requirementType] || 0;
        return Math.min(100, Math.floor((currentVal / requirementValue) * 100));
    }

    static getStatsFromSessions(sessions: FocusSessionRow[], taskCount: number): { morning_session: number, total_minutes: number, task_count: number } {
        const stats = {
            morning_session: 0,
            total_minutes: 0,
            task_count: taskCount
        };

        sessions.forEach(s => {
            if (s.is_completed) {
                const startDate = new Date(s.started_at || s.completed_at || Date.now());
                if (startDate.getHours() < 9) {
                    stats.morning_session++;
                }
                stats.total_minutes += (s.duration_minutes || 0);
            }
        });

        return stats;
    }
}
