-- Add time-based challenge columns if they don't exist
ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS is_time_based BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS duration INTEGER NOT NULL DEFAULT 0;

-- Add the get_random_challenge function
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

