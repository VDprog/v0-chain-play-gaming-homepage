"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider, type Config } from "wagmi"
import { useState, useEffect, type ReactNode } from "react"

export function WalletProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [mounted, setMounted] = useState(false)
  const [config, setConfig] = useState<Config | null>(null)

  useEffect(() => {
    // Dynamically import the config only on the client side
    // This prevents WalletConnect from trying to use indexedDB during SSR
    import("@/lib/wagmi-config").then((module) => {
      setConfig(module.config)
      setMounted(true)
    })
  }, [])

  // During SSR and initial hydration, render children without wallet context
  if (!mounted || !config) {
    return <>{children}</>
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
