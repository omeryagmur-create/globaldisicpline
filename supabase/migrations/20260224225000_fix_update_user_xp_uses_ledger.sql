-- Ensure legacy RPC also writes to xp_ledger so seasonal leaderboard remains correct.
CREATE OR REPLACE FUNCTION update_user_xp(p_user_id uuid, p_xp_amount integer)
RETURNS void AS $$
DECLARE
    v_total_xp bigint;
    v_new_level integer;
BEGIN
    -- Route through grant_xp to keep profiles.total_xp and xp_ledger in sync.
    PERFORM grant_xp(
        p_user_id,
        p_xp_amount,
        'legacy_update_user_xp',
        gen_random_uuid()::text
    );

    SELECT total_xp INTO v_total_xp FROM profiles WHERE id = p_user_id;

    -- Simple level calculation: Level = floor(sqrt(total_xp / 100)) + 1
    v_new_level := floor(sqrt(v_total_xp / 100)) + 1;

    UPDATE profiles
    SET current_level = v_new_level
    WHERE id = p_user_id AND current_level < v_new_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
