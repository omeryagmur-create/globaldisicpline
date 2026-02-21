-- Admin Dashboard Stats RPC
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
    t_users BIGINT;
    a_users_7d BIGINT;
    f_minutes BIGINT;
    g_rate DECIMAL;
    prev_month_users BIGINT;
BEGIN
    -- 1. Total Users
    SELECT count(*) INTO t_users FROM profiles;

    -- 2. Active Users (7 days) - Distinct users with completed sessions in last 7 days
    SELECT count(DISTINCT user_id) INTO a_users_7d 
    FROM focus_sessions 
    WHERE completed_at >= (now() - interval '7 days')
      AND is_completed = true;

    -- 3. Total Focus Hours
    SELECT COALESCE(sum(duration_minutes), 0) INTO f_minutes 
    FROM focus_sessions 
    WHERE is_completed = true;

    -- 4. Growth Rate (% change in users compared to 30 days ago)
    SELECT count(*) INTO prev_month_users 
    FROM profiles 
    WHERE created_at <= (now() - interval '30 days');
    
    IF prev_month_users > 0 THEN
        g_rate := ((t_users::DECIMAL - prev_month_users::DECIMAL) / prev_month_users::DECIMAL) * 100;
    ELSE
        g_rate := 100; -- Initial growth
    END IF;

    -- Combine into JSON
    result := json_build_object(
        'totalUsers', t_users,
        'activeUsers', a_users_7d,
        'totalFocusHours', round(f_minutes / 60.0, 1),
        'growth', round(g_rate, 1),
        'retentionD1', 45, -- Placeholder for now (requires complex join with cohorts)
        'retentionD7', 32,
        'totalRevenue', 0
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
