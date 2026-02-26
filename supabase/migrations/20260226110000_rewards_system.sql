-- Reward Catalog
CREATE TABLE IF NOT EXISTS reward_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    cost_xp INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    category TEXT DEFAULT 'general', -- 'cosmetic', 'boost', 'music', 'feature', 'game'
    duration_minutes INTEGER, -- NULL for permanent rewards
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Reward Purchases
CREATE TABLE IF NOT EXISTS user_reward_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reward_id UUID REFERENCES reward_catalog(id) ON DELETE CASCADE NOT NULL,
    idempotency_key TEXT UNIQUE,
    cost_paid INTEGER NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE, -- Calculated upon purchase
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Badge Definitions
CREATE TABLE IF NOT EXISTS badge_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    requirement_type TEXT NOT NULL, -- e.g., 'total_xp', 'focus_minutes', 'mission_count'
    requirement_value INTEGER NOT NULL,
    image_url TEXT,
    category TEXT DEFAULT 'milestone',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Badges
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    badge_id UUID REFERENCES badge_definitions(id) ON DELETE CASCADE NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, badge_id)
);

-- Daily Mission Claims
CREATE TABLE IF NOT EXISTS daily_mission_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    mission_id TEXT NOT NULL, -- Identifier for the daily mission
    day DATE NOT NULL DEFAULT CURRENT_DATE,
    xp_reward INTEGER NOT NULL,
    idempotency_key TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, mission_id, day)
);

-- RLS
ALTER TABLE reward_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reward_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_mission_claims ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read active rewards" ON reward_catalog FOR SELECT USING (is_active = true);
CREATE POLICY "Users can read own purchases" ON user_reward_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read badge definitions" ON badge_definitions FOR SELECT USING (true);
CREATE POLICY "Users can read own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can read own mission claims" ON daily_mission_claims FOR SELECT USING (auth.uid() = user_id);

-- RPC: purchase_reward
CREATE OR REPLACE FUNCTION purchase_reward(p_user_id uuid, p_reward_id uuid, p_idempotency_key text)
RETURNS json AS $$
DECLARE
    v_cost_xp integer;
    v_duration_min integer;
    v_user_xp bigint;
    v_reward_title text;
    v_purchase_id uuid;
    v_expires_at timestamptz;
BEGIN
    -- 1. Check idempotency
    SELECT id INTO v_purchase_id FROM user_reward_purchases WHERE idempotency_key = p_idempotency_key;
    IF v_purchase_id IS NOT NULL THEN
        RETURN json_build_object('success', true, 'message', 'Already purchased (idempotent)', 'purchase_id', v_purchase_id);
    END IF;

    -- 2. Get reward info
    SELECT cost_xp, title, duration_minutes INTO v_cost_xp, v_reward_title, v_duration_min FROM reward_catalog WHERE id = p_reward_id AND is_active = true;
    IF v_cost_xp IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Reward not found or inactive');
    END IF;

    -- 3. Check user balance
    SELECT total_xp INTO v_user_xp FROM profiles WHERE id = p_user_id;
    IF v_user_xp < v_cost_xp THEN
        RETURN json_build_object('success', false, 'message', 'Insufficient XP', 'required', v_cost_xp, 'available', v_user_xp);
    END IF;

    -- 4. Calculate expiration
    IF v_duration_min IS NOT NULL THEN
        v_expires_at := now() + (v_duration_min || ' minutes')::interval;
    END IF;

    -- 5. Deduct XP via ledger (negative amount)
    INSERT INTO xp_ledger (user_id, amount, reason, idempotency_key)
    VALUES (p_user_id, -v_cost_xp, 'reward_purchase:' || v_reward_title, p_idempotency_key);

    -- 6. Update profile balance
    UPDATE profiles SET total_xp = total_xp - v_cost_xp WHERE id = p_user_id;

    -- 7. Record purchase
    INSERT INTO user_reward_purchases (user_id, reward_id, cost_paid, idempotency_key, expires_at)
    VALUES (p_user_id, p_reward_id, v_cost_xp, p_idempotency_key, v_expires_at)
    RETURNING id INTO v_purchase_id;

    RETURN json_build_object('success', true, 'message', 'Purchase successful', 'purchase_id', v_purchase_id, 'expires_at', v_expires_at);
