"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import useSWR from "swr"
import type { PlayerWithStats, CreatePlayerInput, TezosNetwork } from "@/lib/types/player"
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
  network: TezosNetwork
}

const PlayerContext = createContext<PlayerContextValue>({
  player: null,
  isLoading: false,
  error: null,
  createOrUpdatePlayer: async () => { throw new Error("PlayerProvider not mounted") },
  refetch: () => Promise.resolve(undefined),
  isConnected: false,
  address: undefined,
  network: "ghostnet",
})

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [isAutoCreating, setIsAutoCreating] = useState(false)
  
  // Tezos wallet state (only wallet type supported)
  const { 
    address, 
    isConnected,
    network 
  } = useTezosWallet()

  const { data, error, isLoading, mutate } = useSWR<{ player: PlayerWithStats | null }>(
    isConnected && address
      ? `/api/player?wallet=${address}&wallet_type=tezos` 
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )

  // Auto-create player if wallet is connected but no player exists
  useEffect(() => {
    const shouldAutoCreate = isConnected && address && !isLoading && data?.player === null && !isAutoCreating
    
    if (shouldAutoCreate) {
      setIsAutoCreating(true)
      
      // Generate a default username from the wallet address
      const defaultUsername = `Player_${address.slice(-6)}`
      
      fetch("/api/player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: address,
          wallet_type: "tezos",
          wallet_network: network,
          username: defaultUsername,
        }),
      })
        .then(async (res) => {
          if (res.ok) {
            const result = await res.json()
            mutate({ player: result.player }, false)
          }
        })
        .catch((err) => {
          console.error("Auto-create player error:", err)
        })
        .finally(() => {
          setIsAutoCreating(false)
        })
    }
  }, [isConnected, address, isLoading, data?.player, isAutoCreating, network, mutate])

  const createOrUpdatePlayer = async (input: Omit<CreatePlayerInput, "wallet_address" | "wallet_type">) => {
    if (!address) throw new Error("Wallet not connected")

    const response = await fetch("/api/player", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet_address: address,
        wallet_type: "tezos",
        wallet_network: network,
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

  return (
    <PlayerContext.Provider
      value={{
        player: data?.player || null,
        isLoading: combinedLoading,
        error: error || null,
        createOrUpdatePlayer,
        refetch: mutate,
        isConnected,
        address: address || undefined,
        network,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  return useContext(PlayerContext)
}
