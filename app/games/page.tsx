import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { GamesGrid } from "@/components/games/games-grid"
import { GamesHeroStats } from "@/components/games/games-hero-stats"
import { gamesData } from "@/lib/games-data"

export const metadata = {
  title: "All Games | ChainPlay",
  description: "Browse all available games on ChainPlay. Fast mini-games, live quiz battles, 1v1 duels, and more.",
}

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative py-16 lg:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/3 to-transparent" />
          
          <div className="container mx-auto px-6 lg:px-8 relative">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">All Games</span>
            </nav>

            <div className="max-w-2xl">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Browse Collection</span>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4 tracking-tight">
                All Games
              </h1>
              <GamesHeroStats gameCount={gamesData.length} />
            </div>
          </div>
        </section>

        {/* Games Grid */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6 lg:px-8">
            <GamesGrid games={gamesData} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
