-- Role based helper functions
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. profiles tablosu RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

-- 2. focus_sessions tablosu RLS
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions" ON focus_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON focus_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON focus_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- 3. study_plans tablosu RLS
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own plans" ON study_plans
    FOR ALL USING (auth.uid() = user_id);

-- 4. daily_tasks tablosu RLS
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tasks" ON daily_tasks
    FOR ALL USING (auth.uid() = user_id);

-- 5. mock_exams tablosu RLS
ALTER TABLE mock_exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own exams" ON mock_exams
    FOR ALL USING (auth.uid() = user_id);

-- 6. leaderboard_snapshots tablosu RLS
ALTER TABLE leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view snapshots" ON leaderboard_snapshots
    FOR SELECT USING (true);

-- 7. friendships tablosu RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friendships" ON friendships
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can send friend requests" ON friendships
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own friend requests" ON friendships
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- 8. challenges tablosu RLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view challenges" ON challenges
    FOR SELECT USING (true);

CREATE POLICY "Users can create challenges" ON challenges
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update challenges" ON challenges
    FOR UPDATE USING (auth.uid() = creator_id);

-- 9. challenge_participants tablosu RLS
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view participants" ON challenge_participants
    FOR SELECT USING (true);

CREATE POLICY "Users can join challenges" ON challenge_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participant status" ON challenge_participants
    FOR UPDATE USING (auth.uid() = user_id);

-- 10. restrictions tablosu RLS
ALTER TABLE restrictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own restrictions" ON restrictions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage restrictions" ON restrictions
    FOR ALL USING (is_admin());

-- 11. exam_systems tablosu RLS
ALTER TABLE exam_systems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view exam systems" ON exam_systems
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage exam systems" ON exam_systems
    FOR ALL USING (is_admin());
