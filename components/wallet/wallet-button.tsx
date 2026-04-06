"use client"

import { useState, useEffect } from "react"
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi"
import { Wallet, Check, Copy, ExternalLink, ChevronDown, AlertCircle } from "lucide-react"
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
import { mainnet, polygon, sepolia } from "wagmi/chains"

const supportedChains = [mainnet, polygon, sepolia]

// Get connector display info
function getConnectorInfo(connectorId: string): { name: string; icon: string } {
  const connectors: Record<string, { name: string; icon: string }> = {
    metaMask: { name: "MetaMask", icon: "🦊" },
    walletConnect: { name: "WalletConnect", icon: "🔗" },
    coinbaseWalletSDK: { name: "Coinbase Wallet", icon: "🔵" },
    injected: { name: "Browser Wallet", icon: "💼" },
  }
  return connectors[connectorId] || { name: "Wallet", icon: "💼" }
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

interface WalletButtonProps {
  variant?: "default" | "compact"
  className?: string
}

export function WalletButton({ variant = "default", className }: WalletButtonProps) {
  const [mounted, setMounted] = useState(false)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Return a placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className={`h-9 px-4 gap-2 font-medium ${className}`}>
        <Wallet className="h-4 w-4 text-primary" />
        {variant === "compact" ? "Connect" : "Connect Wallet"}
      </Button>
    )
  }

  return <WalletButtonInner variant={variant} className={className} showConnectModal={showConnectModal} setShowConnectModal={setShowConnectModal} copied={copied} setCopied={setCopied} />
}

function WalletButtonInner({ 
  variant, 
  className, 
  showConnectModal, 
  setShowConnectModal,
  copied,
  setCopied
}: WalletButtonProps & { 
  showConnectModal: boolean
  setShowConnectModal: (v: boolean) => void
  copied: boolean
  setCopied: (v: boolean) => void
}) {
  const { address, isConnected, isConnecting, connector } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const currentChain = supportedChains.find(c => c.id === chainId)
  const isWrongNetwork = isConnected && !currentChain
  const connectorInfo = connector ? getConnectorInfo(connector.id) : null

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleViewExplorer = () => {
    if (address && currentChain?.blockExplorers?.default) {
      window.open(`${currentChain.blockExplorers.default.url}/address/${address}`, "_blank")
    }
  }

  // Loading / Connecting State
  if (isConnecting || isPending) {
    return (
      <Button variant="outline" size="sm" disabled className={`h-9 px-4 ${className}`}>
        <Spinner className="h-4 w-4 mr-2" />
        Connecting...
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
              <DialogTitle className="text-xl font-bold">Connect Wallet</DialogTitle>
              <DialogDescription>
                Connect your wallet to save stats and join ranked matches.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              {connectors.map((c) => {
                const info = getConnectorInfo(c.id)
                return (
                  <button
                    key={c.uid}
                    onClick={() => {
                      connect({ connector: c })
                      setShowConnectModal(false)
                    }}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-muted/50 transition-all duration-200 text-left"
                  >
                    <span className="text-2xl">{info.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{info.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {c.id === "injected" ? "Connect using browser wallet" : `Connect using ${info.name}`}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Wrong Network State
  if (isWrongNetwork) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={`h-9 px-3 gap-2 border-destructive/50 ${className}`}>
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-destructive font-medium">Wrong Network</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm font-semibold text-foreground">Switch Network</div>
          <DropdownMenuSeparator />
          {supportedChains.map((chain) => (
            <DropdownMenuItem
              key={chain.id}
              onClick={() => switchChain?.({ chainId: chain.id })}
              className="cursor-pointer"
            >
              {chain.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => disconnect()}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Connected State
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
            <span className="text-lg">{connectorInfo?.icon}</span>
            <span className="font-semibold text-foreground">{connectorInfo?.name}</span>
          </div>
          <p className="font-mono text-xs text-muted-foreground">{address}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">{currentChain?.name}</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopy} className="cursor-pointer gap-2">
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy Address"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleViewExplorer} className="cursor-pointer gap-2">
          <ExternalLink className="h-4 w-4" />
          View on Explorer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Switch Network</div>
        {supportedChains.map((chain) => (
          <DropdownMenuItem
            key={chain.id}
            onClick={() => switchChain?.({ chainId: chain.id })}
            className={`cursor-pointer ${chain.id === chainId ? "bg-muted" : ""}`}
          >
            {chain.name}
            {chain.id === chainId && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => disconnect()}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
