"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CircleDot, RotateCw, Crosshair, Skull, Check } from "lucide-react"
import type { RoomWithPlayers } from "@/lib/types/room"
import type { PlayerWithStats } from "@/lib/types/player"

interface RussianRouletteGameProps {
  room: RoomWithPlayers
  player: PlayerWithStats | null
  isSpectator: boolean
}

export function RussianRouletteGame({ room, player, isSpectator }: RussianRouletteGameProps) {
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<"safe" | "eliminated" | null>(null)
  const [currentTurn, setCurrentTurn] = useState(0)
  
  const activePlayers = room.players.filter(p => p.role !== "spectator" && p.status !== "eliminated")
  const currentPlayerIndex = activePlayers.findIndex(p => p.id === player?.id)
  const isMyTurn = currentPlayerIndex === currentTurn

  const handleSpin = () => {
    if (!isMyTurn || isSpectator || spinning) return
    
    setSpinning(true)
    setTimeout(() => {
      const eliminated = Math.random() < 0.167 // 1 in 6 chance
      setResult(eliminated ? "eliminated" : "safe")
      setSpinning(false)
      
      if (!eliminated) {
        setTimeout(() => {
          setResult(null)
          setCurrentTurn((prev) => (prev + 1) % activePlayers.length)
        }, 2000)
      }
    }, 2000)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Game Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <CircleDot className="h-5 w-5 text-primary" />
          <span className="font-semibold">Russian Roulette</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {activePlayers.length} players remaining
        </span>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Revolver */}
        <div className={`relative w-48 h-48 mb-8 ${spinning ? "animate-spin" : ""}`}>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-zinc-800 border-4 border-zinc-600 flex items-center justify-center">
              <div className="grid grid-cols-3 grid-rows-2 gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-4 h-4 rounded-full ${
                      i === 0 ? "bg-amber-500" : "bg-zinc-700"
                    } border border-zinc-500`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className={`mb-8 px-8 py-4 rounded-xl text-center ${
            result === "safe" 
              ? "bg-emerald-50 border-2 border-emerald-200" 
              : "bg-red-50 border-2 border-red-200"
          }`}>
            {result === "safe" ? (
              <div className="flex items-center gap-3 text-emerald-700">
                <Check className="h-6 w-6" />
                <span className="text-xl font-bold">SAFE!</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-red-700">
                <Skull className="h-6 w-6" />
                <span className="text-xl font-bold">ELIMINATED!</span>
              </div>
            )}
          </div>
        )}

        {/* Current Turn */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-3">Current Turn</p>
          <Avatar className="h-16 w-16 mx-auto mb-2 ring-4 ring-primary">
            <AvatarImage src={activePlayers[currentTurn]?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
              {activePlayers[currentTurn]?.username.slice(0, 2).toUpperCase() || "??"}
            </AvatarFallback>
          </Avatar>
          <p className="font-semibold">{activePlayers[currentTurn]?.username}</p>
        </div>
      </div>

      {/* Actions */}
      {!isSpectator && isMyTurn && !result && (
        <div className="p-4 border-t border-border bg-muted/30">
          <Button 
            size="lg" 
            onClick={handleSpin}
            disabled={spinning}
            className="w-full gap-2 bg-red-600 hover:bg-red-700"
          >
            {spinning ? (
              <>
                <RotateCw className="h-5 w-5 animate-spin" />
                Spinning...
              </>
            ) : (
              <>
                <Crosshair className="h-5 w-5" />
                Pull the Trigger
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
