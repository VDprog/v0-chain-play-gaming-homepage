"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider, type Config } from "wagmi"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Context to track if wallet provider is ready
const WalletReadyContext = createContext<boolean>(false)

export function useWalletReady() {
  return useContext(WalletReadyContext)
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [config, setConfig] = useState<Config | null>(null)

  useEffect(() => {
    // Dynamically import the config only on the client side
    // This prevents WalletConnect from trying to use indexedDB during SSR
    import("@/lib/wagmi-config").then((module) => {
      setConfig(module.config)
    })
  }, [])

  // During SSR and initial hydration, render children without wallet context
  if (!config) {
    return (
      <WalletReadyContext.Provider value={false}>
        {children}
      </WalletReadyContext.Provider>
    )
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletReadyContext.Provider value={true}>
          {children}
        </WalletReadyContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
