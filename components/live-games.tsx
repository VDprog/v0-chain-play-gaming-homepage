"use client"

import { ChevronRight, Radio, Bomb, Crown, HelpCircle, CircleDot } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface LiveRoom {
  title: string
  icon: LucideIcon
  players: string
  status: "live" | "starting"
  statusText: string
}

const liveRooms: LiveRoom[] = [
  { title: "Pass the Bomb", icon: Bomb, players: "6/8", status: "live", statusText: "Live now" },
  { title: "Last Survivor", icon: Crown, players: "9/10", status: "live", statusText: "Round 3" },
  { title: "Quiz Battle", icon: HelpCircle, players: "4/6", status: "starting", statusText: "Starting" },
  { title: "Hidden Button", icon: CircleDot, players: "8/8", status: "live", statusText: "In progress" },
]

export function LiveGames() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio className="h-4 w-4 text-emerald-500" />
            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </div>
          <h3 className="font-semibold text-foreground text-sm">Live Games</h3>
        </div>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
          4 Active
        </span>
      </div>
      <div className="divide-y divide-border">
        {liveRooms.map((room) => (
          <button
            key={room.title}
            className="group flex items-center justify-between w-full px-4 py-3 text-left transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <room.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{room.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{room.players}</span>
                  <span className={room.status === "live" ? "text-emerald-600" : "text-amber-600"}>
                    {room.statusText}
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  )
}
