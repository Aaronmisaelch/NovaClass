import { generateTimeline } from "@/lib/schedule/timeline";
import type { Course, ScheduleConfig } from "@/lib/schedule/types";
import { getDaysRemaining } from "@/lib/tasks/format";
import type { Task } from "@/lib/tasks/types";
import { isValidTask } from "@/lib/tasks/valid";

export function getTaskCounts(tasks: Task[]): {
  pendiente: number;
  enProgreso: number;
} {
  const countable = tasks.filter(isValidTask);
  return {
    pendiente: countable.filter((task) => !task.completed && task.status === "pendiente")
      .length,
    enProgreso: countable.filter(
      (task) => !task.completed && task.status === "en_progreso"
    ).length,
  };
}

export function getWeeklyPerformance(tasks: Task[]): number[] {
  const now = new Date();
  const buckets = [0, 0, 0, 0];

  tasks.forEach((task) => {
    if (!task.completed || !task.completedAt || !isValidTask(task)) return;
    const completedDate = new Date(task.completedAt);
    if (
      completedDate.getFullYear() !== now.getFullYear() ||
      completedDate.getMonth() !== now.getMonth()
    ) {
      return;
    }
    const weekIndex = Math.min(3, Math.floor((completedDate.getDate() - 1) / 7));
    buckets[weekIndex] += 1;
  });

  return buckets;
}

export interface TodayClass {
  courseId: string;
  courseName: string;
  courseColor: string;
  startMinutes: number;
  endMinutes: number;
}

// The widget shows tomorrow's classes, not today's. Tomorrow lands on the
// schedule's Mon-Fri grid (dayIndex 0-4) except in two cases where there's
// never a class: tomorrow is Saturday (today is Friday) or tomorrow is
// Sunday (today is Saturday). Those two get a dedicated "status" instead of
// being reported as a plain empty day, so the widget can show a special
// message instead of the generic empty state. Sunday itself falls through
// normally, since tomorrow (Monday) does have classes.
export type TomorrowClasses =
  | { status: "classes"; classes: TodayClass[] }
  | { status: "friday" }
  | { status: "saturday" };

export function getTomorrowClasses(
  config: ScheduleConfig | null,
  cells: Record<string, string>,
  courses: Course[]
): TomorrowClasses {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDow = tomorrow.getDay();

  if (tomorrowDow === 6) return { status: "friday" };
  if (tomorrowDow === 0) return { status: "saturday" };

  if (!config) return { status: "classes", classes: [] };

  const dayIndex = tomorrowDow - 1;
  const coursesById = new Map(courses.map((course) => [course.id, course]));
  const timeline = generateTimeline(config);

  const classes = timeline
    .filter((row) => row.type === "block")
    .map((row) => {
      const courseId = cells[`${dayIndex}-${row.blockIndex}`];
      if (!courseId) return null;
      const course = coursesById.get(courseId);
      if (!course) return null;
      return {
        courseId,
        courseName: course.name,
        courseColor: course.color,
        startMinutes: row.startMinutes,
        endMinutes: row.endMinutes,
      };
    })
    .filter((item): item is TodayClass => item !== null);

  return { status: "classes", classes };
}

export function getMonthProgress(): {
  day: number;
  totalDays: number;
  percent: number;
  daysRemaining: number;
} {
  const now = new Date();
  const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const day = now.getDate();
  return {
    day,
    totalDays,
    percent: Math.round((day / totalDays) * 100),
    daysRemaining: totalDays - day,
  };
}

export interface PrioritizedTask {
  taskId: string;
  title: string;
  courseName: string;
  courseColor: string | null;
  dueDate: string | null;
}

// Flat list of active tasks (Pendiente/En progreso, with a course assigned),
// sorted by due-date urgency — closest deadline first. Tasks without a due
// date sort last, mirroring the "urgencia" sort used in the Tareas view.
export function getPrioritizedTasks(tasks: Task[], courses: Course[]): PrioritizedTask[] {
  const coursesById = new Map(courses.map((course) => [course.id, course]));

  return tasks
    .filter((task) => task.status !== "finalizado")
    .filter(isValidTask)
    .map((task) => {
      const course = coursesById.get(task.courseId);
      return {
        taskId: task.id,
        title: task.title,
        courseName: course?.name ?? "Curso eliminado",
        courseColor: course?.color ?? null,
        dueDate: task.dueDate,
      };
    })
    .sort((a, b) => {
      const aDays = getDaysRemaining(a.dueDate);
      const bDays = getDaysRemaining(b.dueDate);
      if (aDays === null && bDays === null) return 0;
      if (aDays === null) return 1;
      if (bDays === null) return -1;
      return aDays - bDays;
    });
}
