"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Timer, CheckCircle2, XCircle } from "lucide-react"

export function SplitOrStealPreview() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-foreground">Split or Steal</h4>
          <Badge className="bg-primary/10 text-primary border-primary/20">1v1 Preview</Badge>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-16 w-16 border-4 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">VL</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-foreground">You</span>
            <span className="text-sm text-muted-foreground">500 pts</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-primary">
              <Timer className="h-5 w-5" />
              <span className="text-2xl font-bold">0:15</span>
            </div>
            <span className="text-sm text-muted-foreground">Round 3/5</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-16 w-16 border-4 border-accent/20">
              <AvatarFallback className="bg-accent/10 text-accent text-lg font-bold">EV</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-foreground">Eva</span>
            <span className="text-sm text-muted-foreground">450 pts</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button size="lg" className="h-14 text-lg bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Split
          </Button>
          <Button size="lg" variant="destructive" className="h-14 text-lg">
            <XCircle className="h-5 w-5 mr-2" />
            Steal
          </Button>
        </div>
      </div>
    </div>
  )
}

export function PassTheBombPreview() {
  const players = [
    { initials: "VL", position: "top", isCurrent: false },
    { initials: "EV", position: "right", isCurrent: false },
    { initials: "PA", position: "bottom-right", isCurrent: true },
    { initials: "JK", position: "bottom-left", isCurrent: false },
    { initials: "AD", position: "left", isCurrent: false },
    { initials: "MK", position: "top-left", isCurrent: false },
  ]

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="bg-gradient-to-r from-destructive/10 to-accent/10 px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-foreground">Pass the Bomb</h4>
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">Multiplayer Preview</Badge>
        </div>
      </div>
      <div className="p-6">
        <div className="relative h-52 mb-4">
          {/* Center bomb */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/20 animate-pulse">
              <span className="text-3xl">💣</span>
            </div>
            <div className="flex items-center gap-1 text-destructive font-bold">
              <Timer className="h-4 w-4" />
              <span>0:03</span>
            </div>
          </div>
          {/* Players arranged in circle */}
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
                <Avatar className={`h-12 w-12 border-2 ${player.isCurrent ? "border-destructive ring-2 ring-destructive ring-offset-2" : "border-border"}`}>
                  <AvatarFallback className={`${player.isCurrent ? "bg-destructive/20 text-destructive" : "bg-primary/10 text-primary"} font-semibold`}>
                    {player.initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            )
          })}
        </div>
        <div className="text-center text-sm text-muted-foreground">
          <span className="font-semibold text-destructive">Panda</span> has the bomb!
        </div>
      </div>
    </div>
  )
}

export function QuizPreview() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="bg-gradient-to-r from-accent/10 to-primary/10 px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-foreground">Speed Quiz</h4>
          <div className="flex items-center gap-2">
            <Badge className="bg-accent/10 text-accent border-accent/20">Question 5/10</Badge>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="mb-4">
          <Progress value={50} className="h-2" />
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Progress: 50%</span>
          <div className="flex items-center gap-1 text-primary font-bold">
            <Timer className="h-4 w-4" />
            <span>0:08</span>
          </div>
        </div>
        <div className="mb-6 p-4 rounded-xl bg-muted/50 text-center">
          <p className="text-lg font-semibold text-foreground">
            What is the largest planet in our solar system?
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {["Mars", "Jupiter", "Saturn", "Neptune"].map((answer, i) => (
            <Button
              key={answer}
              variant="outline"
              className={`h-12 text-base font-medium ${i === 1 ? "border-primary/50 bg-primary/5" : ""}`}
            >
              {answer}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
