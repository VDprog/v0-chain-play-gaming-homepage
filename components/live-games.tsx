"use client"

import { ChevronRight, Radio, Bomb, Crown, HelpCircle, CircleDot } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface LiveRoom {
  title: string
  icon: LucideIcon
  players: string
  status: "live" | "starting"
  statusText: string
  prize?: string
}

const liveRooms: LiveRoom[] = [
  { title: "Pass the Bomb", icon: Bomb, players: "6/8", status: "live", statusText: "Live now", prize: "$50" },
  { title: "Last Survivor", icon: Crown, players: "9/10", status: "live", statusText: "Round 3", prize: "$120" },
  { title: "Quiz Battle", icon: HelpCircle, players: "4/6", status: "starting", statusText: "Starting soon" },
  { title: "Hidden Button", icon: CircleDot, players: "8/8", status: "live", statusText: "In progress", prize: "$25" },
]

export function LiveGames() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Radio className="h-4 w-4 text-emerald-500" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 animate-pulse-live" />
          </div>
          <h3 className="font-semibold text-foreground">Live Games</h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
          4 Active
        </span>
      </div>
      <div className="divide-y divide-border">
        {liveRooms.map((room) => (
          <button
            key={room.title}
            className="group flex items-center justify-between w-full px-5 py-4 text-left transition-all duration-200 hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md">
                <room.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{room.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{room.players} players</span>
                  <span className="text-xs text-border">•</span>
                  <span className={`text-xs font-medium ${room.status === "live" ? "text-emerald-600" : "text-amber-600"}`}>
                    {room.statusText}
                  </span>
                  {room.prize && (
                    <>
                      <span className="text-xs text-border">•</span>
                      <span className="text-xs font-semibold text-primary">{room.prize}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
          </button>
        ))}
      </div>
      <div className="px-5 py-3 border-t border-border bg-muted/20">
        <button className="w-full text-center text-sm font-medium text-primary hover:underline underline-offset-4">
          Browse all live games
        </button>
      </div>
    </div>
  )
}
