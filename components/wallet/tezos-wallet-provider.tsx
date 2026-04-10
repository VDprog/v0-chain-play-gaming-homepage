"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import type { TezosNetwork } from "@/lib/types/player"

// Suppress known Beacon SDK internal errors that may still occur in sandboxed environments
// We've disabled WalletConnect transport, but some edge cases may still trigger errors
if (typeof window !== "undefined") {
  const isBeaconSdkError = (reason: unknown): boolean => {
    if (!reason) return false
    const text = String((reason as { message?: string })?.message || reason || "").toLowerCase()
    const stack = String((reason as { stack?: string })?.stack || "").toLowerCase()
    return (
      // Beacon SDK internal errors
      text.includes("metrics") ||
      text.includes("not found") ||
      stack.includes("beacon") ||
      stack.includes("@airgap") ||
      stack.includes("indexeddb")
    )
  }

  // Capture phase listener to intercept before other handlers
  window.addEventListener("unhandledrejection", (event) => {
    if (isBeaconSdkError(event.reason)) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }, true)
}

interface TezosWalletContextValue {
  address: string | null
  network: TezosNetwork
  isConnecting: boolean
  isConnected: boolean
  isRestoring: boolean  // True during initial session restore on page load
  isReady: boolean      // True when restore is complete (connected or not)
  error: string | null
  connect: () => Promise<string | null>
  disconnect: () => Promise<void>
  switchNetwork: (network: TezosNetwork) => void
}

const TezosWalletContext = createContext<TezosWalletContextValue>({
  address: null,
  network: "ghostnet",
  isConnecting: false,
  isConnected: false,
  isRestoring: true,   // Start as true - assume restoring until proven otherwise
  isReady: false,      // Start as false - not ready until restore attempt complete
  error: null,
  connect: async () => null,
  disconnect: async () => {},
  switchNetwork: () => {},
})

// Global client to prevent multiple instances
let globalClient: InstanceType<typeof import("@airgap/beacon-dapp").DAppClient> | null = null
let initPromise: Promise<typeof import("@airgap/beacon-dapp")> | null = null
let metricsPatched = false

async function getBeaconDapp() {
  if (!initPromise) {
    initPromise = import("@airgap/beacon-dapp").then((beacon) => {
      // Monkey-patch DAppClient to disable problematic features in sandboxed environments
      if (!metricsPatched && beacon.DAppClient?.prototype) {
        metricsPatched = true
        const proto = beacon.DAppClient.prototype as Record<string, unknown>
        
        // Override sendMetrics to be a no-op (prevents IndexedDB errors)
        if (typeof proto.sendMetrics === "function") {
          proto.sendMetrics = async function() { return }
        }
        
        // Override updateMetricsStorage to be a no-op
        if (typeof proto.updateMetricsStorage === "function") {
          proto.updateMetricsStorage = async function() { return }
        }
        
        // Disable WalletConnect transport initialization to prevent relayer/publisher errors
        // The walletConnectTransport getter/setter triggers WC initialization even without config
        // We override the internal _initWalletConnect method to be a no-op
        if (typeof proto._initWalletConnect === "function") {
          proto._initWalletConnect = async function() { return undefined }
        }
        
        // Also ensure walletConnectTransport is always undefined
        Object.defineProperty(proto, "walletConnectTransport", {
          get: function() { return undefined },
          set: function() { /* no-op */ },
          configurable: true,
        })
      }
      return beacon
    })
  }
  return initPromise
}

export function TezosWalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [network, setNetwork] = useState<TezosNetwork>("ghostnet")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isRestoring, setIsRestoring] = useState(true)  // Start true - restoring on mount
  const [isReady, setIsReady] = useState(false)         // Becomes true after restore attempt
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
        
        // If no previous session, mark as ready immediately
        if (!wasConnected) {
          if (mounted) {
            setIsRestoring(false)
            setIsReady(true)
          }
          return
        }

        const beacon = await getBeaconDapp()
        
        if (!globalClient) {
          globalClient = new beacon.DAppClient({
            name: "ChainPlay",
            disableDefaultEvents: false,
            // Disable analytics to prevent "metrics not found" errors in sandboxed environments
            enableMetrics: false,
          })

          globalClient.subscribeToEvent(beacon.BeaconEvent.ACTIVE_ACCOUNT_SET, (account) => {
            if (mounted && account) {
              setAddress(account.address)
            }
          })
        }

        clientRef.current = globalClient

        const activeAccount = await globalClient.getActiveAccount()
        if (mounted) {
          if (activeAccount) {
            setAddress(activeAccount.address)
          } else {
            // Session was stored but no active account - clear stale localStorage
            localStorage.removeItem("tezos_connected")
          }
          setIsRestoring(false)
          setIsReady(true)
        }
      } catch (err) {
        // Non-critical init error - user can reconnect manually
        localStorage.removeItem("tezos_connected")
        if (mounted) {
          setIsRestoring(false)
          setIsReady(true)
        }
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
          disableDefaultEvents: false,
          // Disable analytics to prevent "metrics not found" errors in sandboxed environments
          enableMetrics: false,
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
      
      // Use Promise.race with a resolved promise to handle the metrics error gracefully
      // The metrics error is thrown asynchronously and doesn't affect the actual connection
      const permissionsPromise = globalClient.requestPermissions()
      
      // Attach a catch to prevent unhandled rejection (metrics error is non-blocking)
      permissionsPromise.catch(() => {
        // Silently ignore - we'll check activeAccount as fallback
      })
      
      try {
        const permissions = await permissionsPromise
        connectedAddress = permissions.address
      } catch (permError) {
        // The Beacon SDK may throw internal errors (like metrics IndexedDB errors)
        // but still successfully connect. Check if we have an active account.
        const errorObj = permError as { errorType?: string; message?: string }
        const errorMessage = String(errorObj?.message || permError || "").toLowerCase()
        
        // If user explicitly cancelled, don't try fallback
        if (errorObj.errorType === "ABORTED_ERROR") {
          setError("Connection cancelled")
          return null
        }
        
        // If it's the metrics error, check if connection actually succeeded
        if (errorMessage.includes("metrics") || errorMessage.includes("indexeddb")) {
          const activeAccount = await globalClient.getActiveAccount()
          if (activeAccount) {
            connectedAddress = activeAccount.address
          }
        } else {
          // Check if connection actually succeeded despite the error
          const activeAccount = await globalClient.getActiveAccount()
          if (activeAccount) {
            connectedAddress = activeAccount.address
          } else {
            // Real connection failure
            throw permError
          }
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

  return (
    <TezosWalletContext.Provider
      value={{
        address,
        network,
        isConnecting,
        isConnected: !!address,
        isRestoring,
        isReady,
        error,
        connect,
        disconnect,
        switchNetwork,
      }}
    >
      {children}
    </TezosWalletContext.Provider>
  )
}

export function useTezosWallet(): TezosWalletContextValue {
  return useContext(TezosWalletContext)
}
