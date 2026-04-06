"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Bomb, HelpCircle, Handshake, Timer, Crown, CircleDot,
  Users, Eye, ArrowRight, Clock
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface LiveRoom {
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
  round?: string
}

const liveRooms: LiveRoom[] = [
  {
    id: "1",
    title: "Split or Steal",
    roomNumber: "#301",
    icon: Handshake,
    players: 6,
    maxPlayers: 8,
    status: "live",
    statusText: "Round 3",
    avatars: ["VL", "EV", "PA", "JK", "AD", "LU"],
    timer: "1:24",
    round: "3/5",
  },
  {
    id: "2",
    title: "Speed Quiz",
    roomNumber: "#156",
    icon: HelpCircle,
    players: 8,
    maxPlayers: 10,
    status: "live",
    statusText: "Question 7",
    avatars: ["AL", "BN", "CR", "DV", "EM", "FN", "GR", "HK"],
    timer: "0:12",
  },
  {
    id: "3",
    title: "Timer Challenge",
    roomNumber: "#089",
    icon: Timer,
    players: 4,
    maxPlayers: 6,
    status: "starting",
    statusText: "Starts in 45s",
    avatars: ["QZ", "WB", "ER", "TY"],
  },
  {
    id: "4",
    title: "Last Survivor",
    roomNumber: "#445",
    icon: Crown,
    players: 10,
    maxPlayers: 10,
    status: "live",
    statusText: "Final round",
    avatars: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "TA"],
    timer: "0:33",
  },
  {
    id: "5",
    title: "Hidden Button",
    roomNumber: "#567",
    icon: CircleDot,
    players: 3,
    maxPlayers: 8,
    status: "waiting",
    statusText: "Waiting for players",
    avatars: ["X1", "X2", "X3"],
  },
  {
    id: "6",
    title: "Pass the Bomb",
    roomNumber: "#892",
    icon: Bomb,
    players: 5,
    maxPlayers: 6,
    status: "starting",
    statusText: "Starts in 12s",
    avatars: ["Y1", "Y2", "Y3", "Y4", "Y5"],
  },
]

function RoomCard({ room }: { room: LiveRoom }) {
  const Icon = room.icon
  const statusConfig = {
    live: { color: "text-emerald-600", bg: "bg-emerald-500", label: "LIVE" },
    starting: { color: "text-amber-600", bg: "bg-amber-500", label: "STARTING" },
    waiting: { color: "text-primary", bg: "bg-primary", label: "WAITING" },
  }
  const config = statusConfig[room.status]

  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {room.title}
            </h4>
            <span className="text-xs text-muted-foreground">{room.roomNumber}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.bg} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${config.bg}`}></span>
          </span>
          <span className={`text-[10px] font-bold ${config.color}`}>{config.label}</span>
        </div>
      </div>
      
      {/* Status */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          <span className="font-medium">{room.players}/{room.maxPlayers}</span>
        </div>
        {room.timer && (
          <div className="flex items-center gap-1.5 text-primary font-semibold">
            <Clock className="h-3.5 w-3.5" />
            <span className="tabular-nums">{room.timer}</span>
          </div>
        )}
        {room.round && (
          <span className="text-xs">Round {room.round}</span>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground mb-4">{room.statusText}</p>
      
      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
        <div className="flex -space-x-2">
          {room.avatars.slice(0, 4).map((initial, i) => (
            <Avatar key={i} className="h-7 w-7 border-2 border-card ring-0">
              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                {initial}
              </AvatarFallback>
            </Avatar>
          ))}
          {room.avatars.length > 4 && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-semibold text-muted-foreground">
              +{room.avatars.length - 4}
            </div>
          )}
        </div>
        <Button 
          size="sm" 
          variant={room.status === "waiting" ? "default" : "outline"} 
          className="h-8 px-4 text-xs font-semibold gap-1.5 transition-all duration-200"
        >
          {room.status === "waiting" || room.status === "starting" ? (
            <>Join<ArrowRight className="h-3 w-3" /></>
          ) : (
            <><Eye className="h-3 w-3" />Watch</>
          )}
        </Button>
      </div>
    </div>
  )
}

export function LiveRoomsGrid() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Live Rooms</h2>
        <span className="text-sm text-muted-foreground">{liveRooms.length} rooms active</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {liveRooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  )
}
