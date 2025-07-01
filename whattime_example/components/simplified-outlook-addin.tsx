"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Clock,
  Users,
  Plus,
  BarChart2,
  UserCheck,
  X,
  Video,
  Calendar,
  ChevronLeft,
  CheckCircle2,
  Search,
  Send,
  Trash2,
  Save,
  Star,
  Mail,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EmailTemplatePreview } from "@/components/email-template-preview"

export function SimplifiedOutlookAddin() {
  const [currentView, setCurrentView] = useState<
    "create" | "pending" | "upcoming" | "availability" | "responses" | "propose-new-times"
  >("create")
  const [currentMeetingId, setCurrentMeetingId] = useState<string | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)

  const handleViewAvailability = (meetingId: string) => {
    setCurrentMeetingId(meetingId)
    setCurrentView("availability")
  }

  const handleViewResponses = (meetingId: string) => {
    setCurrentMeetingId(meetingId)
    setCurrentView("responses")
  }

  const handleBackToMain = (view: "create" | "pending" | "upcoming") => {
    setCurrentView(view)
    setCurrentMeetingId(null)
  }

  const handleConfirmTime = (timeSlot: string) => {
    alert(`Meeting time confirmed: ${timeSlot}`)
    setCurrentView("pending")
  }

  const handleProposeNewTimes = () => {
    setCurrentView("propose-new-times")
  }

  const handleSaveNewTimes = () => {
    alert("New time proposals have been sent to participants")
    setCurrentView("pending")
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col p-3 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h1 className="text-base font-semibold">WhatTime</h1>
          </div>
          {currentView === "availability" || currentView === "responses" || currentView === "propose-new-times" ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() =>
                currentView === "propose-new-times" ? setCurrentView("availability") : handleBackToMain("pending")
              }
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          ) : (
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation buttons below the logo */}
        {!(currentView === "availability" || currentView === "responses" || currentView === "propose-new-times") && (
          <div className="flex gap-2 mt-2">
            <Button
              variant={currentView === "create" ? "default" : "ghost"}
              size="sm"
              className="h-8 px-3 flex-1"
              onClick={() => setCurrentView("create")}
            >
              Create
            </Button>
            <Button
              variant={currentView === "pending" ? "default" : "ghost"}
              size="sm"
              className="h-8 px-3 flex-1"
              onClick={() => setCurrentView("pending")}
            >
              Pending
            </Button>
            <Button
              variant={currentView === "upcoming" ? "default" : "ghost"}
              size="sm"
              className="h-8 px-3 flex-1"
              onClick={() => setCurrentView("upcoming")}
            >
              Upcoming
            </Button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {currentView === "create" && <CreateMeetingView onSuccess={() => setCurrentView("pending")} />}
        {currentView === "pending" && (
          <PendingMeetingsView onViewAvailability={handleViewAvailability} onViewResponses={handleViewResponses} />
        )}
        {currentView === "upcoming" && <UpcomingMeetingsView />}
        {currentView === "availability" && (
          <AvailabilityView
            meetingId={currentMeetingId || ""}
            onConfirm={handleConfirmTime}
            onProposeNewTimes={handleProposeNewTimes}
          />
        )}
        {currentView === "responses" && <ResponsesView meetingId={currentMeetingId || ""} />}
        {currentView === "propose-new-times" && <ProposeNewTimesView onSave={handleSaveNewTimes} />}
      </div>
    </div>
  )
}

