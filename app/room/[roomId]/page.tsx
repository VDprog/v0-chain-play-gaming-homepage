import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { RoomContent } from "@/components/room/room-content"
import { getGameBySlug } from "@/lib/games-data"

export async function generateMetadata({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params
  const supabase = await createClient()
  
  const { data: room } = await supabase
    .from("rooms_with_players")
    .select("*")
    .eq("id", roomId)
    .single()
  
  if (!room) {
    return { title: "Room Not Found | ChainPlay" }
  }

  const game = getGameBySlug(room.game_slug)
  const roomName = room.name || `Room #${room.id.slice(0, 4).toUpperCase()}`
  
  return {
    title: `${roomName} - ${game?.title || room.game_slug} | ChainPlay`,
    description: `Join ${roomName} and play ${game?.title || room.game_slug} with other players.`,
  }
}

export default async function RoomPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ roomId: string }>
  searchParams: Promise<{ spectate?: string }>
}) {
  const { roomId } = await params
  const { spectate } = await searchParams
  
  const supabase = await createClient()
  
  const { data: room, error } = await supabase
    .from("rooms_with_players")
    .select("*")
    .eq("id", roomId)
    .single()
  
  if (error || !room) {
    notFound()
  }

  const game = getGameBySlug(room.game_slug)
  const isSpectator = spectate === "true"

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <RoomContent 
        initialRoom={room} 
        game={game}
        isSpectator={isSpectator}
      />
    </div>
  )
}
