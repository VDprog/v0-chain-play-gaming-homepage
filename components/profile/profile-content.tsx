"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  User,
  Trophy, 
  Flame,
  Target,
  Gamepad2,
  Wallet,
  Check,
  Copy,
  ExternalLink,
  ChevronRight,
  Zap,
  Star,
  Shield,
  Award,
  Crown,
  Bomb,
  HelpCircle,
  Clock
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

// Mock profile data
const profileData = {
  username: "Vlad",
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vlad",
  status: "On a 6 win streak",
  favoriteGame: "Pass the Bomb",
  rankBadge: "Top 5%",
  wins: 156,
  winRate: 76.85,
  totalEarnings: 12450.50,
  gamesPlayed: 203,
  currentStreak: 6,
  bestStreak: 12,
}

const statsCards = [
  { label: "Total Wins", value: "156", icon: Trophy, color: "text-amber-500" },
  { label: "Games Played", value: "203", icon: Gamepad2, color: "text-primary" },
  { label: "Win Rate", value: "76.8%", icon: Target, color: "text-emerald-500" },
  { label: "Current Streak", value: "6", icon: Flame, color: "text-orange-500" },
  { label: "Best Streak", value: "12", icon: Zap, color: "text-purple-500" },
  { label: "Total Earnings", value: "12.4K XTZ", icon: Star, color: "text-cyan-500" },
]

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

const iconMap: Record<string, LucideIcon> = {
  bomb: Bomb,
  shield: Shield,
  "help-circle": HelpCircle,
}

export function ProfileContent() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyAddress = () => {
    navigator.clipboard.writeText("0xA3f8...8F91")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
                  <AvatarImage src={profileData.avatarUrl} alt={profileData.username} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    {profileData.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{profileData.username}</h1>
                    <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold">
                      {profileData.rankBadge}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">{profileData.status}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Gamepad2 className="h-4 w-4" />
                    <span>Favorite: <span className="text-foreground font-medium">{profileData.favoriteGame}</span></span>
                  </div>
                </div>
              </div>

              {/* Right: Quick Stats */}
              <div className="flex flex-wrap items-center gap-6 lg:gap-8">
                <div className="text-center">
                  <p className="text-2xl lg:text-3xl font-bold text-foreground">{profileData.wins}</p>
                  <p className="text-sm text-muted-foreground">Wins</p>
                </div>
                <div className="w-px h-10 bg-border hidden sm:block" />
                <div className="text-center">
                  <p className="text-2xl lg:text-3xl font-bold text-foreground">{profileData.winRate}%</p>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                </div>
                <div className="w-px h-10 bg-border hidden sm:block" />
                <div className="text-center">
                  <p className="text-2xl lg:text-3xl font-bold text-foreground">
                    {(profileData.totalEarnings / 1000).toFixed(1)}K
                    <span className="text-base font-normal text-muted-foreground ml-1">XTZ</span>
                  </p>
                  <p className="text-sm text-muted-foreground">Earnings</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Wallet Section */}
        <section className="mb-10">
          <div className="rounded-xl bg-card border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Wallet</h2>
                <p className="text-sm text-muted-foreground">
                  {walletConnected ? "Connected to Tezos" : "Connect to save progress"}
                </p>
              </div>
            </div>

            {!walletConnected ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground">
                  Connect your wallet to save progress, join ranked matches, and earn rewards.
                </p>
                <Button onClick={() => setWalletConnected(true)} className="shrink-0">
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                    <Check className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium text-foreground">0xA3f8...8F91</span>
                      <button 
                        onClick={handleCopyAddress}
                        className="p-1 hover:bg-emerald-100 rounded transition-colors"
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">Tezos Mainnet</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setWalletConnected(false)}
                    className="text-destructive hover:text-destructive"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

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
              <Button variant="ghost" size="sm" className="text-primary">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            {recentMatches.length > 0 ? (
              <div className="rounded-xl bg-card border border-border overflow-hidden">
                <div className="divide-y divide-border">
                  {recentMatches.map((match) => (
                    <div key={match.id} className="px-5 py-4 hover:bg-muted/50 transition-colors">
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
                <p className="text-sm text-muted-foreground">Start playing to see your match history</p>
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
            
            {achievements.some(a => a.unlocked) ? (
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`p-4 rounded-xl border transition-all ${
                      achievement.unlocked 
                        ? "bg-card border-border hover:border-primary/20" 
                        : "bg-muted/30 border-dashed border-border opacity-60"
                    }`}
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
            ) : (
              <div className="rounded-xl bg-card border border-border p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mx-auto mb-4">
                  <Award className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">No achievements yet</h3>
                <p className="text-sm text-muted-foreground">Start playing to unlock achievements</p>
              </div>
            )}
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
    </main>
  )
}
