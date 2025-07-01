"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Generate time options in 30-minute increments
const generateTimeOptions = () => {
  const options = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const h = hour % 12 || 12
      const period = hour < 12 ? "AM" : "PM"
      options.push({
        value: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
        label: `${h}:${minute.toString().padStart(2, "0")} ${period}`,
      })
    }
  }
  return options
}

const timeOptions = generateTimeOptions()

interface TimePickerProps {
  onSelect?: (time: string) => void
}

export function TimePicker({ onSelect }: TimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedTime, setSelectedTime] = React.useState<string>("")

  const handleSelect = (time: string) => {
    setSelectedTime(time)
    setOpen(false)
    if (onSelect) {
      onSelect(time)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[180px] justify-start">
          <Clock className="mr-2 h-4 w-4" />
          {selectedTime ? timeOptions.find((time) => time.value === selectedTime)?.label : "Select time"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search time..." />
          <CommandList>
            <CommandEmpty>No time found.</CommandEmpty>
            <CommandGroup>
              {timeOptions.map((time) => (
                <CommandItem key={time.value} value={time.value} onSelect={() => handleSelect(time.value)}>
                  {time.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
