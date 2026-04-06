"use client"

import Link from "next/link"
import { GameCard } from "@/components/games/game-card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { gamesData } from "@/lib/games-data"

export function PopularGames() {
  return (
    <section id="games" className="py-20 bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Most Played</span>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl mt-2">Popular Games</h2>
            <p className="mt-2 text-muted-foreground max-w-md">Join thousands of players competing in these fan favorites</p>
          </div>
          <Button asChild variant="outline" className="gap-2 font-semibold self-start sm:self-auto">
            <Link href="/games">
              View all games
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {gamesData.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      </div>
    </section>
  )
}
