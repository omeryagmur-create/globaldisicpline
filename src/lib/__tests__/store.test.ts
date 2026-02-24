import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore } from '../../stores/useUserStore';

// Initial state reset mechanism for Zustand since it caches
const initialState = useUserStore.getState();

describe('useUserStore League Sync', () => {
    beforeEach(() => {
        useUserStore.setState(initialState, true);
        useUserStore.setState({ activeRestrictions: [] });
    });

    it('prioritizes current_league from profile over anything else', () => {
        // Mock a user profile where legacy properties might imply one league (e.g. Gold) 
        // but current_league explicitly says 'Master'
        const mockProfile = {
            id: '123',
            email: 'test@example.com',
            total_xp: 5000,
            current_streak: 20,
            current_league: 'Master'
        } as unknown as any;

        const store = useUserStore.getState();
        store.setProfile(mockProfile);

        // Since it's 'Master', it should override the old XP-based fallback calculating system
        expect(useUserStore.getState().league).toBe('Master');
    });

    it('falls back to Bronze if current_league is not provided or null', () => {
        const mockProfile = {
            id: '124',
            email: 'test2@example.com',
            total_xp: 0,
            current_streak: 0,
            current_league: null
        } as unknown as any;

        const store = useUserStore.getState();
        store.setProfile(mockProfile);

        expect(useUserStore.getState().league).toBe('Bronze');
    });
});
