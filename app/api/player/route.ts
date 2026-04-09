import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { CreatePlayerInput } from "@/lib/types/player"

// GET /api/player?wallet=0x123...&wallet_type=evm
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const walletAddress = searchParams.get("wallet")
  const walletType = searchParams.get("wallet_type") || "evm"

  if (!walletAddress) {
    return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
  }

  const supabase = await createClient()
  
  // For Tezos, don't lowercase (tz1 addresses are case-sensitive)
  const normalizedAddress = walletType === "tezos" 
    ? walletAddress 
    : walletAddress.toLowerCase()

  const { data: player, error } = await supabase
    .from("players")
    .select(`
      *,
      stats:player_stats(*)
    `)
    .eq("wallet_address", normalizedAddress)
    .eq("wallet_type", walletType)
    .single()

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!player) {
    return NextResponse.json({ player: null }, { status: 200 })
  }

  return NextResponse.json({ 
    player: {
      ...player,
      stats: player.stats?.[0] || null
    }
  })
}

// POST /api/player - Create or update player
export async function POST(request: NextRequest) {
  try {
    const body: CreatePlayerInput = await request.json()

    if (!body.wallet_address || !body.username || !body.wallet_type) {
      return NextResponse.json(
        { error: "Wallet address, wallet_type, and username are required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // For Tezos, don't lowercase (tz1 addresses are case-sensitive)
    const walletAddress = body.wallet_type === "tezos" 
      ? body.wallet_address 
      : body.wallet_address.toLowerCase()

    // Check if player exists with this wallet + type combination
    const { data: existingPlayer } = await supabase
      .from("players")
      .select("id")
      .eq("wallet_address", walletAddress)
      .eq("wallet_type", body.wallet_type)
      .single()

    if (existingPlayer) {
      // Update existing player
      const { data: updatedPlayer, error: updateError } = await supabase
        .from("players")
        .update({
          username: body.username,
          wallet_network: body.wallet_network,
          avatar_url: body.avatar_url,
        })
        .eq("wallet_address", walletAddress)
        .eq("wallet_type", body.wallet_type)
        .select(`
          *,
          stats:player_stats(*)
        `)
        .single()

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({ 
        player: {
          ...updatedPlayer,
          stats: updatedPlayer.stats?.[0] || null
        },
        created: false 
      })
    }

    // Create new player
    const { data: newPlayer, error: insertError } = await supabase
      .from("players")
      .insert({
        wallet_address: walletAddress,
        wallet_type: body.wallet_type,
        wallet_network: body.wallet_network,
        username: body.username,
        avatar_url: body.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${walletAddress}`,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Create default stats for new player
    const { error: statsError } = await supabase
      .from("player_stats")
      .insert({
        player_id: newPlayer.id,
      })

    if (statsError) {
      console.error("Failed to create player stats:", statsError)
    }

    // Fetch complete player with stats
    const { data: completePlayer } = await supabase
      .from("players")
      .select(`
        *,
        stats:player_stats(*)
      `)
      .eq("id", newPlayer.id)
      .single()

    return NextResponse.json({ 
      player: {
        ...completePlayer,
        stats: completePlayer?.stats?.[0] || null
      },
      created: true 
    }, { status: 201 })

  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
