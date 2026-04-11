"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"
import type { RoundCount } from "@/lib/types/match"
import { getWinsNeeded } from "@/lib/types/match"

// Button position within a normalized 0-100 coordinate system
export interface ButtonPosition {
  x: number  // 0-100 (percentage of play area width)
  y: number  // 0-100 (percentage of play area height)
}

// Shared game state for Hidden Button
export interface HiddenButtonState {
  // Match state
  matchStatus: "waiting" | "countdown" | "active" | "roundEnd" | "matchEnd"
  currentRound: number
  totalRounds: RoundCount
  playerWins: Record<string, number>
  
  // Round state
  buttonPosition: ButtonPosition | null  // Shared button position
  roundStartedAt: number | null          // Unix timestamp when round became active
  roundDuration: number                  // Round time limit in seconds (e.g., 10s)
  roundWinnerId: string | null
  matchWinnerId: string | null
  
  // Countdown state
  countdownEndsAt: number | null
  
  // Meta for conflict resolution
  lastUpdatedBy: string | null
  lastUpdatedAt: number
  version: number
}

export interface UseHiddenButtonStateOptions {
  roomId: string
  playerId: string | null
  isHost: boolean
  totalRounds: RoundCount
  playerIds: string[]
}

interface UseHiddenButtonStateReturn {
  gameState: HiddenButtonState | null
  isLoading: boolean
  error: string | null
  
  // Actions
  clickButton: () => Promise<void>
  startNextRound: () => Promise<void>
  endMatch: (winnerId: string) => Promise<void>
  
  // Computed
  timeRemaining: number
  countdownRemaining: number
}

const ROUND_DURATION = 10  // 10 seconds to find and click the button
const COUNTDOWN_DURATION = 3
const BETWEEN_ROUNDS_DELAY = 2000  // 2 second delay between rounds

// Generate a random button position (avoiding edges)
function generateButtonPosition(): ButtonPosition {
  // Keep button away from edges (10% margin on each side)
  const margin = 15
  return {
    x: margin + Math.random() * (100 - 2 * margin),
    y: margin + Math.random() * (100 - 2 * margin),
  }
}

function createInitialHiddenButtonState(totalRounds: RoundCount, playerIds: string[]): HiddenButtonState {
  const playerWins: Record<string, number> = {}
  playerIds.forEach(id => { playerWins[id] = 0 })
  
  return {
    matchStatus: "waiting",
    currentRound: 1,
    totalRounds,
    playerWins,
    buttonPosition: null,
    roundStartedAt: null,
    roundDuration: ROUND_DURATION,
    roundWinnerId: null,
    matchWinnerId: null,
    countdownEndsAt: null,
    lastUpdatedBy: null,
    lastUpdatedAt: Date.now(),
    version: 0,
  }
}

