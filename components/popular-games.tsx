"use client"

import { GameCard } from "@/components/game-card"
import { Handshake, Bomb, CircleDot, Clock, Timer, Crown } from "lucide-react"

const games = [
  {
    title: "Split or Steal",
    description: "Trust or betray? Make your choice in this classic game theory challenge.",
    icon: Handshake,
    players: 1243,
    badge: "Trending",
    accentColor: "primary",
  },
  {
    title: "Pass the Bomb",
    description: "Quick reactions needed! Pass the bomb before time runs out.",
    icon: Bomb,
    players: 892,
    badge: "Live",
    accentColor: "destructive",
  },
  {
    title: "Hidden Button",
    description: "Find the invisible button before anyone else. Speed matters!",
    icon: CircleDot,
    players: 567,
    accentColor: "accent",
  },
  {
    title: "Speed Quiz",
    description: "Answer faster than your opponents in rapid-fire trivia battles.",
    icon: Clock,
    players: 2341,
    badge: "Popular",
    accentColor: "chart1",
  },
  {
    title: "Timer Challenge",
    description: "Stop the timer at exactly the right moment. Precision wins.",
    icon: Timer,
    players: 456,
    accentColor: "chart2",
  },
  {
    title: "Last Survivor Quiz",
    description: "Answer correctly or get eliminated. Only one player survives.",
    icon: Crown,
    players: 1087,
    badge: "New",
    accentColor: "chart3",
  },
]

export function PopularGames() {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Popular Games</h2>
            <p className="mt-2 text-muted-foreground">Join thousands of players in these fan favorites</p>
          </div>
          <a href="#games" className="text-sm font-medium text-primary hover:underline">
            View all games
          </a>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <GameCard key={game.title} {...game} />
          ))}
        </div>
      </div>
    </section>
  )
}
