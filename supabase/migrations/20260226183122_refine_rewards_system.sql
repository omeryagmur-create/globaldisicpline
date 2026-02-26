-- Mission Definitions Table
CREATE TABLE IF NOT EXISTS mission_definitions (
    id TEXT PRIMARY KEY, -- Using textual ID for engine mapping
    title TEXT NOT NULL,
    description TEXT,
    reward_xp INTEGER NOT NULL,
    requirement_type TEXT NOT NULL, -- 'morning_session', 'total_minutes', 'task_count', 'session_type'
    requirement_value INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Missions (Unified)
DELETE FROM mission_definitions; -- Cleanup old if any
INSERT INTO mission_definitions (id, title, description, reward_xp, requirement_type, requirement_value) VALUES
('morning_monk', 'Morning Monk', 'Start a focus session before 9 AM', 200, 'morning_session', 1),
('deep_thinker', 'Deep Thinker', 'Focus for 2 hours (120 min) total today', 500, 'total_minutes', 120),
('planner_pro', 'Planner Pro', 'Mark 5 tasks as completed', 300, 'task_count', 5);

-- Enable RLS
ALTER TABLE mission_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read mission definitions" ON mission_definitions FOR SELECT USING (true);

-- Fix Purchase RPC: Add FOR UPDATE to prevent race conditions
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
    -- 1. Check idempotency (shared lock ok here)
    SELECT id INTO v_purchase_id FROM user_reward_purchases WHERE idempotency_key = p_idempotency_key;
    IF v_purchase_id IS NOT NULL THEN
        RETURN json_build_object('success', true, 'message', 'Already purchased (idempotent)', 'purchase_id', v_purchase_id);
    END IF;

    -- 2. Get reward info
    SELECT cost_xp, title, duration_minutes INTO v_cost_xp, v_reward_title, v_duration_min FROM reward_catalog WHERE id = p_reward_id AND is_active = true;
    IF v_cost_xp IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Reward not found or inactive');
    END IF;

    -- 3. Check user balance WITH LOCK
    SELECT total_xp INTO v_user_xp FROM profiles WHERE id = p_user_id FOR UPDATE;
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

-- Fix Claim Mission Reward RPC: Secure reward calculation & validation of mission completion
CREATE OR REPLACE FUNCTION claim_mission_reward(p_user_id uuid, p_mission_id text, p_idempotency_key text)
RETURNS json AS $$
DECLARE
    v_claim_id uuid;
    v_xp_reward integer;
    v_req_type text;
    v_req_value integer;
    v_current_val integer := 0;
    v_today date := CURRENT_DATE;
BEGIN
    -- 1. Check idempotency
    SELECT id INTO v_claim_id FROM daily_mission_claims WHERE idempotency_key = p_idempotency_key;
    IF v_claim_id IS NOT NULL THEN
        RETURN json_build_object('success', true, 'message', 'Already claimed (idempotent)', 'claim_id', v_claim_id);
    END IF;

    -- 2. Get mission definition
    SELECT reward_xp, requirement_type, requirement_value 
    INTO v_xp_reward, v_req_type, v_req_value 
    FROM mission_definitions WHERE id = p_mission_id;
    
    IF v_xp_reward IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Mission definition not found');
    END IF;

    -- 3. VALIDATE ELIGIBILITY (Security fix)
    IF v_req_type = 'morning_session' THEN
        -- Check if user started a focus session before 9 AM today
        SELECT count(*) INTO v_current_val 
        FROM focus_sessions 
        WHERE user_id = p_user_id 
          AND is_completed = true 
          AND started_at::date = v_today
          AND EXTRACT(HOUR FROM started_at) < 9;
    ELSIF v_req_type = 'total_minutes' THEN
        -- Check total minutes today
        SELECT COALESCE(sum(duration_minutes), 0) INTO v_current_val 
        FROM focus_sessions 
        WHERE user_id = p_user_id 
          AND is_completed = true 
          AND started_at::date = v_today;
    ELSIF v_req_type = 'task_count' THEN
        -- Check tasks completed today
        SELECT count(*) INTO v_current_val 
        FROM daily_tasks 
        WHERE user_id = p_user_id 
          AND is_completed = true 
          AND completed_at::date = v_today;
    END IF;

    IF v_current_val < v_req_value THEN
        RETURN json_build_object(
            'success', false, 
            'message', 'Mission not completed yet', 
            'current', v_current_val, 
            'required', v_req_value
        );
    END IF;

    -- 4. Grant XP via ledger
    INSERT INTO xp_ledger (user_id, amount, reason, idempotency_key)
    VALUES (p_user_id, v_xp_reward, 'mission_claim:' || p_mission_id, p_idempotency_key);

    -- 5. Update profile balance WITH LOCK
    UPDATE profiles SET total_xp = total_xp + v_xp_reward WHERE id = p_user_id;

    -- 6. Record claim
    INSERT INTO daily_mission_claims (user_id, mission_id, xp_reward, idempotency_key, day)
    VALUES (p_user_id, p_mission_id, v_xp_reward, p_idempotency_key, v_today)
    RETURNING id INTO v_claim_id;

    RETURN json_build_object('success', true, 'message', 'Mission reward claimed', 'claim_id', v_claim_id, 'xp_reward', v_xp_reward);
EXCEPTION 
    WHEN unique_violation THEN
        SELECT id INTO v_claim_id FROM daily_mission_claims WHERE idempotency_key = p_idempotency_key;
        IF v_claim_id IS NOT NULL THEN
            RETURN json_build_object('success', true, 'message', 'Already claimed (idempotent recovery)', 'claim_id', v_claim_id);
        END IF;
        RETURN json_build_object('success', false, 'message', 'Idempotency/Claim conflict');
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
