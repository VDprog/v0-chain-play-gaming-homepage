import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { validateUsername, normalizeUsername } from "@/lib/validation/username"

// GET /api/username/check?username=xxx
// Returns availability status for live checking while typing
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const username = searchParams.get("username")

  if (!username) {
    return NextResponse.json(
      { error: "Username parameter required" },
      { status: 400 }
    )
  }

  // Validate format first
  const validation = validateUsername(username)
  if (!validation.isValid) {
    return NextResponse.json({
      available: false,
      valid: false,
      error: validation.error,
    })
  }

  const supabase = await createClient()
  const normalizedUsername = normalizeUsername(username)

  // Check if username exists (case-insensitive)
  const { data: existingPlayer, error } = await supabase
    .from("players")
    .select("id")
    .ilike("username", normalizedUsername)
    .maybeSingle()

  if (error) {
    console.error("Username check error:", error)
    return NextResponse.json(
      { error: "Failed to check username availability" },
      { status: 500 }
    )
  }

  return NextResponse.json({
    available: !existingPlayer,
    valid: true,
    error: existingPlayer ? "Username is already taken" : null,
  })
}
