"use client"

import { DoorOpen, Clock, Bomb, Trophy } from "lucide-react"

const rules = [
  {
    step: 1,
    title: "Join a Room",
    description: "Find an open room or create your own. Wait for other players to join.",
    icon: DoorOpen,
  },
  {
    step: 2,
    title: "Wait for Start",
    description: "Once enough players join, the match begins with a short countdown.",
    icon: Clock,
  },
  {
    step: 3,
    title: "Pass the Bomb",
    description: "When you have the bomb, quickly pass it to another player before time runs out.",
    icon: Bomb,
  },
  {
    step: 4,
    title: "Be the Survivor",
    description: "The last player standing wins the round and claims the prize pool.",
    icon: Trophy,
  },
]

export function GameRules() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Learn</span>
          <h2 className="text-2xl font-bold text-foreground mt-2">How It Works</h2>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            Simple rules, intense gameplay. Here&apos;s how to play.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {rules.map((rule) => (
            <div key={rule.step} className="relative bg-card rounded-xl border border-border p-6 text-center card-premium">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                {rule.step}
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto mb-4">
                <rule.icon className="h-7 w-7" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{rule.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{rule.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
