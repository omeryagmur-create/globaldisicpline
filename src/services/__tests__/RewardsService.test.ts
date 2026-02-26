import { describe, it, expect } from 'vitest';
import { MissionEngine } from '../../lib/missionEngine';

describe('MissionEngine', () => {
    describe('calculateMissionProgress', () => {
        const missionId = 'morning_monk';
        const requirementType = 'morning_session';
        const requirementValue = 1;

        it('should return 100% when requirement is met', () => {
            const stats = { morning_session: 1, total_minutes: 0, task_count: 0 };
            const progress = MissionEngine.calculateMissionProgress(missionId, requirementType, requirementValue, stats);
            expect(progress).toBe(100);
        });

        it('should return 0% when current value is 0', () => {
            const stats = { morning_session: 0, total_minutes: 100, task_count: 0 };
            const progress = MissionEngine.calculateMissionProgress(missionId, requirementType, requirementValue, stats);
            expect(progress).toBe(0);
        });

        it('should handle partial progress for minutes', () => {
            const progress = MissionEngine.calculateMissionProgress('deep_thinker', 'total_minutes', 120, { total_minutes: 60, morning_session: 0, task_count: 0 });
            expect(progress).toBe(50);
        });

        it('should cap progress at 100%', () => {
            const progress = MissionEngine.calculateMissionProgress('planner_pro', 'task_count', 5, { task_count: 10, total_minutes: 0, morning_session: 0 });
            expect(progress).toBe(100);
        });
    });
});
