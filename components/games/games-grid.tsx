"use client"

import { GameCard } from "@/components/games/game-card"
import type { GameData } from "@/lib/games-data"

interface GamesGridProps {
  games: GameData[]
}

export function GamesGrid({ games }: GamesGridProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {games.map((game) => (
        <GameCard key={game.slug} game={game} />
      ))}
    </div>
  )
}
