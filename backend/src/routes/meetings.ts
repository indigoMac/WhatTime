import { Router } from "express";
import type { Request, Response } from "express";
import { db } from "../database/connection";
import {
  meetingRequests,
  users,
  type NewMeetingRequest,
} from "../database/schema";
import { eq, and, desc } from "drizzle-orm";
import { jwtService } from "../auth/jwt";
import { ApiResponse } from "../types";

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

export default router;
