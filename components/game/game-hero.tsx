"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Play, Users, Bomb, Handshake, CircleDot, Clock, Timer, Crown, Gamepad2 } from "lucide-react"

const iconMap = {
  bomb: Bomb,
  handshake: Handshake,
  "circle-dot": CircleDot,
  clock: Clock,
  timer: Timer,
  crown: Crown,
  gamepad: Gamepad2,
} as const

type IconName = keyof typeof iconMap

interface GameHeroProps {
  title: string
  description: string
  iconName: IconName
  tags: string[]
  slug: string
}

export function GameHero({ title, description, iconName, tags, slug }: GameHeroProps) {
  const Icon = iconMap[iconName] || Gamepad2
  
  return (
    <section className="relative py-16 lg:py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/3 to-transparent" />
      
      <div className="container mx-auto px-6 lg:px-8 relative">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/games" className="hover:text-primary transition-colors">Games</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{title}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                <Icon className="h-8 w-8" />
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary border-0"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
              {title}
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg">
              {description}
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="h-12 px-8 text-base font-semibold gap-2 shadow-lg shadow-primary/25">
                <Play className="h-5 w-5" />
                Play Now
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold gap-2">
                <Users className="h-5 w-5" />
                Join Live Room
              </Button>
            </div>
          </div>

          {/* Right: Game Preview */}
          <div className="relative">
            <div className="relative bg-card rounded-2xl border border-border p-8 shadow-xl">
              {/* Live indicator */}
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-full text-xs font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Preview
              </div>

              {/* Circular player layout */}
              <div className="relative h-64 flex items-center justify-center">
                {/* Timer ring */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="text-border"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray="283"
                      strokeDashoffset="70"
                      strokeLinecap="round"
                      className="text-primary"
                    />
                  </svg>
                </div>

                {/* Center bomb */}
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-glow">
                    <Bomb className="h-10 w-10 text-primary" />
                  </div>
                  <span className="mt-3 text-2xl font-bold text-foreground font-mono">05s</span>
                </div>

                {/* Players around the circle */}
                {[
                  { name: "Vlad", position: "top-0 left-1/2 -translate-x-1/2", active: true },
                  { name: "Eva", position: "right-0 top-1/2 -translate-y-1/2", active: false },
                  { name: "Panda", position: "bottom-0 left-1/2 -translate-x-1/2", active: false },
                  { name: "Jack", position: "left-0 top-1/2 -translate-y-1/2", active: false },
                ].map((player) => (
                  <div
                    key={player.name}
                    className={`absolute ${player.position} flex flex-col items-center`}
                  >
                    <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold ${player.active ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}`}>
                      {player.name[0]}
                    </div>
                    <span className={`text-xs mt-1 ${player.active ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                      {player.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
