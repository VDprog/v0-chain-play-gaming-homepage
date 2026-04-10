"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { SortOption } from "@/hooks/use-live-rooms"
import { usePlayer } from "@/components/player/player-provider"

interface LiveContextType {
  gameFilter: string | null
  statusFilter: string | null
  networkFilter: string | null  // Tezos network filter
  sort: SortOption
  setGameFilter: (game: string | null) => void
  setStatusFilter: (status: string | null) => void
  setNetworkFilter: (network: string | null) => void
  setSort: (sort: SortOption) => void
}

const LiveContext = createContext<LiveContextType | null>(null)

export function LiveProvider({ children }: { children: ReactNode }) {
  const { network } = usePlayer()
  const [gameFilter, setGameFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  // Default to current player's network for better UX
  const [networkFilter, setNetworkFilter] = useState<string | null>(network || null)
  const [sort, setSort] = useState<SortOption>("active")

  return (
    <LiveContext.Provider
      value={{
        gameFilter,
        statusFilter,
        networkFilter,
        sort,
        setGameFilter,
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
