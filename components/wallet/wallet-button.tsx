"use client"

import { useState, useEffect } from "react"
import { Wallet, Check, Copy, ExternalLink, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useTezosWallet } from "@/components/wallet/tezos-wallet-provider"
import type { TezosNetwork } from "@/lib/types/player"

// Tezos wallet display info
const tezosWallets = [
  { id: "temple", name: "Temple Wallet", icon: "🏛️", description: "Popular Tezos browser extension" },
  { id: "kukai", name: "Kukai Wallet", icon: "🔮", description: "Social login & email wallet" },
  { id: "beacon", name: "Other Wallets", icon: "📡", description: "Connect via Beacon protocol" },
]

function shortenAddress(address: string): string {
  // Tezos addresses (tz1...), keep more visible
  return `${address.slice(0, 8)}...${address.slice(-4)}`
}

interface WalletButtonProps {
  variant?: "default" | "compact"
  className?: string
  onConnect?: (address: string, network: TezosNetwork) => void
  onDisconnect?: () => void
}

export function WalletButton({ variant = "default", className, onConnect, onDisconnect }: WalletButtonProps) {
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [copied, setCopied] = useState(false)

  // Tezos wallet state
  const { 
    address, 
    network,
    isConnected, 
    isConnecting,
    isRestoring,
    connect,
    disconnect,
    switchNetwork
  } = useTezosWallet()

  // Notify parent when connection changes
  useEffect(() => {
    if (isConnected && address && onConnect) {
      onConnect(address, network)
    }
  }, [isConnected, address, network, onConnect])

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

  const handleDisconnect = () => {
    disconnect()
    onDisconnect?.()
  }

  const handleConnect = async () => {
    const connectedAddress = await connect()
    if (connectedAddress) {
      setShowConnectModal(false)
    }
  }

  // Loading / Connecting / Restoring State
  if (isConnecting || isRestoring) {
    return (
      <Button variant="outline" size="sm" disabled className={`h-9 px-4 ${className}`}>
        <Spinner className="h-4 w-4 mr-2" />
        {isRestoring ? "Restoring..." : "Connecting..."}
      </Button>
    )
  }

  // Disconnected State
  if (!isConnected) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConnectModal(true)}
          className={`h-9 px-4 gap-2 font-medium ${className}`}
        >
          <Wallet className="h-4 w-4 text-primary" />
          {variant === "compact" ? "Connect" : "Connect Wallet"}
        </Button>

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
    )
  }

  // Connected State
  const networkName = network === "mainnet" ? "Tezos Mainnet" : "Tezos Ghostnet"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={`h-9 px-3 gap-2 ${className}`}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-mono text-xs font-medium">{shortenAddress(address!)}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-3 py-2.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">ꜩ</span>
            <span className="font-semibold text-foreground">Tezos Wallet</span>
          </div>
          <p className="font-mono text-xs text-muted-foreground break-all">{address}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">{networkName}</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopy} className="cursor-pointer gap-2">
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy Address"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleViewExplorer} className="cursor-pointer gap-2">
          <ExternalLink className="h-4 w-4" />
          View on TzKT
        </DropdownMenuItem>
        
        {/* Network switching */}
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Switch Network</div>
        {(["ghostnet", "mainnet"] as TezosNetwork[]).map((net) => (
          <DropdownMenuItem
            key={net}
            onClick={() => switchNetwork(net)}
            className={`cursor-pointer ${net === network ? "bg-muted" : ""}`}
          >
            {net === "mainnet" ? "Tezos Mainnet" : "Tezos Ghostnet"}
            {net === network && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDisconnect}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
