"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, X, Clock, ChevronLeft, Calendar } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AvailabilityViewProps {
  meetingId: string
  onBack: () => void
  onConfirm: (timeSlot: string) => void
}

export function CompactAvailabilityView({ meetingId, onBack, onConfirm }: AvailabilityViewProps) {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [selectedView, setSelectedView] = useState<"heatmap" | "list">("heatmap")
  const [selectedDate, setSelectedDate] = useState("2025-06-15")

  // Mock data for the meeting
  const meetingData = {
    title: "Q2 Earnings Call",
    dates: ["2025-06-15", "2025-06-16", "2025-06-17"],
    timeSlots: {
      "2025-06-15": [
        { time: "09:00", available: 80, unavailable: 15, noResponse: 5 },
        { time: "10:00", available: 90, unavailable: 5, noResponse: 5 },
        { time: "11:00", available: 70, unavailable: 20, noResponse: 10 },
        { time: "14:00", available: 85, unavailable: 10, noResponse: 5 },
        { time: "15:00", available: 65, unavailable: 25, noResponse: 10 },
      ],
      "2025-06-16": [
        { time: "09:00", available: 75, unavailable: 20, noResponse: 5 },
        { time: "11:00", available: 90, unavailable: 5, noResponse: 5 },
        { time: "14:00", available: 70, unavailable: 20, noResponse: 10 },
      ],
      "2025-06-17": [
        { time: "09:00", available: 85, unavailable: 10, noResponse: 5 },
        { time: "13:00", available: 60, unavailable: 30, noResponse: 10 },
        { time: "15:00", available: 80, unavailable: 15, noResponse: 5 },
      ],
    },
    groups: [
      { name: "Investors", color: "#8b5cf6" },
      { name: "Executive Team", color: "#3b82f6" },
      { name: "Finance Team", color: "#10b981" },
      { name: "Legal Team", color: "#f59e0b" },
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
      const [date, time] = selectedTimeSlot.split(" ")
      onConfirm(`${formatDate(date)} at ${time}`)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-3 border-b">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-sm font-medium">{meetingData.title}</h2>
          <p className="text-xs text-muted-foreground">Availability</p>
        </div>
      </div>

      <div className="p-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-medium">Select Date & View</h3>
        </div>

        <Select value={selectedDate} onValueChange={setSelectedDate}>
          <SelectTrigger className="h-8 text-xs">
            <Calendar className="h-3.5 w-3.5 mr-2" />
            <SelectValue>{formatDate(selectedDate)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {meetingData.dates.map((date) => (
              <SelectItem key={date} value={date} className="text-xs">
                {formatDate(date)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as "heatmap" | "list")}>
          <div className="flex justify-end mb-2">
            <TabsList className="h-7 p-0.5">
              <TabsTrigger value="heatmap" className="text-xs h-6">
                Heatmap
              </TabsTrigger>
              <TabsTrigger value="list" className="text-xs h-6">
                List
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="heatmap" className="m-0 p-0">
            <div className="space-y-1">
              {meetingData.timeSlots[selectedDate]?.map((slot) => {
                const timeSlotId = `${selectedDate} ${formatTime(slot.time)}`
                const isSelected = selectedTimeSlot === timeSlotId

                return (
                  <div
                    key={slot.time}
                    className={`p-2 rounded border cursor-pointer ${
                      isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedTimeSlot(timeSlotId)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{formatTime(slot.time)}</span>
                      <span className="text-xs font-medium">{slot.available}% Available</span>
                    </div>

                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getAvailabilityColor(slot.available)}`}
                        style={{ width: `${slot.available}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
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
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="list" className="m-0 p-0">
            <div className="space-y-1">
              {meetingData.timeSlots[selectedDate]?.map((slot) => {
                const timeSlotId = `${selectedDate} ${formatTime(slot.time)}`
                const isSelected = selectedTimeSlot === timeSlotId

                return (
                  <div
                    key={slot.time}
                    className={`p-2 rounded border cursor-pointer ${
                      isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedTimeSlot(timeSlotId)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{formatTime(slot.time)}</span>
                      <Badge
                        className={`text-[10px] ${
                          slot.available >= 75 ? "bg-green-500" : slot.available >= 50 ? "bg-yellow-400" : "bg-red-500"
                        }`}
                      >
                        {slot.available}% Available
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-1">
                      {meetingData.groups.map((group) => (
                        <div
                          key={group.name}
                          className="flex items-center gap-1 text-[10px] bg-muted/50 rounded px-1 py-0.5"
                        >
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: group.color }}></div>
                          <span>{group.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="p-3 border-t">
        {selectedTimeSlot ? (
          <div className="space-y-2">
            <div className="text-xs">
              <span className="font-medium">Selected:</span> {selectedTimeSlot}
            </div>
            <Button size="sm" className="w-full h-8" onClick={handleConfirm}>
              Confirm This Time
            </Button>
          </div>
        ) : (
          <div className="text-xs text-center text-muted-foreground">Select a time slot to continue</div>
        )}
      </div>
    </div>
  )
}
