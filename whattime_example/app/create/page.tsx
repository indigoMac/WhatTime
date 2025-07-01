"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/date-picker"
import { TimePicker } from "@/components/time-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ParticipantGroup } from "@/components/participant-group"
import { TimeZoneSelector } from "@/components/time-zone-selector"
import { ArrowLeft, Plus, Trash2, Clock } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function CreateMeeting() {
  const { toast } = useToast()
  const [timeOptions, setTimeOptions] = useState([{ date: new Date(), time: "", id: "1" }])
  const [participantGroups, setParticipantGroups] = useState([
    { name: "Internal Team", emails: "", id: "1" },
    { name: "Client", emails: "", id: "2" },
  ])

  const addTimeOption = () => {
    setTimeOptions([...timeOptions, { date: new Date(), time: "", id: Date.now().toString() }])
  }

  const removeTimeOption = (id: string) => {
    if (timeOptions.length > 1) {
      setTimeOptions(timeOptions.filter((option) => option.id !== id))
    }
  }

  const addParticipantGroup = () => {
    setParticipantGroups([...participantGroups, { name: "", emails: "", id: Date.now().toString() }])
  }

  const removeParticipantGroup = (id: string) => {
    if (participantGroups.length > 1) {
      setParticipantGroups(participantGroups.filter((group) => group.id !== id))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Meeting request created",
      description: "Your meeting request has been sent to all participants.",
    })
    // In a real app, we would submit the form data to the server here
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <ArrowLeft className="h-5 w-5" />
          <Clock className="h-6 w-6 text-primary" />
          <span>WhatTime</span>
        </Link>
        <h1 className="text-lg font-semibold ml-4">Create New Meeting Request</h1>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Meeting Details</CardTitle>
                <CardDescription>Enter the basic information about the meeting you want to schedule</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Meeting Title</Label>
                  <Input id="title" placeholder="Q2 Earnings Call" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Review of Q2 financial results with investors"
                    className="min-h-[100px]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration</Label>
                  <div className="flex items-center gap-2">
                    <Input id="duration" type="number" min="15" step="15" defaultValue="60" className="w-24" required />
                    <span>minutes</span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Response Due By</Label>
                  <DatePicker />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Time Options</CardTitle>
                <CardDescription>Provide multiple time options for participants to choose from</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <TimeZoneSelector />

                {timeOptions.map((option, index) => (
                  <div key={option.id} className="flex items-end gap-4">
                    <div className="grid gap-2 flex-1">
                      <Label>Option {index + 1}</Label>
                      <div className="flex gap-2">
                        <DatePicker date={option.date} />
                        <TimePicker />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTimeOption(option.id)}
                      disabled={timeOptions.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addTimeOption} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Time Option
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Participant Groups</CardTitle>
                <CardDescription>Organize participants into groups for better tracking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="groups" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="groups">By Group</TabsTrigger>
                    <TabsTrigger value="individual">Individual</TabsTrigger>
                  </TabsList>
                  <TabsContent value="groups" className="space-y-4 pt-4">
                    {participantGroups.map((group, index) => (
                      <ParticipantGroup
                        key={group.id}
                        index={index}
                        group={group}
                        onRemove={() => removeParticipantGroup(group.id)}
                        canRemove={participantGroups.length > 1}
                      />
                    ))}

                    <Button type="button" variant="outline" onClick={addParticipantGroup} className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Another Group
                    </Button>
                  </TabsContent>
                  <TabsContent value="individual" className="space-y-4 pt-4">
                    <div className="grid gap-2">
                      <Label htmlFor="participants">Participant Emails</Label>
                      <Textarea
                        id="participants"
                        placeholder="Enter email addresses separated by commas or new lines"
                        className="min-h-[150px]"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="Conference Room A / Zoom" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="agenda">Meeting Agenda (Optional)</Label>
                  <Textarea
                    id="agenda"
                    placeholder="1. Introduction (5 min)&#10;2. Q2 Results Overview (15 min)&#10;3. Q&A (30 min)&#10;4. Next Steps (10 min)"
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" asChild>
                  <Link href="/">Cancel</Link>
                </Button>
                <Button type="submit">Send Meeting Request</Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </main>
    </div>
  )
}
