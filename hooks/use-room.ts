"use client"

import useSWR from "swr"
import type { RoomWithPlayers, CreateRoomInput, RoomPlayerRole } from "@/lib/types/room"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

export function useRoom(roomId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<{ room: RoomWithPlayers }>(
    roomId ? `/api/rooms/${roomId}` : null,
    fetcher,
    {
      refreshInterval: 3000, // Poll every 3 seconds for real-time updates
      revalidateOnFocus: true,
    }
  )

  const joinRoom = async (playerId: string, role?: RoomPlayerRole) => {
    if (!roomId) throw new Error("Room ID required")
    
    const response = await fetch(`/api/rooms/${roomId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player_id: playerId, role }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to join room")
    }

    const result = await response.json()
    mutate({ room: result.room }, false)
    return result
  }

  const leaveRoom = async (playerId: string) => {
    if (!roomId) throw new Error("Room ID required")
    
    const response = await fetch(`/api/rooms/${roomId}/join?player_id=${playerId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to leave room")
    }

    mutate()
    return true
  }

  const setReady = async (playerId: string, isReady: boolean) => {
    if (!roomId) throw new Error("Room ID required")
    
    const response = await fetch(`/api/rooms/${roomId}/ready`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player_id: playerId, is_ready: isReady }),
    })

    if (!response.ok) {
      throw new Error("Failed to update ready status")
    }

    const result = await response.json()
    mutate({ room: result.room }, false)
    return result
  }

  const updateStatus = async (status: string) => {
    if (!roomId) throw new Error("Room ID required")
    
    const response = await fetch(`/api/rooms/${roomId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      throw new Error("Failed to update room status")
    }

    mutate()
    return true
  }

  return {
    room: data?.room || null,
    isLoading,
    error,
    joinRoom,
    leaveRoom,
    setReady,
    updateStatus,
    refetch: mutate,
  }
}

export function useRooms(gameSlug?: string, status?: string) {
  const params = new URLSearchParams()
  if (gameSlug) params.set("game", gameSlug)
  if (status) params.set("status", status)
  
  const { data, error, isLoading, mutate } = useSWR<{ rooms: RoomWithPlayers[] }>(
    `/api/rooms?${params.toString()}`,
    fetcher,
    {
      refreshInterval: 5000, // Poll every 5 seconds
      revalidateOnFocus: true,
    }
  )

  const createRoom = async (input: Omit<CreateRoomInput, "created_by"> & { created_by: string }) => {
    const response = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create room")
    }

    const result = await response.json()
    mutate()
    return result.room as RoomWithPlayers
  }

  return {
    rooms: data?.rooms || [],
    isLoading,
    error,
    createRoom,
    refetch: mutate,
  }
}
