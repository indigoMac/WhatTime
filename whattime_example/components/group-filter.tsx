"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Group {
  id: string
  name: string
  color: string
}

interface GroupFilterProps {
  groups: Group[]
  selectedGroups: string[]
  onSelectionChange: (selectedGroups: string[]) => void
}

export function GroupFilter({ groups, selectedGroups, onSelectionChange }: GroupFilterProps) {
  const toggleGroup = (groupId: string) => {
    if (selectedGroups.includes(groupId)) {
      onSelectionChange(selectedGroups.filter((id) => id !== groupId))
    } else {
      onSelectionChange([...selectedGroups, groupId])
    }
  }

  const selectAll = () => {
    onSelectionChange(groups.map((group) => group.id))
  }

  const clearAll = () => {
    onSelectionChange([])
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filter by Group</h3>
        <div className="space-x-2 text-xs">
          <button className="text-primary hover:underline" onClick={selectAll}>
            Select All
          </button>
          <button className="text-muted-foreground hover:underline" onClick={clearAll}>
            Clear
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {groups.map((group) => (
          <Badge
            key={group.id}
            variant="outline"
            className={cn(
              "cursor-pointer transition-all",
              selectedGroups.includes(group.id) ? "bg-primary/10" : "bg-transparent",
            )}
            onClick={() => toggleGroup(group.id)}
          >
            <div className="mr-1.5 h-2 w-2 rounded-full" style={{ backgroundColor: group.color }}></div>
            {group.name}
          </Badge>
        ))}
      </div>
    </div>
  )
}
