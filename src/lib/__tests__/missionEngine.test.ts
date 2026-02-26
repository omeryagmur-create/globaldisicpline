import { describe, it, expect } from 'vitest';
import { MissionEngine, FocusSessionRow } from '../missionEngine';

describe('MissionEngine', () => {
    describe('calculateMissionProgress', () => {
        it('calculates percentage correctly for morning_session', () => {
            const stats = { morning_session: 1, total_minutes: 0, task_count: 0 };
            const progress = MissionEngine.calculateMissionProgress('m1', 'morning_session', 1, stats);
            expect(progress).toBe(100);
        });

        it('calculates percentage correctly for total_minutes', () => {
            const stats = { morning_session: 0, total_minutes: 60, task_count: 0 };
            const progress = MissionEngine.calculateMissionProgress('m2', 'total_minutes', 120, stats);
            expect(progress).toBe(50);
        });

        it('caps progress at 100', () => {
            const stats = { morning_session: 0, total_minutes: 200, task_count: 0 };
            const progress = MissionEngine.calculateMissionProgress('m2', 'total_minutes', 120, stats);
            expect(progress).toBe(100);
        });

        it('returns 0 if stat is missing', () => {
            const stats = { morning_session: 0, total_minutes: 0, task_count: 0 };
            const progress = MissionEngine.calculateMissionProgress('m3', 'task_count', 5, stats);
            expect(progress).toBe(0);
        });
    });

    describe('getStatsFromSessions', () => {
        it('accumulates stats from completed sessions', () => {
            const sessions: FocusSessionRow[] = [
                {
                    user_id: 'u1',
                    duration_minutes: 30,
                    is_completed: true,
                    started_at: '2026-02-26T02:00:00Z', // Definitely morning anywhere
                    session_type: 'pomodoro'
                },
                {
                    user_id: 'u1',
                    duration_minutes: 45,
                    is_completed: true,
                    started_at: '2026-02-26T15:00:00Z', // Afternoon
                    session_type: 'deep_focus'
                },
            ];

            const stats = MissionEngine.getStatsFromSessions(sessions, 3);

            expect(stats.morning_session).toBe(1);
            expect(stats.total_minutes).toBe(75);
            expect(stats.task_count).toBe(3);
        });
    });
});
