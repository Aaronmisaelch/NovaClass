export type CalendarEventKind = "tarea" | "countdown" | "cumpleanos";

export interface EventStyle {
  backgroundColor: string;
  borderColor: string;
  color: string;
}

interface CalendarEventBase {
  id: string;
  date: string; // "YYYY-MM-DD"
  title: string;
  style: EventStyle;
}

export interface TaskCalendarEvent extends CalendarEventBase {
  kind: "tarea";
  courseName: string | null;
}

export interface CountdownCalendarEvent extends CalendarEventBase {
  kind: "countdown";
}

export interface BirthdayCalendarEvent extends CalendarEventBase {
  kind: "cumpleanos";
}

export type CalendarEvent = TaskCalendarEvent | CountdownCalendarEvent | BirthdayCalendarEvent;

export const KIND_ORDER: Record<CalendarEventKind, number> = {
  tarea: 0,
  countdown: 1,
  cumpleanos: 2,
};