EXCEPTION 
    WHEN unique_violation THEN
        SELECT id INTO v_purchase_id FROM user_reward_purchases WHERE idempotency_key = p_idempotency_key;
        IF v_purchase_id IS NOT NULL THEN
            RETURN json_build_object('success', true, 'message', 'Already purchased (idempotent recovery)', 'purchase_id', v_purchase_id);
        END IF;
        RETURN json_build_object('success', false, 'message', 'Idempotency conflict');
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: claim_mission_reward
CREATE OR REPLACE FUNCTION claim_mission_reward(p_user_id uuid, p_mission_id text, p_xp_reward integer, p_idempotency_key text)
RETURNS json AS $$
DECLARE
    v_claim_id uuid;
BEGIN
    -- 1. Check idempotency in daily_mission_claims
    SELECT id INTO v_claim_id FROM daily_mission_claims WHERE idempotency_key = p_idempotency_key;
    IF v_claim_id IS NOT NULL THEN
        RETURN json_build_object('success', true, 'message', 'Already claimed (idempotent)', 'claim_id', v_claim_id);
    END IF;

    -- 2. Grant XP via ledger
    INSERT INTO xp_ledger (user_id, amount, reason, idempotency_key)
    VALUES (p_user_id, p_xp_reward, 'mission_claim:' || p_mission_id, p_idempotency_key);

    -- 3. Update profile balance
    UPDATE profiles SET total_xp = total_xp + p_xp_reward WHERE id = p_user_id;

    -- 4. Record claim
    INSERT INTO daily_mission_claims (user_id, mission_id, xp_reward, idempotency_key)
    VALUES (p_user_id, p_mission_id, p_xp_reward, p_idempotency_key)
    RETURNING id INTO v_claim_id;

    RETURN json_build_object('success', true, 'message', 'Mission reward claimed', 'claim_id', v_claim_id);
EXCEPTION 
    WHEN unique_violation THEN
        SELECT id INTO v_claim_id FROM daily_mission_claims WHERE idempotency_key = p_idempotency_key;
        IF v_claim_id IS NOT NULL THEN
            RETURN json_build_object('success', true, 'message', 'Already claimed (idempotent recovery)', 'claim_id', v_claim_id);
        END IF;
        RETURN json_build_object('success', false, 'message', 'Already claimed today or idempotency violation');
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_reward_purchases_user ON user_reward_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_mission_claims_user_date ON daily_mission_claims(user_id, day);

-- Seed Data Catalog
INSERT INTO reward_catalog (title, description, cost_xp, image_url, category) VALUES
('Premium Theme: Vaporwave', 'A high-contrast neon theme for deep focus.', 5000, 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=200&auto=format&fit=crop', 'cosmetic'),
('1.2x XP Booster (1 Hour)', 'Boost your XP earnings for the next 60 minutes.', 2000, 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=200&auto=format&fit=crop', 'boost'),
('Focus Music: Lo-Fi Beats Pack', 'A collection of exclusive lo-fi tracks for studying.', 3500, 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=200&auto=format&fit=crop', 'music');

-- Seed Data: XP Market Items
INSERT INTO reward_catalog (title, description, cost_xp, category, duration_minutes) VALUES
('Live Sports Feed', 'Unlock 60 minutes of real-time scores (Football & F1).', 500, 'feature', 60),
('Typo Striker', 'Fix typos fast to earn small XP boosts.', 200, 'game', 60),
('Micro Logic', 'Solve a logic puzzle in under 60 seconds.', 300, 'game', 60);

-- Seed Badge Definitions
INSERT INTO badge_definitions (title, description, requirement_type, requirement_value, category) VALUES
('Early Bird', 'Complete 10 focus sessions before 08:00 AM.', 'early_sessions', 10, 'milestone'),
('Deep Work Master', 'Focus for more than 4 hours in a single day.', 'daily_minutes', 240, 'milestone'),
('Study Streak (7 Days)', 'Maintain a study streak for 7 consecutive days.', 'streak_days', 7, 'milestone'),
('Community Pillar', 'Help 5 people in the study groups.', 'helpful_actions', 5, 'social');
