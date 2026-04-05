"use client"

import { Button } from "@/components/ui/button"
import { ChevronRight, Radio, Bomb, Crown, HelpCircle, CircleDot } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface LiveRoom {
  title: string
  icon: LucideIcon
  players: string
  status: "live" | "starting" | "waiting"
  statusText: string
}

const liveRooms: LiveRoom[] = [
  { title: "Pass the Bomb", icon: Bomb, players: "6/8", status: "live", statusText: "Live now" },
  { title: "Last Survivor", icon: Crown, players: "9/10", status: "live", statusText: "Round 3" },
  { title: "Quiz Battle", icon: HelpCircle, players: "4/6", status: "starting", statusText: "Starting 5s" },
  { title: "Hidden Button", icon: CircleDot, players: "8/8", status: "live", statusText: "In progress" },
]

export function LiveGames() {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Radio className="h-4 w-4 text-green-500" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <h3 className="font-semibold text-foreground">Live Games</h3>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-md bg-green-500/10 text-green-600">
          4 Active
        </span>
      </div>
      <div className="divide-y divide-border">
        {liveRooms.map((room) => (
          <div
            key={room.title}
            className="group flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8 text-primary">
                <room.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{room.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{room.players}</span>
                  <span className={`font-medium ${
                    room.status === "live" ? "text-green-600" : 
                    room.status === "starting" ? "text-amber-600" : ""
                  }`}>
                    {room.statusText}
                  </span>
                </div>
              </div>
            </div>
            <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-border">
        <Button variant="ghost" className="w-full h-9 text-sm text-muted-foreground hover:text-foreground">
          View All Live Games
        </Button>
      </div>
    </div>
  )
}
