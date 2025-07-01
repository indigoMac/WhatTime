"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Calendar, Clock, Users } from "lucide-react"
import Link from "next/link"
import { ParticipantResponseTable } from "@/components/participant-response-table"
import { TimeOptionCard } from "@/components/time-option-card"
import { GroupResponseSummary } from "@/components/group-response-summary"
import { ConfirmMeetingDialog } from "@/components/confirm-meeting-dialog"
import { useToast } from "@/hooks/use-toast"

// Mock data for the meeting request
const meetingData = {
  id: "123",
  title: "Q2 Earnings Call",
  description: "Review of Q2 financial results with investors",
  duration: 60,
  dueBy: "Jun 13, 2025",
  responseRate: 78,
  location: "Conference Room A / Zoom",
  timeOptions: [
    {
      id: "1",
      dateTime: "Jun 15, 2025, 10:00 AM EDT",
      availableCount: 18,
      unavailableCount: 2,
      noResponseCount: 5,
      isPreferred: true,
    },
    {
      id: "2",
      dateTime: "Jun 16, 2025, 11:00 AM EDT",
      availableCount: 15,
      unavailableCount: 5,
      noResponseCount: 5,
      isPreferred: false,
    },
    {
      id: "3",
      dateTime: "Jun 17, 2025, 9:00 AM EDT",
      availableCount: 12,
      unavailableCount: 8,
      noResponseCount: 5,
      isPreferred: false,
    },
  ],
  groups: [
    {
      id: "1",
      name: "Investors",
      responseRate: 90,
      totalParticipants: 10,
      responded: 9,
    },
    {
      id: "2",
      name: "Executive Team",
      responseRate: 100,
      totalParticipants: 5,
      responded: 5,
    },
    {
      id: "3",
      name: "Finance Team",
      responseRate: 75,
      totalParticipants: 8,
      responded: 6,
    },
    {
      id: "4",
      name: "Legal Team",
      responseRate: 40,
      totalParticipants: 5,
      responded: 2,
    },
  ],
  participants: [
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@investor.com",
      group: "Investors",
      responses: [
        { timeOptionId: "1", status: "available" },
        { timeOptionId: "2", status: "unavailable" },
        { timeOptionId: "3", status: "available" },
      ],
      notes: "Prefer morning meetings",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.j@investor.com",
      group: "Investors",
      responses: [
        { timeOptionId: "1", status: "available" },
        { timeOptionId: "2", status: "available" },
        { timeOptionId: "3", status: "unavailable" },
      ],
      notes: "",
    },
    {
      id: "3",
      name: "Michael Chen",
      email: "m.chen@investor.com",
      group: "Investors",
      responses: [
        { timeOptionId: "1", status: "available" },
        { timeOptionId: "2", status: "available" },
        { timeOptionId: "3", status: "available" },
      ],
      notes: "",
    },
    {
      id: "4",
      name: "Emma Davis",
      email: "e.davis@company.com",
      group: "Executive Team",
      responses: [
        { timeOptionId: "1", status: "available" },
        { timeOptionId: "2", status: "unavailable" },
        { timeOptionId: "3", status: "unavailable" },
      ],
      notes: "Can only attend the first option",
    },
    {
      id: "5",
      name: "Robert Wilson",
      email: "r.wilson@company.com",
      group: "Executive Team",
      responses: [
        { timeOptionId: "1", status: "available" },
        { timeOptionId: "2", status: "available" },
        { timeOptionId: "3", status: "unavailable" },
      ],
      notes: "",
    },
    {
      id: "6",
      name: "Jennifer Lee",
      email: "j.lee@company.com",
      group: "Finance Team",
      responses: [
        { timeOptionId: "1", status: "available" },
        { timeOptionId: "2", status: "available" },
        { timeOptionId: "3", status: "available" },
      ],
      notes: "",
    },
    {
      id: "7",
      name: "David Brown",
      email: "d.brown@company.com",
      group: "Legal Team",
      responses: [
        { timeOptionId: "1", status: "unavailable" },
        { timeOptionId: "2", status: "unavailable" },
        { timeOptionId: "3", status: "available" },
      ],
      notes: "Only available for the last option",
    },
    {
      id: "8",
      name: "Lisa Wang",
      email: "l.wang@company.com",
      group: "Finance Team",
      responses: [],
      notes: "",
    },
  ],
}

