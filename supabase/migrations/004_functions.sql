-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_started_at ON focus_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_id_date ON daily_tasks(user_id, task_date);
CREATE INDEX IF NOT EXISTS idx_mock_exams_user_id ON mock_exams(user_id);
CREATE INDEX IF NOT EXISTS idx_restrictions_user_active ON restrictions(user_id, is_active);

-- Functions
-- 1. update_user_xp
CREATE OR REPLACE FUNCTION update_user_xp(p_user_id uuid, p_xp_amount integer)
RETURNS void AS $$
DECLARE
    v_total_xp bigint;
    v_new_level integer;
BEGIN
    UPDATE profiles 
    SET total_xp = total_xp + p_xp_amount
    WHERE id = p_user_id
    RETURNING total_xp INTO v_total_xp;

    -- Simple level calculation: Level = floor(sqrt(total_xp / 100)) + 1
    v_new_level := floor(sqrt(v_total_xp / 100)) + 1;

    UPDATE profiles
    SET current_level = v_new_level
    WHERE id = p_user_id AND current_level < v_new_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. update_streak
CREATE OR REPLACE FUNCTION update_streak(p_user_id uuid)
RETURNS void AS $$
DECLARE
    v_last_date date;
    v_today date := current_date;
BEGIN
    SELECT last_activity_date INTO v_last_date FROM profiles WHERE id = p_user_id;

    IF v_last_date IS NULL THEN
        UPDATE profiles SET current_streak = 1, last_activity_date = v_today, longest_streak = GREATEST(longest_streak, 1) WHERE id = p_user_id;
    ELSIF v_last_date = v_today THEN
        -- Already updated today
        NULL;
    ELSIF v_last_date = v_today - 1 THEN
        UPDATE profiles SET current_streak = current_streak + 1, last_activity_date = v_today, longest_streak = GREATEST(longest_streak, current_streak + 1) WHERE id = p_user_id;
    ELSE
        UPDATE profiles SET current_streak = 1, last_activity_date = v_today WHERE id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
