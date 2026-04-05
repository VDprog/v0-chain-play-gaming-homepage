"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Users, Zap, Trophy } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-card border-b border-border">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.50_0.18_260/0.08),transparent)]" />
      
      <div className="container relative mx-auto px-6 lg:px-8 py-20 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Zap className="h-3.5 w-3.5" />
            <span>Web3 Mini-Games Platform</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[56px] text-balance leading-[1.1]">
            Play. Compete.{" "}
            <span className="text-primary">Win on-chain.</span>
          </h1>
          
          {/* Subheadline */}
          <p className="mx-auto mt-5 max-w-lg text-base text-muted-foreground leading-relaxed sm:text-lg">
            Fast mini-games, live quiz battles, 1v1 duels, and team rounds with real stakes.
          </p>
          
          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" className="h-11 gap-2 px-6 font-semibold shadow-md shadow-primary/15">
              <Play className="h-4 w-4" />
              Start Playing
            </Button>
            <Button size="lg" variant="outline" className="h-11 gap-2 px-6 font-semibold">
              Browse Games
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Stats */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-foreground">2,500+</p>
                <p className="text-xs text-muted-foreground">Online now</p>
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Trophy className="h-4 w-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-foreground">50K+</p>
                <p className="text-xs text-muted-foreground">Games played</p>
              </div>
            </div>
            <div className="h-8 w-px bg-border hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-foreground">$125K</p>
                <p className="text-xs text-muted-foreground">Won this week</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
