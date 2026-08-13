import { getCourseColor } from "@/lib/schedule/colors";
import type { Course } from "@/lib/schedule/types";
import type { Task } from "@/lib/tasks/types";
import { isValidTask } from "@/lib/tasks/valid";
import type { BirthdayConfig, CountdownConfig, Widget } from "@/lib/dashboard/types";
import { parseBirthDate } from "@/lib/dashboard/birthday";
import { BIRTHDAY_COLOR, COUNTDOWN_COLOR, getEventStyle } from "@/lib/calendar/colors";
import { isLeapYear } from "@/lib/calendar/month-grid";
import {
  KIND_ORDER,
  type BirthdayCalendarEvent,
  type CalendarEvent,
  type CountdownCalendarEvent,
  type TaskCalendarEvent,
} from "@/lib/calendar/types";

export function buildTaskEvents(
  tasks: Task[],
  coursesById: Map<string, Course>
): TaskCalendarEvent[] {
  return tasks
    .filter(isValidTask)
    .filter((task): task is Task & { courseId: string; dueDate: string } => Boolean(task.dueDate))
    .map((task): TaskCalendarEvent => {
      const course = coursesById.get(task.courseId) ?? null;
      const style = course
        ? getEventStyle(getCourseColor(course.color).hex)
        : getEventStyle("", true);

      return {
        kind: "tarea",
        id: `tarea-${task.id}`,
        date: task.dueDate,
        title: task.title.trim(),
        style,
        courseName: course?.name ?? null,
      };
    });
}

export function buildCountdownEvents(widgets: Widget[]): CountdownCalendarEvent[] {
  const style = getEventStyle(COUNTDOWN_COLOR);

  return widgets
    .filter((widget) => widget.type === "countdown")
    .map((widget) => ({ id: widget.id, config: widget.config as Partial<CountdownConfig> }))
    .filter(
      (entry): entry is { id: string; config: CountdownConfig } =>
        Boolean(entry.config.title?.trim() && entry.config.targetDate)
    )
    .map(
      ({ id, config }): CountdownCalendarEvent => ({
        kind: "countdown",
        id: `countdown-${id}`,
        date: config.targetDate,
        title: config.title.trim(),
        style,
      })
    );
}

function birthdayOccurrenceInYear(birthDate: string, year: number): string {
  const { month, day } = parseBirthDate(birthDate);
  const safeDay = month === 2 && day === 29 && !isLeapYear(year) ? 28 : day;
  const paddedMonth = String(month).padStart(2, "0");
  const paddedDay = String(safeDay).padStart(2, "0");
  return `${year}-${paddedMonth}-${paddedDay}`;
}

// Each Cumpleaños widget is its own independent person's birthday (self,
// friends, ...) — every one of them shows up on the calendar every year.
export function buildBirthdayEvents(
  widgets: Widget[],
  visibleYears: number[]
): BirthdayCalendarEvent[] {
  const style = getEventStyle(BIRTHDAY_COLOR);

  const entries = widgets
    .filter((widget) => widget.type === "cumpleanos")
    .map((widget) => ({ id: widget.id, config: widget.config as Partial<BirthdayConfig> }))
    .filter(
      (entry): entry is { id: string; config: BirthdayConfig } =>
        Boolean(entry.config.name?.trim() && entry.config.birthDate)
    );

  const events: BirthdayCalendarEvent[] = [];
  for (const { id, config } of entries) {
    for (const year of visibleYears) {
      events.push({
        kind: "cumpleanos",
        id: `cumpleanos-${id}-${year}`,
        date: birthdayOccurrenceInYear(config.birthDate, year),
        title: config.name.trim(),
        style,
      });
    }
  }
  return events;
}

export function groupEventsByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const bucket = map.get(event.date);
    if (bucket) bucket.push(event);
    else map.set(event.date, [event]);
  }

  for (const bucket of map.values()) {
    bucket.sort((a, b) => {
      const kindDiff = KIND_ORDER[a.kind] - KIND_ORDER[b.kind];
      if (kindDiff !== 0) return kindDiff;
      return a.title.localeCompare(b.title);
    });
  }

  return map;
}
