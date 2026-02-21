-- Add experiments column to profiles for A/B testing
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experiments JSONB DEFAULT '{}'::jsonb;

-- Create user_events table for retention tracking & analytics
CREATE TABLE IF NOT EXISTS user_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type VARCHAR(255) NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for user_events
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

-- Analytics policies (only user can read and insert their own events)
CREATE POLICY "Users can insert their own events." 
    ON user_events FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own events." 
    ON user_events FOR SELECT 
    USING (auth.uid() = user_id);
