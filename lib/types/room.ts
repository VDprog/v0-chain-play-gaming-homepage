export type RoomStatus = "waiting" | "starting" | "live" | "finished"
export type RoomPlayerRole = "host" | "player" | "spectator"
export type RoomPlayerStatus = "waiting" | "ready" | "playing" | "eliminated" | "winner"

export interface RoomPlayer {
  id: string
  username: string
  avatar_url: string | null
  role: RoomPlayerRole
  status: RoomPlayerStatus
  is_ready: boolean
  joined_at: string
}

export interface Room {
  id: string
  game_slug: string
  name: string | null
  status: RoomStatus
  max_players: number
  is_private: boolean
  stakes: number
  settings: Record<string, unknown>
  created_by: string | null
  created_at: string
  started_at: string | null
  finished_at: string | null
  updated_at: string
}

export interface RoomWithPlayers extends Room {
  player_count: number
  players: RoomPlayer[]
}

export interface CreateRoomInput {
  game_slug: string
  name?: string
  max_players?: number
  is_private?: boolean
  stakes?: number
  settings?: Record<string, unknown>
  created_by: string
}

export interface JoinRoomInput {
  room_id: string
  player_id: string
  role?: RoomPlayerRole
}
