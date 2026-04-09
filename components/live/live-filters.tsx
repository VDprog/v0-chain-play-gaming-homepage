"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, Bomb, HelpCircle, Handshake, CircleDot, Timer, Crown, LayoutGrid, Radio } from "lucide-react"
import { useLiveContext } from "./live-context"
import { gamesData } from "@/lib/games-data"
import type { SortOption } from "@/hooks/use-live-rooms"

const gameIcons: Record<string, typeof Bomb> = {
  "pass-the-bomb": Bomb,
  "split-or-steal": Handshake,
  "speed-quiz": HelpCircle,
  "hidden-button": CircleDot,
  "timer-challenge": Timer,
  "last-survivor-quiz": Crown,
}

const statusFilters = [
  { label: "All", value: null },
  { label: "Live", value: "live" },
  { label: "Waiting", value: "waiting" },
]

const sortOptions: { label: string; value: SortOption }[] = [
  { label: "Most Active", value: "active" },
  { label: "Newest", value: "newest" },
  { label: "Almost Full", value: "players" },
]

export function LiveFilters() {
  const { gameFilter, statusFilter, sort, setGameFilter, setStatusFilter, setSort } = useLiveContext()
  const [showSort, setShowSort] = useState(false)

  return (
    <section className="py-4 border-b border-border bg-card/50 sticky top-16 z-40 backdrop-blur-sm">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Game filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            {/* All games filter */}
            <button
              onClick={() => setGameFilter(null)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                gameFilter === null
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              All Games
            </button>
            
            {/* Individual game filters */}
            {gamesData.map((game) => {
              const Icon = gameIcons[game.slug] || Radio
              const isActive = gameFilter === game.slug
              return (
                <button
                  key={game.slug}
                  onClick={() => setGameFilter(game.slug)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {game.title}
                </button>
              )
            })}

            {/* Divider */}
            <div className="h-6 w-px bg-border mx-1" />

            {/* Status filters */}
            {statusFilters.map((filter) => {
              const isActive = statusFilter === filter.value
              return (
                <button
                  key={filter.value || "all-status"}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>
          
          {/* Sort dropdown */}
          <div className="relative flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 font-medium"
              onClick={() => setShowSort(!showSort)}
            >
              {sortOptions.find(s => s.value === sort)?.label}
              <ChevronDown className={`h-4 w-4 transition-transform ${showSort ? "rotate-180" : ""}`} />
            </Button>
            {showSort && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
                <div className="absolute right-0 mt-2 w-40 rounded-lg border border-border bg-card shadow-lg z-20 py-1">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSort(option.value)
                        setShowSort(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                        sort === option.value
                          ? "bg-primary/5 text-primary font-medium"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
