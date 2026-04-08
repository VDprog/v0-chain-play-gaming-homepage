import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST /api/rooms/[roomId]/ready - Toggle ready status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const supabase = await createClient()
  const { roomId } = await params

  try {
    const body = await request.json()
    const { player_id, is_ready } = body

    if (!player_id) {
      return NextResponse.json({ error: "player_id is required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("room_players")
      .update({ 
        is_ready: is_ready !== undefined ? is_ready : true,
        status: is_ready !== false ? "ready" : "waiting"
      })
      .eq("room_id", roomId)
      .eq("player_id", player_id)
      .is("left_at", null)

    if (error) {
      return NextResponse.json({ error: "Failed to update ready status" }, { status: 500 })
    }

    // Fetch updated room
    const { data: room } = await supabase
      .from("rooms_with_players")
      .select("*")
      .eq("id", roomId)
      .single()

    return NextResponse.json({ room })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
