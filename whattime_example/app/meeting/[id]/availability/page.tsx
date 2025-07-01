"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"
import { AvailabilityHeatmap } from "@/components/availability-heatmap"
import { TimeZoneSelector } from "@/components/time-zone-selector"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/date-range-picker"
import { GroupFilter } from "@/components/group-filter"

// Mock data for the meeting request
const meetingData = {
  id: "123",
  title: "Q2 Earnings Call",
  description: "Review of Q2 financial results with investors",
  duration: 60,
  groups: [
    { id: "1", name: "Investors", color: "#8b5cf6" },
    { id: "2", name: "Executive Team", color: "#3b82f6" },
    { id: "3", name: "Finance Team", color: "#10b981" },
    { id: "4", name: "Legal Team", color: "#f59e0b" },
  ],
}

// Mock availability data
// This would typically come from an API call
const availabilityData = {
  dates: ["2025-06-15", "2025-06-16", "2025-06-17", "2025-06-18", "2025-06-19"],
  timeSlots: [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
  ],
  availability: {
    // Format: [date][timeSlot][groupId] = percentage available (0-100)
    "2025-06-15": {
      "09:00": { "1": 80, "2": 60, "3": 75, "4": 40, all: 70 },
      "09:30": { "1": 80, "2": 60, "3": 75, "4": 40, all: 70 },
      "10:00": { "1": 90, "2": 100, "3": 88, "4": 60, all: 85 },
      "10:30": { "1": 90, "2": 100, "3": 88, "4": 60, all: 85 },
      "11:00": { "1": 70, "2": 80, "3": 63, "4": 80, all: 72 },
      "11:30": { "1": 70, "2": 80, "3": 63, "4": 80, all: 72 },
      "12:00": { "1": 50, "2": 40, "3": 38, "4": 20, all: 40 },
      "12:30": { "1": 50, "2": 40, "3": 38, "4": 20, all: 40 },
      "13:00": { "1": 60, "2": 60, "3": 75, "4": 60, all: 65 },
      "13:30": { "1": 60, "2": 60, "3": 75, "4": 60, all: 65 },
      "14:00": { "1": 80, "2": 80, "3": 88, "4": 80, all: 82 },
      "14:30": { "1": 80, "2": 80, "3": 88, "4": 80, all: 82 },
      "15:00": { "1": 70, "2": 60, "3": 75, "4": 60, all: 68 },
      "15:30": { "1": 70, "2": 60, "3": 75, "4": 60, all: 68 },
      "16:00": { "1": 60, "2": 40, "3": 50, "4": 40, all: 50 },
      "16:30": { "1": 60, "2": 40, "3": 50, "4": 40, all: 50 },
      "17:00": { "1": 40, "2": 20, "3": 25, "4": 20, all: 30 },
    },
    "2025-06-16": {
      "09:00": { "1": 70, "2": 80, "3": 63, "4": 60, all: 68 },
      "09:30": { "1": 70, "2": 80, "3": 63, "4": 60, all: 68 },
      "10:00": { "1": 80, "2": 100, "3": 75, "4": 80, all: 82 },
      "10:30": { "1": 80, "2": 100, "3": 75, "4": 80, all: 82 },
      "11:00": { "1": 90, "2": 80, "3": 88, "4": 100, all: 90 },
      "11:30": { "1": 90, "2": 80, "3": 88, "4": 100, all: 90 },
      "12:00": { "1": 50, "2": 60, "3": 50, "4": 40, all: 50 },
      "12:30": { "1": 50, "2": 60, "3": 50, "4": 40, all: 50 },
      "13:00": { "1": 70, "2": 80, "3": 75, "4": 60, all: 72 },
      "13:30": { "1": 70, "2": 80, "3": 75, "4": 60, all: 72 },
      "14:00": { "1": 80, "2": 60, "3": 75, "4": 80, all: 75 },
      "14:30": { "1": 80, "2": 60, "3": 75, "4": 80, all: 75 },
      "15:00": { "1": 60, "2": 40, "3": 63, "4": 60, all: 58 },
      "15:30": { "1": 60, "2": 40, "3": 63, "4": 60, all: 58 },
      "16:00": { "1": 50, "2": 20, "3": 38, "4": 40, all: 40 },
      "16:30": { "1": 50, "2": 20, "3": 38, "4": 40, all: 40 },
      "17:00": { "1": 30, "2": 0, "3": 25, "4": 20, all: 22 },
    },
    "2025-06-17": {
      "09:00": { "1": 90, "2": 80, "3": 88, "4": 60, all: 82 },
      "09:30": { "1": 90, "2": 80, "3": 88, "4": 60, all: 82 },
      "10:00": { "1": 80, "2": 60, "3": 75, "4": 40, all: 68 },
      "10:30": { "1": 80, "2": 60, "3": 75, "4": 40, all: 68 },
      "11:00": { "1": 70, "2": 40, "3": 63, "4": 20, all: 55 },
      "11:30": { "1": 70, "2": 40, "3": 63, "4": 20, all: 55 },
      "12:00": { "1": 40, "2": 20, "3": 38, "4": 0, all: 30 },
      "12:30": { "1": 40, "2": 20, "3": 38, "4": 0, all: 30 },
      "13:00": { "1": 60, "2": 40, "3": 50, "4": 40, all: 50 },
      "13:30": { "1": 60, "2": 40, "3": 50, "4": 40, all: 50 },
      "14:00": { "1": 70, "2": 60, "3": 75, "4": 60, all: 68 },
      "14:30": { "1": 70, "2": 60, "3": 75, "4": 60, all: 68 },
      "15:00": { "1": 80, "2": 80, "3": 88, "4": 80, all: 82 },
      "15:30": { "1": 80, "2": 80, "3": 88, "4": 80, all: 82 },
      "16:00": { "1": 60, "2": 60, "3": 75, "4": 60, all: 65 },
      "16:30": { "1": 60, "2": 60, "3": 75, "4": 60, all: 65 },
      "17:00": { "1": 50, "2": 40, "3": 50, "4": 40, all: 48 },
    },
    "2025-06-18": {
      "09:00": { "1": 70, "2": 60, "3": 63, "4": 40, all: 60 },
      "09:30": { "1": 70, "2": 60, "3": 63, "4": 40, all: 60 },
      "10:00": { "1": 80, "2": 80, "3": 75, "4": 60, all: 75 },
      "10:30": { "1": 80, "2": 80, "3": 75, "4": 60, all: 75 },
      "11:00": { "1": 90, "2": 100, "3": 88, "4": 80, all: 90 },
      "11:30": { "1": 90, "2": 100, "3": 88, "4": 80, all: 90 },
      "12:00": { "1": 50, "2": 60, "3": 50, "4": 40, all: 50 },
      "12:30": { "1": 50, "2": 60, "3": 50, "4": 40, all: 50 },
      "13:00": { "1": 60, "2": 80, "3": 75, "4": 60, all: 68 },
      "13:30": { "1": 60, "2": 80, "3": 75, "4": 60, all: 68 },
      "14:00": { "1": 70, "2": 60, "3": 63, "4": 80, all: 68 },
      "14:30": { "1": 70, "2": 60, "3": 63, "4": 80, all: 68 },
      "15:00": { "1": 80, "2": 40, "3": 75, "4": 60, all: 68 },
      "15:30": { "1": 80, "2": 40, "3": 75, "4": 60, all: 68 },
      "16:00": { "1": 60, "2": 20, "3": 50, "4": 40, all: 48 },
      "16:30": { "1": 60, "2": 20, "3": 50, "4": 40, all: 48 },
      "17:00": { "1": 40, "2": 0, "3": 25, "4": 20, all: 25 },
    },
    "2025-06-19": {
      "09:00": { "1": 60, "2": 40, "3": 50, "4": 40, all: 50 },
      "09:30": { "1": 60, "2": 40, "3": 50, "4": 40, all: 50 },
      "10:00": { "1": 70, "2": 60, "3": 63, "4": 60, all: 65 },
      "10:30": { "1": 70, "2": 60, "3": 63, "4": 60, all: 65 },
      "11:00": { "1": 80, "2": 80, "3": 75, "4": 80, all: 78 },
      "11:30": { "1": 80, "2": 80, "3": 75, "4": 80, all: 78 },
      "12:00": { "1": 40, "2": 60, "3": 38, "4": 40, all: 42 },
      "12:30": { "1": 40, "2": 60, "3": 38, "4": 40, all: 42 },
      "13:00": { "1": 50, "2": 80, "3": 63, "4": 60, all: 60 },
      "13:30": { "1": 50, "2": 80, "3": 63, "4": 60, all: 60 },
      "14:00": { "1": 60, "2": 60, "3": 75, "4": 80, all: 68 },
      "14:30": { "1": 60, "2": 60, "3": 75, "4": 80, all: 68 },
      "15:00": { "1": 70, "2": 40, "3": 63, "4": 60, all: 60 },
      "15:30": { "1": 70, "2": 40, "3": 63, "4": 60, all: 60 },
      "16:00": { "1": 50, "2": 20, "3": 38, "4": 40, all: 40 },
      "16:30": { "1": 50, "2": 20, "3": 38, "4": 40, all: 40 },
      "17:00": { "1": 30, "2": 0, "3": 25, "4": 20, all: 22 },
    },
  },
}

