-- Add current_league column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'current_league') THEN
        ALTER TABLE public.profiles ADD COLUMN current_league text DEFAULT 'Bronze';
    END IF;
END $$;

-- Backfill data based on the old tier column
UPDATE public.profiles
SET current_league = (CASE 
    WHEN tier = 'Elite' THEN 'Master'
    WHEN tier IS NOT NULL AND tier != '' THEN tier
    ELSE 'Bronze'
END)::league_tier_enum
WHERE current_league IS NULL;
