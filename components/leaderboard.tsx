"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Flame, TrendingUp } from "lucide-react"

interface Player {
  rank: number
  name: string
  initials: string
  wins: number
  streak: number
  change: "up" | "down" | "same"
}

const players: Player[] = [
  { rank: 1, name: "Vlad", initials: "VL", wins: 234, streak: 12, change: "same" },
  { rank: 2, name: "Eva", initials: "EV", wins: 198, streak: 8, change: "up" },
  { rank: 3, name: "Panda", initials: "PA", wins: 187, streak: 5, change: "up" },
  { rank: 4, name: "Jack", initials: "JK", wins: 156, streak: 3, change: "down" },
  { rank: 5, name: "Adam", initials: "AD", wins: 143, streak: 7, change: "same" },
]

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white text-[10px] font-bold shadow-sm shadow-amber-500/30">
      1
    </div>
  )
  if (rank === 2) return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-500 text-white text-[10px] font-bold shadow-sm">
      2
    </div>
  )
  if (rank === 3) return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white text-[10px] font-bold shadow-sm">
      3
    </div>
  )
  return <div className="flex h-6 w-6 items-center justify-center text-xs font-semibold text-muted-foreground">{rank}</div>
}

export function Leaderboard() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm flex-1">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2.5">
          <Trophy className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground">Top Players</h3>
        </div>
        <a href="#leaderboard" className="text-xs font-semibold text-primary hover:underline underline-offset-2">
          View all
        </a>
      </div>
      <div className="divide-y divide-border">
        {players.map((player) => (
          <div
            key={player.name}
            className="group flex items-center justify-between px-5 py-3.5 transition-colors duration-200 hover:bg-muted/30"
          >
            <div className="flex items-center gap-3">
              <RankBadge rank={player.rank} />
              <Avatar className="h-8 w-8 ring-2 ring-background">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {player.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-foreground">{player.name}</p>
                  {player.change === "up" && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                </div>
                <p className="text-xs text-muted-foreground">{new Intl.NumberFormat("en-US").format(player.wins)} wins</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-orange-500/10">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-xs font-semibold text-orange-600">{player.streak}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
