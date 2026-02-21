import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';

export type EventType =
    | 'APP_OPEN'
    | 'SESSION_START'
    | 'SESSION_COMPLETE'
    | 'SESSION_CANCELLED'
    | 'STREAK_BROKEN'
    | 'PREMIUM_VIEW'
    | 'MISSION_COMPLETE'
    | 'PLAN_CREATE'
    | 'TASK_COMPLETE'
    | 'XP_AWARDED'
    | 'LEADERBOARD_VIEW'
    | 'PROFILE_UPDATE';

export class AnalyticsService {
    /**
     * Track a user event in the database for analytics and retention tracking.
     */
    static async trackEvent(eventType: EventType, eventData: Record<string, unknown> = {}): Promise<void> {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            // Optional: log debug for missing user during tracking
            logger.debug(`Anonymous event attempt: ${eventType}`);
            return;
        }

        try {
            const { error } = await supabase
                .from('user_events')
                .insert({
                    user_id: user.id,
                    event_type: eventType,
                    event_data: eventData
                });

            if (error) {
                logger.error(`Failed to track ${eventType}`, error, { userId: user.id, eventData });
            } else {
                logger.debug(`Event tracked: ${eventType}`, { userId: user.id });
            }
        } catch (error) {
            logger.error(`Exception during tracking ${eventType}`, error, { userId: user.id });
        }
    }

    /**
     * Quick helper for XP related events
     */
    static async trackXP(amount: number, source: string, context: Record<string, unknown> = {}) {
        await this.trackEvent('XP_AWARDED', { amount, source, ...context });
    }
}
