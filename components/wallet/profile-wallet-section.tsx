"use client"

import { useState } from "react"
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi"
import { Wallet, Check, Copy, ExternalLink, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { mainnet, polygon, sepolia } from "wagmi/chains"

const supportedChains = [mainnet, polygon, sepolia]

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

export function ProfileWalletSection() {
  const { address, isConnected, isConnecting, connector } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const [showConnectModal, setShowConnectModal] = useState(false)
  const [copied, setCopied] = useState(false)

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

  return (
    <section className="mb-10">
      <div className="rounded-xl bg-card border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Wallet</h2>
            <p className="text-sm text-muted-foreground">
              {isConnected 
                ? isWrongNetwork 
                  ? "Wrong network detected" 
                  : `Connected via ${connectorInfo?.name}`
                : "Connect to save progress"
              }
            </p>
          </div>
        </div>

        {/* Connecting State */}
        {(isConnecting || isPending) && (
          <div className="flex items-center justify-center gap-3 p-6 rounded-lg bg-muted/50 border border-border">
            <Spinner className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">Connecting wallet...</p>
          </div>
        )}

        {/* Disconnected State */}
        {!isConnected && !isConnecting && !isPending && (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground">
                Connect your wallet to save progress, join ranked matches, and earn rewards.
              </p>
              <Button onClick={() => setShowConnectModal(true)} className="shrink-0">
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            </div>

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
        )}

        {/* Wrong Network State */}
        {isConnected && isWrongNetwork && (
          <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 shrink-0">
                <AlertCircle className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-foreground">Unsupported Network</p>
                <p className="text-sm text-muted-foreground">
                  Please switch to a supported network to continue.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {supportedChains.map((chain) => (
                <Button
                  key={chain.id}
                  variant="outline"
                  size="sm"
                  onClick={() => switchChain?.({ chainId: chain.id })}
                >
                  Switch to {chain.name}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => disconnect()}
                className="text-destructive hover:text-destructive"
              >
                Disconnect
              </Button>
            </div>
          </div>
        )}

        {/* Connected State */}
        {isConnected && !isWrongNetwork && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                <span className="text-xl">{connectorInfo?.icon}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium text-foreground">
                    {shortenAddress(address!)}
                  </span>
                  <button 
                    onClick={handleCopy}
                    className="p-1 hover:bg-emerald-100 rounded transition-colors"
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
                  <span className="text-xs text-muted-foreground">{currentChain?.name}</span>
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
                onClick={() => disconnect()}
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
