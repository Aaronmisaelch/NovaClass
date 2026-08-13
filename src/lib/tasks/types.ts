export type TaskStatus = "pendiente" | "en_progreso" | "finalizado";

export const TASK_STATUSES: { id: TaskStatus; label: string }[] = [
  { id: "pendiente", label: "Pendiente" },
  { id: "en_progreso", label: "En progreso" },
  { id: "finalizado", label: "Finalizado" },
];

export interface Task {
  id: string;
  courseId: string | null;
  title: string;
  status: TaskStatus;
  completed: boolean;
  completedAt: number | null;
  dueDate: string | null;
  createdAt: number;
  updatedAt: number;
}

export type TaskSort = "urgencia" | "creacion" | "curso" | "estado";
