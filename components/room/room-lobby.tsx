"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Play, 
  Check, 
  Crown,
  Loader2,
  Clock,
  Trophy
} from "lucide-react"
import type { RoomWithPlayers, RoomPlayer } from "@/lib/types/room"
import type { Game } from "@/lib/games-data"
import type { PlayerWithStats } from "@/lib/types/player"
import type { RoundCount } from "@/lib/types/match"

interface RoomLobbyProps {
  room: RoomWithPlayers
  game: Game | null
  player: PlayerWithStats | null
  playerLoading?: boolean
  isInRoom: boolean
  isHost: boolean
  isReady: boolean
  isJoining: boolean
  canStart: boolean
  onJoin: () => void
  onToggleReady: () => void
  onStartGame: () => void
}

export function RoomLobby({
  room,
  game,
  player,
  playerLoading = false,
  isInRoom,
  isHost,
  isReady,
  isJoining,
  canStart,
  onJoin,
  onToggleReady,
  onStartGame,
}: RoomLobbyProps) {
  const emptySlots = room.max_players - room.player_count

  return (
    <div className="container mx-auto px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Game Info Card */}
        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-semibold">
                {room.player_count} / {room.max_players} Players
              </span>
            </div>
            {/* Rounds Display */}
            {(room.settings?.totalRounds as RoundCount) && (room.settings.totalRounds as number) > 1 && (
              <Badge variant="outline" className="gap-1">
                <Trophy className="h-3 w-3" />
                Best of {room.settings.totalRounds as number}
              </Badge>
            )}
            {room.stakes > 0 && (
              <Badge variant="secondary" className="text-amber-600">
                {room.stakes} Stakes
              </Badge>
            )}
          </div>

          {/* Players Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {room.players.map((roomPlayer) => (
              <PlayerSlot 
                key={roomPlayer.id} 
                player={roomPlayer}
                isCurrentPlayer={player?.id === roomPlayer.id}
              />
            ))}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <EmptySlot key={`empty-${i}`} />
            ))}
          </div>

          {/* Waiting Message */}
          {room.status === "waiting" && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-4 border-t border-border">
              <Clock className="h-4 w-4 animate-pulse" />
              Waiting for players to join and ready up...
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {!isInRoom ? (
            <Button 
              size="lg" 
              onClick={onJoin}
              disabled={isJoining || playerLoading || room.player_count >= room.max_players || !player}
              className="w-full sm:w-auto min-w-[200px]"
            >
              {isJoining ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Joining...
                </>
              ) : playerLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Loading Profile...
                </>
              ) : room.player_count >= room.max_players ? (
                "Room Full"
              ) : !player ? (
                "Connect Tezos Wallet to Join"
              ) : (
                <>
                  <Users className="h-5 w-5 mr-2" />
                  Join Room
                </>
              )}
            </Button>
          ) : (
            <>
              <Button 
                size="lg" 
                variant={isReady ? "secondary" : "default"}
                onClick={onToggleReady}
                className="w-full sm:w-auto min-w-[200px]"
              >
                {isReady ? (
                  <>
                    <Check className="h-5 w-5 mr-2 text-emerald-600" />
                    Ready!
                  </>
                ) : (
                  "Ready Up"
                )}
              </Button>
              
              {isHost && (
                <Button 
                  size="lg" 
                  onClick={onStartGame}
                  disabled={!canStart}
                  className="w-full sm:w-auto min-w-[200px] bg-emerald-600 hover:bg-emerald-700"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Game
                </Button>
              )}
            </>
          )}
        </div>

        {/* Host Instructions */}
        {isHost && !canStart && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            {room.player_count < 2 
              ? "Need at least 2 players to start"
              : "Waiting for all players to ready up"
            }
          </p>
        )}
      </div>
    </div>
  )
}

function PlayerSlot({ player, isCurrentPlayer }: { player: RoomPlayer; isCurrentPlayer: boolean }) {
  return (
    <div className={`relative rounded-xl border-2 p-4 text-center transition-all ${
      isCurrentPlayer 
        ? "border-primary bg-primary/5" 
        : player.is_ready 
          ? "border-emerald-500 bg-emerald-50" 
          : "border-border bg-card"
    }`}>
      {player.role === "host" && (
        <div className="absolute -top-2 -right-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white">
            <Crown className="h-3 w-3" />
          </div>
        </div>
      )}
      
      {player.is_ready && (
        <div className="absolute -top-2 -left-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Check className="h-3 w-3" />
          </div>
        </div>
      )}

      <Avatar className="h-14 w-14 mx-auto mb-2 ring-2 ring-border">
        <AvatarImage src={player.avatar_url || undefined} alt={player.username} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {player.username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <p className="font-medium text-sm text-foreground truncate">
        {player.username}
      </p>
      
      <p className="text-xs text-muted-foreground mt-0.5">
        {player.is_ready ? "Ready" : "Waiting"}
      </p>
    </div>
  )
}

function EmptySlot() {
  return (
    <div className="rounded-xl border-2 border-dashed border-border p-4 text-center bg-muted/20">
      <div className="h-14 w-14 mx-auto mb-2 rounded-full bg-muted/50 flex items-center justify-center">
        <Users className="h-6 w-6 text-muted-foreground/50" />
      </div>
      <p className="font-medium text-sm text-muted-foreground">Empty</p>
      <p className="text-xs text-muted-foreground/70 mt-0.5">Waiting...</p>
    </div>
  )
}
