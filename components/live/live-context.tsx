"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { SortOption } from "@/hooks/use-live-rooms"

interface LiveContextType {
  gameFilter: string | null
  statusFilter: string | null
  sort: SortOption
  setGameFilter: (game: string | null) => void
  setStatusFilter: (status: string | null) => void
  setSort: (sort: SortOption) => void
}

const LiveContext = createContext<LiveContextType | null>(null)

export function LiveProvider({ children }: { children: ReactNode }) {
  const [gameFilter, setGameFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [sort, setSort] = useState<SortOption>("active")

  return (
    <LiveContext.Provider
      value={{
        gameFilter,
        statusFilter,
        sort,
        setGameFilter,
        setStatusFilter,
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
