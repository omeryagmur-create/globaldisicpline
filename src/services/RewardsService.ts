import { SupabaseClient } from '@supabase/supabase-js';
import { Challenge } from '@/types/user';

export class RewardsService {
    static async getActiveChallenges(supabase: SupabaseClient): Promise<Challenge[]> {
        const { data, error } = await supabase
            .from('challenges')
            .select('*')
            .eq('status', 'active')
            .order('end_date', { ascending: true });

        if (error) {
            console.error('Error fetching active challenges:', error);
            throw error;
        }

        return data as Challenge[];
    }
}
