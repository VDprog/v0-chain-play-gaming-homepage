import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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
