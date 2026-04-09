"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Radio, Users, Zap, Gamepad2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useLiveRooms } from "@/hooks/use-live-rooms"

export function LiveHero() {
  const router = useRouter()
  const { rooms, stats } = useLiveRooms({ refreshInterval: 10000 })
  
  const handleQuickJoin = async () => {
    // Find a waiting room with space
    const availableRoom = rooms.find(r => 
      r.status === "waiting" && r.player_count < r.max_players
    )
    
    if (availableRoom) {
      toast.success("Found a room!", {
        description: `Joining ${availableRoom.name || availableRoom.game_slug}...`,
      })
      router.push(`/room/${availableRoom.id}`)
    } else {
      toast.info("No available rooms", {
        description: "Create your own or wait for new rooms.",
      })
    }
  }

  return (
    <section className="relative py-16 bg-gradient-to-b from-primary/5 via-background to-background overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.55_0.22_255_/_0.03),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,oklch(0.65_0.16_235_/_0.03),transparent_50%)]" />
      
      <div className="container mx-auto px-6 lg:px-8 relative">
        <div className="max-w-3xl mx-auto text-center">
          {/* Live indicator */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-semibold text-emerald-600">Live Now</span>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Jump Into the Action
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto text-balance">
            Watch ongoing rounds, join active games, or queue for the next match. The action never stops.
          </p>
          
          {/* Live stats - real data */}
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Radio className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-foreground tabular-nums">{stats.totalRooms}</p>
                <p className="text-xs text-muted-foreground">Active Rooms</p>
              </div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-foreground tabular-nums">{stats.totalPlayers}</p>
                <p className="text-xs text-muted-foreground">Players in Rooms</p>
              </div>
            </div>
          </div>
          
          {/* CTAs */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <Button 
              size="lg" 
              className="gap-2 font-semibold px-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300"
              onClick={handleQuickJoin}
            >
              <Zap className="h-4 w-4" />
              Quick Join
            </Button>
            <Button variant="outline" size="lg" className="gap-2 font-semibold px-6" asChild>
              <Link href="/games">
                <Gamepad2 className="h-4 w-4" />
                Browse Games
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
