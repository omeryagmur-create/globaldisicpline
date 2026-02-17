import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Profile, Restriction } from '@/types/user';
import { createClient } from '@/lib/supabase/client';
import { realtimeManager } from '@/lib/events/RealtimeManager';
import { calculateLeague, LeagueTier } from '@/lib/leagues';

interface UserState {
    profile: Profile | null;
    loading: boolean;
    activeRestrictions: Restriction[];
    league: LeagueTier;

    setProfile: (profile: Profile | null) => void;
    fetchProfile: () => Promise<void>;
    updateProfile: (updates: Partial<Profile>) => Promise<void>;
    addXP: (amount: number, reason: string) => Promise<void>;
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
            league: 'Bronze',

            setProfile: (profile) => {
                if (profile) {
                    const consistency = profile.current_streak / 30; // 30 day normalization
                    const league = calculateLeague(profile.total_xp, consistency);
                    set({ profile, league });
                } else {
                    set({ profile: null, league: 'Bronze' });
                }
            },

            fetchProfile: async () => {
                set({ loading: true });
                const supabase = createClient();

                try {
                    const { data: { user } } = await supabase.auth.getUser();

                    if (!user) {
                        set({ profile: null, league: 'Bronze', loading: false });
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

                    const consistency = profile.current_streak / 30;
                    const league = calculateLeague(profile.total_xp, consistency);

                    set({ profile, league });
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

                const newProfile = { ...profile, ...updates };
                const consistency = newProfile.current_streak / 30;
                const newLeague = calculateLeague(newProfile.total_xp, consistency);

                if (newLeague !== get().league) {
                    realtimeManager.publish({
                        type: newLeague === 'Bronze' ? 'LeagueDemotion' : 'LeaguePromotion',
                        payload: { league: newLeague }
                    });
                }

                set({ profile: newProfile, league: newLeague });
            },

            addXP: async (amount: number, reason: string) => {
                const { profile } = get();
                if (!profile) return;

                const newXP = (profile.total_xp || 0) + amount;

                await get().updateProfile({ total_xp: newXP });

                realtimeManager.publish({
                    type: 'XPUpdated',
                    payload: {
                        totalXp: newXP,
                        change: amount,
                        reason
                    }
                });
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
                set({ profile: null, activeRestrictions: [], league: 'Bronze' });
            },

            isRestricted: (feature) => {
                const { activeRestrictions } = get();
                return activeRestrictions.some(r =>
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
