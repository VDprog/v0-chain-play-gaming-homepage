-- Add case-insensitive unique index on username for the players table
-- This ensures no two players can have the same username regardless of casing

-- Create a unique index on lowercase username
-- This prevents "PlayerOne" and "playerone" from both existing
CREATE UNIQUE INDEX IF NOT EXISTS players_username_lower_unique 
ON players (LOWER(username));

-- Note: The original username column preserves the user's chosen casing for display,
-- but this index ensures uniqueness is case-insensitive
