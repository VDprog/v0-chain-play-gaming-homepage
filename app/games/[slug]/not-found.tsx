import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Gamepad2, ArrowLeft, Home } from "lucide-react"

export default function GameNotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-md mx-auto text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-8">
              <Gamepad2 className="h-10 w-10" />
            </div>
            
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Game Not Found
            </h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              The game you&apos;re looking for doesn&apos;t exist or may have been removed. Check out our other games instead!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link href="/games">
                  <ArrowLeft className="h-4 w-4" />
                  Browse All Games
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Go Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
