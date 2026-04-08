"use client"

import useSWR from "swr"
import { useAccount } from "wagmi"
import type { PlayerWithStats, CreatePlayerInput } from "@/lib/types/player"
import { useWalletReady } from "@/components/wallet/wallet-provider"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

export function usePlayer() {
  const walletReady = useWalletReady()
  const { address, isConnected } = useAccount()

  const { data, error, isLoading, mutate } = useSWR<{ player: PlayerWithStats | null }>(
    walletReady && isConnected && address 
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

  return {
    player: data?.player || null,
    isLoading: walletReady && isConnected && address ? isLoading : false,
    error,
    createOrUpdatePlayer,
    refetch: mutate,
    isConnected: walletReady && isConnected,
  }
}
