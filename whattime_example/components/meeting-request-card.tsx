import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, Users } from "lucide-react"
import Link from "next/link"

interface MeetingRequestCardProps {
  title: string
  description: string
  groups: string[]
  timeOptions: string[]
  responseRate: number
  dueBy: string
}

export function MeetingRequestCard({
  title,
  description,
  groups,
  timeOptions,
  responseRate,
  dueBy,
}: MeetingRequestCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge variant={responseRate > 50 ? "default" : "outline"}>{responseRate}% Responded</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-1 flex items-center text-sm text-muted-foreground">
            <Users className="mr-1 h-4 w-4" />
            <span>Participant Groups ({groups.length})</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {groups.map((group, i) => (
              <Badge key={i} variant="secondary">
                {group}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            <span>Proposed Times ({timeOptions.length})</span>
          </div>
          <div className="space-y-1">
            {timeOptions.map((option, i) => (
              <div key={i} className="text-sm">
                {option}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Response Rate</span>
            <span className="font-medium">{responseRate}%</span>
          </div>
          <Progress value={responseRate} className="h-2" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">Due by {dueBy}</div>
        <Button size="sm" asChild>
          <Link href={`/meeting/${title.toLowerCase().replace(/\s+/g, "-")}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
