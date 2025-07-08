import { Router } from "express";
import type { Request, Response } from "express";
import { db } from "../database/connection";
import {
  meetingRequests,
  meetingParticipants,
  participantAvailability,
  emailNotifications,
  meetingAnalytics,
  users,
  type NewMeetingRequest,
  type NewMeetingParticipant,
  type NewParticipantAvailability,
  type NewEmailNotification,
  type NewMeetingAnalytics,
} from "../database/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { jwtService } from "../auth/jwt";
import { ApiResponse } from "../types";
import crypto from "crypto";

const router = Router();

// Middleware to verify JWT token and extract user
const authenticateUser = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Authorization header is required",
      } as ApiResponse);
    }

    const token = authHeader.substring(7);
    const decoded = jwtService.verifyToken(token) as any;

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      } as ApiResponse);
    }

    // Find user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      } as ApiResponse);
    }

    req.user = user[0];
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({
      success: false,
      error: "Authentication failed",
    } as ApiResponse);
  }
};

/**
 * POST /meetings
 * Create a new meeting request
 */
router.post("/", authenticateUser, async (req: any, res: any) => {
  try {
    const { title, location, duration, timezone, timeRanges, groups } =
      req.body;
    const organizerId = req.user.id;

    console.log("🔍 MEETING DEBUG: Creating meeting request", {
      title,
      location,
      duration,
      timezone,
      timeRanges: timeRanges?.length || 0,
      groups: groups?.length || 0,
      organizerId,
    });

    // Validate required fields
    if (!title || !duration || !timezone || !timeRanges || !groups) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: title, duration, timezone, timeRanges, groups",
      } as ApiResponse);
    }

    // Extract participant emails from groups
    const participantEmails: string[] = [];
    groups.forEach((group: any) => {
      if (group.participants) {
        group.participants.forEach((participant: any) => {
          if (participant.email && participant.email.trim()) {
            participantEmails.push(participant.email.trim());
          }
        });
      }
    });

    if (participantEmails.length === 0) {
      return res.status(400).json({
        success: false,
        error: "At least one participant email is required",
      } as ApiResponse);
    }

    // Convert time ranges to proper format
    const preferredTimes = timeRanges.map((range: any) => ({
      date: range.date,
      startTime: range.startTime,
      endTime: range.endTime,
      isAllDay: range.isAllDay || false,
    }));

    // Create meeting request data with proper typing
    const meetingData = {
      organizerId,
      title,
      description: location || null,
      duration,
      timeZone: timezone,
      preferredTimes,
      participantEmails,
      status: "pending" as const,
      metadata: {
        groups,
        createdFrom: "office-addin",
      },
    };

    // Create meeting request in database
    const newMeeting = await db
      .insert(meetingRequests)
      .values(meetingData)
      .returning();

    console.log("🔍 MEETING DEBUG: Meeting created successfully", {
      meetingId: newMeeting[0].id,
      participantCount: participantEmails.length,
    });

    // TODO: Send emails to participants (Phase 2.3)
    console.log("🔍 MEETING DEBUG: Would send emails to:", participantEmails);

    res.status(201).json({
      success: true,
      data: {
        meeting: newMeeting[0],
        message: "Meeting request created successfully",
      },
    } as ApiResponse<{ meeting: any; message: string }>);
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create meeting request",
    } as ApiResponse);
  }
});

/**
 * GET /meetings
 * Get user's meeting requests
 */
router.get("/", authenticateUser, async (req: any, res: any) => {
  try {
    const organizerId = req.user.id;
    const status = req.query.status as string; // pending, scheduled, cancelled

    let whereClause = eq(meetingRequests.organizerId, organizerId);

    if (status) {
      whereClause = and(
        eq(meetingRequests.organizerId, organizerId),
        eq(meetingRequests.status, status)
      );
    }

    const meetings = await db
      .select()
      .from(meetingRequests)
      .where(whereClause)
      .orderBy(desc(meetingRequests.createdAt));

    res.json({
      success: true,
      data: { meetings },
    } as ApiResponse<{ meetings: any[] }>);
  } catch (error) {
    console.error("Error fetching meetings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch meetings",
    } as ApiResponse);
  }
});

/**
 * GET /meetings/:id
 * Get specific meeting request
 */
router.get("/:id", authenticateUser, async (req: any, res: any) => {
  try {
    const meetingId = req.params.id;
    const organizerId = req.user.id;

    const meeting = await db
      .select()
      .from(meetingRequests)
      .where(
        and(
          eq(meetingRequests.id, meetingId),
          eq(meetingRequests.organizerId, organizerId)
        )
      )
      .limit(1);

    if (meeting.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Meeting not found",
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: { meeting: meeting[0] },
    } as ApiResponse<{ meeting: any }>);
  } catch (error) {
    console.error("Error fetching meeting:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch meeting",
    } as ApiResponse);
  }
});

