"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, UserPlus, Flame, TrendingUp, Gamepad2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface ActivityItem {
  id: string
  avatar: string
  name: string
  action: string
  detail?: string
  icon: LucideIcon
  iconColor: string
  time: string
}

const activities: ActivityItem[] = [
  {
    id: "1",
    avatar: "VL",
    name: "Vlad",
    action: "won Pass the Bomb",
    detail: "+5 XTZ",
    icon: Trophy,
    iconColor: "text-amber-500",
    time: "2s ago",
  },
  {
    id: "2",
    avatar: "EV",
    name: "Eva",
    action: "joined Room #204",
    icon: UserPlus,
    iconColor: "text-primary",
    time: "15s ago",
  },
  {
    id: "3",
    avatar: "PA",
    name: "Panda",
    action: "started a",
    detail: "6 win streak",
    icon: Flame,
    iconColor: "text-orange-500",
    time: "1m ago",
  },
  {
    id: "4",
    avatar: "JK",
    name: "Jack",
    action: "entered",
    detail: "Top 10",
    icon: TrendingUp,
    iconColor: "text-emerald-500",
    time: "2m ago",
  },
  {
    id: "5",
    avatar: "LU",
    name: "Luna",
    action: "joined Speed Quiz",
    icon: Gamepad2,
    iconColor: "text-primary",
    time: "3m ago",
  },
]

export function LiveActivity() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
        <h3 className="font-semibold text-foreground">Live Activity</h3>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </div>
      <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
        {activities.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.id} className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-muted/30">
              <Avatar className="h-9 w-9 border border-border flex-shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {item.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">{item.name}</span>{" "}
                  <span className="text-muted-foreground">{item.action}</span>
                  {item.detail && (
                    <span className="font-semibold text-primary"> {item.detail}</span>
                  )}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Icon className={`h-3 w-3 ${item.iconColor}`} />
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
