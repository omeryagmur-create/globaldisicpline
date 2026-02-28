-- Rewards Weekly Refresh and Badge Expansion Migration
-- Date: 2026-02-28

-- 1. Extend reward_catalog with refresh_mode
ALTER TABLE reward_catalog ADD COLUMN IF NOT EXISTS refresh_mode TEXT NOT NULL DEFAULT 'weekly';

-- Update existing rewards to 'permanent' if they are themes or music, or others to 'weekly'
UPDATE reward_catalog SET refresh_mode = 'permanent' WHERE category IN ('cosmetic', 'music', 'feature');
UPDATE reward_catalog SET refresh_mode = 'weekly' WHERE category IN ('boost', 'game');

-- 2. Extend user_reward_purchases with week_key
ALTER TABLE user_reward_purchases ADD COLUMN IF NOT EXISTS week_key DATE;

-- 3. SQL Function: get_week_start_utc
CREATE OR REPLACE FUNCTION get_week_start_utc(p_ts TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()))
RETURNS DATE AS $$
BEGIN
    -- Monday is the first day of the week in ISO-8601
    -- This returns the Monday of the week for the given timestamp in UTC
    RETURN (date_trunc('week', p_ts AT TIME ZONE 'UTC'))::DATE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. Unique Indexes for Enforcement
-- Weekly: One purchase per user per reward per week
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_reward_purchases_weekly 
ON user_reward_purchases (user_id, reward_id, week_key) 
WHERE week_key IS NOT NULL;

-- Permanent: One purchase per user per reward total (if week_key is null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_reward_purchases_permanent
ON user_reward_purchases (user_id, reward_id)
WHERE week_key IS NULL;

-- 5. Backfill existing purchases
-- For existing purchases, we'll mark them as 'permanent' for now (week_key = NULL)
-- since they were made before this feature.
UPDATE user_reward_purchases SET week_key = NULL WHERE week_key IS NULL;
