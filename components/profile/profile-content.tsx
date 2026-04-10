"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { ProfileWalletSection } from "@/components/wallet/profile-wallet-section"
import { PlayerRegistrationModal } from "@/components/modals/player-registration-modal"
import { usePlayer } from "@/components/player/player-provider"
import { 
  Trophy, 
  Flame,
  Target,
  Gamepad2,
  ChevronRight,
  Zap,
  Star,
  Shield,
  Award,
  Crown,
  Bomb,
  HelpCircle,
  Clock,
  Wallet
} from "lucide-react"
import { toast } from "sonner"
import type { LucideIcon } from "lucide-react"

// Static data for sections not yet backed by database
const recentMatches = [
  { id: 1, opponent: "Eva", game: "Pass the Bomb", result: "win", reward: "+5 XTZ", time: "2m ago", players: 4 },
  { id: 2, opponent: "Panda", game: "Split or Steal", result: "win", reward: "+8 XTZ", time: "15m ago", players: 2 },
  { id: 3, opponent: "Jack", game: "Speed Quiz", result: "loss", reward: "-2 XTZ", time: "1h ago", players: 6 },
  { id: 4, opponent: "Luna", game: "Pass the Bomb", result: "win", reward: "+5 XTZ", time: "2h ago", players: 5 },
  { id: 5, opponent: "Marcus", game: "Hidden Button", result: "win", reward: "+3 XTZ", time: "3h ago", players: 8 },
]

const achievements = [
  { id: 1, name: "First Win", description: "Win your first game", icon: Trophy, unlocked: true, color: "bg-amber-100 text-amber-600" },
  { id: 2, name: "5 Win Streak", description: "Achieve a 5 game win streak", icon: Flame, unlocked: true, color: "bg-orange-100 text-orange-600" },
  { id: 3, name: "Top 10 Player", description: "Reach the Top 10 leaderboard", icon: Crown, unlocked: true, color: "bg-purple-100 text-purple-600" },
  { id: 4, name: "Bomb Master", description: "Win 50 Pass the Bomb games", icon: Bomb, unlocked: true, color: "bg-red-100 text-red-600" },
  { id: 5, name: "Quiz Champion", description: "Win 100 Speed Quiz games", icon: HelpCircle, unlocked: false, color: "bg-muted text-muted-foreground" },
  { id: 6, name: "Speed Demon", description: "Win a game in under 30 seconds", icon: Clock, unlocked: false, color: "bg-muted text-muted-foreground" },
]

const favoriteGames = [
  { slug: "pass-the-bomb", name: "Pass the Bomb", wins: 78, icon: Bomb },
  { slug: "split-or-steal", name: "Split or Steal", wins: 45, icon: Shield },
  { slug: "speed-quiz", name: "Speed Quiz", wins: 33, icon: HelpCircle },
]

