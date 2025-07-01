"use client"
import { SimplifiedOutlookAddin } from "@/components/simplified-outlook-addin"
import { Clock } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white p-4 border-b shadow-sm">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">WhatTime Outlook Add-in Demo</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg w-[380px] h-[650px] overflow-hidden">
          <SimplifiedOutlookAddin />
        </div>
      </main>

      <footer className="bg-white p-4 border-t">
        <div className="max-w-screen-xl mx-auto text-center text-sm text-muted-foreground">
          <p>This is a demonstration of how the WhatTime add-in would appear in Outlook.</p>
        </div>
      </footer>
    </div>
  )
}
