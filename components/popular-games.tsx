"use client"

import { GameCard } from "@/components/game-card"
import { Handshake, Bomb, CircleDot, Clock, Timer, Crown } from "lucide-react"

const games = [
  {
    title: "Split or Steal",
    description: "Trust or betray? A classic game theory challenge with real stakes.",
    icon: Handshake,
    players: 1243,
    badge: "Trending",
    badgeType: "trending" as const,
  },
  {
    title: "Pass the Bomb",
    description: "Quick reactions needed. Pass the bomb before time runs out.",
    icon: Bomb,
    players: 892,
    badge: "Live",
    badgeType: "live" as const,
  },
  {
    title: "Hidden Button",
    description: "Find the invisible button before anyone else. Speed wins.",
    icon: CircleDot,
    players: 567,
  },
  {
    title: "Speed Quiz",
    description: "Answer faster than opponents in rapid-fire trivia battles.",
    icon: Clock,
    players: 2341,
    badge: "Popular",
    badgeType: "popular" as const,
  },
  {
    title: "Timer Challenge",
    description: "Stop the timer at exactly the right moment. Precision wins.",
    icon: Timer,
    players: 456,
  },
  {
    title: "Last Survivor Quiz",
    description: "Answer correctly or get eliminated. Only one survives.",
    icon: Crown,
    players: 1087,
    badge: "New",
    badgeType: "new" as const,
  },
]

export function PopularGames() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">Popular Games</h2>
            <p className="mt-1 text-sm text-muted-foreground">Join thousands of players in these fan favorites</p>
          </div>
          <a href="#games" className="text-sm font-medium text-primary hover:underline underline-offset-4 hidden sm:block">
            View all games
          </a>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <GameCard key={game.title} {...game} />
          ))}
        </div>
      </div>
    </section>
  )
}
