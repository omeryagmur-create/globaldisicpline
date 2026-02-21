import { createClient } from '@/lib/supabase/client';

export type EventType =
    | 'APP_OPEN'
    | 'SESSION_START'
    | 'SESSION_COMPLETE'
    | 'SESSION_CANCELLED'
    | 'STREAK_BROKEN'
    | 'PREMIUM_VIEW'
    | 'MISSION_COMPLETE';

export class AnalyticsService {
    /**
     * Track a user event in the database for analytics and retention tracking.
     */
    static async trackEvent(eventType: EventType, eventData: Record<string, unknown> = {}): Promise<void> {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return; // Only track authenticated users

        try {
            const { error } = await supabase
                .from('user_events')
                .insert({
                    user_id: user.id,
                    event_type: eventType,
                    event_data: eventData
                });

            if (error) {
                console.error(`[Observability] EVENT: ANALYTICS_TRACK_FAIL | Failed to track ${eventType}:`, error);
            }
        } catch (error) {
            console.error(`[Observability] EVENT: ANALYTICS_EXCEPTION | Error tracking ${eventType}:`, error);
        }
    }
}
