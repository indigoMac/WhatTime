"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Clock, MapPin, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface ConfirmMeetingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meetingTitle: string
  selectedTime: string
  participantCount: number
  location: string
}

export function ConfirmMeetingDialog({
  open,
  onOpenChange,
  meetingTitle,
  selectedTime,
  participantCount,
  location,
}: ConfirmMeetingDialogProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleConfirm = () => {
    toast({
      title: "Meeting confirmed",
      description: `${meetingTitle} has been scheduled for ${selectedTime}.`,
    })
    onOpenChange(false)
    router.push("/")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Confirm Meeting</DialogTitle>
          <DialogDescription>
            You are about to confirm this meeting time. All participants will be notified.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="font-medium">{meetingTitle}</h3>
            <div className="flex items-center text-sm">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{selectedTime}</span>
            </div>
            <div className="flex items-center text-sm">
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{location}</span>
            </div>
            <div className="flex items-center text-sm">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{participantCount} participants</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agenda">Meeting Agenda</Label>
            <Textarea
              id="agenda"
              placeholder="1. Introduction (5 min)&#10;2. Q2 Results Overview (15 min)&#10;3. Q&A (30 min)&#10;4. Next Steps (10 min)"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Additional Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add any additional information for the meeting invitation"
              className="min-h-[80px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm & Send Invitations</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
