"use client"

import { GameCard } from "@/components/game-card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const games = [
  {
    title: "Split or Steal",
    description: "Trust or betray? A classic game theory challenge with real stakes.",
    iconName: "handshake" as const,
    players: 1243,
    badge: "Trending",
    badgeType: "trending" as const,
  },
  {
    title: "Pass the Bomb",
    description: "Quick reactions needed. Pass the bomb before time runs out.",
    iconName: "bomb" as const,
    players: 892,
    badge: "Live",
    badgeType: "live" as const,
  },
  {
    title: "Hidden Button",
    description: "Find the invisible button before anyone else. Speed wins.",
    iconName: "circle-dot" as const,
    players: 567,
  },
  {
    title: "Speed Quiz",
    description: "Answer faster than opponents in rapid-fire trivia battles.",
    iconName: "clock" as const,
    players: 2341,
    badge: "Popular",
    badgeType: "popular" as const,
  },
  {
    title: "Timer Challenge",
    description: "Stop the timer at exactly the right moment. Precision wins.",
    iconName: "timer" as const,
    players: 456,
  },
  {
    title: "Last Survivor Quiz",
    description: "Answer correctly or get eliminated. Only one survives.",
    iconName: "crown" as const,
    players: 1087,
    badge: "New",
    badgeType: "new" as const,
  },
]

export function PopularGames() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Most Played</span>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl mt-2">Popular Games</h2>
            <p className="mt-2 text-muted-foreground max-w-md">Join thousands of players competing in these fan favorites</p>
          </div>
          <Button variant="outline" className="gap-2 font-semibold self-start sm:self-auto">
            View all games
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <GameCard key={game.title} {...game} />
          ))}
        </div>
      </div>
    </section>
  )
}
