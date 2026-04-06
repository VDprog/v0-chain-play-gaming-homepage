"use client"

import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Room {
  id: string
  title: string
  roomNumber: string
  status: "live" | "starting" | "waiting"
  players: number
  maxPlayers: number
}

export function useGameActions() {
  const router = useRouter()

  const joinRoom = (room: Room) => {
    if (room.status === "live") {
      toast.info("Match in Progress", {
        description: `${room.title} ${room.roomNumber} is currently live. You can watch or wait for the next round.`,
      })
      return
    }

    if (room.players >= room.maxPlayers) {
      toast.error("Room Full", {
        description: "This room is at maximum capacity. Try another room or quick join.",
      })
      return
    }

    // Simulate joining room
    toast.success("Joining Room", {
      description: `You are joining ${room.title} ${room.roomNumber}. Get ready!`,
    })
  }

  const watchRoom = (room: Room) => {
    if (room.status === "waiting") {
      toast.info("Match Not Started", {
        description: "This match hasn't started yet. Join as a player instead!",
      })
      return
    }

    toast.success("Spectator Mode", {
      description: `Now watching ${room.title} ${room.roomNumber}`,
    })
  }

  const quickJoin = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: "Finding the best available room...",
        success: "Found a room! Joining Pass the Bomb Room #301",
        error: "No available rooms right now. Try again later.",
      }
    )
  }

  const playGame = (gameSlug: string, gameName: string) => {
    toast.success("Starting Game", {
      description: `Finding a room for ${gameName}...`,
    })
    router.push(`/games/${gameSlug}`)
  }

  const viewGameDetails = (gameSlug: string) => {
    router.push(`/games/${gameSlug}`)
  }

  const comingSoon = (featureName: string) => {
    toast.info("Coming Soon", {
      description: `${featureName} will be available soon. Stay tuned!`,
    })
  }

  const notifyAction = (type: "success" | "error" | "info" | "warning", title: string, description?: string) => {
    toast[type](title, { description })
  }

  return {
    joinRoom,
    watchRoom,
    quickJoin,
    playGame,
    viewGameDetails,
    comingSoon,
    notifyAction,
  }
}
