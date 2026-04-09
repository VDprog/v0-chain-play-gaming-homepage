"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import type { 
  MatchState, 
  RoundCount, 
  PlayerMatchState 
} from "@/lib/types/match"
import { 
  createInitialMatchState, 
  initializePlayerWins, 
  hasPlayerWonMatch,
  getWinsNeeded 
} from "@/lib/types/match"

interface UseMatchOptions {
  totalRounds: RoundCount
  playerIds: string[]
  onRoundEnd?: (winnerId: string, loserId: string) => void
  onMatchEnd?: (winnerId: string) => void
  onRoundStart?: (roundNumber: number) => void
}

interface UseMatchReturn {
  // State
  matchState: MatchState
  playerStates: Map<string, PlayerMatchState>
  
  // Computed
  currentRound: number
  totalRounds: RoundCount
  winsNeeded: number
  isMatchFinished: boolean
  matchWinnerId: string | null
  roundStatus: MatchState["roundStatus"]
  
  // Actions
  startRound: () => void
  endRound: (winnerId: string, loserId: string) => void
  eliminatePlayer: (playerId: string) => void
  resetRound: () => void
  resetMatch: () => void
  
  // Helpers
  getPlayerWins: (playerId: string) => number
  isPlayerActive: (playerId: string) => boolean
  isPlayerEliminated: (playerId: string) => boolean
  getActivePlayerIds: () => string[]
}

