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
