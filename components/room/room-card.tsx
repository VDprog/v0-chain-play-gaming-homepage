"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Eye, ArrowRight, Clock, Coins } from "lucide-react"
import type { RoomWithPlayers } from "@/lib/types/room"

interface RoomCardProps {
  room: RoomWithPlayers
  gameTitle?: string
  onJoin?: (roomId: string) => void
  onSpectate?: (roomId: string) => void
}

const statusConfig = {
  waiting: { color: "text-primary", bg: "bg-primary", label: "WAITING" },
  starting: { color: "text-amber-600", bg: "bg-amber-500", label: "STARTING" },
  live: { color: "text-emerald-600", bg: "bg-emerald-500", label: "LIVE" },
  finished: { color: "text-muted-foreground", bg: "bg-muted-foreground", label: "FINISHED" },
}

export function RoomCard({ room, gameTitle, onJoin, onSpectate }: RoomCardProps) {
  const config = statusConfig[room.status]
  const isFull = room.player_count >= room.max_players
  const canJoin = room.status === "waiting" && !isFull
  const canSpectate = room.status === "live"

  const roomName = room.name || `Room #${room.id.slice(0, 4).toUpperCase()}`

  return (
    <div className="group rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/20 hover:shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`h-2 w-2 rounded-full ${config.bg} ${room.status === "live" ? "animate-pulse" : ""}`} />
          <span className={`text-xs font-bold tracking-wide ${config.color}`}>
            {config.label}
          </span>
        </div>
        {room.stakes > 0 && (
          <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
            <Coins className="h-3 w-3" />
            {room.stakes}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-foreground truncate">{roomName}</h3>
          {gameTitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{gameTitle}</p>
          )}
        </div>

        {/* Players */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {room.players.slice(0, 4).map((player, i) => (
                <Avatar key={player.id} className="h-7 w-7 border-2 border-card">
                  <AvatarImage src={player.avatar_url || undefined} alt={player.username} />
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    {player.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {room.player_count > 4 && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-medium text-muted-foreground">
                  +{room.player_count - 4}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span className={isFull ? "text-amber-600 font-medium" : ""}>
              {room.player_count}/{room.max_players}
            </span>
          </div>
        </div>

        {/* Time */}
        {room.status === "live" && room.started_at && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            In progress
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 py-3 border-t border-border bg-muted/20">
        {canJoin ? (
          <Button 
            size="sm" 
            className="flex-1 h-8 text-xs font-semibold gap-1.5"
            onClick={() => onJoin?.(room.id)}
            asChild={!onJoin}
          >
            {onJoin ? (
              <>Join<ArrowRight className="h-3 w-3" /></>
            ) : (
              <Link href={`/room/${room.id}`}>
                Join<ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </Button>
        ) : canSpectate ? (
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 h-8 text-xs font-semibold gap-1.5"
            onClick={() => onSpectate?.(room.id)}
            asChild={!onSpectate}
          >
            {onSpectate ? (
              <><Eye className="h-3 w-3" />Watch</>
            ) : (
              <Link href={`/room/${room.id}`}>
                <Eye className="h-3 w-3" />Watch
              </Link>
            )}
          </Button>
        ) : room.status === "starting" ? (
          <Button size="sm" className="flex-1 h-8 text-xs font-semibold" disabled>
            Starting...
          </Button>
        ) : isFull ? (
          <Button size="sm" variant="outline" className="flex-1 h-8 text-xs font-semibold" disabled>
            Room Full
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="flex-1 h-8 text-xs font-semibold" disabled>
            Ended
          </Button>
        )}
      </div>
    </div>
  )
}
