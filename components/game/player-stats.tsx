"use client"

import { Trophy, XCircle, Flame, Gamepad2, Target } from "lucide-react"

const stats = [
  { label: "Wins", value: "24", icon: Trophy, color: "text-emerald-500" },
  { label: "Losses", value: "12", icon: XCircle, color: "text-rose-500" },
  { label: "Win Streak", value: "5", icon: Flame, color: "text-amber-500" },
  { label: "Total Matches", value: "36", icon: Gamepad2, color: "text-primary" },
  { label: "Win Rate", value: "67%", icon: Target, color: "text-primary" },
]

export function PlayerStats() {
  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="p-5 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Your Stats</h3>
        <p className="text-sm text-muted-foreground mt-1">Track your progress</p>
      </div>
      <div className="p-5 space-y-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-muted ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <span className="text-lg font-semibold text-foreground">{stat.value}</span>
          </div>
        ))}
      </div>
      <div className="p-5 border-t border-border">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Favorite Game</p>
          <p className="text-sm font-semibold text-foreground">Pass the Bomb</p>
        </div>
      </div>
    </div>
  )
}
