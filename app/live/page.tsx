import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LiveHero } from "@/components/live/live-hero"
import { LiveFilters } from "@/components/live/live-filters"
import { FeaturedMatch } from "@/components/live/featured-match"
import { LiveRoomsGrid } from "@/components/live/live-rooms-grid"
import { LiveActivity } from "@/components/live/live-activity"
import { TrendingNow } from "@/components/live/trending-now"
import { QuickJoinStrip } from "@/components/live/quick-join-strip"
import { LiveProvider } from "@/components/live/live-context"

export const metadata = {
  title: "Live Now - ChainPlay",
  description: "Jump into active games, watch ongoing rounds, or join the next match.",
}

export default function LivePage() {
  return (
    <LiveProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <LiveHero />
          <LiveFilters />
          <section className="py-12 bg-background">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                  <FeaturedMatch />
                  <LiveRoomsGrid />
                </div>
                <div className="space-y-6">
                  <LiveActivity />
                  <TrendingNow />
                </div>
              </div>
            </div>
          </section>
          <QuickJoinStrip />
        </main>
        <Footer />
      </div>
    </LiveProvider>
  )
}
