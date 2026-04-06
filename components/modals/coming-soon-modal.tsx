"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Clock, Bell } from "lucide-react"
import { toast } from "sonner"

interface ComingSoonModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feature: string
  description?: string
}

export function ComingSoonModal({ open, onOpenChange, feature, description }: ComingSoonModalProps) {
  const handleNotify = () => {
    toast.success("Notification Set", {
      description: `We'll notify you when ${feature} is available.`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4 mx-auto">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Coming Soon</DialogTitle>
          <DialogDescription className="text-center">
            {description || `${feature} is currently under development and will be available soon.`}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-4">
          <Button onClick={handleNotify} className="gap-2">
            <Bell className="h-4 w-4" />
            Notify Me When Available
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
