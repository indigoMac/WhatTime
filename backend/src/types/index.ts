// Authentication types
export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  timeZone?: string;
  avatarUrl?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface SessionData {
  userId: string;
  sessionToken: string;
  expiresAt: Date;
}

// OAuth provider types
export interface OAuthProfile {
  id: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  photos?: { value: string }[];
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope?: string;
}

// Calendar types
export interface CalendarEvent {
  id: string;
  subject: string;
  body?: string;
  startTime: Date;
  endTime: Date;
  timeZone?: string;
  location?: string;
  isAllDay: boolean;
  isCancelled: boolean;
  showAs: "free" | "busy" | "tentative" | "away";
  sensitivity: "normal" | "personal" | "private" | "confidential";
  attendees: CalendarAttendee[];
  organizer: CalendarOrganizer;
}

export interface CalendarAttendee {
  email: string;
  name?: string;
  status: "none" | "organizer" | "tentative" | "accepted" | "declined";
  type: "required" | "optional" | "resource";
}

export interface CalendarOrganizer {
  email: string;
  name?: string;
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  timeZone: string;
}

export interface FreeBusyInfo {
  email: string;
  freeBusyViewType: "merged" | "freeBusy" | "mergedOnly";
  freeBusyStatus: Array<{
    start: Date;
    end: Date;
    status: "free" | "busy" | "tentative" | "outOfOffice";
  }>;
}

// Meeting scheduling types
export interface MeetingRequest {
  id: string;
  organizerId: string;
  title: string;
  description?: string;
  duration: string; // e.g., "30m", "1h", "2h"
  timeZone: string;
  preferredTimes: TimeSlot[];
  participantEmails: string[];
  status: "pending" | "scheduled" | "cancelled";
  scheduledTime?: Date;
  meetingLink?: string;
}

export interface MeetingSuggestion {
  startTime: Date;
  endTime: Date;
  timeZone: string;
  confidence: number; // 0-1 score
  conflicts: Array<{
    email: string;
    conflictType: "busy" | "tentative" | "outOfOffice";
  }>;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Middleware types
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  session?: SessionData;
}

// Environment variables
export interface EnvironmentConfig {
  NODE_ENV: "development" | "production" | "test";
  API_PORT: number;
  DATABASE_URL: string;
  JWT_SECRET_KEY: string;
  JWT_EXPIRES_IN: string;
  FRONTEND_URL: string;
  API_URL: string;
  OUTLOOK_ADDIN_URL: string;
  MICROSOFT_CLIENT_ID: string;
  MICROSOFT_TENANT_ID: string;
  MICROSOFT_CLIENT_SECRET: string;
  MICROSOFT_REDIRECT_URI: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
  REDIS_URL?: string;
  SESSION_SECRET: string;
  ENABLE_CORS: boolean;
  ENABLE_DOCS: boolean;
}
