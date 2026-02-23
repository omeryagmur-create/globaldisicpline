-- XP Ledger Table for Idempotent XP Tracking
CREATE TABLE IF NOT EXISTS xp_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    idempotency_key TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE xp_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own xp ledger"
ON xp_ledger FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own xp ledger"
ON xp_ledger FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Atomic RPC to grant XP via ledger
CREATE OR REPLACE FUNCTION grant_xp(p_user_id UUID, p_amount INTEGER, p_reason TEXT, p_idempotency_key TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    new_xp INTEGER;
BEGIN
    -- Try to insert into ledger. If idempotency_key exists, it will throw an exception.
    BEGIN
        INSERT INTO xp_ledger (user_id, amount, reason, idempotency_key)
        VALUES (p_user_id, p_amount, p_reason, p_idempotency_key);
    EXCEPTION WHEN unique_violation THEN
        -- If already granted via idempotency key, return false
        RETURN FALSE;
    END;

    -- Update user's profile XP atomically
    UPDATE profiles
    SET total_xp = COALESCE(total_xp, 0) + p_amount
    WHERE id = p_user_id
    RETURNING total_xp INTO new_xp;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