/**
 * PUT /meetings/:id
 * Update meeting request status
 */
router.put("/:id", authenticateUser, async (req: any, res: any) => {
  try {
    const meetingId = req.params.id;
    const organizerId = req.user.id;
    const { status, scheduledTime, meetingLink } = req.body;

    const validStatuses = ["pending", "scheduled", "cancelled"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be: pending, scheduled, or cancelled",
      } as ApiResponse);
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (scheduledTime) updateData.scheduledTime = new Date(scheduledTime);
    if (meetingLink) updateData.meetingLink = meetingLink;

    const updatedMeeting = await db
      .update(meetingRequests)
      .set(updateData)
      .where(
        and(
          eq(meetingRequests.id, meetingId),
          eq(meetingRequests.organizerId, organizerId)
        )
      )
      .returning();

    if (updatedMeeting.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Meeting not found",
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: { meeting: updatedMeeting[0] },
    } as ApiResponse<{ meeting: any }>);
  } catch (error) {
    console.error("Error updating meeting:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update meeting",
    } as ApiResponse);
  }
});

/**
 * DELETE /meetings/:id
 * Delete meeting request
 */
router.delete("/:id", authenticateUser, async (req: any, res: any) => {
  try {
    const meetingId = req.params.id;
    const organizerId = req.user.id;

    const deletedMeeting = await db
      .delete(meetingRequests)
      .where(
        and(
          eq(meetingRequests.id, meetingId),
          eq(meetingRequests.organizerId, organizerId)
        )
      )
      .returning();

    if (deletedMeeting.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Meeting not found",
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: { message: "Meeting deleted successfully" },
    } as ApiResponse<{ message: string }>);
  } catch (error) {
    console.error("Error deleting meeting:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete meeting",
    } as ApiResponse);
  }
});

/**
 * POST /meetings/:id/participants
 * Add participants to a meeting and generate invite tokens
 */
router.post(
  "/:id/participants",
  authenticateUser,
  async (req: any, res: any) => {
    try {
      const meetingId = req.params.id;
      const organizerId = req.user.id;
      const { participants } = req.body; // Array of { email, displayName?, role? }

      // Verify meeting ownership
      const meeting = await db
        .select()
        .from(meetingRequests)
        .where(
          and(
            eq(meetingRequests.id, meetingId),
            eq(meetingRequests.organizerId, organizerId)
          )
        )
        .limit(1);

      if (meeting.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Meeting not found",
        } as ApiResponse);
      }

      // Create participants with unique invite tokens
      const participantData = participants.map((p: any) => ({
        meetingRequestId: meetingId,
        email: p.email,
        displayName: p.displayName || null,
        role: p.role || "attendee",
        inviteToken: crypto.randomBytes(32).toString("hex"),
      }));

      const newParticipants = await db
        .insert(meetingParticipants)
        .values(participantData)
        .returning();

      // Initialize analytics record
      await db
        .insert(meetingAnalytics)
        .values({
          meetingRequestId: meetingId,
          totalParticipants: participants.length.toString(),
        })
        .onConflictDoUpdate({
          target: meetingAnalytics.meetingRequestId,
          set: {
            totalParticipants: participants.length.toString(),
          },
        });

      res.status(201).json({
        success: true,
        data: { participants: newParticipants },
      } as ApiResponse<{ participants: any[] }>);
    } catch (error) {
      console.error("Error adding participants:", error);
      res.status(500).json({
        success: false,
        error: "Failed to add participants",
      } as ApiResponse);
    }
  }
);

/**
 * GET /meetings/:id/participants
 * Get all participants for a meeting with their response status
 */
router.get(
  "/:id/participants",
  authenticateUser,
  async (req: any, res: any) => {
    try {
      const meetingId = req.params.id;
      const organizerId = req.user.id;

      // Verify meeting ownership
      const meeting = await db
        .select()
        .from(meetingRequests)
        .where(
          and(
            eq(meetingRequests.id, meetingId),
            eq(meetingRequests.organizerId, organizerId)
          )
        )
        .limit(1);

      if (meeting.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Meeting not found",
        } as ApiResponse);
      }

      // Get participants with response counts
      const participants = await db
        .select({
          id: meetingParticipants.id,
          email: meetingParticipants.email,
          displayName: meetingParticipants.displayName,
          role: meetingParticipants.role,
          responseStatus: meetingParticipants.responseStatus,
          lastReminderSent: meetingParticipants.lastReminderSent,
          createdAt: meetingParticipants.createdAt,
          responseCount: sql<number>`count(${participantAvailability.id})`,
        })
        .from(meetingParticipants)
        .leftJoin(
          participantAvailability,
          eq(meetingParticipants.id, participantAvailability.participantId)
        )
        .where(eq(meetingParticipants.meetingRequestId, meetingId))
        .groupBy(meetingParticipants.id)
        .orderBy(meetingParticipants.createdAt);

      res.json({
        success: true,
        data: { participants },
      } as ApiResponse<{ participants: any[] }>);
    } catch (error) {
      console.error("Error fetching participants:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch participants",
      } as ApiResponse);
    }
  }
);

