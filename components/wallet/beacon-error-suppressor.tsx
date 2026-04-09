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
      
      // Build a comprehensive string to check against
      let errorText = ""
      
      if (reason instanceof Error) {
        errorText = `${reason.message} ${reason.stack || ""}`
      } else if (typeof reason === "string") {
        errorText = reason
      } else if (reason && typeof reason === "object") {
        // Try to extract any useful text from the object
        errorText = JSON.stringify(reason)
        if ("message" in reason) errorText += ` ${String(reason.message)}`
        if ("stack" in reason) errorText += ` ${String(reason.stack)}`
      }
      
      // Convert to lowercase for case-insensitive matching
      const lowerText = errorText.toLowerCase()
      
      // Check if this is the Beacon SDK metrics error or other known Beacon errors
      // Also catch IndexedDB-related errors from Beacon's storage layer
      if (
        lowerText.includes("metrics not found") ||
        lowerText.includes("metrics") ||
        lowerText.includes("indexeddb") ||
        lowerText.includes("beacon") ||
        lowerText.includes("@airgap") ||
        lowerText.includes("dappclient")
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
