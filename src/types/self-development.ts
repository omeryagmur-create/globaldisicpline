export type DevelopmentPath = 'Internal' | 'Physical' | 'Social';

export interface Habit {
    id: string;
    name: string;
    streak: number;
    completedToday: boolean;
    path: DevelopmentPath;
}

export interface DailyReflection {
    date: string;
    journal: string;
    performanceScore: number; // 1-10
}

export interface SelfDevelopmentStore {
    selectedPath: DevelopmentPath | null;
    habits: Habit[];
    reflections: DailyReflection[];
    dailyPerformance: number; // 1-10
    dailyJournal: string;

    setPath: (path: DevelopmentPath) => void;
    toggleHabit: (id: string) => void;
    addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'completedToday'>) => void;
    deleteHabit: (id: string) => void;
    addReflection: (reflection: DailyReflection) => void;
    setDailyStats: (score: number, journal: string) => void;
}