/**
 * POST /response/:token
 * Submit availability response (public endpoint, no auth required)
 */
router.post("/response/:token", async (req: any, res: any) => {
  try {
    const { token } = req.params;
    const { availability, comment } = req.body; // availability: Array of { timeSlotStart, timeSlotEnd, isAvailable, preference }

    // Find participant by invite token
    const participant = await db
      .select()
      .from(meetingParticipants)
      .where(eq(meetingParticipants.inviteToken, token))
      .limit(1);

    if (participant.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Invalid invite token",
      } as ApiResponse);
    }

    const participantId = participant[0].id;

    // Delete existing responses for this participant
    await db
      .delete(participantAvailability)
      .where(eq(participantAvailability.participantId, participantId));

    // Insert new availability responses
    if (availability && availability.length > 0) {
      const availabilityData = availability.map((slot: any) => ({
        participantId,
        timeSlotStart: new Date(slot.timeSlotStart),
        timeSlotEnd: new Date(slot.timeSlotEnd),
        isAvailable: slot.isAvailable,
        preference: slot.preference || "neutral",
        comment: slot.comment || comment || null,
      }));

      await db.insert(participantAvailability).values(availabilityData);
    }

    // Update participant response status
    await db
      .update(meetingParticipants)
      .set({
        responseStatus: "responded",
      } as any)
      .where(eq(meetingParticipants.id, participantId));

    // Update analytics
    const meetingId = participant[0].meetingRequestId;
    const respondedCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(meetingParticipants)
      .where(
        and(
          eq(meetingParticipants.meetingRequestId, meetingId),
          eq(meetingParticipants.responseStatus, "responded")
        )
      );

    await db
      .update(meetingAnalytics)
      .set({
        respondedParticipants: respondedCount[0].count.toString(),
      } as any)
      .where(eq(meetingAnalytics.meetingRequestId, meetingId));

    res.json({
      success: true,
      data: { message: "Response submitted successfully" },
    } as ApiResponse<{ message: string }>);
  } catch (error) {
    console.error("Error submitting response:", error);
    res.status(500).json({
      success: false,
      error: "Failed to submit response",
    } as ApiResponse);
  }
});

/**
 * GET /response/:token
 * Get response form data (public endpoint, no auth required)
 */
router.get("/response/:token", async (req: any, res: any) => {
  try {
    const { token } = req.params;

    // Find participant and meeting details
    const result = await db
      .select({
        participant: meetingParticipants,
        meeting: meetingRequests,
        organizer: {
          displayName: users.displayName,
          email: users.email,
        },
      })
      .from(meetingParticipants)
      .innerJoin(
        meetingRequests,
        eq(meetingParticipants.meetingRequestId, meetingRequests.id)
      )
      .innerJoin(users, eq(meetingRequests.organizerId, users.id))
      .where(eq(meetingParticipants.inviteToken, token))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Invalid invite token",
      } as ApiResponse);
    }

    const { participant, meeting, organizer } = result[0];

    // Get existing responses
    const existingResponses = await db
      .select()
      .from(participantAvailability)
      .where(eq(participantAvailability.participantId, participant.id))
      .orderBy(participantAvailability.timeSlotStart);

    res.json({
      success: true,
      data: {
        participant: {
          email: participant.email,
          displayName: participant.displayName,
          responseStatus: participant.responseStatus,
        },
        meeting: {
          title: meeting.title,
          description: meeting.description,
          duration: meeting.duration,
          timeZone: meeting.timeZone,
          preferredTimes: meeting.preferredTimes,
        },
        organizer,
        existingResponses,
      },
    } as ApiResponse<{ participant: any; meeting: any; organizer: any; existingResponses: any[] }>);
  } catch (error) {
    console.error("Error fetching response form:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch response form",
    } as ApiResponse);
  }
});

/**
 * GET /meetings/:id/analytics
 * Get meeting response analytics
 */
