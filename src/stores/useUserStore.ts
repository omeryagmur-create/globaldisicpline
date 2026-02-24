import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Profile } from '@/types/user';
import { realtimeManager } from '@/lib/events/RealtimeManager';
import { LeagueTier } from '@/lib/leagues';
import { UserService } from '@/services/UserService';
import { ActiveRestriction } from '@/lib/constants/restrictions';

interface UserState {
    profile: Profile | null;
    loading: boolean;
    activeRestrictions: ActiveRestriction[];
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
                    const league = (profile.current_league || 'Bronze') as LeagueTier;
                    set({ profile, league });
                } else {
                    set({ profile: null, league: 'Bronze' });
                }
            },

            fetchProfile: async () => {
                set({ loading: true });
                try {
                    const profile = await UserService.getProfile();

                    if (!profile) {
                        set({ profile: null, league: 'Bronze', loading: false });
                        return;
                    }

                    const league = (profile.current_league || 'Bronze') as LeagueTier;

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

                try {
                    await UserService.updateProfile(profile.id, updates);
                } catch (error) {
                    console.error('Error updating profile in store:', error);
                    throw error;
                }

                const newProfile = { ...profile, ...updates };
                const newLeague = (newProfile.current_league || 'Bronze') as LeagueTier;

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

                const success = await UserService.grantXP(profile.id, amount, reason);
                if (!success) {
                    console.warn(`XP grant ignored or failed for reason: ${reason}`);
                    return;
                }

                await get().fetchProfile();

                realtimeManager.publish({
                    type: 'XPUpdated',
                    payload: {
                        totalXp: get().profile?.total_xp || 0,
                        change: amount,
                        reason
                    }
                });
            },

            checkRestrictions: async () => {
                const restrictions = await UserService.getActiveRestrictions();
                set({ activeRestrictions: restrictions });
            },

            logout: async () => {
                await UserService.signOut();
                set({ profile: null, activeRestrictions: [], league: 'Bronze' });
            },

            isRestricted: (feature) => {
                const { activeRestrictions } = get();
                return activeRestrictions.some(r => {
                    return r.features.includes(feature) ||
                        r.features.includes('all_premium_features') ||
                        r.features.includes('social_features_disabled');
                });
            },
        }),
        {
            name: 'user-storage',
        }
    )
);
