"use client"

import useSWR from "swr"
import type { RoomWithPlayers } from "@/lib/types/room"
import { ROOM_TIMEOUTS } from "@/lib/room-lifecycle-utils"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

export type SortOption = "active" | "newest" | "players"

interface UseLiveRoomsOptions {
  gameSlug?: string | null
  status?: string | null
  network?: string | null  // Filter by Tezos network (ghostnet/mainnet)
  sort?: SortOption
  limit?: number
  refreshInterval?: number
}

export function useLiveRooms(options: UseLiveRoomsOptions = {}) {
  const {
    gameSlug,
    status,
    network,  // Tezos network filter
    sort = "active",
    limit = 50,
    refreshInterval = 5000, // Poll every 5 seconds
  } = options

  // Build query string
  const params = new URLSearchParams()
  if (gameSlug) params.set("game", gameSlug)
  if (status) params.set("status", status)
  if (network) params.set("network", network)
  params.set("limit", limit.toString())

  const queryString = params.toString()
  const url = `/api/rooms${queryString ? `?${queryString}` : ""}`

  const { data, error, isLoading, mutate } = useSWR<{ rooms: RoomWithPlayers[] }>(
    url,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  )

  // Filter out invalid/orphaned/stale rooms with safe null checks
  const now = Date.now()
  const validRooms = (data?.rooms || []).filter(room => {
    // Guard against malformed room data
    if (!room || typeof room !== 'object') return false
    
    // Exclude rooms without players (orphaned)
    const playerCount = typeof room.player_count === 'number' ? room.player_count : 0
    if (playerCount === 0) return false
    
    // Exclude rooms with invalid status
    const status = room.status
    if (!status || !["waiting", "starting", "live"].includes(status)) return false
    
    // Client-side stale detection as backup safety layer
    // Use safe timestamp fallback: updated_at > started_at > created_at
    const activityTime = new Date(
      room.updated_at || room.started_at || room.created_at || new Date().toISOString()
    ).getTime()
    const age = now - activityTime
    
    // Apply status-specific timeout rules
    if (status === "waiting" && age > ROOM_TIMEOUTS.WAITING) return false
    if (status === "starting" && age > ROOM_TIMEOUTS.STARTING) return false
    if (status === "live" && age > ROOM_TIMEOUTS.LIVE) return false
    
    return true
  })
  
  const sortedRooms = sortRooms(validRooms, sort)

  // Calculate stats
  const stats = {
    totalRooms: sortedRooms.length,
    liveRooms: sortedRooms.filter(r => r.status === "live").length,
    waitingRooms: sortedRooms.filter(r => r.status === "waiting").length,
    startingRooms: sortedRooms.filter(r => r.status === "starting").length,
    totalPlayers: sortedRooms.reduce((acc, r) => acc + r.player_count, 0),
  }

  return {
    rooms: sortedRooms,
    stats,
    isLoading,
    error,
    refetch: mutate,
  }
}

function sortRooms(rooms: RoomWithPlayers[], sort: SortOption): RoomWithPlayers[] {
  const statusPriority: Record<string, number> = {
    live: 0,
    starting: 1,
    waiting: 2,
  }

  return [...rooms].sort((a, b) => {
    // First sort by status (live > starting > waiting)
    const statusDiff = (statusPriority[a.status] ?? 99) - (statusPriority[b.status] ?? 99)
    if (statusDiff !== 0) return statusDiff

    // Then by secondary criteria
    switch (sort) {
      case "active":
        // More players = more active
        return b.player_count - a.player_count
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case "players":
        // Sort by how full the room is
        const aFill = a.player_count / a.max_players
        const bFill = b.player_count / b.max_players
        return bFill - aFill
      default:
        return 0
    }
  })
}
