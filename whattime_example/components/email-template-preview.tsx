"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, X } from "lucide-react"

interface TimeOption {
  date: string
  startTime: string
  endTime: string
  isAllDay: boolean
}

interface EmailTemplatePreviewProps {
  meetingTitle: string
  location: string
  duration: number
  timezone: string
  timeOptions: TimeOption[]
  onClose: () => void
}

export function EmailTemplatePreview({
  meetingTitle,
  location,
  duration,
  timezone,
  timeOptions,
  onClose,
}: EmailTemplatePreviewProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  const formatTime = (timeStr: string) => {
    if (!timeStr) return ""
    const [hours, minutes] = timeStr.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes || "00"} ${ampm}`
  }

  const formatTimeOption = (option: TimeOption) => {
    if (option.isAllDay) {
      return `${formatDate(option.date)} (All day)`
    }
    return `${formatDate(option.date)}, ${formatTime(option.startTime)} - ${formatTime(option.endTime)}`
  }

  const toggleOption = (optionId: string) => {
    if (selectedOptions.includes(optionId)) {
      setSelectedOptions(selectedOptions.filter((id) => id !== optionId))
    } else {
      setSelectedOptions([...selectedOptions, optionId])
    }
  }

  const getTimezoneLabel = () => {
    const timezoneMap: Record<string, string> = {
      et: "Eastern Time (ET)",
      ct: "Central Time (CT)",
      mt: "Mountain Time (MT)",
      pt: "Pacific Time (PT)",
      gmt: "Greenwich Mean Time (GMT)",
      bst: "British Summer Time (BST)",
      cet: "Central European Time (CET)",
      eet: "Eastern European Time (EET)",
      msk: "Moscow Time (MSK)",
      gst: "Gulf Standard Time (GST)",
      ist: "India Standard Time (IST)",
      cst_asia: "China Standard Time (CST)",
      jst: "Japan Standard Time (JST)",
      aest: "Australian Eastern Standard Time (AEST)",
      nzst: "New Zealand Standard Time (NZST)",
    }
    return timezoneMap[timezone] || timezone
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader className="sticky top-0 bg-card z-10 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Email Preview</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Header */}
          <div className="border-b pb-4">
            <div className="text-sm text-muted-foreground mb-1">From: Your Name &lt;your.email@company.com&gt;</div>
            <div className="text-sm text-muted-foreground mb-1">To: [Recipients]</div>
            <div className="text-sm text-muted-foreground mb-1">Subject: Meeting Request: {meetingTitle}</div>
          </div>

          {/* Email Body */}
          <div className="space-y-4">
            <div className="text-lg font-medium">Meeting Request: {meetingTitle}</div>

            <p>Hello,</p>
            <p>
              I'd like to schedule a meeting and would appreciate if you could indicate your availability for the
              proposed time options below.
            </p>

            <div className="my-4 space-y-2">
              <div>
                <span className="font-medium">Meeting:</span> {meetingTitle}
              </div>
              {location && (
                <div>
                  <span className="font-medium">Location:</span> {location}
                </div>
              )}
              <div>
                <span className="font-medium">Duration:</span> {duration} minutes
              </div>
              <div>
                <span className="font-medium">Time Zone:</span> {getTimezoneLabel()}
              </div>
            </div>

            <div className="font-medium mb-4">Please select your availability by clicking on the time slots:</div>

            <div className="border rounded-lg overflow-hidden bg-white">
              {/* Header with meeting title and duration */}
              <div className="bg-gray-50 p-4 border-b">
                <div className="font-semibold text-lg">
                  {meetingTitle} - Duration: {duration} Mins
                </div>
              </div>

              {/* Availability Grid */}
              <div className="p-4">
                {/* Time headers */}
                <div className="grid grid-cols-8 gap-1 mb-2">
                  <div className="text-sm font-medium text-gray-600 p-2">
                    <div className="transform -rotate-90 origin-center whitespace-nowrap text-xs">
                      Suggested Timeslots
                    </div>
                  </div>
                  {/* Generate time headers based on first time option */}
                  {timeOptions.length > 0 &&
                    (() => {
                      const firstOption = timeOptions[0]
                      const startHour = Number.parseInt(firstOption.startTime.split(":")[0])
                      const timeSlots = []
                      for (let i = 0; i < 7; i++) {
                        const hour = startHour + i
                        const time24 = `${hour.toString().padStart(2, "0")}:00`
                        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
                        const ampm = hour >= 12 ? "PM" : "AM"
                        timeSlots.push(`${hour12}:00`)
                      }
                      return timeSlots.map((time, index) => (
                        <div key={index} className="text-center text-sm font-medium p-2">
                          {time}
                        </div>
                      ))
                    })()}
                </div>

                {/* Timezone indicator */}
                <div className="text-xs text-gray-500 mb-3 ml-2">
                  <em>Your Timezone: {getTimezoneLabel()}</em>
                </div>

                {/* Date rows with time slots */}
                {timeOptions.map((option, dateIndex) => (
                  <div key={dateIndex} className="grid grid-cols-8 gap-1 mb-2">
                    {/* Date label */}
                    <div className="text-sm font-medium p-2 flex items-center">{formatDate(option.date)}</div>

                    {/* Time slot cells */}
                    {Array.from({ length: 7 }, (_, slotIndex) => {
                      const cellId = `${dateIndex}-${slotIndex}`
                      const isSelected = selectedOptions.includes(cellId)
                      const isBusy = Math.random() > 0.6 // Simulate some busy slots

                      return (
                        <div
                          key={slotIndex}
                          className={`
                            h-10 border border-gray-200 cursor-pointer flex items-center justify-center text-xs font-medium
                            ${
                              isSelected
                                ? "bg-teal-400 text-white"
                                : isBusy
                                  ? "bg-gray-200 text-gray-500 bg-diagonal-stripes"
                                  : "bg-gray-50 hover:bg-teal-100"
                            }
                          `}
                          onClick={() => !isBusy && toggleOption(cellId)}
                          style={
                            isBusy
                              ? {
                                  backgroundImage:
                                    "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
                                }
                              : {}
                          }
                        >
                          {isSelected ? "Free" : isBusy ? "Busy" : "Free"}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="p-4 border-t bg-gray-50">
                <div className="flex gap-3 mb-4">
                  <Button
                    variant="secondary"
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
                    onClick={() => setSelectedOptions([])}
                  >
                    <X className="h-4 w-4 mr-2" />
                    No Availability
                  </Button>
                  <Button
                    className="flex-1 bg-black hover:bg-gray-800 text-white"
                    disabled={selectedOptions.length === 0}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Send Availability
                  </Button>
                </div>

                {/* Message input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Add a message..."
                    className="w-full p-3 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground mt-2">
              Note: In the actual email, participants can click on "Free" time slots to indicate their availability.
              Selected slots will turn teal.
            </div>

            <div className="mt-6 space-y-2">
              <Button className="w-full">Submit My Availability</Button>
              <div className="text-center text-xs text-muted-foreground">
                Or click this link if the buttons above don't work: https://whattime.example.com/respond/abc123
              </div>
            </div>

            <div className="mt-6 text-sm">
              <p>Thank you for your prompt response.</p>
              <p className="mt-2">Best regards,</p>
              <p>Your Name</p>
            </div>
          </div>

          {/* Email Footer */}
          <div className="border-t pt-4 text-xs text-muted-foreground">
            <p>This meeting request was sent using WhatTime for Outlook.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
