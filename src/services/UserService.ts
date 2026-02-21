import { createClient } from '@/lib/supabase/client';
import { Profile, Restriction } from '@/types/user';

export class UserService {
    static async getProfile(): Promise<Profile | null> {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return null;
        }

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }

        return profile as Profile;
    }

    static async updateProfile(userId: string, updates: Partial<Profile>): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId);

        if (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    static async signOut(): Promise<void> {
        const supabase = createClient();
        await supabase.auth.signOut();
    }

    static async getActiveRestrictions(): Promise<Restriction[]> {
        try {
            const response = await fetch('/api/restrictions/active');
            if (response.ok) {
                const data = await response.json();
                return data.restrictions || [];
            }
            return [];
        } catch (error) {
            console.error('Error checking restrictions:', error);
            return [];
        }
    }
}
