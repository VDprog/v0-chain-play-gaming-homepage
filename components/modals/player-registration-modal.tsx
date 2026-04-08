"use client"

import { useState } from "react"
import { useAccount, useChainId } from "wagmi"
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
import { User, Sparkles, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { useWalletReady } from "@/components/wallet/wallet-provider"

interface PlayerRegistrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRegister: (data: { username: string; avatar_url: string; wallet_chain: string }) => Promise<void>
}

const chainNames: Record<number, string> = {
  1: "Ethereum",
  137: "Polygon",
  11155111: "Sepolia",
}

export function PlayerRegistrationModal({ 
  open, 
  onOpenChange, 
  onRegister 
}: PlayerRegistrationModalProps) {
  const walletReady = useWalletReady()
  const { address } = useAccount()
  const chainId = useChainId()
  
  const [username, setUsername] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [avatarSeed, setAvatarSeed] = useState(() => address || Math.random().toString())

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`
  const chainName = walletReady ? (chainNames[chainId] || `Chain ${chainId}`) : "Unknown"

  const handleRandomizeAvatar = () => {
    setAvatarSeed(Math.random().toString(36).substring(7))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim()) {
      toast.error("Username is required")
      return
    }

    if (username.length < 3) {
      toast.error("Username must be at least 3 characters")
      return
    }

    if (username.length > 20) {
      toast.error("Username must be 20 characters or less")
      return
    }

    setIsSubmitting(true)
    try {
      await onRegister({
        username: username.trim(),
        avatar_url: avatarUrl,
        wallet_chain: chainName,
      })
      toast.success("Welcome to ChainPlay!", {
        description: `Your profile has been created, ${username}!`,
      })
      onOpenChange(false)
    } catch (error) {
      toast.error("Registration failed", {
        description: error instanceof Error ? error.message : "Please try again",
      })
    } finally {
      setIsSubmitting(false)
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
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10"
                maxLength={20}
                disabled={isSubmitting}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              3-20 characters. This will be visible to other players.
            </p>
          </div>

          {/* Wallet Info */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Connected Wallet</p>
            <p className="font-mono text-sm text-foreground">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{chainName}</p>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting || !username.trim()}>
            {isSubmitting ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                Creating Profile...
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
