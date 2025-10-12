-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL CHECK (level IN ('soft', 'mild', 'hot', 'spicy', 'kinky')),
  kind TEXT NOT NULL CHECK (kind IN ('truth', 'dare')),
  text TEXT NOT NULL,
  gender_for TEXT[] NOT NULL DEFAULT '{}',
  gender_target TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_time_based BOOLEAN NOT NULL DEFAULT FALSE,
  duration INTEGER  DEFAULT NULL
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

-- Function to get a random challenge with filters
CREATE OR REPLACE FUNCTION get_random_challenge(
  p_level TEXT,
  p_kind TEXT,
  p_excluded_ids UUID[] DEFAULT ARRAY[]::UUID[]
)
RETURNS TABLE (
  id UUID,
  level TEXT,
  kind TEXT,
  text TEXT,
  gender_for TEXT[],
  gender_target TEXT[],
  tags TEXT[],
  is_deleted BOOLEAN,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  is_time_based BOOLEAN,
  duration INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.level,
    c.kind,
    c.text,
    c.gender_for,
    c.gender_target,
    c.tags,
    c.is_deleted,
    c.deleted_at,
    c.created_at,
    c.updated_at,
    c.is_time_based,
    c.duration
  FROM challenges c
  WHERE c.is_deleted = FALSE
    AND c.level = p_level
    AND c.kind = p_kind
    AND NOT (c.id = ANY(p_excluded_ids))
  ORDER BY RANDOM()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data (optional)
INSERT INTO challenges (level, kind, text, gender_for, gender_target, tags) VALUES
('soft', 'truth', 'What is your favorite color?', ARRAY['female', 'male'], ARRAY['female', 'male'], ARRAY[]),
('mild', 'dare', 'Give someone a compliment', ARRAY['female', 'male'], ARRAY['female', 'male'], ARRAY['social']),
('hot', 'truth', 'What is your biggest turn-on?', ARRAY['female', 'male'], ARRAY['female', 'male'], ARRAY['sexual'])
ON CONFLICT DO NOTHING;

