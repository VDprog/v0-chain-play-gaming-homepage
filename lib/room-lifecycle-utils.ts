/**
 * Room Lifecycle Utilities (CLIENT-SAFE)
 * 
 * Pure utility functions for room expiration and status management.
 * These functions do NOT use any server-only imports and can be used in client components.
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
 * Get the best available activity timestamp with safe fallbacks
 * Priority: last_activity_at > updated_at > started_at > created_at
 */
export function getActivityTimestamp(room: {
  last_activity_at?: string | null
  updated_at?: string | null
  started_at?: string | null
  created_at: string
}): number {
  // Try each timestamp in order of preference
  const candidates = [
    room.last_activity_at,
    room.updated_at,
    room.started_at,
    room.created_at,
  ]
  
  for (const ts of candidates) {
    if (ts) {
      const time = new Date(ts).getTime()
      if (!isNaN(time)) return time
    }
  }
  
  // Absolute fallback - should never happen but prevents NaN
  return Date.now()
}

/**
 * Check if a room is stale based on its status and last activity
 * Uses safe timestamp fallbacks to handle missing fields
 */
export function isRoomStale(
  status: RoomStatus,
  lastActivityAt: string | null,
  createdAt: string,
  finishedAt?: string | null,
  updatedAt?: string | null,
  startedAt?: string | null
): boolean {
  const now = Date.now()
  const activityTime = getActivityTimestamp({
    last_activity_at: lastActivityAt,
    updated_at: updatedAt,
    started_at: startedAt,
    created_at: createdAt,
  })
  
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
 * Check if a room is valid for /live display
 * Uses safe null checks and fallbacks for all fields
 */
export function isRoomValidForLive(room: {
  status?: string | null
  player_count?: number | null
  last_activity_at?: string | null
  updated_at?: string | null
  created_at?: string | null
  started_at?: string | null
  finished_at?: string | null
}): boolean {
  // Guard against malformed room data
  if (!room || typeof room !== 'object') {
    return false
  }
  
  const status = room.status as RoomStatus | null | undefined
  
  // Must be an active status
  if (!status || !["waiting", "starting", "live"].includes(status)) {
    return false
  }
  
  // Must have at least one player (default to 0 if missing)
  const playerCount = typeof room.player_count === 'number' ? room.player_count : 0
  if (playerCount === 0) {
    return false
  }
  
  // Must have a valid created_at (use current time as fallback if missing)
  const createdAt = room.created_at || new Date().toISOString()
  
  // Must not be stale
  if (isRoomStale(
    status,
    room.last_activity_at ?? null,
    createdAt,
    room.finished_at ?? null,
    room.updated_at ?? null,
    room.started_at ?? null
  )) {
    return false
  }
  
  return true
}
