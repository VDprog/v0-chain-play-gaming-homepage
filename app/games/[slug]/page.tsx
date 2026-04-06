import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { GameHero } from "@/components/game/game-hero"
import { GameStats } from "@/components/game/game-stats"
import { LiveRooms } from "@/components/game/live-rooms"
import { GameRoom } from "@/components/game/game-room"
import { GameRules } from "@/components/game/game-rules"
import { RecentMatches } from "@/components/game/recent-matches"
import { PlayerStats } from "@/components/game/player-stats"
import { RelatedGames } from "@/components/game/related-games"
import { Bomb, Handshake, CircleDot, Clock, Timer, Crown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface GameData {
  title: string
  description: string
  longDescription: string
  icon: LucideIcon
  tags: string[]
  playersOnline: number
  activeRooms: number
  avgMatchTime: string
  bestStreak: number
}

const gamesData: Record<string, GameData> = {
  "pass-the-bomb": {
    title: "Pass the Bomb",
    description: "Pass the bomb before the timer runs out. Stay alive, outlast everyone, and win the round.",
    longDescription: "A fast-paced multiplayer game where players must quickly pass a virtual bomb before it explodes. React fast, choose your target wisely, and be the last one standing to claim victory.",
    icon: Bomb,
    tags: ["Multiplayer", "Realtime", "Fast Game", "Popular"],
    playersOnline: 892,
    activeRooms: 24,
    avgMatchTime: "2:30",
    bestStreak: 12,
  },
  "split-or-steal": {
    title: "Split or Steal",
    description: "Trust or betray? A classic game theory challenge with real stakes.",
    longDescription: "The ultimate trust game. Two players face off - will you split the prize fairly, or risk it all to steal? But beware, if both steal, everyone loses.",
    icon: Handshake,
    tags: ["1v1", "Strategy", "Mind Games", "Trending"],
    playersOnline: 1243,
    activeRooms: 31,
    avgMatchTime: "1:45",
    bestStreak: 8,
  },
  "hidden-button": {
    title: "Hidden Button",
    description: "Find the invisible button before anyone else. Speed wins.",
    longDescription: "A deceptively simple game that tests your reflexes and observation skills. The button is hidden somewhere on screen - find it first to win!",
    icon: CircleDot,
    tags: ["Multiplayer", "Fast Game", "Reflexes"],
    playersOnline: 567,
    activeRooms: 15,
    avgMatchTime: "0:45",
    bestStreak: 15,
  },
  "speed-quiz": {
    title: "Speed Quiz",
    description: "Answer faster than opponents in rapid-fire trivia battles.",
    longDescription: "Test your knowledge and speed in this intense trivia showdown. Questions come fast, and only the quickest correct answer wins points.",
    icon: Clock,
    tags: ["Multiplayer", "Trivia", "Educational", "Popular"],
    playersOnline: 2341,
    activeRooms: 42,
    avgMatchTime: "5:00",
    bestStreak: 20,
  },
  "timer-challenge": {
    title: "Timer Challenge",
    description: "Stop the timer at exactly the right moment. Precision wins.",
    longDescription: "Can you stop the timer at precisely the target time? A test of timing, patience, and nerve. The closest to the target wins.",
    icon: Timer,
    tags: ["Solo", "Precision", "Skill"],
    playersOnline: 456,
    activeRooms: 12,
    avgMatchTime: "1:00",
    bestStreak: 5,
  },
  "last-survivor-quiz": {
    title: "Last Survivor Quiz",
    description: "Answer correctly or get eliminated. Only one survives.",
    longDescription: "A high-stakes elimination quiz where one wrong answer means you're out. Answer correctly to survive each round until only one player remains.",
    icon: Crown,
    tags: ["Multiplayer", "Elimination", "Trivia", "New"],
    playersOnline: 1087,
    activeRooms: 28,
    avgMatchTime: "4:00",
    bestStreak: 7,
  },
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const game = gamesData[slug] || gamesData["pass-the-bomb"]
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <GameHero 
          title={game.title}
          description={game.description}
          icon={game.icon}
          tags={game.tags}
          slug={slug}
        />
        <GameStats 
          playersOnline={game.playersOnline}
          activeRooms={game.activeRooms}
          avgMatchTime={game.avgMatchTime}
          bestStreak={game.bestStreak}
        />
        <LiveRooms gameTitle={game.title} />
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
