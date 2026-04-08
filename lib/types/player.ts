export interface Player {
  id: string
  wallet_address: string
  wallet_chain: string | null
  username: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface PlayerStats {
  player_id: string
  wins: number
  losses: number
  games_played: number
  current_streak: number
  best_streak: number
  earnings_total: number
  created_at: string
  updated_at: string
}

export interface PlayerWithStats extends Player {
  stats: PlayerStats | null
}

export interface CreatePlayerInput {
  wallet_address: string
  wallet_chain?: string
  username: string
  avatar_url?: string
}
