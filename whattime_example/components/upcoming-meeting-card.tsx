import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users } from "lucide-react"

interface UpcomingMeetingCardProps {
  title: string
  description: string
  dateTime: string
  groups: string[]
  attendees: number
  location: string
}

export function UpcomingMeetingCard({
  title,
  description,
  dateTime,
  groups,
  attendees,
  location,
}: UpcomingMeetingCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge>Confirmed</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{dateTime}</span>
        </div>

        <div className="flex items-center">
          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{location}</span>
        </div>

        <div>
          <div className="mb-1 flex items-center text-sm text-muted-foreground">
            <Users className="mr-1 h-4 w-4" />
            <span>
              {attendees} Attendees from {groups.length} Groups
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {groups.map((group, i) => (
              <Badge key={i} variant="secondary">
                {group}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline" size="sm">
          View Details
        </Button>
        <Button size="sm">Join Meeting</Button>
      </CardFooter>
    </Card>
  )
}
