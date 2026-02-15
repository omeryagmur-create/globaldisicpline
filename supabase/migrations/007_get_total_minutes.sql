-- Function to calculate total study minutes for a user
CREATE OR REPLACE FUNCTION get_total_study_minutes(p_user_id uuid)
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(duration_minutes), 0)
  FROM focus_sessions
  WHERE user_id = p_user_id AND is_completed = true;
$$;
