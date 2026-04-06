"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Users, Zap, Trophy, Star } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-card">
      {/* Premium layered gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_60%_at_50%_-30%,oklch(0.55_0.22_255/0.15),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_80%,oklch(0.65_0.16_235/0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_90%,oklch(0.55_0.22_255/0.05),transparent_40%)]" />
      
      {/* Animated floating orbs */}
      <div className="absolute top-20 left-[15%] w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 right-[10%] w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      
      {/* Subtle dot pattern */}
      <div 
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(oklch(0.13 0.025 255) 1px, transparent 1px)`,
          backgroundSize: "24px 24px"
        }}
      />
      
      <div className="container relative mx-auto px-6 lg:px-8 py-24 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">
          {/* Floating badge */}
          <div className="mb-10 inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/[0.06] px-5 py-2.5 text-sm font-medium text-primary shadow-lg shadow-primary/5 animate-float">
            <Star className="h-4 w-4 fill-primary/30" />
            <span className="font-semibold">Web3 Mini-Games Platform</span>
            <span className="ml-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">Beta</span>
          </div>
          
          {/* Main headline with gradient accent */}
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl text-balance leading-[1.05]">
            Play. Compete.{" "}
            <span className="relative inline-block">
              <span className="text-gradient">Win on-chain.</span>
              <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                <path d="M2 6C50 2 150 2 198 6" stroke="url(#underline-gradient)" strokeWidth="3" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="underline-gradient" x1="0" y1="0" x2="200" y2="0">
                    <stop stopColor="oklch(0.55 0.22 255)" />
                    <stop offset="1" stopColor="oklch(0.65 0.16 235)" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="mx-auto mt-8 max-w-xl text-lg text-muted-foreground leading-relaxed sm:text-xl">
            Fast mini-games, live quiz battles, 1v1 duels, and team rounds with real stakes. Join thousands of players competing daily.
          </p>
          
          {/* CTAs with premium styling */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="h-14 gap-3 px-8 text-base font-semibold shadow-xl shadow-primary/25 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.03] animate-glow" asChild>
              <Link href="/games">
                <Play className="h-5 w-5" />
                Start Playing
                <ArrowRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 gap-3 px-8 text-base font-semibold border-2 transition-all duration-300 hover:bg-primary/5 hover:border-primary/30 hover:shadow-lg" asChild>
              <Link href="/games">
                Browse Games
              </Link>
            </Button>
          </div>
          
          {/* Stats cards */}
          <div className="mt-20 flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            <div className="group flex items-center gap-4 rounded-2xl bg-card border border-border px-6 py-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-inner">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-foreground">2,547</p>
                <p className="text-sm text-muted-foreground font-medium">Online now</p>
              </div>
            </div>
            
            <div className="group flex items-center gap-4 rounded-2xl bg-card border border-border px-6 py-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-inner">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-foreground">52,340</p>
                <p className="text-sm text-muted-foreground font-medium">Games played</p>
              </div>
            </div>
            
            <div className="group flex items-center gap-4 rounded-2xl bg-card border border-border px-6 py-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-emerald-500/20 hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 shadow-inner">
                <Zap className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-foreground">$125K</p>
                <p className="text-sm text-muted-foreground font-medium">Won this week</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
