"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bomb, Users, Clock, Target, RefreshCw, Loader2 } from "lucide-react"

interface GameRoomProps {
  gameTitle: string
}

type GameState = "waiting" | "starting" | "live" | "finished" | "empty" | "reconnecting"

const players = [
  { name: "Vlad", initials: "V", isActive: true, isEliminated: false },
  { name: "Eva", initials: "E", isActive: false, isEliminated: false },
  { name: "Panda", initials: "P", isActive: false, isEliminated: true },
  { name: "Jack", initials: "J", isActive: false, isEliminated: false },
]

export function GameRoom({ gameTitle }: GameRoomProps) {
  const [gameState, setGameState] = useState<GameState>("live")

  const renderGameState = () => {
    switch (gameState) {
      case "waiting":
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Waiting for Players</h3>
            <p className="text-muted-foreground mb-6">2/4 players joined</p>
            <div className="flex gap-3">
              <Button variant="outline">Leave Room</Button>
              <Button>Ready</Button>
            </div>
          </div>
        )

      case "starting":
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl font-bold text-primary mb-4 animate-pulse">3</div>
            <h3 className="text-xl font-semibold text-foreground">Game starts in...</h3>
          </div>
        )

      case "live":
        return (
          <>
            {/* Players area */}
            <div className="relative h-72 flex items-center justify-center mb-6">
              {/* Timer ring */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-56 h-56 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-border"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="283"
                    strokeDashoffset="70"
                    strokeLinecap="round"
                    className="text-primary transition-all duration-1000"
                  />
                </svg>
              </div>

              {/* Center bomb */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-glow">
                  <Bomb className="h-12 w-12 text-primary" />
                </div>
                <span className="mt-4 text-3xl font-bold text-foreground font-mono">05s</span>
              </div>

              {/* Players positioned around */}
              {players.map((player, index) => {
                const positions = [
                  "top-0 left-1/2 -translate-x-1/2",
                  "right-4 top-1/2 -translate-y-1/2",
                  "bottom-0 left-1/2 -translate-x-1/2",
                  "left-4 top-1/2 -translate-y-1/2",
                ]
                return (
                  <div
                    key={player.name}
                    className={`absolute ${positions[index]} flex flex-col items-center transition-all duration-300`}
                  >
                    <Avatar className={`h-12 w-12 border-2 ${player.isActive ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-card" : player.isEliminated ? "border-border opacity-40" : "border-border"}`}>
                      <AvatarFallback className={`text-sm font-semibold ${player.isActive ? "bg-primary text-primary-foreground" : player.isEliminated ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                        {player.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className={`text-xs mt-2 font-medium ${player.isActive ? "text-primary" : player.isEliminated ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {player.name}
                    </span>
                    {player.isActive && (
                      <Badge className="mt-1 text-[10px] px-2 py-0 bg-primary text-primary-foreground">
                        Holding
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Action area */}
            <div className="flex justify-center">
              <Button size="lg" className="h-14 px-12 text-lg font-semibold shadow-lg shadow-primary/25">
                Pass Bomb
              </Button>
            </div>
          </>
        )

      case "finished":
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
              <span className="text-4xl">🏆</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Eva Wins!</h3>
            <p className="text-muted-foreground mb-6">Survived 5 rounds</p>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Play Again
              </Button>
              <Button>Join New Room</Button>
            </div>
          </div>
        )

      case "empty":
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Live Rooms</h3>
            <p className="text-muted-foreground mb-6">Be the first to start a game!</p>
            <Button>Create Room</Button>
          </div>
        )

      case "reconnecting":
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Reconnecting...</h3>
            <p className="text-muted-foreground">Please wait while we reconnect you to the match</p>
          </div>
        )
    }
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Live Game</span>
            <h2 className="text-2xl font-bold text-foreground mt-2">Game Room Preview</h2>
            <p className="mt-2 text-muted-foreground">See what the actual gameplay looks like</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main game area */}
          <div className="lg:col-span-3 bg-card rounded-2xl border border-border p-8 shadow-sm">
            {/* Room header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-foreground">{gameTitle} / Room #204</h3>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                  <span className="relative flex h-1.5 w-1.5 mr-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  Live
                </Badge>
                <Badge variant="outline" className="text-xs">Round 2</Badge>
              </div>
            </div>

            {renderGameState()}

            {/* State switcher for demo */}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground mb-3">Preview different game states:</p>
              <div className="flex flex-wrap gap-2">
                {(["waiting", "starting", "live", "finished", "empty", "reconnecting"] as GameState[]).map((state) => (
                  <Button
                    key={state}
                    size="sm"
                    variant={gameState === state ? "default" : "outline"}
                    onClick={() => setGameState(state)}
                    className="text-xs capitalize"
                  >
                    {state}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Side info panel */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-5">
              <h4 className="text-sm font-semibold text-foreground mb-4">Room Info</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Bomb Holder</span>
                  <span className="font-medium text-primary">Vlad</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Players Alive</span>
                  <span className="font-medium">3/4</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Round</span>
                  <span className="font-medium">2</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Phase</span>
                  <Badge variant="secondary" className="text-[10px]">Passing</Badge>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-5">
              <h4 className="text-sm font-semibold text-foreground mb-4">Next Targets</h4>
              <div className="space-y-2">
                {players.filter(p => !p.isActive && !p.isEliminated).map((player) => (
                  <div key={player.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {player.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{player.name}</span>
                    <Target className="h-4 w-4 text-muted-foreground ml-auto" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-5">
              <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Match Timer
              </h4>
              <div className="text-3xl font-bold text-foreground font-mono text-center">
                01:24
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
