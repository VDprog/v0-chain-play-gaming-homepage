// ==============================================
// MATCH SYSTEM TYPES
// Reusable across all ChainPlay games
// ==============================================

export type RoundCount = 1 | 3 | 5

export interface MatchSettings {
  totalRounds: RoundCount
}

export interface MatchState {
  // Match configuration
  totalRounds: RoundCount
  currentRound: number
  
  // Player wins (player_id → wins count)
  playerWins: Record<string, number>
  
  // Round-specific state
  roundStatus: "waiting" | "countdown" | "active" | "ending" | "finished"
  roundWinnerId: string | null
  roundLoserId: string | null
  
  // Match result
  matchWinnerId: string | null
  matchStatus: "active" | "finished"
  
  // Timing
  roundStartedAt: number | null
  roundEndedAt: number | null
}

export interface PlayerMatchState {
  playerId: string
  isActive: boolean // Active in current round
  isEliminated: boolean // Eliminated this round
  wins: number
  isMatchWinner: boolean
}

// Calculate wins needed to win the match
export function getWinsNeeded(totalRounds: RoundCount): number {
  switch (totalRounds) {
    case 1: return 1
    case 3: return 2
    case 5: return 3
    default: return 1
  }
}

// Check if a player has won the match
export function hasPlayerWonMatch(
  playerWins: number,
  totalRounds: RoundCount
): boolean {
  return playerWins >= getWinsNeeded(totalRounds)
}

// Create initial match state
export function createInitialMatchState(totalRounds: RoundCount = 1): MatchState {
  return {
    totalRounds,
    currentRound: 1,
    playerWins: {},
    roundStatus: "waiting",
    roundWinnerId: null,
    roundLoserId: null,
    matchWinnerId: null,
    matchStatus: "active",
    roundStartedAt: null,
    roundEndedAt: null,
  }
}

// Initialize player wins for all players
export function initializePlayerWins(playerIds: string[]): Record<string, number> {
  const wins: Record<string, number> = {}
  playerIds.forEach(id => {
    wins[id] = 0
  })
  return wins
}
