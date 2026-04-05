"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Users, Zap, Trophy } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background py-24 lg:py-32">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.50_0.18_260/0.04),transparent_50%),radial-gradient(circle_at_70%_80%,oklch(0.62_0.14_240/0.03),transparent_50%)]" />
      
      <div className="container relative mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-primary/8 px-4 py-2 text-sm font-medium text-primary ring-1 ring-primary/15">
            <Zap className="h-4 w-4" />
            <span>Web3 Mini-Games Platform</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance leading-[1.1]">
            Play. Compete.{" "}
            <span className="text-primary">Win on-chain.</span>
          </h1>
          
          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Fast mini-games, live quiz battles, 1v1 duels, and team rounds. Skill-based gaming with real stakes and instant rewards.
          </p>
          
          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="h-12 gap-2.5 px-8 text-[15px] font-semibold shadow-lg shadow-primary/20">
              <Play className="h-4 w-4" />
              Start Playing
            </Button>
            <Button size="lg" variant="outline" className="h-12 gap-2 px-8 text-[15px] font-semibold">
              Browse Games
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Social proof */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-8 lg:gap-12">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-foreground">2,500+</p>
                <p className="text-sm text-muted-foreground">Players online</p>
              </div>
            </div>
            <div className="h-10 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                <Trophy className="h-5 w-5 text-accent" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-foreground">50K+</p>
                <p className="text-sm text-muted-foreground">Games played</p>
              </div>
            </div>
            <div className="h-10 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-3/10">
                <Zap className="h-5 w-5 text-chart-3" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-foreground">$125K</p>
                <p className="text-sm text-muted-foreground">Won this week</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