function CreateMeetingView({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [meetingTitle, setMeetingTitle] = useState("")
  const [location, setLocation] = useState("")
  const [duration, setDuration] = useState<string>("")
  const [timezone, setTimezone] = useState("et")
  const formRef = useRef<HTMLFormElement>(null)
  const [showEmailPreview, setShowEmailPreview] = useState(false)

  const [timeRanges, setTimeRanges] = useState([
    { id: "1", date: new Date().toISOString().split("T")[0], startTime: "", endTime: "", isAllDay: false },
  ])

  const [groups, setGroups] = useState([
    {
      id: "1",
      name: "Internal Team",
      participants: [
        { id: "p1", email: "john.doe@company.com", isKey: false },
        { id: "p2", email: "jane.smith@company.com", isKey: true },
      ],
    },
    {
      id: "2",
      name: "Client",
      participants: [{ id: "p3", email: "client@example.com", isKey: true }],
    },
  ])

  // Saved groups for dropdown
  const savedGroups = [
    {
      id: "sg1",
      name: "Project Gold - Client",
      participants: [
        { id: "sg1p1", email: "client1@example.com", isKey: false },
        { id: "sg1p2", email: "client2@example.com", isKey: true },
      ],
    },
    {
      id: "sg2",
      name: "Legal Team",
      participants: [
        { id: "sg2p1", email: "legal1@company.com", isKey: false },
        { id: "sg2p2", email: "legal2@company.com", isKey: false },
      ],
    },
    {
      id: "sg3",
      name: "Deal Team",
      participants: [
        { id: "sg3p1", email: "deal1@company.com", isKey: true },
        { id: "sg3p2", email: "deal2@company.com", isKey: false },
      ],
    },
  ]

  // Full list of timezones
  const timezones = [
    { value: "et", label: "GMT -5 (ET)" },
    { value: "ct", label: "GMT -6 (CT)" },
    { value: "mt", label: "GMT -7 (MT)" },
    { value: "pt", label: "GMT -8 (PT)" },
    { value: "gmt", label: "GMT +0 (GMT)" },
    { value: "bst", label: "GMT +1 (BST)" },
    { value: "cet", label: "GMT +1 (CET)" },
    { value: "eet", label: "GMT +2 (EET)" },
    { value: "msk", label: "GMT +3 (MSK)" },
    { value: "gst", label: "GMT +4 (GST)" },
    { value: "ist", label: "GMT +5:30 (IST)" },
    { value: "cst_asia", label: "GMT +8 (CST)" },
    { value: "jst", label: "GMT +9 (JST)" },
    { value: "aest", label: "GMT +10 (AEST)" },
    { value: "nzst", label: "GMT +12 (NZST)" },
  ]

  const addTimeRange = () => {
    setTimeRanges([
      ...timeRanges,
      {
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        startTime: "",
        endTime: "",
        isAllDay: false,
      },
    ])
  }

  const removeTimeRange = (id: string) => {
    if (timeRanges.length > 1) {
      setTimeRanges(timeRanges.filter((range) => range.id !== id))
    }
  }

  const updateTimeRange = (id: string, field: string, value: string | boolean) => {
    setTimeRanges(timeRanges.map((range) => (range.id === id ? { ...range, [field]: value } : range)))
  }

  const addGroup = () => {
    setGroups([...groups, { id: Date.now().toString(), name: `Group ${groups.length + 1}`, participants: [] }])
  }

  const removeGroup = (id: string) => {
    if (groups.length > 1) {
      setGroups(groups.filter((group) => group.id !== id))
    }
  }

  const updateGroupName = (id: string, name: string) => {
    setGroups(groups.map((group) => (group.id === id ? { ...group, name } : group)))
  }

  const addParticipant = (groupId: string) => {
    setGroups(
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              participants: [...group.participants, { id: `p${Date.now()}`, email: "", isKey: false }],
            }
          : group,
      ),
    )
  }

  const removeParticipant = (groupId: string, participantId: string) => {
    setGroups(
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              participants: group.participants.filter((p) => p.id !== participantId),
            }
          : group,
      ),
    )
  }

  const updateParticipant = (groupId: string, participantId: string, email: string) => {
    setGroups(
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              participants: group.participants.map((p) => (p.id === participantId ? { ...p, email } : p)),
            }
          : group,
      ),
    )
  }

  const toggleKeyParticipant = (groupId: string, participantId: string) => {
    setGroups(
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              participants: group.participants.map((p) => (p.id === participantId ? { ...p, isKey: !p.isKey } : p)),
            }
          : group,
      ),
    )
  }

  const addSavedGroup = (savedGroupId: string) => {
    const group = savedGroups.find((g) => g.id === savedGroupId)
    if (group) {
      setGroups([
        ...groups,
        {
          id: Date.now().toString(),
          name: group.name,
          participants: group.participants.map((p) => ({ ...p, id: `p${Date.now()}-${p.id}` })),
        },
      ])
    }
  }

  const handlePreviewEmail = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent form submission

    // Validate form first
    if (!meetingTitle.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a meeting title",
        variant: "destructive",
      })
      return
    }

    if (!duration) {
      toast({
        title: "Missing information",
        description: "Please select a meeting duration",
        variant: "destructive",
      })
      return
    }

    // Show the email preview
    setShowEmailPreview(true)
  }

  const handleSubmitMeetingRequest = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!meetingTitle.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a meeting title",
        variant: "destructive",
      })
      return
    }

    if (!duration) {
      toast({
        title: "Missing information",
        description: "Please select a meeting duration",
        variant: "destructive",
      })
      return
    }

    // Validate time ranges
    const invalidTimeRanges = timeRanges.filter((range) => {
      if (range.isAllDay) return false // All day is valid
      return !range.startTime || !range.endTime
    })

    if (invalidTimeRanges.length > 0) {
      toast({
        title: "Missing information",
        description: "Please complete all time range fields or remove them",
        variant: "destructive",
      })
      return
    }

    // Validate participant groups
    const emptyGroups = groups.filter(
      (group) => group.participants.length === 0 || group.participants.some((p) => !p.email.trim()),
    )

    if (emptyGroups.length > 0) {
      toast({
        title: "Missing information",
        description: "Please add participants to all groups or remove empty groups",
        variant: "destructive",
      })
      return
    }

    // Simulate API call
    setIsSubmitting(true)

    // Prepare meeting data
    const meetingData = {
      title: meetingTitle,
      location,
      duration: Number.parseInt(duration),
      timezone,
      timeRanges,
      participantGroups: groups,
    }

    // Generate a unique meeting ID
    const meetingId = `meeting-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    // Simulate API delay
    setTimeout(() => {
      console.log("Meeting request data:", meetingData)

      // In a real implementation, this would:
      // 1. Generate an HTML email with interactive availability selection
      // 2. Send it to all participants across different email platforms

      // Simulate sending HTML email to participants
      const totalParticipants = getTotalParticipantsCount()
      const participantEmails = groups.flatMap((group) => group.participants.map((p) => p.email)).join(", ")

      console.log(`Sending HTML email to: ${participantEmails}`)
      console.log(`Email contains ${timeRanges.length} time options for selection`)

      // Show success message
      toast({
        title: "Meeting request sent",
        description: `Your meeting request for "${meetingTitle}" has been sent to ${totalParticipants} participants.`,
      })

      // Reset form or redirect
      setIsSubmitting(false)

      // Reset form
      if (formRef.current) {
        formRef.current.reset()
      }

      // Switch to pending view
      onSuccess()
    }, 1500)
  }

  // Helper function to count total participants
  const getTotalParticipantsCount = () => {
    return groups.reduce((total, group) => total + group.participants.length, 0)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmitMeetingRequest} className="p-4 space-y-5">
      <div className="space-y-3">
        <h2 className="text-sm font-medium">Meeting Details</h2>
        <Input
          placeholder="Meeting Title"
          value={meetingTitle}
          onChange={(e) => setMeetingTitle(e.target.value)}
          required
        />

        {/* Location with integration icons */}
        <div className="relative">
          <Input
            placeholder="Location (optional)"
            className="pr-24"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              title="Zoom"
              onClick={() => setLocation("Zoom Meeting")}
            >
              <Video className="h-3.5 w-3.5 text-blue-500" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              title="Teams"
              onClick={() => setLocation("Microsoft Teams Meeting")}
            >
              <div className="h-3.5 w-3.5 bg-purple-500 rounded-sm" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              title="Webex"
              onClick={() => setLocation("Webex Meeting")}
            >
              <div className="h-3.5 w-3.5 bg-green-500 rounded-full" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Updated duration options */}
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger>
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
              <SelectItem value="90">90 minutes</SelectItem>
              <SelectItem value="120">120 minutes</SelectItem>
            </SelectContent>
          </Select>

          {/* Extended timezone list */}
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger>
              <SelectValue placeholder="Time Zone" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {timezones.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Renamed to Proposed Time Blocks */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium">Proposed Time Blocks</h2>
        <div className="space-y-3">
          {timeRanges.map((range) => (
            <div key={range.id} className="space-y-2 border rounded-md p-3">
              <div className="flex items-center justify-between">
                {/* Increased date input width */}
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="date"
                    className="w-[180px]"
                    value={range.date}
                    onChange={(e) => updateTimeRange(range.id, "date", e.target.value)}
                  />
                  {/* Centered all day checkbox and text */}
                  <div className="flex items-center justify-center flex-1">
                    <input
                      type="checkbox"
                      id={`allday-${range.id}`}
                      checked={range.isAllDay}
                      onChange={(e) => updateTimeRange(range.id, "isAllDay", e.target.checked)}
                      className="h-4 w-4 mr-2"
                    />
                    <label htmlFor={`allday-${range.id}`} className="text-sm">
                      All day
                    </label>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeTimeRange(range.id)}
                  disabled={timeRanges.length === 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {!range.isAllDay && (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    className="flex-1"
                    value={range.startTime}
                    onChange={(e) => updateTimeRange(range.id, "startTime", e.target.value)}
                  />
                  <span className="text-sm">to</span>
                  <Input
                    type="time"
                    className="flex-1"
                    value={range.endTime}
                    onChange={(e) => updateTimeRange(range.id, "endTime", e.target.value)}
                  />
                </div>
              )}
            </div>
          ))}

          <Button variant="outline" size="sm" className="w-full" onClick={addTimeRange}>
            <Plus className="h-3 w-3 mr-1" /> Add Another Time Block
          </Button>
        </div>
      </div>

      <Separator />

      {/* Enhanced participant groups with individual email inputs and key participant marking */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Participant Groups</h2>
        </div>

        {/* Saved groups dropdown moved below the title */}
        <Select onValueChange={addSavedGroup}>
          <SelectTrigger className="w-full h-8 text-xs">
            <SelectValue placeholder="Add saved group..." />
          </SelectTrigger>
          <SelectContent>
            {savedGroups.map((group) => (
              <SelectItem key={group.id} value={group.id} className="text-xs">
                {group.name} ({group.participants.length} participants)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="space-y-3">
          {groups.map((group) => (
            <div key={group.id} className="border rounded-md p-3 space-y-3">
              <div className="flex items-center justify-between">
                <Input
                  placeholder="Group Name"
                  value={group.name}
                  onChange={(e) => updateGroupName(group.id, e.target.value)}
                  className="w-[200px]"
                />
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Save as group">
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeGroup(group.id)}
                    disabled={groups.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Individual email inputs with key participant marking */}
              <div className="space-y-2">
                {group.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        placeholder="Email address"
                        value={participant.email}
                        onChange={(e) => updateParticipant(group.id, participant.id, e.target.value)}
                        className="pl-8"
                      />
                      <Mail className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleKeyParticipant(group.id, participant.id)}
                      title={participant.isKey ? "Remove key participant" : "Mark as key participant"}
                    >
                      <Star
                        className={`h-4 w-4 ${participant.isKey ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeParticipant(group.id, participant.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full" onClick={() => addParticipant(group.id)}>
                  <Plus className="h-3 w-3 mr-1" /> Add Participant
                </Button>
              </div>
            </div>
          ))}

          <Button variant="outline" size="sm" className="w-full" onClick={addGroup}>
            <Plus className="h-3 w-3 mr-1" /> Add Group
          </Button>
        </div>
      </div>

      {/* Email Preview Modal */}
      {showEmailPreview && (
        <EmailTemplatePreview
          meetingTitle={meetingTitle}
          location={location}
          duration={Number.parseInt(duration) || 0}
          timezone={timezone}
          timeOptions={timeRanges}
          onClose={() => setShowEmailPreview(false)}
        />
      )}

      <div className="pt-4 flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={handlePreviewEmail}>
          Preview Email
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Meeting Request"
          )}
        </Button>
      </div>
    </form>
  )
}

