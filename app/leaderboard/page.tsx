"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  Crown, 
  Trophy, 
  Medal,
  Flame,
  TrendingUp,
  Users,
  Gamepad2,
  Zap,
  Target,
  Clock,
  ChevronRight,
  Star,
  Sparkles
} from "lucide-react"

const timeFilters = ["Daily", "Weekly", "Monthly", "All Time"]
const gameFilters = ["All Games", "Pass the Bomb", "Split or Steal", "Hidden Button", "Speed Quiz", "Timer"]

const topPlayers = [
  { 
    rank: 2, 
    name: "Eva", 
    avatar: "E", 
    wins: 847, 
    earnings: "12.4K XTZ", 
    streak: 12,
    favoriteGame: "Split or Steal",
    winRate: 78
  },
  { 
    rank: 1, 
    name: "Vlad", 
    avatar: "V", 
    wins: 1243, 
    earnings: "24.8K XTZ", 
    streak: 23,
    favoriteGame: "Pass the Bomb",
    winRate: 84
  },
  { 
    rank: 3, 
    name: "Panda", 
    avatar: "P", 
    wins: 692, 
    earnings: "8.9K XTZ", 
    streak: 8,
    favoriteGame: "Speed Quiz",
    winRate: 71
  },
]

const leaderboardData = [
  { rank: 1, name: "Vlad", avatar: "V", favoriteGame: "Pass the Bomb", wins: 1243, gamesPlayed: 1480, winRate: 84, earnings: "24.8K", streak: 23, isCurrentUser: false },
  { rank: 2, name: "Eva", avatar: "E", favoriteGame: "Split or Steal", wins: 847, gamesPlayed: 1086, winRate: 78, earnings: "12.4K", streak: 12, isCurrentUser: false },
  { rank: 3, name: "Panda", avatar: "P", favoriteGame: "Speed Quiz", wins: 692, gamesPlayed: 975, winRate: 71, earnings: "8.9K", streak: 8, isCurrentUser: false },
  { rank: 4, name: "Jack", avatar: "J", favoriteGame: "Timer", wins: 584, gamesPlayed: 812, winRate: 72, earnings: "7.2K", streak: 5, isCurrentUser: false },
  { rank: 5, name: "Adam", avatar: "A", favoriteGame: "Hidden Button", wins: 521, gamesPlayed: 743, winRate: 70, earnings: "6.8K", streak: 4, isCurrentUser: true },
  { rank: 6, name: "Alex", avatar: "AL", favoriteGame: "Pass the Bomb", wins: 498, gamesPlayed: 721, winRate: 69, earnings: "5.9K", streak: 7, isCurrentUser: false },
  { rank: 7, name: "CryptoFox", avatar: "CF", favoriteGame: "Split or Steal", wins: 456, gamesPlayed: 689, winRate: 66, earnings: "5.4K", streak: 3, isCurrentUser: false },
  { rank: 8, name: "BlockMaster", avatar: "BM", favoriteGame: "Speed Quiz", wins: 412, gamesPlayed: 634, winRate: 65, earnings: "4.8K", streak: 6, isCurrentUser: false },
  { rank: 9, name: "Nova", avatar: "N", favoriteGame: "Timer", wins: 389, gamesPlayed: 612, winRate: 64, earnings: "4.2K", streak: 2, isCurrentUser: false },
  { rank: 10, name: "Luna", avatar: "L", favoriteGame: "Hidden Button", wins: 367, gamesPlayed: 589, winRate: 62, earnings: "3.9K", streak: 4, isCurrentUser: false },
]

const liveActivity = [
  { name: "Vlad", action: "won Pass the Bomb", reward: "+5 XTZ", time: "2s ago", avatar: "V" },
  { name: "Eva", action: "started a winning streak", reward: "", time: "15s ago", avatar: "E" },
  { name: "Panda", action: "joined Speed Quiz", reward: "", time: "32s ago", avatar: "P" },
  { name: "Jack", action: "won Split or Steal", reward: "+8 XTZ", time: "1m ago", avatar: "J" },
  { name: "Luna", action: "entered Top 10", reward: "", time: "2m ago", avatar: "L" },
]

const stats = [
  { label: "Players Online", value: "2,847", icon: Users, trend: "+12%" },
  { label: "Games Today", value: "8,234", icon: Gamepad2, trend: "+8%" },
  { label: "Biggest Win", value: "142 XTZ", icon: Trophy, trend: "Today" },
  { label: "Longest Streak", value: "23 wins", icon: Flame, trend: "Vlad" },
]

