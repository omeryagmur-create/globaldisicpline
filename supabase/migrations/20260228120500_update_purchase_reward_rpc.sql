-- Update purchase_reward RPC to support weekly and permanent items
-- Date: 2026-02-28

CREATE OR REPLACE FUNCTION purchase_reward(p_user_id uuid, p_reward_id uuid, p_idempotency_key text)
RETURNS json AS $$
DECLARE
    v_cost_xp integer;
    v_duration_min integer;
    v_user_xp bigint;
    v_reward_title text;
    v_refresh_mode text;
    v_purchase_id uuid;
    v_expires_at timestamptz;
    v_week_key date;
BEGIN
    -- 1. Check idempotency (via idempotency_key)
    SELECT id INTO v_purchase_id FROM user_reward_purchases WHERE idempotency_key = p_idempotency_key;
    IF v_purchase_id IS NOT NULL THEN
        RETURN json_build_object('success', true, 'message', 'Already purchased (idempotent)', 'purchase_id', v_purchase_id);
    END IF;

    -- 2. Get reward info
    SELECT cost_xp, title, duration_minutes, refresh_mode 
    INTO v_cost_xp, v_reward_title, v_duration_min, v_refresh_mode 
    FROM reward_catalog WHERE id = p_reward_id AND is_active = true;
    
    IF v_cost_xp IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Reward not found or inactive');
    END IF;

    -- 3. Determine week_key if weekly
    IF v_refresh_mode = 'weekly' THEN
        v_week_key := get_week_start_utc(now());
    ELSE
        v_week_key := NULL;
    END IF;

    -- 4. Check if already purchased this week (weekly) OR already purchased ever (permanent)
    IF v_refresh_mode = 'weekly' THEN
        SELECT id INTO v_purchase_id FROM user_reward_purchases 
        WHERE user_id = p_user_id AND reward_id = p_reward_id AND week_key = v_week_key;
    ELSE
        SELECT id INTO v_purchase_id FROM user_reward_purchases 
        WHERE user_id = p_user_id AND reward_id = p_reward_id AND week_key IS NULL;
    END IF;

    IF v_purchase_id IS NOT NULL THEN
        RETURN json_build_object('success', false, 'message', 'Already purchased in this period', 'purchase_id', v_purchase_id);
    END IF;

    -- 5. Check user balance WITH LOCK
    SELECT total_xp INTO v_user_xp FROM profiles WHERE id = p_user_id FOR UPDATE;
    IF v_user_xp < v_cost_xp THEN
        RETURN json_build_object('success', false, 'message', 'Insufficient XP', 'required', v_cost_xp, 'available', v_user_xp);
    END IF;

    -- 6. Calculate expiration
    IF v_duration_min IS NOT NULL THEN
        v_expires_at := now() + (v_duration_min || ' minutes')::interval;
    END IF;

    -- 7. Deduct XP via ledger (negative amount)
    INSERT INTO xp_ledger (user_id, amount, reason, idempotency_key)
    VALUES (p_user_id, -v_cost_xp, 'reward_purchase:' || v_reward_title, p_idempotency_key);

    -- 8. Update profile balance
    UPDATE profiles SET total_xp = total_xp - v_cost_xp WHERE id = p_user_id;

    -- 9. Record purchase
    INSERT INTO user_reward_purchases (user_id, reward_id, cost_paid, idempotency_key, expires_at, week_key)
    VALUES (p_user_id, p_reward_id, v_cost_xp, p_idempotency_key, v_expires_at, v_week_key)
    RETURNING id INTO v_purchase_id;

    RETURN json_build_object(
        'success', true, 
        'message', 'Purchase successful', 
        'purchase_id', v_purchase_id, 
        'expires_at', v_expires_at,
        'week_key', v_week_key,
        'next_reset_at', CASE WHEN v_refresh_mode = 'weekly' THEN (v_week_key + interval '7 days') ELSE NULL END
    );
EXCEPTION 
    WHEN unique_violation THEN
        -- Check if it was the idempotency key or the business rule unique index
        SELECT id INTO v_purchase_id FROM user_reward_purchases WHERE idempotency_key = p_idempotency_key;
        IF v_purchase_id IS NOT NULL THEN
            RETURN json_build_object('success', true, 'message', 'Already purchased (idempotent recovery)', 'purchase_id', v_purchase_id);
        END IF;
        RETURN json_build_object('success', false, 'message', 'Already purchased in this period (unique violation)');
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
