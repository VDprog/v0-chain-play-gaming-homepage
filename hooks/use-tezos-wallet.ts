"use client"

import { useState, useEffect, useCallback } from "react"
import type { TezosNetwork } from "@/lib/types/player"

// BeaconWallet types (we'll dynamically import the actual library)
interface BeaconWalletType {
  requestPermissions: (options: { network: { type: string } }) => Promise<{ address: string }>
  getActiveAccount: () => Promise<{ address: string } | undefined>
  disconnect: () => Promise<void>
  clearActiveAccount: () => Promise<void>
}

interface UseTezosWalletReturn {
  address: string | null
  network: TezosNetwork
  isConnecting: boolean
  isConnected: boolean
  error: string | null
  connect: () => Promise<string | null>
  disconnect: () => Promise<void>
  switchNetwork: (network: TezosNetwork) => void
}

// Cache the wallet instance
let walletInstance: BeaconWalletType | null = null
let beaconModule: typeof import("@airgap/beacon-sdk") | null = null

async function getBeaconWallet(network: TezosNetwork): Promise<BeaconWalletType> {
  if (walletInstance) return walletInstance
  
  // Dynamically import beacon-sdk (it's large and not needed until user connects)
  if (!beaconModule) {
    beaconModule = await import("@airgap/beacon-sdk")
  }
  
  const { BeaconWallet } = beaconModule
  
  walletInstance = new BeaconWallet({
    name: "ChainPlay",
    preferredNetwork: network === "mainnet" 
      ? beaconModule.NetworkType.MAINNET 
      : beaconModule.NetworkType.GHOSTNET,
  }) as unknown as BeaconWalletType
  
  return walletInstance
}

export function useTezosWallet(): UseTezosWalletReturn {
  const [address, setAddress] = useState<string | null>(null)
  const [network, setNetwork] = useState<TezosNetwork>("ghostnet") // Default to testnet for safety
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check for existing connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      try {
        const wallet = await getBeaconWallet(network)
        const activeAccount = await wallet.getActiveAccount()
        if (activeAccount) {
          setAddress(activeAccount.address)
        }
      } catch {
        // No existing connection, that's fine
      }
    }
    
    checkExistingConnection()
  }, [network])

  const connect = useCallback(async (): Promise<string | null> => {
    setIsConnecting(true)
    setError(null)
    
    try {
      const wallet = await getBeaconWallet(network)
      
      // Request permissions (this will open the wallet selector)
      const networkType = network === "mainnet" ? "mainnet" : "ghostnet"
      const permissions = await wallet.requestPermissions({
        network: { type: networkType },
      })
      
      const connectedAddress = permissions.address
      setAddress(connectedAddress)
      
      // Store connection info in localStorage
      localStorage.setItem("tezos_connected", "true")
      localStorage.setItem("tezos_network", network)
      
      return connectedAddress
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect Tezos wallet"
      setError(errorMessage)
      console.error("[v0] Tezos wallet connection error:", err)
      return null
    } finally {
      setIsConnecting(false)
    }
  }, [network])

  const disconnect = useCallback(async () => {
    try {
      if (walletInstance) {
        await walletInstance.clearActiveAccount()
        await walletInstance.disconnect()
      }
      
      setAddress(null)
      walletInstance = null
      
      // Clear localStorage
      localStorage.removeItem("tezos_connected")
      localStorage.removeItem("tezos_network")
    } catch (err) {
      console.error("[v0] Tezos wallet disconnect error:", err)
    }
  }, [])

  const switchNetwork = useCallback((newNetwork: TezosNetwork) => {
    // Switching network requires reconnecting
    if (address) {
      disconnect().then(() => {
        setNetwork(newNetwork)
        walletInstance = null // Force new wallet instance with new network
      })
    } else {
      setNetwork(newNetwork)
      walletInstance = null
    }
  }, [address, disconnect])

  return {
    address,
    network,
    isConnecting,
    isConnected: !!address,
    error,
    connect,
    disconnect,
    switchNetwork,
  }
}
