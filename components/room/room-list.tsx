"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { RoomCard } from "./room-card"
import { CreateRoomModal } from "./create-room-modal"
import { useRooms } from "@/hooks/use-room"
import { usePlayer } from "@/components/player/player-provider"
import type { RoomWithPlayers } from "@/lib/types/room"

interface RoomListProps {
  gameSlug: string
  gameTitle: string
  initialRooms?: RoomWithPlayers[]
}

export function RoomList({ gameSlug, gameTitle, initialRooms = [] }: RoomListProps) {
  const router = useRouter()
  const { player, isConnected } = usePlayer()
  const { rooms, isLoading, refetch } = useRooms(gameSlug)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const displayRooms = rooms.length > 0 ? rooms : initialRooms

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
    toast.success("Rooms refreshed")
  }

  const handleJoin = async (roomId: string) => {
    if (!isConnected || !player) {
      toast.error("Connect your wallet to join rooms")
      return
    }
    
    try {
      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player_id: player.id }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to join")
      }

      toast.success("Joined room!")
      router.push(`/room/${roomId}`)
    } catch (error) {
      toast.error("Failed to join room", {
        description: error instanceof Error ? error.message : "Please try again",
      })
    }
  }

  const handleSpectate = (roomId: string) => {
    router.push(`/room/${roomId}?spectate=true`)
  }

  return (
    <section id="live-rooms" className="scroll-mt-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Live Rooms</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {displayRooms.length} room{displayRooms.length !== 1 ? "s" : ""} available
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Button 
            size="sm" 
            onClick={() => setShowCreateModal(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Room
          </Button>
        </div>
      </div>

      {isLoading && displayRooms.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : displayRooms.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 py-12">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No rooms available</p>
            <Button onClick={() => setShowCreateModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create the First Room
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              gameTitle={gameTitle}
              onJoin={handleJoin}
              onSpectate={handleSpectate}
            />
          ))}
        </div>
      )}

      <CreateRoomModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        gameSlug={gameSlug}
        gameTitle={gameTitle}
      />
    </section>
  )
}
