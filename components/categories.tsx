"use client"

import { HelpCircle, Swords, Users, Zap, Radio, Trophy } from "lucide-react"

const categories = [
  { name: "Quizzes", icon: HelpCircle, count: "24 games" },
  { name: "1v1 Games", icon: Swords, count: "18 games" },
  { name: "Team Games", icon: Users, count: "12 games" },
  { name: "Quick Games", icon: Zap, count: "36 games" },
  { name: "Live Rounds", icon: Radio, count: "8 active" },
  { name: "Tournaments", icon: Trophy, count: "5 open" },
]

export function Categories() {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-wrap justify-center gap-3 lg:gap-4">
          {categories.map((category) => (
            <button
              key={category.name}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3 transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <category.icon className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">{category.name}</p>
                <p className="text-xs text-muted-foreground">{category.count}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
