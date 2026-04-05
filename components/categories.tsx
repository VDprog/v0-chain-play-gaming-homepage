"use client"

import { HelpCircle, Swords, Users, Zap, Radio, Trophy } from "lucide-react"

const categories = [
  { name: "Quizzes", icon: HelpCircle, count: 24 },
  { name: "1v1 Games", icon: Swords, count: 18 },
  { name: "Team Games", icon: Users, count: 12 },
  { name: "Quick Games", icon: Zap, count: 36 },
  { name: "Live Rounds", icon: Radio, count: 8, isLive: true },
  { name: "Tournaments", icon: Trophy, count: 5 },
]

export function Categories() {
  return (
    <section className="py-4 bg-background border-b border-border">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.name}
              className="flex items-center gap-2 whitespace-nowrap rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-all hover:border-primary/30 hover:bg-primary/5"
            >
              <category.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{category.name}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${category.isLive ? "bg-emerald-500/10 text-emerald-600" : "text-muted-foreground"}`}>
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
