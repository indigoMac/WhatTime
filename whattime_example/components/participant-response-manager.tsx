"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, X, Clock, ChevronLeft, Search, Send } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface ParticipantResponseManagerProps {
  meetingId: string
  onBack: () => void
}

export function ParticipantResponseManager({ meetingId, onBack }: ParticipantResponseManagerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])

  // Mock data for the meeting
  const meetingData = {
    title: "Q2 Earnings Call",
    responseRate: 78,
    dueBy: "Jun 13, 2025",
    groups: [
      {
        name: "Investors",
        responseRate: 90,
        participants: [
          { id: "1", name: "John Smith", email: "john.smith@investor.com", status: "available" },
          { id: "2", name: "Sarah Johnson", email: "sarah.j@investor.com", status: "available" },
          { id: "3", name: "Michael Chen", email: "m.chen@investor.com", status: "available" },
          { id: "4", name: "Lisa Wong", email: "l.wong@investor.com", status: "no-response" },
        ],
      },
      {
        name: "Executive Team",
        responseRate: 100,
        participants: [
          { id: "5", name: "Emma Davis", email: "e.davis@company.com", status: "available" },
          { id: "6", name: "Robert Wilson", email: "r.wilson@company.com", status: "available" },
          { id: "7", name: "James Taylor", email: "j.taylor@company.com", status: "unavailable" },
        ],
      },
      {
        name: "Finance Team",
        responseRate: 75,
        participants: [
          { id: "8", name: "Jennifer Lee", email: "j.lee@company.com", status: "available" },
          { id: "9", name: "David Brown", email: "d.brown@company.com", status: "unavailable" },
          { id: "10", name: "Lisa Wang", email: "l.wang@company.com", status: "no-response" },
          { id: "11", name: "Mark Johnson", email: "m.johnson@company.com", status: "no-response" },
        ],
      },
      {
        name: "Legal Team",
        responseRate: 40,
        participants: [
          { id: "12", name: "Thomas Miller", email: "t.miller@company.com", status: "available" },
          { id: "13", name: "Patricia Garcia", email: "p.garcia@company.com", status: "no-response" },
          { id: "14", name: "Richard Martinez", email: "r.martinez@company.com", status: "no-response" },
          { id: "15", name: "Elizabeth Wilson", email: "e.wilson@company.com", status: "no-response" },
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
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-3 border-b">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-sm font-medium">{meetingData.title}</h2>
          <p className="text-xs text-muted-foreground">Participant Responses</p>
        </div>
      </div>

      <div className="p-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs">
            <span className="font-medium">Response Rate:</span> {meetingData.responseRate}%
          </div>
          <div className="text-xs">
            <span className="font-medium">Due By:</span> {meetingData.dueBy}
          </div>
        </div>
        <Progress value={meetingData.responseRate} className="h-1.5" />
      </div>

      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search participants..."
            className="pl-8 h-8 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="all">
          <div className="px-3 pt-2">
            <TabsList className="w-full h-7">
              <TabsTrigger value="all" className="text-xs h-6">
                All
              </TabsTrigger>
              <TabsTrigger value="responded" className="text-xs h-6">
                Responded
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs h-6">
                Pending
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="m-0 p-0">
            <div className="p-3">
              <Accordion type="multiple" className="w-full space-y-1">
                {filteredGroups.map((group) =>
                  group.participants.length > 0 ? (
                    <AccordionItem key={group.name} value={group.name} className="border rounded-md px-2">
                      <AccordionTrigger className="py-2 hover:no-underline">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{group.name}</span>
                            <Badge variant="outline" className="text-[10px] h-4">
                              {group.responseRate}%
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {group.participants.length} participants
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 pb-2">
                        <div className="space-y-1">
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
                                <div className="text-xs">
                                  <div>{participant.name}</div>
                                  <div className="text-[10px] text-muted-foreground">{participant.email}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">{getStatusIcon(participant.status)}</div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ) : null,
                )}
              </Accordion>
            </div>
          </TabsContent>

          <TabsContent value="responded" className="m-0 p-0">
            <div className="p-3">
              <Accordion type="multiple" className="w-full space-y-1">
                {filteredGroups.map((group) => {
                  const respondedParticipants = group.participants.filter((p) => p.status !== "no-response")
                  return respondedParticipants.length > 0 ? (
                    <AccordionItem key={group.name} value={group.name} className="border rounded-md px-2">
                      <AccordionTrigger className="py-2 hover:no-underline">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{group.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {respondedParticipants.length} participants
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 pb-2">
                        <div className="space-y-1">
                          {respondedParticipants.map((participant) => (
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
                                <div className="text-xs">
                                  <div>{participant.name}</div>
                                  <div className="text-[10px] text-muted-foreground">{participant.email}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">{getStatusIcon(participant.status)}</div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ) : null
                })}
              </Accordion>
            </div>
          </TabsContent>

          <TabsContent value="pending" className="m-0 p-0">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">Pending Responses</span>
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={selectAllNonResponders}>
                  Select All
                </Button>
              </div>

              <Accordion type="multiple" className="w-full space-y-1">
                {filteredGroups.map((group) => {
                  const pendingParticipants = group.participants.filter((p) => p.status === "no-response")
                  return pendingParticipants.length > 0 ? (
                    <AccordionItem key={group.name} value={group.name} className="border rounded-md px-2">
                      <AccordionTrigger className="py-2 hover:no-underline">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{group.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {pendingParticipants.length} participants
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 pb-2">
                        <div className="space-y-1">
                          {pendingParticipants.map((participant) => (
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
                                <div className="text-xs">
                                  <div>{participant.name}</div>
                                  <div className="text-[10px] text-muted-foreground">{participant.email}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">{getStatusIcon(participant.status)}</div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ) : null
                })}
              </Accordion>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="p-3 border-t">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs">
            <span className="font-medium">{selectedParticipants.length}</span> participants selected
          </div>
          {selectedParticipants.length > 0 && (
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clearSelection}>
              Clear
            </Button>
          )}
        </div>
        <Button size="sm" className="w-full h-8" disabled={selectedParticipants.length === 0} onClick={sendReminders}>
          <Send className="h-3.5 w-3.5 mr-1.5" />
          Send Reminders
        </Button>
      </div>
    </div>
  )
}
