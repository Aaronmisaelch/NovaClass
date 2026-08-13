import type { Task } from "@/lib/tasks/types";

// A personal task only counts outside of "Mis Tareas" itself — Dashboard
// stats/widgets, Calendario — once it has both a course and a name. Until
// then it still exists as an editable row in "Mis Tareas", just not
// anywhere aggregates or events are built from tasks.
export function isValidTask(task: Task): task is Task & { courseId: string } {
  return task.courseId !== null && task.title.trim().length > 0;
}
