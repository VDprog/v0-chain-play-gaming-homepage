"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Timer, Check, X } from "lucide-react"

export function SplitOrStealPreview() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
        <h4 className="font-semibold text-foreground text-sm">Split or Steal</h4>
        <span className="text-xs font-medium px-2 py-1 rounded-md bg-primary/10 text-primary">1v1</span>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-14 w-14 ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">VL</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground">You</span>
            <span className="text-xs text-muted-foreground">500 pts</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5 text-primary">
              <Timer className="h-4 w-4" />
              <span className="text-xl font-bold tabular-nums">0:15</span>
            </div>
            <span className="text-xs text-muted-foreground">Round 3/5</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-14 w-14 ring-2 ring-accent/20">
              <AvatarFallback className="bg-accent/10 text-accent font-bold">EV</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground">Eva</span>
            <span className="text-xs text-muted-foreground">450 pts</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button size="lg" className="h-12 bg-green-600 hover:bg-green-700 text-white font-semibold">
            <Check className="h-4 w-4 mr-2" />
            Split
          </Button>
          <Button size="lg" className="h-12 bg-destructive hover:bg-destructive/90 text-white font-semibold">
            <X className="h-4 w-4 mr-2" />
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
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
        <h4 className="font-semibold text-foreground text-sm">Pass the Bomb</h4>
        <span className="text-xs font-medium px-2 py-1 rounded-md bg-destructive/10 text-destructive">6 Players</span>
      </div>
      <div className="p-5">
        <div className="relative h-44 mb-3">
          {/* Center bomb */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15">
              <span className="text-2xl">💣</span>
            </div>
            <div className="flex items-center gap-1 text-destructive font-bold text-sm">
              <Timer className="h-3.5 w-3.5" />
              <span className="tabular-nums">0:03</span>
            </div>
          </div>
          {/* Players arranged in circle */}
          {players.map((player, i) => {
            const angle = (i * 60 - 90) * (Math.PI / 180)
            const x = 50 + 36 * Math.cos(angle)
            const y = 50 + 36 * Math.sin(angle)
            return (
              <div
                key={player.initials}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <Avatar className={`h-10 w-10 ${player.isCurrent ? "ring-2 ring-destructive ring-offset-2 ring-offset-card" : "ring-1 ring-border"}`}>
                  <AvatarFallback className={`${player.isCurrent ? "bg-destructive/15 text-destructive" : "bg-primary/8 text-primary"} text-xs font-medium`}>
                    {player.initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            )
          })}
        </div>
        <p className="text-center text-sm text-muted-foreground">
          <span className="font-medium text-destructive">Panda</span> has the bomb!
        </p>
      </div>
    </div>
  )
}

export function QuizPreview() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
        <h4 className="font-semibold text-foreground text-sm">Speed Quiz</h4>
        <span className="text-xs font-medium px-2 py-1 rounded-md bg-accent/10 text-accent">Q5/10</span>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <Progress value={50} className="h-1.5 flex-1 mr-4" />
          <div className="flex items-center gap-1 text-primary font-bold text-sm">
            <Timer className="h-3.5 w-3.5" />
            <span className="tabular-nums">0:08</span>
          </div>
        </div>
        <div className="mb-5 p-4 rounded-lg bg-muted/50">
          <p className="text-sm font-medium text-foreground text-center leading-relaxed">
            What is the largest planet in our solar system?
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {["Mars", "Jupiter", "Saturn", "Neptune"].map((answer, i) => (
            <Button
              key={answer}
              variant="outline"
              className={`h-10 text-sm font-medium ${i === 1 ? "border-primary/50 bg-primary/5 text-primary" : ""}`}
            >
              {answer}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
