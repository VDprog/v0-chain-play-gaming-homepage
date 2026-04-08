"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bomb, ArrowRight, Timer } from "lucide-react"
import type { RoomWithPlayers } from "@/lib/types/room"
import type { PlayerWithStats } from "@/lib/types/player"

interface PassTheBombGameProps {
  room: RoomWithPlayers
  player: PlayerWithStats | null
  isSpectator: boolean
}

export function PassTheBombGame({ room, player, isSpectator }: PassTheBombGameProps) {
  const [timeLeft, setTimeLeft] = useState(15)
  const [currentHolder, setCurrentHolder] = useState(0)
  const [isExploding, setIsExploding] = useState(false)
  
  const activePlayers = room.players.filter(p => p.role !== "spectator" && p.status !== "eliminated")
  const currentPlayerIndex = activePlayers.findIndex(p => p.id === player?.id)
  const hasBomb = currentPlayerIndex === currentHolder

  // Simulated timer countdown
  useEffect(() => {
    if (isExploding) return
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExploding(true)
          setTimeout(() => {
            setIsExploding(false)
            setTimeLeft(Math.floor(Math.random() * 10) + 8)
            setCurrentHolder((prev) => (prev + 1) % activePlayers.length)
          }, 2000)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [activePlayers.length, isExploding])

  const handlePass = () => {
    if (!hasBomb || isSpectator) return
    setCurrentHolder((prev) => (prev + 1) % activePlayers.length)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Game Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bomb className="h-5 w-5 text-primary" />
          <span className="font-semibold">Pass the Bomb</span>
        </div>
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-muted-foreground" />
          <span className={`font-mono font-bold ${timeLeft <= 5 ? "text-red-500" : ""}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="relative">
          {/* Player Circle */}
          <div className="relative w-80 h-80">
            {activePlayers.map((p, i) => {
              const angle = (i * 360) / activePlayers.length - 90
              const x = 50 + 40 * Math.cos((angle * Math.PI) / 180)
              const y = 50 + 40 * Math.sin((angle * Math.PI) / 180)
              const isHolder = i === currentHolder
              
              return (
                <div
                  key={p.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div className={`relative ${isHolder ? "scale-125" : ""} transition-transform`}>
                    <Avatar className={`h-14 w-14 ring-4 ${
                      isHolder 
                        ? isExploding 
                          ? "ring-red-500 animate-pulse" 
                          : "ring-amber-500"
                        : "ring-border"
                    }`}>
                      <AvatarImage src={p.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {p.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isHolder && (
                      <div className={`absolute -top-3 -right-3 p-1.5 rounded-full ${
                        isExploding ? "bg-red-500 animate-bounce" : "bg-amber-500"
                      }`}>
                        <Bomb className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap">
                      {p.username}
                    </p>
                  </div>
                </div>
              )
            })}
            
            {/* Center Timer */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                isExploding 
                  ? "bg-red-500 animate-pulse" 
                  : timeLeft <= 5 
                    ? "bg-red-100 border-4 border-red-500" 
                    : "bg-muted border-4 border-border"
              }`}>
                {isExploding ? (
                  <span className="text-2xl font-bold text-white">BOOM!</span>
                ) : (
                  <span className={`text-3xl font-bold ${timeLeft <= 5 ? "text-red-500" : "text-foreground"}`}>
                    {timeLeft}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {!isSpectator && hasBomb && !isExploding && (
        <div className="p-4 border-t border-border bg-muted/30">
          <Button 
            size="lg" 
            onClick={handlePass}
            className="w-full gap-2 bg-amber-500 hover:bg-amber-600"
          >
            <Bomb className="h-5 w-5" />
            Pass the Bomb!
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  )
}
