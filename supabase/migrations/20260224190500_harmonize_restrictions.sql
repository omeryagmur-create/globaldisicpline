-- 20260224190500_harmonize_restrictions.sql
-- Ensure restrictions table matches the application logic

DO $$
BEGIN
    -- Rename columns if they exist as old names
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restrictions' AND column_name = 'restriction_type') THEN
        ALTER TABLE public.restrictions RENAME COLUMN restriction_type TO type;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restrictions' AND column_name = 'severity_level') THEN
        ALTER TABLE public.restrictions RENAME COLUMN severity_level TO level;
    END IF;

    -- Add features column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restrictions' AND column_name = 'features') THEN
        ALTER TABLE public.restrictions ADD COLUMN features text[] NOT NULL DEFAULT '{}';
    END IF;

    -- Remove consecutive_failures if it exists (not used in current logic)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restrictions' AND column_name = 'consecutive_failures') THEN
        ALTER TABLE public.restrictions DROP COLUMN consecutive_failures;
    END IF;

END $$;

-- Ensure RLS and Policies are robust
ALTER TABLE public.restrictions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own restrictions" ON public.restrictions;
CREATE POLICY "Users can read own restrictions"
ON public.restrictions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all restrictions" ON public.restrictions;
DROP POLICY IF EXISTS "Admins can read all restrictions" ON public.restrictions;
DROP POLICY IF EXISTS "Admins can insert restrictions" ON public.restrictions;
DROP POLICY IF EXISTS "Admins can update restrictions" ON public.restrictions;

CREATE POLICY "Admins can manage all restrictions"
ON public.restrictions FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
