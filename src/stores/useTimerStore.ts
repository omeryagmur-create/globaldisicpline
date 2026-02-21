import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { realtimeManager } from '@/lib/events/RealtimeManager';
import { AnalyticsService } from '@/services/AnalyticsService';

export interface FocusMode {
    id: string;
    name: string;
    duration: number; // in seconds
    breakDuration: number; // in seconds
    theme?: string;
    xpMultiplier: number;
    intensity: 'low' | 'medium' | 'high' | 'extreme';
}

export interface FocusSequence {
    id: string;
    name: string;
    cycles: { duration: number; type: 'focus' | 'break' }[];
}

interface TimerState {
    isRunning: boolean;
    timeLeft: number;
    initialTime: number;
    sessionType: 'pomodoro' | 'short_break' | 'long_break' | 'custom' | 'survival' | 'deep_focus';
    subject: string | null;
    startedAt: number | null;

    // Phase 2: Advanced Focus Engine
    customModes: FocusMode[];
    sequences: FocusSequence[];
    currentModeId: string | null;
    currentSequenceId: string | null;
    currentSequenceStep: number;
    currentTheme: string | null;
    currentSound: string | null;
    isZenMode: boolean;

    start: () => void;
    pause: (isInterruption?: boolean) => void;
    reset: () => void;
    setSession: (type: TimerState['sessionType'], duration: number, subject?: string) => void;
    tick: () => void;
    setDuration: (duration: number) => void;

    // Phase 2 Actions
    addCustomMode: (mode: FocusMode) => void;
    deleteCustomMode: (id: string) => void;
    addSequence: (sequence: FocusSequence) => void;
    startSequence: (id: string) => void;
    applyMode: (id: string) => void;
    completeSession: () => void;
    deleteSequence: (id: string) => void;
    toggleZenMode: () => void;
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

            customModes: [],
            sequences: [],
            currentModeId: null,
            currentSequenceId: null,
            currentSequenceStep: 0,
            currentTheme: null,
            currentSound: null,
            isZenMode: false,

            start: () => {
                const state = get();
                const now = Date.now();

                // If we were paused, we need to adjust startedAt to account for timeLeft
                // timeLeft = initialTime - (now - startedAt) / 1000
                // So, new startedAt = now - (initialTime - timeLeft) * 1000
                const adjustedStartedAt = now - (state.initialTime - state.timeLeft) * 1000;

                set({ isRunning: true, startedAt: adjustedStartedAt });

                realtimeManager.publish({
                    type: 'FocusSessionStart',
                    payload: {
                        sessionId: now.toString(),
                        duration: state.initialTime,
                        subject: state.subject || undefined
                    }
                });

                AnalyticsService.trackEvent('SESSION_START', {
                    duration: state.initialTime,
                    sessionType: state.sessionType
                });
            },

            pause: (isInterruption = false) => {
                const state = get();
                if (isInterruption && state.timeLeft > 0 && state.sessionType !== 'short_break') {
                    realtimeManager.publish({
                        type: 'RestrictionTriggered',
                        payload: {
                            reason: 'User manually interrupted a focus session.',
                            severity: 'medium'
                        }
                    });

                    AnalyticsService.trackEvent('SESSION_CANCELLED', {
                        timeElapsed: state.initialTime - state.timeLeft,
                        sessionType: state.sessionType
                    });
                }
                // When pausing, the current timeLeft is already accurate from the last tick
                set({ isRunning: false });
            },

            reset: () => {
                set((state) => ({
                    isRunning: false,
                    timeLeft: state.initialTime,
                    startedAt: null,
                    currentSequenceId: null,
                    currentSequenceStep: 0,
                    currentTheme: null,
                    currentSound: null
                }));
            },

            setSession: (type, duration, subject) => set({
                sessionType: type,
                initialTime: duration,
                timeLeft: duration,
                subject: subject || null,
                isRunning: false,
                startedAt: null,
                currentModeId: null,
                currentTheme: null,
                currentSound: null,
                currentSequenceId: null,
                currentSequenceStep: 0
            }),

            tick: () => set((state) => {
                if (!state.isRunning || !state.startedAt) return {};

                const now = Date.now();
                const secondsPassed = Math.floor((now - state.startedAt) / 1000);
                const newTimeLeft = Math.max(0, state.initialTime - secondsPassed);

                if (newTimeLeft === state.timeLeft) return {}; // No change

                if (newTimeLeft === 0) {
                    realtimeManager.publish({
                        type: 'FocusSessionEnd',
                        payload: {
                            sessionId: state.startedAt?.toString() || '',
                            success: true,
                            xpEarned: Math.floor(state.initialTime / 60) * 10
                        }
                    });
                }

                return { timeLeft: newTimeLeft };
            }),

            completeSession: () => {
                const state = get();

                AnalyticsService.trackEvent('SESSION_COMPLETE', {
                    duration: state.initialTime,
                    sessionType: state.sessionType
                });

                // Check if in a sequence
                if (state.currentSequenceId) {
                    const sequence = state.sequences.find(s => s.id === state.currentSequenceId);
                    if (sequence && state.currentSequenceStep < sequence.cycles.length - 1) {
                        const nextStep = state.currentSequenceStep + 1;
                        const nextCycle = sequence.cycles[nextStep];

                        set({
                            currentSequenceStep: nextStep,
                            timeLeft: nextCycle.duration,
                            initialTime: nextCycle.duration,
                            sessionType: nextCycle.type === 'focus' ? 'custom' : 'short_break',
                            startedAt: Date.now(),
                            isRunning: true
                        });
                        return;
                    }
                }

                // If no sequence or finished, reset
                state.reset();
            },

            setDuration: (duration) => set({
                initialTime: duration,
                timeLeft: duration,
                isRunning: false,
                sessionType: 'custom'
            }),

            addCustomMode: (mode) => set((state) => ({
                customModes: [...state.customModes, mode]
            })),

            deleteCustomMode: (id) => set((state) => ({
                customModes: state.customModes.filter(m => m.id !== id)
            })),

            addSequence: (sequence) => set((state) => ({
                sequences: [
                    ...state.sequences.filter(s => s.id !== sequence.id),
                    sequence
                ]
            })),

            deleteSequence: (id) => set((state) => ({
                sequences: state.sequences.filter(s => s.id !== id)
            })),

            startSequence: (id) => {
                const sequence = get().sequences.find(s => s.id === id);
                if (!sequence) return;

                const firstCycle = sequence.cycles[0];
                set({
                    currentSequenceId: id,
                    currentSequenceStep: 0,
                    timeLeft: firstCycle.duration,
                    initialTime: firstCycle.duration,
                    sessionType: firstCycle.type === 'focus' ? 'custom' : 'short_break',
                    isRunning: true,
                    startedAt: Date.now()
                });
            },

            applyMode: (id) => {
                const mode = get().customModes.find(m => m.id === id);
                if (!mode) return;
                set({
                    currentModeId: id,
                    initialTime: mode.duration,
                    timeLeft: mode.duration,
                    sessionType: 'custom',
                    currentTheme: mode.theme || null,
                    currentSound: 'ambient_focus' // Default sound for custom modes
                });
            },

            toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode }))
        }),
        {
            name: 'timer-storage',
        }
    )
);
