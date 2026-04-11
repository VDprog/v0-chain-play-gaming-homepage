import "server-only"
import { createClient } from "@/lib/supabase/server"
import { 
  ROOM_TIMEOUTS, 
  type RoomStatus,
} from "@/lib/room-lifecycle-utils"

// Re-export utilities from the client-safe module for server consumers
export { 
  ROOM_TIMEOUTS, 
  type RoomStatus, 
  getActivityTimestamp, 
  isRoomStale, 
  isRoomValidForLive 
} from "@/lib/room-lifecycle-utils"

/**
 * Room Lifecycle Management (SERVER-ONLY)
 * 
 * Server-side functions for room expiration, cleanup, and status management.
 * These functions use Supabase server client and can ONLY be used in server code.
 * 
 * For client-safe utilities, import from "@/lib/room-lifecycle-utils" instead.
 */

/**
 * Update last_activity_at for a room
 * Call this on meaningful room events
 */
export async function touchRoomActivity(roomId: string): Promise<void> {
  const supabase = await createClient()
  
  await supabase
    .from("rooms")
    .update({ last_activity_at: new Date().toISOString() })
    .eq("id", roomId)
}



/**
 * Expire stale rooms based on timeout rules
 * Returns the number of rooms expired
 */
export async function expireStaleRooms(): Promise<number> {
  const supabase = await createClient()
  const now = new Date()
  let expiredCount = 0

  // 1. Expire stale WAITING rooms (3 minutes)
  const waitingCutoff = new Date(now.getTime() - ROOM_TIMEOUTS.WAITING).toISOString()
  const { count: waitingExpired } = await supabase
    .from("rooms")
    .update({ status: "expired" })
    .eq("status", "waiting")
    .lt("last_activity_at", waitingCutoff)
    .select("*", { count: "exact", head: true })
  
  expiredCount += waitingExpired || 0

  // Also expire waiting rooms with null last_activity_at using created_at fallback
  const { count: waitingExpiredFallback } = await supabase
    .from("rooms")
    .update({ status: "expired" })
    .eq("status", "waiting")
    .is("last_activity_at", null)
    .lt("created_at", waitingCutoff)
    .select("*", { count: "exact", head: true })
  
  expiredCount += waitingExpiredFallback || 0

  // 2. Expire stuck STARTING rooms (1 minute)
  const startingCutoff = new Date(now.getTime() - ROOM_TIMEOUTS.STARTING).toISOString()
  const { count: startingExpired } = await supabase
    .from("rooms")
    .update({ status: "expired" })
    .eq("status", "starting")
    .lt("last_activity_at", startingCutoff)
    .select("*", { count: "exact", head: true })
  
  expiredCount += startingExpired || 0

  // Fallback for starting rooms with null last_activity_at
  const { count: startingExpiredFallback } = await supabase
    .from("rooms")
    .update({ status: "expired" })
    .eq("status", "starting")
    .is("last_activity_at", null)
    .lt("created_at", startingCutoff)
    .select("*", { count: "exact", head: true })
  
  expiredCount += startingExpiredFallback || 0

  // 3. Expire inactive LIVE rooms (10 minutes)
  const liveCutoff = new Date(now.getTime() - ROOM_TIMEOUTS.LIVE).toISOString()
  const { count: liveExpired } = await supabase
    .from("rooms")
    .update({ status: "expired" })
    .eq("status", "live")
    .lt("last_activity_at", liveCutoff)
    .select("*", { count: "exact", head: true })
  
  expiredCount += liveExpired || 0

  // Fallback for live rooms with null last_activity_at
  const { count: liveExpiredFallback } = await supabase
    .from("rooms")
    .update({ status: "expired" })
    .eq("status", "live")
    .is("last_activity_at", null)
    .lt("started_at", liveCutoff)
    .select("*", { count: "exact", head: true })
  
  expiredCount += liveExpiredFallback || 0

  // 4. Expire lingering FINISHED rooms (10 minutes after finish)
  const finishedCutoff = new Date(now.getTime() - ROOM_TIMEOUTS.FINISHED).toISOString()
  const { count: finishedExpired } = await supabase
    .from("rooms")
    .update({ status: "expired" })
    .eq("status", "finished")
    .lt("finished_at", finishedCutoff)
    .select("*", { count: "exact", head: true })
  
  expiredCount += finishedExpired || 0

  return expiredCount
}

/**
 * Clean up empty rooms (delete from database)
 * Only deletes rooms that are empty (no active players) and either finished or expired
 */
export async function cleanupEmptyRooms(): Promise<number> {
  const supabase = await createClient()
  
  // Find rooms that are finished/expired and have no active players
  const { data: emptyRooms, error: queryError } = await supabase
    .from("rooms_with_players")
    .select("id, status, player_count")
    .in("status", ["finished", "expired"])
    .eq("player_count", 0)
  
  if (queryError || !emptyRooms) {
    console.error("Error finding empty rooms:", queryError)
    return 0
  }

  let deletedCount = 0

  for (const room of emptyRooms) {
    // Delete room_players first (should already be empty or all left)
    await supabase
      .from("room_players")
      .delete()
      .eq("room_id", room.id)

    // Delete the room
    const { error: deleteError } = await supabase
      .from("rooms")
      .delete()
      .eq("id", room.id)

    if (!deleteError) {
      deletedCount++
    }
  }

  return deletedCount
}

/**
 * Handle room becoming empty (all players left)
 * Called when a player leaves and no active players remain
 */
export async function handleEmptyRoom(roomId: string, currentStatus: RoomStatus): Promise<void> {
  const supabase = await createClient()

  if (currentStatus === "waiting" || currentStatus === "starting") {
    // Empty waiting/starting room should be expired
    await supabase
      .from("rooms")
      .update({ status: "expired", last_activity_at: new Date().toISOString() })
      .eq("id", roomId)
  } else if (currentStatus === "live") {
    // Empty live room is broken - expire it
    await supabase
      .from("rooms")
      .update({ status: "expired", last_activity_at: new Date().toISOString() })
      .eq("id", roomId)
  } else if (currentStatus === "finished") {
    // Empty finished room can be deleted immediately
    await supabase
      .from("room_players")
      .delete()
      .eq("room_id", roomId)
    
    await supabase
      .from("rooms")
      .delete()
      .eq("id", roomId)
  }
}

/**
 * Get active player count for a room (excluding spectators and those who left)
 */
export async function getActivePlayerCount(roomId: string): Promise<number> {
  const supabase = await createClient()
  
  const { count } = await supabase
    .from("room_players")
    .select("*", { count: "exact", head: true })
    .eq("room_id", roomId)
    .neq("role", "spectator")
    .is("left_at", null)
  
  return count || 0
}


