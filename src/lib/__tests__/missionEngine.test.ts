import { describe, it, expect } from 'vitest';
import { MissionEngine } from '../missionEngine';
import { FocusSession } from '@/types/user';

describe('MissionEngine', () => {
    describe('getDailyMissions', () => {
        it('calculates mission 1 progress based on deep_focus sessions', () => {
            const sessions = [
                { session_type: 'pomodoro' },
                { session_type: 'deep_focus' }
            ] as unknown as FocusSession[];

            const missions = MissionEngine.getDailyMissions(sessions, 60);

            expect(missions[0].progress).toBe(100);
            expect(missions[0].isCompleted).toBe(true);
        });

        it('calculates mission 2 progress based on total minutes', () => {
            const sessions = [] as FocusSession[];
            // 60 minutes out of 120 should be 50%
            const missions = MissionEngine.getDailyMissions(sessions, 60);

            expect(missions[1].progress).toBe(50);
            expect(missions[1].isCompleted).toBe(false);

            // 150 minutes should be 100% and completed
            const missions2 = MissionEngine.getDailyMissions(sessions, 150);
            expect(missions2[1].progress).toBe(100);
            expect(missions2[1].isCompleted).toBe(true);
        });

        it('calculates mission 3 progress based on session count', () => {
            const sessions = [
                { session_type: 'pomodoro' },
                { session_type: 'short_break' }
            ] as unknown as FocusSession[];

            const missions = MissionEngine.getDailyMissions(sessions, 60);

            // 2 sessions out of 3 should be 67%
            expect(missions[2].progress).toBe(67);
            expect(missions[2].isCompleted).toBe(false);
        });
    });
});
