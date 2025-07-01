"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, X, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimeOption {
  id: string
  dateTime: string
  availableCount: number
  unavailableCount: number
  noResponseCount: number
  isPreferred: boolean
}

interface TimeOptionCardProps {
  option: TimeOption
  isSelected: boolean
  onSelect: () => void
}

export function TimeOptionCard({ option, isSelected, onSelect }: TimeOptionCardProps) {
  const totalResponses = option.availableCount + option.unavailableCount + option.noResponseCount
  const availabilityPercentage = Math.round((option.availableCount / totalResponses) * 100)

  return (
    <Card
      className={cn(
        "border-2 cursor-pointer transition-all",
        isSelected ? "border-primary" : "hover:border-primary/50",
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{option.dateTime}</h3>
              {option.isPreferred && <Badge>Preferred</Badge>}
            </div>

            <div className="mt-2 grid grid-cols-3 gap-2">
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm">
                  {option.availableCount} <span className="text-muted-foreground">available</span>
                </span>
              </div>
              <div className="flex items-center">
                <X className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm">
                  {option.unavailableCount} <span className="text-muted-foreground">unavailable</span>
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-300 mr-1" />
                <span className="text-sm">
                  {option.noResponseCount} <span className="text-muted-foreground">no response</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center ml-4">
            <div
              className={cn(
                "text-2xl font-bold",
                availabilityPercentage > 75
                  ? "text-green-500"
                  : availabilityPercentage > 50
                    ? "text-amber-500"
                    : "text-red-500",
              )}
            >
              {availabilityPercentage}%
            </div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
