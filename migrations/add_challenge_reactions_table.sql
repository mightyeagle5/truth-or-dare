-- Create challenge_reactions table
CREATE TABLE IF NOT EXISTS challenge_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL CHECK (reaction IN ('up','down')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_challenge_reactions_challenge_id ON challenge_reactions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_reactions_reaction ON challenge_reactions(reaction);
CREATE INDEX IF NOT EXISTS idx_challenge_reactions_created_at ON challenge_reactions(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE challenge_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now)
CREATE POLICY "Allow all operations on challenge_reactions" ON challenge_reactions
  FOR ALL USING (true);
