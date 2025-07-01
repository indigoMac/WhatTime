"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, Users, Plus, BarChart2, UserCheck, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function MobileOutlookAddin() {
  const [activeTab, setActiveTab] = useState("create")

  return (
    <div className="flex flex-col h-full w-full bg-background">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h1 className="text-base font-semibold">WhatTime</h1>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85%] sm:w-[350px]">
            <div className="py-6">
              <h2 className="text-lg font-semibold mb-4">WhatTime Menu</h2>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("create")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Meeting Request
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("pending")}>
                  <Clock className="mr-2 h-4 w-4" />
                  Pending Requests
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("upcoming")}>
                  <Users className="mr-2 h-4 w-4" />
                  Upcoming Meetings
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b overflow-x-auto">
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

        {/* Create Tab - Mobile Optimized */}
        <TabsContent value="create" className="flex-1 overflow-auto p-4 space-y-4 m-0">
          <div className="space-y-3">
            <h2 className="text-sm font-medium">Meeting Details</h2>
            <Input placeholder="Meeting Title" className="h-10" />
            <Input placeholder="Location (optional)" className="h-10" />
            <div className="grid grid-cols-2 gap-3">
              <Select>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Time Zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="et">Eastern Time</SelectItem>
                  <SelectItem value="ct">Central Time</SelectItem>
                  <SelectItem value="pt">Pacific Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="h-px bg-border my-4" />

          <div className="space-y-3">
            <h2 className="text-sm font-medium">Proposed Times</h2>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input type="date" className="flex-1 h-10" />
                <Input type="time" className="h-10" />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input type="date" className="flex-1 h-10" />
                <Input type="time" className="h-10" />
              </div>
              <Button variant="outline" className="w-full h-10">
                <Plus className="h-4 w-4 mr-2" /> Add Another Time
              </Button>
            </div>
          </div>

          <div className="h-px bg-border my-4" />

          <div className="space-y-3">
            <h2 className="text-sm font-medium">Participant Groups</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="group-1" className="border-b">
                <AccordionTrigger className="py-3">
                  <span>Internal Team</span>
                </AccordionTrigger>
                <AccordionContent>
                  <Input placeholder="Enter email addresses" className="h-10" />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="group-2" className="border-b">
                <AccordionTrigger className="py-3">
                  <span>Client</span>
                </AccordionTrigger>
                <AccordionContent>
                  <Input placeholder="Enter email addresses" className="h-10" />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button variant="outline" className="w-full h-10">
              <Plus className="h-4 w-4 mr-2" /> Add Group
            </Button>
          </div>

          <div className="pt-4">
            <Button className="w-full h-10">Send Meeting Request</Button>
          </div>
        </TabsContent>

        {/* Pending Tab - Mobile Optimized */}
        <TabsContent value="pending" className="flex-1 overflow-auto p-0 m-0">
          <div className="p-4 space-y-4">
            <Input placeholder="Search requests..." className="h-10" />

            <div className="space-y-4">
              {/* Pending Meeting Request */}
              <div className="border rounded-md p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">Q2 Earnings Call</h3>
                    <p className="text-sm text-muted-foreground">Due by Jun 13</p>
                  </div>
                  <Badge variant="outline">65% Responded</Badge>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">4 groups</span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Response Rate</span>
                    <span>65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button variant="outline" className="sm:flex-1 h-10">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Responses
                  </Button>
                  <Button variant="outline" className="sm:flex-1 h-10">
                    <BarChart2 className="h-4 w-4 mr-2" />
                    Availability
                  </Button>
                  <Button className="sm:flex-1 h-10">Confirm</Button>
                </div>
              </div>

              {/* Another Pending Meeting Request */}
              <div className="border rounded-md p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">Due Diligence Call</h3>
                    <p className="text-sm text-muted-foreground">Due by Jun 12</p>
                  </div>
                  <Badge variant="outline">42% Responded</Badge>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">4 groups</span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Response Rate</span>
                    <span>42%</span>
                  </div>
                  <Progress value={42} className="h-2" />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button variant="outline" className="sm:flex-1 h-10">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Responses
                  </Button>
                  <Button variant="outline" className="sm:flex-1 h-10">
                    <BarChart2 className="h-4 w-4 mr-2" />
                    Availability
                  </Button>
                  <Button className="sm:flex-1 h-10">Confirm</Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Upcoming Tab - Mobile Optimized */}
        <TabsContent value="upcoming" className="flex-1 overflow-auto p-0 m-0">
          <div className="p-4 space-y-4">
            <Input placeholder="Search meetings..." className="h-10" />

            <div className="space-y-4">
              {/* Upcoming Meeting */}
              <div className="border rounded-md p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">Board Meeting Prep</h3>
                    <p className="text-sm text-muted-foreground">Jun 12, 2:00 PM EDT</p>
                  </div>
                  <Badge>Confirmed</Badge>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">8 attendees</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">60 minutes</span>
                </div>

                <div className="flex justify-end pt-2">
                  <Button className="h-10">Join Meeting</Button>
                </div>
              </div>

              {/* Another Upcoming Meeting */}
              <div className="border rounded-md p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">Client Onboarding</h3>
                    <p className="text-sm text-muted-foreground">Jun 13, 11:00 AM EDT</p>
                  </div>
                  <Badge>Confirmed</Badge>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">12 attendees</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">45 minutes</span>
                </div>

                <div className="flex justify-end pt-2">
                  <Button className="h-10">Join Meeting</Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
