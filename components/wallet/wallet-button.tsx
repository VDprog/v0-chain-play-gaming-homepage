"use client"

import { useState, useEffect } from "react"
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi"
import { Wallet, Check, Copy, ExternalLink, ChevronDown, AlertCircle } from "lucide-react"
import { useWalletReady } from "./wallet-provider"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mainnet, polygon, sepolia } from "wagmi/chains"
import { useTezosWallet } from "@/hooks/use-tezos-wallet"
import type { WalletType, TezosNetwork } from "@/lib/types/player"

const supportedChains = [mainnet, polygon, sepolia]

// EVM connector display info
function getConnectorInfo(connectorId: string): { name: string; icon: string } {
  const connectors: Record<string, { name: string; icon: string }> = {
    metaMask: { name: "MetaMask", icon: "🦊" },
    walletConnect: { name: "WalletConnect", icon: "🔗" },
    coinbaseWalletSDK: { name: "Coinbase Wallet", icon: "🔵" },
    injected: { name: "Browser Wallet", icon: "💼" },
  }
  return connectors[connectorId] || { name: "Wallet", icon: "💼" }
}

// Tezos wallet display info
const tezosWallets = [
  { id: "temple", name: "Temple Wallet", icon: "🏛️", description: "Popular Tezos browser extension" },
  { id: "kukai", name: "Kukai Wallet", icon: "🔮", description: "Social login & email wallet" },
  { id: "beacon", name: "Other Wallets", icon: "📡", description: "Connect via Beacon protocol" },
]

function shortenAddress(address: string): string {
  // Tezos addresses are longer (tz1...), keep more visible
  if (address.startsWith("tz")) {
    return `${address.slice(0, 8)}...${address.slice(-4)}`
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

interface WalletButtonProps {
  variant?: "default" | "compact"
  className?: string
  onConnect?: (address: string, walletType: WalletType, network?: string) => void
  onDisconnect?: () => void
}

export function WalletButton({ variant = "default", className, onConnect, onDisconnect }: WalletButtonProps) {
  const walletReady = useWalletReady()
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<WalletType>("evm")

  // Return a placeholder until WagmiProvider is ready
  if (!walletReady) {
    return (
      <Button variant="outline" size="sm" className={`h-9 px-4 gap-2 font-medium ${className}`}>
        <Wallet className="h-4 w-4 text-primary" />
        {variant === "compact" ? "Connect" : "Connect Wallet"}
      </Button>
    )
  }

  return (
    <WalletButtonInner 
      variant={variant} 
      className={className} 
      showConnectModal={showConnectModal} 
      setShowConnectModal={setShowConnectModal} 
      copied={copied} 
      setCopied={setCopied}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onConnect={onConnect}
      onDisconnect={onDisconnect}
    />
  )
}

function WalletButtonInner({ 
  variant, 
  className, 
  showConnectModal, 
  setShowConnectModal,
  copied,
  setCopied,
  activeTab,
  setActiveTab,
  onConnect,
  onDisconnect: onDisconnectCallback
}: WalletButtonProps & { 
  showConnectModal: boolean
  setShowConnectModal: (v: boolean) => void
  copied: boolean
  setCopied: (v: boolean) => void
  activeTab: WalletType
  setActiveTab: (v: WalletType) => void
}) {
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

  // Determine which wallet is active
  const isConnected = evmConnected || tezosConnected
  const isConnecting = evmConnecting || tezosConnecting || isPending
  const activeWalletType: WalletType | null = evmConnected ? "evm" : tezosConnected ? "tezos" : null
  const address = evmConnected ? evmAddress : tezosConnected ? tezosAddress : null

  const currentChain = supportedChains.find(c => c.id === chainId)
  const isWrongNetwork = evmConnected && !currentChain
  const connectorInfo = connector ? getConnectorInfo(connector.id) : null

  // Notify parent when connection changes
  useEffect(() => {
    if (evmConnected && evmAddress && onConnect) {
      onConnect(evmAddress, "evm", currentChain?.name?.toLowerCase())
    }
  }, [evmConnected, evmAddress, currentChain, onConnect])

  useEffect(() => {
    if (tezosConnected && tezosAddress && onConnect) {
      onConnect(tezosAddress, "tezos", tezosNetwork)
    }
  }, [tezosConnected, tezosAddress, tezosNetwork, onConnect])

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
    onDisconnectCallback?.()
  }

  const handleTezosConnect = async () => {
    const connectedAddress = await tezosConnect()
    if (connectedAddress) {
      setShowConnectModal(false)
    }
  }

  // Loading / Connecting State
  if (isConnecting) {
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
    )
  }

  // Wrong Network State (EVM only)
  if (isWrongNetwork && activeWalletType === "evm") {
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
            onClick={handleDisconnect}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Connected State
  const networkName = activeWalletType === "evm" 
    ? currentChain?.name 
    : tezosNetwork === "mainnet" ? "Tezos Mainnet" : "Tezos Ghostnet"
  
  const walletIcon = activeWalletType === "evm" 
    ? connectorInfo?.icon || "💼"
    : "ꜩ"
  
  const walletName = activeWalletType === "evm"
    ? connectorInfo?.name || "Wallet"
    : "Tezos Wallet"

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
            <span className="text-lg">{walletIcon}</span>
            <span className="font-semibold text-foreground">{walletName}</span>
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
          View on Explorer
        </DropdownMenuItem>
        
        {/* Network switching for EVM */}
        {activeWalletType === "evm" && (
          <>
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
          </>
        )}
        
        {/* Network switching for Tezos */}
        {activeWalletType === "tezos" && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Switch Network</div>
            {(["ghostnet", "mainnet"] as TezosNetwork[]).map((net) => (
              <DropdownMenuItem
                key={net}
                onClick={() => tezosSwitchNetwork(net)}
                className={`cursor-pointer ${net === tezosNetwork ? "bg-muted" : ""}`}
              >
                {net === "mainnet" ? "Tezos Mainnet" : "Tezos Ghostnet"}
                {net === tezosNetwork && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
              </DropdownMenuItem>
            ))}
          </>
        )}
        
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
