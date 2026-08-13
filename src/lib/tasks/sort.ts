import type { Course } from "@/lib/schedule/types";
import { getDaysRemaining } from "@/lib/tasks/format";
import type { Task, TaskSort } from "@/lib/tasks/types";

const STATUS_ORDER: Record<Task["status"], number> = {
  pendiente: 0,
  en_progreso: 1,
  finalizado: 2,
};

export function sortTasks(
  tasks: Task[],
  sort: TaskSort,
  coursesById: Map<string, Course>
): Task[] {
  const active = tasks.filter((task) => !task.completed);
  const completed = tasks
    .filter((task) => task.completed)
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));

  const sortedActive = [...active].sort((a, b) => {
    switch (sort) {
      case "urgencia": {
        const aDays = getDaysRemaining(a.dueDate);
        const bDays = getDaysRemaining(b.dueDate);
        if (aDays === null && bDays === null) return a.createdAt - b.createdAt;
        if (aDays === null) return 1;
        if (bDays === null) return -1;
        return aDays - bDays;
      }
      case "curso": {
        const aName = a.courseId ? (coursesById.get(a.courseId)?.name ?? "") : "";
        const bName = b.courseId ? (coursesById.get(b.courseId)?.name ?? "") : "";
        if (!aName && !bName) return a.createdAt - b.createdAt;
        if (!aName) return 1;
        if (!bName) return -1;
        return aName.localeCompare(bName) || a.createdAt - b.createdAt;
      }
      case "estado":
        return (
          STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.createdAt - b.createdAt
        );
      case "creacion":
      default:
        return a.createdAt - b.createdAt;
    }
  });

  return [...sortedActive, ...completed];
}
