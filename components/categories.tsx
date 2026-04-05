"use client"

import { HelpCircle, Swords, Users, Zap, Radio, Trophy } from "lucide-react"

const categories = [
  { name: "Quizzes", icon: HelpCircle, count: 12 },
  { name: "1v1 Games", icon: Swords, count: 8 },
  { name: "Team Games", icon: Users, count: 6 },
  { name: "Quick Games", icon: Zap, count: 15 },
  { name: "Live Rounds", icon: Radio, count: 4, active: true },
  { name: "Tournaments", icon: Trophy, count: 3 },
]

export function Categories() {
  return (
    <section className="py-6 bg-background border-b border-border">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((category) => (
            <button
              key={category.name}
              className={`group flex items-center gap-2.5 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                category.active
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-card border border-border text-foreground hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
              }`}
            >
              <category.icon className={`h-4 w-4 transition-colors duration-200 ${category.active ? "" : "text-muted-foreground group-hover:text-primary"}`} />
              <span>{category.name}</span>
              <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full transition-colors duration-200 ${
                category.active 
                  ? "bg-primary-foreground/20 text-primary-foreground" 
                  : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              }`}>
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
