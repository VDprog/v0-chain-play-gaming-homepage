"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, Bomb, HelpCircle, Swords, Zap, Clock } from "lucide-react"

const filters = [
  { label: "All", value: "all", icon: null },
  { label: "Pass the Bomb", value: "bomb", icon: Bomb },
  { label: "Quiz", value: "quiz", icon: HelpCircle },
  { label: "1v1", value: "1v1", icon: Swords },
  { label: "Fast Games", value: "fast", icon: Zap },
  { label: "Starting Soon", value: "starting", icon: Clock },
]

const sortOptions = [
  { label: "Most Active", value: "active" },
  { label: "Newest", value: "newest" },
  { label: "Almost Full", value: "full" },
]

export function LiveFilters() {
  const [activeFilter, setActiveFilter] = useState("all")
  const [sortBy, setSortBy] = useState("active")
  const [showSort, setShowSort] = useState(false)

  return (
    <section className="py-4 border-b border-border bg-card/50 sticky top-16 z-40 backdrop-blur-sm">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            {filters.map((filter) => {
              const isActive = activeFilter === filter.value
              const Icon = filter.icon
              return (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  {filter.label}
                </button>
              )
            })}
          </div>
          
          {/* Sort dropdown */}
          <div className="relative flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 font-medium"
              onClick={() => setShowSort(!showSort)}
            >
              {sortOptions.find(s => s.value === sortBy)?.label}
              <ChevronDown className={`h-4 w-4 transition-transform ${showSort ? "rotate-180" : ""}`} />
            </Button>
            {showSort && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
                <div className="absolute right-0 mt-2 w-40 rounded-lg border border-border bg-card shadow-lg z-20 py-1">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value)
                        setShowSort(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                        sortBy === option.value
                          ? "bg-primary/5 text-primary font-medium"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
