-- Create leaderboard_stats table
CREATE TABLE IF NOT EXISTS leaderboard_stats (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  avatar_url TEXT,
  favorite_game TEXT NOT NULL,
  wins INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  win_rate NUMERIC(5, 2) DEFAULT 0.00 CHECK (win_rate >= 0 AND win_rate <= 100),
  earnings NUMERIC(20, 8) DEFAULT 0,
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leaderboard_stats_wins ON leaderboard_stats (wins DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_stats_username ON leaderboard_stats (username);

-- Enable Row Level Security
ALTER TABLE leaderboard_stats ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists and recreate
DROP POLICY IF EXISTS "Allow public read access" ON leaderboard_stats;
CREATE POLICY "Allow public read access" ON leaderboard_stats
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create or replace function for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS set_updated_at ON leaderboard_stats;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON leaderboard_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (using ON CONFLICT to avoid duplicates)
INSERT INTO leaderboard_stats (username, avatar_url, favorite_game, wins, games_played, win_rate, earnings, streak)
VALUES 
  ('Vlad', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vlad', 'Pass the Bomb', 156, 203, 76.85, 12450.50, 8),
  ('Eva', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eva', 'Split or Steal', 142, 198, 71.72, 9870.25, 5),
  ('Panda', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Panda', 'Speed Quiz', 128, 175, 73.14, 8540.00, 12),
  ('Jack', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack', 'Timer', 98, 156, 62.82, 6230.75, 3),
  ('Adam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adam', 'Hidden Button', 87, 142, 61.27, 5120.30, 6)
ON CONFLICT DO NOTHING;
