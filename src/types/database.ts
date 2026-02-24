export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type LeagueTierEnum = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Emerald' | 'Diamond' | 'Master' | 'Grandmaster';


export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    avatar_url: string | null
                    country: string | null
                    exam_system: string | null
                    target_exam_date: string | null
                    total_xp: number
                    current_level: number
                    current_streak: number
                    longest_streak: number
                    last_activity_date: string | null
                    current_league: LeagueTierEnum | null
                    tier: string /* @deprecated use current_league instead */
                    subscription_tier: string
                    is_admin: boolean
                    experiments: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    avatar_url?: string | null
                    country?: string | null
                    exam_system?: string | null
                    target_exam_date?: string | null
                    total_xp?: number
                    current_level?: number
                    current_streak?: number
                    longest_streak?: number
                    last_activity_date?: string | null
                    current_league?: LeagueTierEnum | null
                    tier?: string /* @deprecated use current_league instead */
                    subscription_tier?: string
                    is_admin?: boolean
                    experiments?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    country?: string | null
                    exam_system?: string | null
                    target_exam_date?: string | null
                    total_xp?: number
                    current_level?: number
                    current_streak?: number
                    longest_streak?: number
                    last_activity_date?: string | null
                    current_league?: LeagueTierEnum | null
                    tier?: string /* @deprecated use current_league instead */
                    subscription_tier?: string
                    is_admin?: boolean
                    experiments?: Json | null
                    created_at?: string
                    updated_at?: string
                }
            }
            focus_sessions: {
                Row: {
                    id: string
                    user_id: string
                    duration_minutes: number
                    session_type: string | null
                    subject: string | null
                    notes: string | null
                    xp_earned: number
                    started_at: string
                    completed_at: string | null
                    is_completed: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    duration_minutes: number
                    session_type?: string | null
                    subject?: string | null
                    notes?: string | null
                    xp_earned?: number
                    started_at: string
                    completed_at?: string | null
                    is_completed?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    duration_minutes?: number
                    session_type?: string | null
                    subject?: string | null
                    notes?: string | null
                    xp_earned?: number
                    started_at?: string
                    completed_at?: string | null
                    is_completed?: boolean
                    created_at?: string
                }
            }
            study_plans: {
                Row: {
                    id: string
                    user_id: string
                    exam_date: string
                    total_weeks: number
                    subjects: Json
                    daily_hours: number
                    plan_data: Json
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    exam_date: string
                    total_weeks: number
                    subjects: Json
                    daily_hours?: number
                    plan_data: Json
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    exam_date?: string
                    total_weeks?: number
                    subjects?: Json
                    daily_hours?: number
                    plan_data?: Json
                    is_active?: boolean
                    created_at?: string
                }
            }
            daily_tasks: {
                Row: {
                    id: string
                    user_id: string
                    plan_id: string | null
                    task_date: string
                    subject: string
                    topic: string | null
                    estimated_duration: number | null
                    is_completed: boolean
                    completed_at: string | null
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    plan_id?: string | null
                    task_date: string
                    subject: string
                    topic?: string | null
                    estimated_duration?: number | null
                    is_completed?: boolean
                    completed_at?: string | null
                    notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    plan_id?: string | null
                    task_date?: string
                    subject?: string
                    topic?: string | null
                    estimated_duration?: number | null
                    is_completed?: boolean
                    completed_at?: string | null
                    notes?: string | null
                    created_at?: string
                }
            }
            challenges: {
                Row: {
                    id: string
                    creator_id: string
                    challenge_type: string
                    title: string
                    description: string | null
                    target_hours: number | null
                    duration_days: number
                    start_date: string
                    end_date: string
                    status: string | null
                    participants: Json | null
                    results: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    creator_id: string
                    challenge_type: string
                    title: string
                    description?: string | null
                    target_hours?: number | null
                    duration_days: number
                    start_date: string
                    end_date: string
                    status?: string | null
                    participants?: Json | null
                    results?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    creator_id?: string
                    challenge_type?: string
                    title?: string
                    description?: string | null
                    target_hours?: number | null
                    duration_days?: number
                    start_date?: string
                    end_date?: string
                    status?: string | null
                    participants?: Json | null
                    results?: Json | null
                    created_at?: string
                }
            }
            restrictions: {
                Row: {
                    id: string
                    user_id: string
                    restriction_type: string
                    severity_level: number
                    start_date: string
                    end_date: string
                    is_active: boolean
                    reason: string | null
                    consecutive_failures: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    restriction_type: string
                    severity_level?: number
                    start_date?: string
                    end_date: string
                    is_active?: boolean
                    reason?: string | null
                    consecutive_failures?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    restriction_type?: string
                    severity_level?: number
                    start_date?: string
                    end_date?: string
                    is_active?: boolean
                    reason?: string | null
                    consecutive_failures?: number
                    created_at?: string
                }
            }
            user_events: {
                Row: {
                    id: string
                    user_id: string
                    event_type: string
                    event_data: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    event_type: string
                    event_data?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    event_type?: string
                    event_data?: Json | null
                    created_at?: string
                }
            }

            league_seasons: {
                Row: { id: string; season_number: number; starts_at: string; ends_at: string; status: string; created_at: string }
                Insert: { id?: string; season_number: number; starts_at: string; ends_at: string; status?: string; created_at?: string }
                Update: { id?: string; season_number?: number; starts_at?: string; ends_at?: string; status?: string; created_at?: string }
            }
            league_snapshots: {
                Row: { id: string; season_id: string; user_id: string; league: LeagueTierEnum; season_xp: number; rank_overall: number; rank_in_league: number; rank_premium_in_league: number | null; created_at: string }
                Insert: { id?: string; season_id: string; user_id: string; league: LeagueTierEnum; season_xp?: number; rank_overall?: number; rank_in_league?: number; rank_premium_in_league?: number | null; created_at?: string }
                Update: { id?: string; season_id?: string; user_id?: string; league?: LeagueTierEnum; season_xp?: number; rank_overall?: number; rank_in_league?: number; rank_premium_in_league?: number | null; created_at?: string }
            }
            league_movements: {
                Row: { id: string; season_id: string; user_id: string; from_league: LeagueTierEnum; to_league: LeagueTierEnum; movement: string; reason: string | null; created_at: string }
                Insert: { id?: string; season_id: string; user_id: string; from_league: LeagueTierEnum; to_league: LeagueTierEnum; movement: string; reason?: string | null; created_at?: string }
                Update: { id?: string; season_id?: string; user_id?: string; from_league?: LeagueTierEnum; to_league?: LeagueTierEnum; movement?: string; reason?: string | null; created_at?: string }
            }
        }
    }
}


export type Profile = Database['public']['Tables']['profiles']['Row']
export type FocusSession = Database['public']['Tables']['focus_sessions']['Row']
export type StudyPlan = Database['public']['Tables']['study_plans']['Row']
export type DailyTask = Database['public']['Tables']['daily_tasks']['Row']
export type Challenge = Database['public']['Tables']['challenges']['Row']
export type Restriction = Database['public']['Tables']['restrictions']['Row']
export type UserEvent = Database['public']['Tables']['user_events']['Row']
