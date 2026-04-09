"use client"

import { useEffect } from "react"

/**
 * Suppresses Beacon SDK IndexedDB metrics errors in sandboxed environments.
 * This is a known issue where the SDK's analytics fails in iframes/sandboxes.
 * The wallet functionality works fine - this just silences the non-blocking error.
 */
export function BeaconErrorSuppressor() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason as { message?: string } | Error | undefined
      const message = reason instanceof Error ? reason.message : reason?.message
      
      // Check if this is the Beacon SDK metrics error
      if (message?.includes("metrics not found")) {
        event.preventDefault()
        event.stopPropagation()
        // Silently ignore - this is expected in sandboxed environments
        return
      }
    }

    // Add listener with capture phase to intercept early
    window.addEventListener("unhandledrejection", handleUnhandledRejection, true)

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection, true)
    }
  }, [])

  return null
}
