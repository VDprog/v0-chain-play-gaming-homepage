"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Timer, Check, X, Sparkles } from "lucide-react"

export function SplitOrStealPreview() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden card-hover cursor-pointer">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
        <h4 className="font-semibold text-foreground">Split or Steal</h4>
        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-primary text-primary-foreground uppercase tracking-wide">1v1</span>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-14 w-14 ring-2 ring-primary shadow-lg shadow-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">VL</AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold text-foreground">You</span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">500 pts</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-primary">
              <Timer className="h-5 w-5" />
              <span className="text-2xl font-bold tabular-nums">0:15</span>
            </div>
            <span className="text-xs text-muted-foreground font-medium">Round 3/5</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-14 w-14 ring-2 ring-muted">
              <AvatarFallback className="bg-muted text-muted-foreground font-bold">EV</AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold text-foreground">Eva</span>
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">450 pts</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button size="lg" className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/20 transition-all duration-200 hover:scale-[1.02]">
            <Check className="h-5 w-5 mr-2" />
            Split
          </Button>
          <Button size="lg" className="h-12 bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md shadow-red-600/20 transition-all duration-200 hover:scale-[1.02]">
            <X className="h-5 w-5 mr-2" />
            Steal
          </Button>
        </div>
      </div>
    </div>
  )
}

export function PassTheBombPreview() {
  const players = [
    { initials: "VL", isCurrent: false },
    { initials: "EV", isCurrent: false },
    { initials: "PA", isCurrent: true },
    { initials: "JK", isCurrent: false },
    { initials: "AD", isCurrent: false },
    { initials: "MK", isCurrent: false },
  ]

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden card-hover cursor-pointer">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
        <h4 className="font-semibold text-foreground">Pass the Bomb</h4>
        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-red-500 text-white uppercase tracking-wide">6 Players</span>
      </div>
      <div className="p-6">
        <div className="relative h-44 mb-3">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 shadow-lg shadow-red-500/20 animate-pulse">
              <span className="text-2xl">💣</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-600 font-bold">
              <Timer className="h-4 w-4" />
              <span className="tabular-nums text-lg">0:03</span>
            </div>
          </div>
          {players.map((player, i) => {
            const angle = (i * 60 - 90) * (Math.PI / 180)
            const x = 50 + 36 * Math.cos(angle)
            const y = 50 + 36 * Math.sin(angle)
            return (
              <div
                key={player.initials}
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <Avatar className={`h-10 w-10 ${player.isCurrent ? "ring-2 ring-red-500 ring-offset-2 ring-offset-card shadow-lg shadow-red-500/30" : "ring-1 ring-border"}`}>
                  <AvatarFallback className={`${player.isCurrent ? "bg-red-500/15 text-red-600 font-bold" : "bg-primary/10 text-primary"} text-xs font-semibold`}>
                    {player.initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            )
          })}
        </div>
        <p className="text-center text-sm text-muted-foreground">
          <span className="font-semibold text-red-600">Panda</span> has the bomb!
        </p>
      </div>
    </div>
  )
}

export function QuizPreview() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden card-hover cursor-pointer">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
        <h4 className="font-semibold text-foreground">Speed Quiz</h4>
        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-500 text-white uppercase tracking-wide">Q5/10</span>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <Progress value={50} className="h-2 flex-1 mr-4" />
          <div className="flex items-center gap-1.5 text-primary font-bold">
            <Timer className="h-4 w-4" />
            <span className="tabular-nums text-lg">0:08</span>
          </div>
        </div>
        <div className="mb-5 p-4 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Trivia</span>
          </div>
          <p className="text-base font-semibold text-foreground text-center text-balance">
            What is the largest planet in our solar system?
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {["Mars", "Jupiter", "Saturn", "Neptune"].map((answer, i) => (
            <Button
              key={answer}
              variant="outline"
              className={`h-11 text-sm font-semibold transition-all duration-200 ${
                i === 1 
                  ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10" 
                  : "hover:border-primary/30 hover:bg-primary/5"
              }`}
            >
              {answer}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
