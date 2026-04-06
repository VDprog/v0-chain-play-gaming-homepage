"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Clock, Trophy, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import type { LucideIcon } from "lucide-react"

interface Room {
  id: string
  title: string
  roomNumber: string
  icon: LucideIcon
  players: number
  maxPlayers: number
  status: "live" | "starting" | "waiting"
  statusText: string
  avatars: string[]
  timer?: string
  prizePool?: string
}

interface JoinRoomModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: Room | null
}

export function JoinRoomModal({ open, onOpenChange, room }: JoinRoomModalProps) {
  if (!room) return null

  const Icon = room.icon
  const isFull = room.players >= room.maxPlayers
  const isLive = room.status === "live"

  const handleJoin = () => {
    if (isFull) {
      toast.error("Room Full", {
        description: "This room is at maximum capacity.",
      })
      return
    }

    if (isLive) {
      toast.info("Match in Progress", {
        description: "You'll join after the current round ends.",
      })
    } else {
      toast.success("Joined Room!", {
        description: `You joined ${room.title} ${room.roomNumber}. Get ready to play!`,
      })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle>{room.title}</DialogTitle>
              <DialogDescription>{room.roomNumber} - {room.statusText}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Room Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
              <Users className="h-4 w-4 text-muted-foreground mb-1" />
              <span className="font-semibold text-foreground">{room.players}/{room.maxPlayers}</span>
              <span className="text-xs text-muted-foreground">Players</span>
            </div>
            {room.timer && (
              <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                <Clock className="h-4 w-4 text-primary mb-1" />
                <span className="font-semibold text-foreground tabular-nums">{room.timer}</span>
                <span className="text-xs text-muted-foreground">Time Left</span>
              </div>
            )}
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
              <Trophy className="h-4 w-4 text-amber-500 mb-1" />
              <span className="font-semibold text-foreground">{room.prizePool || "$50"}</span>
              <span className="text-xs text-muted-foreground">Prize</span>
            </div>
          </div>

          {/* Players Preview */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Players in room</p>
            <div className="flex -space-x-2">
              {room.avatars.slice(0, 6).map((initial, i) => (
                <Avatar key={i} className="h-8 w-8 border-2 border-card">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {initial}
                  </AvatarFallback>
                </Avatar>
              ))}
              {room.avatars.length > 6 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-semibold text-muted-foreground">
                  +{room.avatars.length - 6}
                </div>
              )}
            </div>
          </div>

          {/* Status Message */}
          {isFull && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              This room is full. You can watch the match or find another room.
            </div>
          )}
          {isLive && !isFull && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-primary text-sm">
              Match in progress. You&apos;ll join after the current round.
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleJoin} 
            disabled={isFull}
            className="gap-2"
          >
            {isLive ? "Queue to Join" : "Join Room"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
