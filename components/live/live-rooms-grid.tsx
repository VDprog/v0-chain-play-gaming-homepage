"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Bomb, HelpCircle, Handshake, Timer, Crown, CircleDot,
  Users, Eye, ArrowRight, Clock, Radio, Gamepad2, AlertCircle
} from "lucide-react"
import { useLiveContext } from "./live-context"
import { useLiveRooms } from "@/hooks/use-live-rooms"
import { getGameBySlug } from "@/lib/games-data"
import type { RoomWithPlayers, RoomPlayer } from "@/lib/types/room"
import type { LucideIcon } from "lucide-react"

const gameIcons: Record<string, LucideIcon> = {
  "pass-the-bomb": Bomb,
  "split-or-steal": Handshake,
  "speed-quiz": HelpCircle,
  "hidden-button": CircleDot,
  "timer-challenge": Timer,
  "last-survivor-quiz": Crown,
}

function getTimeAgo(dateString: string): string {
  const now = Date.now()
  const created = new Date(dateString).getTime()
  const diffMs = now - created
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  
  return `${Math.floor(diffHours / 24)}d ago`
}

function RoomCard({ room }: { room: RoomWithPlayers }) {
  const game = getGameBySlug(room.game_slug)
  const Icon = gameIcons[room.game_slug] || Radio
  
  const statusConfig = {
    live: { color: "text-emerald-600", bg: "bg-emerald-500", label: "LIVE" },
    starting: { color: "text-amber-600", bg: "bg-amber-500", label: "STARTING" },
    waiting: { color: "text-primary", bg: "bg-primary", label: "WAITING" },
  }
  const config = statusConfig[room.status as keyof typeof statusConfig] || statusConfig.waiting
  
  // Find host
  const host = room.players.find((p: RoomPlayer) => p.role === "host")
  
  // Get status text
  const getStatusText = () => {
    if (room.status === "waiting") {
      return `Waiting for players (${room.player_count}/${room.max_players})`
    }
    if (room.status === "starting") {
      return "Starting soon..."
    }
    return "Match in progress"
  }

  return (
    <Link href={`/room/${room.id}`} className="block">
      <div className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {game?.title || room.game_slug}
              </h4>
              <span className="text-xs text-muted-foreground">
                {room.name || `Room #${room.id.slice(0, 6)}`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.bg} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${config.bg}`}></span>
            </span>
            <span className={`text-[10px] font-bold ${config.color}`}>{config.label}</span>
          </div>
        </div>
        
        {/* Status */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span className="font-medium">{room.player_count}/{room.max_players}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{getTimeAgo(room.created_at)}</span>
          </div>
          {room.stakes > 0 && (
            <span className="text-xs font-semibold text-primary">${room.stakes}</span>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mb-4">{getStatusText()}</p>
        
        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
          <div className="flex -space-x-2">
            {room.players.slice(0, 4).map((player: RoomPlayer, i: number) => (
              <Avatar key={player.id || i} className="h-7 w-7 border-2 border-card ring-0">
                {player.avatar_url ? (
                  <AvatarImage src={player.avatar_url} alt={player.username} />
                ) : null}
                <AvatarFallback className={`text-[10px] font-semibold ${
                  player.role === "host" ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"
                }`}>
                  {player.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {room.player_count > 4 && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-semibold text-muted-foreground">
                +{room.player_count - 4}
              </div>
            )}
            {room.player_count === 0 && (
              <span className="text-xs text-muted-foreground">No players yet</span>
            )}
          </div>
          <Button 
            size="sm" 
            variant={room.status === "waiting" ? "default" : "outline"} 
            className="h-8 px-4 text-xs font-semibold gap-1.5 transition-all duration-200"
          >
            {room.status === "waiting" || room.status === "starting" ? (
              <>Join<ArrowRight className="h-3 w-3" /></>
            ) : (
              <><Eye className="h-3 w-3" />Watch</>
            )}
          </Button>
        </div>
        
        {/* Host indicator */}
        {host && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <span className="text-[10px] text-muted-foreground">
              Hosted by <span className="font-medium text-foreground">{host.username}</span>
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}

function RoomCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-3 w-32 mb-4" />
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex -space-x-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-7 w-7 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Gamepad2 className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No Active Rooms</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        There are no active rooms right now. Be the first to create one!
      </p>
      <div className="flex items-center gap-3">
        <Button asChild>
          <Link href="/games">
            <Gamepad2 className="h-4 w-4 mr-2" />
            Browse Games
          </Link>
        </Button>
      </div>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Rooms</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Something went wrong while loading the rooms.
      </p>
      <Button onClick={onRetry} variant="outline">
        Try Again
      </Button>
    </div>
  )
}

export function LiveRoomsGrid() {
  const { gameFilter, statusFilter, networkFilter, sort } = useLiveContext()
  const { rooms, stats, isLoading, error, refetch } = useLiveRooms({
    gameSlug: gameFilter,
    status: statusFilter,
    network: networkFilter,
    sort,
    refreshInterval: 5000,
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Live Rooms</h2>
        <span className="text-sm text-muted-foreground">
          {isLoading ? "Loading..." : `${stats.totalRooms} rooms active`}
        </span>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        {isLoading && rooms.length === 0 ? (
          // Show skeletons while loading
          <>
            {[1, 2, 3, 4].map(i => (
              <RoomCardSkeleton key={i} />
            ))}
          </>
        ) : error ? (
          <ErrorState onRetry={() => refetch()} />
        ) : rooms.length === 0 ? (
          <EmptyState />
        ) : (
          rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))
        )}
      </div>
    </div>
  )
}
