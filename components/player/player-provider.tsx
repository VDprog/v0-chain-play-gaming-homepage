"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import useSWR from "swr"
import type { PlayerWithStats, CreatePlayerInput, TezosNetwork } from "@/lib/types/player"
import { useTezosWallet } from "@/components/wallet/tezos-wallet-provider"
import { PlayerRegistrationModal } from "@/components/modals/player-registration-modal"

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
  /** True when the user needs to complete profile setup (wallet connected, but no player) */
  needsRegistration: boolean
  /** Open the registration modal */
  openRegistrationModal: () => void
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
  needsRegistration: false,
  openRegistrationModal: () => {},
})

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  
  // Tezos wallet state (only wallet type supported)
  const { 
    address, 
    isConnected,
    isRestoring,
    isReady,
    network 
  } = useTezosWallet()

  // Only start fetching player data after wallet restore is complete AND connected
  const shouldFetchPlayer = isReady && isConnected && address

  const { data, error, isLoading, mutate } = useSWR<{ player: PlayerWithStats | null }>(
    shouldFetchPlayer
      ? `/api/player?wallet=${address}&wallet_type=tezos` 
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )

  // Determine if user needs to register (wallet connected, data loaded, but no player)
  const needsRegistration = isReady && isConnected && address && !isLoading && data?.player === null

  // Auto-show registration modal when wallet is connected but no player exists
  useEffect(() => {
    if (needsRegistration && !showRegistrationModal) {
      // Small delay to ensure smooth UX after wallet connection
      const timer = setTimeout(() => {
        setShowRegistrationModal(true)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [needsRegistration, showRegistrationModal])

  // Close modal if wallet disconnects
  useEffect(() => {
    if (!isConnected && showRegistrationModal) {
      setShowRegistrationModal(false)
    }
  }, [isConnected, showRegistrationModal])

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

  const handleRegister = async (data: { username: string; avatar_url: string; wallet_network: string }) => {
    await createOrUpdatePlayer({
      username: data.username,
      avatar_url: data.avatar_url,
      wallet_network: data.wallet_network as TezosNetwork,
    })
    setShowRegistrationModal(false)
  }

  const openRegistrationModal = () => {
    if (needsRegistration) {
      setShowRegistrationModal(true)
    }
  }

  // isLoading is true during:
  // 1. Wallet restore in progress
  // 2. Player data fetch in progress (when connected)
  const combinedLoading = isRestoring || (shouldFetchPlayer ? isLoading : false)

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
        needsRegistration: needsRegistration || false,
        openRegistrationModal,
      }}
    >
      {children}
      
      {/* Registration Modal - shown when wallet is connected but no player profile exists */}
      <PlayerRegistrationModal
        open={showRegistrationModal}
        onOpenChange={setShowRegistrationModal}
        onRegister={handleRegister}
      />
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  return useContext(PlayerContext)
}
