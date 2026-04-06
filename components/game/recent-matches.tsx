"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Skull, Flame, Clock } from "lucide-react"

const matches = [
  {
    id: 1,
    winner: { name: "Vlad", initials: "V" },
    loser: { name: "Jack", initials: "J" },
    result: "defeated",
    rounds: 3,
    timeAgo: "2 min ago",
    stat: { label: "5 passes", icon: Flame },
  },
  {
    id: 2,
    winner: { name: "Eva", initials: "E" },
    loser: null,
    result: "won in 3 rounds",
    rounds: 3,
    timeAgo: "5 min ago",
    stat: { label: "Perfect game", icon: Trophy },
  },
  {
    id: 3,
    winner: { name: "Panda", initials: "P" },
    loser: null,
    result: "survived 5 passes",
    rounds: 2,
    timeAgo: "8 min ago",
    stat: { label: "Close call", icon: Clock },
  },
  {
    id: 4,
    winner: null,
    loser: { name: "Jack", initials: "J" },
    result: "eliminated first",
    rounds: 1,
    timeAgo: "12 min ago",
    stat: { label: "Unlucky", icon: Skull },
  },
  {
    id: 5,
    winner: { name: "Mike", initials: "M" },
    loser: { name: "Sara", initials: "S" },
    result: "defeated",
    rounds: 4,
    timeAgo: "15 min ago",
    stat: { label: "Epic battle", icon: Flame },
  },
]

export function RecentMatches() {
  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="p-5 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Recent Matches</h3>
        <p className="text-sm text-muted-foreground mt-1">Latest game results</p>
      </div>
      <div className="divide-y divide-border">
        {matches.map((match) => (
          <div key={match.id} className="p-4 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-4">
              {/* Players */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {match.winner && (
                  <Avatar className="h-9 w-9 border-2 border-emerald-200">
                    <AvatarFallback className="bg-emerald-500/10 text-emerald-600 text-xs font-semibold">
                      {match.winner.initials}
                    </AvatarFallback>
                  </Avatar>
                )}
                {match.loser && !match.winner && (
                  <Avatar className="h-9 w-9 border-2 border-rose-200">
                    <AvatarFallback className="bg-rose-500/10 text-rose-600 text-xs font-semibold">
                      {match.loser.initials}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {match.winner && <span className="text-emerald-600">{match.winner.name}</span>}
                    {match.winner && match.loser && <span className="text-muted-foreground"> {match.result} </span>}
                    {match.loser && <span className={match.winner ? "text-rose-500" : "text-rose-600"}>{match.loser.name}</span>}
                    {!match.loser && match.winner && <span className="text-muted-foreground"> {match.result}</span>}
                    {!match.winner && match.loser && <span className="text-muted-foreground"> was {match.result}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{match.timeAgo}</p>
                </div>
              </div>

              {/* Stat badge */}
              <Badge variant="secondary" className="text-[10px] font-medium gap-1 shrink-0">
                <match.stat.icon className="h-3 w-3" />
                {match.stat.label}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
