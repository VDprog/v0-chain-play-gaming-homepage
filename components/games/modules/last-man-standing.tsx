"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Timer, Heart, Shield, Zap, Skull } from "lucide-react"
import type { RoomWithPlayers } from "@/lib/types/room"
import type { PlayerWithStats } from "@/lib/types/player"

interface LastManStandingGameProps {
  room: RoomWithPlayers
  player: PlayerWithStats | null
  isSpectator: boolean
}

interface PlayerState {
  id: string
  health: number
  shield: number
  eliminated: boolean
}

export function LastManStandingGame({ room, player, isSpectator }: LastManStandingGameProps) {
  const activePlayers = room.players.filter(p => p.role !== "spectator")
  
  const [playerStates, setPlayerStates] = useState<PlayerState[]>(
    activePlayers.map(p => ({ id: p.id, health: 100, shield: 0, eliminated: false }))
  )
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)
  const [actionCooldown, setActionCooldown] = useState(0)
  const [roundTime, setRoundTime] = useState(30)

  const myState = playerStates.find(ps => ps.id === player?.id)
  const isEliminated = myState?.eliminated

  // Round timer
  useEffect(() => {
    const timer = setInterval(() => {
      setRoundTime((prev) => {
        if (prev <= 1) return 30
        return prev - 1
      })
      
      // Random damage to players each second
      setPlayerStates((prev) => prev.map(ps => {
        if (ps.eliminated) return ps
        const damage = Math.random() < 0.1 ? Math.floor(Math.random() * 10) + 5 : 0
        const newHealth = Math.max(0, ps.health - Math.max(0, damage - ps.shield))
        return {
          ...ps,
          health: newHealth,
          eliminated: newHealth <= 0,
          shield: Math.max(0, ps.shield - 1),
        }
      }))
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

  // Action cooldown
  useEffect(() => {
    if (actionCooldown > 0) {
      const timer = setTimeout(() => setActionCooldown(prev => prev - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [actionCooldown])

  const handleAttack = () => {
    if (!selectedTarget || actionCooldown > 0 || isSpectator || isEliminated) return
    
    setPlayerStates((prev) => prev.map(ps => {
      if (ps.id === selectedTarget && !ps.eliminated) {
        const damage = Math.floor(Math.random() * 20) + 10
        const actualDamage = Math.max(0, damage - ps.shield)
        const newHealth = Math.max(0, ps.health - actualDamage)
        return {
          ...ps,
          health: newHealth,
          eliminated: newHealth <= 0,
        }
      }
      return ps
    }))
    setActionCooldown(3)
    setSelectedTarget(null)
  }

  const handleShield = () => {
    if (actionCooldown > 0 || isSpectator || isEliminated) return
    
    setPlayerStates((prev) => prev.map(ps => {
      if (ps.id === player?.id) {
        return { ...ps, shield: Math.min(50, ps.shield + 25) }
      }
      return ps
    }))
    setActionCooldown(5)
  }

  const handleHeal = () => {
    if (actionCooldown > 0 || isSpectator || isEliminated) return
    
    setPlayerStates((prev) => prev.map(ps => {
      if (ps.id === player?.id) {
        return { ...ps, health: Math.min(100, ps.health + 20) }
      }
      return ps
    }))
    setActionCooldown(4)
  }

  const alivePlayers = playerStates.filter(ps => !ps.eliminated)

  return (
    <div className="h-full flex flex-col">
      {/* Game Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-primary" />
          <span className="font-semibold">Last Man Standing</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {alivePlayers.length} players remaining
          </span>
          <div className="flex items-center gap-1 font-mono">
            <Timer className="h-4 w-4" />
            {roundTime}s
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 p-6">
        {/* Players Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {activePlayers.map((p) => {
            const state = playerStates.find(ps => ps.id === p.id)
            if (!state) return null
            
            const isMe = p.id === player?.id
            const isTarget = selectedTarget === p.id
            
            return (
              <div
                key={p.id}
                onClick={() => !isMe && !state.eliminated && !isSpectator && setSelectedTarget(p.id)}
                className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  state.eliminated
                    ? "border-red-200 bg-red-50/50 opacity-60"
                    : isTarget
                      ? "border-red-500 bg-red-50"
                      : isMe
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/50"
                }`}
              >
                {state.eliminated && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                    <Skull className="h-8 w-8 text-red-500" />
                  </div>
                )}
                
                <Avatar className="h-12 w-12 mx-auto mb-2">
                  <AvatarImage src={p.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {p.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <p className="text-sm font-medium text-center mb-2 truncate">
                  {p.username}
                  {isMe && " (You)"}
                </p>
                
                {/* Health Bar */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-red-500" />
                    <Progress 
                      value={state.health} 
                      className="h-2 flex-1"
                    />
                    <span className="text-xs font-mono w-7 text-right">{state.health}</span>
                  </div>
                  
                  {state.shield > 0 && (
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-blue-500" />
                      <Progress 
                        value={state.shield * 2} 
                        className="h-2 flex-1"
                      />
                      <span className="text-xs font-mono w-7 text-right">{state.shield}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      {!isSpectator && !isEliminated && (
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex gap-3 max-w-xl mx-auto">
            <Button 
              size="lg"
              onClick={handleAttack}
              disabled={!selectedTarget || actionCooldown > 0}
              className="flex-1 gap-2 bg-red-600 hover:bg-red-700"
            >
              <Zap className="h-4 w-4" />
              Attack
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={handleShield}
              disabled={actionCooldown > 0}
              className="flex-1 gap-2"
            >
              <Shield className="h-4 w-4 text-blue-500" />
              Shield
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={handleHeal}
              disabled={actionCooldown > 0}
              className="flex-1 gap-2"
            >
              <Heart className="h-4 w-4 text-emerald-500" />
              Heal
            </Button>
          </div>
          {actionCooldown > 0 && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              Cooldown: {actionCooldown}s
            </p>
          )}
        </div>
      )}

      {isEliminated && (
        <div className="p-4 border-t border-border bg-red-50 text-center text-red-700">
          <Skull className="h-5 w-5 inline mr-2" />
          You have been eliminated!
        </div>
      )}
    </div>
  )
}
