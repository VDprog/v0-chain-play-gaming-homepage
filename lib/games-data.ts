// ==============================================
// GAME REGISTRY - Single Source of Truth
// ==============================================

export type IconName = 
  | "bomb" 
  | "handshake" 
  | "circle-dot" 
  | "clock" 
  | "timer" 
  | "crown"
  | "users"
  | "brain"
  | "eye"
  | "zap"
  | "link"
  | "bitcoin"
  | "search"

export type GameCategory = "1v1" | "Multiplayer" | "Quiz" | "Social" | "Reaction" | "Final"
export type GameType = "1v1" | "multiplayer" | "hybrid"
export type GameStatus = "active" | "coming_soon"

// Module names for future game logic implementation
export type GameModuleName = 
  | "SplitOrStealModule"
  | "HiddenButtonModule"
  | "TimerModule"
  | "PassTheBombModule"
  | "VoteToKillModule"
  | "SpeedQuizModule"
  | "LastSurvivorQuizModule"
  | "MajorityWinsModule"
  | "MinorityWinsModule"
  | "BluffQuizModule"
  | "TimedChainQuizModule"
  | "MemoryQuizModule"
  | "CryptoIQModule"
  | "GuessTheFakeModule"
  | "GuessTheTrueModule"

export interface GameData {
  // Core identifiers
  slug: string
  title: string
  description: string
  longDescription: string
  
  // Visual
  iconName: IconName
  
  // Gameplay configuration
  type: GameType
  minPlayers: number
  maxPlayers: number
  categories: GameCategory[]
  hasRounds: boolean
  isFinalGame: boolean
  
  // Status
  status: GameStatus
  
  // Module reference for future game logic
  gameModule: GameModuleName
  
  // UI metadata (derived at runtime from database)
  playersOnline: number
  activeRooms: number
  avgMatchTime: string
  
  // Optional badges
  badge?: string
  badgeType?: "trending" | "live" | "new" | "popular"
}

// All available categories for filtering
export const allCategories: GameCategory[] = ["1v1", "Multiplayer", "Quiz", "Social", "Reaction", "Final"]

// ==============================================
// GAME REGISTRY
// ==============================================

