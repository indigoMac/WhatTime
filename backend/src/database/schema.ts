import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  jsonb,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    displayName: varchar("display_name", { length: 255 }),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    timeZone: varchar("time_zone", { length: 50 }).default("UTC"),
    avatarUrl: text("avatar_url"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
  })
);

// Calendar providers enum
export type CalendarProvider = "microsoft" | "google";

// Calendar connections table
export const calendarConnections = pgTable(
  "calendar_connections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    provider: varchar("provider", { length: 20 })
      .$type<CalendarProvider>()
      .notNull(),
    providerUserId: varchar("provider_user_id", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    displayName: varchar("display_name", { length: 255 }),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token"),
    tokenExpiresAt: timestamp("token_expires_at"),
    scope: text("scope"),
    isActive: boolean("is_active").default(true),
    lastSyncAt: timestamp("last_sync_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("calendar_connections_user_id_idx").on(table.userId),
    providerIdx: index("calendar_connections_provider_idx").on(table.provider),
    userProviderUnique: index("calendar_connections_user_provider_unique").on(
      table.userId,
      table.provider,
      table.providerUserId
    ),
  })
);

// Calendar events table (for caching)
export const calendarEvents = pgTable(
  "calendar_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    connectionId: uuid("connection_id")
      .references(() => calendarConnections.id, { onDelete: "cascade" })
      .notNull(),
    providerEventId: varchar("provider_event_id", { length: 255 }).notNull(),
    subject: varchar("subject", { length: 500 }),
    body: text("body"),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    timeZone: varchar("time_zone", { length: 50 }),
    location: text("location"),
    isAllDay: boolean("is_all_day").default(false),
    isCancelled: boolean("is_cancelled").default(false),
    showAs: varchar("show_as", { length: 20 }), // free, busy, tentative, away
    sensitivity: varchar("sensitivity", { length: 20 }), // normal, personal, private, confidential
    attendees: jsonb("attendees"), // Array of attendee objects
    organizer: jsonb("organizer"), // Organizer object
    metadata: jsonb("metadata"), // Additional provider-specific data
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    connectionIdIdx: index("calendar_events_connection_id_idx").on(
      table.connectionId
    ),
    timeRangeIdx: index("calendar_events_time_range_idx").on(
      table.startTime,
      table.endTime
    ),
    providerEventIdx: index("calendar_events_provider_event_idx").on(
      table.providerEventId
    ),
  })
);

// User sessions table
export const userSessions = pgTable(
  "user_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
    deviceInfo: text("device_info"),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    isActive: boolean("is_active").default(true),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    lastAccessedAt: timestamp("last_accessed_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("user_sessions_user_id_idx").on(table.userId),
    sessionTokenIdx: index("user_sessions_token_idx").on(table.sessionToken),
    expiresAtIdx: index("user_sessions_expires_at_idx").on(table.expiresAt),
  })
);

// Meeting requests table (for tracking scheduled meetings)
export const meetingRequests = pgTable(
  "meeting_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizerId: uuid("organizer_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    duration: varchar("duration", { length: 20 }).notNull(), // e.g., "30m", "1h", "2h"
    timeZone: varchar("time_zone", { length: 50 }).notNull(),
    preferredTimes: jsonb("preferred_times").notNull(), // Array of time slots
    participantEmails: jsonb("participant_emails").notNull(), // Array of email addresses
    status: varchar("status", { length: 20 }).default("pending"), // pending, scheduled, cancelled
    scheduledTime: timestamp("scheduled_time"),
    meetingLink: text("meeting_link"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    organizerIdIdx: index("meeting_requests_organizer_id_idx").on(
      table.organizerId
    ),
    statusIdx: index("meeting_requests_status_idx").on(table.status),
    createdAtIdx: index("meeting_requests_created_at_idx").on(table.createdAt),
  })
);

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  calendarConnections: many(calendarConnections),
  sessions: many(userSessions),
  meetingRequests: many(meetingRequests),
}));

export const calendarConnectionsRelations = relations(
  calendarConnections,
  ({ one, many }) => ({
    user: one(users, {
      fields: [calendarConnections.userId],
      references: [users.id],
    }),
    events: many(calendarEvents),
  })
);

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
  connection: one(calendarConnections, {
    fields: [calendarEvents.connectionId],
    references: [calendarConnections.id],
  }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const meetingRequestsRelations = relations(
  meetingRequests,
  ({ one }) => ({
    organizer: one(users, {
      fields: [meetingRequests.organizerId],
      references: [users.id],
    }),
  })
);

// Export types for use in application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type CalendarConnection = typeof calendarConnections.$inferSelect;
export type NewCalendarConnection = typeof calendarConnections.$inferInsert;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type NewCalendarEvent = typeof calendarEvents.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;
export type MeetingRequest = typeof meetingRequests.$inferSelect;
export type NewMeetingRequest = typeof meetingRequests.$inferInsert;