function PendingMeetingsView({
  onViewAvailability,
  onViewResponses,
}: {
  onViewAvailability: (id: string) => void
  onViewResponses: (id: string) => void
}) {
  return (
    <div className="p-4 space-y-4">
      <Input placeholder="Search requests..." className="text-sm" />

      <div className="space-y-4">
        {/* Pending Meeting Request */}
        <div className="border rounded-md p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-sm">Q2 Earnings Call</h3>
              <p className="text-xs text-muted-foreground">Due by Jun 13</p>
            </div>
            <Badge variant="outline">65% Responded</Badge>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">4 groups</span>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Response Rate</span>
              <span>65%</span>
            </div>
            <Progress value={65} className="h-1" />
          </div>

          <div className="flex justify-between pt-2">
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => onViewResponses("q2-earnings-call")}
              >
                <UserCheck className="h-3 w-3 mr-1" />
                Responses
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => onViewAvailability("q2-earnings-call")}
              >
                <BarChart2 className="h-3 w-3 mr-1" />
                Availability
              </Button>
            </div>
            <Button size="sm" className="text-xs h-7 px-2">
              Confirm
            </Button>
          </div>
        </div>

        {/* Another Pending Meeting Request */}
        <div className="border rounded-md p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-sm">Due Diligence Call</h3>
              <p className="text-xs text-muted-foreground">Due by Jun 12</p>
            </div>
            <Badge variant="outline">42% Responded</Badge>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">4 groups</span>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Response Rate</span>
              <span>42%</span>
            </div>
            <Progress value={42} className="h-1" />
          </div>

          <div className="flex justify-between pt-2">
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => onViewResponses("due-diligence-call")}
              >
                <UserCheck className="h-3 w-3 mr-1" />
                Responses
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => onViewAvailability("due-diligence-call")}
              >
                <BarChart2 className="h-3 w-3 mr-1" />
                Availability
              </Button>
            </div>
            <Button size="sm" className="text-xs h-7 px-2">
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function UpcomingMeetingsView() {
  return (
    <div className="p-4 space-y-4">
      <Input placeholder="Search meetings..." className="text-sm" />

      <div className="space-y-4">
        {/* Upcoming Meeting */}
        <div className="border rounded-md p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-sm">Board Meeting Prep</h3>
              <p className="text-xs text-muted-foreground">Jun 12, 2:00 PM EDT</p>
            </div>
            <Badge>Confirmed</Badge>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">8 attendees</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">60 minutes</span>
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" className="text-xs h-7 px-2">
              Join Meeting
            </Button>
          </div>
        </div>

        {/* Another Upcoming Meeting */}
        <div className="border rounded-md p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-sm">Client Onboarding</h3>
              <p className="text-xs text-muted-foreground">Jun 13, 11:00 AM EDT</p>
            </div>
            <Badge>Confirmed</Badge>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">12 attendees</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">45 minutes</span>
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" className="text-xs h-7 px-2">
              Join Meeting
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AvailabilityView({
  meetingId,
  onConfirm,
  onProposeNewTimes,
}: {
  meetingId: string
  onConfirm: (timeSlot: string) => void
  onProposeNewTimes: () => void
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [expandedTimeSlot, setExpandedTimeSlot] = useState<string | null>(null)

  // Mock data for the meeting
  const meetingData = {
    title: "Q2 Earnings Call",
    dates: ["2025-06-15", "2025-06-16", "2025-06-17"],
    timeSlots: [
      {
        date: "2025-06-16",
        time: "11:00",
        available: 90,
        unavailable: 5,
        noResponse: 5,
        unavailableParticipants: [{ name: "David Brown", email: "d.brown@company.com", isKey: false }],
      },
      {
        date: "2025-06-15",
        time: "10:00",
        available: 85,
        unavailable: 10,
        noResponse: 5,
        unavailableParticipants: [
          { name: "Sarah Johnson", email: "sarah.j@investor.com", isKey: false },
          { name: "Michael Chen", email: "m.chen@investor.com", isKey: false },
        ],
      },
      {
        date: "2025-06-17",
        time: "09:00",
        available: 85,
        unavailable: 10,
        noResponse: 5,
        unavailableParticipants: [
          { name: "Lisa Wong", email: "l.wong@investor.com", isKey: false },
          { name: "Emma Davis", email: "e.davis@company.com", isKey: true },
        ],
      },
      {
        date: "2025-06-15",
        time: "14:00",
        available: 80,
        unavailable: 15,
        noResponse: 5,
        unavailableParticipants: [
          { name: "John Smith", email: "john.smith@investor.com", isKey: true },
          { name: "Robert Wilson", email: "r.wilson@company.com", isKey: false },
          { name: "Jennifer Lee", email: "j.lee@company.com", isKey: false },
        ],
      },
      {
        date: "2025-06-16",
        time: "09:00",
        available: 75,
        unavailable: 20,
        noResponse: 5,
        unavailableParticipants: [
          { name: "James Taylor", email: "j.taylor@company.com", isKey: false },
          { name: "Lisa Wang", email: "l.wang@company.com", isKey: false },
          { name: "Mark Johnson", email: "m.johnson@company.com", isKey: false },
          { name: "Thomas Miller", email: "t.miller@company.com", isKey: false },
        ],
      },
      {
        date: "2025-06-17",
        time: "15:00",
        available: 75,
        unavailable: 20,
        noResponse: 5,
        unavailableParticipants: [
          { name: "Patricia Garcia", email: "p.garcia@company.com", isKey: false },
          { name: "Richard Martinez", email: "r.martinez@company.com", isKey: false },
          { name: "Elizabeth Wilson", email: "e.wilson@company.com", isKey: false },
          { name: "David Brown", email: "d.brown@company.com", isKey: false },
        ],
      },
      {
        date: "2025-06-15",
        time: "11:00",
        available: 70,
        unavailable: 25,
        noResponse: 5,
        unavailableParticipants: [
          { name: "John Smith", email: "john.smith@investor.com", isKey: true },
          { name: "Sarah Johnson", email: "sarah.j@investor.com", isKey: false },
          { name: "Michael Chen", email: "m.chen@investor.com", isKey: false },
          { name: "Lisa Wong", email: "l.wong@investor.com", isKey: false },
          { name: "Emma Davis", email: "e.davis@company.com", isKey: true },
        ],
      },
      {
        date: "2025-06-16",
        time: "14:00",
        available: 70,
        unavailable: 25,
        noResponse: 5,
        unavailableParticipants: [
          { name: "Robert Wilson", email: "r.wilson@company.com", isKey: false },
          { name: "James Taylor", email: "j.taylor@company.com", isKey: false },
          { name: "Jennifer Lee", email: "j.lee@company.com", isKey: false },
          { name: "Lisa Wang", email: "l.wang@company.com", isKey: false },
          { name: "Mark Johnson", email: "m.johnson@company.com", isKey: false },
        ],
      },
      {
        date: "2025-06-17",
        time: "13:00",
        available: 60,
        unavailable: 35,
        noResponse: 5,
        unavailableParticipants: [
          { name: "Thomas Miller", email: "t.miller@company.com", isKey: false },
          { name: "Patricia Garcia", email: "p.garcia@company.com", isKey: false },
          { name: "Richard Martinez", email: "r.martinez@company.com", isKey: false },
          { name: "Elizabeth Wilson", email: "e.wilson@company.com", isKey: false },
          { name: "David Brown", email: "d.brown@company.com", isKey: false },
          { name: "John Smith", email: "john.smith@investor.com", isKey: true },
          { name: "Sarah Johnson", email: "sarah.j@investor.com", isKey: false },
        ],
      },
    ],
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const getAvailabilityColor = (percentage: number) => {
    if (percentage >= 75) return "bg-green-500"
    if (percentage >= 50) return "bg-yellow-400"
    if (percentage >= 25) return "bg-amber-500"
    return "bg-red-500"
  }

  const handleConfirm = () => {
    if (selectedTimeSlot) {
      const slot = meetingData.timeSlots.find((s) => `${s.date} ${formatTime(s.time)}` === selectedTimeSlot)
      if (slot) {
        onConfirm(`${formatDate(slot.date)} at ${formatTime(slot.time)}`)
      }
    }
  }

  const toggleExpandTimeSlot = (slotId: string) => {
    if (expandedTimeSlot === slotId) {
      setExpandedTimeSlot(null)
    } else {
      setExpandedTimeSlot(slotId)
    }
  }

  const sendFollowUp = (emails: string[]) => {
    alert(`Follow-up sent to: ${emails.join(", ")}`)
  }

  // Filter time slots by selected date
  const filteredTimeSlots = selectedDate
    ? meetingData.timeSlots.filter((slot) => slot.date === selectedDate)
    : meetingData.timeSlots

  // Sort time slots by availability percentage (highest first)
  const sortedTimeSlots = [...filteredTimeSlots].sort((a, b) => b.available - a.available)

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-sm font-medium">{meetingData.title} - Availability</h2>
        <p className="text-xs text-muted-foreground">Select the best time for all participants</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium">Filter by Date</h3>
        </div>

        <Select
          value={selectedDate || "all"}
          onValueChange={(value) => setSelectedDate(value === "all" ? null : value)}
        >
          <SelectTrigger className="h-8 text-xs">
            <Calendar className="h-3.5 w-3.5 mr-2" />
            <SelectValue placeholder="All dates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">
              All dates
            </SelectItem>
            {meetingData.dates.map((date) => (
              <SelectItem key={date} value={date} className="text-xs">
                {formatDate(date)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-medium">Available Time Slots (Sorted by Availability)</h3>
        <div className="space-y-2">
          {sortedTimeSlots.map((slot) => {
            const timeSlotId = `${slot.date} ${formatTime(slot.time)}`
            const isSelected = selectedTimeSlot === timeSlotId
            const isExpanded = expandedTimeSlot === timeSlotId
            const hasKeyParticipantUnavailable = slot.unavailableParticipants.some((p) => p.isKey)

            return (
              <div
                key={timeSlotId}
                className={`rounded border ${
                  isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                } ${hasKeyParticipantUnavailable ? "border-yellow-500" : ""}`}
              >
                <div className="p-3 cursor-pointer" onClick={() => setSelectedTimeSlot(timeSlotId)}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {formatDate(slot.date)}, {formatTime(slot.time)}
                      </span>
                      {hasKeyParticipantUnavailable && (
                        <div className="flex items-center text-yellow-500 text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Key participant unavailable
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium">{slot.available}% Available</span>
                  </div>

                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getAvailabilityColor(slot.available)}`}
                      style={{ width: `${slot.available}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span>{slot.available}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <X className="h-3 w-3 text-red-500" />
                      <span>{slot.unavailable}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span>{slot.noResponse}%</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 px-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleExpandTimeSlot(timeSlotId)
                      }}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3 w-3 mr-1" /> Hide
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" /> Show unavailable
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded view showing unavailable participants */}
                {isExpanded && (
                  <div className="border-t p-3 bg-muted/20">
                    <div className="text-xs font-medium mb-2">Unavailable Participants:</div>
                    <div className="space-y-2">
                      {slot.unavailableParticipants.map((participant, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {participant.isKey && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                            <div>
                              <div className="text-xs">{participant.name}</div>
                              <div className="text-[10px] text-muted-foreground">{participant.email}</div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => sendFollowUp([participant.email])}
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            Follow up
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-7 mt-2"
                        onClick={() => sendFollowUp(slot.unavailableParticipants.map((p) => p.email))}
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Follow up with all
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="pt-4 space-y-2">
        {selectedTimeSlot ? (
          <div className="space-y-3">
            <div className="text-sm">
              <span className="font-medium">Selected:</span> {selectedTimeSlot}
            </div>
            <Button className="w-full" onClick={onProposeNewTimes}>
              Propose New Times
            </Button>
            <Button className="w-full" onClick={handleConfirm}>
              Confirm This Time
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-center text-muted-foreground">Select a time slot to continue</div>
            <Button className="w-full" onClick={onProposeNewTimes}>
              Propose New Times
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function ProposeNewTimesView({ onSave }: { onSave: () => void }) {
  const [timeRanges, setTimeRanges] = useState([
    { id: "1", date: new Date().toISOString().split("T")[0], startTime: "", endTime: "", isAllDay: false },
  ])

  const addTimeRange = () => {
    setTimeRanges([
      ...timeRanges,
      {
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        startTime: "",
        endTime: "",
        isAllDay: false,
      },
    ])
  }

  const removeTimeRange = (id: string) => {
    if (timeRanges.length > 1) {
      setTimeRanges(timeRanges.filter((range) => range.id !== id))
    }
  }

  const updateTimeRange = (id: string, field: string, value: string | boolean) => {
    setTimeRanges(timeRanges.map((range) => (range.id === id ? { ...range, [field]: value } : range)))
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-sm font-medium">Propose New Time Blocks</h2>
        <p className="text-xs text-muted-foreground">Add new time options to send to participants</p>
      </div>

      <div className="space-y-3">
        {timeRanges.map((range) => (
          <div key={range.id} className="space-y-2 border rounded-md p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <Input
                  type="date"
                  className="w-[180px]"
                  value={range.date}
                  onChange={(e) => updateTimeRange(range.id, "date", e.target.value)}
                />
                <div className="flex items-center justify-center flex-1">
                  <input
                    type="checkbox"
                    id={`allday-${range.id}`}
                    checked={range.isAllDay}
                    onChange={(e) => updateTimeRange(range.id, "isAllDay", e.target.checked)}
                    className="h-4 w-4 mr-2"
                  />
                  <label htmlFor={`allday-${range.id}`} className="text-sm">
                    All day
                  </label>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => removeTimeRange(range.id)}
                disabled={timeRanges.length === 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {!range.isAllDay && (
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  className="flex-1"
                  value={range.startTime}
                  onChange={(e) => updateTimeRange(range.id, "startTime", e.target.value)}
                />
                <span className="text-sm">to</span>
                <Input
                  type="time"
                  className="flex-1"
                  value={range.endTime}
                  onChange={(e) => updateTimeRange(range.id, "endTime", e.target.value)}
                />
              </div>
            )}
          </div>
        ))}

        <Button variant="outline" size="sm" className="w-full" onClick={addTimeRange}>
          <Plus className="h-3 w-3 mr-1" /> Add Another Time Block
        </Button>
      </div>

      <div className="pt-4">
        <Button className="w-full" onClick={onSave}>
          Send New Time Proposals
        </Button>
      </div>
    </div>
  )
}

function ResponsesView({ meetingId }: { meetingId: string }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [activeGroup, setActiveGroup] = useState<string | null>(null)

  // Mock data for the meeting
  const meetingData = {
    title: "Q2 Earnings Call",
    responseRate: 78,
    dueBy: "Jun 13, 2025",
    groups: [
      {
        id: "1",
        name: "Investors",
        responseRate: 90,
        participants: [
          { id: "1", name: "John Smith", email: "john.smith@investor.com", status: "available", isKey: true },
          { id: "2", name: "Sarah Johnson", email: "sarah.j@investor.com", status: "available", isKey: false },
          { id: "3", name: "Michael Chen", email: "m.chen@investor.com", status: "available", isKey: false },
          { id: "4", name: "Lisa Wong", email: "l.wong@company.com", status: "no-response", isKey: false },
        ],
      },
      {
        id: "2",
        name: "Executive Team",
        responseRate: 100,
        participants: [
          { id: "5", name: "Emma Davis", email: "e.davis@company.com", status: "available", isKey: true },
          { id: "6", name: "Robert Wilson", email: "r.wilson@company.com", status: "available", isKey: false },
          { id: "7", name: "James Taylor", email: "j.taylor@company.com", status: "unavailable", isKey: false },
        ],
      },
      {
        id: "3",
        name: "Finance Team",
        responseRate: 75,
        participants: [
          { id: "8", name: "Jennifer Lee", email: "j.lee@company.com", status: "available", isKey: false },
          { id: "9", name: "David Brown", email: "d.brown@company.com", status: "unavailable", isKey: false },
          { id: "10", name: "Lisa Wang", email: "l.wang@company.com", status: "no-response", isKey: false },
          { id: "11", name: "Mark Johnson", email: "m.johnson@company.com", status: "no-response", isKey: false },
        ],
      },
    ],
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle2 className="h-3 w-3 text-green-500" />
      case "unavailable":
        return <X className="h-3 w-3 text-red-500" />
      default:
        return <Clock className="h-3 w-3 text-gray-400" />
    }
  }

  const toggleParticipantSelection = (id: string) => {
    if (selectedParticipants.includes(id)) {
      setSelectedParticipants(selectedParticipants.filter((pid) => pid !== id))
    } else {
      setSelectedParticipants([...selectedParticipants, id])
    }
  }

  const selectAllNonResponders = () => {
    const nonResponders = meetingData.groups
      .flatMap((group) => group.participants)
      .filter((p) => p.status === "no-response")
      .map((p) => p.id)
    setSelectedParticipants(nonResponders)
  }

  const clearSelection = () => {
    setSelectedParticipants([])
  }

  const sendReminders = () => {
    // In a real app, this would send reminders to selected participants
    alert(`Reminders sent to ${selectedParticipants.length} participants`)
    setSelectedParticipants([])
  }

  // Filter participants based on search query
  const filteredGroups = meetingData.groups.map((group) => ({
    ...group,
    participants: group.participants.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  }))

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-sm font-medium">{meetingData.title} - Participant Responses</h2>
        <div className="flex items-center justify-between mt-1">
          <div className="text-xs">
            <span className="font-medium">Response Rate:</span> {meetingData.responseRate}%
          </div>
          <div className="text-xs">
            <span className="font-medium">Due By:</span> {meetingData.dueBy}
          </div>
        </div>
        <Progress value={meetingData.responseRate} className="h-1.5 mt-1" />
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search participants..."
          className="pl-8 h-8 text-xs"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium">Groups</h3>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={selectAllNonResponders}>
              Select Non-Responders
            </Button>
            {selectedParticipants.length > 0 && (
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clearSelection}>
                Clear
              </Button>
            )}
          </div>
        </div>

        {filteredGroups.map((group) => (
          <div key={group.id} className="border rounded-md overflow-hidden">
            <div
              className="flex items-center justify-between p-2 bg-muted/50 cursor-pointer"
              onClick={() => setActiveGroup(activeGroup === group.id ? null : group.id)}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{group.name}</span>
                <Badge variant="outline" className="text-[10px] h-4">
                  {group.responseRate}%
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">{group.participants.length} participants</span>
            </div>

            {activeGroup === group.id && (
              <div className="p-2 space-y-1">
                {group.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-1.5 rounded hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3"
                        checked={selectedParticipants.includes(participant.id)}
                        onChange={() => toggleParticipantSelection(participant.id)}
                      />
                      <div className="text-xs flex items-center gap-1">
                        {participant.isKey && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                        <div>
                          <div>{participant.name}</div>
                          <div className="text-[10px] text-muted-foreground">{participant.email}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">{getStatusIcon(participant.status)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs">
            <span className="font-medium">{selectedParticipants.length}</span> participants selected
          </div>
        </div>
        <Button className="w-full" disabled={selectedParticipants.length === 0} onClick={sendReminders}>
          <Send className="h-3.5 w-3.5 mr-1.5" />
          Send Reminders
        </Button>
      </div>
    </div>
  )
}
