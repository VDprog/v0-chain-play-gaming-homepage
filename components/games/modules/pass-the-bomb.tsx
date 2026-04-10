"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bomb, Timer, Trophy, Skull, ArrowRight, Loader2 } from "lucide-react"
import type { RoomWithPlayers } from "@/lib/types/room"
import type { PlayerWithStats } from "@/lib/types/player"
import type { RoundCount } from "@/lib/types/match"
import { useGameState } from "@/hooks/use-game-state"
import { getWinsNeeded } from "@/lib/types/match"

interface PassTheBombGameProps {
  room: RoomWithPlayers
  player: PlayerWithStats | null
  isSpectator: boolean
}

// Game constants
const BETWEEN_ROUNDS_DELAY = 3000

// Danger levels based on time remaining
function getDangerLevel(timeLeft: number): "calm" | "warning" | "danger" | "critical" {
  if (timeLeft > 10) return "calm"
  if (timeLeft > 5) return "warning"
  if (timeLeft > 2) return "danger"
  return "critical"
}

export function PassTheBombGame({ room, player, isSpectator }: PassTheBombGameProps) {
  // Get settings from room
  const totalRounds = (room.settings?.totalRounds as RoundCount) || 1
  const activePlayers = room.players.filter(p => p.role !== "spectator")
  const playerIds = activePlayers.map(p => p.id)
  
  // Check if current player is the host (authoritative source)
  const currentPlayerInRoom = player ? room.players.find(p => p.id === player.id) : null
  const isHost = currentPlayerInRoom?.role === "host"
  
  const winsNeeded = getWinsNeeded(totalRounds)
  
  // Track refs for host-side timer management
  const timerCheckRef = useRef<NodeJS.Timeout | null>(null)
  const roundEndTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const autoStartedRef = useRef(false)
  const roundEndScheduledRef = useRef<number>(0) // Track which round's end has been scheduled
  
  // Shared game state - synchronized across all players
  const {
    gameState,
    isLoading,
    error,
    startCountdown,
    passBomb,
    endRound,
    startNextRound,
    endMatch,
    timeRemaining,
    countdownRemaining,
  } = useGameState({
    roomId: room.id,
    playerId: player?.id || null,
    isHost,
    totalRounds,
    playerIds,
  })

  // Ref to avoid stale closure in interval callbacks
  const gameStateRef = useRef(gameState)
  
  // Keep gameStateRef updated to avoid stale closures
  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  // Current player info
  const currentPlayerId = player?.id
  const hasBomb = currentPlayerId === gameState?.bombHolderId
  const isEliminated = currentPlayerId ? gameState?.eliminatedThisRound.includes(currentPlayerId) : false
  const canPass = hasBomb && gameState?.matchStatus === "playing" && !isSpectator && !isEliminated

  // Get bomb holder player info
  const bombHolder = gameState?.bombHolderId 
    ? activePlayers.find(p => p.id === gameState.bombHolderId) 
    : null
  
  // Get players still active this round
  const playersAliveThisRound = gameState 
    ? activePlayers.filter(p => !gameState.eliminatedThisRound.includes(p.id))
    : activePlayers

  // Get danger level for animations
  const dangerLevel = getDangerLevel(timeRemaining)

  // HOST ONLY: Auto-start countdown when game first loads and state is "waiting"
  // This handles the transition from lobby "Start Game" button to actual game start
  useEffect(() => {
    if (!isHost || !gameState || autoStartedRef.current) return
    
    // Only auto-start if we're in waiting state and this is round 1
    // This means the host just pressed "Start Game" in the lobby
    // Note: version >= 0 since initial state has version 0
    if (gameState.matchStatus === "waiting" && gameState.currentRound === 1) {
      autoStartedRef.current = true
      // Small delay to ensure all state is synced
      setTimeout(() => {
        startCountdown()
      }, 300)
    }
  }, [isHost, gameState?.matchStatus, gameState?.currentRound, startCountdown])

  // HOST ONLY: Monitor timer and handle round completion
  useEffect(() => {
    if (!isHost || !gameState) return
    
    // Clear any existing timer
    if (timerCheckRef.current) {
      clearInterval(timerCheckRef.current)
      timerCheckRef.current = null
    }
    
    // Only monitor during playing phase
    if (gameState.matchStatus !== "playing" || !gameState.timerStartedAt) return
    
    const timerStartedAt = gameState.timerStartedAt
    const timerDuration = gameState.timerDuration
    
    // Check timer every 100ms - use ref for current state to avoid stale closure
    timerCheckRef.current = setInterval(() => {
      const currentState = gameStateRef.current
      if (!currentState || currentState.matchStatus !== "playing") {
        clearInterval(timerCheckRef.current!)
        timerCheckRef.current = null
        return
      }
      
      const elapsed = (Date.now() - timerStartedAt) / 1000
      const remaining = timerDuration - elapsed
      
      if (remaining <= 0 && currentState.bombHolderId) {
        // Timer expired - bomb explodes!
        clearInterval(timerCheckRef.current!)
        timerCheckRef.current = null
        
        const loserId = currentState.bombHolderId
        const newEliminated = [...currentState.eliminatedThisRound, loserId]
        const stillAlive = activePlayers.filter(p => !newEliminated.includes(p.id))
        
        if (stillAlive.length === 1) {
          // Round winner determined
          const winnerId = stillAlive[0].id
          endRound(winnerId, loserId)
        }
        // If more than 1 player remaining, continue with next bomb holder
        // This would need additional logic for multi-player games
      }
    }, 100)
    
    return () => {
      if (timerCheckRef.current) {
        clearInterval(timerCheckRef.current)
      }
    }
  }, [isHost, gameState?.matchStatus, gameState?.timerStartedAt, activePlayers, endRound])

  // HOST ONLY: Handle round end -> next round or match end
  useEffect(() => {
    if (!isHost || !gameState || gameState.matchStatus !== "roundEnd") return
    
    const winnerId = gameState.roundWinnerId
    if (!winnerId) return
    
    // Guard: Only schedule once per round (prevents re-scheduling on every state update)
    if (roundEndScheduledRef.current >= gameState.currentRound) {
      return
    }
    
    // Mark this round as scheduled
    roundEndScheduledRef.current = gameState.currentRound
    
    const winnerWins = gameState.playerWins[winnerId] || 0
    const matchIsOver = winnerWins >= winsNeeded
    

    
    // Clear any existing timeout (shouldn't happen with guard, but safety)
    if (roundEndTimeoutRef.current) {
      clearTimeout(roundEndTimeoutRef.current)
    }
    
    roundEndTimeoutRef.current = setTimeout(async () => {
      if (matchIsOver) {
        await endMatch(winnerId)
      } else {
        // Start next round - automatically transitions to countdown
        await startNextRound()
      }
    }, BETWEEN_ROUNDS_DELAY)
  }, [isHost, gameState?.matchStatus, gameState?.roundWinnerId, gameState?.playerWins, gameState?.currentRound, winsNeeded, endMatch, startNextRound, totalRounds])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerCheckRef.current) clearInterval(timerCheckRef.current)
      if (roundEndTimeoutRef.current) clearTimeout(roundEndTimeoutRef.current)
    }
  }, [])

  // Handle start game button click
  const handleStartGame = async () => {
    if (isSpectator || !isHost) return
    await startCountdown()
  }

  // Handle passing the bomb
  const handlePassBomb = async (targetId: string) => {
    if (!canPass || targetId === currentPlayerId) return
    if (gameState?.eliminatedThisRound.includes(targetId)) return
    await passBomb(targetId)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading game state...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load game</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (!gameState) return null

  const gamePhase = gameState.matchStatus
  const currentRound = gameState.currentRound
  const roundWinner = gameState.roundWinnerId
  const roundLoser = gameState.roundLoserId
  const matchWinnerId = gameState.matchWinnerId

  return (
    <div className="h-full flex flex-col">
      {/* Game Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Bomb className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Pass the Bomb</h2>
            <p className="text-xs text-muted-foreground">
              {totalRounds === 1 ? "Single Round" : `Best of ${totalRounds}`}
            </p>
          </div>
        </div>
        
        {/* Round & Score Display */}
        <div className="flex items-center gap-4">
          {totalRounds > 1 && (
            <div className="text-right">
              <p className="text-sm font-medium">Round {currentRound} of {totalRounds}</p>
              <p className="text-xs text-muted-foreground">First to {winsNeeded} wins</p>
            </div>
          )}
          
          {/* Timer */}
          {gamePhase === "playing" && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              dangerLevel === "calm" ? "bg-muted" :
              dangerLevel === "warning" ? "bg-amber-100 text-amber-700" :
              dangerLevel === "danger" ? "bg-orange-100 text-orange-700" :
              "bg-red-100 text-red-700 animate-pulse"
            }`}>
              <Timer className="h-4 w-4" />
              <span className={`font-mono font-bold text-xl tabular-nums ${
                dangerLevel === "critical" ? "animate-bounce" : ""
              }`}>
                {timeRemaining}s
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Scoreboard (for multi-round games) */}
      {totalRounds > 1 && (
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center justify-center gap-6">
            {activePlayers.map(p => (
              <div key={p.id} className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={p.avatar_url || undefined} />
                  <AvatarFallback className="text-[10px]">{p.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{p.username}</span>
                <Badge variant="secondary" className="font-bold">
                  {gameState.playerWins[p.id] || 0}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        {/* Waiting State */}
        {gamePhase === "waiting" && (
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Bomb className="h-16 w-16 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {currentRound === 1 ? "Ready to Play?" : `Round ${currentRound}`}
            </h3>
            <p className="text-muted-foreground mb-6">
              {activePlayers.length} players ready
            </p>
            {!isSpectator && isHost && (
              <Button size="lg" onClick={handleStartGame} className="gap-2">
                <Bomb className="h-5 w-5" />
                Start Round
              </Button>
            )}
            {!isSpectator && !isHost && (
              <p className="text-muted-foreground">Waiting for host to start...</p>
            )}
          </div>
        )}

        {/* Countdown State */}
        {gamePhase === "countdown" && (
          <div className="text-center">
            <div className="w-40 h-40 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <span className="text-6xl font-bold text-primary">{countdownRemaining}</span>
            </div>
            <h3 className="text-2xl font-bold">Get Ready!</h3>
          </div>
        )}

        {/* Playing State */}
        {gamePhase === "playing" && (
          <div className="w-full max-w-2xl">
            {/* Bomb Holder Display */}
            <div className="text-center mb-8">
              {bombHolder && (
                <div className={`inline-block p-6 rounded-2xl transition-all ${
                  dangerLevel === "calm" ? "bg-muted" :
                  dangerLevel === "warning" ? "bg-amber-50" :
                  dangerLevel === "danger" ? "bg-orange-50" :
                  "bg-red-50"
                }`}>
                  <div className="relative inline-block">
                    <Avatar className={`h-24 w-24 ring-4 transition-all ${
                      dangerLevel === "calm" ? "ring-primary/50" :
                      dangerLevel === "warning" ? "ring-amber-500" :
                      dangerLevel === "danger" ? "ring-orange-500" :
                      "ring-red-500"
                    }`}>
                      <AvatarImage src={bombHolder.avatar_url || undefined} />
                      <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
                        {bombHolder.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Bomb Icon */}
                    <div className={`absolute -top-2 -right-2 p-2 rounded-full transition-all ${
                      dangerLevel === "calm" ? "bg-primary" :
                      dangerLevel === "warning" ? "bg-amber-500 animate-pulse" :
                      dangerLevel === "danger" ? "bg-orange-500 animate-bounce" :
                      "bg-red-500 animate-ping"
                    }`}>
                      <Bomb className={`h-5 w-5 text-white ${dangerLevel === "critical" ? "animate-spin" : ""}`} />
                    </div>
                  </div>
                  
                  <p className="mt-4 font-bold text-lg">{bombHolder.username}</p>
                  <p className="text-sm text-muted-foreground">has the bomb!</p>
                </div>
              )}
            </div>

            {/* Pass Targets */}
            {canPass && (
              <div>
                <p className="text-center text-sm text-muted-foreground mb-4">Pass the bomb to:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {playersAliveThisRound
                    .filter(p => p.id !== currentPlayerId)
                    .map(target => (
                      <Button
                        key={target.id}
                        variant="outline"
                        size="lg"
                        onClick={() => handlePassBomb(target.id)}
                        className={`gap-2 px-6 transition-all hover:scale-105 ${
                          dangerLevel === "critical" ? "border-red-300 hover:bg-red-50" : ""
                        }`}
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={target.avatar_url || undefined} />
                          <AvatarFallback className="text-[10px]">{target.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {target.username}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    ))}
                </div>
              </div>
            )}

            {/* Waiting for bomb holder to pass */}
            {!canPass && !hasBomb && gamePhase === "playing" && (
              <div className="text-center">
                <p className="text-muted-foreground">Waiting for {bombHolder?.username} to pass the bomb...</p>
              </div>
            )}

            {/* Eliminated Display */}
            {gameState.eliminatedThisRound.length > 0 && (
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground mb-2">Eliminated this round:</p>
                <div className="flex justify-center gap-2">
                  {activePlayers
                    .filter(p => gameState.eliminatedThisRound.includes(p.id))
                    .map(p => (
                      <div key={p.id} className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs">
                        <Skull className="h-3 w-3" />
                        {p.username}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Round End State */}
        {gamePhase === "roundEnd" && roundWinner && (
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
              <Trophy className="h-16 w-16 text-amber-500" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Round Winner!</h3>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Avatar className="h-12 w-12 ring-4 ring-amber-500">
                <AvatarImage src={activePlayers.find(p => p.id === roundWinner)?.avatar_url || undefined} />
                <AvatarFallback className="bg-amber-100 text-amber-700">
                  {activePlayers.find(p => p.id === roundWinner)?.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xl font-semibold">
                {activePlayers.find(p => p.id === roundWinner)?.username}
              </span>
            </div>
            <p className="text-muted-foreground">
              {(() => {
                const winnerWins = gameState.playerWins[roundWinner] || 0
                const matchIsOver = winnerWins >= winsNeeded
                return matchIsOver 
                  ? "Match complete!" 
                  : `Round ${currentRound + 1} starting soon...`
              })()}
            </p>
            
            {/* Show who got eliminated */}
            {roundLoser && (
              <div className="mt-4 flex items-center justify-center gap-2 text-red-600">
                <Skull className="h-4 w-4" />
                <span className="text-sm">
                  {activePlayers.find(p => p.id === roundLoser)?.username} eliminated
                </span>
              </div>
            )}
          </div>
        )}

        {/* Match End State */}
        {gamePhase === "matchEnd" && (() => {
          const finalWinnerId = matchWinnerId || roundWinner
          const finalWinnerPlayer = finalWinnerId ? activePlayers.find(p => p.id === finalWinnerId) : null
          
          if (!finalWinnerPlayer) return null
          
          return (
            <div className="text-center">
              <div className="w-40 h-40 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/30">
                <Trophy className="h-20 w-20 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-2">Match Winner!</h3>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Avatar className="h-16 w-16 ring-4 ring-amber-500">
                  <AvatarImage src={finalWinnerPlayer.avatar_url || undefined} />
                  <AvatarFallback className="text-xl bg-amber-100 text-amber-700">
                    {finalWinnerPlayer.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-2xl font-bold">{finalWinnerPlayer.username}</span>
              </div>
              
              {/* Final Score */}
              {totalRounds > 1 && (
                <div className="mt-6 inline-flex items-center gap-4 px-6 py-3 rounded-xl bg-muted">
                  {activePlayers.map((p, index) => (
                    <div key={p.id} className="flex items-center gap-2">
                      {index > 0 && <span className="text-2xl font-bold text-muted-foreground">-</span>}
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={p.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">{p.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-xl font-bold">{gameState.playerWins[p.id] || 0}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
