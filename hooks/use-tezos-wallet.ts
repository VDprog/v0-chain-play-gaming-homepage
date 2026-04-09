"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { TezosNetwork } from "@/lib/types/player"

// Suppress Beacon SDK IndexedDB metrics errors in sandboxed environments
// This is a known issue where the SDK's analytics fails in iframes/sandboxes
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    // Check if this is the Beacon SDK metrics error
    const reason = event.reason as { message?: string } | undefined
    if (reason?.message?.includes("metrics not found")) {
      event.preventDefault()
      event.stopPropagation()
    }
  }, true) // Use capture phase to intercept before other handlers
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

// Global client to prevent multiple instances
let globalClient: InstanceType<typeof import("@airgap/beacon-dapp").DAppClient> | null = null
let initPromise: Promise<typeof import("@airgap/beacon-dapp")> | null = null

async function getBeaconDapp() {
  if (!initPromise) {
    initPromise = import("@airgap/beacon-dapp")
  }
  return initPromise
}

export function useTezosWallet(): UseTezosWalletReturn {
  const [address, setAddress] = useState<string | null>(null)
  const [network, setNetwork] = useState<TezosNetwork>("ghostnet")
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const clientRef = useRef<typeof globalClient>(null)

  // Initialize client and check for existing connection
  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        // Check localStorage first
        const wasConnected = localStorage.getItem("tezos_connected")
        const savedNetwork = localStorage.getItem("tezos_network") as TezosNetwork | null
        
        if (savedNetwork && mounted) {
          setNetwork(savedNetwork)
        }
        
        if (!wasConnected) return

        const beacon = await getBeaconDapp()
        
        // Reuse global client if it exists
        if (!globalClient) {
          const networkType = (savedNetwork || network) === "mainnet" 
            ? beacon.NetworkType.MAINNET 
            : beacon.NetworkType.GHOSTNET

          globalClient = new beacon.DAppClient({
            name: "ChainPlay",
            preferredNetwork: networkType,
          })

          // Subscribe to account changes
          globalClient.subscribeToEvent(beacon.BeaconEvent.ACTIVE_ACCOUNT_SET, (account) => {
            if (mounted && account) {
              setAddress(account.address)
            }
          })
        }

        clientRef.current = globalClient

        // Check for existing session
        const activeAccount = await globalClient.getActiveAccount()
        if (activeAccount && mounted) {
          setAddress(activeAccount.address)
        }
      } catch (err) {
        console.error("[v0] Tezos init error:", err)
        localStorage.removeItem("tezos_connected")
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const connect = useCallback(async (): Promise<string | null> => {
    setIsConnecting(true)
    setError(null)

    try {
      const beacon = await getBeaconDapp()
      
      const networkType = network === "mainnet" 
        ? beacon.NetworkType.MAINNET 
        : beacon.NetworkType.GHOSTNET

      // Create client if needed (or if network changed)
      if (!globalClient) {
        globalClient = new beacon.DAppClient({
          name: "ChainPlay",
          preferredNetwork: networkType,
        })

        // Subscribe to account changes
        globalClient.subscribeToEvent(beacon.BeaconEvent.ACTIVE_ACCOUNT_SET, (account) => {
          if (account) {
            setAddress(account.address)
          }
        })
      }

      clientRef.current = globalClient

      // Request permissions - this opens the wallet selector
      // Note: network is set via preferredNetwork in DAppClient constructor
      // Newer Beacon SDK versions don't accept network in requestPermissions
      const permissions = await globalClient.requestPermissions()

      const connectedAddress = permissions.address
      setAddress(connectedAddress)

      localStorage.setItem("tezos_connected", "true")
      localStorage.setItem("tezos_network", network)

      return connectedAddress
    } catch (err: unknown) {
      // Handle Beacon SDK error objects
      const errorObj = err as { errorType?: string; message?: string }
      let errorMessage = "Failed to connect Tezos wallet"
      
      if (errorObj.errorType === "ABORTED_ERROR") {
        errorMessage = "Connection was cancelled"
      } else if (errorObj.errorType === "NETWORK_NOT_SUPPORTED_ERROR") {
        errorMessage = "Network not supported by wallet"
      } else if (errorObj.errorType === "PARAMETERS_INVALID_ERROR") {
        errorMessage = "Invalid connection parameters"
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      console.error("[v0] Tezos wallet connection error:", err)
      return null
    } finally {
      setIsConnecting(false)
    }
  }, [network])

  const disconnect = useCallback(async () => {
    try {
      if (globalClient) {
        await globalClient.clearActiveAccount()
      }
      
      setAddress(null)
      localStorage.removeItem("tezos_connected")
      localStorage.removeItem("tezos_network")
    } catch (err) {
      console.error("[v0] Tezos wallet disconnect error:", err)
    }
  }, [])

  const switchNetwork = useCallback((newNetwork: TezosNetwork) => {
    if (address) {
      // Need to disconnect and reconnect with new network
      disconnect().then(() => {
        setNetwork(newNetwork)
        // Destroy client so it recreates with new network
        if (globalClient) {
          globalClient.destroy().catch(() => {})
          globalClient = null
          clientRef.current = null
        }
      })
    } else {
      setNetwork(newNetwork)
      if (globalClient) {
        globalClient.destroy().catch(() => {})
        globalClient = null
        clientRef.current = null
      }
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
