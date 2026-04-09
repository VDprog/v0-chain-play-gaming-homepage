"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog"
import { Plus, Users, Lock, Coins, Loader2, Trophy } from "lucide-react"
import { toast } from "sonner"
import { usePlayer } from "@/components/player/player-provider"
import { useRooms } from "@/hooks/use-room"
import type { RoundCount } from "@/lib/types/match"

interface CreateRoomModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gameSlug: string
  gameTitle: string
}

export function CreateRoomModal({ open, onOpenChange, gameSlug, gameTitle }: CreateRoomModalProps) {
  const router = useRouter()
  const { player, isConnected } = usePlayer()
  const { createRoom } = useRooms(gameSlug)
  
  const [name, setName] = useState("")
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [isPrivate, setIsPrivate] = useState(false)
  const [stakes, setStakes] = useState(0)
  const [totalRounds, setTotalRounds] = useState<RoundCount>(1)
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!player) {
      toast.error("Please register first", {
        description: "You need to create a profile to host a room",
      })
      return
    }

    setIsCreating(true)
    try {
      const room = await createRoom({
        game_slug: gameSlug,
        name: name.trim() || undefined,
        max_players: maxPlayers,
        is_private: isPrivate,
        stakes,
        settings: { totalRounds },
        created_by: player.id,
      })

      toast.success("Room created!", {
        description: `${room.name || `Room #${room.id.slice(0, 4).toUpperCase()}`} is ready`,
      })
      
      onOpenChange(false)
      router.push(`/room/${room.id}`)
    } catch (error) {
      toast.error("Failed to create room", {
        description: error instanceof Error ? error.message : "Please try again",
      })
    } finally {
      setIsCreating(false)
    }
  }

  if (!isConnected) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription>
              Connect your wallet to create and join rooms.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-6">
            <p className="text-muted-foreground text-center">
              Please connect your wallet using the button in the header.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create {gameTitle} Room</DialogTitle>
          <DialogDescription>
            Set up your game room and invite others to join.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Room Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Room Name (optional)</Label>
            <Input
              id="name"
              placeholder={`${gameTitle} Room`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
          </div>

          {/* Max Players */}
          <div className="space-y-2">
            <Label htmlFor="maxPlayers">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Max Players
              </div>
            </Label>
            <div className="flex gap-2">
              {[2, 3, 4, 6, 8].map((num) => (
                <Button
                  key={num}
                  type="button"
                  size="sm"
                  variant={maxPlayers === num ? "default" : "outline"}
                  onClick={() => setMaxPlayers(num)}
                  className="flex-1"
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>

          {/* Rounds */}
          <div className="space-y-2">
            <Label>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Best of (Rounds)
              </div>
            </Label>
            <div className="flex gap-2">
              {([1, 3, 5] as RoundCount[]).map((num) => (
                <Button
                  key={num}
                  type="button"
                  size="sm"
                  variant={totalRounds === num ? "default" : "outline"}
                  onClick={() => setTotalRounds(num)}
                  className="flex-1"
                >
                  {num === 1 ? "Single" : `Best of ${num}`}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalRounds === 1 
                ? "Single round decides the winner" 
                : `First to ${Math.ceil(totalRounds / 2)} wins takes the match`}
            </p>
          </div>

          {/* Stakes */}
          <div className="space-y-2">
            <Label htmlFor="stakes">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                Stakes (optional)
              </div>
            </Label>
            <div className="flex gap-2">
              {[0, 5, 10, 25, 50].map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  size="sm"
                  variant={stakes === amount ? "default" : "outline"}
                  onClick={() => setStakes(amount)}
                  className="flex-1"
                >
                  {amount === 0 ? "Free" : amount}
                </Button>
              ))}
            </div>
          </div>

          {/* Private Toggle */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="private" className="cursor-pointer">Private Room</Label>
            </div>
            <Button
              type="button"
              size="sm"
              variant={isPrivate ? "default" : "outline"}
              onClick={() => setIsPrivate(!isPrivate)}
            >
              {isPrivate ? "Yes" : "No"}
            </Button>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="flex-1"
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            className="flex-1 gap-2"
            disabled={isCreating || !player}
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Room
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
