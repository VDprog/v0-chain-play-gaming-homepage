"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Crown, Swords, Shield, Timer } from "lucide-react"
import type { RoomWithPlayers } from "@/lib/types/room"
import type { PlayerWithStats } from "@/lib/types/player"

interface KingOfTheHillGameProps {
  room: RoomWithPlayers
  player: PlayerWithStats | null
  isSpectator: boolean
}

export function KingOfTheHillGame({ room, player, isSpectator }: KingOfTheHillGameProps) {
  const [kingIndex, setKingIndex] = useState(0)
  const [kingTime, setKingTime] = useState(0)
  const [challenging, setChallenging] = useState(false)
  const [challengeResult, setChallengeResult] = useState<"won" | "lost" | null>(null)

  const activePlayers = room.players.filter(p => p.role !== "spectator" && p.status !== "eliminated")
  const currentPlayerIndex = activePlayers.findIndex(p => p.id === player?.id)
  const isKing = currentPlayerIndex === kingIndex
  const king = activePlayers[kingIndex]

  // Simulate king time accumulation
  useEffect(() => {
    const timer = setInterval(() => {
      setKingTime((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [kingIndex])

  const handleChallenge = () => {
    if (isKing || isSpectator || challenging) return
    
    setChallenging(true)
    setTimeout(() => {
      const won = Math.random() > 0.5
      setChallengeResult(won ? "won" : "lost")
      
      if (won) {
        setKingIndex(currentPlayerIndex)
        setKingTime(0)
      }
      
      setTimeout(() => {
        setChallenging(false)
        setChallengeResult(null)
      }, 2000)
    }, 1500)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Game Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          <span className="font-semibold">King of the Hill</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Timer className="h-4 w-4" />
          Win condition: 60s as King
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* The Hill / Throne */}
        <div className="relative mb-8">
          {/* Hill background */}
          <div className="w-64 h-40 bg-gradient-to-t from-amber-100 to-amber-50 rounded-t-full border-4 border-amber-200 flex items-end justify-center pb-4">
            <div className="text-center">
              {/* Crown */}
              <Crown className="h-12 w-12 text-amber-500 mx-auto mb-2" />
              
              {/* King */}
              <Avatar className="h-20 w-20 mx-auto ring-4 ring-amber-400 shadow-lg">
                <AvatarImage src={king?.avatar_url || undefined} />
                <AvatarFallback className="bg-amber-100 text-amber-700 text-xl font-bold">
                  {king?.username.slice(0, 2).toUpperCase() || "??"}
                </AvatarFallback>
              </Avatar>
              <p className="font-bold mt-2 text-amber-800">{king?.username}</p>
            </div>
          </div>
        </div>

        {/* King's Timer */}
        <div className="w-full max-w-md mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Time as King</span>
            <span className="text-sm font-bold text-amber-600">{kingTime}s / 60s</span>
          </div>
          <Progress value={(kingTime / 60) * 100} className="h-3" />
        </div>

        {/* Challenge Result */}
        {challengeResult && (
          <div className={`mb-6 px-8 py-4 rounded-xl text-center ${
            challengeResult === "won" 
              ? "bg-emerald-50 border-2 border-emerald-200 text-emerald-700" 
              : "bg-red-50 border-2 border-red-200 text-red-700"
          }`}>
            <span className="text-xl font-bold">
              {challengeResult === "won" ? "You claimed the throne!" : "Challenge failed!"}
            </span>
          </div>
        )}

        {/* Challengers */}
        <div className="flex items-center gap-4">
          {activePlayers.filter((_, i) => i !== kingIndex).map((challenger) => (
            <div key={challenger.id} className="text-center">
              <Avatar className={`h-12 w-12 ${
                challenger.id === player?.id ? "ring-2 ring-primary" : ""
              }`}>
                <AvatarImage src={challenger.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {challenger.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="text-xs font-medium mt-1">{challenger.username}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {!isSpectator && !isKing && (
        <div className="p-4 border-t border-border bg-muted/30">
          <Button 
            size="lg" 
            onClick={handleChallenge}
            disabled={challenging}
            className="w-full gap-2"
          >
            {challenging ? (
              <>
                <Swords className="h-5 w-5 animate-pulse" />
                Challenging...
              </>
            ) : (
              <>
                <Swords className="h-5 w-5" />
                Challenge the King
              </>
            )}
          </Button>
        </div>
      )}

      {!isSpectator && isKing && (
        <div className="p-4 border-t border-border bg-amber-50">
          <div className="flex items-center justify-center gap-2 text-amber-700">
            <Shield className="h-5 w-5" />
            <span className="font-semibold">You are the King! Defend your throne!</span>
          </div>
        </div>
      )}
    </div>
  )
}
