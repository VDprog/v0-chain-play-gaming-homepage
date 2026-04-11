"use client"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CircleDot, Timer, Trophy, Loader2, Target, Clock } from "lucide-react"
import type { RoomWithPlayers } from "@/lib/types/room"
import type { PlayerWithStats } from "@/lib/types/player"
import type { RoundCount } from "@/lib/types/match"
import { useHiddenButtonState } from "@/hooks/use-hidden-button-state"
import { getWinsNeeded } from "@/lib/types/match"

interface HiddenButtonGameProps {
  room: RoomWithPlayers
  player: PlayerWithStats | null
  isSpectator: boolean
}

export function HiddenButtonGame({ room, player, isSpectator }: HiddenButtonGameProps) {
  // Get settings from room
  const totalRounds = (room.settings?.totalRounds as RoundCount) || 1
  const activePlayers = room.players.filter(p => p.role !== "spectator")
  const playerIds = activePlayers.map(p => p.id)
  
  // Check if current player is the host
  const currentPlayerInRoom = player ? room.players.find(p => p.id === player.id) : null
  const isHost = currentPlayerInRoom?.role === "host"
  
  const winsNeeded = getWinsNeeded(totalRounds)
  
  // Play area ref for calculating button position
  const playAreaRef = useRef<HTMLDivElement>(null)
  
  // Shared game state
  const {
    gameState,
    isLoading,
    error,
    clickButton,
    timeRemaining,
    countdownRemaining,
  } = useHiddenButtonState({
    roomId: room.id,
    playerId: player?.id || null,
    isHost,
    totalRounds,
    playerIds,
  })

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
  const matchWinnerId = gameState.matchWinnerId
  const buttonPosition = gameState.buttonPosition

  // Get urgency level for timer display
  const getUrgencyLevel = (time: number): "normal" | "warning" | "critical" => {
    if (time > 5) return "normal"
    if (time > 2) return "warning"
    return "critical"
  }
  
  const urgencyLevel = getUrgencyLevel(timeRemaining)

  return (
    <div className="h-full flex flex-col">
      {/* Game Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <CircleDot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Hidden Button</h2>
            <p className="text-xs text-muted-foreground">
              {totalRounds === 1 ? "Single Round" : `Best of ${totalRounds}`}
            </p>
          </div>
        </div>
        
        {/* Round & Timer Display */}
        <div className="flex items-center gap-4">
          {totalRounds > 1 && (
            <div className="text-right">
              <p className="text-sm font-medium">Round {currentRound} of {totalRounds}</p>
              <p className="text-xs text-muted-foreground">First to {winsNeeded} wins</p>
            </div>
          )}
          
          {/* Timer during active round */}
          {gamePhase === "active" && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              urgencyLevel === "normal" ? "bg-muted" :
              urgencyLevel === "warning" ? "bg-amber-100 text-amber-700" :
              "bg-red-100 text-red-700 animate-pulse"
            }`}>
              <Timer className="h-4 w-4" />
              <span className={`font-mono font-bold text-xl tabular-nums ${
                urgencyLevel === "critical" ? "animate-bounce" : ""
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
      <div className="flex-1 flex items-center justify-center p-4">
        {/* Countdown State */}
        {gamePhase === "countdown" && (
          <div className="text-center">
            <div className="w-40 h-40 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <span className="text-6xl font-bold text-primary">{countdownRemaining}</span>
            </div>
            <h3 className="text-2xl font-bold">Get Ready!</h3>
            <p className="text-muted-foreground mt-2">Find and click the button first!</p>
          </div>
        )}

        {/* Active Round - Play Area */}
        {gamePhase === "active" && (
          <div className="w-full max-w-3xl">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">
                {isSpectator ? "Watching the action..." : "Click the button first to win!"}
              </p>
            </div>
            
            {/* Play Area Container */}
            <div 
              ref={playAreaRef}
              className="relative w-full aspect-[4/3] rounded-xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-muted/50 to-muted overflow-hidden"
              style={{ minHeight: "400px" }}
            >
              {/* The Target Button */}
              {buttonPosition && (
                <Button
                  onClick={() => {
                    if (!isSpectator) {
                      clickButton()
                    }
                  }}
                  disabled={isSpectator}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full w-16 h-16 p-0 shadow-lg transition-all hover:scale-110 active:scale-95 ${
                    isSpectator ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                  } ${
                    urgencyLevel === "critical" ? "animate-pulse bg-red-500 hover:bg-red-600" : 
                    urgencyLevel === "warning" ? "bg-amber-500 hover:bg-amber-600" :
                    "bg-primary hover:bg-primary/90"
                  }`}
                  style={{
                    left: `${buttonPosition.x}%`,
                    top: `${buttonPosition.y}%`,
                  }}
                >
                  <Target className="h-8 w-8 text-white" />
                </Button>
              )}
              
              {/* Play Area Instructions */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center opacity-20">
                  <CircleDot className="h-20 w-20 mx-auto mb-2" />
                  <p className="text-lg font-medium">Play Area</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Round End State */}
        {gamePhase === "roundEnd" && (
          <div className="text-center">
            {roundWinner ? (
              <>
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
              </>
            ) : (
              <>
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                  <Clock className="h-16 w-16 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Time&apos;s Up!</h3>
                <p className="text-muted-foreground">No one clicked in time. Next round starting...</p>
              </>
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
