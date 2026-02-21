import { createClient } from '@/lib/supabase/client';
import { FocusSession } from '@/types/user';
import { toast } from 'react-hot-toast';

export class FocusService {
    static async createSession(sessionData: Omit<FocusSession, 'id' | 'created_at'>): Promise<FocusSession | null> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('focus_sessions')
            .insert(sessionData)
            .select('*')
            .single();

        if (error) {
            console.error('[Observability] EVENT: SESSION_SAVE_FAIL | Error creating focus session:', error, { payload: sessionData });
            toast.error('Failed to save focus session. Please try again.');
            throw error;
        }

        return data as FocusSession;
    }

    static async getSessionsForUser(userId: string): Promise<FocusSession[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('focus_sessions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching focus sessions:', error);
            return [];
        }

        return data as FocusSession[];
    }
}
