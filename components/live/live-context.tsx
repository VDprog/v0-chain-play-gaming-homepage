"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { SortOption } from "@/hooks/use-live-rooms"
import { usePlayer } from "@/components/player/player-provider"
import type { GameCategory } from "@/lib/games-data"

interface LiveContextType {
  categoryFilter: GameCategory | null  // Category filter (matches Games page)
  statusFilter: string | null
  networkFilter: string | null  // Tezos network filter
  sort: SortOption
  setCategoryFilter: (category: GameCategory | null) => void
  setStatusFilter: (status: string | null) => void
  setNetworkFilter: (network: string | null) => void
  setSort: (sort: SortOption) => void
}

const LiveContext = createContext<LiveContextType | null>(null)

export function LiveProvider({ children }: { children: ReactNode }) {
  const { network } = usePlayer()
  const [categoryFilter, setCategoryFilter] = useState<GameCategory | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  // Default to current player's network for better UX
  const [networkFilter, setNetworkFilter] = useState<string | null>(network || null)
  const [sort, setSort] = useState<SortOption>("active")

  return (
    <LiveContext.Provider
      value={{
        categoryFilter,
        statusFilter,
        networkFilter,
        sort,
        setCategoryFilter,
        setStatusFilter,
        setNetworkFilter,
        setSort,
      }}
    >
      {children}
    </LiveContext.Provider>
  )
}

export function useLiveContext() {
  const context = useContext(LiveContext)
  if (!context) {
    throw new Error("useLiveContext must be used within LiveProvider")
  }
  return context
}