router.get("/:id/analytics", authenticateUser, async (req: any, res: any) => {
  try {
    const meetingId = req.params.id;
    const organizerId = req.user.id;

    // Verify meeting ownership
    const meeting = await db
      .select()
      .from(meetingRequests)
      .where(
        and(
          eq(meetingRequests.id, meetingId),
          eq(meetingRequests.organizerId, organizerId)
        )
      )
      .limit(1);

    if (meeting.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Meeting not found",
      } as ApiResponse);
    }

    // Get basic analytics
    const analytics = await db
      .select()
      .from(meetingAnalytics)
      .where(eq(meetingAnalytics.meetingRequestId, meetingId))
      .limit(1);

    // Get response status breakdown
    const responseBreakdown = await db
      .select({
        status: meetingParticipants.responseStatus,
        count: sql<number>`count(*)`,
      })
      .from(meetingParticipants)
      .where(eq(meetingParticipants.meetingRequestId, meetingId))
      .groupBy(meetingParticipants.responseStatus);

    // Calculate availability heatmap
    const availabilityData = await db
      .select({
        timeSlotStart: participantAvailability.timeSlotStart,
        timeSlotEnd: participantAvailability.timeSlotEnd,
        isAvailable: participantAvailability.isAvailable,
        preference: participantAvailability.preference,
      })
      .from(participantAvailability)
      .innerJoin(
        meetingParticipants,
        eq(participantAvailability.participantId, meetingParticipants.id)
      )
      .where(eq(meetingParticipants.meetingRequestId, meetingId));

    // Group availability by time slot
    const timeSlotMap = new Map();
    availabilityData.forEach((slot) => {
      const key = `${slot.timeSlotStart}-${slot.timeSlotEnd}`;
      if (!timeSlotMap.has(key)) {
        timeSlotMap.set(key, {
          start: slot.timeSlotStart,
          end: slot.timeSlotEnd,
          available: 0,
          unavailable: 0,
          preferred: 0,
          neutral: 0,
          ifNeeded: 0,
        });
      }
      const slotData = timeSlotMap.get(key);
      if (slot.isAvailable) {
        slotData.available++;
        if (slot.preference === "preferred") slotData.preferred++;
        else if (slot.preference === "if_needed") slotData.ifNeeded++;
        else slotData.neutral++;
      } else {
        slotData.unavailable++;
      }
    });

    const availabilityHeatmap = Array.from(timeSlotMap.values());

    res.json({
      success: true,
      data: {
        analytics: analytics[0] || null,
        responseBreakdown,
        availabilityHeatmap,
      },
    } as ApiResponse<{ analytics: any; responseBreakdown: any[]; availabilityHeatmap: any[] }>);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch analytics",
    } as ApiResponse);
  }
});

/**
 * POST /meetings/:id/send-reminders
 * Send reminder emails to participants who haven't responded
 */
router.post(
  "/:id/send-reminders",
  authenticateUser,
  async (req: any, res: any) => {
    try {
      const meetingId = req.params.id;
      const organizerId = req.user.id;

      // Verify meeting ownership
      const meeting = await db
        .select()
        .from(meetingRequests)
        .where(
          and(
            eq(meetingRequests.id, meetingId),
            eq(meetingRequests.organizerId, organizerId)
          )
        )
        .limit(1);

      if (meeting.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Meeting not found",
        } as ApiResponse);
      }

      // Get participants who haven't responded
      const pendingParticipants = await db
        .select()
        .from(meetingParticipants)
        .where(
          and(
            eq(meetingParticipants.meetingRequestId, meetingId),
            eq(meetingParticipants.responseStatus, "pending")
          )
        );

      // Log reminder emails (actual email sending would be implemented in Phase 2.3)
      const emailLogs = pendingParticipants.map((participant) => ({
        meetingRequestId: meetingId,
        participantId: participant.id,
        recipientEmail: participant.email,
        emailType: "reminder" as const,
        subject: `Reminder: Please respond to "${meeting[0].title}" meeting request`,
        bodyText: `This is a reminder to respond to the meeting request for "${meeting[0].title}".`,
        status: "pending" as const,
      }));

      if (emailLogs.length > 0) {
        await db.insert(emailNotifications).values(emailLogs);

        // Update reminder timestamp
        await db
          .update(meetingParticipants)
          .set({ lastReminderSent: new Date() } as any)
          .where(
            and(
              eq(meetingParticipants.meetingRequestId, meetingId),
              eq(meetingParticipants.responseStatus, "pending")
            )
          );
      }

      res.json({
        success: true,
        data: {
          message: `Reminders queued for ${pendingParticipants.length} participants`,
          reminderCount: pendingParticipants.length,
        },
      } as ApiResponse<{ message: string; reminderCount: number }>);
    } catch (error) {
      console.error("Error sending reminders:", error);
      res.status(500).json({
        success: false,
        error: "Failed to send reminders",
      } as ApiResponse);
    }
  }
);

export default router;