export const gamesData: GameData[] = [
  // ============ 1v1 GAMES ============
  {
    slug: "split-or-steal",
    title: "Split or Steal",
    description: "Two players choose simultaneously: split or steal. Outcome depends on combination.",
    longDescription: "The ultimate trust game. Two players face off - will you split the prize fairly, or risk it all to steal? But beware, if both steal, everyone loses. A classic game theory challenge with real stakes.",
    iconName: "handshake",
    type: "1v1",
    minPlayers: 2,
    maxPlayers: 2,
    categories: ["1v1", "Final"],
    hasRounds: false,
    isFinalGame: true,
    status: "active",
    gameModule: "SplitOrStealModule",
    playersOnline: 0,
    activeRooms: 0,
    avgMatchTime: "1:45",
    badge: "Trending",
    badgeType: "trending",
  },
  {
    slug: "hidden-button",
    title: "Hidden Button",
    description: "Button appears randomly (1-10s). First to click wins.",
    longDescription: "A deceptively simple game that tests your reflexes and observation skills. The button is hidden somewhere on screen and appears at a random moment - find it first to win!",
    iconName: "circle-dot",
    type: "1v1",
    minPlayers: 2,
    maxPlayers: 2,
    categories: ["1v1", "Reaction"],
    hasRounds: true,
    isFinalGame: false,
    status: "active",
    gameModule: "HiddenButtonModule",
    playersOnline: 0,
    activeRooms: 0,
    avgMatchTime: "0:45",
  },
  {
    slug: "timer",
    title: "Timer Challenge",
    description: "Press as close as possible to 10 seconds.",
    longDescription: "Can you stop the timer at precisely 10 seconds? A test of timing, patience, and nerve. The closest to the target wins. Simple concept, incredibly hard to master.",
    iconName: "timer",
    type: "1v1",
    minPlayers: 2,
    maxPlayers: 2,
    categories: ["1v1", "Reaction"],
    hasRounds: true,
    isFinalGame: false,
    status: "active",
    gameModule: "TimerModule",
    playersOnline: 0,
    activeRooms: 0,
    avgMatchTime: "1:00",
  },
  {
    slug: "speed-quiz",
    title: "Speed Quiz",
    description: "Fastest correct answer wins.",
    longDescription: "Test your knowledge and speed in this intense trivia showdown. Questions come fast, and only the quickest correct answer wins points. Knowledge meets reflexes.",
    iconName: "clock",
    type: "hybrid",
    minPlayers: 2,
    maxPlayers: 8,
    categories: ["1v1", "Quiz"],
    hasRounds: true,
    isFinalGame: false,
    status: "active",
    gameModule: "SpeedQuizModule",
    playersOnline: 0,
    activeRooms: 0,
    avgMatchTime: "5:00",
    badge: "Popular",
    badgeType: "popular",
  },
  {
    slug: "bluff-quiz",
    title: "Bluff Quiz",
    description: "Players create answers, others guess truth.",
    longDescription: "Create convincing fake answers to trick other players, then try to identify the real answer among the bluffs. A game of creativity, deception, and deduction.",
    iconName: "eye",
    type: "1v1",
    minPlayers: 2,
    maxPlayers: 2,
    categories: ["1v1", "Social"],
    hasRounds: true,
    isFinalGame: false,
    status: "active",
    gameModule: "BluffQuizModule",
    playersOnline: 0,
    activeRooms: 0,
    avgMatchTime: "3:00",
    badge: "New",
    badgeType: "new",
  },
  {
    slug: "crypto-iq",
    title: "Crypto IQ",
    description: "Crypto knowledge quiz with multiple choice.",
    longDescription: "Test your cryptocurrency and blockchain knowledge against opponents. From Bitcoin basics to DeFi deep dives - prove you're the ultimate crypto expert.",
    iconName: "bitcoin",
    type: "1v1",
    minPlayers: 2,
    maxPlayers: 2,
    categories: ["1v1", "Quiz"],
    hasRounds: true,
    isFinalGame: false,
    status: "active",
    gameModule: "CryptoIQModule",
    playersOnline: 0,
    activeRooms: 0,
    avgMatchTime: "4:00",
  },
  
  // ============ MULTIPLAYER GAMES ============
  {
    slug: "pass-the-bomb",
    title: "Pass the Bomb",
    description: "Pass the bomb before timer ends or lose.",
    longDescription: "A fast-paced multiplayer game where players must quickly pass a virtual bomb before it explodes. React fast, choose your target wisely, and be the last one standing to claim victory.",
    iconName: "bomb",
    type: "multiplayer",
    minPlayers: 3,
    maxPlayers: 10,
    categories: ["Multiplayer", "Reaction"],
    hasRounds: true,
    isFinalGame: false,
    status: "active",
    gameModule: "PassTheBombModule",
    playersOnline: 0,
    activeRooms: 0,
    avgMatchTime: "2:30",
    badge: "Live",
    badgeType: "live",
  },
  {
    slug: "vote-to-kill",
    title: "Vote to Kill",
    description: "Players vote to eliminate someone.",
    longDescription: "Social deduction at its finest. Discuss, debate, and vote to eliminate players. Trust no one - the majority rules, but are they making the right choice?",
    iconName: "users",
    type: "multiplayer",
    minPlayers: 4,
    maxPlayers: 12,
    categories: ["Multiplayer", "Social"],
    hasRounds: true,
    isFinalGame: false,
    status: "active",
    gameModule: "VoteToKillModule",
    playersOnline: 0,
    activeRooms: 0,
    avgMatchTime: "5:00",
  },
  {
    slug: "last-survivor-quiz",
    title: "Last Survivor Quiz",
    description: "Wrong answer eliminates player until one remains.",
    longDescription: "A high-stakes elimination quiz where one wrong answer means you're out. Answer correctly to survive each round until only one player remains. No second chances.",
    iconName: "crown",
    type: "multiplayer",
    minPlayers: 3,
    maxPlayers: 20,
    categories: ["Multiplayer", "Quiz"],
    hasRounds: true,
    isFinalGame: false,
    status: "active",
    gameModule: "LastSurvivorQuizModule",
    playersOnline: 0,
    activeRooms: 0,
    avgMatchTime: "4:00",
  },
  {
    slug: "majority-wins",
    title: "Majority Wins",
    description: "Pick the most popular answer.",
    longDescription: "Think like the crowd! Choose the answer you believe most players will pick. Align with the majority to score points. Great minds think alike... or do they?",
    iconName: "users",
    type: "multiplayer",
    minPlayers: 4,
    maxPlayers: 20,
    categories: ["Multiplayer", "Social"],
    hasRounds: true,
    isFinalGame: false,
    status: "active",
    gameModule: "MajorityWinsModule",
    playersOnline: 0,
    activeRooms: 0,
    avgMatchTime: "3:00",
  },
  {
    slug: "minority-wins",
    title: "Minority Wins",
    description: "Pick a unique answer.",
    longDescription: "Think differently! Choose an answer that few others will pick. Stand out from the crowd to score points. The less popular your choice, the better.",
    iconName: "zap",
    type: "multiplayer",
    minPlayers: 4,
    maxPlayers: 20,
    categories: ["Multiplayer", "Social"],
    hasRounds: true,
    isFinalGame: false,
    status: "active",
    gameModule: "MinorityWinsModule",
    playersOnline: 0,
    activeRooms: 0,
    avgMatchTime: "3:00",
  },
  {
    slug: "timed-chain-quiz",
    title: "Timed Chain Quiz",
    description: "Answer multiple questions in sequence without mistakes.",
    longDescription: "A rapid-fire quiz where you must answer a chain of questions correctly. One wrong answer breaks the chain. How long can you keep it going?",
    iconName: "link",
    type: "multiplayer",
    minPlayers: 2,
    maxPlayers: 8,
    categories: ["Multiplayer", "Quiz"],
    hasRounds: true,
    isFinalGame: false,
    status: "active",
    gameModule: "TimedChainQuizModule",
    playersOnline: 0,
    activeRooms: 0,
    avgMatchTime: "4:00",
  },
  {
    slug: "memory-quiz",
    title: "Memory Quiz",
    description: "Remember information and answer questions.",
    longDescription: "Test your memory! Study information briefly, then answer questions about what you saw. The player with the best memory and attention to detail wins.",
    iconName: "brain",
    type: "multiplayer",
    minPlayers: 2,
    maxPlayers: 8,
    categories: ["Multiplayer", "Quiz"],
    hasRounds: true,
    isFinalGame: false,
    status: "coming_soon",
    gameModule: "MemoryQuizModule",
    playersOnline: 0,
    activeRooms: 0,
    avgMatchTime: "5:00",
  },
  
  // ============ QUIZ GAMES ============
  {
    slug: "guess-the-fake",
    title: "Guess the Fake",
    description: "Find the fake fact among real ones.",
    longDescription: "Three facts are presented - two are true, one is fake. Can you spot the lie? Test your knowledge and instincts in this tricky trivia game.",
    iconName: "search",
    type: "hybrid",
    minPlayers: 2,
    maxPlayers: 10,
    categories: ["Quiz"],
    hasRounds: true,
    isFinalGame: false,
    status: "active",
    gameModule: "GuessTheFakeModule",
    playersOnline: 0,
    activeRooms: 0,
    avgMatchTime: "3:00",
  },
  {
    slug: "guess-the-true",
    title: "Guess the True",
    description: "Find the true fact among fake ones.",
    longDescription: "Three facts are presented - two are fake, one is true. Can you find the truth? The opposite of Guess the Fake - equally challenging!",
    iconName: "search",
    type: "hybrid",
    minPlayers: 2,
    maxPlayers: 10,
    categories: ["Quiz"],
    hasRounds: true,
    isFinalGame: false,
    status: "coming_soon",
    gameModule: "GuessTheTrueModule",
    playersOnline: 0,
    activeRooms: 0,
    avgMatchTime: "3:00",
  },
]

