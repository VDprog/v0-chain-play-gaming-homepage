"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { GameCard } from "@/components/games/game-card"
import { LayoutGrid, Users, Swords, Brain, MessageCircle, Zap, Trophy } from "lucide-react"
import type { GameData, GameCategory } from "@/lib/games-data"
import { allCategories } from "@/lib/games-data"

interface GameStats {
  game_slug: string
  active_rooms: number
  live_rooms: number
  waiting_rooms: number
  total_players: number
}

interface GamesGridProps {
  games: GameData[]
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

const categoryIcons: Record<string, typeof LayoutGrid> = {
  "1v1": Swords,
  "Multiplayer": Users,
  "Quiz": Brain,
  "Social": MessageCircle,
  "Reaction": Zap,
  "Final": Trophy,
}

export function GamesGrid({ games }: GamesGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | null>(null)
  
  // Fetch real stats from API
  const { data } = useSWR<{ stats: GameStats[] }>("/api/games/stats", fetcher, {
    refreshInterval: 10000, // Refresh every 10 seconds
    revalidateOnFocus: true,
  })

  // Merge static game data with live stats
  const gamesWithStats = games.map(game => {
    const stats = data?.stats?.find(s => s.game_slug === game.slug)
    return {
      ...game,
      playersOnline: stats?.total_players || 0,
      activeRooms: stats?.active_rooms || 0,
      // Update badge based on live activity
      badge: stats?.live_rooms && stats.live_rooms > 0 ? "Live" : game.badge,
      badgeType: stats?.live_rooms && stats.live_rooms > 0 ? "live" as const : game.badgeType,
    }
  })

  // Filter games by selected category
  const filteredGames = selectedCategory
    ? gamesWithStats.filter(game => game.categories.includes(selectedCategory))
    : gamesWithStats

  // Sort games: active first, then by activity, then coming soon at the end
  const sortedGames = [...filteredGames].sort((a, b) => {
    // Coming soon games go to the end
    if (a.status === "coming_soon" && b.status !== "coming_soon") return 1
    if (b.status === "coming_soon" && a.status !== "coming_soon") return -1
    // Games with live rooms first
    if (a.activeRooms > 0 && b.activeRooms === 0) return -1
    if (b.activeRooms > 0 && a.activeRooms === 0) return 1
    // Then by player count
    if (a.playersOnline !== b.playersOnline) return b.playersOnline - a.playersOnline
    // Then alphabetically
    return a.title.localeCompare(b.title)
  })

  return (
    <div className="space-y-8">
      {/* Category Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* All filter */}
        <button
          onClick={() => setSelectedCategory(null)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
            selectedCategory === null
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          }`}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          All
        </button>

        {/* Category filters */}
        {allCategories.map((category) => {
          const Icon = categoryIcons[category] || LayoutGrid
          const isActive = selectedCategory === category
          // Count games in this category
          const count = gamesWithStats.filter(g => g.categories.includes(category)).length
          
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {category}
              <span className={`text-xs ${isActive ? "text-primary-foreground/70" : "text-muted-foreground/70"}`}>
                ({count})
              </span>
            </button>
          )
        })}
      </div>

      {/* Games Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sortedGames.map((game) => (
          <GameCard key={game.slug} game={game} />
        ))}
      </div>

      {/* Empty state */}
      {sortedGames.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No games found in this category.</p>
        </div>
      )}
    </div>
  )
}
