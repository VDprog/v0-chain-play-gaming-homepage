"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, ArrowRight, Handshake, Bomb, CircleDot, Clock, Timer, Crown, Gamepad2 } from "lucide-react"

const iconMap = {
  handshake: Handshake,
  bomb: Bomb,
  "circle-dot": CircleDot,
  clock: Clock,
  timer: Timer,
  crown: Crown,
  gamepad: Gamepad2,
} as const

type IconName = keyof typeof iconMap

interface GameCardProps {
  title: string
  description: string
  iconName: IconName
  players: number
  badge?: string
  badgeType?: "trending" | "live" | "new" | "popular"
  slug?: string
}

export function GameCard({ title, description, iconName, players, badge, badgeType = "popular", slug }: GameCardProps) {
  const Icon = iconMap[iconName] || Gamepad2
  
  const badgeStyles = {
    trending: "bg-primary text-primary-foreground",
    live: "bg-emerald-500 text-white",
    new: "bg-amber-500 text-white",
    popular: "bg-muted text-muted-foreground",
  }

  const gameSlug = slug || title.toLowerCase().replace(/\s+/g, "-")

  return (
    <Link href={`/games/${gameSlug}`} className="block">
      <div className="group relative flex flex-col rounded-xl border border-border bg-card p-6 card-premium cursor-pointer h-full">
        {badge && (
          <span className={`absolute top-4 right-4 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${badgeStyles[badgeType]} ${badgeType === "live" ? "animate-pulse-live" : ""}`}>
            {badge}
          </span>
        )}
        
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-5 transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/20 group-hover:scale-105">
          <Icon className="h-6 w-6" />
        </div>
        
        <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">{description}</p>
        
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Users className="h-3.5 w-3.5" />
            </div>
            <span className="font-medium">{new Intl.NumberFormat("en-US").format(players)}</span>
          </div>
          <Button size="sm" className="h-9 px-4 text-xs font-semibold gap-1.5 opacity-90 group-hover:opacity-100 transition-all duration-200">
            Play
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </Link>
  )
}
