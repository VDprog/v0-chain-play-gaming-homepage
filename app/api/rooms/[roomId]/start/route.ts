import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { MIN_PLAYERS_TO_START } from "@/lib/types/room"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params
    const body = await request.json()
    const { player_id } = body

    if (!player_id) {
      return NextResponse.json(
        { error: "Player ID is required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get the room with players
    const { data: room, error: roomError } = await supabase
      .from("rooms_with_players")
      .select("*")
      .eq("id", roomId)
      .single()

    if (roomError || !room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      )
    }

    // Check if room is in waiting status
    if (room.status !== "waiting") {
      return NextResponse.json(
        { error: `Cannot start game. Room is ${room.status}` },
        { status: 400 }
      )
    }

    // Check if requester is the host
    const players = room.players as Array<{ id: string; role: string; is_ready: boolean }>
    const requester = players.find(p => p.id === player_id)
    
    if (!requester || requester.role !== "host") {
      return NextResponse.json(
        { error: "Only the host can start the game" },
        { status: 403 }
      )
    }

    // Check minimum player count (excluding spectators)
    const activePlayers = players.filter(p => p.role !== "spectator")
    if (activePlayers.length < MIN_PLAYERS_TO_START) {
      return NextResponse.json(
        { error: `Need at least ${MIN_PLAYERS_TO_START} players to start` },
        { status: 400 }
      )
    }

    // Check if all players are ready (excluding host who doesn't need to ready up)
    const nonHostPlayers = activePlayers.filter(p => p.role !== "host")
    const allReady = nonHostPlayers.every(p => p.is_ready)
    
    if (!allReady && nonHostPlayers.length > 0) {
      return NextResponse.json(
        { error: "All players must be ready before starting" },
        { status: 400 }
      )
    }

    // Get totalRounds from room settings (default to 1)
    const totalRounds = (room.settings?.totalRounds as number) || 1
    
    // Create fresh game state - start directly in countdown (skip waiting)
    const countdownEndsAt = Date.now() + 3000 // 3 second countdown
    const playerIds = activePlayers.map(p => p.id)
    const playerWins: Record<string, number> = {}
    playerIds.forEach(id => { playerWins[id] = 0 })
    
    const freshGameState = {
      matchStatus: "countdown", // Start directly in countdown - no waiting!
      currentRound: 1,
      totalRounds,
      playerWins,
      bombHolderId: null,
      timerStartedAt: null,
      timerDuration: 15,
      eliminatedThisRound: [],
      roundWinnerId: null,
      roundLoserId: null,
      matchWinnerId: null,
      countdownEndsAt,
      lastUpdatedBy: player_id,
      lastUpdatedAt: Date.now(),
      version: 1, // Start at version 1 so it's recognized as valid
    }

    // Start the game - update room status to "starting" and reset game state
    const { error: updateError } = await supabase
      .from("rooms")
      .update({ 
        status: "starting",
        started_at: new Date().toISOString(),
        settings: {
          totalRounds,
          gameState: freshGameState,
        },
      })
      .eq("id", roomId)

    if (updateError) {
      console.error("Error starting room:", updateError)
      return NextResponse.json(
        { error: "Failed to start game" },
        { status: 500 }
      )
    }

    // Update all players to "playing" status
    const { error: playersError } = await supabase
      .from("room_players")
      .update({ status: "playing" })
      .eq("room_id", roomId)
      .neq("role", "spectator")
      .is("left_at", null)

    if (playersError) {
      console.error("Error updating player statuses:", playersError)
    }

    // After a short delay, change status to "live"
    // In production, this would be handled by the game logic
    setTimeout(async () => {
      const supabaseAsync = await createClient()
      await supabaseAsync
        .from("rooms")
        .update({ status: "live" })
        .eq("id", roomId)
        .eq("status", "starting")
    }, 3000)

    return NextResponse.json({ 
      success: true,
      message: "Game is starting!"
    })

  } catch (error) {
    console.error("Error in start game:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
