import { SupabaseClient } from '@supabase/supabase-js';
import { MissionEngine, FocusSessionRow } from '@/lib/missionEngine';
import { useUserStore } from '@/stores/useUserStore';
import { AnalyticsService } from './AnalyticsService';
import { logger } from '@/lib/logger';

export class FocusService {
    /**
     * Calculates XP based on duration and session type.
     */
    static calculateXP(minutes: number, type: string): number {
        let multiplier = 1;
        if (type === 'deep_focus') multiplier = 1.5;
        else if (type === 'survival') multiplier = 2.0;
        else if (type === 'short_break' || type === 'long_break') multiplier = 0;

        return Math.round(minutes * 10 * multiplier);
    }

    /**
     * Complete a session: saves to DB, awards XP, and checks missions.
     */
    static async completeSession(
        supabase: SupabaseClient,
        userId: string,
        initialTimeSeconds: number,
        sessionType: string,
        getTranslations: () => { title: string }
    ): Promise<{ xpEarned: number } | null> {
        const durationMinutes = Math.floor(initialTimeSeconds / 60);
        const xpEarned = this.calculateXP(durationMinutes, sessionType);

        try {
            // 1. Save main session
            const { error: sessionError } = await supabase.from('focus_sessions').insert({
                user_id: userId,
                duration_minutes: durationMinutes,
                session_type: sessionType,
                xp_earned: xpEarned,
                started_at: new Date(Date.now() - initialTimeSeconds * 1000).toISOString(),
                completed_at: new Date().toISOString(),
                is_completed: true,
            });

            if (sessionError) throw sessionError;

            // 2. Award XP via RPC
            const { error: xpError } = await supabase.rpc('update_user_xp', {
                p_user_id: userId,
                p_xp_amount: xpEarned,
            });

            if (xpError) {
                logger.error('Failed to update user XP via RPC', xpError, { userId, xpEarned });
            }

            // 3. Mission Logic
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            const { data: todaySessions } = await supabase
                .from('focus_sessions')
                .select('*')
                .eq('user_id', userId)
                .eq('is_completed', true)
                .gte('completed_at', startOfToday.toISOString());

            if (todaySessions) {
                const typedSessions = todaySessions as FocusSessionRow[];
                const totalMinutes = typedSessions
                    .filter(s => !s.session_type?.startsWith('reward_'))
                    .reduce((acc, s) => acc + (s.duration_minutes || 0), 0);

                await MissionEngine.awardMissionRewards(
                    userId,
                    typedSessions,
                    totalMinutes,
                    getTranslations
                );
            }

            // 4. Analytics & Refresh
            AnalyticsService.trackEvent('SESSION_COMPLETE', {
                duration: durationMinutes,
                type: sessionType,
                xp: xpEarned
            });

            await useUserStore.getState().fetchProfile();

            return { xpEarned };
        } catch (error) {
            logger.error('Failed to complete focus session', error, { userId, sessionType, initialTimeSeconds });
            throw error;
        }
    }
}
