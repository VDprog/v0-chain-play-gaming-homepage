import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Categories } from "@/components/categories"
import { PopularGames } from "@/components/popular-games"
import { FeaturedRooms } from "@/components/featured-rooms"
import { LiveGames } from "@/components/live-games"
import { Leaderboard } from "@/components/leaderboard"
import { SplitOrStealPreview, PassTheBombPreview, QuizPreview } from "@/components/game-previews"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Categories />
        <PopularGames />
        <FeaturedRooms />
        
        {/* Game Previews & Sidebar Section */}
        <section className="py-16 bg-gradient-to-b from-secondary/30 to-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-foreground">Game Previews</h2>
              <p className="mt-2 text-muted-foreground">See what gameplay looks like</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
                <SplitOrStealPreview />
                <PassTheBombPreview />
                <div className="md:col-span-2">
                  <QuizPreview />
                </div>
              </div>
              <div className="space-y-6">
                <LiveGames />
                <Leaderboard />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
