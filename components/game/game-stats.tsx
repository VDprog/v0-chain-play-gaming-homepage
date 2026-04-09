"use client"

import { Users, DoorOpen, Clock, Flame } from "lucide-react"

interface GameStatsProps {
  playersOnline: number
  activeRooms: number
  avgMatchTime: string
  bestStreak: number
}

export function GameStats({ playersOnline = 0, activeRooms = 0, avgMatchTime = "0:00", bestStreak = 0 }: GameStatsProps) {
  const stats = [
    {
      label: "Players Online",
      value: new Intl.NumberFormat("en-US").format(playersOnline ?? 0),
      icon: Users,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Active Rooms",
      value: (activeRooms ?? 0).toString(),
      icon: DoorOpen,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Avg Match Time",
      value: avgMatchTime ?? "0:00",
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Best Streak Today",
      value: (bestStreak ?? 0).toString(),
      icon: Flame,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
    },
  ]

  return (
    <section className="py-8 border-y border-border bg-card">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
