"use client"

import { useState } from "react"
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi"
import { useWalletReady } from "./wallet-provider"
import { useTezosWallet } from "@/hooks/use-tezos-wallet"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mainnet, polygon, sepolia } from "wagmi/chains"
import type { WalletType, TezosNetwork } from "@/lib/types/player"

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
  // Tezos addresses are longer (tz1...), keep more visible
  if (address.startsWith("tz")) {
    return `${address.slice(0, 8)}...${address.slice(-4)}`
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const tezosWallets = [
  { id: "temple", name: "Temple Wallet", icon: "🏛️", description: "Popular Tezos browser extension" },
  { id: "kukai", name: "Kukai Wallet", icon: "🔮", description: "Social login & email wallet" },
  { id: "beacon", name: "Other Wallets", icon: "📡", description: "Connect via Beacon protocol" },
]

export function ProfileWalletSection() {
  const walletReady = useWalletReady()

  // Return a loading placeholder until WagmiProvider is ready
  if (!walletReady) {
    return (
      <section className="mb-10">
        <div className="rounded-xl bg-card border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Wallet</h2>
              <p className="text-sm text-muted-foreground">Loading wallet...</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 p-6 rounded-lg bg-muted/50 border border-border">
            <Spinner className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">Initializing...</p>
          </div>
        </div>
      </section>
    )
  }

  return <ProfileWalletSectionInner />
}

function ProfileWalletSectionInner() {
  // EVM wallet state
  const { address: evmAddress, isConnected: evmConnected, isConnecting: evmConnecting, connector } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect: evmDisconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  // Tezos wallet state
  const { 
    address: tezosAddress, 
    network: tezosNetwork,
    isConnected: tezosConnected, 
    isConnecting: tezosConnecting,
    connect: tezosConnect,
    disconnect: tezosDisconnect,
    switchNetwork: tezosSwitchNetwork
  } = useTezosWallet()

  const [showConnectModal, setShowConnectModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<WalletType>("evm")

  // Determine active wallet
  const isConnected = evmConnected || tezosConnected
  const isConnecting = evmConnecting || tezosConnecting || isPending
  const activeWalletType: WalletType | null = evmConnected ? "evm" : tezosConnected ? "tezos" : null
  const address = evmConnected ? evmAddress : tezosConnected ? tezosAddress : undefined

  const currentChain = supportedChains.find(c => c.id === chainId)
  const isWrongNetwork = evmConnected && !currentChain
  const connectorInfo = connector ? getConnectorInfo(connector.id) : null

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleViewExplorer = () => {
    if (!address) return
    
    if (activeWalletType === "evm" && currentChain?.blockExplorers?.default) {
      window.open(`${currentChain.blockExplorers.default.url}/address/${address}`, "_blank")
    } else if (activeWalletType === "tezos") {
      const explorerUrl = tezosNetwork === "mainnet" 
        ? `https://tzkt.io/${address}` 
        : `https://ghostnet.tzkt.io/${address}`
      window.open(explorerUrl, "_blank")
    }
  }

  const handleDisconnect = () => {
    if (activeWalletType === "evm") {
      evmDisconnect()
    } else if (activeWalletType === "tezos") {
      tezosDisconnect()
    }
  }

  const handleTezosConnect = async () => {
    const connectedAddress = await tezosConnect()
    if (connectedAddress) {
      setShowConnectModal(false)
    }
  }

  // Get display info for connected wallet
  const walletIcon = activeWalletType === "evm" 
    ? connectorInfo?.icon || "💼"
    : "ꜩ"
  
  const walletName = activeWalletType === "evm"
    ? connectorInfo?.name || "Wallet"
    : "Tezos Wallet"
  
  const networkName = activeWalletType === "evm" 
    ? currentChain?.name 
    : tezosNetwork === "mainnet" ? "Tezos Mainnet" : "Tezos Ghostnet"

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
                  : `Connected via ${walletName}`
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
                Connect your Ethereum or Tezos wallet to save progress and join ranked matches.
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
                
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as WalletType)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="evm" className="gap-2">
                      <span className="text-lg">⟠</span>
                      Ethereum
                    </TabsTrigger>
                    <TabsTrigger value="tezos" className="gap-2">
                      <span className="text-lg">ꜩ</span>
                      Tezos
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="evm" className="mt-0">
                    <div className="grid gap-3">
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
                  </TabsContent>
                  
                  <TabsContent value="tezos" className="mt-0">
                    <div className="mb-4">
                      <label className="text-sm font-medium text-muted-foreground">Network</label>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant={tezosNetwork === "ghostnet" ? "default" : "outline"}
                          onClick={() => tezosSwitchNetwork("ghostnet")}
                          className="flex-1"
                        >
                          Ghostnet (Test)
                        </Button>
                        <Button
                          size="sm"
                          variant={tezosNetwork === "mainnet" ? "default" : "outline"}
                          onClick={() => tezosSwitchNetwork("mainnet")}
                          className="flex-1"
                        >
                          Mainnet
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid gap-3">
                      {tezosWallets.map((wallet) => (
                        <button
                          key={wallet.id}
                          onClick={handleTezosConnect}
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
                    
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      All wallets connect via the Beacon protocol
                    </p>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* Wrong Network State (EVM only) */}
        {isConnected && isWrongNetwork && activeWalletType === "evm" && (
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
                onClick={handleDisconnect}
                className="text-destructive hover:text-destructive"
              >
                Disconnect
              </Button>
            </div>
          </div>
        )}

        {/* Connected State */}
        {isConnected && (!isWrongNetwork || activeWalletType === "tezos") && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                <span className="text-xl">{walletIcon}</span>
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
                  {activeWalletType && (
                    <span className="text-xs text-muted-foreground">
                      ({activeWalletType === "evm" ? "EVM" : "Tezos"})
                    </span>
                  )}
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
                onClick={handleDisconnect}
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
