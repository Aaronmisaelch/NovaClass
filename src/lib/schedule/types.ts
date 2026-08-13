export const WEEKDAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
] as const;

export interface Recreo {
  id: string;
  startTime: string;
  durationMinutes: number;
}

export interface ScheduleConfig {
  startTime: string;
  blockCount: number;
  blockDurationMinutes: number;
  recreos: Recreo[];
  createdAt: number;
  updatedAt: number;
  // Set once the first time this schedule is shared, then reused on every
  // later "Compartir" click instead of minting a new code — deleting the
  // schedule (and this doc with it) is what makes room for a fresh one.
  shareCode?: string;
}

export interface Course {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface ScheduleAssignments {
  cells: Record<string, string>;
  updatedAt: number;
}

// A fixed snapshot taken at share time — courses keep their original ids
// only so an importer can remap `cells` to the copies it creates for itself;
// re-sharing after further edits produces a new, independent code rather
// than updating this one.
export interface ScheduleShareCourse {
  id: string;
  name: string;
  color: string;
}

export interface ScheduleShare {
  code: string;
  sharedBy: string;
  config: {
    startTime: string;
    blockCount: number;
    blockDurationMinutes: number;
    recreos: Recreo[];
  };
  courses: ScheduleShareCourse[];
  cells: Record<string, string>;
  createdAt: number;
}

export type TimelineRow =
  | {
      type: "block";
      blockIndex: number;
      startMinutes: number;
      endMinutes: number;
    }
  | {
      type: "recreo";
      recreoId: string;
      startMinutes: number;
      endMinutes: number;
    };

export function cellKey(dayIndex: number, blockIndex: number): string {
  return `${dayIndex}-${blockIndex}`;
}
