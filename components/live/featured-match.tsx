"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Bomb, Eye, ArrowRight, Users, Handshake, HelpCircle, CircleDot, Timer, Crown, Radio, Gamepad2 } from "lucide-react"
import { useLiveRooms } from "@/hooks/use-live-rooms"
import { getGameBySlug } from "@/lib/games-data"
import type { RoomPlayer } from "@/lib/types/room"
import type { LucideIcon } from "lucide-react"

const gameIcons: Record<string, LucideIcon> = {
  "pass-the-bomb": Bomb,
  "split-or-steal": Handshake,
  "speed-quiz": HelpCircle,
  "hidden-button": CircleDot,
  "timer-challenge": Timer,
  "last-survivor-quiz": Crown,
}

export function FeaturedMatch() {
  const { rooms, isLoading } = useLiveRooms({ refreshInterval: 5000 })
  
  // Get the featured room: prioritize live rooms with most players
  const featuredRoom = rooms.find(r => r.status === "live") || rooms[0]
  
  if (isLoading && !featuredRoom) {
    return <FeaturedMatchSkeleton />
  }
  
  if (!featuredRoom) {
    return <NoFeaturedMatch />
  }
  
  const game = getGameBySlug(featuredRoom.game_slug)
  const Icon = gameIcons[featuredRoom.game_slug] || Radio
  const host = featuredRoom.players.find((p: RoomPlayer) => p.role === "host")

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">{game?.title || featuredRoom.game_slug}</h3>
              <span className="text-xs font-medium text-muted-foreground">
                {featuredRoom.name || `Room #${featuredRoom.id.slice(0, 6)}`}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                featuredRoom.status === "live" ? "text-emerald-600" : 
                featuredRoom.status === "starting" ? "text-amber-600" : "text-primary"
              }`}>
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    featuredRoom.status === "live" ? "bg-emerald-500" : 
                    featuredRoom.status === "starting" ? "bg-amber-500" : "bg-primary"
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    featuredRoom.status === "live" ? "bg-emerald-500" : 
                    featuredRoom.status === "starting" ? "bg-amber-500" : "bg-primary"
                  }`}></span>
                </span>
                {featuredRoom.status.toUpperCase()}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" /> {featuredRoom.player_count}/{featuredRoom.max_players} players
              </span>
            </div>
          </div>
        </div>
        {featuredRoom.stakes > 0 && (
          <div className="text-right">
            <p className="text-2xl font-bold text-primary tabular-nums">${featuredRoom.stakes}</p>
            <p className="text-xs text-muted-foreground">Prize Pool</p>
          </div>
        )}
      </div>
      
      {/* Game visualization - Players grid */}
      <div className="relative px-6 py-10 bg-gradient-to-b from-muted/30 to-muted/10">
        {featuredRoom.players.length > 0 ? (
          <>
            {/* Players circle */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {featuredRoom.players.map((player: RoomPlayer) => (
                <div
                  key={player.id}
                  className={`flex flex-col items-center gap-2 transition-all duration-300 ${
                    player.role === "host" ? "scale-110" : ""
                  }`}
                >
                  <div className="relative">
                    <Avatar className={`h-14 w-14 border-2 transition-all duration-300 ${
                      player.role === "host"
                        ? "border-primary ring-4 ring-primary/20" 
                        : player.is_ready
                        ? "border-emerald-500"
                        : "border-border"
                    }`}>
                      {player.avatar_url ? (
                        <AvatarImage src={player.avatar_url} alt={player.username} />
                      ) : null}
                      <AvatarFallback className={`text-sm font-semibold ${
                        player.role === "host"
                          ? "bg-primary/10 text-primary" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {player.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {player.role === "host" && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <Crown className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                    {player.is_ready && player.role !== "host" && (
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
                        <span className="text-[8px] text-white font-bold">✓</span>
                      </div>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${
                    player.role === "host" ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {player.username}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Room info */}
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <span>{featuredRoom.status === "waiting" ? "Waiting for players" : featuredRoom.status === "starting" ? "Starting soon" : "Match in progress"}</span>
              {host && (
                <>
                  <span className="text-border">•</span>
                  <span>Hosted by {host.username}</span>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No players yet</p>
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-3 px-6 py-4 border-t border-border bg-muted/20">
        <Button className="flex-1 gap-2 font-semibold shadow-md shadow-primary/20" asChild>
          <Link href={`/room/${featuredRoom.id}`}>
            {featuredRoom.status === "live" ? "Join Room" : "Enter Room"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        {featuredRoom.status === "live" && (
          <Button variant="outline" className="flex-1 gap-2 font-semibold" asChild>
            <Link href={`/room/${featuredRoom.id}?spectate=true`}>
              <Eye className="h-4 w-4" />
              Watch Match
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}

function FeaturedMatchSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>
      <div className="px-6 py-10">
        <div className="flex items-center justify-center gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-14 w-14 rounded-full" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 px-6 py-4 border-t border-border">
        <Skeleton className="flex-1 h-10" />
        <Skeleton className="flex-1 h-10" />
      </div>
    </div>
  )
}

function NoFeaturedMatch() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
      <div className="px-6 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
          <Gamepad2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Active Games</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Be the first to start a game and get featured here!
        </p>
        <Button asChild>
          <Link href="/games">Browse Games</Link>
        </Button>
      </div>
    </div>
  )
}
