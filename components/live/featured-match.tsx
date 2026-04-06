"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bomb, Eye, ArrowRight, Users, Timer } from "lucide-react"

const players = [
  { name: "Vlad", initials: "VL", position: 0, isHolder: true },
  { name: "Eva", initials: "EV", position: 1, isHolder: false },
  { name: "Panda", initials: "PA", position: 2, isHolder: false },
  { name: "Jack", initials: "JK", position: 3, isHolder: false },
  { name: "Adam", initials: "AD", position: 4, isHolder: false },
  { name: "Luna", initials: "LU", position: 5, isHolder: false },
]

export function FeaturedMatch() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Bomb className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">Pass the Bomb</h3>
              <span className="text-xs font-medium text-muted-foreground">Room #204</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                LIVE
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" /> 6/8 players
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary tabular-nums">$120</p>
          <p className="text-xs text-muted-foreground">Prize Pool</p>
        </div>
      </div>
      
      {/* Game visualization */}
      <div className="relative px-6 py-10 bg-gradient-to-b from-muted/30 to-muted/10">
        {/* Timer ring in center */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            {/* Outer ring */}
            <div className="w-32 h-32 rounded-full border-4 border-muted flex items-center justify-center">
              {/* Progress ring */}
              <svg className="absolute inset-0 w-32 h-32 -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  fill="none"
                  stroke="oklch(0.55 0.22 255)"
                  strokeWidth="4"
                  strokeDasharray={`${0.65 * 377} 377`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              {/* Inner content */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                  <Bomb className="h-5 w-5 animate-pulse" />
                </div>
                <p className="text-2xl font-bold text-foreground tabular-nums">0:08</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Time Left</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Players circle */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {players.map((player) => (
            <div
              key={player.name}
              className={`flex flex-col items-center gap-2 transition-all duration-300 ${
                player.isHolder ? "scale-110" : ""
              }`}
            >
              <div className={`relative ${player.isHolder ? "animate-pulse" : ""}`}>
                <Avatar className={`h-14 w-14 border-2 transition-all duration-300 ${
                  player.isHolder 
                    ? "border-amber-500 ring-4 ring-amber-500/20" 
                    : "border-border"
                }`}>
                  <AvatarFallback className={`text-sm font-semibold ${
                    player.isHolder 
                      ? "bg-amber-500/10 text-amber-600" 
                      : "bg-primary/10 text-primary"
                  }`}>
                    {player.initials}
                  </AvatarFallback>
                </Avatar>
                {player.isHolder && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center">
                    <Bomb className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <span className={`text-xs font-medium ${
                player.isHolder ? "text-amber-600" : "text-muted-foreground"
              }`}>
                {player.name}
              </span>
            </div>
          ))}
        </div>
        
        {/* Round info */}
        <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
          <span>Round 4 of 6</span>
          <span className="text-border">•</span>
          <span>2 eliminated</span>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-3 px-6 py-4 border-t border-border bg-muted/20">
        <Button className="flex-1 gap-2 font-semibold shadow-md shadow-primary/20">
          Join Room
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" className="flex-1 gap-2 font-semibold">
          <Eye className="h-4 w-4" />
          Watch Match
        </Button>
      </div>
    </div>
  )
}
