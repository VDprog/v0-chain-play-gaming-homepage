"use client"

import { Badge } from "@/components/ui/badge"
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
  { title: "Quiz Battle", icon: HelpCircle, players: "4/6", status: "starting", statusText: "Starting in 5s" },
  { title: "Hidden Button", icon: CircleDot, players: "8/8", status: "live", statusText: "In progress" },
]

export function LiveGames() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-primary animate-pulse" />
          <h3 className="text-lg font-bold text-foreground">Live Games Now</h3>
        </div>
        <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
          4 Active
        </Badge>
      </div>
      <div className="space-y-3">
        {liveRooms.map((room) => (
          <div
            key={room.title}
            className="group flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-4 transition-all hover:border-primary/30 hover:bg-primary/5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <room.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{room.title}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{room.players} players</span>
                  <span className={`text-xs font-medium ${
                    room.status === "live" ? "text-green-600" : 
                    room.status === "starting" ? "text-amber-600" : "text-muted-foreground"
                  }`}>
                    {room.statusText}
                  </span>
                </div>
              </div>
            </div>
            <Button size="icon" variant="ghost" className="h-8 w-8 group-hover:bg-primary group-hover:text-primary-foreground">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button variant="outline" className="mt-4 w-full">
        View All Live Games
      </Button>
    </div>
  )
}
