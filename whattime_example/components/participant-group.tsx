"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface ParticipantGroupProps {
  index: number
  group: {
    id: string
    name: string
    emails: string
  }
  onRemove: () => void
  canRemove: boolean
}

export function ParticipantGroup({ index, group, onRemove, canRemove }: ParticipantGroupProps) {
  return (
    <div className="space-y-4 p-4 border rounded-md">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Group {index + 1}</h4>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove} disabled={!canRemove}>
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remove group</span>
        </Button>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`group-name-${group.id}`}>Group Name</Label>
        <Input
          id={`group-name-${group.id}`}
          placeholder="e.g., Legal Team, Investors, etc."
          defaultValue={group.name}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`group-emails-${group.id}`}>Email Addresses</Label>
        <Textarea
          id={`group-emails-${group.id}`}
          placeholder="Enter email addresses separated by commas or new lines"
          className="min-h-[100px]"
          defaultValue={group.emails}
        />
      </div>
    </div>
  )
}
