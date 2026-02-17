import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DevelopmentPath, Habit, DailyReflection, SelfDevelopmentStore } from '@/types/self-development';

export const useSelfDevStore = create<SelfDevelopmentStore>()(
    persist(
        (set, get) => ({
            selectedPath: null,
            habits: [],
            reflections: [],
            dailyPerformance: 5,
            dailyJournal: '',

            setPath: (path) => set({ selectedPath: path }),

            toggleHabit: (id) => set((state) => ({
                habits: state.habits.map(h =>
                    h.id === id ? {
                        ...h,
                        completedToday: !h.completedToday,
                        streak: !h.completedToday ? h.streak + 1 : Math.max(0, h.streak - 1)
                    } : h
                )
            })),

            addHabit: (habit) => set((state) => ({
                habits: [...state.habits, {
                    ...habit,
                    id: Math.random().toString(36).substring(7),
                    streak: 0,
                    completedToday: false
                }]
            })),

            deleteHabit: (id) => set((state) => ({
                habits: state.habits.filter(h => h.id !== id)
            })),

            addReflection: (reflection) => set((state) => ({
                reflections: [...state.reflections, reflection]
            })),

            setDailyStats: (score, journal) => set({
                dailyPerformance: score,
                dailyJournal: journal
            }),
        }),
        {
            name: 'self-dev-storage',
        }
    )
);
