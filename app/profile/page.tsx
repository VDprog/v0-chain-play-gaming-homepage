import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProfileContent } from "@/components/profile/profile-content"

export const metadata = {
  title: "Profile - ChainPlay",
  description: "Your personal gaming hub on ChainPlay",
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <ProfileContent />
      <Footer />
    </div>
  )
}
