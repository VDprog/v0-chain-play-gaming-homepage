"use client"

import { Bell, Wallet, Gamepad2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navItems = ["Games", "Live", "Tournaments", "Leaderboard"]

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <a href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-sm">
              <Gamepad2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-foreground">ChainPlay</span>
          </a>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-lg transition-colors hover:text-foreground hover:bg-secondary"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative h-9 w-9 hidden sm:flex">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          </Button>
          <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 h-9 px-3 font-medium text-muted-foreground hover:text-foreground">
            <Wallet className="h-4 w-4" />
            <span>0x1a2...3b4c</span>
          </Button>
          <Avatar className="h-9 w-9 ring-2 ring-border">
            <AvatarImage src="/placeholder.svg" alt="User" />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">VP</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
