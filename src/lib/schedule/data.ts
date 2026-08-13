"use client";

import {
  addDoc,
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { cellKey, type Course, type Recreo, type ScheduleShare } from "@/lib/schedule/types";
import { tasksCollectionRef } from "@/lib/tasks/data";

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function findTasksLinkedToCourses(uid: string, courseIds: string[]) {
  if (courseIds.length === 0) return [];
  const results = await Promise.all(
    chunk(courseIds, 10).map((group) =>
      getDocs(query(tasksCollectionRef(uid), where("courseId", "in", group)))
    )
  );
  return results.flatMap((snapshot) => snapshot.docs);
}

export function scheduleConfigRef(uid: string) {
  return doc(db, "users", uid, "schedule", "config");
}

export function scheduleAssignmentsRef(uid: string) {
  return doc(db, "users", uid, "schedule", "assignments");
}

export function coursesCollectionRef(uid: string) {
  return collection(db, "users", uid, "courses");
}

export async function createSchedule(
  uid: string,
  config: {
    startTime: string;
    blockCount: number;
    blockDurationMinutes: number;
    recreos: Recreo[];
  }
): Promise<void> {
  const now = Date.now();
  await setDoc(scheduleConfigRef(uid), { ...config, createdAt: now, updatedAt: now });
  await setDoc(scheduleAssignmentsRef(uid), { cells: {}, updatedAt: now });
}

// Only clears the schedule structure (start time, blocks, recreos) and the
// cell assignments that depend on it — courses and their tasks are untouched,
// since deleting the schedule is meant to be reconfiguration, not account
// data loss. Courses just end up unassigned until dragged onto the new grid.
// (The mixed-courses bug this used to be widened to fix — a wrong "Importar
// horario" code followed by the correct one — actually belongs to import, not
// delete: see the full-replacement wipe at the top of importScheduleShare.)
export async function deleteSchedule(uid: string): Promise<void> {
  const batch = writeBatch(db);
  batch.delete(scheduleConfigRef(uid));
  batch.delete(scheduleAssignmentsRef(uid));
  await batch.commit();
}

export async function addCourse(
  uid: string,
  data: { name: string; color: string }
): Promise<string> {
  const created = await addDoc(coursesCollectionRef(uid), {
    ...data,
    createdAt: Date.now(),
  });
  return created.id;
}

export async function updateCourse(
  uid: string,
  courseId: string,
  data: Partial<{ name: string; color: string }>
): Promise<void> {
  await updateDoc(doc(db, "users", uid, "courses", courseId), data);
}

export async function deleteCourse(uid: string, courseId: string): Promise<void> {
  const assignmentsSnapshot = await getDoc(scheduleAssignmentsRef(uid));
  const cells = (assignmentsSnapshot.data()?.cells ?? {}) as Record<string, string>;
  const remainingCells = Object.fromEntries(
    Object.entries(cells).filter(([, value]) => value !== courseId)
  );
  const linkedTasks = await findTasksLinkedToCourses(uid, [courseId]);

  const batch = writeBatch(db);
  batch.delete(doc(db, "users", uid, "courses", courseId));
  batch.set(
    scheduleAssignmentsRef(uid),
    { cells: remainingCells, updatedAt: Date.now() },
    { merge: false }
  );
  linkedTasks.forEach((taskDoc) => batch.delete(taskDoc.ref));

  await batch.commit();
}

export async function assignCourseToCell(
  uid: string,
  dayIndex: number,
  blockIndex: number,
  courseId: string
): Promise<void> {
  await updateDoc(scheduleAssignmentsRef(uid), {
    [`cells.${cellKey(dayIndex, blockIndex)}`]: courseId,
    updatedAt: Date.now(),
  });
}

export async function clearCell(
  uid: string,
  dayIndex: number,
  blockIndex: number
): Promise<void> {
  await updateDoc(scheduleAssignmentsRef(uid), {
    [`cells.${cellKey(dayIndex, blockIndex)}`]: deleteField(),
    updatedAt: Date.now(),
  });
}

export function scheduleShareRef(code: string) {
  return doc(db, "scheduleShares", code);
}

function generateShareCode(): string {
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
}

// Mirrors createGroup's "generate, check inside a transaction, retry on
// collision" pattern from lib/teamclass/data.ts. The share is a one-time
// snapshot — nothing about it changes after this call, so it never needs an
// update path, only get (import) and this create.
export async function createScheduleShare(
  uid: string,
  config: {
    startTime: string;
    blockCount: number;
    blockDurationMinutes: number;
    recreos: Recreo[];
  },
  courses: Course[],
  cells: Record<string, string>
): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = generateShareCode();
    try {
      return await runTransaction(db, async (transaction) => {
        const existing = await transaction.get(scheduleShareRef(code));
        if (existing.exists()) {
          throw new Error("CODE_TAKEN");
        }
        const share: ScheduleShare = {
          code,
          sharedBy: uid,
          config,
          courses: courses.map((course) => ({
            id: course.id,
            name: course.name,
            color: course.color,
          })),
          cells,
          createdAt: Date.now(),
        };
        transaction.set(scheduleShareRef(code), share);
        return code;
      });
    } catch (error) {
      if (error instanceof Error && error.message === "CODE_TAKEN") continue;
      throw error;
    }
  }
  throw new Error("No se pudo generar un código disponible. Inténtalo de nuevo.");
}

// Remembers the share code on the schedule itself so a later "Compartir"
// click can reuse it instead of minting a new one — see ScheduleConfig.shareCode.
export async function saveScheduleShareCode(uid: string, code: string): Promise<void> {
  await updateDoc(scheduleConfigRef(uid), { shareCode: code });
}

// Creates the importer's own courses (never a reference to the sharer's) and
// their own schedule config/assignments from the snapshot, remapping cell
// course-ids from the sharer's originals to the importer's new copies.
// Import is always a full replacement, never a merge: whatever courses and
// schedule structure the user already had (from an earlier import, a wrong
// code, or manual setup) are wiped first, so the result is exactly the
// imported code's content — never a mix with what came before.
export async function importScheduleShare(uid: string, code: string): Promise<void> {
  const snapshot = await getDoc(scheduleShareRef(code));
  if (!snapshot.exists()) {
    throw new Error("NOT_FOUND");
  }
  const share = snapshot.data() as ScheduleShare;

  const existingCoursesSnapshot = await getDocs(coursesCollectionRef(uid));
  const existingCourseIds = existingCoursesSnapshot.docs.map((courseDoc) => courseDoc.id);
  const existingLinkedTasks = await findTasksLinkedToCourses(uid, existingCourseIds);

  const clearBatch = writeBatch(db);
  clearBatch.delete(scheduleConfigRef(uid));
  clearBatch.delete(scheduleAssignmentsRef(uid));
  existingCoursesSnapshot.docs.forEach((courseDoc) => clearBatch.delete(courseDoc.ref));
  existingLinkedTasks.forEach((taskDoc) => clearBatch.delete(taskDoc.ref));
  await clearBatch.commit();

  const courseIdMap = new Map<string, string>();
  for (const course of share.courses) {
    const newId = await addCourse(uid, { name: course.name, color: course.color });
    courseIdMap.set(course.id, newId);
  }

  const remappedCells: Record<string, string> = {};
  for (const [key, oldCourseId] of Object.entries(share.cells)) {
    const newCourseId = courseIdMap.get(oldCourseId);
    if (newCourseId) remappedCells[key] = newCourseId;
  }

  await createSchedule(uid, share.config);
  await setDoc(scheduleAssignmentsRef(uid), { cells: remappedCells, updatedAt: Date.now() });
}
