-- Update functions to be truly inclusive (include 0 XP users)
CREATE OR REPLACE FUNCTION compute_leaderboard_snapshot(p_season_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_season league_seasons%ROWTYPE;
    v_now timestamptz := now();
BEGIN
    SELECT * INTO v_season FROM league_seasons WHERE id = p_season_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Season % not found', p_season_id;
    END IF;

    -- Delete existing snapshots for this season
    DELETE FROM league_snapshots WHERE season_id = p_season_id;

    -- Insert new snapshots including participants with 0 XP who are in the profiles table
    INSERT INTO league_snapshots (
        season_id,
        user_id,
        league,
        season_xp,
        rank_overall,
        rank_in_league,
        rank_premium_in_league
    )
    WITH xp_agg AS (
        SELECT user_id, SUM(amount) as season_xp
        FROM xp_ledger
        WHERE created_at >= v_season.starts_at AND created_at < coalesce(v_season.ends_at, v_now)
        GROUP BY user_id
    ),
    user_xp AS (
        SELECT 
            p.id as user_id, 
            p.current_league as league,
            p.subscription_tier,
            COALESCE(x.season_xp, 0) as season_xp
        FROM profiles p
        LEFT JOIN xp_agg x ON p.id = x.user_id
    ),
    rankings AS (
        SELECT 
            user_id,
            league,
            season_xp,
            RANK() OVER (ORDER BY season_xp DESC, user_id ASC) as rank_overall,
            RANK() OVER (PARTITION BY league ORDER BY season_xp DESC, user_id ASC) as rank_in_league,
            CASE 
                WHEN subscription_tier IN ('pro', 'premium', 'elite') THEN
                    RANK() OVER (PARTITION BY league, (subscription_tier IN ('pro', 'premium', 'elite')) ORDER BY season_xp DESC, user_id ASC)
                ELSE NULL
            END as rank_premium_in_league
        FROM user_xp
    )
    SELECT 
        p_season_id,
        user_id,
        league,
        season_xp,
        rank_overall,
        rank_in_league,
        rank_premium_in_league
    FROM rankings;
END;
$$;

-- Add a trigger to automatically add new users to the active league season
CREATE OR REPLACE FUNCTION handle_new_user_league_snapshot()
RETURNS TRIGGER AS $$
DECLARE
    v_active_season_id uuid;
BEGIN
    -- Find the active season
    SELECT id INTO v_active_season_id FROM league_seasons WHERE status = 'active' LIMIT 1;
    
    IF v_active_season_id IS NOT NULL THEN
        -- Insert a baseline snapshot for the new user
        INSERT INTO league_snapshots (season_id, user_id, league, season_xp)
        VALUES (v_active_season_id, NEW.id, 'Bronze', 0)
        ON CONFLICT (season_id, user_id) DO NOTHING;
        
        -- Re-run snapshot computation to update ranks
        PERFORM compute_leaderboard_snapshot(v_active_season_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_profile_created_league ON profiles;
CREATE TRIGGER on_profile_created_league
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user_league_snapshot();
