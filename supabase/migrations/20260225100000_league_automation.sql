-- 1. Create league_automation_logs table
CREATE TABLE IF NOT EXISTS league_automation_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    run_at timestamptz DEFAULT now(),
    action text NOT NULL,
    season_id uuid,
    status text NOT NULL, -- 'success', 'error', 'skipped'
    details jsonb,
    error_message text
);

-- 2. Create the main automation tick function
CREATE OR REPLACE FUNCTION process_league_season_tick()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_active_season record;
    v_now timestamptz := now();
    v_lock_obtained boolean;
    v_result jsonb;
    v_next_season_id uuid;
BEGIN
    -- 1. Try to obtain an advisory lock to prevent concurrent runs
    -- Use a constant ID for league automation (e.g., 1001)
    SELECT pg_try_advisory_xact_lock(1001) INTO v_lock_obtained;
    
    IF NOT v_lock_obtained THEN
        RETURN jsonb_build_object('status', 'skipped', 'reason', 'Could not obtain advisory lock');
    END IF;

    -- 2. Find the active season
    SELECT * INTO v_active_season 
    FROM league_seasons 
    WHERE status = 'active' 
    ORDER BY created_at DESC 
    LIMIT 1;

    -- 3. If no active season, try to start one if there are none at all or if last one is settled
    IF NOT FOUND THEN
        -- Check if we should auto-start a season if none exist
        IF NOT EXISTS (SELECT 1 FROM league_seasons WHERE status = 'active') THEN
            v_next_season_id := start_next_season();
            INSERT INTO league_automation_logs (action, season_id, status, details)
            VALUES ('start_initial_season', v_next_season_id, 'success', jsonb_build_object('message', 'No active season found, started first/new season'));
            
            RETURN jsonb_build_object('status', 'success', 'action', 'start_initial_season', 'season_id', v_next_season_id);
        END IF;
        
        RETURN jsonb_build_object('status', 'skipped', 'reason', 'No active season found and start not required');
    END IF;

    -- 4. Check if season has ended
    IF v_active_season.ends_at <= v_now THEN
        BEGIN
            -- 4a. Settle movements
            PERFORM settle_league_movements(v_active_season.id);
            
            -- 4b. Status is updated inside start_next_season() but we'll be explicit for safety
            -- Actually start_next_season marks CURRENT as settled.
            v_next_season_id := start_next_season();
            
            -- 4c. Log success
            INSERT INTO league_automation_logs (action, season_id, status, details)
            VALUES ('season_settlement', v_active_season.id, 'success', jsonb_build_object(
                'old_season_id', v_active_season.id,
                'new_season_id', v_next_season_id,
                'ended_at', v_active_season.ends_at
            ));

            v_result := jsonb_build_object(
                'status', 'success',
                'action', 'season_settlement',
                'old_season_id', v_active_season.id,
                'new_season_id', v_next_season_id
            );
        EXCEPTION WHEN OTHERS THEN
            -- Log failure
            INSERT INTO league_automation_logs (action, season_id, status, error_message, details)
            VALUES ('season_settlement', v_active_season.id, 'error', SQLERRM, jsonb_build_object('state', SQLSTATE));
            
            RAISE NOTICE 'Error processing league tick: %', SQLERRM;
            v_result := jsonb_build_object('status', 'error', 'message', SQLERRM);
        END;
    ELSE
        -- Season still active, just stay quiet or log periodically if needed
        v_result := jsonb_build_object(
            'status', 'skipped', 
            'reason', 'Season still active', 
            'ends_at', v_active_season.ends_at,
            'remaining', v_active_season.ends_at - v_now
        );
    END IF;

    RETURN v_result;
END;
$$;

-- 3. Enable pg_cron if available and schedule the tick
-- Note: This might require superuser or specific extension setup in some Supabase environments.
-- If it fails, the user can still trigger via Edge Functions or manual cron.
DO $$
BEGIN
    -- Check if pg_cron extension exists
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        -- Schedule tick every 1 minute
        -- We use 'cron' schema which is standard for pg_cron
        PERFORM cron.schedule('league-season-tick', '* * * * *', 'SELECT process_league_season_tick()');
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron not available or permission denied. Manual scheduling required.';
END $$;
