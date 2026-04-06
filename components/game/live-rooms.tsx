"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Eye, Plus } from "lucide-react"
import { toast } from "sonner"

interface LiveRoomsProps {
  gameTitle: string
}

const rooms = [
  {
    id: 204,
    players: [
      { name: "Vlad", initials: "V" },
      { name: "Eva", initials: "E" },
      { name: "Panda", initials: "P" },
    ],
    maxPlayers: 4,
    status: "Waiting",
    round: null,
  },
  {
    id: 118,
    players: [
      { name: "Jack", initials: "J" },
      { name: "Mike", initials: "M" },
      { name: "Sara", initials: "S" },
      { name: "Tom", initials: "T" },
    ],
    maxPlayers: 4,
    status: "Live",
    round: 2,
  },
  {
    id: 322,
    players: [
      { name: "Alex", initials: "A" },
      { name: "Kim", initials: "K" },
      { name: "Leo", initials: "L" },
      { name: "Mia", initials: "M" },
      { name: "Zoe", initials: "Z" },
    ],
    maxPlayers: 6,
    status: "Starting",
    round: null,
  },
  {
    id: 445,
    players: [
      { name: "Dan", initials: "D" },
      { name: "Ivy", initials: "I" },
    ],
    maxPlayers: 4,
    status: "Finished",
    round: 3,
  },
]

export function LiveRooms({ gameTitle }: LiveRoomsProps) {
  const handleJoinRoom = (roomId: number, status: string) => {
    if (status === "Live") {
      toast.info("Room in progress", {
        description: `Room #${roomId} is currently live. Watch or wait for the next round.`,
      })
      return
    }
    toast.success(`Joining Room #${roomId}`, {
      description: `Get ready for ${gameTitle}!`,
    })
  }

  const handleSpectate = (roomId: number) => {
    toast.success("Spectator Mode", {
      description: `Now watching Room #${roomId}`,
    })
  }

  const handleCreateRoom = () => {
    toast.success("Creating Room", {
      description: `Setting up a new ${gameTitle} room...`,
    })
  }

  const handleViewResults = (roomId: number) => {
    toast.info("Match Results", {
      description: `Viewing results for Room #${roomId}`,
    })
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Waiting":
        return "bg-amber-500/10 text-amber-600 border-amber-200"
      case "Live":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200"
      case "Starting":
        return "bg-primary/10 text-primary border-primary/20"
      case "Finished":
        return "bg-muted text-muted-foreground border-border"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Join Now</span>
            <h2 className="text-2xl font-bold text-foreground mt-2">Live Rooms</h2>
            <p className="mt-2 text-muted-foreground">Jump into an active game or create your own</p>
          </div>
          <Button className="gap-2 font-semibold self-start sm:self-auto" onClick={handleCreateRoom}>
            <Plus className="h-4 w-4" />
            Create Room
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="group relative bg-card rounded-xl border border-border p-5 card-premium"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-foreground">Room #{room.id}</span>
                <Badge variant="outline" className={`text-[10px] font-semibold ${getStatusStyles(room.status)}`}>
                  {room.status === "Live" && (
                    <span className="relative flex h-1.5 w-1.5 mr-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                  )}
                  {room.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex -space-x-2">
                  {room.players.slice(0, 4).map((player, i) => (
                    <Avatar key={i} className="h-8 w-8 border-2 border-card">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {player.initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {room.players.length > 4 && (
                    <div className="h-8 w-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-semibold text-muted-foreground">
                      +{room.players.length - 4}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{room.players.length}/{room.maxPlayers}</span>
                </div>
              </div>

              {room.round && (
                <div className="text-xs text-muted-foreground mb-4">
                  Round {room.round}
                </div>
              )}

              <div className="flex gap-2">
                {room.status === "Waiting" && (
                  <Button size="sm" className="flex-1 h-9 text-xs font-semibold" onClick={() => handleJoinRoom(room.id, room.status)}>
                    Join Room
                  </Button>
                )}
                {room.status === "Live" && (
                  <>
                    <Button size="sm" variant="outline" className="flex-1 h-9 text-xs font-semibold gap-1.5" onClick={() => handleSpectate(room.id)}>
                      <Eye className="h-3.5 w-3.5" />
                      Spectate
                    </Button>
                  </>
                )}
                {room.status === "Starting" && (
                  <Button size="sm" className="flex-1 h-9 text-xs font-semibold" disabled>
                    Starting...
                  </Button>
                )}
                {room.status === "Finished" && (
                  <Button size="sm" variant="outline" className="flex-1 h-9 text-xs font-semibold" onClick={() => handleViewResults(room.id)}>
                    View Results
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
