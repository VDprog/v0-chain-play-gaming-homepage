"use client"

import { type ReactNode } from "react"

// Simple provider for Tezos-only wallet support
// Wagmi/EVM support has been removed - only Tezos via Beacon SDK is active
export function WalletProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}