export function useMatch({
  totalRounds,
  playerIds,
  onRoundEnd,
  onMatchEnd,
  onRoundStart,
}: UseMatchOptions): UseMatchReturn {
  const [matchState, setMatchState] = useState<MatchState>(() => {
    const state = createInitialMatchState(totalRounds)
    state.playerWins = initializePlayerWins(playerIds)
    return state
  })
  
  const [playerStates, setPlayerStates] = useState<Map<string, PlayerMatchState>>(() => {
    const states = new Map<string, PlayerMatchState>()
    playerIds.forEach(id => {
      states.set(id, {
        playerId: id,
        isActive: true,
        isEliminated: false,
        wins: 0,
        isMatchWinner: false,
      })
    })
    return states
  })
  
  // Refs for callbacks to avoid stale closures
  const onRoundEndRef = useRef(onRoundEnd)
  const onMatchEndRef = useRef(onMatchEnd)
  const onRoundStartRef = useRef(onRoundStart)
  
  useEffect(() => {
    onRoundEndRef.current = onRoundEnd
    onMatchEndRef.current = onMatchEnd
    onRoundStartRef.current = onRoundStart
  }, [onRoundEnd, onMatchEnd, onRoundStart])

  const winsNeeded = getWinsNeeded(totalRounds)

  // Start a new round
  const startRound = useCallback(() => {
    setMatchState(prev => ({
      ...prev,
      roundStatus: "active",
      roundWinnerId: null,
      roundLoserId: null,
      roundStartedAt: Date.now(),
      roundEndedAt: null,
    }))
    
    // Reset all players to active for new round
    setPlayerStates(prev => {
      const newStates = new Map(prev)
      newStates.forEach((state, id) => {
        newStates.set(id, {
          ...state,
          isActive: true,
          isEliminated: false,
        })
      })
      return newStates
    })
    
    onRoundStartRef.current?.(matchState.currentRound)
  }, [matchState.currentRound])

  // End current round with a winner
  const endRound = useCallback((winnerId: string, loserId: string) => {
    setMatchState(prev => {
      const newWins = { ...prev.playerWins }
      newWins[winnerId] = (newWins[winnerId] || 0) + 1
      
      const playerWonMatch = hasPlayerWonMatch(newWins[winnerId], totalRounds)
      
      const newState: MatchState = {
        ...prev,
        playerWins: newWins,
        roundStatus: "finished",
        roundWinnerId: winnerId,
        roundLoserId: loserId,
        roundEndedAt: Date.now(),
        matchWinnerId: playerWonMatch ? winnerId : null,
        matchStatus: playerWonMatch ? "finished" : "active",
      }
      
      // Callbacks
      onRoundEndRef.current?.(winnerId, loserId)
      
      if (playerWonMatch) {
        onMatchEndRef.current?.(winnerId)
      }
      
      return newState
    })
    
    // Update player states
    setPlayerStates(prev => {
      const newStates = new Map(prev)
      
      // Update winner
      const winnerState = newStates.get(winnerId)
      if (winnerState) {
        const newWins = winnerState.wins + 1
        newStates.set(winnerId, {
          ...winnerState,
          wins: newWins,
          isMatchWinner: hasPlayerWonMatch(newWins, totalRounds),
        })
      }
      
      // Mark loser as eliminated for this round
      const loserState = newStates.get(loserId)
      if (loserState) {
        newStates.set(loserId, {
          ...loserState,
          isEliminated: true,
          isActive: false,
        })
      }
      
      return newStates
    })
  }, [totalRounds])

  // Eliminate a player (for games with multiple eliminations per round)
  const eliminatePlayer = useCallback((playerId: string) => {
    setPlayerStates(prev => {
      const newStates = new Map(prev)
      const state = newStates.get(playerId)
      if (state) {
        newStates.set(playerId, {
          ...state,
          isEliminated: true,
          isActive: false,
        })
      }
      return newStates
    })
  }, [])

  // Reset for next round (without changing wins)
  const resetRound = useCallback(() => {
    setMatchState(prev => ({
      ...prev,
      currentRound: prev.currentRound + 1,
      roundStatus: "waiting",
      roundWinnerId: null,
      roundLoserId: null,
      roundStartedAt: null,
      roundEndedAt: null,
    }))
    
    // Reset elimination status for all players
    setPlayerStates(prev => {
      const newStates = new Map(prev)
      newStates.forEach((state, id) => {
        newStates.set(id, {
          ...state,
          isActive: true,
          isEliminated: false,
        })
      })
      return newStates
    })
  }, [])

  // Full reset for new match
  const resetMatch = useCallback(() => {
    setMatchState({
      ...createInitialMatchState(totalRounds),
      playerWins: initializePlayerWins(playerIds),
    })
    
    setPlayerStates(() => {
      const states = new Map<string, PlayerMatchState>()
      playerIds.forEach(id => {
        states.set(id, {
          playerId: id,
          isActive: true,
          isEliminated: false,
          wins: 0,
          isMatchWinner: false,
        })
      })
      return states
    })
  }, [totalRounds, playerIds])

  // Helper functions
  const getPlayerWins = useCallback((playerId: string): number => {
    return matchState.playerWins[playerId] || 0
  }, [matchState.playerWins])

  const isPlayerActive = useCallback((playerId: string): boolean => {
    return playerStates.get(playerId)?.isActive ?? false
  }, [playerStates])

  const isPlayerEliminated = useCallback((playerId: string): boolean => {
    return playerStates.get(playerId)?.isEliminated ?? false
  }, [playerStates])

  const getActivePlayerIds = useCallback((): string[] => {
    const active: string[] = []
    playerStates.forEach((state, id) => {
      if (state.isActive && !state.isEliminated) {
        active.push(id)
      }
    })
    return active
  }, [playerStates])

  return {
    matchState,
    playerStates,
    currentRound: matchState.currentRound,
    totalRounds: matchState.totalRounds,
    winsNeeded,
    isMatchFinished: matchState.matchStatus === "finished",
    matchWinnerId: matchState.matchWinnerId,
    roundStatus: matchState.roundStatus,
    startRound,
    endRound,
    eliminatePlayer,
    resetRound,
    resetMatch,
    getPlayerWins,
    isPlayerActive,
    isPlayerEliminated,
    getActivePlayerIds,
  }
}
