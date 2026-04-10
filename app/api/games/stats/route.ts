import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ROOM_EXPIRATION } from "@/lib/room-lifecycle"

export interface GameStats {
  game_slug: string
  active_rooms: number
  live_rooms: number
  waiting_rooms: number
  total_players: number
}

// GET /api/games/stats - Get live stats for all games
export async function GET() {
  const supabase = await createClient()

  // Expire stale rooms based on status-specific timeouts
  const now = Date.now()
  
  // Waiting rooms: 15 minutes from creation
  const waitingExpiration = new Date(now - ROOM_EXPIRATION.WAITING_MS).toISOString()
  await supabase
    .from("rooms")
    .update({ status: "expired" })
    .eq("status", "waiting")
    .lt("created_at", waitingExpiration)
  
  // Starting rooms: 2 minutes (stuck in starting state)
  const startingExpiration = new Date(now - ROOM_EXPIRATION.STARTING_MS).toISOString()
  await supabase
    .from("rooms")
    .update({ status: "expired" })
    .eq("status", "starting")
    .lt("updated_at", startingExpiration)
  
  // Live rooms: 30 minutes without activity
  const liveExpiration = new Date(now - ROOM_EXPIRATION.LIVE_MS).toISOString()
  await supabase
    .from("rooms")
    .update({ status: "expired" })
    .eq("status", "live")
    .lt("updated_at", liveExpiration)

  // Fetch all active rooms with player counts
  const { data: rooms, error } = await supabase
    .from("rooms_with_players")
    .select("game_slug, status, player_count")
    .in("status", ["waiting", "starting", "live"])

  if (error) {
    console.error("Error fetching game stats:", error)
    return NextResponse.json({ error: "Failed to fetch game stats" }, { status: 500 })
  }

  // Aggregate stats by game
  const statsMap = new Map<string, GameStats>()

  for (const room of rooms || []) {
    // Skip rooms without players (orphaned rooms)
    if (room.player_count === 0) continue

    const existing = statsMap.get(room.game_slug) || {
      game_slug: room.game_slug,
      active_rooms: 0,
      live_rooms: 0,
      waiting_rooms: 0,
      total_players: 0,
    }

    existing.active_rooms++
    existing.total_players += room.player_count

    if (room.status === "live") {
      existing.live_rooms++
    } else if (room.status === "waiting" || room.status === "starting") {
      existing.waiting_rooms++
    }

    statsMap.set(room.game_slug, existing)
  }

  const stats = Array.from(statsMap.values())

  return NextResponse.json({ stats })
}