export function ProfileContent() {
  const { player, isLoading, isConnected, createOrUpdatePlayer } = usePlayer()
  const [showRegistration, setShowRegistration] = useState(false)

  const handleRegister = async (data: { username: string; avatar_url: string; wallet_chain: string }) => {
    await createOrUpdatePlayer(data)
  }

  const handleViewAllMatches = () => {
    toast.info("Match History", {
      description: "Full match history coming soon!",
    })
  }

  const handleMatchClick = (match: typeof recentMatches[0]) => {
    toast.info(`${match.game} vs ${match.opponent}`, {
      description: `${match.result === "win" ? "Victory" : "Defeat"} - ${match.reward}`,
    })
  }

  const handleAchievementClick = (achievement: typeof achievements[0]) => {
    if (achievement.unlocked) {
      toast.success(achievement.name, {
        description: achievement.description,
      })
    } else {
      toast.info(`${achievement.name} - Locked`, {
        description: `Complete: ${achievement.description}`,
      })
    }
  }

  // Calculate derived stats
  const stats = player?.stats
  const wins = stats?.wins ?? 0
  const gamesPlayed = stats?.games_played ?? 0
  const winRate = gamesPlayed > 0 ? ((wins / gamesPlayed) * 100).toFixed(1) : "0.0"
  const currentStreak = stats?.current_streak ?? 0
  const bestStreak = stats?.best_streak ?? 0
  const earnings = stats?.earnings_total ?? 0

  const statsCards = [
    { label: "Total Wins", value: wins.toString(), icon: Trophy, color: "text-amber-500" },
    { label: "Games Played", value: gamesPlayed.toString(), icon: Gamepad2, color: "text-primary" },
    { label: "Win Rate", value: `${winRate}%`, icon: Target, color: "text-emerald-500" },
    { label: "Current Streak", value: currentStreak.toString(), icon: Flame, color: "text-orange-500" },
    { label: "Best Streak", value: bestStreak.toString(), icon: Zap, color: "text-purple-500" },
    { label: "Total Earnings", value: earnings >= 1000 ? `${(earnings / 1000).toFixed(1)}K XTZ` : `${earnings} XTZ`, icon: Star, color: "text-cyan-500" },
  ]

  // Not connected state
  if (!isConnected) {
    return (
      <main className="flex-1 py-12">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-6">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">Connect Your Wallet</h1>
            <p className="text-muted-foreground mb-8">
              Connect your wallet to view your profile, track your stats, and join competitive games.
            </p>
            <ProfileWalletSection />
          </div>
        </div>
      </main>
    )
  }

  // Loading state (includes wallet restoring state)
  if (isLoading) {
    return (
      <main className="flex-1 py-12">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Spinner className="h-8 w-8 text-primary" />
            <p className="text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
      </main>
    )
  }

  // No profile yet - show registration prompt
  if (!player) {
    return (
      <main className="flex-1 py-12">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-6">
              <Gamepad2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">Create Your Profile</h1>
            <p className="text-muted-foreground mb-8">
              Set up your ChainPlay profile to start playing, earning, and competing on the leaderboard.
            </p>
            <Button size="lg" onClick={() => setShowRegistration(true)} className="gap-2">
              <Star className="h-5 w-5" />
              Create Profile
            </Button>
          </div>
        </div>
        
        <PlayerRegistrationModal
          open={showRegistration}
          onOpenChange={setShowRegistration}
          onRegister={handleRegister}
        />
      </main>
    )
  }

  // Profile exists - show full profile
  const rankBadge = wins >= 100 ? "Top 1%" : wins >= 50 ? "Top 5%" : wins >= 20 ? "Top 10%" : "Rising Star"
  const statusText = currentStreak > 0 
    ? `On a ${currentStreak} win streak` 
    : gamesPlayed > 0 
      ? `${gamesPlayed} games played`
      : "Ready to play"

  return (
    <main className="flex-1 py-12">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Profile Header */}
        <section className="mb-10">
          <div className="rounded-2xl bg-card border border-border p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Left: Avatar + Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <Avatar className="h-20 w-20 lg:h-24 lg:w-24 ring-4 ring-primary/20 shadow-lg">
                  <AvatarImage src={player.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.wallet_address}`} alt={player.username} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    {player.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{player.username}</h1>
                    <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold">
                      {rankBadge}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">{statusText}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Gamepad2 className="h-4 w-4" />
                    <span>Favorite: <span className="text-foreground font-medium">Pass the Bomb</span></span>
                  </div>
                </div>
              </div>

              {/* Right: Quick Stats */}
              <div className="flex flex-wrap items-center gap-6 lg:gap-8">
                <div className="text-center">
                  <p className="text-2xl lg:text-3xl font-bold text-foreground">{wins}</p>
                  <p className="text-sm text-muted-foreground">Wins</p>
                </div>
                <div className="w-px h-10 bg-border hidden sm:block" />
                <div className="text-center">
                  <p className="text-2xl lg:text-3xl font-bold text-foreground">{winRate}%</p>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                </div>
                <div className="w-px h-10 bg-border hidden sm:block" />
                <div className="text-center">
                  <p className="text-2xl lg:text-3xl font-bold text-foreground">
                    {earnings >= 1000 ? `${(earnings / 1000).toFixed(1)}K` : earnings}
                    <span className="text-base font-normal text-muted-foreground ml-1">XTZ</span>
                  </p>
                  <p className="text-sm text-muted-foreground">Earnings</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Wallet Section */}
        <ProfileWalletSection />

        {/* Stats Grid */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Your Stats</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statsCards.map((stat) => (
              <div key={stat.label} className="p-5 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-muted mb-3`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Two Column Layout: Recent Matches + Achievements */}
        <div className="grid gap-6 lg:grid-cols-2 mb-10">
          {/* Recent Matches */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Gamepad2 className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Recent Matches</h2>
              </div>
              <Button variant="ghost" size="sm" className="text-primary" onClick={handleViewAllMatches}>
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            {gamesPlayed > 0 ? (
              <div className="rounded-xl bg-card border border-border overflow-hidden">
                <div className="divide-y divide-border">
                  {recentMatches.map((match) => (
                    <div key={match.id} className="px-5 py-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handleMatchClick(match)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            match.result === "win" ? "bg-emerald-100" : "bg-red-100"
                          }`}>
                            {match.result === "win" ? (
                              <Trophy className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Target className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {match.game}
                              <span className="text-muted-foreground font-normal"> vs {match.opponent}</span>
                              {match.players > 2 && (
                                <span className="text-xs text-muted-foreground ml-1">+{match.players - 2}</span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">{match.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={match.result === "win" ? "default" : "secondary"}
                            className={match.result === "win" 
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" 
                              : "bg-red-100 text-red-600 hover:bg-red-100"
                            }
                          >
                            {match.result === "win" ? "Win" : "Loss"}
                          </Badge>
                          <p className={`text-sm font-medium mt-1 ${
                            match.result === "win" ? "text-emerald-600" : "text-red-500"
                          }`}>
                            {match.reward}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-card border border-border p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mx-auto mb-4">
                  <Gamepad2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">No games yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Start playing to see your match history</p>
                <Button asChild>
                  <Link href="/games">Browse Games</Link>
                </Button>
              </div>
            )}
          </section>

          {/* Achievements */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Award className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Achievements</h2>
              </div>
              <span className="text-sm text-muted-foreground">
                {achievements.filter(a => a.unlocked).length}/{achievements.length} unlocked
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    achievement.unlocked 
                      ? "bg-card border-border hover:border-primary/20" 
                      : "bg-muted/30 border-dashed border-border opacity-60 hover:opacity-80"
                  }`}
                  onClick={() => handleAchievementClick(achievement)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${achievement.color}`}>
                      <achievement.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-foreground text-sm truncate">{achievement.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{achievement.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Favorite Games */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Star className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Favorite Games</h2>
            </div>
            <Link href="/games">
              <Button variant="ghost" size="sm" className="text-primary">
                Browse All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {favoriteGames.map((game, index) => (
              <Link 
                key={game.slug}
                href={`/games/${game.slug}`}
                className="group p-5 rounded-xl bg-card border border-border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                    <game.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {game.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{game.wins} wins</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">#{index + 1}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <PlayerRegistrationModal
        open={showRegistration}
        onOpenChange={setShowRegistration}
        onRegister={handleRegister}
      />
    </main>
  )
}
