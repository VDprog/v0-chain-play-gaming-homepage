import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { GameHero } from "@/components/game/game-hero"
import { GameStats } from "@/components/game/game-stats"
import { RoomList } from "@/components/room/room-list"
import { GameRoom } from "@/components/game/game-room"
import { GameRules } from "@/components/game/game-rules"
import { RecentMatches } from "@/components/game/recent-matches"
import { PlayerStats } from "@/components/game/player-stats"
import { RelatedGames } from "@/components/game/related-games"
import { getGameBySlug, getAllSlugs, normalizeSlug } from "@/lib/games-data"
import { createClient } from "@/lib/supabase/server"

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const game = getGameBySlug(slug)
  
  if (!game) {
    return { title: "Game Not Found | ChainPlay" }
  }
  
  return {
    title: `${game.title} | ChainPlay`,
    description: game.description,
  }
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params
  const slug = normalizeSlug(rawSlug)
  const game = getGameBySlug(slug)
  
  if (!game) {
    notFound()
  }

  // Don't show page for coming soon games
  if (game.status === "coming_soon") {
    notFound()
  }

  // Fetch initial rooms for this game (only active rooms)
  const supabase = await createClient()
  const { data: rooms } = await supabase
    .from("rooms_with_players")
    .select("*")
    .eq("game_slug", slug)
    .in("status", ["waiting", "starting", "live"])
    .order("created_at", { ascending: false })
    .limit(20)
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <GameHero 
          title={game.title}
          description={game.description}
          iconName={game.iconName}
          categories={game.categories}
          minPlayers={game.minPlayers}
          maxPlayers={game.maxPlayers}
          slug={slug}
        />
        <GameStats 
          playersOnline={game.playersOnline}
          activeRooms={game.activeRooms}
          avgMatchTime={game.avgMatchTime}
          bestStreak={game.bestStreak}
        />
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6 lg:px-8">
            <RoomList 
              gameSlug={slug} 
              gameTitle={game.title} 
              initialRooms={rooms || []} 
            />
          </div>
        </section>
        <GameRoom gameTitle={game.title} />
        <GameRules />
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <RecentMatches />
              </div>
              <div>
                <PlayerStats />
              </div>
            </div>
          </div>
        </section>
        <RelatedGames currentSlug={slug} />
      </main>
      <Footer />
    </div>
  )
}
