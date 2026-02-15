import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TimerState {
    isRunning: boolean;
    timeLeft: number;
    initialTime: number;
    sessionType: 'pomodoro' | 'short_break' | 'long_break' | 'custom' | 'survival' | 'deep_focus';
    subject: string | null;
    startedAt: number | null;

    start: () => void;
    pause: () => void;
    reset: () => void;
    setSession: (type: TimerState['sessionType'], duration: number, subject?: string) => void;
    tick: () => void;
    setDuration: (duration: number) => void;
}

export const useTimerStore = create<TimerState>()(
    persist(
        (set, get) => ({
            isRunning: false,
            timeLeft: 25 * 60,
            initialTime: 25 * 60,
            sessionType: 'pomodoro',
            subject: null,
            startedAt: null,

            start: () => set({ isRunning: true, startedAt: Date.now() }),
            pause: () => set({ isRunning: false }),
            reset: () => set((state) => ({
                isRunning: false,
                timeLeft: state.initialTime,
                startedAt: null
            })),

            setSession: (type, duration, subject) => set({
                sessionType: type,
                initialTime: duration,
                timeLeft: duration,
                subject: subject || null,
                isRunning: false,
                startedAt: null
            }),

            tick: () => set((state) => {
                if (!state.isRunning) return {};
                if (state.timeLeft <= 0) {
                    return { isRunning: false, timeLeft: 0 };
                }
                return { timeLeft: state.timeLeft - 1 };
            }),

            setDuration: (duration) => set({
                initialTime: duration,
                timeLeft: duration,
                isRunning: false
            })
        }),
        {
            name: 'timer-storage',
        }
    )
);
