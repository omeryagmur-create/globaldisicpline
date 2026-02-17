import { createClient } from '../supabase/client';
import { RealtimeEvent, EventBus } from '@/types/events';

class RealtimeManager implements EventBus {
    private supabase = createClient();
    private channel = this.supabase.channel('gde-realtime-events');
    private subscribers: ((event: RealtimeEvent) => void)[] = [];

    constructor() {
        this.channel
            .on(
                'broadcast',
                { event: 'app-event' },
                (payload) => {
                    const event = payload.payload as RealtimeEvent;
                    this.subscribers.forEach(sub => sub(event));
                }
            )
            .subscribe();
    }

    async publish(event: RealtimeEvent) {
        // Local trigger for the same client
        this.subscribers.forEach(sub => sub(event));

        // Global broadcast for other clients
        await this.channel.send({
            type: 'broadcast',
            event: 'app-event',
            payload: event
        });
    }

    subscribe(callback: (event: RealtimeEvent) => void) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }
}

export const realtimeManager = new RealtimeManager();
