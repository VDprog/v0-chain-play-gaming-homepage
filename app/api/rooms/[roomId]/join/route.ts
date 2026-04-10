import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { RoomPlayerRole } from "@/lib/types/room"

interface JoinRoomBody {
  player_id: string
  role?: RoomPlayerRole
}

// POST /api/rooms/[roomId]/join - Join a room
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const supabase = await createClient()
  const { roomId } = await params

  try {
    const body: JoinRoomBody = await request.json()

    if (!body.player_id) {
      return NextResponse.json({ error: "player_id is required" }, { status: 400 })
    }

    // Check if room exists and is joinable
    const { data: room, error: roomError } = await supabase
      .from("rooms_with_players")
      .select("*")
      .eq("id", roomId)
      .single()

    if (roomError || !room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    if (room.status === "finished") {
      return NextResponse.json({ error: "Room has ended" }, { status: 400 })
    }

    if (room.status === "live" && body.role !== "spectator") {
      return NextResponse.json({ error: "Room is already in progress. You can only join as spectator." }, { status: 400 })
    }

    const role = body.role || "player"
    
    if (role === "player" && room.player_count >= room.max_players) {
      return NextResponse.json({ error: "Room is full" }, { status: 400 })
    }

    // Check if player is already in the room
    const { data: existingPlayer } = await supabase
      .from("room_players")
      .select("id, left_at")
      .eq("room_id", roomId)
      .eq("player_id", body.player_id)
      .single()

    if (existingPlayer) {
      if (!existingPlayer.left_at) {
        return NextResponse.json({ error: "Already in this room" }, { status: 400 })
      }
      
      // Re-join the room (update existing record)
      const { error: updateError } = await supabase
        .from("room_players")
        .update({
          left_at: null,
          role,
          status: "waiting",
          is_ready: false,
          joined_at: new Date().toISOString(),
        })
        .eq("id", existingPlayer.id)

      if (updateError) {
        return NextResponse.json({ error: "Failed to rejoin room" }, { status: 500 })
      }
    } else {
      // Insert new player
      const { error: insertError } = await supabase
        .from("room_players")
        .insert({
          room_id: roomId,
          player_id: body.player_id,
          role,
          status: "waiting",
          is_ready: false,
        })

      if (insertError) {
        console.error("Error joining room:", insertError)
        return NextResponse.json({ error: "Failed to join room" }, { status: 500 })
      }
    }

    // Touch room activity timestamp
    await supabase
      .from("rooms")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", roomId)

    // Fetch updated room
    const { data: updatedRoom } = await supabase
      .from("rooms_with_players")
      .select("*")
      .eq("id", roomId)
      .single()

    return NextResponse.json({ room: updatedRoom })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

// DELETE /api/rooms/[roomId]/join - Leave a room
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const supabase = await createClient()
  const { roomId } = await params
  const { searchParams } = new URL(request.url)
  const playerId = searchParams.get("player_id")

  if (!playerId) {
    return NextResponse.json({ error: "player_id is required" }, { status: 400 })
  }

  // Get the room and player info first
  const { data: room } = await supabase
    .from("rooms_with_players")
    .select("*")
    .eq("id", roomId)
    .single()

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }

  // Find the leaving player
  const players = room.players as Array<{ id: string; role: string; joined_at: string }>
  const leavingPlayer = players.find(p => p.id === playerId)
  
  if (!leavingPlayer) {
    return NextResponse.json({ error: "Player not in room" }, { status: 400 })
  }

  // Mark the player as left
  const { error } = await supabase
    .from("room_players")
    .update({ 
      left_at: new Date().toISOString(),
      status: "left"
    })
    .eq("room_id", roomId)
    .eq("player_id", playerId)

  if (error) {
    return NextResponse.json({ error: "Failed to leave room" }, { status: 500 })
  }

  // If the leaving player was the host, transfer host to next player
  if (leavingPlayer.role === "host") {
    // Get remaining players (excluding the leaving player and spectators)
    const remainingPlayers = players
      .filter(p => p.id !== playerId && p.role !== "spectator")
      .sort((a, b) => new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime())

    if (remainingPlayers.length > 0) {
      // Transfer host to the earliest joined player
      const newHost = remainingPlayers[0]
      
      await supabase
        .from("room_players")
        .update({ role: "host" })
        .eq("room_id", roomId)
        .eq("player_id", newHost.id)
    } else {
      // No players left, mark room as expired
      await supabase
        .from("rooms")
        .update({ status: "expired" })
        .eq("id", roomId)
    }
  }

  // Check if room should be expired/cleaned up
  const activePlayersRemaining = players.filter(p => p.id !== playerId && p.role !== "spectator").length
  
  if (activePlayersRemaining === 0) {
    // No active players left
    if (room.status === "waiting") {
      // Waiting room with no players -> expire it
      await supabase
        .from("rooms")
        .update({ status: "expired" })
        .eq("id", roomId)
    } else if (room.status === "finished") {
      // Finished room with no players -> clean up by deleting room_players
      // The room record can stay for history, but mark all players as left
      await supabase
        .from("room_players")
        .update({ left_at: new Date().toISOString(), status: "left" })
        .eq("room_id", roomId)
        .is("left_at", null)
    }
  }

  return NextResponse.json({ success: true })
}
