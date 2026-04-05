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
      <div className="container mx-auto px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Gamepad2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">ChainPlay</span>
            </a>
            <p className="text-sm text-muted-foreground max-w-xs mb-5 leading-relaxed">
              The web3 gaming platform for skill-based mini-games, live competitions, and on-chain rewards.
            </p>
            <div className="flex items-center gap-2">
              {[Twitter, Github, MessageCircle].map((Icon, i) => (
                <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-foreground text-sm mb-4">{category}</h4>
              <ul className="space-y-2.5">
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
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            2025 ChainPlay. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built for web3 gaming
          </p>
        </div>
      </div>
    </footer>
  )
}