// ==============================================
// HELPER FUNCTIONS
// ==============================================

export function getGameBySlug(slug: string): GameData | undefined {
  return gamesData.find((game) => game.slug === slug)
}

export function getAllSlugs(): string[] {
  return gamesData.map((game) => game.slug)
}

export function getActiveGames(): GameData[] {
  return gamesData.filter((game) => game.status === "active")
}

export function getComingSoonGames(): GameData[] {
  return gamesData.filter((game) => game.status === "coming_soon")
}

export function getGamesByCategory(category: GameCategory): GameData[] {
  return gamesData.filter((game) => game.categories.includes(category))
}

export function getGamesByType(type: GameType): GameData[] {
  return gamesData.filter((game) => game.type === type)
}

export function getFinalGames(): GameData[] {
  return gamesData.filter((game) => game.isFinalGame)
}

export function getRelatedGames(currentSlug: string, limit: number = 3): GameData[] {
  const currentGame = getGameBySlug(currentSlug)
  if (!currentGame) return gamesData.slice(0, limit)
  
  // Find games with matching categories, excluding current game
  const related = gamesData
    .filter((game) => game.slug !== currentSlug)
    .map((game) => ({
      game,
      score: game.categories.filter(cat => currentGame.categories.includes(cat)).length
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ game }) => game)
  
  return related
}

// For backward compatibility with old slug format
export function normalizeSlug(slug: string): string {
  const slugMap: Record<string, string> = {
    "timer-challenge": "timer",
  }
  return slugMap[slug] || slug
}
