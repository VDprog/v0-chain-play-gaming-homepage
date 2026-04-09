import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { CreateRoomInput } from "@/lib/types/room"
import { ROOM_EXPIRATION_MS } from "@/lib/types/room"

// GET /api/rooms - List rooms (optionally filtered by game_slug)
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  
  const gameSlug = searchParams.get("game")
  const status = searchParams.get("status")
  const limit = parseInt(searchParams.get("limit") || "20")

  // First, expire any old waiting rooms (15 minutes without starting)
  const expirationTime = new Date(Date.now() - ROOM_EXPIRATION_MS).toISOString()
  await supabase
    .from("rooms")
    .update({ status: "expired" })
    .eq("status", "waiting")
    .lt("created_at", expirationTime)

  let query = supabase
    .from("rooms_with_players")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (gameSlug) {
    query = query.eq("game_slug", gameSlug)
  }

  if (status) {
    query = query.eq("status", status)
  } else {
    // By default, only show active rooms (not finished or expired)
    query = query.not("status", "in", '("finished","expired")')
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching rooms:", error)
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 })
  }

  return NextResponse.json({ rooms: data || [] })
}

// POST /api/rooms - Create a new room
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const body: CreateRoomInput = await request.json()

    if (!body.game_slug) {
      return NextResponse.json({ error: "game_slug is required" }, { status: 400 })
    }

    if (!body.created_by) {
      return NextResponse.json({ error: "created_by (player_id) is required" }, { status: 400 })
    }

    // Create the room
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .insert({
        game_slug: body.game_slug,
        name: body.name || null,
        max_players: body.max_players || 4,
        is_private: body.is_private || false,
        stakes: body.stakes || 0,
        settings: body.settings || {},
        created_by: body.created_by,
      })
      .select()
      .single()

    if (roomError) {
      console.error("Error creating room:", roomError)
      return NextResponse.json({ error: "Failed to create room" }, { status: 500 })
    }

    // Add the creator as the host
    const { error: playerError } = await supabase
      .from("room_players")
      .insert({
        room_id: room.id,
        player_id: body.created_by,
        role: "host",
        status: "waiting",
        is_ready: false,
      })

    if (playerError) {
      console.error("Error adding host to room:", playerError)
      // Room was created but player couldn't be added - clean up
      await supabase.from("rooms").delete().eq("id", room.id)
      return NextResponse.json({ error: "Failed to join room as host" }, { status: 500 })
    }

    // Fetch the room with players
    const { data: roomWithPlayers } = await supabase
      .from("rooms_with_players")
      .select("*")
      .eq("id", room.id)
      .single()

    return NextResponse.json({ room: roomWithPlayers }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
