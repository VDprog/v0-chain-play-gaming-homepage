"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bomb, Timer, Trophy, Skull, ArrowRight, RotateCcw } from "lucide-react"
import type { RoomWithPlayers, RoomPlayer } from "@/lib/types/room"
import type { PlayerWithStats } from "@/lib/types/player"
import type { RoundCount } from "@/lib/types/match"
import { useMatch } from "@/hooks/use-match"
import { getWinsNeeded } from "@/lib/types/match"

interface PassTheBombGameProps {
  room: RoomWithPlayers
  player: PlayerWithStats | null
  isSpectator: boolean
}

// Game constants
const BOMB_TIMER_SECONDS = 15
const COUNTDOWN_SECONDS = 3
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
  
  // Match system
  const {
    currentRound,
    winsNeeded,
    isMatchFinished,
    matchWinnerId,
    roundStatus,
    getPlayerWins,
    isPlayerEliminated,
    getActivePlayerIds,
    startRound,
    endRound,
    eliminatePlayer,
    resetRound,
  } = useMatch({
    totalRounds,
    playerIds,
  })

  // Local game state
  const [gamePhase, setGamePhase] = useState<"waiting" | "countdown" | "playing" | "explosion" | "roundEnd" | "matchEnd">("waiting")
  const [timeLeft, setTimeLeft] = useState(BOMB_TIMER_SECONDS)
  const [countdownTime, setCountdownTime] = useState(COUNTDOWN_SECONDS)
  const [bombHolderId, setBombHolderId] = useState<string | null>(null)
  const [eliminatedThisRound, setEliminatedThisRound] = useState<Set<string>>(new Set())
  const [roundWinner, setRoundWinner] = useState<string | null>(null)
  const [roundLoser, setRoundLoser] = useState<string | null>(null)
  
  // Refs for intervals
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  
  // Current player info
  const currentPlayerId = player?.id
  const hasBomb = currentPlayerId === bombHolderId
  const isEliminated = currentPlayerId ? eliminatedThisRound.has(currentPlayerId) : false
  const canPass = hasBomb && gamePhase === "playing" && !isSpectator && !isEliminated

  // Get bomb holder player info
  const bombHolder = activePlayers.find(p => p.id === bombHolderId)
  
  // Get players still active this round
  const playersAliveThisRound = activePlayers.filter(p => !eliminatedThisRound.has(p.id))

  // Select random bomb holder from active players
  const selectRandomHolder = useCallback(() => {
    const active = activePlayers.filter(p => !eliminatedThisRound.has(p.id))
    if (active.length === 0) return null
    const randomIndex = Math.floor(Math.random() * active.length)
    return active[randomIndex].id
  }, [activePlayers, eliminatedThisRound])

  // Start the game
  const handleStartGame = useCallback(() => {
    if (isSpectator) return
    
    // Start countdown
    setGamePhase("countdown")
    setCountdownTime(COUNTDOWN_SECONDS)
    setEliminatedThisRound(new Set())
    
    countdownRef.current = setInterval(() => {
      setCountdownTime(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!)
          countdownRef.current = null
          
          // Start round
          const holder = selectRandomHolder()
          setBombHolderId(holder)
          setTimeLeft(BOMB_TIMER_SECONDS)
          setGamePhase("playing")
          startRound()
          
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [isSpectator, selectRandomHolder, startRound])

  // Pass the bomb to another player
  const handlePassBomb = useCallback((targetId: string) => {
    if (!canPass || targetId === currentPlayerId || eliminatedThisRound.has(targetId)) return
    setBombHolderId(targetId)
  }, [canPass, currentPlayerId, eliminatedThisRound])

  // Timer countdown
  useEffect(() => {
    if (gamePhase !== "playing") return
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // BOOM! Bomb explodes
          clearInterval(timerRef.current!)
          timerRef.current = null
          
          // Eliminate current holder
          if (bombHolderId) {
            const newEliminated = new Set(eliminatedThisRound)
            newEliminated.add(bombHolderId)
            setEliminatedThisRound(newEliminated)
            eliminatePlayer(bombHolderId)
            setRoundLoser(bombHolderId)
            
            // Check if only one player left
            const remaining = activePlayers.filter(p => !newEliminated.has(p.id))
            
            if (remaining.length === 1) {
              // Round winner
              const winner = remaining[0]
              setRoundWinner(winner.id)
              endRound(winner.id, bombHolderId)
              setGamePhase("roundEnd")
            } else {
              // Continue with remaining players
              setGamePhase("explosion")
              setTimeout(() => {
                // Pick new bomb holder from remaining players
                const newHolder = remaining[Math.floor(Math.random() * remaining.length)]
                setBombHolderId(newHolder.id)
                setTimeLeft(BOMB_TIMER_SECONDS)
                setGamePhase("playing")
              }, 2000)
            }
          }
          
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gamePhase, bombHolderId, activePlayers, eliminatedThisRound, eliminatePlayer, endRound])

  // Handle round end -> next round or match end
  useEffect(() => {
    if (gamePhase !== "roundEnd") return
    
    const timeout = setTimeout(() => {
      if (isMatchFinished) {
        setGamePhase("matchEnd")
      } else {
        // Start next round
        setEliminatedThisRound(new Set())
        setRoundWinner(null)
        setRoundLoser(null)
        resetRound()
        setGamePhase("waiting")
      }
    }, BETWEEN_ROUNDS_DELAY)
    
    return () => clearTimeout(timeout)
  }, [gamePhase, isMatchFinished, resetRound])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  // Get danger level for animations
  const dangerLevel = getDangerLevel(timeLeft)

  // Match winner player
  const matchWinnerPlayer = matchWinnerId ? activePlayers.find(p => p.id === matchWinnerId) : null

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
                {timeLeft}s
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
                  {getPlayerWins(p.id)}
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
            {!isSpectator && (
              <Button size="lg" onClick={handleStartGame} className="gap-2">
                <Bomb className="h-5 w-5" />
                Start Round
              </Button>
            )}
          </div>
        )}

        {/* Countdown State */}
        {gamePhase === "countdown" && (
          <div className="text-center">
            <div className="w-40 h-40 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <span className="text-6xl font-bold text-primary">{countdownTime}</span>
            </div>
            <h3 className="text-2xl font-bold">Get Ready!</h3>
          </div>
        )}

        {/* Playing State */}
        {(gamePhase === "playing" || gamePhase === "explosion") && (
          <div className="w-full max-w-2xl">
            {/* Bomb Holder Display */}
            <div className="text-center mb-8">
              {bombHolder && (
                <div className={`inline-block p-6 rounded-2xl transition-all ${
                  gamePhase === "explosion" && bombHolderId === roundLoser
                    ? "bg-red-100 animate-shake"
                    : dangerLevel === "calm" ? "bg-muted" :
                      dangerLevel === "warning" ? "bg-amber-50" :
                      dangerLevel === "danger" ? "bg-orange-50" :
                      "bg-red-50"
                }`}>
                  <div className="relative inline-block">
                    <Avatar className={`h-24 w-24 ring-4 transition-all ${
                      gamePhase === "explosion" && bombHolderId === roundLoser
                        ? "ring-red-500"
                        : dangerLevel === "calm" ? "ring-primary/50" :
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
                      gamePhase === "explosion"
                        ? "bg-red-500 scale-150"
                        : dangerLevel === "calm" ? "bg-primary" :
                          dangerLevel === "warning" ? "bg-amber-500 animate-pulse" :
                          dangerLevel === "danger" ? "bg-orange-500 animate-bounce" :
                          "bg-red-500 animate-ping"
                    }`}>
                      {gamePhase === "explosion" ? (
                        <Skull className="h-5 w-5 text-white" />
                      ) : (
                        <Bomb className={`h-5 w-5 text-white ${dangerLevel === "critical" ? "animate-spin" : ""}`} />
                      )}
                    </div>
                  </div>
                  
                  <p className="mt-4 font-bold text-lg">{bombHolder.username}</p>
                  <p className="text-sm text-muted-foreground">
                    {gamePhase === "explosion" ? "BOOM! Eliminated!" : "has the bomb!"}
                  </p>
                </div>
              )}
            </div>

            {/* Pass Targets */}
            {canPass && gamePhase === "playing" && (
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

            {/* Eliminated Display (for spectators/eliminated players) */}
            {eliminatedThisRound.size > 0 && (
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground mb-2">Eliminated this round:</p>
                <div className="flex justify-center gap-2">
                  {activePlayers
                    .filter(p => eliminatedThisRound.has(p.id))
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
              {isMatchFinished 
                ? "Match complete!" 
                : `Round ${currentRound + 1} starting soon...`}
            </p>
          </div>
        )}

        {/* Match End State */}
        {gamePhase === "matchEnd" && matchWinnerPlayer && (
          <div className="text-center">
            <div className="w-40 h-40 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/30">
              <Trophy className="h-20 w-20 text-white" />
            </div>
            <h3 className="text-3xl font-bold mb-2">Match Winner!</h3>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Avatar className="h-16 w-16 ring-4 ring-amber-500">
                <AvatarImage src={matchWinnerPlayer.avatar_url || undefined} />
                <AvatarFallback className="text-xl bg-amber-100 text-amber-700">
                  {matchWinnerPlayer.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-2xl font-bold">{matchWinnerPlayer.username}</p>
                <p className="text-muted-foreground">
                  {getPlayerWins(matchWinnerId!)} - {Math.max(...playerIds.map(id => id === matchWinnerId ? 0 : getPlayerWins(id)))}
                </p>
              </div>
            </div>
            <Badge className="bg-amber-500 text-white text-lg px-4 py-1">
              Champion!
            </Badge>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      {gamePhase === "playing" && !isSpectator && (
        <div className={`p-4 border-t border-border transition-colors ${
          hasBomb 
            ? dangerLevel === "critical" 
              ? "bg-red-100" 
              : "bg-amber-50"
            : "bg-muted/30"
        }`}>
          <div className="text-center">
            {hasBomb ? (
              <p className={`font-semibold ${dangerLevel === "critical" ? "text-red-600 animate-pulse" : "text-amber-700"}`}>
                {dangerLevel === "critical" ? "PASS IT NOW!" : "You have the bomb! Pass it quickly!"}
              </p>
            ) : isEliminated ? (
              <p className="text-muted-foreground">You were eliminated this round</p>
            ) : (
              <p className="text-muted-foreground">
                Safe for now... watch out!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
