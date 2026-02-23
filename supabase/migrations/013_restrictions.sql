-- Create restrictions table to replace in-memory mock array
CREATE TABLE IF NOT EXISTS restrictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    level INTEGER NOT NULL,
    features TEXT[] NOT NULL DEFAULT '{}',
    reason TEXT,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE restrictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own restrictions"
ON restrictions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all restrictions"
ON restrictions FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Admins can insert restrictions"
ON restrictions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Admins can update restrictions"
ON restrictions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