export default function LeaderboardPage() {
  const [activeTimeFilter, setActiveTimeFilter] = useState("Weekly")
  const [activeGameFilter, setActiveGameFilter] = useState("All Games")

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12">
        {/* Page Header */}
        <section className="container mx-auto px-6 lg:px-8 mb-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Rankings</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Leaderboard</h1>
              <p className="mt-2 text-muted-foreground max-w-md">Top players competing across all games for glory and rewards</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                {timeFilters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveTimeFilter(filter)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeTimeFilter === filter
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <select 
                value={activeGameFilter}
                onChange={(e) => setActiveGameFilter(e.target.value)}
                className="h-9 px-3 text-sm font-medium rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {gameFilters.map((filter) => (
                  <option key={filter} value={filter}>{filter}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {stats.map((stat) => (
              <div key={stat.label} className="p-5 rounded-xl bg-card border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <stat.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{stat.trend}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Top 3 Players */}
        <section className="container mx-auto px-6 lg:px-8 mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Top Players</h2>
          </div>
          <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-6">
            {topPlayers.map((player, index) => {
              const isFirst = player.rank === 1
              const RankIcon = player.rank === 1 ? Crown : player.rank === 2 ? Medal : Trophy
              
              return (
                <div
                  key={player.name}
                  className={`relative w-full md:w-auto ${isFirst ? "md:order-2 md:-mb-4" : index === 0 ? "md:order-1" : "md:order-3"}`}
                >
                  <div 
                    className={`relative p-6 rounded-2xl bg-card border transition-all duration-300 hover:shadow-xl ${
                      isFirst 
                        ? "border-primary/30 shadow-lg shadow-primary/10 md:p-8" 
                        : "border-border hover:border-primary/20"
                    }`}
                  >
                    {isFirst && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 shadow-lg shadow-amber-400/30">
                          <Crown className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col items-center text-center">
                      <div className="relative mb-4">
                        <Avatar className={`ring-4 ${isFirst ? "h-20 w-20 ring-primary/30" : "h-16 w-16 ring-border"}`}>
                          <AvatarImage src="/placeholder.svg" alt={player.name} />
                          <AvatarFallback className={`text-lg font-bold ${isFirst ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                            {player.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                          player.rank === 1 ? "bg-amber-400 text-white" : 
                          player.rank === 2 ? "bg-gray-400 text-white" : 
                          "bg-amber-600 text-white"
                        }`}>
                          {player.rank}
                        </div>
                      </div>
                      <h3 className={`font-bold text-foreground ${isFirst ? "text-xl" : "text-lg"}`}>{player.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{player.favoriteGame}</p>
                      <div className="grid grid-cols-3 gap-4 w-full">
                        <div>
                          <p className={`font-bold text-foreground ${isFirst ? "text-lg" : ""}`}>{new Intl.NumberFormat("en-US").format(player.wins)}</p>
                          <p className="text-xs text-muted-foreground">Wins</p>
                        </div>
                        <div>
                          <p className={`font-bold text-foreground ${isFirst ? "text-lg" : ""}`}>{player.earnings}</p>
                          <p className="text-xs text-muted-foreground">Earned</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-center gap-1">
                            <Flame className="h-3.5 w-3.5 text-orange-500" />
                            <p className={`font-bold text-foreground ${isFirst ? "text-lg" : ""}`}>{player.streak}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">Streak</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="container mx-auto px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Leaderboard Table */}
            <div className="lg:col-span-2">
              <div className="rounded-xl bg-card border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="text-lg font-bold text-foreground">All Rankings</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Player</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Game</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Wins</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Win Rate</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Earnings</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Streak</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {leaderboardData.map((player) => (
                        <tr 
                          key={player.rank} 
                          className={`transition-colors duration-150 hover:bg-muted/50 ${player.isCurrentUser ? "bg-primary/5" : ""}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold ${
                              player.rank === 1 ? "bg-amber-100 text-amber-700" :
                              player.rank === 2 ? "bg-gray-100 text-gray-600" :
                              player.rank === 3 ? "bg-amber-50 text-amber-600" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {player.rank}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src="/placeholder.svg" alt={player.name} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{player.avatar}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-foreground">{player.name}</p>
                                {player.isCurrentUser && <span className="text-xs text-primary font-medium">You</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                            <span className="text-sm text-muted-foreground">{player.favoriteGame}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="font-semibold text-foreground">{new Intl.NumberFormat("en-US").format(player.wins)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right hidden sm:table-cell">
                            <span className="text-sm text-muted-foreground">{player.winRate}%</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="font-semibold text-foreground">{player.earnings}</span>
                            <span className="text-xs text-muted-foreground ml-0.5">XTZ</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right hidden lg:table-cell">
                            <div className="flex items-center justify-end gap-1">
                              <Flame className="h-3.5 w-3.5 text-orange-500" />
                              <span className="font-medium text-foreground">{player.streak}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-border bg-muted/30">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/5">
                    Load More
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Live Activity */}
              <div className="rounded-xl bg-card border border-border overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <h3 className="font-semibold text-foreground">Live Activity</h3>
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {liveActivity.map((activity, index) => (
                    <div key={index} className="px-5 py-3 hover:bg-muted/50 transition-colors duration-150">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{activity.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">
                            <span className="font-medium">{activity.name}</span>
                            {" "}{activity.action}
                            {activity.reward && <span className="text-emerald-600 font-medium"> {activity.reward}</span>}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Player Preview Card */}
              <div className="rounded-xl bg-card border border-border overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">Player Spotlight</h3>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">V</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-foreground">Vlad</h4>
                        <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 border-0">#1</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Pass the Bomb main</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="font-bold text-foreground">1,243</p>
                      <p className="text-xs text-muted-foreground">Wins</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="font-bold text-foreground">84%</p>
                      <p className="text-xs text-muted-foreground">Win Rate</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-center gap-1">
                        <Flame className="h-3.5 w-3.5 text-orange-500" />
                        <p className="font-bold text-foreground">23</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Streak</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent Matches</p>
                    <div className="flex gap-1">
                      {["W", "W", "W", "L", "W"].map((result, i) => (
                        <div 
                          key={i} 
                          className={`h-6 w-6 rounded text-xs font-bold flex items-center justify-center ${
                            result === "W" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {result}
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full" size="sm">
                    View Profile
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
