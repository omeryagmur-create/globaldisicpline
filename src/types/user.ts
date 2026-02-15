import { Database } from './database';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type FocusSession = Database['public']['Tables']['focus_sessions']['Row'];
export type Restriction = Database['public']['Tables']['restrictions']['Row'];

export interface User extends Profile {
    email: string;
}

export interface UserStats {
    totalStudyHours: number;
    sessionsCompleted: number;
    currentStreak: number;
    rank: number;
}
