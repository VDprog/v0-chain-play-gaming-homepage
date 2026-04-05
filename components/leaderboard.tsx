"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Flame, Medal } from "lucide-react"

interface Player {
  rank: number
  name: string
  initials: string
  wins: number
  streak: number
}

const players: Player[] = [
  { rank: 1, name: "Vlad", initials: "VL", wins: 234, streak: 12 },
  { rank: 2, name: "Eva", initials: "EV", wins: 198, streak: 8 },
  { rank: 3, name: "Panda", initials: "PA", wins: 187, streak: 5 },
  { rank: 4, name: "Jack", initials: "JK", wins: 156, streak: 3 },
  { rank: 5, name: "Adam", initials: "AD", wins: 143, streak: 7 },
]

function getRankIcon(rank: number) {
  if (rank === 1) return <Trophy className="h-5 w-5 text-amber-500" />
  if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />
  return <span className="w-5 text-center font-bold text-muted-foreground">#{rank}</span>
}

export function Leaderboard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Top Players</h3>
        </div>
        <a href="#leaderboard" className="text-sm font-medium text-primary hover:underline">
          View all
        </a>
      </div>
      <div className="space-y-3">
        {players.map((player) => (
          <div
            key={player.name}
            className={`flex items-center justify-between rounded-xl p-3 transition-colors ${
              player.rank <= 3 ? "bg-primary/5" : "hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center">
                {getRankIcon(player.rank)}
              </div>
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {player.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{player.name}</p>
                <p className="text-xs text-muted-foreground">{player.wins} wins</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-medium text-foreground">{player.streak}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
