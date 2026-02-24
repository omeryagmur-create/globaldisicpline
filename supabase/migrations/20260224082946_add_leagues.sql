-- 1. Create league_tier enum
CREATE TYPE league_tier_enum AS ENUM (
    'Bronze',
    'Silver',
    'Gold',
    'Platinum',
    'Emerald',
    'Diamond',
    'Master',
    'Grandmaster'
);

-- 2. Modify profiles table
ALTER TABLE profiles ADD COLUMN current_league league_tier_enum NOT NULL DEFAULT 'Bronze';

-- Create an index to make subscription_tier fast if not exists
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);

-- 3. Create league_seasons table
CREATE TABLE IF NOT EXISTS league_seasons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    season_number int UNIQUE NOT NULL,
    starts_at timestamptz NOT NULL,
    ends_at timestamptz NOT NULL,
    status text CHECK (status IN ('upcoming', 'active', 'settled')) NOT NULL DEFAULT 'upcoming',
    created_at timestamptz DEFAULT now()
);

-- 4. Create league_snapshots table
CREATE TABLE IF NOT EXISTS league_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    season_id uuid REFERENCES league_seasons(id) ON DELETE CASCADE,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    league league_tier_enum NOT NULL,
    season_xp bigint NOT NULL DEFAULT 0,
    rank_overall int,
    rank_in_league int,
    rank_premium_in_league int,
    created_at timestamptz DEFAULT now(),
    UNIQUE(season_id, user_id)
);

-- 5. Create league_movements table
CREATE TABLE IF NOT EXISTS league_movements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    season_id uuid REFERENCES league_seasons(id) ON DELETE CASCADE,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    from_league league_tier_enum NOT NULL,
    to_league league_tier_enum NOT NULL,
    movement text CHECK (movement IN ('promotion', 'relegation', 'stay')) NOT NULL,
    reason text,
    created_at timestamptz DEFAULT now()
);

-- 6. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_league_snapshots_season_rank ON league_snapshots(season_id, rank_overall);
CREATE INDEX IF NOT EXISTS idx_league_snapshots_season_league_rank ON league_snapshots(season_id, league, rank_in_league);
CREATE INDEX IF NOT EXISTS idx_league_snapshots_season_league_premium_rank ON league_snapshots(season_id, league, rank_premium_in_league);
CREATE INDEX IF NOT EXISTS idx_profiles_current_league ON profiles(current_league);

-- 7. RLS Policies
ALTER TABLE league_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users on league_seasons" ON league_seasons FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users on league_snapshots" ON league_snapshots FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users on league_movements" ON league_movements FOR SELECT USING (true);

-- 8. Functions

-- 8.1 get_active_season
CREATE OR REPLACE FUNCTION get_active_season()
RETURNS SETOF league_seasons
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT * FROM league_seasons WHERE status = 'active' ORDER BY created_at DESC LIMIT 1;
$$;

-- 8.2 start_next_season
CREATE OR REPLACE FUNCTION start_next_season()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_season league_seasons%ROWTYPE;
    v_next_season_num int;
    v_next_season_id uuid;
    v_now timestamptz := now();
BEGIN
    SELECT * INTO v_current_season FROM league_seasons WHERE status = 'active' ORDER BY created_at DESC LIMIT 1;

    IF FOUND THEN
        UPDATE league_seasons SET status = 'settled', ends_at = LEAST(ends_at, v_now) WHERE id = v_current_season.id;
        v_next_season_num := v_current_season.season_number + 1;
    ELSE
        SELECT COALESCE(MAX(season_number), 0) + 1 INTO v_next_season_num FROM league_seasons;
    END IF;

    -- Create new active season (14 days)
    INSERT INTO league_seasons (season_number, starts_at, ends_at, status)
    VALUES (v_next_season_num, v_now, v_now + INTERVAL '14 days', 'active')
    RETURNING id INTO v_next_season_id;

    RETURN v_next_season_id;
END;
$$;

-- 8.3 compute_leaderboard_snapshot
CREATE OR REPLACE FUNCTION compute_leaderboard_snapshot(p_season_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_season league_seasons%ROWTYPE;
BEGIN
    SELECT * INTO v_season FROM league_seasons WHERE id = p_season_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Season % not found', p_season_id;
    END IF;

    -- Delete existing snapshots for this season
    DELETE FROM league_snapshots WHERE season_id = p_season_id;

    -- Insert new snapshots based on xp_ledger within season time window
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
        WHERE created_at >= v_season.starts_at AND created_at < coalesce(v_season.ends_at, now())
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
            DENSE_RANK() OVER (ORDER BY season_xp DESC, user_id) as rank_overall,
            DENSE_RANK() OVER (PARTITION BY league ORDER BY season_xp DESC, user_id) as rank_in_league,
            CASE 
                WHEN subscription_tier IN ('pro', 'premium', 'elite') THEN
                    DENSE_RANK() OVER (PARTITION BY league, (subscription_tier IN ('pro', 'premium', 'elite')) ORDER BY season_xp DESC, user_id)
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

-- 8.4 settle_league_movements
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
    -- Force compute snapshot first to make sure ranks are up-to-date
    PERFORM compute_leaderboard_snapshot(p_season_id);

    -- Clean previous movements for this season
    DELETE FROM league_movements WHERE season_id = p_season_id;

    -- Iterate over each league using the enum
    FOR v_league IN SELECT unnest(enum_range(NULL::league_tier_enum))
    LOOP
        SELECT COUNT(*) INTO v_total_users FROM league_snapshots WHERE season_id = p_season_id AND league = v_league;
        
        IF v_total_users > 0 THEN
            v_promote_count := floor(v_total_users * 0.10);
            v_relegate_count := floor(v_total_users * 0.10);

            FOR r IN (
                SELECT user_id, rank_in_league 
                FROM league_snapshots 
                WHERE season_id = p_season_id AND league = v_league
                ORDER BY rank_in_league ASC
            )
            LOOP
                v_to_league := v_league;
                v_movement := 'stay';

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

                    -- Update profile
                    UPDATE profiles SET current_league = v_to_league WHERE id = r.user_id;
                END IF;

            END LOOP;
        END IF;
    END LOOP;
END;
$$;
