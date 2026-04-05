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
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Game Previews</h2>
                <p className="mt-1.5 text-muted-foreground">See what gameplay looks like</p>
              </div>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2 grid gap-5 sm:grid-cols-2">
                <SplitOrStealPreview />
                <PassTheBombPreview />
                <div className="sm:col-span-2">
                  <QuizPreview />
                </div>
              </div>
              <div className="flex flex-col gap-5">
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
