"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import useSWR from "swr"
import { useAccount } from "wagmi"
import type { PlayerWithStats, CreatePlayerInput, WalletType } from "@/lib/types/player"
import { useWalletReady } from "@/components/wallet/wallet-provider"
import { useTezosWallet } from "@/hooks/use-tezos-wallet"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

interface PlayerContextValue {
  player: PlayerWithStats | null
  isLoading: boolean
  error: Error | null
  createOrUpdatePlayer: (input: Omit<CreatePlayerInput, "wallet_address" | "wallet_type">) => Promise<{ player: PlayerWithStats }>
  refetch: () => Promise<unknown>
  isConnected: boolean
  address: string | undefined
  walletType: WalletType | null
}

const PlayerContext = createContext<PlayerContextValue>({
  player: null,
  isLoading: false,
  error: null,
  createOrUpdatePlayer: async () => { throw new Error("PlayerProvider not mounted") },
  refetch: () => Promise.resolve(undefined),
  isConnected: false,
  address: undefined,
  walletType: null,
})

// Inner component that uses wagmi hooks - only rendered when wallet is ready
function PlayerProviderInner({ children }: { children: ReactNode }) {
  const [isAutoCreating, setIsAutoCreating] = useState(false)
  
  // EVM wallet state
  const { address: evmAddress, isConnected: evmConnected } = useAccount()
  
  // Tezos wallet state
  const { 
    address: tezosAddress, 
    isConnected: tezosConnected,
    network: tezosNetwork 
  } = useTezosWallet()

  // Determine active wallet
  const isConnected = evmConnected || tezosConnected
  const walletType: WalletType | null = evmConnected ? "evm" : tezosConnected ? "tezos" : null
  const address = evmConnected ? evmAddress : tezosConnected ? tezosAddress : undefined

  console.log("[v0] PlayerProvider state:", { 
    evmConnected, evmAddress, 
    tezosConnected, tezosAddress, 
    isConnected, walletType, address 
  })

  const { data, error, isLoading, mutate } = useSWR<{ player: PlayerWithStats | null }>(
    isConnected && address && walletType
      ? `/api/player?wallet=${address}&wallet_type=${walletType}` 
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )
  
  console.log("[v0] PlayerProvider SWR result:", { data, error, isLoading })

  // Auto-create player if wallet is connected but no player exists
  useEffect(() => {
    const shouldAutoCreate = isConnected && address && walletType && !isLoading && data?.player === null && !isAutoCreating
    
    console.log("[v0] Auto-create check:", { 
      isConnected, address, walletType, isLoading, 
      playerExists: !!data?.player, 
      isAutoCreating,
      shouldAutoCreate 
    })
    
    if (shouldAutoCreate) {
      console.log("[v0] Auto-creating player for new wallet...")
      setIsAutoCreating(true)
      
      // Generate a default username from the wallet address
      const shortAddress = address.slice(0, 6) + "..." + address.slice(-4)
      const defaultUsername = `Player_${address.slice(-6)}`
      
      fetch("/api/player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: address,
          wallet_type: walletType,
          wallet_network: walletType === "tezos" ? tezosNetwork : undefined,
          username: defaultUsername,
        }),
      })
        .then(async (res) => {
          if (res.ok) {
            const result = await res.json()
            console.log("[v0] Auto-created player:", result.player)
            mutate({ player: result.player }, false)
          } else {
            const errorData = await res.json()
            console.error("[v0] Auto-create failed:", errorData)
          }
        })
        .catch((err) => {
          console.error("[v0] Auto-create error:", err)
        })
        .finally(() => {
          setIsAutoCreating(false)
        })
    }
  }, [isConnected, address, walletType, isLoading, data?.player, isAutoCreating, tezosNetwork, mutate])

  const createOrUpdatePlayer = async (input: Omit<CreatePlayerInput, "wallet_address" | "wallet_type">) => {
    if (!address || !walletType) throw new Error("Wallet not connected")

    const response = await fetch("/api/player", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet_address: address,
        wallet_type: walletType,
        wallet_network: walletType === "tezos" ? tezosNetwork : undefined,
        ...input,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create player")
    }

    const result = await response.json()
    
    // Update the SWR cache
    mutate({ player: result.player }, false)
    
    return result
  }

  // isLoading is true during initial fetch OR during auto-creation
  const combinedLoading = (isConnected && address ? isLoading : false) || isAutoCreating
  
  console.log("[v0] PlayerProvider final state:", {
    player: data?.player?.id,
    isLoading: combinedLoading,
    isAutoCreating,
    isConnected,
    address,
    walletType
  })

  return (
    <PlayerContext.Provider
      value={{
        player: data?.player || null,
        isLoading: combinedLoading,
        error: error || null,
        createOrUpdatePlayer,
        refetch: mutate,
        isConnected,
        address,
        walletType,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

// Main provider that conditionally renders the inner provider
export function PlayerProvider({ children }: { children: ReactNode }) {
  const walletReady = useWalletReady()

  // When wallet isn't ready, provide default context values
  if (!walletReady) {
    return (
      <PlayerContext.Provider
        value={{
          player: null,
          isLoading: false,
          error: null,
          createOrUpdatePlayer: async () => { throw new Error("Wallet not ready") },
          refetch: () => Promise.resolve(undefined),
          isConnected: false,
          address: undefined,
          walletType: null,
        }}
      >
        {children}
      </PlayerContext.Provider>
    )
  }

  // When wallet is ready, use the inner provider that accesses wagmi
  return <PlayerProviderInner>{children}</PlayerProviderInner>
}

export function usePlayer() {
  return useContext(PlayerContext)
}
