import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { LeaderboardContent } from "@/components/leaderboard-content"

export const revalidate = 60 // Revalidate every 60 seconds

async function getLeaderboardData() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("leaderboard_stats")
    .select("*")
    .order("wins", { ascending: false })
    .limit(20)
  
  if (error) {
    console.error("Error fetching leaderboard:", error)
    return []
  }
  
  return data || []
}

export default async function LeaderboardPage() {
  const leaderboardData = await getLeaderboardData()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <LeaderboardContent initialData={leaderboardData} />
      <Footer />
    </div>
  )
}
