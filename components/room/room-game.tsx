"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Eye, Users, Clock, Bomb, HelpCircle, Handshake, CircleDot, Crown, Timer } from "lucide-react"
import type { RoomWithPlayers } from "@/lib/types/room"
import type { Game } from "@/lib/games-data"
import type { PlayerWithStats } from "@/lib/types/player"

// Game-specific modules
import { PassTheBombGame } from "@/components/games/modules/pass-the-bomb"
import { SplitOrStealGame } from "@/components/games/modules/split-or-steal"
import { TriviaRoyaleGame } from "@/components/games/modules/trivia-royale"
import { RussianRouletteGame } from "@/components/games/modules/russian-roulette"
import { KingOfTheHillGame } from "@/components/games/modules/king-of-the-hill"
import { LastManStandingGame } from "@/components/games/modules/last-man-standing"
import { HiddenButtonGame } from "@/components/games/modules/hidden-button"

interface RoomGameProps {
  room: RoomWithPlayers
  game: Game | null
  player: PlayerWithStats | null
  isInRoom: boolean
  isSpectator?: boolean
}

const gameModules: Record<string, React.ComponentType<{ room: RoomWithPlayers; player: PlayerWithStats | null; isSpectator: boolean }>> = {
  "pass-the-bomb": PassTheBombGame,
  "split-or-steal": SplitOrStealGame,
  "trivia-royale": TriviaRoyaleGame,
  "russian-roulette": RussianRouletteGame,
  "king-of-the-hill": KingOfTheHillGame,
  "last-man-standing": LastManStandingGame,
  "hidden-button": HiddenButtonGame,
}

export function RoomGame({ room, game, player, isInRoom, isSpectator = false }: RoomGameProps) {
  const GameModule = gameModules[room.game_slug]
  
  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-8rem)]">
      {/* Main Game Area */}
      <div className="flex-1 p-6">
        <div className="h-full rounded-xl border border-border bg-card overflow-hidden">
          {GameModule ? (
            <GameModule room={room} player={player} isSpectator={isSpectator} />
          ) : (
            <DefaultGameView room={room} game={game} />
          )}
        </div>
      </div>

      {/* Sidebar - Players & Info */}
      <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border bg-card/50 p-4 space-y-4">
        {/* Spectator Badge */}
        {isSpectator && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted border border-border">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Spectator Mode</span>
          </div>
        )}

        {/* Game Status */}
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold text-emerald-600">LIVE</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {room.started_at && (
              <span>Started {formatTimeAgo(new Date(room.started_at))}</span>
            )}
          </div>
        </div>

        {/* Players List */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Players</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {room.players.filter(p => p.role !== "spectator").length}
            </Badge>
          </div>
          <div className="p-2 max-h-80 overflow-y-auto">
            {room.players.filter(p => p.role !== "spectator").map((roomPlayer) => (
              <div 
                key={roomPlayer.id}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  roomPlayer.status === "eliminated" ? "opacity-50" : ""
                } ${
                  roomPlayer.status === "winner" ? "bg-amber-50 border border-amber-200" : ""
                }`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={roomPlayer.avatar_url || undefined} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {roomPlayer.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate flex items-center gap-1">
                    {roomPlayer.username}
                    {roomPlayer.role === "host" && (
                      <Crown className="h-3 w-3 text-amber-500" />
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {roomPlayer.status}
                  </p>
                </div>
                {roomPlayer.status === "winner" && (
                  <Badge className="bg-amber-500">Winner</Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Spectators */}
        {room.players.filter(p => p.role === "spectator").length > 0 && (
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-sm">Spectators</span>
              <Badge variant="outline" className="text-xs ml-auto">
                {room.players.filter(p => p.role === "spectator").length}
              </Badge>
            </div>
            <div className="p-2">
              <div className="flex flex-wrap gap-1">
                {room.players.filter(p => p.role === "spectator").map((spectator) => (
                  <Avatar key={spectator.id} className="h-6 w-6">
                    <AvatarImage src={spectator.avatar_url || undefined} />
                    <AvatarFallback className="text-[10px]">
                      {spectator.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DefaultGameView({ room, game }: { room: RoomWithPlayers; game: Game | null }) {
  const icons: Record<string, React.ReactNode> = {
    "pass-the-bomb": <Bomb className="h-16 w-16" />,
    "split-or-steal": <Handshake className="h-16 w-16" />,
    "trivia-royale": <HelpCircle className="h-16 w-16" />,
    "russian-roulette": <CircleDot className="h-16 w-16" />,
    "king-of-the-hill": <Crown className="h-16 w-16" />,
    "last-man-standing": <Timer className="h-16 w-16" />,
    "hidden-button": <CircleDot className="h-16 w-16" />,
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="text-primary/50 mb-6">
        {icons[room.game_slug] || <Bomb className="h-16 w-16" />}
      </div>
      <h2 className="text-2xl font-bold mb-2">{game?.title || room.game_slug}</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Game in progress. The game module for this game type is loading...
      </p>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        Live
      </div>
    </div>
  )
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}
