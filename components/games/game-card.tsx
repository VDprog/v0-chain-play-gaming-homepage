"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, ArrowRight, Handshake, Bomb, CircleDot, Clock, Timer, Crown, Gamepad2, Brain, Eye, Zap, Link as LinkIcon, Bitcoin, Search } from "lucide-react"
import type { GameData, IconName } from "@/lib/games-data"

const iconMap: Record<IconName, React.ComponentType<{ className?: string }>> = {
  handshake: Handshake,
  bomb: Bomb,
  "circle-dot": CircleDot,
  clock: Clock,
  timer: Timer,
  crown: Crown,
  users: Users,
  brain: Brain,
  eye: Eye,
  zap: Zap,
  link: LinkIcon,
  bitcoin: Bitcoin,
  search: Search,
}

interface GameCardProps {
  game: GameData
}

export function GameCard({ game }: GameCardProps) {
  const Icon = iconMap[game.iconName] || Gamepad2
  const isComingSoon = game.status === "coming_soon"
  
  const badgeStyles = {
    trending: "bg-primary text-primary-foreground",
    live: "bg-emerald-500 text-white",
    new: "bg-amber-500 text-white",
    popular: "bg-muted text-muted-foreground",
  }

  const CardWrapper = isComingSoon ? "div" : Link
  const cardProps = isComingSoon ? {} : { href: `/games/${game.slug}` }

  return (
    <CardWrapper {...cardProps} className="block">
      <div className={`group relative flex flex-col rounded-xl border border-border bg-card p-6 card-premium h-full ${isComingSoon ? "opacity-70" : "cursor-pointer"}`}>
        {/* Coming Soon badge takes priority */}
        {isComingSoon ? (
          <span className="absolute top-4 right-4 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide bg-muted text-muted-foreground">
            Coming Soon
          </span>
        ) : game.badge && game.badgeType && (
          <span className={`absolute top-4 right-4 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${badgeStyles[game.badgeType]} ${game.badgeType === "live" ? "animate-pulse-live" : ""}`}>
            {game.badge}
          </span>
        )}
        
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-5 transition-all duration-200 ${!isComingSoon && "group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/20 group-hover:scale-105"}`}>
          <Icon className="h-6 w-6" />
        </div>
        
        <h3 className={`text-base font-semibold text-foreground mb-2 transition-colors duration-200 ${!isComingSoon && "group-hover:text-primary"}`}>{game.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">{game.description}</p>
        
        {/* Show categories as tags */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {game.categories.slice(0, 3).map((category) => (
            <span key={category} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {category}
            </span>
          ))}
          {/* Player count indicator */}
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {game.minPlayers === game.maxPlayers ? `${game.minPlayers}P` : `${game.minPlayers}-${game.maxPlayers}P`}
          </span>
        </div>
        
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-border">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {/* Players online */}
            <div className="flex items-center gap-1.5">
              {game.playersOnline > 0 && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
              <Users className="h-3.5 w-3.5" />
              <span className="font-medium tabular-nums">{game.playersOnline}</span>
            </div>
            {/* Active rooms */}
            {game.activeRooms > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground">{game.activeRooms} room{game.activeRooms !== 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
          {isComingSoon ? (
            <Button size="sm" className="h-9 px-4 text-xs font-semibold gap-1.5" disabled>
              Coming Soon
            </Button>
          ) : (
            <Button size="sm" className="h-9 px-4 text-xs font-semibold gap-1.5 opacity-90 group-hover:opacity-100 transition-all duration-200">
              Play
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Button>
          )}
        </div>
      </div>
    </CardWrapper>
  )
}
