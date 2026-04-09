-- Add wallet_type column to players table (defaults to 'evm' for existing records)
-- This supports both EVM and Tezos wallets

-- Add wallet_type column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'wallet_type'
  ) THEN
    ALTER TABLE players ADD COLUMN wallet_type TEXT NOT NULL DEFAULT 'evm';
  END IF;
END $$;

-- Add wallet_network column if it doesn't exist  
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'wallet_network'
  ) THEN
    ALTER TABLE players ADD COLUMN wallet_network TEXT;
  END IF;
END $$;

-- Create indexes for efficient wallet lookups
CREATE INDEX IF NOT EXISTS idx_players_wallet_type ON players (wallet_type);
CREATE INDEX IF NOT EXISTS idx_players_wallet_address_type ON players (wallet_address, wallet_type);

-- Update the unique constraint to be on wallet_address + wallet_type
-- First check if the old constraint exists and drop it
DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM pg_constraint WHERE conname = 'players_wallet_address_key'
  ) THEN
    ALTER TABLE players DROP CONSTRAINT players_wallet_address_key;
  END IF;
END $$;

-- Add new unique constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_constraint WHERE conname = 'players_wallet_address_type_unique'
  ) THEN
    ALTER TABLE players ADD CONSTRAINT players_wallet_address_type_unique UNIQUE (wallet_address, wallet_type);
  END IF;
END $$;
