"use client"

import { useState, useEffect, useCallback } from "react"
import type { TezosNetwork } from "@/lib/types/player"

// DAppClient types (we'll dynamically import the actual library)
interface DAppClientType {
  requestPermissions: (options?: { network?: { type: string } }) => Promise<{ address: string; network: { type: string } }>
  getActiveAccount: () => Promise<{ address: string; network: { type: string } } | undefined>
  disconnect: () => Promise<void>
  clearActiveAccount: () => Promise<void>
  destroy: () => Promise<void>
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

// Cache the client instance
let clientInstance: DAppClientType | null = null

// Cache the beacon module
let beaconModule: Awaited<typeof import("@airgap/beacon-dapp")> | null = null

async function getBeaconModule() {
  if (!beaconModule) {
    beaconModule = await import("@airgap/beacon-dapp")
  }
  return beaconModule
}

async function getDAppClient(network: TezosNetwork): Promise<DAppClientType> {
  if (clientInstance) return clientInstance
  
  const beaconDapp = await getBeaconModule()
  
  // DAppClient is the main export for dApp integrations
  const DAppClient = beaconDapp.DAppClient || (beaconDapp as { default?: { DAppClient?: unknown } }).default?.DAppClient
  
  if (!DAppClient || typeof DAppClient !== "function") {
    throw new Error("DAppClient not found in @airgap/beacon-dapp")
  }
  
  // Get network type enum - use string values if enum not available
  const NetworkType = beaconDapp.NetworkType
  const networkType = network === "mainnet" 
    ? (NetworkType?.MAINNET ?? "mainnet")
    : (NetworkType?.GHOSTNET ?? "ghostnet")
  
  // Create client with proper configuration
  // Disable analytics/metrics to avoid IndexedDB errors in some environments
  clientInstance = new (DAppClient as new (config: { 
    name: string
    preferredNetwork: string
    disableDefaultEvents?: boolean
    enableMetrics?: boolean
  }) => DAppClientType)({
    name: "ChainPlay",
    preferredNetwork: networkType,
    disableDefaultEvents: false,
    enableMetrics: false, // Disable metrics to avoid IndexedDB errors
  })
  
  return clientInstance
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
        // Check localStorage first to avoid unnecessary SDK loading
        const wasConnected = localStorage.getItem("tezos_connected")
        if (!wasConnected) return
        
        const savedNetwork = localStorage.getItem("tezos_network") as TezosNetwork | null
        if (savedNetwork) setNetwork(savedNetwork)
        
        const client = await getDAppClient(savedNetwork || network)
        const activeAccount = await client.getActiveAccount()
        if (activeAccount) {
          setAddress(activeAccount.address)
        }
      } catch {
        // No existing connection, that's fine
        localStorage.removeItem("tezos_connected")
      }
    }
    
    checkExistingConnection()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const connect = useCallback(async (): Promise<string | null> => {
    setIsConnecting(true)
    setError(null)
    
    try {
      const client = await getDAppClient(network)
      
      // Request permissions - network is set during client instantiation (preferredNetwork)
      // The newer Beacon SDK versions don't accept network in requestPermissions
      const permissions = await client.requestPermissions()
      
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
      if (clientInstance) {
        await clientInstance.clearActiveAccount()
        // Destroy the client to clean up resources
        await clientInstance.destroy()
      }
      
      setAddress(null)
      clientInstance = null
      
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
        clientInstance = null // Force new client instance with new network
      })
    } else {
      setNetwork(newNetwork)
      clientInstance = null
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
