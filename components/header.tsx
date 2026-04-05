"use client"

import { Bell, Wallet, Gamepad2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navItems = ["Games", "Live", "Tournaments", "Leaderboard"]

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/20 transition-transform duration-200 group-hover:scale-105">
              <Gamepad2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">ChainPlay</span>
          </a>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item, index) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  index === 1 
                    ? "text-primary bg-primary/5" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item}
                {index === 1 && (
                  <span className="ml-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-live" />
                )}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative h-9 w-9 hidden sm:flex hover:bg-muted">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
          </Button>
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2 h-9 px-3 text-sm font-medium">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="font-mono text-xs">0x1a2...3b4c</span>
          </Button>
          <Avatar className="h-9 w-9 ring-2 ring-border transition-all duration-200 hover:ring-primary/50 cursor-pointer">
            <AvatarImage src="/placeholder.svg" alt="User" />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">VP</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
