-- Admin Dashboard Stats RPC - Real Data
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
    t_users BIGINT;
    a_users_7d BIGINT;
    f_minutes BIGINT;
    g_rate DECIMAL;
    prev_month_users BIGINT;
    
    users_yesterday BIGINT;
    retained_d1 BIGINT;
    ret_d1 DECIMAL := 0;
    
    users_last_week BIGINT;
    retained_d7 BIGINT;
    ret_d7 DECIMAL := 0;
BEGIN
    -- 1. Total Users
    SELECT count(*) INTO t_users FROM profiles;

    -- 2. Active Users (7 days)
    SELECT count(DISTINCT user_id) INTO a_users_7d 
    FROM focus_sessions 
    WHERE completed_at >= (now() - interval '7 days')
      AND is_completed = true;

    -- 3. Total Focus Hours
    SELECT COALESCE(sum(duration_minutes), 0) INTO f_minutes 
    FROM focus_sessions 
    WHERE is_completed = true;

    -- 4. Growth Rate
    SELECT count(*) INTO prev_month_users 
    FROM profiles 
    WHERE created_at <= (now() - interval '30 days');
    
    IF prev_month_users > 0 THEN
        g_rate := ((t_users::DECIMAL - prev_month_users::DECIMAL) / prev_month_users::DECIMAL) * 100;
    ELSE
        g_rate := 100; -- Initial growth
    END IF;

    -- 5. Retention D1 (Users who signed up yesterday and had a session today)
    SELECT count(*) INTO users_yesterday 
    FROM profiles 
    WHERE created_at >= (now() - interval '2 days') AND created_at < (now() - interval '1 day');
    
    IF users_yesterday > 0 THEN
        SELECT count(DISTINCT p.id) INTO retained_d1
        FROM profiles p
        JOIN focus_sessions f ON f.user_id = p.id
        WHERE p.created_at >= (now() - interval '2 days') AND p.created_at < (now() - interval '1 day')
          AND f.completed_at >= (now() - interval '1 day') AND f.is_completed = true;
          
        ret_d1 := (retained_d1::DECIMAL / users_yesterday::DECIMAL) * 100;
    END IF;

    -- 6. Retention D7 (Users who signed up 7-8 days ago and had a session in the last day)
    SELECT count(*) INTO users_last_week 
    FROM profiles 
    WHERE created_at >= (now() - interval '8 days') AND created_at < (now() - interval '7 days');
    
    IF users_last_week > 0 THEN
        SELECT count(DISTINCT p.id) INTO retained_d7
        FROM profiles p
        JOIN focus_sessions f ON f.user_id = p.id
        WHERE p.created_at >= (now() - interval '8 days') AND p.created_at < (now() - interval '7 days')
          AND f.completed_at >= (now() - interval '1 day') AND f.is_completed = true;
          
        ret_d7 := (retained_d7::DECIMAL / users_last_week::DECIMAL) * 100;
    END IF;

    -- Combine into JSON
    result := json_build_object(
        'totalUsers', t_users,
        'activeUsers', a_users_7d,
        'totalFocusHours', round(f_minutes / 60.0, 1),
        'growth', round(g_rate, 1),
        'retentionD1', round(ret_d1, 1), 
        'retentionD7', round(ret_d7, 1),
        'totalRevenue', 0 -- Still 0 since no payments table
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
