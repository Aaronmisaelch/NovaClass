"use client";

import { useEffect, useMemo, useState } from "react";
import { getDocs } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { coursesCollectionRef } from "@/lib/schedule/data";
import type { Course } from "@/lib/schedule/types";
import {
  addTask,
  deleteTask,
  purgeCompletedFromPreviousMonths,
  setTaskCompleted,
  setTaskStatus,
  tasksCollectionRef,
  updateTask,
} from "@/lib/tasks/data";
import { sortTasks } from "@/lib/tasks/sort";
import type { Task, TaskSort } from "@/lib/tasks/types";
import { TaskRow } from "@/app/(app)/tareas/task-row";
import { SortControl } from "@/app/(app)/tareas/sort-control";
import { NoTasksEmptyState } from "@/app/(app)/tareas/no-tasks-empty-state";
import { getCachedView, setCachedView } from "@/lib/cache/view-cache";

interface TareasSnapshot {
  tasks: Task[];
  courses: Course[];
}

export function TareasView() {
  const { user } = useAuth();
  const cacheKey = user ? `tareas:${user.uid}` : null;
  const cached = cacheKey ? getCachedView<TareasSnapshot>(cacheKey) : undefined;

  const [tasks, setTasks] = useState<Task[] | null>(cached?.tasks ?? null);
  const [courses, setCourses] = useState<Course[]>(cached?.courses ?? []);
  const [sort, setSort] = useState<TaskSort>("creacion");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      const [tasksSnapshot, coursesSnapshot] = await Promise.all([
        getDocs(tasksCollectionRef(user!.uid)),
        getDocs(coursesCollectionRef(user!.uid)),
      ]);
      if (cancelled) return;

      const loadedTasks = tasksSnapshot.docs.map(
        (docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }) as Task
      );
      const loadedCourses = coursesSnapshot.docs.map(
        (docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }) as Course
      );

      const activeTasks = await purgeCompletedFromPreviousMonths(user!.uid, loadedTasks);
      if (cancelled) return;

      setTasks(activeTasks);
      setCourses(loadedCourses);
      setCachedView(`tareas:${user!.uid}`, { tasks: activeTasks, courses: loadedCourses });
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const coursesById = useMemo(
    () => new Map(courses.map((course) => [course.id, course])),
    [courses]
  );

  const sortedTasks = useMemo(
    () => (tasks ? sortTasks(tasks, sort, coursesById) : []),
    [tasks, sort, coursesById]
  );

  function patchTask(taskId: string, patch: Partial<Task>) {
    setTasks((current) =>
      current
        ? current.map((task) => (task.id === taskId ? { ...task, ...patch } : task))
        : current
    );
  }

  function handleAddTask() {
    if (!user) return;
    const task = addTask(user.uid);
    setTasks((current) => (current ? [...current, task] : [task]));
  }

  function handleDeleteTask(taskId: string) {
    if (!user) return;
    setTasks((current) => (current ? current.filter((task) => task.id !== taskId) : current));
    deleteTask(user.uid, taskId).catch(() => {});
  }

  if (!user || tasks === null) {
    return <div className="p-10 text-sm text-nova-navy/40">Cargando…</div>;
  }

  return (
    <main className="relative p-10">
      <div className="mb-10 flex items-end justify-between">
        <h1 className="flex items-center gap-3 text-[29px] font-semibold tracking-tight text-nova-navy">
          <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-nova-electric to-nova-sky" />
          Mis Tareas
        </h1>
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-medium text-nova-navy/35">Ordenar por</span>
          <SortControl sort={sort} onChange={setSort} />
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {sortedTasks.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <NoTasksEmptyState onAddTask={handleAddTask} />
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden rounded-3xl border border-nova-navy/[0.04] bg-nova-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_1px_2px_-1px_rgba(4,14,60,0.06),0_18px_40px_-22px_rgba(4,14,60,0.18)]"
          >
            <div
              className="hidden gap-4 border-b border-nova-navy/[0.08] bg-nova-navy/[0.025] px-4 py-4 text-[13px] font-bold uppercase tracking-wider text-nova-navy sm:grid"
              style={{ gridTemplateColumns: "40px 148px minmax(140px,1fr) 40px 176px 200px" }}
            >
              <span />
              <span>Curso</span>
              <span>Tarea</span>
              <span />
              <span>Estado</span>
              <span>Entrega</span>
            </div>

            <AnimatePresence initial={false}>
              {sortedTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  course={task.courseId ? (coursesById.get(task.courseId) ?? null) : null}
                  courses={courses}
                  onToggleCompleted={(completed) => {
                    patchTask(task.id, {
                      completed,
                      completedAt: completed ? Date.now() : null,
                      status: completed ? "finalizado" : "pendiente",
                    });
                    setTaskCompleted(user.uid, task.id, completed).catch(() => {});
                  }}
                  onChangeCourse={(courseId) => {
                    patchTask(task.id, { courseId });
                    updateTask(user.uid, task.id, { courseId }).catch(() => {});
                  }}
                  onChangeTitle={(title) => {
                    patchTask(task.id, { title });
                    updateTask(user.uid, task.id, { title }).catch(() => {});
                  }}
                  onChangeStatus={(status) => {
                    const completed = status === "finalizado";
                    patchTask(task.id, {
                      status,
                      completed,
                      completedAt: completed ? Date.now() : null,
                    });
                    setTaskStatus(user.uid, task.id, status).catch(() => {});
                  }}
                  onChangeDueDate={(dueDate) => {
                    patchTask(task.id, { dueDate });
                    updateTask(user.uid, task.id, { dueDate }).catch(() => {});
                  }}
                  onDelete={() => handleDeleteTask(task.id)}
                />
              ))}
            </AnimatePresence>

            <motion.button
              type="button"
              onClick={handleAddTask}
              whileHover={{ backgroundColor: "rgba(10,109,253,0.04)" }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex w-full items-center gap-2.5 border-t border-nova-navy/[0.04] px-4 py-3.5 text-left text-sm font-medium text-nova-navy/60"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-nova-electric/10 text-nova-electric transition-colors">
                <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
              </span>
              Agregar tarea
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
