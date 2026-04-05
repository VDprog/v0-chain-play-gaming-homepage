"use client"

import { Button } from "@/components/ui/button"
import { Users, ArrowRight } from "lucide-react"
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
    trending: "bg-primary/10 text-primary",
    live: "bg-green-500/10 text-green-600",
    new: "bg-accent/10 text-accent",
    popular: "bg-muted text-muted-foreground",
  }

  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/8 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        {badge && (
          <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${badgeStyles[badgeType]}`}>
            {badge}
          </span>
        )}
      </div>
      
      <h3 className="mb-1.5 text-base font-semibold text-foreground">{title}</h3>
      <p className="mb-4 text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">{description}</p>
      
      <div className="flex items-center justify-between pt-4 border-t border-border/60">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{new Intl.NumberFormat("en-US").format(players)}</span>
        </div>
        <Button size="sm" variant="ghost" className="h-8 gap-1.5 px-3 text-primary hover:text-primary hover:bg-primary/10 font-medium">
          Play
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
