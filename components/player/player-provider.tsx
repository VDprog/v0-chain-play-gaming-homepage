"use client"

import { createContext, useContext, type ReactNode } from "react"
import useSWR from "swr"
import { useAccount } from "wagmi"
import type { PlayerWithStats, CreatePlayerInput } from "@/lib/types/player"
import { useWalletReady } from "@/components/wallet/wallet-provider"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

interface PlayerContextValue {
  player: PlayerWithStats | null
  isLoading: boolean
  error: Error | null
  createOrUpdatePlayer: (input: Omit<CreatePlayerInput, "wallet_address">) => Promise<{ player: PlayerWithStats }>
  refetch: () => Promise<unknown>
  isConnected: boolean
  address: string | undefined
}

const PlayerContext = createContext<PlayerContextValue>({
  player: null,
  isLoading: false,
  error: null,
  createOrUpdatePlayer: async () => { throw new Error("PlayerProvider not mounted") },
  refetch: () => Promise.resolve(undefined),
  isConnected: false,
  address: undefined,
})

// Inner component that uses wagmi hooks - only rendered when wallet is ready
function PlayerProviderInner({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount()

  const { data, error, isLoading, mutate } = useSWR<{ player: PlayerWithStats | null }>(
    isConnected && address 
      ? `/api/player?wallet=${address}` 
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )

  const createOrUpdatePlayer = async (input: Omit<CreatePlayerInput, "wallet_address">) => {
    if (!address) throw new Error("Wallet not connected")

    const response = await fetch("/api/player", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet_address: address,
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

  return (
    <PlayerContext.Provider
      value={{
        player: data?.player || null,
        isLoading: isConnected && address ? isLoading : false,
        error: error || null,
        createOrUpdatePlayer,
        refetch: mutate,
        isConnected,
        address,
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
