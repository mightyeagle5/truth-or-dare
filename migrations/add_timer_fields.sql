-- Add timer-related fields to challenges table

-- Add is_time_based column
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS is_time_based BOOLEAN NOT NULL DEFAULT FALSE;

-- Add duration column (in seconds)
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 0;

-- Create index for time-based challenges
CREATE INDEX IF NOT EXISTS idx_challenges_is_time_based ON challenges(is_time_based);

-- Comment on new columns
COMMENT ON COLUMN challenges.is_time_based IS 'Whether the challenge is time-based and requires a timer';
COMMENT ON COLUMN challenges.duration IS 'Duration in seconds for time-based challenges';

