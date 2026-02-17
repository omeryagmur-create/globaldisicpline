import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { realtimeManager } from '@/lib/events/RealtimeManager';

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

            start: () => {
                const state = get();
                const now = Date.now();
                set({ isRunning: true, startedAt: now });

                realtimeManager.publish({
                    type: 'FocusSessionStart',
                    payload: {
                        sessionId: now.toString(),
                        duration: state.initialTime,
                        subject: state.subject || undefined
                    }
                });
            },

            pause: (isInterruption = false) => {
                const state = get();
                if (isInterruption && state.timeLeft > 0 && state.sessionType !== 'short_break') {
                    // Penalty logic for early interruption
                    console.log("Early interruption penalty applied");
                    // We could call useUserStore.addXP(-50, 'Early Interruption Penalty') here
                    // For now, we fire a specific event
                    realtimeManager.publish({
                        type: 'RestrictionTriggered',
                        payload: {
                            reason: 'User manually interrupted a focus session.',
                            severity: 'medium'
                        }
                    });
                }
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
                currentSound: null
            }),

            tick: () => set((state) => {
                if (!state.isRunning) return {};

                if (state.timeLeft <= 0) {
                    realtimeManager.publish({
                        type: 'FocusSessionEnd',
                        payload: {
                            sessionId: state.startedAt?.toString() || '',
                            success: true,
                            xpEarned: Math.floor(state.initialTime / 60) * 10 // Simple calculation
                        }
                    });

                    // Check if in a sequence
                    if (state.currentSequenceId) {
                        const sequence = state.sequences.find(s => s.id === state.currentSequenceId);
                        if (sequence && state.currentSequenceStep < sequence.cycles.length - 1) {
                            const nextStep = state.currentSequenceStep + 1;
                            const nextCycle = sequence.cycles[nextStep];
                            return {
                                currentSequenceStep: nextStep,
                                timeLeft: nextCycle.duration,
                                initialTime: nextCycle.duration,
                                sessionType: nextCycle.type === 'focus' ? 'custom' : 'short_break'
                            };
                        }
                    }
                    return { isRunning: false, timeLeft: 0 };
                }
                return { timeLeft: state.timeLeft - 1 };
            }),

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
                sequences: [...state.sequences, sequence]
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
            }
        }),
        {
            name: 'timer-storage',
        }
    )
);
