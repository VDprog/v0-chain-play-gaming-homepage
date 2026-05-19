import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ROOM_TIMEOUTS } from "@/lib/room-lifecycle"

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
  const now = Date.now()

  // Expire stale rooms based on status-specific timeouts (same as /api/rooms)
  
  // 1. Expire stale WAITING rooms (3 minutes)
  const waitingCutoff = new Date(now - ROOM_TIMEOUTS.WAITING).toISOString()
  await supabase
    .from("rooms")
    .update({ status: "expired" })
    .eq("status", "waiting")
    .lt("updated_at", waitingCutoff)
  
  // Fallback for waiting rooms with null updated_at
  await supabase
    .from("rooms")
    .update({ status: "expired" })
    .eq("status", "waiting")
    .is("updated_at", null)
    .lt("created_at", waitingCutoff)
  
  // 2. Expire stuck STARTING rooms (1 minute)
  const startingCutoff = new Date(now - ROOM_TIMEOUTS.STARTING).toISOString()
  await supabase
    .from("rooms")
    .update({ status: "expired" })
    .eq("status", "starting")
    .lt("updated_at", startingCutoff)
  
  // Fallback for starting rooms with null updated_at
  await supabase
    .from("rooms")
    .update({ status: "expired" })
    .eq("status", "starting")
    .is("updated_at", null)
    .lt("created_at", startingCutoff)
  
  // 3. Expire inactive LIVE rooms (10 minutes)
  const liveCutoff = new Date(now - ROOM_TIMEOUTS.LIVE).toISOString()
  await supabase
    .from("rooms")
    .update({ status: "expired" })
    .eq("status", "live")
    .lt("updated_at", liveCutoff)
  
  // Fallback for live rooms with null updated_at - use started_at
  await supabase
    .from("rooms")
    .update({ status: "expired" })
    .eq("status", "live")
    .is("updated_at", null)
    .lt("started_at", liveCutoff)

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
