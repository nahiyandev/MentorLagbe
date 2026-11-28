/**
 * Utility functions for generating Google Calendar URLs and .ics iCal files
 */

export interface CalendarEventDetails {
  title: string;
  description: string;
  location?: string;
  meetLink?: string;
  scheduleText?: string;
  startHours?: number; // 0-23
  startMinutes?: number; // 0-59
  durationMinutes?: number; // default 90 min (1.5h)
  dayName?: string; // e.g. "Monday"
}

const DAY_MAP: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const RRULE_DAY_MAP: Record<string, string> = {
  sunday: "SU",
  monday: "MO",
  tuesday: "TU",
  wednesday: "WE",
  thursday: "TH",
  friday: "FR",
  saturday: "SA",
};

/**
 * Parses time string like "6:00 PM" or "10:00 AM" into hours (0-23) and minutes (0-59)
 */
export function parseTimeString(timeStr?: string): { hours: number; minutes: number } {
  if (!timeStr) return { hours: 18, minutes: 0 };
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return { hours: 18, minutes: 0 };

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  return { hours, minutes };
}

/**
 * Calculates the next upcoming Date for a day of week
 */
export function getNextDateForDay(dayName?: string, hours = 18, minutes = 0): Date {
  const now = new Date();
  const targetDay = dayName ? DAY_MAP[dayName.toLowerCase()] ?? now.getDay() : now.getDay();
  const currentDay = now.getDay();

  let daysUntil = targetDay - currentDay;
  if (daysUntil < 0 || (daysUntil === 0 && (now.getHours() > hours || (now.getHours() === hours && now.getMinutes() >= minutes)))) {
    daysUntil += 7;
  }

  const result = new Date(now);
  result.setDate(now.getDate() + daysUntil);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function formatToUtcIso(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/**
 * Generates an instant "Add to Google Calendar" web link
 */
export function getGoogleCalendarUrl(event: CalendarEventDetails): string {
  const { hours, minutes } = parseTimeString(event.scheduleText);
  const startDate = getNextDateForDay(event.dayName, hours, minutes);
  const duration = event.durationMinutes || 90;
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

  const datesParam = `${formatToUtcIso(startDate)}/${formatToUtcIso(endDate)}`;

  const detailsWithMeet = [
    event.description,
    event.meetLink ? `Join Live Class Meet: ${event.meetLink}` : "",
    "Organized via MentorLagbe Platform (https://mentor-lagbe.vercel.app)",
  ]
    .filter(Boolean)
    .join("\n\n");

  const location = event.meetLink || event.location || "Online Google Meet";

  let url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    event.title
  )}&dates=${datesParam}&details=${encodeURIComponent(
    detailsWithMeet
  )}&location=${encodeURIComponent(location)}`;

  if (event.dayName && RRULE_DAY_MAP[event.dayName.toLowerCase()]) {
    const rruleDay = RRULE_DAY_MAP[event.dayName.toLowerCase()];
    url += `&recur=${encodeURIComponent(`RRULE:FREQ=WEEKLY;BYDAY=${rruleDay}`)}`;
  }

  return url;
}

/**
 * Generates and downloads an RFC 5545 standard .ics file
 */
export function downloadIcsFile(event: CalendarEventDetails) {
  const { hours, minutes } = parseTimeString(event.scheduleText);
  const startDate = getNextDateForDay(event.dayName, hours, minutes);
  const duration = event.durationMinutes || 90;
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

  const rrule = event.dayName && RRULE_DAY_MAP[event.dayName.toLowerCase()]
    ? `RRULE:FREQ=WEEKLY;BYDAY=${RRULE_DAY_MAP[event.dayName.toLowerCase()]}\n`
    : "";

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MentorLagbe//Class Schedule//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:mentorlagbe-${Date.now()}@mentorlagbe.com`,
    `DTSTAMP:${formatToUtcIso(new Date())}`,
    `DTSTART:${formatToUtcIso(startDate)}`,
    `DTEND:${formatToUtcIso(endDate)}`,
    rrule.trim(),
    `SUMMARY:${event.title.replace(/\n/g, " ")}`,
    `DESCRIPTION:${(event.description + (event.meetLink ? `\\nMeet: ${event.meetLink}` : "")).replace(/\n/g, "\\n")}`,
    `LOCATION:${(event.meetLink || event.location || "Online Google Meet").replace(/\n/g, " ")}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    `DESCRIPTION:Class Session Reminder: ${event.title}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute("download", `${event.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
