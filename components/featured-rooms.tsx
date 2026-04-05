"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Timer, ArrowRight, Eye } from "lucide-react"

interface RoomCardProps {
  title: string
  participants: number
  maxParticipants: number
  round: number
  totalRounds: number
  timeLeft: string
  avatars: string[]
  status: "waiting" | "active" | "final"
  prize?: string
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
    prize: "$75",
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
    prize: "$120",
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
    prize: "$200",
  },
]

function RoomCard({ title, participants, maxParticipants, round, totalRounds, timeLeft, avatars, status, prize }: RoomCardProps) {
  const statusConfig = {
    active: { label: "In Progress", bgColor: "bg-emerald-500", dotColor: "bg-emerald-500" },
    final: { label: "Final Round", bgColor: "bg-amber-500", dotColor: "bg-amber-500" },
    waiting: { label: "Waiting", bgColor: "bg-primary", dotColor: "bg-primary" },
  }

  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card p-5 card-hover cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{title}</h4>
          {prize && (
            <span className="text-xs font-semibold text-emerald-600 mt-0.5 inline-block">{prize} prize pool</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`relative flex h-2 w-2`}>
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusConfig[status].dotColor} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${statusConfig[status].bgColor}`}></span>
          </span>
          <span className="text-[11px] font-semibold text-muted-foreground">
            {statusConfig[status].label}
          </span>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Round {round} of {totalRounds}</span>
          <span className="font-medium text-foreground">{Math.round((round / totalRounds) * 100)}%</span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${status === "final" ? "bg-amber-500" : "bg-primary"}`}
            style={{ width: `${(round / totalRounds) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          <span className="font-medium">{participants}/{maxParticipants}</span>
        </div>
        <div className="flex items-center gap-1.5 text-primary font-semibold">
          <Timer className="h-3.5 w-3.5" />
          <span className="tabular-nums">{timeLeft}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
        <div className="flex -space-x-2">
          {avatars.slice(0, 4).map((initial, i) => (
            <Avatar key={i} className="h-7 w-7 border-2 border-card ring-0">
              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">{initial}</AvatarFallback>
            </Avatar>
          ))}
          {avatars.length > 4 && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-semibold text-muted-foreground">
              +{avatars.length - 4}
            </div>
          )}
        </div>
        <Button 
          size="sm" 
          variant={status === "waiting" ? "default" : "outline"} 
          className="h-8 px-4 text-xs font-semibold gap-1.5 transition-all duration-200"
        >
          {status === "waiting" ? (
            <>Join<ArrowRight className="h-3 w-3" /></>
          ) : (
            <><Eye className="h-3 w-3" />Watch</>
          )}
        </Button>
      </div>
    </div>
  )
}

export function FeaturedRooms() {
  return (
    <section className="py-20 bg-muted/40">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Join Now</span>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl mt-2">Featured Rounds</h2>
            <p className="mt-2 text-muted-foreground max-w-md">Active multiplayer rooms with real-time competition</p>
          </div>
          <Button variant="outline" className="gap-2 font-semibold self-start sm:self-auto">
            View all rooms
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {rooms.map((room) => (
            <RoomCard key={room.title} {...room} />
          ))}
        </div>
      </div>
    </section>
  )
}
