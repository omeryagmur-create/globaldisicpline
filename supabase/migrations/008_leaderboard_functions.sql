-- Function to get leaderboard data
-- Returns top N users ordered by total_xp
CREATE OR REPLACE FUNCTION get_leaderboard(limit_count int DEFAULT 50)
RETURNS TABLE (
  id uuid,
  full_name text,
  avatar_url text,
  country text,
  total_xp bigint,
  current_level int,
  tier text
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    id,
    full_name,
    avatar_url,
    country,
    total_xp,
    current_level,
    tier
  FROM profiles
  ORDER BY total_xp DESC
  LIMIT limit_count;
$$;
