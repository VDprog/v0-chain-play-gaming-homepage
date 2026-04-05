"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Timer } from "lucide-react"

interface RoomCardProps {
  title: string
  participants: number
  maxParticipants: number
  round: number
  totalRounds: number
  timeLeft: string
  avatars: string[]
  status: "waiting" | "active" | "final"
}

const rooms: RoomCardProps[] = [
  {
    title: "Split or Steal",
    participants: 6,
    maxParticipants: 8,
    round: 2,
    totalRounds: 5,
    timeLeft: "2:34",
    avatars: ["VL", "EV", "PA", "JK", "AD", "MK"],
    status: "active",
  },
  {
    title: "Pass the Bomb",
    participants: 8,
    maxParticipants: 8,
    round: 4,
    totalRounds: 6,
    timeLeft: "0:45",
    avatars: ["AL", "BN", "CR", "DV", "EM", "FN", "GR", "HK"],
    status: "active",
  },
  {
    title: "Quiz Battle",
    participants: 4,
    maxParticipants: 6,
    round: 1,
    totalRounds: 10,
    timeLeft: "5:00",
    avatars: ["QZ", "WB", "ER", "TY"],
    status: "waiting",
  },
  {
    title: "Team Quiz",
    participants: 10,
    maxParticipants: 12,
    round: 5,
    totalRounds: 5,
    timeLeft: "0:12",
    avatars: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "TA"],
    status: "final",
  },
]

function RoomCard({ title, participants, maxParticipants, round, totalRounds, timeLeft, avatars, status }: RoomCardProps) {
  const statusConfig = {
    active: { label: "In Progress", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
    final: { label: "Final Round", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    waiting: { label: "Waiting", color: "bg-primary/10 text-primary border-primary/20" },
  }

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:shadow-lg hover:shadow-foreground/[0.03]">
      <div className="flex items-start justify-between mb-4">
        <h4 className="font-semibold text-foreground text-[15px]">{title}</h4>
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${statusConfig[status].color}`}>
          {statusConfig[status].label}
        </span>
      </div>
      
      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          <span>{participants}/{maxParticipants}</span>
        </div>
        <span className="text-border">|</span>
        <span>Round {round}/{totalRounds}</span>
        <div className="flex items-center gap-1 text-primary font-medium ml-auto">
          <Timer className="h-3.5 w-3.5" />
          <span className="tabular-nums">{timeLeft}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
        <div className="flex -space-x-2">
          {avatars.slice(0, 4).map((initial, i) => (
            <Avatar key={i} className="h-7 w-7 border-2 border-card">
              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">{initial}</AvatarFallback>
            </Avatar>
          ))}
          {avatars.length > 4 && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-medium text-muted-foreground">
              +{avatars.length - 4}
            </div>
          )}
        </div>
        <Button size="sm" variant={status === "waiting" ? "default" : "outline"} className="h-8 px-4 text-xs font-semibold">
          {status === "waiting" ? "Join" : "Watch"}
        </Button>
      </div>
    </div>
  )
}

export function FeaturedRooms() {
  return (
    <section className="py-16 bg-muted/40">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">Featured Rounds</h2>
            <p className="mt-1 text-sm text-muted-foreground">Join active multiplayer rooms</p>
          </div>
          <a href="#rooms" className="text-sm font-medium text-primary hover:underline underline-offset-4 hidden sm:block">
            View all rooms
          </a>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rooms.map((room) => (
            <RoomCard key={room.title} {...room} />
          ))}
        </div>
      </div>
    </section>
  )
}
