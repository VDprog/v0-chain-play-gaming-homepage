export type IconName = "bomb" | "handshake" | "circle-dot" | "clock" | "timer" | "crown"

export type GameCategory = "1v1" | "Multiplayer" | "Quiz" | "Social" | "Reaction" | "Final"

export interface GameData {
  slug: string
  title: string
  description: string
  longDescription: string
  iconName: IconName
  tags: string[]
  categories: GameCategory[]
  playersOnline: number
  activeRooms: number
  avgMatchTime: string
  bestStreak: number
  badge?: string
  badgeType?: "trending" | "live" | "new" | "popular"
}

// All available categories for filtering
export const allCategories: GameCategory[] = ["1v1", "Multiplayer", "Quiz", "Social", "Reaction", "Final"]

export const gamesData: GameData[] = [
  {
    slug: "split-or-steal",
    title: "Split or Steal",
    description: "Trust or betray? A classic game theory challenge with real stakes.",
    longDescription: "The ultimate trust game. Two players face off - will you split the prize fairly, or risk it all to steal? But beware, if both steal, everyone loses.",
    iconName: "handshake",
    tags: ["1v1", "Strategy", "Mind Games", "Trending"],
    categories: ["1v1", "Final"],
    playersOnline: 0,
    activeRooms: 0,
    avgMatchTime: "1:45",
    bestStreak: 8,
    badge: "Trending",
    badgeType: "trending",
  },
  {
    slug: "pass-the-bomb",
    title: "Pass the Bomb",
    description: "Pass the bomb before the timer runs out. Stay alive, outlast everyone, and win the round.",
    longDescription: "A fast-paced multiplayer game where players must quickly pass a virtual bomb before it explodes. React fast, choose your target wisely, and be the last one standing to claim victory.",
    iconName: "bomb",
    tags: ["Multiplayer", "Realtime", "Fast Game", "Popular"],
    categories: ["Multiplayer", "Reaction"],
    playersOnline: 0,
    activeRooms: 0,
    avgMatchTime: "2:30",
    bestStreak: 12,
    badge: "Live",
    badgeType: "live",
  },
  {
    slug: "hidden-button",
    title: "Hidden Button",
    description: "Find the invisible button before anyone else. Speed wins.",
    longDescription: "A deceptively simple game that tests your reflexes and observation skills. The button is hidden somewhere on screen - find it first to win!",
    iconName: "circle-dot",
    tags: ["1v1", "Fast Game", "Reflexes"],
    categories: ["1v1", "Reaction"],
    playersOnline: 0,
    activeRooms: 0,
    avgMatchTime: "0:45",
    bestStreak: 15,
  },
  {
    slug: "speed-quiz",
    title: "Speed Quiz",
    description: "Answer faster than opponents in rapid-fire trivia battles.",
    longDescription: "Test your knowledge and speed in this intense trivia showdown. Questions come fast, and only the quickest correct answer wins points.",
    iconName: "clock",
    tags: ["1v1", "Trivia", "Educational", "Popular"],
    categories: ["1v1", "Quiz"],
    playersOnline: 0,
    activeRooms: 0,
    avgMatchTime: "5:00",
    bestStreak: 20,
    badge: "Popular",
    badgeType: "popular",
  },
  {
    slug: "timer-challenge",
    title: "Timer Challenge",
    description: "Stop the timer at exactly the right moment. Precision wins.",
    longDescription: "Can you stop the timer at precisely the target time? A test of timing, patience, and nerve. The closest to the target wins.",
    iconName: "timer",
    tags: ["1v1", "Precision", "Skill"],
    categories: ["1v1", "Reaction"],
    playersOnline: 0,
    activeRooms: 0,
    avgMatchTime: "1:00",
    bestStreak: 5,
  },
  {
    slug: "last-survivor-quiz",
    title: "Last Survivor Quiz",
    description: "Answer correctly or get eliminated. Only one survives.",
    longDescription: "A high-stakes elimination quiz where one wrong answer means you're out. Answer correctly to survive each round until only one player remains.",
    iconName: "crown",
    tags: ["Multiplayer", "Elimination", "Trivia", "New"],
    categories: ["Multiplayer", "Quiz"],
    playersOnline: 0,
    activeRooms: 0,
    avgMatchTime: "4:00",
    bestStreak: 7,
    badge: "New",
    badgeType: "new",
  },
]

export function getGameBySlug(slug: string): GameData | undefined {
  return gamesData.find((game) => game.slug === slug)
}

export function getAllSlugs(): string[] {
  return gamesData.map((game) => game.slug)
}

export function getRelatedGames(currentSlug: string, limit: number = 3): GameData[] {
  return gamesData.filter((game) => game.slug !== currentSlug).slice(0, limit)
}
