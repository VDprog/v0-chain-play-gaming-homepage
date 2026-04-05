"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Flame } from "lucide-react"

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

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 text-[10px] font-bold">1</div>
  if (rank === 2) return <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-400/15 text-slate-500 text-[10px] font-bold">2</div>
  if (rank === 3) return <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-700/15 text-amber-700 text-[10px] font-bold">3</div>
  return <div className="flex h-5 w-5 items-center justify-center text-[10px] font-medium text-muted-foreground">{rank}</div>
}

export function Leaderboard() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex-1">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground text-sm">Top Players</h3>
        </div>
        <a href="#leaderboard" className="text-[11px] font-medium text-primary hover:underline underline-offset-2">
          View all
        </a>
      </div>
      <div className="divide-y divide-border">
        {players.map((player) => (
          <div
            key={player.name}
            className="flex items-center justify-between px-4 py-2.5"
          >
            <div className="flex items-center gap-2.5">
              <RankBadge rank={player.rank} />
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">
                  {player.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">{player.name}</p>
                <p className="text-[11px] text-muted-foreground">{player.wins} wins</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Flame className="h-3 w-3 text-orange-500" />
              <span className="font-medium text-foreground">{player.streak}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
