-- Create exam_systems table
CREATE TABLE IF NOT EXISTS exam_systems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE exam_systems ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Enable read access for all authenticated users"
ON exam_systems FOR SELECT
TO authenticated
USING (true);

-- Allow full access to admins
CREATE POLICY "Enable ALL access for admins"
ON exam_systems FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

-- Insert default exact same mock values
INSERT INTO exam_systems (id, code, name, country) VALUES
('11111111-1111-1111-1111-111111111111', 'TR-YKS', 'YKS', 'Turkey'),
('22222222-2222-2222-2222-222222222222', 'US-SAT', 'SAT', 'USA')
ON CONFLICT (code) DO NOTHING;
