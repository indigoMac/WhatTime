import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface GroupSummary {
  id: string
  name: string
  responseRate: number
  totalParticipants: number
  responded: number
}

interface GroupResponseSummaryProps {
  group: GroupSummary
}

export function GroupResponseSummary({ group }: GroupResponseSummaryProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium">{group.name}</span>
          <Badge variant="outline" className="text-xs">
            {group.totalParticipants} participants
          </Badge>
        </div>
        <span className="text-sm font-medium">{group.responseRate}%</span>
      </div>
      <Progress value={group.responseRate} className="h-2" />
      <div className="text-xs text-muted-foreground">
        {group.responded} of {group.totalParticipants} responded
      </div>
    </div>
  )
}
