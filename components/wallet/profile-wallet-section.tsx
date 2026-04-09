"use client"

import { useState } from "react"
import { useTezosWallet } from "@/hooks/use-tezos-wallet"
import { Wallet, Check, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import type { TezosNetwork } from "@/lib/types/player"

function shortenAddress(address: string): string {
  return `${address.slice(0, 8)}...${address.slice(-4)}`
}

const tezosWallets = [
  { id: "temple", name: "Temple Wallet", icon: "🏛️", description: "Popular Tezos browser extension" },
  { id: "kukai", name: "Kukai Wallet", icon: "🔮", description: "Social login & email wallet" },
  { id: "beacon", name: "Other Wallets", icon: "📡", description: "Connect via Beacon protocol" },
]

export function ProfileWalletSection() {
  // Tezos wallet state
  const { 
    address, 
    network,
    isConnected, 
    isConnecting,
    connect,
    disconnect,
    switchNetwork
  } = useTezosWallet()

  const [showConnectModal, setShowConnectModal] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleViewExplorer = () => {
    if (!address) return
    const explorerUrl = network === "mainnet" 
      ? `https://tzkt.io/${address}` 
      : `https://ghostnet.tzkt.io/${address}`
    window.open(explorerUrl, "_blank")
  }

  const handleConnect = async () => {
    const connectedAddress = await connect()
    if (connectedAddress) {
      setShowConnectModal(false)
    }
  }

  const networkName = network === "mainnet" ? "Tezos Mainnet" : "Tezos Ghostnet"

  return (
    <section className="mb-10">
      <div className="rounded-xl bg-card border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Tezos Wallet</h2>
            <p className="text-sm text-muted-foreground">
              {isConnected 
                ? `Connected on ${networkName}`
                : "Connect to save progress"
              }
            </p>
          </div>
        </div>

        {/* Connecting State */}
        {isConnecting && (
          <div className="flex items-center justify-center gap-3 p-6 rounded-lg bg-muted/50 border border-border">
            <Spinner className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">Connecting wallet...</p>
          </div>
        )}

        {/* Disconnected State */}
        {!isConnected && !isConnecting && (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground">
                Connect your Tezos wallet to save progress and join ranked matches.
              </p>
              <Button onClick={() => setShowConnectModal(true)} className="shrink-0">
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            </div>

            <Dialog open={showConnectModal} onOpenChange={setShowConnectModal}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <span className="text-2xl">ꜩ</span>
                    Connect Tezos Wallet
                  </DialogTitle>
                  <DialogDescription>
                    Connect your Tezos wallet to save stats and join ranked matches.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Network Selection */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Network</label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant={network === "ghostnet" ? "default" : "outline"}
                        onClick={() => switchNetwork("ghostnet")}
                        className="flex-1"
                      >
                        Ghostnet (Test)
                      </Button>
                      <Button
                        size="sm"
                        variant={network === "mainnet" ? "default" : "outline"}
                        onClick={() => switchNetwork("mainnet")}
                        className="flex-1"
                      >
                        Mainnet
                      </Button>
                    </div>
                  </div>
                  
                  {/* Wallet Options */}
                  <div className="grid gap-3">
                    {tezosWallets.map((wallet) => (
                      <button
                        key={wallet.id}
                        onClick={handleConnect}
                        className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-muted/50 transition-all duration-200 text-left"
                      >
                        <span className="text-2xl">{wallet.icon}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{wallet.name}</p>
                          <p className="text-sm text-muted-foreground">{wallet.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    All wallets connect via the Beacon protocol
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* Connected State */}
        {isConnected && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                <span className="text-xl">ꜩ</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium text-foreground">
                    {shortenAddress(address!)}
                  </span>
                  <button 
                    onClick={handleCopy}
                    className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded transition-colors"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-muted-foreground">{networkName}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleViewExplorer}
                className="text-muted-foreground"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={disconnect}
                className="text-destructive hover:text-destructive"
              >
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
