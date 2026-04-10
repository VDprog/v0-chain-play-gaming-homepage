"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Spinner } from "@/components/ui/spinner"
import { User, Sparkles, RefreshCw, Check, X, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useTezosWallet } from "@/hooks/use-tezos-wallet"
import { validateUsername, USERNAME_RULES } from "@/lib/validation/username"
import { cn } from "@/lib/utils"

interface PlayerRegistrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRegister: (data: { username: string; avatar_url: string; wallet_network: string }) => Promise<void>
}

type AvailabilityStatus = "idle" | "checking" | "available" | "taken" | "error"

export function PlayerRegistrationModal({ 
  open, 
  onOpenChange, 
  onRegister 
}: PlayerRegistrationModalProps) {
  const { address, network } = useTezosWallet()
  
  const [username, setUsername] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [avatarSeed, setAvatarSeed] = useState(() => address || Math.random().toString())
  
  // Validation state
  const [validationError, setValidationError] = useState<string | null>(null)
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>("idle")
  
  // Debounce timer ref
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`
  const networkName = network === "mainnet" ? "Tezos Mainnet" : "Tezos Ghostnet"

  // Check username availability (debounced)
  const checkAvailability = useCallback(async (usernameToCheck: string) => {
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    abortControllerRef.current = new AbortController()
    
    try {
      setAvailabilityStatus("checking")
      
      const response = await fetch(
        `/api/username/check?username=${encodeURIComponent(usernameToCheck)}`,
        { signal: abortControllerRef.current.signal }
      )
      
      const data = await response.json()
      
      if (!response.ok) {
        setAvailabilityStatus("error")
        return
      }
      
      setAvailabilityStatus(data.available ? "available" : "taken")
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return // Ignore aborted requests
      }
      setAvailabilityStatus("error")
    }
  }, [])

  // Handle username input change with validation and debounced availability check
  const handleUsernameChange = useCallback((value: string) => {
    setUsername(value)
    
    // Clear previous timer
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current)
    }
    
    // Reset states
    setAvailabilityStatus("idle")
    
    // Validate format first
    const validation = validateUsername(value)
    setValidationError(validation.error)
    
    // Only check availability if format is valid
    if (validation.isValid) {
      // Debounce availability check (400ms)
      checkTimeoutRef.current = setTimeout(() => {
        checkAvailability(value)
      }, 400)
    }
  }, [checkAvailability])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setUsername("")
      setValidationError(null)
      setAvailabilityStatus("idle")
      setAvatarSeed(address || Math.random().toString())
    }
  }, [open, address])

  const handleRandomizeAvatar = () => {
    setAvatarSeed(Math.random().toString(36).substring(7))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Final validation check
    const validation = validateUsername(username)
    if (!validation.isValid) {
      setValidationError(validation.error)
      return
    }
    
    if (availabilityStatus !== "available") {
      if (availabilityStatus === "taken") {
        toast.error("Username is already taken")
      } else {
        toast.error("Please wait for username availability check")
      }
      return
    }

    setIsSubmitting(true)
    try {
      await onRegister({
        username: username.trim(),
        avatar_url: avatarUrl,
        wallet_network: network,
      })
      toast.success("Welcome to ChainPlay!", {
        description: `Your profile has been created, ${username}!`,
      })
      onOpenChange(false)
    } catch (error) {
      // Handle specific error codes from API
      const errorMessage = error instanceof Error ? error.message : "Please try again"
      if (errorMessage.includes("already taken") || errorMessage.includes("USERNAME_TAKEN")) {
        setAvailabilityStatus("taken")
        toast.error("Username is already taken", {
          description: "Please choose a different username",
        })
      } else {
        toast.error("Registration failed", {
          description: errorMessage,
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Determine if submit should be disabled
  const isSubmitDisabled = 
    isSubmitting || 
    !username.trim() || 
    validationError !== null || 
    availabilityStatus !== "available"

  // Get status icon and color
  const getStatusIndicator = () => {
    if (!username || validationError) return null
    
    switch (availabilityStatus) {
      case "checking":
        return <Spinner className="h-4 w-4 text-muted-foreground" />
      case "available":
        return <Check className="h-4 w-4 text-green-500" />
      case "taken":
        return <X className="h-4 w-4 text-destructive" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusMessage = () => {
    if (validationError) {
      return <span className="text-destructive">{validationError}</span>
    }
    
    if (!username) {
      return <span className="text-muted-foreground">{USERNAME_RULES.description}</span>
    }
    
    switch (availabilityStatus) {
      case "checking":
        return <span className="text-muted-foreground">Checking availability...</span>
      case "available":
        return <span className="text-green-500">Username is available!</span>
      case "taken":
        return <span className="text-destructive">Username is already taken</span>
      case "error":
        return <span className="text-yellow-500">Could not check availability</span>
      default:
        return <span className="text-muted-foreground">{USERNAME_RULES.description}</span>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Create Your Profile
          </DialogTitle>
          <DialogDescription>
            Set up your ChainPlay profile to start playing and earning.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Avatar Selection */}
          <div className="flex flex-col items-center gap-3">
            <Avatar className="h-24 w-24 ring-4 ring-primary/20">
              <AvatarImage src={avatarUrl} alt="Avatar preview" />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {username.slice(0, 2).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRandomizeAvatar}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Randomize Avatar
            </Button>
          </div>

          {/* Username Input */}
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-foreground">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="Choose a unique username"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className={cn(
                  "pl-10 pr-10",
                  validationError && "border-destructive focus-visible:ring-destructive",
                  availabilityStatus === "available" && "border-green-500 focus-visible:ring-green-500",
                  availabilityStatus === "taken" && "border-destructive focus-visible:ring-destructive"
                )}
                maxLength={USERNAME_RULES.maxLength}
                disabled={isSubmitting}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {getStatusIndicator()}
              </div>
            </div>
            <p className="text-xs min-h-[1.25rem]">
              {getStatusMessage()}
            </p>
          </div>

          {/* Wallet Info */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Connected Tezos Wallet</p>
            <p className="font-mono text-sm text-foreground">
              {address ? `${address.slice(0, 8)}...${address.slice(-4)}` : "Not connected"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{networkName}</p>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
            {isSubmitting ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                Creating Profile...
              </>
            ) : availabilityStatus === "checking" ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                Checking Username...
              </>
            ) : (
              "Create Profile"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
