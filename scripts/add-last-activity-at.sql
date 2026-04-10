-- Add last_activity_at column to rooms table for lifecycle management
-- This field tracks meaningful room activity for expiration decisions

-- Add the column if it doesn't exist
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;

-- Create an index for efficient querying by last_activity_at
CREATE INDEX IF NOT EXISTS idx_rooms_last_activity_at ON rooms(last_activity_at);

-- Create a composite index for efficient /live queries
CREATE INDEX IF NOT EXISTS idx_rooms_status_activity ON rooms(status, last_activity_at);

-- Backfill existing rooms with best available timestamp
-- Priority: finished_at > started_at > updated_at > created_at
UPDATE rooms 
SET last_activity_at = COALESCE(finished_at, started_at, updated_at, created_at)
WHERE last_activity_at IS NULL;

-- Set default for new rooms
ALTER TABLE rooms 
ALTER COLUMN last_activity_at SET DEFAULT NOW();

-- Expire stale waiting rooms (> 3 minutes since last activity)
UPDATE rooms 
SET status = 'expired'
WHERE status = 'waiting' 
  AND COALESCE(last_activity_at, created_at) < NOW() - INTERVAL '3 minutes';

-- Expire stuck starting rooms (> 1 minute since last activity)
UPDATE rooms 
SET status = 'expired'
WHERE status = 'starting' 
  AND COALESCE(last_activity_at, created_at) < NOW() - INTERVAL '1 minute';

-- Expire inactive live rooms (> 10 minutes since last activity)
UPDATE rooms 
SET status = 'expired'
WHERE status = 'live' 
  AND COALESCE(last_activity_at, started_at, created_at) < NOW() - INTERVAL '10 minutes';

-- Expire lingering finished rooms (> 10 minutes since finish)
UPDATE rooms 
SET status = 'expired'
WHERE status = 'finished' 
  AND COALESCE(finished_at, last_activity_at, created_at) < NOW() - INTERVAL '10 minutes';
