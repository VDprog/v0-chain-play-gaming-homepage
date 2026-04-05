"use client"

import { Gamepad2, Twitter, Github, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const footerLinks = {
  Platform: ["Games", "Live Rooms", "Tournaments", "Leaderboard"],
  Resources: ["Documentation", "API", "Support", "Blog"],
  Legal: ["Terms", "Privacy", "Cookies"],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-6 lg:px-8 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/20 transition-transform duration-200 group-hover:scale-105">
                <Gamepad2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">ChainPlay</span>
            </a>
            <p className="text-sm text-muted-foreground max-w-xs mb-5 leading-relaxed">
              The web3 gaming platform for skill-based mini-games, live tournaments, and on-chain rewards.
            </p>
            <div className="flex items-center gap-2">
              {[Twitter, Github, MessageCircle].map((Icon, i) => (
                <Button key={i} variant="outline" size="icon" className="h-9 w-9 rounded-lg transition-all duration-200 hover:bg-primary/5 hover:border-primary/30 hover:text-primary">
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-foreground mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">2025 ChainPlay. All rights reserved.</p>
          <p className="text-sm text-muted-foreground">Built for web3 gaming</p>
        </div>
      </div>
    </footer>
  )
}
