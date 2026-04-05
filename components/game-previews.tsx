"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Timer, Check, X } from "lucide-react"

export function SplitOrStealPreview() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <h4 className="font-semibold text-foreground text-sm">Split or Steal</h4>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">1v1</span>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex flex-col items-center gap-1.5">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">VL</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground">You</span>
            <span className="text-xs text-muted-foreground">500 pts</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-1.5 text-primary">
              <Timer className="h-4 w-4" />
              <span className="text-lg font-bold tabular-nums">0:15</span>
            </div>
            <span className="text-[11px] text-muted-foreground">Round 3/5</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Avatar className="h-12 w-12 ring-2 ring-muted">
              <AvatarFallback className="bg-muted text-muted-foreground font-bold text-sm">EV</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground">Eva</span>
            <span className="text-xs text-muted-foreground">450 pts</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <Button size="lg" className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
            <Check className="h-4 w-4 mr-1.5" />
            Split
          </Button>
          <Button size="lg" className="h-11 bg-red-600 hover:bg-red-700 text-white font-semibold">
            <X className="h-4 w-4 mr-1.5" />
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
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <h4 className="font-semibold text-foreground text-sm">Pass the Bomb</h4>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-red-500/10 text-red-600">6 Players</span>
      </div>
      <div className="p-5">
        <div className="relative h-40 mb-2">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <span className="text-xl">💣</span>
            </div>
            <div className="flex items-center gap-1 text-red-600 font-bold text-sm">
              <Timer className="h-3.5 w-3.5" />
              <span className="tabular-nums">0:03</span>
            </div>
          </div>
          {players.map((player, i) => {
            const angle = (i * 60 - 90) * (Math.PI / 180)
            const x = 50 + 38 * Math.cos(angle)
            const y = 50 + 38 * Math.sin(angle)
            return (
              <div
                key={player.initials}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <Avatar className={`h-9 w-9 ${player.isCurrent ? "ring-2 ring-red-500 ring-offset-2 ring-offset-card" : ""}`}>
                  <AvatarFallback className={`${player.isCurrent ? "bg-red-500/15 text-red-600" : "bg-primary/10 text-primary"} text-[10px] font-medium`}>
                    {player.initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            )
          })}
        </div>
        <p className="text-center text-sm text-muted-foreground">
          <span className="font-medium text-red-600">Panda</span> has the bomb!
        </p>
      </div>
    </div>
  )
}

export function QuizPreview() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <h4 className="font-semibold text-foreground text-sm">Speed Quiz</h4>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-600">Q5/10</span>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <Progress value={50} className="h-1.5 flex-1 mr-4" />
          <div className="flex items-center gap-1 text-primary font-bold text-sm">
            <Timer className="h-3.5 w-3.5" />
            <span className="tabular-nums">0:08</span>
          </div>
        </div>
        <div className="mb-4 p-3 rounded-lg bg-muted/50">
          <p className="text-sm font-medium text-foreground text-center">
            What is the largest planet in our solar system?
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {["Mars", "Jupiter", "Saturn", "Neptune"].map((answer, i) => (
            <Button
              key={answer}
              variant="outline"
              className={`h-9 text-sm font-medium ${i === 1 ? "border-primary bg-primary/5 text-primary" : ""}`}
            >
              {answer}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
