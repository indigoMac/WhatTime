"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, X, Clock, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TimeOption {
  id: string
  dateTime: string
}

interface ParticipantResponse {
  timeOptionId: string
  status: "available" | "unavailable" | "no-response"
}

interface Participant {
  id: string
  name: string
  email: string
  group: string
  responses: ParticipantResponse[]
  notes: string
}

interface ParticipantResponseTableProps {
  participants: Participant[]
  timeOptions: TimeOption[]
}

export function ParticipantResponseTable({ participants, timeOptions }: ParticipantResponseTableProps) {
  const getResponseStatus = (participant: Participant, timeOptionId: string) => {
    const response = participant.responses.find((r) => r.timeOptionId === timeOptionId)
    if (!response) return "no-response"
    return response.status
  }

  const getResponseIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "unavailable":
        return <X className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-300" />
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Participant</TableHead>
            <TableHead className="w-[150px]">Group</TableHead>
            {timeOptions.map((option) => (
              <TableHead key={option.id} className="text-center">
                {option.dateTime.split(",")[0]}
                <br />
                {option.dateTime.split(",")[1]}
              </TableHead>
            ))}
            <TableHead className="w-[200px]">Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.length === 0 ? (
            <TableRow>
              <TableCell colSpan={timeOptions.length + 3} className="text-center py-8 text-muted-foreground">
                No participants in this group
              </TableCell>
            </TableRow>
          ) : (
            participants.map((participant) => (
              <TableRow key={participant.id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{participant.name}</div>
                    <div className="text-xs text-muted-foreground">{participant.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{participant.group}</Badge>
                </TableCell>
                {timeOptions.map((option) => {
                  const status = getResponseStatus(participant, option.id)
                  return (
                    <TableCell key={option.id} className="text-center">
                      {getResponseIcon(status)}
                    </TableCell>
                  )
                })}
                <TableCell>
                  {participant.notes ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center text-sm text-muted-foreground cursor-help">
                            <HelpCircle className="h-4 w-4 mr-1" />
                            <span className="truncate">{participant.notes.substring(0, 20)}...</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{participant.notes}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span className="text-sm text-muted-foreground">No notes</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
