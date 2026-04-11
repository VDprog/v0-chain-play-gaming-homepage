"use client"

import useSWR from "swr"
import type { RoomWithPlayers } from "@/lib/types/room"

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

  // Filter out invalid/orphaned rooms and sort
  const validRooms = data?.rooms?.filter(room => {
    // Exclude rooms without players (orphaned)
    if (room.player_count === 0) return false
    // Exclude rooms with invalid status
    if (!["waiting", "starting", "live"].includes(room.status)) return false
    return true
  }) || []
  
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
