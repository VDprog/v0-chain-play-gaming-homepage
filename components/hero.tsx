"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Users, Zap, Trophy, Sparkles } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-card border-b border-border">
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.50_0.18_260/0.12),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,oklch(0.62_0.14_240/0.06),transparent)]" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      <div className="container relative mx-auto px-6 lg:px-8 py-24 lg:py-32">
        <div className="mx-auto max-w-2xl text-center">
          {/* Badge with shimmer effect */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary shadow-sm shadow-primary/5">
            <Sparkles className="h-4 w-4" />
            <span>Web3 Mini-Games Platform</span>
            <span className="ml-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">Beta</span>
          </div>
          
          {/* Headline with better typography */}
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance leading-[1.08]">
            Play. Compete.{" "}
            <span className="relative">
              <span className="relative z-10 text-primary">Win on-chain.</span>
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-primary/10 -skew-x-3 rounded" />
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed">
            Fast mini-games, live quiz battles, 1v1 duels, and team rounds with real stakes. Join thousands of players competing daily.
          </p>
          
          {/* CTAs with improved styling */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="h-12 gap-2.5 px-8 font-semibold shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl hover:shadow-primary/25 hover:scale-[1.02]">
              <Play className="h-4 w-4" />
              Start Playing
            </Button>
            <Button size="lg" variant="outline" className="h-12 gap-2.5 px-8 font-semibold transition-all duration-200 hover:bg-muted/50">
              Browse Games
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Stats with enhanced styling */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            <div className="group flex items-center gap-3 transition-transform duration-200 hover:scale-105">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 shadow-sm transition-colors group-hover:bg-primary/15">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-xl font-bold text-foreground">2,547</p>
                <p className="text-xs text-muted-foreground font-medium">Online now</p>
              </div>
            </div>
            <div className="h-10 w-px bg-border/60" />
            <div className="group flex items-center gap-3 transition-transform duration-200 hover:scale-105">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 shadow-sm transition-colors group-hover:bg-primary/15">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-xl font-bold text-foreground">52,340</p>
                <p className="text-xs text-muted-foreground font-medium">Games played</p>
              </div>
            </div>
            <div className="h-10 w-px bg-border/60 hidden sm:block" />
            <div className="hidden sm:flex group items-center gap-3 transition-transform duration-200 hover:scale-105">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 shadow-sm transition-colors group-hover:bg-emerald-500/15">
                <Zap className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="text-xl font-bold text-foreground">$125K</p>
                <p className="text-xs text-muted-foreground font-medium">Won this week</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
