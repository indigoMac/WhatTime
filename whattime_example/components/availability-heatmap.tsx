"use client"

import { useState } from "react"
import { format, parse } from "date-fns"
import { HeatmapCell } from "@/components/heatmap-cell"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface Group {
  id: string
  name: string
  color: string
}

interface AvailabilityHeatmapProps {
  dates: string[]
  timeSlots: string[]
  availability: Record<string, Record<string, Record<string, number>>>
  timeZone: string
  viewMode: "all" | "groups"
  selectedGroups: string[]
  groups: Group[]
  onSelectTimeSlot: (date: string, timeSlot: string) => void
}

export function AvailabilityHeatmap({
  dates,
  timeSlots,
  availability,
  timeZone,
  viewMode,
  selectedGroups,
  groups,
  onSelectTimeSlot,
}: AvailabilityHeatmapProps) {
  const [selectedCell, setSelectedCell] = useState<{ date: string; timeSlot: string } | null>(null)

  const handleCellClick = (date: string, timeSlot: string) => {
    if (selectedCell?.date === date && selectedCell?.timeSlot === timeSlot) {
      setSelectedCell(null)
    } else {
      setSelectedCell({ date, timeSlot })
    }
  }

  const handleConfirmSelection = () => {
    if (selectedCell) {
      onSelectTimeSlot(selectedCell.date, selectedCell.timeSlot)
      setSelectedCell(null)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return format(date, "EEE, MMM d")
  }

  const formatTime = (timeStr: string) => {
    const time = parse(timeStr, "HH:mm", new Date())
    return format(time, "h:mm a")
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-background p-2 text-left min-w-[100px]"></th>
              {dates.map((date) => (
                <th key={date} className="p-2 text-center min-w-[120px]">
                  {formatDate(date)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((timeSlot) => (
              <tr key={timeSlot} className="border-t">
                <td className="sticky left-0 z-10 bg-background p-2 text-left font-medium">{formatTime(timeSlot)}</td>
                {dates.map((date) => {
                  const availabilityData = availability[date]?.[timeSlot] || {}

                  return (
                    <td
                      key={`${date}-${timeSlot}`}
                      className={cn(
                        "p-1 text-center",
                        selectedCell?.date === date && selectedCell?.timeSlot === timeSlot && "bg-muted",
                      )}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div onClick={() => handleCellClick(date, timeSlot)}>
                              {viewMode === "all" ? (
                                <HeatmapCell
                                  percentage={availabilityData.all || 0}
                                  isSelected={selectedCell?.date === date && selectedCell?.timeSlot === timeSlot}
                                />
                              ) : (
                                <div className="flex gap-1 justify-center">
                                  {selectedGroups.map((groupId) => (
                                    <HeatmapCell
                                      key={groupId}
                                      percentage={availabilityData[groupId] || 0}
                                      isSelected={selectedCell?.date === date && selectedCell?.timeSlot === timeSlot}
                                      size="small"
                                      color={groups.find((g) => g.id === groupId)?.color}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <div className="font-medium">
                                {formatDate(date)} at {formatTime(timeSlot)}
                              </div>
                              {viewMode === "all" ? (
                                <div>Overall: {availabilityData.all || 0}% available</div>
                              ) : (
                                <div className="space-y-1">
                                  {selectedGroups.map((groupId) => {
                                    const group = groups.find((g) => g.id === groupId)
                                    return (
                                      <div key={groupId} className="flex items-center gap-1">
                                        <div
                                          className="h-2 w-2 rounded-full"
                                          style={{ backgroundColor: group?.color }}
                                        ></div>
                                        <span>
                                          {group?.name}: {availabilityData[groupId] || 0}% available
                                        </span>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCell && (
        <div className="flex items-center justify-between border-t pt-4">
          <div>
            <p className="font-medium">
              Selected: {formatDate(selectedCell.date)} at {formatTime(selectedCell.timeSlot)}
            </p>
            <p className="text-sm text-muted-foreground">
              {availability[selectedCell.date]?.[selectedCell.timeSlot]?.all || 0}% of participants available
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSelectedCell(null)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSelection}>Use This Time</Button>
          </div>
        </div>
      )}
    </div>
  )
}
