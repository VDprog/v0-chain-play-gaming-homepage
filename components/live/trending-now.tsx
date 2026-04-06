"use client"

import { Bomb, HelpCircle, Handshake, Timer } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface TrendingGame {
  title: string
  icon: LucideIcon
  activeRooms: number
  playersOnline: number
  trend: "hot" | "rising" | "popular"
}

const trendingGames: TrendingGame[] = [
  {
    title: "Pass the Bomb",
    icon: Bomb,
    activeRooms: 12,
    playersOnline: 89,
    trend: "hot",
  },
  {
    title: "Speed Quiz",
    icon: HelpCircle,
    activeRooms: 8,
    playersOnline: 64,
    trend: "rising",
  },
  {
    title: "Split or Steal",
    icon: Handshake,
    activeRooms: 6,
    playersOnline: 42,
    trend: "popular",
  },
  {
    title: "Timer Challenge",
    icon: Timer,
    activeRooms: 4,
    playersOnline: 28,
    trend: "rising",
  },
]

const trendConfig = {
  hot: { label: "Hot", bg: "bg-rose-500/10", text: "text-rose-600" },
  rising: { label: "Rising", bg: "bg-amber-500/10", text: "text-amber-600" },
  popular: { label: "Popular", bg: "bg-primary/10", text: "text-primary" },
}

export function TrendingNow() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border bg-muted/30">
        <h3 className="font-semibold text-foreground">Trending Now</h3>
      </div>
      <div className="divide-y divide-border">
        {trendingGames.map((game) => {
          const Icon = game.icon
          const trend = trendConfig[game.trend]
          return (
            <button
              key={game.title}
              className="group flex items-center justify-between w-full px-5 py-4 text-left transition-all duration-200 hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {game.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span>{game.activeRooms} rooms</span>
                    <span className="text-border">•</span>
                    <span>{game.playersOnline} online</span>
                  </div>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${trend.bg} ${trend.text}`}>
                {trend.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
