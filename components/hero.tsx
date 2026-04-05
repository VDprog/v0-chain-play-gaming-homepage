"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Dices, Coins, Bomb, CircleDot, HelpCircle } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-secondary/30 to-primary/5 py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              <span>Web3 Gaming Platform</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
              Play. Compete.{" "}
              <span className="text-primary">Win on-chain.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Fast mini-games, live quiz battles, 1v1 duels, team rounds, and viral game mechanics built for web3.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gap-2 px-8">
                Start Playing
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="px-8">
                Browse Games
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-background bg-gradient-to-br from-primary/60 to-accent/60"
                  />
                ))}
              </div>
              <div className="text-sm">
                <span className="font-semibold text-foreground">2,500+</span>
                <span className="text-muted-foreground"> players online now</span>
              </div>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="relative h-[450px] w-full">
              {/* Floating game elements */}
              <div className="absolute left-8 top-8 animate-float">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-card shadow-xl border border-border/50">
                  <Dices className="h-10 w-10 text-primary" />
                </div>
              </div>
              <div className="absolute right-12 top-16 animate-float-delayed">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card shadow-xl border border-border/50">
                  <Coins className="h-8 w-8 text-accent" />
                </div>
              </div>
              <div className="absolute left-20 top-1/2 animate-float">
                <div className="flex h-18 w-18 items-center justify-center rounded-2xl bg-card shadow-xl border border-border/50 p-4">
                  <Bomb className="h-9 w-9 text-destructive" />
                </div>
              </div>
              <div className="absolute right-8 bottom-28 animate-float-delayed">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card shadow-xl border border-border/50">
                  <CircleDot className="h-7 w-7 text-primary" />
                </div>
              </div>
              <div className="absolute left-1/3 bottom-12 animate-float">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card shadow-xl border border-border/50">
                  <HelpCircle className="h-8 w-8 text-accent" />
                </div>
              </div>
              {/* Central glow */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 rounded-full bg-accent/15 blur-2xl" />
            </div>
          </div>
        </div>
      </div>
      {/* Background decorations */}
      <div className="absolute top-0 left-0 h-full w-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
      </div>
    </section>
  )
}
