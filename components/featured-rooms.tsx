"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="font-bold text-foreground">{title}</h4>
        <Badge
          className={
            status === "active" ? "bg-green-500/10 text-green-600 border-green-500/20" :
            status === "final" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
            "bg-primary/10 text-primary border-primary/20"
          }
        >
          {status === "active" ? "In Progress" : status === "final" ? "Final Round" : "Waiting"}
        </Badge>
      </div>
      <div className="mb-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{participants}/{maxParticipants}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span>Round {round}/{totalRounds}</span>
        </div>
        <div className="flex items-center gap-1.5 text-primary font-medium">
          <Timer className="h-4 w-4" />
          <span>{timeLeft}</span>
        </div>
      </div>
      <div className="mb-4 flex items-center">
        <div className="flex -space-x-2">
          {avatars.slice(0, 5).map((initial, i) => (
            <Avatar key={i} className="h-8 w-8 border-2 border-card">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">{initial}</AvatarFallback>
            </Avatar>
          ))}
          {avatars.length > 5 && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-medium text-muted-foreground">
              +{avatars.length - 5}
            </div>
          )}
        </div>
      </div>
      <Button className="w-full" variant={status === "waiting" ? "default" : "outline"}>
        {status === "waiting" ? "Join Round" : "Spectate"}
      </Button>
    </div>
  )
}

export function FeaturedRooms() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-foreground">Featured Rounds</h2>
          <p className="mt-2 text-muted-foreground">Join active multiplayer rooms</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {rooms.map((room) => (
            <RoomCard key={room.title} {...room} />
          ))}
        </div>
      </div>
    </section>
  )
}
