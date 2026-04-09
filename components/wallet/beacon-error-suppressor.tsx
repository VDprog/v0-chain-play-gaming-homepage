"use client"

/**
 * Suppresses Beacon SDK IndexedDB metrics errors in sandboxed environments.
 * This is a known issue where the SDK's analytics fails in iframes/sandboxes.
 * The wallet functionality works fine - this just silences the non-blocking error.
 * 
 * This must run synchronously at module load time, before any Beacon SDK code executes.
 */

// Set up the error handler immediately when this module is loaded
// This happens before useEffect would run, ensuring we catch early errors
if (typeof window !== "undefined") {
  // Check if we've already set up the handler (prevents duplicate listeners on HMR)
  const handlerKey = "__beaconErrorSuppressorInstalled__"
  
  if (!(window as unknown as Record<string, boolean>)[handlerKey]) {
    (window as unknown as Record<string, boolean>)[handlerKey] = true
    
    window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
      // Handle various error formats from Beacon SDK
      const reason = event.reason
      let message = ""
      
      if (reason instanceof Error) {
        message = reason.message
      } else if (typeof reason === "string") {
        message = reason
      } else if (reason && typeof reason === "object" && "message" in reason) {
        message = String(reason.message)
      }
      
      // Check if this is the Beacon SDK metrics error or other known Beacon errors
      // Also catch IndexedDB-related errors from Beacon's storage layer
      if (
        message.includes("metrics not found") ||
        message.includes("IndexedDB") ||
        message.includes("beacon") ||
        message.includes("Beacon")
      ) {
        event.preventDefault()
        event.stopPropagation()
        // Silently ignore - this is expected in sandboxed environments
        return
      }
    }, true) // Capture phase
  }
}

// Export a no-op component that just needs to be imported to trigger the above code
export function BeaconErrorSuppressor() {
  return null
}
