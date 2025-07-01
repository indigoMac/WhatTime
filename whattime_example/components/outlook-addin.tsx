"use client"

import { useEffect, useState } from "react"
import { Clock, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { OutlookSidebar } from "@/components/outlook-sidebar"
import { CompactAvailabilityView } from "@/components/compact-availability-view"
import { ParticipantResponseManager } from "@/components/participant-response-manager"
import * as OfficeApi from "@/lib/office-api"

type View = "main" | "availability" | "responses"

export function OutlookAddin() {
  const [isOfficeInitialized, setIsOfficeInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<View>("main")
  const [currentMeetingId, setCurrentMeetingId] = useState<string | null>(null)

  const containerStyle = {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  }

  useEffect(() => {
    const initializeOffice = async () => {
      try {
        setIsLoading(true)
        await OfficeApi.initializeOfficeJs()
        setIsOfficeInitialized(true)
        setError(null)
      } catch (err) {
        console.error("Failed to initialize Office.js:", err)
        setError("Failed to initialize Office.js. This add-in requires Outlook.")
      } finally {
        setIsLoading(false)
      }
    }

    // Check if we're running in an Outlook context
    if (typeof window !== "undefined" && window.Office) {
      initializeOffice()
    } else {
      // We're running in a browser outside of Outlook
      setIsLoading(false)
      setError(null) // No error for demo purposes
    }
  }, [])

  const handleViewAvailability = (meetingId: string) => {
    setCurrentMeetingId(meetingId)
    setCurrentView("availability")
  }

  const handleViewResponses = (meetingId: string) => {
    setCurrentMeetingId(meetingId)
    setCurrentView("responses")
  }

  const handleBackToMain = () => {
    setCurrentView("main")
    setCurrentMeetingId(null)
  }

  const handleConfirmTime = (timeSlot: string) => {
    // In a real app, this would update the meeting with the selected time
    alert(`Meeting time confirmed: ${timeSlot}`)
    setCurrentView("main")
  }

  const handleClose = () => {
    // In a real Outlook add-in, this would close the task pane
    if (typeof window !== "undefined" && window.Office) {
      OfficeApi.closeTaskPane()
    } else {
      alert("Add-in would close here")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full" style={containerStyle}>
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-sm">Loading WhatTime...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4" style={containerStyle}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Render the appropriate view
  switch (currentView) {
    case "availability":
      return (
        <CompactAvailabilityView
          meetingId={currentMeetingId || ""}
          onBack={handleBackToMain}
          onConfirm={handleConfirmTime}
        />
      )
    case "responses":
      return <ParticipantResponseManager meetingId={currentMeetingId || ""} onBack={handleBackToMain} />
    default:
      return (
        <div style={containerStyle}>
          <OutlookSidebar
            onViewAvailability={handleViewAvailability}
            onViewResponses={handleViewResponses}
            onClose={handleClose}
          />
        </div>
      )
  }
}
