-- 1. Ensure the league_tier_enum exists (idempotent creation)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'league_tier_enum') THEN
        CREATE TYPE league_tier_enum AS ENUM (
            'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster'
        );
    END IF;
END $$;

-- 2. Add current_league column if it doesn't exist, using the enum type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'current_league') THEN
        ALTER TABLE public.profiles ADD COLUMN current_league league_tier_enum DEFAULT 'Bronze'::league_tier_enum;
    ELSE
        -- If it exists as text, we should alter its type to our enum
        IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'current_league') = 'text' THEN
            ALTER TABLE public.profiles ALTER COLUMN current_league TYPE league_tier_enum USING (
                CASE 
                    WHEN current_league IN ('Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster') THEN current_league::league_tier_enum
                    WHEN current_league = 'Elite' THEN 'Master'::league_tier_enum
                    ELSE 'Bronze'::league_tier_enum
                END
            );
        END IF;
    END IF;
END $$;

-- 3. Backfill data based on the old tier column safely
UPDATE public.profiles
SET current_league = (CASE 
    WHEN tier IN ('Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster') THEN tier
    WHEN tier = 'Elite' THEN 'Master'
    ELSE 'Bronze'
END)::league_tier_enum
WHERE current_league IS NULL;

-- 4. Final safety net: ensure NO current_league is null
UPDATE public.profiles
SET current_league = 'Bronze'::league_tier_enum
WHERE current_league IS NULL;
