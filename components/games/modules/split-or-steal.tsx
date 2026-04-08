"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Handshake, Swords, Coins, Check, X } from "lucide-react"
import type { RoomWithPlayers } from "@/lib/types/room"
import type { PlayerWithStats } from "@/lib/types/player"

interface SplitOrStealGameProps {
  room: RoomWithPlayers
  player: PlayerWithStats | null
  isSpectator: boolean
}

export function SplitOrStealGame({ room, player, isSpectator }: SplitOrStealGameProps) {
  const [choice, setChoice] = useState<"split" | "steal" | null>(null)
  const [revealed, setRevealed] = useState(false)
  
  const activePlayers = room.players.filter(p => p.role !== "spectator")
  const opponent = activePlayers.find(p => p.id !== player?.id)
  const prize = room.stakes || 100

  const handleChoice = (c: "split" | "steal") => {
    if (isSpectator || choice) return
    setChoice(c)
    // Simulate opponent choice after a delay
    setTimeout(() => setRevealed(true), 2000)
  }

  // Simulated opponent choice
  const opponentChoice: "split" | "steal" = Math.random() > 0.5 ? "split" : "steal"

  const getOutcome = () => {
    if (!choice || !revealed) return null
    if (choice === "split" && opponentChoice === "split") {
      return { you: prize / 2, them: prize / 2, message: "You both split the prize!" }
    }
    if (choice === "steal" && opponentChoice === "split") {
      return { you: prize, them: 0, message: "You stole the prize!" }
    }
    if (choice === "split" && opponentChoice === "steal") {
      return { you: 0, them: prize, message: "They stole from you!" }
    }
    return { you: 0, them: 0, message: "You both tried to steal - no one wins!" }
  }

  const outcome = getOutcome()

  return (
    <div className="h-full flex flex-col">
      {/* Game Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Handshake className="h-5 w-5 text-primary" />
          <span className="font-semibold">Split or Steal</span>
        </div>
        <div className="flex items-center gap-2 text-amber-600">
          <Coins className="h-4 w-4" />
          <span className="font-bold">{prize} at stake</span>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Opponent */}
        <div className="mb-12 text-center">
          <Avatar className="h-20 w-20 mx-auto mb-3 ring-4 ring-border">
            <AvatarImage src={opponent?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
              {opponent?.username.slice(0, 2).toUpperCase() || "??"}
            </AvatarFallback>
          </Avatar>
          <p className="font-semibold">{opponent?.username || "Opponent"}</p>
          
          {/* Opponent's Choice */}
          <div className="mt-4">
            {revealed ? (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                opponentChoice === "split" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
              }`}>
                {opponentChoice === "split" ? <Handshake className="h-4 w-4" /> : <Swords className="h-4 w-4" />}
                {opponentChoice === "split" ? "Split" : "Steal"}
              </div>
            ) : choice ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground">
                Deciding...
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground">
                Waiting for you...
              </div>
            )}
          </div>
        </div>

        {/* Prize */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-amber-50 border-2 border-amber-200">
            <Coins className="h-8 w-8 text-amber-500" />
            <span className="text-3xl font-bold text-amber-600">{prize}</span>
          </div>
        </div>

        {/* Your Choice */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-3">Your choice</p>
          {choice && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
              choice === "split" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
            }`}>
              {choice === "split" ? <Handshake className="h-4 w-4" /> : <Swords className="h-4 w-4" />}
              {choice === "split" ? "Split" : "Steal"}
            </div>
          )}
        </div>

        {/* Outcome */}
        {outcome && (
          <div className="mt-8 p-6 rounded-xl bg-card border border-border text-center">
            <p className="text-lg font-semibold mb-2">{outcome.message}</p>
            <div className="flex items-center justify-center gap-8">
              <div>
                <p className="text-sm text-muted-foreground">You get</p>
                <p className={`text-2xl font-bold ${outcome.you > 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {outcome.you}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">They get</p>
                <p className={`text-2xl font-bold ${outcome.them > 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {outcome.them}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {!isSpectator && !choice && (
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex gap-4">
            <Button 
              size="lg" 
              onClick={() => handleChoice("split")}
              className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <Handshake className="h-5 w-5" />
              Split
            </Button>
            <Button 
              size="lg" 
              onClick={() => handleChoice("steal")}
              className="flex-1 gap-2 bg-red-600 hover:bg-red-700"
            >
              <Swords className="h-5 w-5" />
              Steal
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
