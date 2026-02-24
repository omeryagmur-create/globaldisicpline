import { createClient } from '../supabase/client';
import { RealtimeEvent, EventBus } from '@/types/events';

class RealtimeManager implements EventBus {
    private _channel: ReturnType<ReturnType<typeof createClient>['channel']> | null = null;
    private subscribers: ((event: RealtimeEvent) => void)[] = [];

    private get channel() {
        if (!this._channel) {
            try {
                const supabase = createClient();
                this._channel = supabase.channel('gde-realtime-events');
                this._channel
                    .on(
                        'broadcast',
                        { event: 'app-event' },
                        (payload) => {
                            const event = payload.payload as RealtimeEvent;
                            this.subscribers.forEach(sub => sub(event));
                        }
                    )
                    .subscribe();
            } catch {
                // In test environments, channel may not be available
                return null as any;
            }
        }
        return this._channel;
    }

    async publish(event: RealtimeEvent) {
        // Local trigger for the same client
        this.subscribers.forEach(sub => sub(event));

        // Global broadcast for other clients
        try {
            await this.channel?.send({
                type: 'broadcast',
                event: 'app-event',
                payload: event
            });
        } catch {
            // Silently fail in environments without realtime
        }
    }

    subscribe(callback: (event: RealtimeEvent) => void) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }
}

export const realtimeManager = new RealtimeManager();

