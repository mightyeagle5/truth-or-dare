-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level VARCHAR(20) NOT NULL CHECK (level IN ('soft', 'mild', 'hot', 'spicy', 'kinky')),
  kind VARCHAR(10) NOT NULL CHECK (kind IN ('truth', 'dare')),
  text TEXT NOT NULL,
  gender_for TEXT[] NOT NULL DEFAULT '{}',
  gender_target TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_challenges_level ON challenges(level);
CREATE INDEX IF NOT EXISTS idx_challenges_kind ON challenges(kind);
CREATE INDEX IF NOT EXISTS idx_challenges_created_at ON challenges(created_at);
CREATE INDEX IF NOT EXISTS idx_challenges_is_deleted ON challenges(is_deleted);
CREATE INDEX IF NOT EXISTS idx_challenges_deleted_at ON challenges(deleted_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_challenges_updated_at 
    BEFORE UPDATE ON challenges 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your authentication needs)
-- For now, allow all operations (you may want to restrict this later)
CREATE POLICY "Allow all operations on challenges" ON challenges
  FOR ALL USING (true);

-- Insert some sample data (optional)
INSERT INTO challenges (level, kind, text, gender_for, gender_target, tags) VALUES
('soft', 'truth', 'What is your favorite color?', ARRAY['female', 'male'], ARRAY['female', 'male'], ARRAY[]),
('mild', 'dare', 'Give someone a compliment', ARRAY['female', 'male'], ARRAY['female', 'male'], ARRAY['social']),
('hot', 'truth', 'What is your biggest turn-on?', ARRAY['female', 'male'], ARRAY['female', 'male'], ARRAY['sexual'])
ON CONFLICT DO NOTHING;

