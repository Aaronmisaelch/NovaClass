"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Task, TaskStatus } from "@/lib/tasks/types";

export function tasksCollectionRef(uid: string) {
  return collection(db, "users", uid, "tasks");
}

// Synchronous on purpose: doc() allocates an id locally with no network
// round-trip, so the caller can render the new row immediately instead of
// waiting on the write — the write itself still happens, just in the
// background, matching how every other optimistic update in this module
// (setTaskCompleted, updateTask, ...) is already fired-and-forgotten from
// the view.
export function addTask(uid: string): Task {
  const ref = doc(tasksCollectionRef(uid));
  const now = Date.now();
  const data = {
    courseId: null,
    title: "",
    status: "pendiente" as TaskStatus,
    completed: false,
    completedAt: null,
    dueDate: null,
    createdAt: now,
    updatedAt: now,
  };
  setDoc(ref, data).catch(() => {});
  return { id: ref.id, ...data };
}

export async function updateTask(
  uid: string,
  taskId: string,
  patch: Partial<Omit<Task, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, "users", uid, "tasks", taskId), {
    ...patch,
    updatedAt: Date.now(),
  });
}

// "completed" and "status === finalizado" always represent the same thing —
// whichever control the user touches, both fields get written together.
export async function setTaskCompleted(
  uid: string,
  taskId: string,
  completed: boolean
): Promise<void> {
  await updateTask(uid, taskId, {
    completed,
    completedAt: completed ? Date.now() : null,
    status: completed ? "finalizado" : "pendiente",
  });
}

export async function setTaskStatus(
  uid: string,
  taskId: string,
  status: TaskStatus
): Promise<void> {
  const completed = status === "finalizado";
  await updateTask(uid, taskId, {
    status,
    completed,
    completedAt: completed ? Date.now() : null,
  });
}

export async function deleteTask(uid: string, taskId: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "tasks", taskId));
}

export async function deleteTasksByCourseId(
  uid: string,
  courseId: string
): Promise<void> {
  const snapshot = await getDocs(
    query(tasksCollectionRef(uid), where("courseId", "==", courseId))
  );
  if (snapshot.empty) return;

  const batch = writeBatch(db);
  snapshot.forEach((taskDoc) => batch.delete(taskDoc.ref));
  await batch.commit();
}

export async function purgeCompletedFromPreviousMonths(
  uid: string,
  tasks: Task[]
): Promise<Task[]> {
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${now.getMonth()}`;

  const expired = tasks.filter((task) => {
    if (!task.completed || !task.completedAt) return false;
    const completedDate = new Date(task.completedAt);
    const completedMonthKey = `${completedDate.getFullYear()}-${completedDate.getMonth()}`;
    return completedMonthKey !== currentMonthKey;
  });

  if (expired.length === 0) return tasks;

  const batch = writeBatch(db);
  expired.forEach((task) => batch.delete(doc(db, "users", uid, "tasks", task.id)));
  await batch.commit();

  const expiredIds = new Set(expired.map((task) => task.id));
  return tasks.filter((task) => !expiredIds.has(task.id));
}