export default function MeetingResponsePage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const [selectedTimeOption, setSelectedTimeOption] = useState<string | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)

  // Calculate overall stats
  const totalParticipants = meetingData.participants.length
  const respondedParticipants = meetingData.participants.filter((p) => p.responses.length > 0).length
  const responseRate = Math.round((respondedParticipants / totalParticipants) * 100)

  const handleConfirmMeeting = () => {
    if (!selectedTimeOption) {
      toast({
        title: "No time selected",
        description: "Please select a time option before confirming the meeting.",
        variant: "destructive",
      })
      return
    }
    setIsConfirmDialogOpen(true)
  }

  const handleSendReminder = () => {
    toast({
      title: "Reminders sent",
      description: "Reminder emails have been sent to all participants who haven't responded.",
    })
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <ArrowLeft className="h-5 w-5" />
          <Clock className="h-6 w-6 text-primary" />
          <span>WhatTime</span>
        </Link>
        <h1 className="text-lg font-semibold ml-4">Meeting Request: {meetingData.title}</h1>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          <div className="flex-1 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{meetingData.title}</CardTitle>
                    <CardDescription>{meetingData.description}</CardDescription>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge variant={responseRate > 75 ? "default" : responseRate > 50 ? "secondary" : "outline"}>
                      {responseRate}% Responded
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/meeting/${params.id}/availability`}>
                        <Clock className="mr-2 h-4 w-4" />
                        View Availability Heatmap
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{meetingData.duration} minutes</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Due by {meetingData.dueBy}</span>
                  </div>
                </div>

                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>
                    {respondedParticipants} of {totalParticipants} participants responded
                  </span>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Response Rate</span>
                    <span className="font-medium">{responseRate}%</span>
                  </div>
                  <Progress value={responseRate} className="h-2" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="outline" onClick={handleSendReminder}>
                  Send Reminder
                </Button>
                <Button onClick={handleConfirmMeeting}>Confirm Meeting</Button>
              </CardFooter>
            </Card>

            <div className="flex justify-end mb-4">
              <Button asChild>
                <Link href={`/meeting/${params.id}/availability`}>
                  <Clock className="mr-2 h-4 w-4" />
                  View Availability Heatmap
                </Link>
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Time Options</CardTitle>
                <CardDescription>Select the best time based on participant availability</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {meetingData.timeOptions.map((option) => (
                  <TimeOptionCard
                    key={option.id}
                    option={option}
                    isSelected={selectedTimeOption === option.id}
                    onSelect={() => setSelectedTimeOption(option.id)}
                  />
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="md:w-1/3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Group Response Summary</CardTitle>
                <CardDescription>Response rates by participant group</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {meetingData.groups.map((group) => (
                  <GroupResponseSummary key={group.id} group={group} />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Participant Responses</CardTitle>
            <CardDescription>Detailed view of individual participant responses</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Participants</TabsTrigger>
                {meetingData.groups.map((group) => (
                  <TabsTrigger key={group.id} value={group.id}>
                    {group.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all">
                <ParticipantResponseTable
                  participants={meetingData.participants}
                  timeOptions={meetingData.timeOptions}
                />
              </TabsContent>

              {meetingData.groups.map((group) => (
                <TabsContent key={group.id} value={group.id}>
                  <ParticipantResponseTable
                    participants={meetingData.participants.filter((p) => p.group === group.name)}
                    timeOptions={meetingData.timeOptions}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <ConfirmMeetingDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        meetingTitle={meetingData.title}
        selectedTime={meetingData.timeOptions.find((o) => o.id === selectedTimeOption)?.dateTime || ""}
        participantCount={totalParticipants}
        location={meetingData.location}
      />
    </div>
  )
}
