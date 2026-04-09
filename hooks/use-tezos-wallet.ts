"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { TezosNetwork } from "@/lib/types/player"

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
        const wasConnected = localStorage.getItem("tezos_connected")
        const savedNetwork = localStorage.getItem("tezos_network") as TezosNetwork | null
        
        if (savedNetwork && mounted) {
          setNetwork(savedNetwork)
        }
        
        if (!wasConnected) return

        const beacon = await getBeaconDapp()
        
        if (!globalClient) {
          globalClient = new beacon.DAppClient({
            name: "ChainPlay",
          })

          globalClient.subscribeToEvent(beacon.BeaconEvent.ACTIVE_ACCOUNT_SET, (account) => {
            if (mounted && account) {
              setAddress(account.address)
            }
          })
        }

        clientRef.current = globalClient

        const activeAccount = await globalClient.getActiveAccount()
        if (activeAccount && mounted) {
          setAddress(activeAccount.address)
        }
      } catch (err) {
        // Non-critical init error - user can reconnect manually
        localStorage.removeItem("tezos_connected")
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [])

  const connect = useCallback(async (): Promise<string | null> => {
    setIsConnecting(true)
    setError(null)

    try {
      const beacon = await getBeaconDapp()

      if (!globalClient) {
        globalClient = new beacon.DAppClient({
          name: "ChainPlay",
        })

        globalClient.subscribeToEvent(beacon.BeaconEvent.ACTIVE_ACCOUNT_SET, (account) => {
          if (account) {
            setAddress(account.address)
          }
        })
      }

      clientRef.current = globalClient

      // Request permissions - wrap to handle internal SDK errors
      let connectedAddress: string | null = null
      
      try {
        const permissions = await globalClient.requestPermissions()
        connectedAddress = permissions.address
      } catch (permError) {
        // The Beacon SDK may throw internal errors (like metrics IndexedDB errors)
        // but still successfully connect. Check if we have an active account.
        const errorObj = permError as { errorType?: string; message?: string }
        
        // If user explicitly cancelled, don't try fallback
        if (errorObj.errorType === "ABORTED_ERROR") {
          setError("Connection cancelled")
          return null
        }
        
        // Check if connection actually succeeded despite the error
        const activeAccount = await globalClient.getActiveAccount()
        if (activeAccount) {
          connectedAddress = activeAccount.address
        } else {
          // Real connection failure
          throw permError
        }
      }

      if (connectedAddress) {
        setAddress(connectedAddress)
        localStorage.setItem("tezos_connected", "true")
        localStorage.setItem("tezos_network", network)
        return connectedAddress
      }

      return null
    } catch (err: unknown) {
      const errorObj = err as { errorType?: string; message?: string }
      let errorMessage = "Failed to connect wallet"
      
      if (errorObj.errorType === "ABORTED_ERROR") {
        errorMessage = "Connection was cancelled"
      } else if (errorObj.errorType === "NETWORK_NOT_SUPPORTED_ERROR") {
        errorMessage = "Network not supported"
      } else if (errorObj.errorType === "PARAMETERS_INVALID_ERROR") {
        errorMessage = "Invalid connection parameters"
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
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
    } catch {
      // Ignore disconnect errors
    }
    
    setAddress(null)
    localStorage.removeItem("tezos_connected")
    localStorage.removeItem("tezos_network")
  }, [])

  const switchNetwork = useCallback((newNetwork: TezosNetwork) => {
    if (address) {
      disconnect().then(() => {
        setNetwork(newNetwork)
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
