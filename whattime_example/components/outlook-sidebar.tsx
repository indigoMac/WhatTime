"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Clock, Users, Plus, BarChart2, UserCheck, X, Video, Edit2, Trash2, Save } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface OutlookSidebarProps {
  onViewAvailability: (meetingId: string) => void
  onViewResponses: (meetingId: string) => void
  onClose?: () => void
}

export function OutlookSidebar({ onViewAvailability, onViewResponses, onClose }: OutlookSidebarProps) {
  const [activeTab, setActiveTab] = useState("create")
  const [timeRanges, setTimeRanges] = useState([
    { id: "1", date: new Date().toISOString().split("T")[0], startTime: "", endTime: "", isAllDay: false },
  ])
  const [groups, setGroups] = useState([
    { id: "1", name: "Internal Team", emails: "" },
    { id: "2", name: "Client", emails: "" },
  ])
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editingGroupName, setEditingGroupName] = useState("")

  // Mock saved groups for demonstration
  const savedGroups = [
    { id: "sg1", name: "Deal Team", members: ["john.doe@company.com", "jane.smith@company.com"] },
    { id: "sg2", name: "Legal Team", members: ["legal.counsel@company.com", "compliance@company.com"] },
    { id: "sg3", name: "Investors", members: ["investor1@fund.com", "investor2@fund.com"] },
  ]

  // Mock email suggestions for autocomplete
  const emailSuggestions = [
    "john.doe@company.com",
    "jane.smith@company.com",
    "michael.johnson@company.com",
    "sarah.williams@company.com",
    "david.brown@company.com",
    "emily.davis@company.com",
    "robert.wilson@company.com",
    "jennifer.miller@company.com",
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

  const updateTimeRange = (id: string, field: string, value: string | boolean) => {
    setTimeRanges(timeRanges.map((range) => (range.id === id ? { ...range, [field]: value } : range)))
  }

  const removeTimeRange = (id: string) => {
    if (timeRanges.length > 1) {
      setTimeRanges(timeRanges.filter((range) => range.id !== id))
    }
  }

  const addGroup = () => {
    setGroups([...groups, { id: Date.now().toString(), name: `Group ${groups.length + 1}`, emails: "" }])
  }

  const removeGroup = (id: string) => {
    if (groups.length > 1) {
      setGroups(groups.filter((group) => group.id !== id))
    }
  }

  const startEditingGroupName = (id: string, currentName: string) => {
    setEditingGroupId(id)
    setEditingGroupName(currentName)
  }

  const saveGroupName = (id: string) => {
    setGroups(groups.map((group) => (group.id === id ? { ...group, name: editingGroupName } : group)))
    setEditingGroupId(null)
  }

  const applySavedGroup = (savedGroupId: string) => {
    const savedGroup = savedGroups.find((g) => g.id === savedGroupId)
    if (savedGroup) {
      // In a real app, this would add the saved group to the current groups
      alert(`Added saved group: ${savedGroup.name} with ${savedGroup.members.length} members`)
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h1 className="text-base font-semibold">WhatTime</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b">
          <TabsList className="w-full justify-start p-0 h-auto bg-transparent">
            <TabsTrigger
              value="create"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
            >
              Create
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
            >
              Pending
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
            >
              Upcoming
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Create Tab */}
        <TabsContent value="create" className="flex-1 overflow-y-auto p-4 space-y-4 m-0 h-[calc(100%-48px)]">
          <div className="space-y-2">
            <h2 className="text-sm font-medium">Meeting Details</h2>
            <Input placeholder="Meeting Title" />

            {/* Location with integration icons */}
            <div className="relative">
              <Input placeholder="Location (optional)" className="pr-24" />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" title="Zoom">
                  <Video className="h-3.5 w-3.5 text-blue-500" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" title="Teams">
                  <div className="h-3.5 w-3.5 bg-purple-500 rounded-sm" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" title="Webex">
                  <div className="h-3.5 w-3.5 bg-green-500 rounded-full" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                </SelectContent>
              </Select>

              {/* Timezone with default to analyst's location */}
              <Select defaultValue="et">
                <SelectTrigger>
                  <SelectValue placeholder="Time Zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="et">Eastern Time (Current)</SelectItem>
                  <SelectItem value="ct">Central Time</SelectItem>
                  <SelectItem value="pt">Pacific Time</SelectItem>
                  <SelectItem value="gmt">GMT</SelectItem>
                  <SelectItem value="cet">Central European Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Enhanced proposed times with all-day option and time ranges */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium">Proposed Times</h2>
            <div className="space-y-2">
              {timeRanges.map((range) => (
                <div key={range.id} className="space-y-2 border rounded-md p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Input
                        type="date"
                        className="w-[140px]"
                        value={range.date}
                        onChange={(e) => updateTimeRange(range.id, "date", e.target.value)}
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          id={`allday-${range.id}`}
                          checked={range.isAllDay}
                          onChange={(e) => updateTimeRange(range.id, "isAllDay", e.target.checked)}
                          className="h-3 w-3"
                        />
                        <label htmlFor={`allday-${range.id}`} className="text-xs">
                          All day
                        </label>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeTimeRange(range.id)}
                      disabled={timeRanges.length === 1}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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
                      <span className="text-xs">to</span>
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
                <Plus className="h-3 w-3 mr-1" /> Add Another Time
              </Button>
            </div>
          </div>

          <Separator />

          {/* Enhanced participant groups with delete, rename */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium">Participant Groups</h2>
            <Accordion type="single" collapsible className="w-full">
              {groups.map((group) => (
                <AccordionItem key={group.id} value={group.id} className="border-b">
                  <AccordionTrigger className="py-2">
                    <div className="flex items-center justify-between w-full pr-4">
                      {editingGroupId === group.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={editingGroupName}
                            onChange={(e) => setEditingGroupName(e.target.value)}
                            className="h-6 text-xs w-[120px]"
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={(e) => {
                              e.stopPropagation()
                              saveGroupName(group.id)
                            }}
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm">{group.name}</span>
                      )}
                      <div className="flex items-center gap-1">
                        {editingGroupId !== group.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={(e) => {
                              e.stopPropagation()
                              startEditingGroupName(group.id, group.name)
                            }}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeGroup(group.id)
                          }}
                          disabled={groups.length === 1}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {/* Email input with autocomplete */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="relative">
                          <Input
                            placeholder="Enter email addresses"
                            className="text-xs pr-6"
                            value={group.emails}
                            onChange={(e) => {
                              const updatedGroups = groups.map((g) =>
                                g.id === group.id ? { ...g, emails: e.target.value } : g,
                              )
                              setGroups(updatedGroups)
                            }}
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <div className="max-h-[200px] overflow-y-auto">
                          {emailSuggestions.map((email) => (
                            <div
                              key={email}
                              className="px-2 py-1.5 text-xs hover:bg-muted cursor-pointer"
                              onClick={() => {
                                const updatedGroups = groups.map((g) => {
                                  if (g.id === group.id) {
                                    const currentEmails = g.emails
                                      .split(",")
                                      .map((e) => e.trim())
                                      .filter((e) => e)
                                    if (!currentEmails.includes(email)) {
                                      const newEmails = [...currentEmails, email].join(", ")
                                      return { ...g, emails: newEmails }
                                    }
                                  }
                                  return g
                                })
                                setGroups(updatedGroups)
                              }}
                            >
                              {email}
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <Button variant="outline" size="sm" className="w-full" onClick={addGroup}>
              <Plus className="h-3 w-3 mr-1" /> Add Group
            </Button>

            {/* Saved Groups dropdown */}
            <div className="pt-2">
              <Select onValueChange={applySavedGroup}>
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Add from saved groups..." />
                </SelectTrigger>
                <SelectContent>
                  {savedGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name} ({group.members.length} members)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-4">
            <Button className="w-full">Send Meeting Request</Button>
          </div>
        </TabsContent>

        {/* Pending Tab */}
        <TabsContent value="pending" className="flex-1 overflow-y-auto p-0 m-0 h-[calc(100%-48px)]">
          <div className="p-4 space-y-4">
            <Input placeholder="Search requests..." className="text-sm" />

            <div className="space-y-3">
              {/* Pending Meeting Request */}
              <div className="border rounded-md p-3 space-y-2">
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
              <div className="border rounded-md p-3 space-y-2">
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
        </TabsContent>

        {/* Upcoming Tab */}
        <TabsContent value="upcoming" className="flex-1 overflow-y-auto p-0 m-0 h-[calc(100%-48px)]">
          <div className="p-4 space-y-4">
            <Input placeholder="Search meetings..." className="text-sm" />

            <div className="space-y-3">
              {/* Upcoming Meeting */}
              <div className="border rounded-md p-3 space-y-2">
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
              <div className="border rounded-md p-3 space-y-2">
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
