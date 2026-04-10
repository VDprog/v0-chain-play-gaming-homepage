import { createClient } from "@/lib/supabase/server"

/**
 * Room Lifecycle Management
 * 
 * Centralized utilities for room expiration, cleanup, and status management.
 * This ensures consistent lifecycle policies across all room-related APIs.
 */

// Expiration timeouts in milliseconds
export const ROOM_TIMEOUTS = {
  WAITING: 3 * 60 * 1000,      // 3 minutes for waiting rooms
  STARTING: 1 * 60 * 1000,     // 1 minute for starting rooms (stuck)
  LIVE: 10 * 60 * 1000,        // 10 minutes for live rooms (inactive)
  FINISHED: 10 * 60 * 1000,    // 10 minutes for finished rooms (lingering)
} as const

export type RoomStatus = "waiting" | "starting" | "live" | "finished" | "expired"

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
 * Check if a room is stale based on its status and last activity
 */
export function isRoomStale(
  status: RoomStatus,
  lastActivityAt: string | null,
  createdAt: string,
  finishedAt?: string | null
): boolean {
  const now = Date.now()
  const activityTime = lastActivityAt 
    ? new Date(lastActivityAt).getTime()
    : new Date(createdAt).getTime()
  
  const timeSinceActivity = now - activityTime

  switch (status) {
    case "waiting":
      return timeSinceActivity > ROOM_TIMEOUTS.WAITING
    case "starting":
      return timeSinceActivity > ROOM_TIMEOUTS.STARTING
    case "live":
      return timeSinceActivity > ROOM_TIMEOUTS.LIVE
    case "finished":
      // For finished rooms, also consider finished_at
      const finishTime = finishedAt ? new Date(finishedAt).getTime() : activityTime
      const timeSinceFinish = now - finishTime
      return timeSinceFinish > ROOM_TIMEOUTS.FINISHED
    case "expired":
      return true // Already expired
    default:
      return false
  }
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

/**
 * Check if a room is valid for /live display
 */
export function isRoomValidForLive(room: {
  status: RoomStatus
  player_count: number
  last_activity_at?: string | null
  created_at: string
  started_at?: string | null
  finished_at?: string | null
}): boolean {
  // Must be an active status
  if (!["waiting", "starting", "live"].includes(room.status)) {
    return false
  }
  
  // Must have at least one player
  if (room.player_count === 0) {
    return false
  }
  
  // Must not be stale
  if (isRoomStale(room.status, room.last_activity_at ?? null, room.created_at, room.finished_at)) {
    return false
  }
  
  return true
}
