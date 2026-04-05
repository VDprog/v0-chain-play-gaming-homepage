"use client"

import { Bell, Wallet, Gamepad2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navItems = ["Games", "Live", "Tournaments", "Leaderboard"]

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-14 items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Gamepad2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">ChainPlay</span>
          </a>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="px-3 py-1.5 text-sm font-medium text-muted-foreground rounded-md transition-colors hover:text-foreground hover:bg-muted"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="relative h-8 w-8 hidden sm:flex">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
          </Button>
          <Button variant="ghost" size="sm" className="hidden sm:flex gap-1.5 h-8 px-2.5 text-sm text-muted-foreground hover:text-foreground">
            <Wallet className="h-3.5 w-3.5" />
            <span className="font-mono text-xs">0x1a2...3b4c</span>
          </Button>
          <Avatar className="h-8 w-8 ring-1 ring-border">
            <AvatarImage src="/placeholder.svg" alt="User" />
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">VP</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
