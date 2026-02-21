import { describe, it, expect } from 'vitest';
import { calculateLeague } from '../leagues';

describe('calculateLeague', () => {
    it('returns Bronze for new users', () => {
        expect(calculateLeague(0, 0)).toBe('Bronze');
    });

    it('returns Silver for users with some XP but low consistency', () => {
        expect(calculateLeague(2500, 0.55)).toBe('Silver');
    });

    it('returns Gold with enough XP and consistency', () => {
        expect(calculateLeague(5500, 0.75)).toBe('Gold');
    });

    it('requires both high XP and high consistency for Diamond', () => {
        expect(calculateLeague(16000, 0.85)).toBe('Diamond');
        expect(calculateLeague(16000, 0.5)).not.toBe('Diamond');
    });

    it('returns Elite for top tier stats', () => {
        expect(calculateLeague(55000, 0.95)).toBe('Elite');
    });
});
