import { cn } from "@/lib/utils"

interface HeatmapCellProps {
  percentage: number
  isSelected?: boolean
  size?: "default" | "small"
  color?: string
}

export function HeatmapCell({ percentage, isSelected = false, size = "default", color }: HeatmapCellProps) {
  // Calculate color based on percentage
  const getBackgroundColor = () => {
    if (color) return color

    if (percentage <= 25) return "bg-red-500"
    if (percentage <= 50) return "bg-amber-500"
    if (percentage <= 75) return "bg-yellow-400"
    return "bg-green-500"
  }

  // Calculate opacity based on percentage
  const getOpacity = () => {
    return 0.3 + (percentage / 100) * 0.7
  }

  return (
    <div
      className={cn(
        "rounded cursor-pointer transition-all",
        size === "default" ? "h-8 w-16" : "h-6 w-3",
        isSelected && "ring-2 ring-primary ring-offset-1",
      )}
      style={{
        backgroundColor: color || undefined,
        opacity: color ? getOpacity() : 1,
        background: color
          ? undefined
          : `linear-gradient(to right, rgba(239, 68, 68, ${getOpacity()}), rgba(16, 185, 129, ${getOpacity()}))`,
      }}
    >
      {size === "default" && (
        <div className="flex h-full items-center justify-center text-xs font-medium text-white">{percentage}%</div>
      )}
    </div>
  )
}
