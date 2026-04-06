"use client"

import { Button } from "@/components/ui/button"
import { Zap, Shuffle, ArrowRight } from "lucide-react"
import { toast } from "sonner"

export function QuickJoinStrip() {
  const handleQuickJoin = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: "Finding the fastest available room...",
        success: "Found a match! Joining Split or Steal Room #156",
        error: "No available rooms right now. Try again later.",
      }
    )
  }

  return (
    <section className="py-12 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl border border-primary/20 bg-card p-8 shadow-lg shadow-primary/5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Shuffle className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">{"Don't want to choose?"}</h3>
              <p className="text-muted-foreground mt-1">Jump into the fastest available room instantly.</p>
            </div>
          </div>
          <Button size="lg" className="gap-2 font-semibold px-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 whitespace-nowrap" onClick={handleQuickJoin}>
            <Zap className="h-5 w-5" />
            Quick Join Random Room
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
