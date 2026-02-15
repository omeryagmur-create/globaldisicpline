-- 1. profiles tablosu
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    full_name text,
    avatar_url text,
    country text DEFAULT 'TR',
    exam_system text, -- örn: 'YKS', 'LGS', 'KPSS'
    target_exam_date date,
    total_xp bigint DEFAULT 0,
    current_level integer DEFAULT 1,
    current_streak integer DEFAULT 0,
    longest_streak integer DEFAULT 0,
    last_activity_date date,
    tier text DEFAULT 'bronze', -- bronze, silver, gold, elite, sovereign
    subscription_tier text DEFAULT 'free', -- free, pro, elite
    is_admin boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. focus_sessions tablosu
CREATE TABLE IF NOT EXISTS focus_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    duration_minutes integer NOT NULL,
    session_type text, -- 'pomodoro_25', 'pomodoro_50', 'custom'
    subject text,
    notes text,
    xp_earned integer DEFAULT 0,
    started_at timestamptz NOT NULL,
    completed_at timestamptz,
    is_completed boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- 3. study_plans tablosu
CREATE TABLE IF NOT EXISTS study_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    exam_date date NOT NULL,
    total_weeks integer NOT NULL,
    subjects jsonb NOT NULL, -- array of subjects
    daily_hours integer DEFAULT 4,
    plan_data jsonb NOT NULL, -- weekly breakdown
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 4. daily_tasks tablosu
CREATE TABLE IF NOT EXISTS daily_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id uuid REFERENCES study_plans(id) ON DELETE CASCADE,
    task_date date NOT NULL,
    subject text NOT NULL,
    topic text,
    estimated_duration integer, -- minutes
    is_completed boolean DEFAULT false,
    completed_at timestamptz,
    notes text,
    created_at timestamptz DEFAULT now()
);

-- 5. mock_exams tablosu
CREATE TABLE IF NOT EXISTS mock_exams (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    exam_type text NOT NULL,
    total_questions integer NOT NULL,
    correct_answers integer NOT NULL,
    wrong_answers integer NOT NULL,
    empty_answers integer NOT NULL,
    net_score numeric NOT NULL,
    subject_breakdown jsonb, -- {subject: {correct, wrong, empty}}
    weak_topics jsonb, -- array of weak topic names
    file_url text, -- if uploaded
    exam_date date,
    notes text,
    created_at timestamptz DEFAULT now()
);

-- 6. leaderboard_snapshots tablosu
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    period text NOT NULL, -- 'weekly', 'monthly', 'all_time'
    country text,
    snapshot_date date NOT NULL,
    rankings jsonb NOT NULL, -- array of {user_id, rank, xp, name}
    created_at timestamptz DEFAULT now()
);

-- 7. friendships tablosu
CREATE TABLE IF NOT EXISTS friendships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    friend_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    status text DEFAULT 'pending', -- pending, accepted, rejected
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, friend_id)
);

-- 8. challenges tablosu
CREATE TABLE IF NOT EXISTS challenges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    challenge_type text NOT NULL, -- '1v1', 'group', 'solo'
    title text NOT NULL,
    description text,
    target_hours integer, -- minimum study hours
    duration_days integer NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status text DEFAULT 'pending', -- pending, active, completed, failed
    participants jsonb, -- array of user_ids
    results jsonb, -- final results
    created_at timestamptz DEFAULT now()
);

-- 9. challenge_participants tablosu
CREATE TABLE IF NOT EXISTS challenge_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    total_hours integer DEFAULT 0,
    status text DEFAULT 'active', -- active, completed, failed, quit
    rank integer,
    created_at timestamptz DEFAULT now(),
    UNIQUE(challenge_id, user_id)
);

-- 10. restrictions tablosu
CREATE TABLE IF NOT EXISTS restrictions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    restriction_type text NOT NULL, -- 'feature_lock', 'social_reduction', 'xp_penalty', 'challenge_lock'
    severity_level integer DEFAULT 1, -- 1, 2, 3 (7, 14, 30 gün)
    start_date timestamptz NOT NULL DEFAULT now(),
    end_date timestamptz NOT NULL,
    is_active boolean DEFAULT true,
    reason text, -- 'challenge_failure', 'manual_admin'
    consecutive_failures integer DEFAULT 1,
    created_at timestamptz DEFAULT now()
);

-- 11. exam_systems tablosu
CREATE TABLE IF NOT EXISTS exam_systems (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text UNIQUE NOT NULL, -- 'YKS', 'LGS', etc.
    name text NOT NULL,
    country text NOT NULL,
    subjects jsonb NOT NULL, -- array of subject names
    total_duration integer, -- exam duration in minutes
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Trigger for updated_at in profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