export default function AvailabilityHeatmapPage({ params }: { params: { id: string } }) {
  const [selectedTimeZone, setSelectedTimeZone] = useState("America/New_York")
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"all" | "groups">("all")
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: new Date("2025-06-15"),
    to: new Date("2025-06-19"),
  })

  // Filter dates based on selected date range
  const filteredDates = availabilityData.dates.filter((date) => {
    const dateObj = new Date(date)
    return dateObj >= selectedDateRange.from && dateObj <= selectedDateRange.to
  })

  const handleSelectTimeSlot = (date: string, timeSlot: string) => {
    // In a real app, this would create a new meeting option or navigate to the meeting creation page
    console.log(`Selected time slot: ${date} ${timeSlot}`)
    // For demo purposes, we'll just log the selection
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href={`/meeting/${params.id}`} className="flex items-center gap-2 text-lg font-semibold">
          <ArrowLeft className="h-5 w-5" />
          <Clock className="h-6 w-6 text-primary" />
          <span>WhatTime</span>
        </Link>
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold">{meetingData.title}</h1>
          <p className="text-sm text-muted-foreground">Availability Heatmap</p>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Time Zone</CardTitle>
              <CardDescription>Select your preferred time zone for viewing availability</CardDescription>
            </CardHeader>
            <CardContent>
              <TimeZoneSelector value={selectedTimeZone} onValueChange={setSelectedTimeZone} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Date Range</CardTitle>
              <CardDescription>Select the date range to view</CardDescription>
            </CardHeader>
            <CardContent>
              <DateRangePicker date={selectedDateRange} onDateChange={setSelectedDateRange} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Availability Heatmap</CardTitle>
              <CardDescription>Visual representation of participant availability</CardDescription>
            </div>
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "all" | "groups")}>
              <TabsList>
                <TabsTrigger value="all">Overall</TabsTrigger>
                <TabsTrigger value="groups">By Group</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {viewMode === "groups" && (
              <div className="mb-4">
                <GroupFilter
                  groups={meetingData.groups}
                  selectedGroups={selectedGroups}
                  onSelectionChange={setSelectedGroups}
                />
              </div>
            )}
            <div className="overflow-x-auto">
              <AvailabilityHeatmap
                dates={filteredDates}
                timeSlots={availabilityData.timeSlots}
                availability={availabilityData.availability}
                timeZone={selectedTimeZone}
                viewMode={viewMode}
                selectedGroups={selectedGroups.length ? selectedGroups : meetingData.groups.map((g) => g.id)}
                groups={meetingData.groups}
                onSelectTimeSlot={handleSelectTimeSlot}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="h-4 w-8 bg-gradient-to-r from-red-500 to-amber-500 rounded-sm"></div>
                <span className="text-sm">0-50% Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-8 bg-gradient-to-r from-amber-500 to-green-500 rounded-sm"></div>
                <span className="text-sm">50-100% Available</span>
              </div>
              {meetingData.groups.map((group) => (
                <div key={group.id} className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: group.color }}></div>
                  <span className="text-sm">{group.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
