"use client"

import { Gamepad2, Twitter, Github, MessageCircle } from "lucide-react"

const footerLinks = {
  Platform: ["Games", "Live Rooms", "Tournaments", "Leaderboard"],
  Resources: ["Documentation", "API", "Support", "Blog"],
  Legal: ["Terms", "Privacy", "Cookies"],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-6 lg:px-8 py-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Gamepad2 className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">ChainPlay</span>
            </a>
            <p className="text-sm text-muted-foreground max-w-xs mb-4 leading-relaxed">
              The web3 gaming platform for skill-based mini-games and on-chain rewards.
            </p>
            <div className="flex items-center gap-1">
              {[Twitter, Github, MessageCircle].map((Icon, i) => (
                <a key={i} href="#" className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-foreground text-sm mb-3">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">2025 ChainPlay. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Built for web3 gaming</p>
        </div>
      </div>
    </footer>
  )
}
