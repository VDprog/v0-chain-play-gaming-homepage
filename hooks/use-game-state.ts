"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"
import type { RoundCount } from "@/lib/types/match"
import { getWinsNeeded } from "@/lib/types/match"

// Shared game state that all players in a room see
export interface SharedGameState {
  // Match state
  matchStatus: "waiting" | "countdown" | "playing" | "roundEnd" | "matchEnd"
  currentRound: number
  totalRounds: RoundCount
  playerWins: Record<string, number>
  
  // Round state
  bombHolderId: string | null
  timerStartedAt: number | null  // Unix timestamp when timer started
  timerDuration: number          // Timer duration in seconds
  eliminatedThisRound: string[]
  roundWinnerId: string | null
  roundLoserId: string | null
  matchWinnerId: string | null
  
  // Countdown state
  countdownEndsAt: number | null  // Unix timestamp when countdown ends
  
  // Meta
  lastUpdatedBy: string | null
  lastUpdatedAt: number
  version: number  // Increment on each update for conflict resolution
}

export interface UseGameStateOptions {
  roomId: string
  playerId: string | null
  isHost: boolean
  totalRounds: RoundCount
  playerIds: string[]
}

interface UseGameStateReturn {
  gameState: SharedGameState | null
  isLoading: boolean
  error: string | null
  
  // Actions (only host can perform most of these)
  startCountdown: () => Promise<void>
  passBomb: (targetId: string) => Promise<void>
  
  // Host-only actions
  setBombHolder: (holderId: string) => Promise<void>
  endRound: (winnerId: string, loserId: string) => Promise<void>
  startNextRound: () => Promise<void>
  endMatch: (winnerId: string) => Promise<void>
  
  // Computed
  timeRemaining: number
  countdownRemaining: number
}

const INITIAL_TIMER_DURATION = 15
const COUNTDOWN_DURATION = 3

function createInitialGameState(totalRounds: RoundCount, playerIds: string[]): SharedGameState {
  const playerWins: Record<string, number> = {}
  playerIds.forEach(id => { playerWins[id] = 0 })
  
  return {
    matchStatus: "waiting",
    currentRound: 1,
    totalRounds,
    playerWins,
    bombHolderId: null,
    timerStartedAt: null,
    timerDuration: INITIAL_TIMER_DURATION,
    eliminatedThisRound: [],
    roundWinnerId: null,
    roundLoserId: null,
    matchWinnerId: null,
    countdownEndsAt: null,
    lastUpdatedBy: null,
    lastUpdatedAt: Date.now(),
    version: 0,
  }
}

