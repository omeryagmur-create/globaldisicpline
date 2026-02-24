-- 1. Add current_season_xp to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_season_xp bigint DEFAULT 0;

-- 2. Create indexes for performance at scale (100k+ users)
-- For All-Time Leaderboard
CREATE INDEX IF NOT EXISTS idx_profiles_total_xp_id ON profiles(total_xp DESC, id ASC);
-- For Overall Seasonal Leaderboard
CREATE INDEX IF NOT EXISTS idx_profiles_season_xp_id ON profiles(current_season_xp DESC, id ASC);
-- For League-specific Seasonal Leaderboard
CREATE INDEX IF NOT EXISTS idx_profiles_league_season_xp_id ON profiles(current_league, current_season_xp DESC, id ASC);

-- 3. Update grant_xp to maintain both total and seasonal XP
CREATE OR REPLACE FUNCTION grant_xp(p_user_id UUID, p_amount INTEGER, p_reason TEXT, p_idempotency_key TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    new_xp INTEGER;
BEGIN
    -- 3a. Try to insert into ledger for tracking and idempotency
    BEGIN
        INSERT INTO xp_ledger (user_id, amount, reason, idempotency_key)
        VALUES (p_user_id, p_amount, p_reason, p_idempotency_key);
    EXCEPTION WHEN unique_violation THEN
        RETURN FALSE;
    END;

    -- 3b. Update user's profile XP denormalized columns
    -- This makes leaderboard queries extremely cheap (index scans)
    UPDATE profiles
    SET 
        total_xp = COALESCE(total_xp, 0) + p_amount,
        current_season_xp = COALESCE(current_season_xp, 0) + p_amount
    WHERE id = p_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update live_league_leaderboard View to use denormalized data
-- This REMOVES the heavy aggregation join from the read path
CREATE OR REPLACE VIEW live_league_leaderboard AS
WITH active_season AS (
    SELECT id FROM league_seasons WHERE status = 'active' ORDER BY created_at DESC LIMIT 1
)
SELECT 
    p.id as user_id,
    p.current_league as league,
    p.current_season_xp as season_xp,
    p.subscription_tier,
    RANK() OVER (ORDER BY p.current_season_xp DESC, p.id ASC) as rank_overall,
    RANK() OVER (PARTITION BY p.current_league ORDER BY p.current_season_xp DESC, p.id ASC) as rank_in_league,
    CASE 
        WHEN p.subscription_tier IN ('pro', 'premium', 'elite') THEN
            RANK() OVER (PARTITION BY p.current_league, (p.subscription_tier IN ('pro', 'premium', 'elite')) ORDER BY p.current_season_xp DESC, p.id ASC)
        ELSE NULL
    END as rank_premium_in_league,
    (SELECT id FROM active_season) as season_id
FROM profiles p;

-- 5. Update start_next_season to reset seasonal XP
CREATE OR REPLACE FUNCTION start_next_season()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_season record;
    v_next_season_num int;
    v_next_season_id uuid;
    v_now timestamptz := now();
BEGIN
    -- 5a. Find and settle current season
    SELECT * INTO v_current_season FROM league_seasons WHERE status = 'active' ORDER BY created_at DESC LIMIT 1;

    IF FOUND THEN
        UPDATE league_seasons SET status = 'settled', ends_at = LEAST(ends_at, v_now) WHERE id = v_current_season.id;
        v_next_season_num := v_current_season.season_number + 1;
    ELSE
        SELECT COALESCE(MAX(season_number), 0) + 1 INTO v_next_season_num FROM league_seasons;
    END IF;

    -- 5b. RESET ALL SEASONAL XP IN PROFILES
    -- This is efficient for 100k rows
    UPDATE profiles SET current_season_xp = 0;

    -- 5c. Create new active season (14 days)
    INSERT INTO league_seasons (season_number, starts_at, ends_at, status)
    VALUES (v_next_season_num, v_now, v_now + INTERVAL '14 days', 'active')
    RETURNING id INTO v_next_season_id;

    RETURN v_next_season_id;
END;
$$;

-- 6. Backfill current_season_xp from ledger for the current active season
DO $$
DECLARE
    v_active_season record;
BEGIN
    SELECT * INTO v_active_season FROM league_seasons WHERE status = 'active' ORDER BY created_at DESC LIMIT 1;
    
    IF FOUND THEN
        UPDATE profiles p
        SET current_season_xp = COALESCE((
            SELECT SUM(amount) 
            FROM xp_ledger 
            WHERE user_id = p.id 
            AND created_at >= v_active_season.starts_at
        ), 0);
    END IF;
END $$;
