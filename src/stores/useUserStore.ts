import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Profile, Restriction } from '@/types/user';
import { createClient } from '@/lib/supabase/client';

interface UserState {
    profile: Profile | null;
    loading: boolean;
    activeRestrictions: Restriction[];

    setProfile: (profile: Profile | null) => void;
    fetchProfile: () => Promise<void>;
    updateProfile: (updates: Partial<Profile>) => Promise<void>;
    checkRestrictions: () => Promise<void>;
    logout: () => Promise<void>;
    isRestricted: (feature: string) => boolean;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            profile: null,
            loading: false,
            activeRestrictions: [],

            setProfile: (profile) => set({ profile }),

            fetchProfile: async () => {
                set({ loading: true });
                const supabase = createClient();

                try {
                    const { data: { user } } = await supabase.auth.getUser();

                    if (!user) {
                        set({ profile: null, loading: false });
                        return;
                    }

                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (error) {
                        console.error('Error fetching profile:', error);
                        return;
                    }

                    set({ profile });
                    await get().checkRestrictions();
                } catch (error) {
                    console.error('Error in fetchProfile:', error);
                } finally {
                    set({ loading: false });
                }
            },

            updateProfile: async (updates) => {
                const { profile } = get();
                if (!profile) return;

                const supabase = createClient();
                const { error } = await supabase
                    .from('profiles')
                    .update(updates)
                    .eq('id', profile.id);

                if (error) {
                    console.error('Error updating profile:', error);
                    throw error;
                }

                set({ profile: { ...profile, ...updates } });
            },

            checkRestrictions: async () => {
                try {
                    const response = await fetch('/api/restrictions/active');
                    if (response.ok) {
                        const data = await response.json();
                        set({ activeRestrictions: data.restrictions || [] });
                    }
                } catch (error) {
                    console.error('Error checking restrictions:', error);
                }
            },

            logout: async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                set({ profile: null, activeRestrictions: [] });
            },

            isRestricted: (feature) => {
                const { activeRestrictions } = get();
                return activeRestrictions.some(r =>
                    // Need to cast to any or fix type if Restriction interface doesn't have features array
                    // Assuming Restriction type in @/types/user matches ActiveRestriction from constants
                    (r as any).features?.includes(feature) ||
                    (r as any).features?.includes('all_premium_features') ||
                    (r as any).features?.includes('social_features_disabled')
                );
            },
        }),
        {
            name: 'user-storage',
        }
    )
);
