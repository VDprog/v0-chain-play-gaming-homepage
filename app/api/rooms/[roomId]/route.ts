import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ROOM_EXPIRATION } from "@/lib/room-lifecycle"

// GET /api/rooms/[roomId] - Get a specific room
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const supabase = await createClient()
  const { roomId } = await params

  const { data, error } = await supabase
    .from("rooms_with_players")
    .select("*")
    .eq("id", roomId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }

  // Check if the room should be expired based on status-specific timeouts
  const now = Date.now()
  const activityTime = new Date(data.updated_at || data.created_at).getTime()
  const age = now - activityTime
  
  let shouldExpire = false
  
  if (data.status === "waiting" && age > ROOM_EXPIRATION.WAITING_MS) {
    shouldExpire = true
  } else if (data.status === "starting" && age > ROOM_EXPIRATION.STARTING_MS) {
    shouldExpire = true
  } else if (data.status === "live" && age > ROOM_EXPIRATION.LIVE_MS) {
    shouldExpire = true
  } else if (data.status === "finished") {
    const finishedAge = data.finished_at ? now - new Date(data.finished_at).getTime() : age
    if (finishedAge > ROOM_EXPIRATION.FINISHED_MS) {
      shouldExpire = true
    }
  }
  
  if (shouldExpire) {
    await supabase
      .from("rooms")
      .update({ status: "expired" })
      .eq("id", roomId)
    
    return NextResponse.json({ 
      room: { ...data, status: "expired" },
      expired: true
    })
  }

  return NextResponse.json({ room: data })
}

// PATCH /api/rooms/[roomId] - Update room status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const supabase = await createClient()
  const { roomId } = await params

  try {
    const body = await request.json()

    const updateData: Record<string, unknown> = {}
    
    if (body.status) {
      updateData.status = body.status
      if (body.status === "live") {
        updateData.started_at = new Date().toISOString()
      }
      if (body.status === "finished") {
        updateData.finished_at = new Date().toISOString()
      }
    }

    if (body.settings) {
      updateData.settings = body.settings
    }

    const { data, error } = await supabase
      .from("rooms")
      .update(updateData)
      .eq("id", roomId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to update room" }, { status: 500 })
    }

    return NextResponse.json({ room: data })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
