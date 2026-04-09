/**
 * @deprecated EVM wallet support has been removed.
 * ChainPlay now uses Tezos-only via Beacon SDK.
 * This file is kept for reference but is not actively used.
 */

import { http, createConfig } from "wagmi"
import { mainnet, sepolia, polygon } from "wagmi/chains"
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors"

// WalletConnect project ID - only include connector if a real ID is provided
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

// Build connectors array - WalletConnect only if project ID exists
const connectors = [
  injected(),
  coinbaseWallet({ appName: "ChainPlay" }),
  // Only add WalletConnect if a valid project ID is configured
  ...(projectId ? [walletConnect({ projectId })] : []),
]

export const config = createConfig({
  chains: [mainnet, polygon, sepolia],
  connectors,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [sepolia.id]: http(),
  },
})

declare module "wagmi" {
  interface Register {
    config: typeof config
  }
}
