"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Handshake, CircleDot, Clock, Timer, Crown, Bomb, ArrowRight, Users, Gamepad2 } from "lucide-react"
import { getRelatedGames, type IconName } from "@/lib/games-data"

interface RelatedGamesProps {
  currentSlug: string
}

const iconMap: Record<IconName, React.ComponentType<{ className?: string }>> = {
  handshake: Handshake,
  "circle-dot": CircleDot,
  clock: Clock,
  timer: Timer,
  crown: Crown,
  bomb: Bomb,
}

export function RelatedGames({ currentSlug }: RelatedGamesProps) {
  const relatedGames = getRelatedGames(currentSlug, 3)

  return (
    <section className="py-16 bg-muted/30 border-t border-border">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Explore</span>
            <h2 className="text-2xl font-bold text-foreground mt-2">Try Similar Games</h2>
            <p className="mt-2 text-muted-foreground">More games you might enjoy</p>
          </div>
          <Link href="/games">
            <Button variant="outline" className="gap-2 font-semibold">
              View all games
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {relatedGames.map((game) => {
            const Icon = iconMap[game.iconName] || Gamepad2
            return (
              <Link key={game.slug} href={`/games/${game.slug}`}>
                <div className="group relative bg-card rounded-xl border border-border p-6 card-premium h-full">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-5 transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/20 group-hover:scale-105">
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
                    {game.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {game.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-5 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <Users className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-medium">{new Intl.NumberFormat("en-US").format(game.playersOnline)}</span>
                    </div>
                    <Button size="sm" className="h-9 px-4 text-xs font-semibold gap-1.5">
                      Play
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Button>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