export function useGameState({
  roomId,
  playerId,
  isHost,
  totalRounds,
  playerIds,
}: UseGameStateOptions): UseGameStateReturn {
  const [gameState, setGameState] = useState<SharedGameState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(INITIAL_TIMER_DURATION)
  const [countdownRemaining, setCountdownRemaining] = useState(COUNTDOWN_DURATION)
  
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabaseRef = useRef(createClient())
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const countdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const playerIdsRef = useRef(playerIds)
  
  // Keep playerIds ref updated
  useEffect(() => {
    playerIdsRef.current = playerIds
  }, [playerIds])
  
  const winsNeeded = getWinsNeeded(totalRounds)

  // Save game state to database and broadcast (defined early for use in init)
  const saveGameStateDirect = useCallback(async (newState: SharedGameState) => {
    try {
      // Save to database
      await supabaseRef.current
        .from("rooms")
        .update({
          settings: {
            totalRounds: newState.totalRounds,
            gameState: newState,
          },
        })
        .eq("id", roomId)
      
      // Broadcast to all clients
      channelRef.current?.send({
        type: "broadcast",
        event: "game_state",
        payload: newState,
      })
    } catch (err) {
      console.error("[v0] Failed to save game state:", err)
    }
  }, [roomId])

  // Fetch initial game state from room settings
  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        const { data: room, error: fetchError } = await supabaseRef.current
          .from("rooms")
          .select("settings")
          .eq("id", roomId)
          .single()
        
        if (fetchError) throw fetchError
        
        const savedState = room?.settings?.gameState as SharedGameState | undefined
        
        if (savedState && savedState.version > 0) {
          setGameState(savedState)
        } else {
          // Initialize new game state
          const initialState = createInitialGameState(totalRounds, playerIds)
          setGameState(initialState)
          
          // Host saves initial state
          if (isHost) {
            await saveGameStateDirect(initialState)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load game state")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchInitialState()
  }, [roomId, totalRounds, playerIds, isHost, saveGameStateDirect])

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabaseRef.current.channel(`game:${roomId}`, {
      config: {
        broadcast: { self: true },
      },
    })
    
    channel
      .on("broadcast", { event: "game_state" }, ({ payload }) => {
        const newState = payload as SharedGameState
        
        setGameState(prev => {
          // Only accept updates with higher version numbers
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
    
    // Handle game timer
    if (gameState.matchStatus === "playing" && gameState.timerStartedAt) {
      timerIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - gameState.timerStartedAt!) / 1000
        const remaining = Math.max(0, Math.ceil(gameState.timerDuration - elapsed))
        setTimeRemaining(remaining)
      }, 100)
      return () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      }
    }
  }, [gameState?.matchStatus, gameState?.timerStartedAt, gameState?.countdownEndsAt, gameState?.timerDuration])

  // Save game state to database and broadcast
  const saveGameState = useCallback(async (newState: SharedGameState) => {
    try {
      // Save to database
      await supabaseRef.current
        .from("rooms")
        .update({
          settings: {
            totalRounds: newState.totalRounds,
            gameState: newState,
          },
        })
        .eq("id", roomId)
      
      // Broadcast to all clients
      channelRef.current?.send({
        type: "broadcast",
        event: "game_state",
        payload: newState,
      })
    } catch (err) {
      console.error("[v0] Failed to save game state:", err)
    }
  }, [roomId])

  // Update game state (used internally)
  const updateGameState = useCallback(async (
    updater: (prev: SharedGameState) => SharedGameState
  ) => {
    setGameState(prev => {
      if (!prev) return prev
      
      const newState: SharedGameState = {
        ...updater(prev),
        lastUpdatedBy: playerId,
        lastUpdatedAt: Date.now(),
        version: prev.version + 1,
      }
      
      // Save and broadcast asynchronously
      saveGameState(newState)
      
      return newState
    })
  }, [playerId, saveGameState])

  // Start countdown (host only)
  const startCountdown = useCallback(async () => {
    if (!isHost) return
    
    const countdownEndsAt = Date.now() + (COUNTDOWN_DURATION * 1000)
    
    await updateGameState(prev => ({
      ...prev,
      matchStatus: "countdown",
      countdownEndsAt,
      eliminatedThisRound: [],
      roundWinnerId: null,
      roundLoserId: null,
    }))
    
    // Clear any existing countdown timeout
    if (countdownTimeoutRef.current) {
      clearTimeout(countdownTimeoutRef.current)
    }
    
    // Host schedules transition to playing after countdown
    countdownTimeoutRef.current = setTimeout(async () => {
      // Use the ref to get current playerIds (avoids stale closure)
      const currentPlayerIds = playerIdsRef.current
      // Pick random bomb holder from all players (new round = no one eliminated yet)
      const randomHolder = currentPlayerIds[Math.floor(Math.random() * currentPlayerIds.length)]
      
      await updateGameState(prev => ({
        ...prev,
        matchStatus: "playing",
        bombHolderId: randomHolder,
        timerStartedAt: Date.now(),
        timerDuration: INITIAL_TIMER_DURATION,
        countdownEndsAt: null,
      }))
    }, COUNTDOWN_DURATION * 1000)
  }, [isHost, updateGameState])

  // Pass bomb to another player (any player can do this if they have the bomb)
  const passBomb = useCallback(async (targetId: string) => {
    if (!playerId || !gameState) return
    
    // Validate: can only pass if current player has the bomb
    if (gameState.bombHolderId !== playerId) return
    
    // Validate: can't pass to eliminated player
    if (gameState.eliminatedThisRound.includes(targetId)) return
    
    // Validate: can't pass to self
    if (targetId === playerId) return
    
    await updateGameState(prev => ({
      ...prev,
      bombHolderId: targetId,
    }))
  }, [playerId, gameState, updateGameState])

  // Set bomb holder (host only - used for random selection)
  const setBombHolder = useCallback(async (holderId: string) => {
    if (!isHost) return
    
    await updateGameState(prev => ({
      ...prev,
      bombHolderId: holderId,
    }))
  }, [isHost, updateGameState])

  // End round (host only)
  const endRound = useCallback(async (winnerId: string, loserId: string) => {
    if (!isHost || !gameState) return
    
    const newWins = { ...gameState.playerWins }
    newWins[winnerId] = (newWins[winnerId] || 0) + 1
    
    const matchIsOver = newWins[winnerId] >= winsNeeded
    
    await updateGameState(prev => ({
      ...prev,
      matchStatus: "roundEnd",
      playerWins: newWins,
      roundWinnerId: winnerId,
      roundLoserId: loserId,
      eliminatedThisRound: [...prev.eliminatedThisRound, loserId],
      matchWinnerId: matchIsOver ? winnerId : null,
      timerStartedAt: null,
    }))
  }, [isHost, gameState, winsNeeded, updateGameState])

  // Start next round (host only)
  const startNextRound = useCallback(async () => {
    if (!isHost || !gameState) return
    
    await updateGameState(prev => ({
      ...prev,
      currentRound: prev.currentRound + 1,
      matchStatus: "waiting",
      eliminatedThisRound: [],
      roundWinnerId: null,
      roundLoserId: null,
      bombHolderId: null,
      timerStartedAt: null,
    }))
  }, [isHost, gameState, updateGameState])

  // End match (host only)
  const endMatch = useCallback(async (winnerId: string) => {
    if (!isHost) return
    
    await updateGameState(prev => ({
      ...prev,
      matchStatus: "matchEnd",
      matchWinnerId: winnerId,
    }))
    
    // Also update room status
    await supabaseRef.current
      .from("rooms")
      .update({ status: "finished", finished_at: new Date().toISOString() })
      .eq("id", roomId)
  }, [isHost, updateGameState, roomId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      if (countdownTimeoutRef.current) clearTimeout(countdownTimeoutRef.current)
    }
  }, [])

  return {
    gameState,
    isLoading,
    error,
    startCountdown,
    passBomb,
    setBombHolder,
    endRound,
    startNextRound,
    endMatch,
    timeRemaining,
    countdownRemaining,
  }
}
