"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Users, 
  Clock, 
  Play, 
  LogOut, 
  Check, 
  Crown,
  Eye,
  Loader2,
  Copy
} from "lucide-react"
import { toast } from "sonner"
import { useRoom } from "@/hooks/use-room"
import { usePlayer } from "@/components/player/player-provider"
import { RoomLobby } from "./room-lobby"
import { RoomGame } from "./room-game"
import type { RoomWithPlayers } from "@/lib/types/room"
import type { Game } from "@/lib/games-data"

interface RoomContentProps {
  initialRoom: RoomWithPlayers
  game: Game | null
  isSpectator?: boolean
}

const statusLabels: Record<string, string> = {
  waiting: "Waiting for Players",
  starting: "Starting Soon",
  live: "Game in Progress",
  finished: "Game Ended",
  expired: "Room Expired",
}

export function RoomContent({ initialRoom, game, isSpectator = false }: RoomContentProps) {
  const router = useRouter()
  const { player, isConnected } = usePlayer()
  const { room, isLoading, joinRoom, leaveRoom, setReady, startGame } = useRoom(initialRoom.id)
  
  const [isJoining, setIsJoining] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  
  const currentRoom = room || initialRoom
  const roomName = currentRoom.name || `Room #${currentRoom.id.slice(0, 4).toUpperCase()}`
  
  // Check if current player is in the room
  const currentPlayerInRoom = player 
    ? currentRoom.players.find(p => p.id === player.id)
    : null
  const isHost = currentPlayerInRoom?.role === "host"
  const isInRoom = !!currentPlayerInRoom
  const isReady = currentPlayerInRoom?.is_ready || false

  // Auto-join as spectator if URL has spectate param
  useEffect(() => {
    if (isSpectator && isConnected && player && !isInRoom && currentRoom.status === "live") {
      handleJoinAsSpectator()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpectator, isConnected, player?.id, isInRoom])

  const handleJoin = async () => {
    if (!player) {
      toast.error("Please create a profile first")
      return
    }
    
    setIsJoining(true)
    try {
      await joinRoom(player.id)
      toast.success("Joined the room!")
    } catch (error) {
      toast.error("Failed to join", {
        description: error instanceof Error ? error.message : "Please try again",
      })
    } finally {
      setIsJoining(false)
    }
  }

  const handleJoinAsSpectator = async () => {
    if (!player) return
    
    try {
      await joinRoom(player.id, "spectator")
      toast.success("Joined as spectator")
    } catch {
      // Silently fail for spectator join
    }
  }

  const handleLeave = async () => {
    if (!player) return
    
    setIsLeaving(true)
    try {
      await leaveRoom(player.id)
      toast.success("Left the room")
      router.push(`/games/${currentRoom.game_slug}`)
    } catch {
      toast.error("Failed to leave room")
    } finally {
      setIsLeaving(false)
    }
  }

  const handleToggleReady = async () => {
    if (!player) return
    
    try {
      await setReady(player.id, !isReady)
      toast.success(isReady ? "Not ready" : "Ready!")
    } catch {
      toast.error("Failed to update ready status")
    }
  }

  const handleStartGame = async () => {
    if (!player) return
    
    try {
      await startGame(player.id)
      toast.success("Game starting!")
    } catch (error) {
      toast.error("Failed to start game", {
        description: error instanceof Error ? error.message : "Please try again",
      })
    }
  }

  const handleCopyRoomLink = () => {
    const url = `${window.location.origin}/room/${currentRoom.id}`
    navigator.clipboard.writeText(url)
    toast.success("Room link copied!")
  }

  // Check if all non-host players are ready (host doesn't need to ready up)
  const nonHostPlayers = currentRoom.players.filter(p => p.role !== "spectator" && p.role !== "host")
  const allPlayersReady = nonHostPlayers.length === 0 || nonHostPlayers.every(p => p.is_ready)
  const canStart = isHost && allPlayersReady && currentRoom.player_count >= 2

  return (
    <main className="min-h-[calc(100vh-4rem)]">
      {/* Room Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left: Back + Room Info */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/games/${currentRoom.game_slug}`}>
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground">{roomName}</h1>
                  <Badge variant={currentRoom.status === "live" ? "default" : "secondary"}>
                    {statusLabels[currentRoom.status]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {game?.title || currentRoom.game_slug}
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyRoomLink}>
                <Copy className="h-4 w-4 mr-2" />
                Share
              </Button>
              {isInRoom && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLeave}
                  disabled={isLeaving}
                  className="text-destructive hover:text-destructive"
                >
                  {isLeaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <LogOut className="h-4 w-4 mr-2" />
                  )}
                  Leave
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Room Content based on status */}
      {currentRoom.status === "waiting" || currentRoom.status === "starting" ? (
        <RoomLobby
          room={currentRoom}
          game={game}
          player={player}
          isInRoom={isInRoom}
          isHost={isHost}
          isReady={isReady}
          isJoining={isJoining}
          canStart={canStart}
          onJoin={handleJoin}
          onToggleReady={handleToggleReady}
          onStartGame={handleStartGame}
        />
      ) : currentRoom.status === "live" ? (
        <RoomGame
          room={currentRoom}
          game={game}
          player={player}
          isInRoom={isInRoom}
          isSpectator={currentPlayerInRoom?.role === "spectator"}
        />
      ) : currentRoom.status === "expired" ? (
        // Expired state
        <div className="container mx-auto px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Room Expired</h2>
          <p className="text-muted-foreground mb-6">This room has expired due to inactivity.</p>
          <Button asChild>
            <Link href={`/games/${currentRoom.game_slug}`}>
              Find Another Room
            </Link>
          </Button>
        </div>
      ) : (
        // Finished state
        <div className="container mx-auto px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Game Ended</h2>
          <p className="text-muted-foreground mb-6">This game has finished.</p>
          <Button asChild>
            <Link href={`/games/${currentRoom.game_slug}`}>
              Back to {game?.title || "Game"}
            </Link>
          </Button>
        </div>
      )}
    </main>
  )
}
