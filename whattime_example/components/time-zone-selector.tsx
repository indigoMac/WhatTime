"use client"

import * as React from "react"
import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"

// Common time zones
const timeZones = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
  { value: "Europe/Paris", label: "Central European Time (CET)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
  { value: "Asia/Shanghai", label: "China Standard Time (CST)" },
  { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
]

export function TimeZoneSelector() {
  const [open, setOpen] = React.useState(false)
  const [selectedZone, setSelectedZone] = React.useState("America/New_York")

  return (
    <div className="grid gap-2">
      <Label htmlFor="timezone">Time Zone</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button id="timezone" variant="outline" role="combobox" aria-expanded={open} className="w-full justify-start">
            <Globe className="mr-2 h-4 w-4" />
            {timeZones.find((zone) => zone.value === selectedZone)?.label || "Select time zone"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search time zone..." />
            <CommandList>
              <CommandEmpty>No time zone found.</CommandEmpty>
              <CommandGroup>
                {timeZones.map((zone) => (
                  <CommandItem
                    key={zone.value}
                    value={zone.value}
                    onSelect={() => {
                      setSelectedZone(zone.value)
                      setOpen(false)
                    }}
                  >
                    {zone.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
