-- 0. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_xp_ledger_user_created ON xp_ledger(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_xp_ledger_created ON xp_ledger(created_at);

-- 1. Remove the inefficient performance-killing trigger
DROP TRIGGER IF EXISTS on_profile_created_league ON profiles;
DROP FUNCTION IF EXISTS handle_new_user_league_snapshot();

-- 2. Create a Livedata View for the current league status
-- This view calculates real-time XP for the active season
CREATE OR REPLACE VIEW live_league_leaderboard AS
WITH active_season AS (
    SELECT id, starts_at, ends_at FROM league_seasons WHERE status = 'active' ORDER BY created_at DESC LIMIT 1
),
xp_totals AS (
    SELECT 
        l.user_id, 
        SUM(l.amount) as season_xp
    FROM xp_ledger l
    JOIN active_season s ON l.created_at >= s.starts_at AND (s.ends_at IS NULL OR l.created_at < s.ends_at)
    GROUP BY l.user_id
)
SELECT 
    p.id as user_id,
    p.current_league as league,
    COALESCE(x.season_xp, 0) as season_xp,
    p.subscription_tier,
    RANK() OVER (ORDER BY COALESCE(x.season_xp, 0) DESC, p.id ASC) as rank_overall,
    RANK() OVER (PARTITION BY p.current_league ORDER BY COALESCE(x.season_xp, 0) DESC, p.id ASC) as rank_in_league,
    CASE 
        WHEN p.subscription_tier IN ('pro', 'premium', 'elite') THEN
            RANK() OVER (PARTITION BY p.current_league, (p.subscription_tier IN ('pro', 'premium', 'elite')) ORDER BY COALESCE(x.season_xp, 0) DESC, p.id ASC)
        ELSE NULL
    END as rank_premium_in_league,
    (SELECT id FROM active_season) as season_id
FROM profiles p
LEFT JOIN xp_totals x ON p.id = x.user_id;

-- 3. Update settle_league_movements to be more robust for different user counts
CREATE OR REPLACE FUNCTION settle_league_movements(p_season_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_league league_tier_enum;
    v_total_users int;
    v_promote_count int;
    v_relegate_count int;
    
    r RECORD;
    v_to_league league_tier_enum;
    v_movement text;
BEGIN
    -- 1. Snapshot everything from the live view into the snapshots table for archival
    -- This ensures we have a record of the final standings
    DELETE FROM league_snapshots WHERE season_id = p_season_id;
    
    INSERT INTO league_snapshots (
        season_id, user_id, league, season_xp, rank_overall, rank_in_league, rank_premium_in_league
    )
    SELECT 
        p_season_id, user_id, league, season_xp, rank_overall, rank_in_league, rank_premium_in_league
    FROM live_league_leaderboard;

    -- 2. Clean previous movements for this season
    DELETE FROM league_movements WHERE season_id = p_season_id;

    -- 3. Iterate over each league and calculate moves
    FOR v_league IN SELECT unnest(enum_range(NULL::league_tier_enum))
    LOOP
        SELECT COUNT(*) INTO v_total_users FROM league_snapshots WHERE season_id = p_season_id AND league = v_league;
        
        IF v_total_users > 0 THEN
            -- IMPROVED LOGIC: 15% promotion/relegation, with a minimum of 1 if there are at least 2 users
            v_promote_count := GREATEST(1, floor(v_total_users * 0.15));
            v_relegate_count := GREATEST(1, floor(v_total_users * 0.15));

            -- Special cases for very small leagues
            IF v_total_users < 2 THEN v_promote_count := 0; v_relegate_count := 0; END IF;
            IF v_total_users < 5 THEN v_relegate_count := 0; END IF; -- Don't kick people down if the league is tiny

            FOR r IN (
                SELECT user_id, rank_in_league 
                FROM league_snapshots 
                WHERE season_id = p_season_id AND league = v_league
                ORDER BY rank_in_league ASC
            )
            LOOP
                v_to_league := v_league;
                v_movement := 'stay';

                -- Promotion logic
                IF r.rank_in_league <= v_promote_count AND v_league != 'Grandmaster' THEN
                    v_movement := 'promotion';
                    v_to_league := CASE v_league
                        WHEN 'Bronze' THEN 'Silver'::league_tier_enum
                        WHEN 'Silver' THEN 'Gold'::league_tier_enum
                        WHEN 'Gold' THEN 'Platinum'::league_tier_enum
                        WHEN 'Platinum' THEN 'Emerald'::league_tier_enum
                        WHEN 'Emerald' THEN 'Diamond'::league_tier_enum
                        WHEN 'Diamond' THEN 'Master'::league_tier_enum
                        WHEN 'Master' THEN 'Grandmaster'::league_tier_enum
                        ELSE v_league
                    END;
                -- Relegation logic
                ELSIF r.rank_in_league > (v_total_users - v_relegate_count) AND v_league != 'Bronze' THEN
                    v_movement := 'relegation';
                    v_to_league := CASE v_league
                        WHEN 'Silver' THEN 'Bronze'::league_tier_enum
                        WHEN 'Gold' THEN 'Silver'::league_tier_enum
                        WHEN 'Platinum' THEN 'Gold'::league_tier_enum
                        WHEN 'Emerald' THEN 'Platinum'::league_tier_enum
                        WHEN 'Diamond' THEN 'Emerald'::league_tier_enum
                        WHEN 'Master' THEN 'Diamond'::league_tier_enum
                        WHEN 'Grandmaster' THEN 'Master'::league_tier_enum
                        ELSE v_league
                    END;
                END IF;

                IF v_movement != 'stay' THEN
                    INSERT INTO league_movements (season_id, user_id, from_league, to_league, movement, reason)
                    VALUES (p_season_id, r.user_id, v_league, v_to_league, v_movement, 'End of season settlement');

                    -- Update profile for the next season
                    UPDATE profiles SET current_league = v_to_league WHERE id = r.user_id;
                END IF;

            END LOOP;
        END IF;
    END LOOP;
END;
$$;
