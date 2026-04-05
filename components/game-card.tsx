"use client"

import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface GameCardProps {
  title: string
  description: string
  icon: LucideIcon
  players: number
  badge?: string
  badgeType?: "trending" | "live" | "new" | "popular"
}

export function GameCard({ title, description, icon: Icon, players, badge, badgeType = "popular" }: GameCardProps) {
  const badgeStyles = {
    trending: "bg-primary/10 text-primary border-primary/20",
    live: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    new: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    popular: "bg-muted text-muted-foreground border-transparent",
  }

  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-border hover:shadow-lg hover:shadow-foreground/[0.03] cursor-pointer">
      {badge && (
        <span className={`absolute top-4 right-4 text-[11px] font-medium px-2 py-0.5 rounded border ${badgeStyles[badgeType]}`}>
          {badge}
        </span>
      )}
      
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
        <Icon className="h-5 w-5" />
      </div>
      
      <h3 className="text-[15px] font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">{description}</p>
      
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>{new Intl.NumberFormat("en-US").format(players)} playing</span>
        </div>
        <Button size="sm" className="h-8 px-4 text-xs font-semibold">
          Play
        </Button>
      </div>
    </div>
  )
}