export function useHiddenButtonState({
  roomId,
  playerId,
  isHost,
  totalRounds,
  playerIds,
}: UseHiddenButtonStateOptions): UseHiddenButtonStateReturn {
  const [gameState, setGameState] = useState<HiddenButtonState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(ROUND_DURATION)
  const [countdownRemaining, setCountdownRemaining] = useState(COUNTDOWN_DURATION)
  
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabaseRef = useRef(createClient())
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const countdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const roundEndTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const playerIdsRef = useRef(playerIds)
  const roundEndScheduledRef = useRef<number>(0)
  
  const winsNeeded = getWinsNeeded(totalRounds)

  // Keep playerIds ref updated
  useEffect(() => {
    playerIdsRef.current = playerIds
  }, [playerIds])

  // Save game state to database and broadcast
  const saveGameState = useCallback(async (newState: HiddenButtonState) => {
    try {
      await supabaseRef.current
        .from("rooms")
        .update({
          settings: {
            totalRounds: newState.totalRounds,
            gameState: newState,
          },
        })
        .eq("id", roomId)
      
      channelRef.current?.send({
        type: "broadcast",
        event: "game_state",
        payload: newState,
      }, { httpSend: true })
    } catch (err) {
      console.error("[v0] Failed to save game state:", err)
    }
  }, [roomId])

  // Fetch initial game state
  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        const { data: room, error: fetchError } = await supabaseRef.current
          .from("rooms")
          .select("settings")
          .eq("id", roomId)
          .single()
        
        if (fetchError) throw fetchError
        
        const savedState = room?.settings?.gameState as HiddenButtonState | undefined
        
        if (savedState && savedState.version > 0) {
          setGameState(savedState)
          
          // If state is already in countdown (set by start API), host schedules transition to active
          if (isHost && savedState.matchStatus === "countdown" && savedState.countdownEndsAt) {
            const timeUntilActive = Math.max(0, savedState.countdownEndsAt - Date.now())
            
            if (countdownTimeoutRef.current) {
              clearTimeout(countdownTimeoutRef.current)
            }
            
            countdownTimeoutRef.current = setTimeout(async () => {
              // Generate shared button position
              const buttonPosition = generateButtonPosition()
              
              const activeState: HiddenButtonState = {
                ...savedState,
                matchStatus: "active",
                buttonPosition,
                roundStartedAt: Date.now(),
                roundDuration: ROUND_DURATION,
                countdownEndsAt: null,
                lastUpdatedBy: playerId,
                lastUpdatedAt: Date.now(),
                version: savedState.version + 1,
              }
              
              setGameState(activeState)
              await saveGameState(activeState)
            }, timeUntilActive)
          }
        } else {
          // Fallback - start API normally sets this
          const initialState = createInitialHiddenButtonState(totalRounds, playerIds)
          setGameState(initialState)
          
          if (isHost) {
            await saveGameState(initialState)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load game state")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchInitialState()
  }, [roomId, totalRounds, playerIds, isHost, playerId, saveGameState])

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabaseRef.current.channel(`game:${roomId}`, {
      config: {
        broadcast: { self: true },
      },
    })
    
    channel
      .on("broadcast", { event: "game_state" }, ({ payload }) => {
        const newState = payload as HiddenButtonState
        
        setGameState(prev => {
          if (!prev || newState.version > prev.version) {
            return newState
          }
          return prev
        })
      })
      .subscribe()
    
    channelRef.current = channel
    
    return () => {
      channel.unsubscribe()
    }
  }, [roomId])

  // Timer countdown effect
  useEffect(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    
    if (!gameState) return
    
    // Handle countdown timer
    if (gameState.matchStatus === "countdown" && gameState.countdownEndsAt) {
      timerIntervalRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((gameState.countdownEndsAt! - Date.now()) / 1000))
        setCountdownRemaining(remaining)
      }, 100)
      return () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      }
    }
    
    // Handle round timer
    if (gameState.matchStatus === "active" && gameState.roundStartedAt) {
      timerIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - gameState.roundStartedAt!) / 1000
        const remaining = Math.max(0, Math.ceil(gameState.roundDuration - elapsed))
        setTimeRemaining(remaining)
      }, 100)
      return () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      }
    }
  }, [gameState?.matchStatus, gameState?.roundStartedAt, gameState?.countdownEndsAt, gameState?.roundDuration])

  // HOST ONLY: Handle round timeout (no one clicked in time)
  useEffect(() => {
    if (!isHost || !gameState) return
    if (gameState.matchStatus !== "active" || !gameState.roundStartedAt) return
    
    // Calculate when round times out
    const roundEndsAt = gameState.roundStartedAt + (gameState.roundDuration * 1000)
    const timeUntilTimeout = roundEndsAt - Date.now()
    
    if (timeUntilTimeout <= 0) return // Already timed out, handled elsewhere
    
    const timeoutId = setTimeout(async () => {
      // Check if round is still active (no winner yet)
      setGameState(prev => {
        if (!prev || prev.matchStatus !== "active" || prev.roundWinnerId) {
          return prev // Round already resolved
        }
        
        // Round timed out with no winner - proceed to next round with no score change
        const newState: HiddenButtonState = {
          ...prev,
          matchStatus: "roundEnd",
          roundWinnerId: null, // No winner this round
          buttonPosition: null,
          roundStartedAt: null,
          lastUpdatedBy: playerId,
          lastUpdatedAt: Date.now(),
          version: prev.version + 1,
        }
        
        saveGameState(newState)
        return newState
      })
    }, timeUntilTimeout)
    
    return () => clearTimeout(timeoutId)
  }, [isHost, gameState?.matchStatus, gameState?.roundStartedAt, gameState?.roundDuration, playerId, saveGameState])

  // HOST ONLY: Handle round end -> next round or match end
  useEffect(() => {
    if (!isHost || !gameState || gameState.matchStatus !== "roundEnd") return
    
    // Guard: Only schedule once per round
    if (roundEndScheduledRef.current >= gameState.currentRound) {
      return
    }
    roundEndScheduledRef.current = gameState.currentRound
    
    const winnerId = gameState.roundWinnerId
    const winnerWins = winnerId ? (gameState.playerWins[winnerId] || 0) : 0
    const matchIsOver = winnerId && winnerWins >= winsNeeded
    
    if (roundEndTimeoutRef.current) {
      clearTimeout(roundEndTimeoutRef.current)
    }
    
    roundEndTimeoutRef.current = setTimeout(async () => {
      if (matchIsOver && winnerId) {
        // Match is over - update game state
        const matchEndState: HiddenButtonState = {
          ...gameState,
          matchStatus: "matchEnd",
          matchWinnerId: winnerId,
          lastUpdatedBy: playerId,
          lastUpdatedAt: Date.now(),
          version: gameState.version + 1,
        }
        
        setGameState(matchEndState)
        await saveGameState(matchEndState)
        
        // Update room status to finished (critical for room lifecycle)
        await supabaseRef.current
          .from("rooms")
          .update({ 
            status: "finished", 
            finished_at: new Date().toISOString() 
          })
          .eq("id", roomId)
      } else {
        // Start next round
        const countdownEndsAt = Date.now() + (COUNTDOWN_DURATION * 1000)
        
        setGameState(prev => {
          if (!prev) return prev
          const newState: HiddenButtonState = {
            ...prev,
            currentRound: prev.currentRound + 1,
            matchStatus: "countdown",
            countdownEndsAt,
            buttonPosition: null,
            roundStartedAt: null,
            roundWinnerId: null,
            lastUpdatedBy: playerId,
            lastUpdatedAt: Date.now(),
            version: prev.version + 1,
          }
          saveGameState(newState)
          return newState
        })
        
        // Schedule transition to active
        if (countdownTimeoutRef.current) {
          clearTimeout(countdownTimeoutRef.current)
        }
        
        countdownTimeoutRef.current = setTimeout(async () => {
          const buttonPosition = generateButtonPosition()
          
          setGameState(prev => {
            if (!prev) return prev
            const newState: HiddenButtonState = {
              ...prev,
              matchStatus: "active",
              buttonPosition,
              roundStartedAt: Date.now(),
              countdownEndsAt: null,
              lastUpdatedBy: playerId,
              lastUpdatedAt: Date.now(),
              version: prev.version + 1,
            }
            saveGameState(newState)
            return newState
          })
        }, COUNTDOWN_DURATION * 1000)
      }
    }, BETWEEN_ROUNDS_DELAY)
  }, [isHost, gameState?.matchStatus, gameState?.roundWinnerId, gameState?.playerWins, gameState?.currentRound, winsNeeded, playerId, roomId, saveGameState])

  // Click button action - first valid click wins
  const clickButton = useCallback(async () => {
    if (!playerId || !gameState) return
    
    // Validate: only during active round
    if (gameState.matchStatus !== "active") return
    
    // Validate: round not already resolved
    if (gameState.roundWinnerId) return
    
    // Validate: button must exist
    if (!gameState.buttonPosition) return
    
    // Validate: round not timed out
    if (gameState.roundStartedAt) {
      const elapsed = (Date.now() - gameState.roundStartedAt) / 1000
      if (elapsed >= gameState.roundDuration) return
    }
    
    // This player clicked first - they win the round
    setGameState(prev => {
      if (!prev) return prev
      
      // Double-check: if already resolved, don't process again
      if (prev.roundWinnerId || prev.matchStatus !== "active") {
        return prev
      }
      
      const newWins = { ...prev.playerWins }
      newWins[playerId] = (newWins[playerId] || 0) + 1
      
      const newState: HiddenButtonState = {
        ...prev,
        matchStatus: "roundEnd",
        roundWinnerId: playerId,
        playerWins: newWins,
        buttonPosition: null, // Hide button after click
        roundStartedAt: null,
        lastUpdatedBy: playerId,
        lastUpdatedAt: Date.now(),
        version: prev.version + 1,
      }
      
      saveGameState(newState)
      return newState
    })
  }, [playerId, gameState, saveGameState])

  // Start next round (manual fallback - normally automatic)
  const startNextRound = useCallback(async () => {
    if (!isHost) return
    
    const countdownEndsAt = Date.now() + (COUNTDOWN_DURATION * 1000)
    
    setGameState(prev => {
      if (!prev) return prev
      const newState: HiddenButtonState = {
        ...prev,
        currentRound: prev.currentRound + 1,
        matchStatus: "countdown",
        countdownEndsAt,
        buttonPosition: null,
        roundStartedAt: null,
        roundWinnerId: null,
        lastUpdatedBy: playerId,
        lastUpdatedAt: Date.now(),
        version: prev.version + 1,
      }
      saveGameState(newState)
      return newState
    })
    
    if (countdownTimeoutRef.current) {
      clearTimeout(countdownTimeoutRef.current)
    }
    
    countdownTimeoutRef.current = setTimeout(async () => {
      const buttonPosition = generateButtonPosition()
      
      setGameState(prev => {
        if (!prev) return prev
        const newState: HiddenButtonState = {
          ...prev,
          matchStatus: "active",
          buttonPosition,
          roundStartedAt: Date.now(),
          countdownEndsAt: null,
          lastUpdatedBy: playerId,
          lastUpdatedAt: Date.now(),
          version: prev.version + 1,
        }
        saveGameState(newState)
        return newState
      })
    }, COUNTDOWN_DURATION * 1000)
  }, [isHost, playerId, saveGameState])

  // End match (manual fallback)
  const endMatch = useCallback(async (winnerId: string) => {
    if (!isHost) return
    
    setGameState(prev => {
      if (!prev) return prev
      const newState: HiddenButtonState = {
        ...prev,
        matchStatus: "matchEnd",
        matchWinnerId: winnerId,
        lastUpdatedBy: playerId,
        lastUpdatedAt: Date.now(),
        version: prev.version + 1,
      }
      saveGameState(newState)
      return newState
    })
    
    await supabaseRef.current
      .from("rooms")
      .update({ status: "finished", finished_at: new Date().toISOString() })
      .eq("id", roomId)
  }, [isHost, playerId, roomId, saveGameState])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      if (countdownTimeoutRef.current) clearTimeout(countdownTimeoutRef.current)
      if (roundEndTimeoutRef.current) clearTimeout(roundEndTimeoutRef.current)
    }
  }, [])

  return {
    gameState,
    isLoading,
    error,
    clickButton,
    startNextRound,
    endMatch,
    timeRemaining,
    countdownRemaining,
  }
}
