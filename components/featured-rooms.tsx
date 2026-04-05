"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Timer, ArrowRight } from "lucide-react"

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
    active: { label: "In Progress", color: "bg-green-500/10 text-green-600" },
    final: { label: "Final Round", color: "bg-amber-500/10 text-amber-600" },
    waiting: { label: "Waiting", color: "bg-primary/10 text-primary" },
  }

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start justify-between mb-4">
        <h4 className="font-semibold text-foreground">{title}</h4>
        <span className={`text-xs font-medium px-2 py-1 rounded-md ${statusConfig[status].color}`}>
          {statusConfig[status].label}
        </span>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          <span>{participants}/{maxParticipants}</span>
        </div>
        <span className="text-border">|</span>
        <span>Round {round}/{totalRounds}</span>
        <span className="text-border">|</span>
        <div className="flex items-center gap-1 text-primary font-medium">
          <Timer className="h-3.5 w-3.5" />
          <span>{timeLeft}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/60">
        <div className="flex -space-x-2">
          {avatars.slice(0, 4).map((initial, i) => (
            <Avatar key={i} className="h-7 w-7 border-2 border-card">
              <AvatarFallback className="bg-primary/8 text-primary text-[10px] font-medium">{initial}</AvatarFallback>
            </Avatar>
          ))}
          {avatars.length > 4 && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-medium text-muted-foreground">
              +{avatars.length - 4}
            </div>
          )}
        </div>
        <Button size="sm" variant={status === "waiting" ? "default" : "outline"} className="h-8 px-4 text-xs font-medium">
          {status === "waiting" ? "Join" : "Watch"}
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>
  )
}

export function FeaturedRooms() {
  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Featured Rounds</h2>
            <p className="mt-1.5 text-muted-foreground">Join active multiplayer rooms</p>
          </div>
          <a href="#rooms" className="text-sm font-medium text-primary hover:underline underline-offset-4">
            View all
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
