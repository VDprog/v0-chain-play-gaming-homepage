"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface GameCardProps {
  title: string
  description: string
  icon: LucideIcon
  players: number
  badge?: string
  accentColor?: string
}

export function GameCard({ title, description, icon: Icon, players, badge, accentColor = "primary" }: GameCardProps) {
  const colorVariants: Record<string, string> = {
    primary: "from-primary/20 to-primary/5 text-primary",
    accent: "from-accent/20 to-accent/5 text-accent",
    destructive: "from-destructive/20 to-destructive/5 text-destructive",
    chart1: "from-chart-1/20 to-chart-1/5 text-chart-1",
    chart2: "from-chart-2/20 to-chart-2/5 text-chart-2",
    chart3: "from-chart-3/20 to-chart-3/5 text-chart-3",
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-xl hover:-translate-y-1">
      {badge && (
        <Badge className="absolute top-4 right-4 bg-primary/10 text-primary border-primary/20">
          {badge}
        </Badge>
      )}
      <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${colorVariants[accentColor] || colorVariants.primary}`}>
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-foreground">{title}</h3>
      <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{players.toLocaleString()} playing</span>
        </div>
        <Button size="sm" className="px-6">Play</Button>
      </div>
    </div>
  )
}
