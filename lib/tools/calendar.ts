import { google } from "googleapis";
import { z } from "zod";
import type { GoogleToolContext } from "@/lib/tools/gmail";

export const getScheduleInputSchema = z.object({
  range: z
    .enum(["today", "week"])
    .default("today")
    .describe("Whether to fetch today's or this week's events"),
});

export const createEventInputSchema = z.object({
  title: z.string().describe("Event title"),
  startTime: z.string().describe("Start time in ISO 8601 format"),
  endTime: z.string().describe("End time in ISO 8601 format"),
  attendees: z
    .array(z.string())
    .optional()
    .describe("List of attendee email addresses"),
  description: z.string().optional().describe("Event description"),
});

export const rescheduleEventInputSchema = z.object({
  eventId: z.string().describe("The Google Calendar event ID"),
  newStartTime: z.string().describe("New start time in ISO 8601 format"),
  newEndTime: z.string().describe("New end time in ISO 8601 format"),
});

export const findFreeSlotInputSchema = z.object({
  duration: z.number().describe("Duration in minutes"),
  preferredDate: z.string().describe("Preferred date in YYYY-MM-DD format"),
  workingHoursStart: z
    .string()
    .default("09:00")
    .describe("Start of working hours (HH:mm)"),
  workingHoursEnd: z
    .string()
    .default("18:00")
    .describe("End of working hours (HH:mm)"),
});

const MOCK_EVENTS = [
  {
    id: "evt1",
    title: "Team Standup",
    start: "2026-03-20T09:30:00+05:30",
    end: "2026-03-20T09:45:00+05:30",
    attendees: ["alice@acme.com", "bob@acme.com"],
  },
  {
    id: "evt2",
    title: "Design Review",
    start: "2026-03-20T14:00:00+05:30",
    end: "2026-03-20T15:00:00+05:30",
    attendees: ["design@acme.com"],
  },
  {
    id: "evt3",
    title: "1:1 with Manager",
    start: "2026-03-21T11:00:00+05:30",
    end: "2026-03-21T11:30:00+05:30",
    attendees: ["manager@acme.com"],
  },
];

function getCalendarClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.calendar({ version: "v3", auth });
}

function getNow() {
  return new Date();
}

function getTodayInKolkata() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(getNow());
}

export async function executeGetSchedule(
  { range = "today" }: z.infer<typeof getScheduleInputSchema>,
  { accessToken }: GoogleToolContext
) {
  if (!accessToken) {
    const today = getTodayInKolkata();
    const events =
      range === "today"
        ? MOCK_EVENTS.filter((event) => event.start.startsWith(today))
        : MOCK_EVENTS;

    return {
      success: true,
      mock: true,
      range,
      events,
      summary: `Found ${events.length} events ${range === "today" ? "today" : "this week"}.`,
      message: `Fetched ${events.length} calendar events.`,
    };
  }

  try {
    const calendar = getCalendarClient(accessToken);
    const now = getNow();
    const start = new Date(now);
    const end = new Date(now);

    if (range === "today") {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else {
      const weekday = start.getDay();
      start.setDate(start.getDate() - weekday);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 7);
      end.setHours(23, 59, 59, 999);
    }

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = (response.data.items || []).map((event) => ({
      id: event.id,
      title: event.summary,
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      attendees: (event.attendees || []).map((attendee) => attendee.email),
    }));

    return {
      success: true,
      mock: false,
      range,
      events,
      message: `Fetched ${events.length} calendar events.`,
    };
  } catch (error) {
    console.error("[Calendar] get_schedule error:", error);
    return { success: false, error: "Failed to fetch calendar" };
  }
}

export async function executeCreateEvent(
  input: z.infer<typeof createEventInputSchema>,
  { accessToken }: GoogleToolContext
) {
  const { title, startTime, endTime, attendees, description } = input;

  if (!accessToken) {
    return {
      success: true,
      mock: true,
      event: { id: "mock-evt-new", title, startTime, endTime, attendees },
      message: `Created event "${title}" from ${startTime} to ${endTime}`,
    };
  }

  try {
    const calendar = getCalendarClient(accessToken);
    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: title,
        description,
        start: { dateTime: startTime, timeZone: "Asia/Kolkata" },
        end: { dateTime: endTime, timeZone: "Asia/Kolkata" },
        attendees: attendees?.map((email) => ({ email })),
      },
    });

    return {
      success: true,
      mock: false,
      eventId: response.data.id,
      htmlLink: response.data.htmlLink,
      message: `Created event "${title}"`,
    };
  } catch (error) {
    console.error("[Calendar] create_event error:", error);
    return { success: false, error: "Failed to create event" };
  }
}

export async function executeRescheduleEvent(
  { eventId, newStartTime, newEndTime }: z.infer<typeof rescheduleEventInputSchema>,
  { accessToken }: GoogleToolContext
) {
  if (!accessToken) {
    return {
      success: true,
      mock: true,
      message: `Rescheduled event ${eventId} to ${newStartTime}`,
    };
  }

  try {
    const calendar = getCalendarClient(accessToken);
    await calendar.events.patch({
      calendarId: "primary",
      eventId,
      requestBody: {
        start: { dateTime: newStartTime, timeZone: "Asia/Kolkata" },
        end: { dateTime: newEndTime, timeZone: "Asia/Kolkata" },
      },
    });

    return {
      success: true,
      mock: false,
      message: `Rescheduled event ${eventId}`,
    };
  } catch (error) {
    console.error("[Calendar] reschedule_event error:", error);
    return { success: false, error: "Failed to reschedule event" };
  }
}

export async function executeFindFreeSlot(
  {
    duration,
    preferredDate,
    workingHoursStart = "09:00",
    workingHoursEnd = "18:00",
  }: z.infer<typeof findFreeSlotInputSchema>
) {
  const slots = [
    `${preferredDate}T${workingHoursStart}:00`,
    `${preferredDate}T11:00:00`,
    `${preferredDate}T15:00:00`,
  ];

  return {
    success: true,
    mock: true,
    suggestedSlots: slots.map((slot) => ({
      start: slot,
      end: new Date(new Date(slot).getTime() + duration * 60000).toISOString(),
    })),
    message: `Found ${slots.length} available ${duration}-minute slots on ${preferredDate}`,
  };
}
