"use client"

import useSWR from "swr"

interface GameStats {
  game_slug: string
  active_rooms: number
  total_players: number
}

interface GamesHeroStatsProps {
  gameCount: number
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function GamesHeroStats({ gameCount }: GamesHeroStatsProps) {
  const { data } = useSWR<{ stats: GameStats[] }>("/api/games/stats", fetcher, {
    refreshInterval: 10000,
  })

  const totalPlayers = data?.stats?.reduce((acc, s) => acc + s.total_players, 0) || 0
  const totalRooms = data?.stats?.reduce((acc, s) => acc + s.active_rooms, 0) || 0

  return (
    <p className="text-lg text-muted-foreground leading-relaxed">
      Choose from {gameCount} exciting games.
      {totalPlayers > 0 || totalRooms > 0 ? (
        <> Join {new Intl.NumberFormat("en-US").format(totalPlayers)} players across {totalRooms} active rooms.</>
      ) : (
        <> Start a room and be the first to play!</>
      )}
    </p>
  )
}
