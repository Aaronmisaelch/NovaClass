"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Trash2 } from "lucide-react";
import type { Course } from "@/lib/schedule/types";
import type { Task, TaskStatus } from "@/lib/tasks/types";
import { CoursePicker } from "@/app/(app)/tareas/course-picker";
import { StatusPicker } from "@/app/(app)/tareas/status-picker";
import { DueDatePicker } from "@/app/(app)/tareas/due-date-picker";

const EASE = [0.22, 1, 0.36, 1] as const;
const GRID_TEMPLATE = "40px 148px minmax(140px,1fr) 40px 176px 200px";

export function TaskRow({
  task,
  course,
  courses,
  onToggleCompleted,
  onChangeCourse,
  onChangeTitle,
  onChangeStatus,
  onChangeDueDate,
  onDelete,
}: {
  task: Task;
  course: Course | null;
  courses: Course[];
  onToggleCompleted: (completed: boolean) => void;
  onChangeCourse: (courseId: string | null) => void;
  onChangeTitle: (title: string) => void;
  onChangeStatus: (status: TaskStatus) => void;
  onChangeDueDate: (dueDate: string | null) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(task.title);

  function commitTitle() {
    if (title !== task.title) onChangeTitle(title);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: task.completed ? 0.45 : 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.15, ease: EASE }}
      whileHover={{
        backgroundColor: "rgba(10,109,253,0.03)",
        transition: { duration: 0.15, ease: EASE },
      }}
      className="border-b border-nova-navy/[0.04] px-4 py-3.5"
    >
      {/* Desktop: 6-column table row, unchanged. */}
      <div
        className="hidden items-center gap-4 sm:grid"
        style={{ gridTemplateColumns: GRID_TEMPLATE }}
      >
        <motion.button
          type="button"
          onClick={() => onToggleCompleted(!task.completed)}
          aria-label="Completar tarea"
          whileHover={
            task.completed
              ? { scale: 1.05 }
              : { scale: 1.08, borderColor: "rgba(10,109,253,0.5)" }
          }
          whileTap={{ scale: 0.85 }}
          transition={{ duration: 0.2, ease: EASE }}
          className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-[1.5px] transition-colors duration-200"
          style={{
            borderColor: task.completed ? "#0A6DFD" : "rgba(4,14,60,0.22)",
            backgroundColor: task.completed ? "#0A6DFD" : "transparent",
            boxShadow: task.completed ? "0 2px 6px -2px rgba(10,109,253,0.45)" : "none",
          }}
        >
          <motion.span
            initial={false}
            animate={{ scale: task.completed ? 1 : 0, opacity: task.completed ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
          >
            <Check className="h-3 w-3 text-nova-white" strokeWidth={3} />
          </motion.span>
        </motion.button>

        <CoursePicker courses={courses} course={course} onChange={onChangeCourse} />

        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={commitTitle}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
          placeholder="Nombre de la tarea"
          className={`w-full rounded-lg bg-transparent px-2.5 py-1.5 text-[15px] font-medium text-nova-navy outline-none transition-colors placeholder:font-normal placeholder:text-nova-navy/30 focus:bg-nova-electric/[0.04] ${
            task.completed ? "line-through" : ""
          }`}
        />

        <motion.button
          type="button"
          onClick={onDelete}
          aria-label="Eliminar tarea"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.15, ease: EASE }}
          className="flex h-8 w-8 items-center justify-center rounded-full text-nova-navy/30 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </motion.button>

        <StatusPicker status={task.status} onChange={onChangeStatus} />

        <DueDatePicker dueDate={task.dueDate} onChange={onChangeDueDate} />
      </div>

      {/* Mobile: stacked card — checkbox/course/title up top, status/due date below. */}
      <div className="flex flex-col gap-2 sm:hidden">
        <div className="flex items-center gap-2.5">
          <motion.button
            type="button"
            onClick={() => onToggleCompleted(!task.completed)}
            aria-label="Completar tarea"
            whileHover={
              task.completed
                ? { scale: 1.05 }
                : { scale: 1.08, borderColor: "rgba(10,109,253,0.5)" }
            }
            whileTap={{ scale: 0.85 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors duration-200"
            style={{
              borderColor: task.completed ? "#0A6DFD" : "rgba(4,14,60,0.22)",
              backgroundColor: task.completed ? "#0A6DFD" : "transparent",
              boxShadow: task.completed ? "0 2px 6px -2px rgba(10,109,253,0.45)" : "none",
            }}
          >
            <motion.span
              initial={false}
              animate={{ scale: task.completed ? 1 : 0, opacity: task.completed ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
            >
              <Check className="h-3 w-3 text-nova-white" strokeWidth={3} />
            </motion.span>
          </motion.button>

          <div className="inline-block shrink-0">
            <CoursePicker courses={courses} course={course} onChange={onChangeCourse} />
          </div>

          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={commitTitle}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
            placeholder="Nombre de la tarea"
            className={`min-w-0 flex-1 rounded-lg bg-transparent px-2.5 py-1.5 text-[15px] font-medium text-nova-navy outline-none transition-colors placeholder:font-normal placeholder:text-nova-navy/30 focus:bg-nova-electric/[0.04] ${
              task.completed ? "line-through" : ""
            }`}
          />

          <motion.button
            type="button"
            onClick={onDelete}
            aria-label="Eliminar tarea"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.15, ease: EASE }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-nova-navy/30 transition-colors hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </motion.button>
        </div>

        <div className="flex flex-wrap items-center gap-2 pl-[32px]">
          <div className="inline-block">
            <StatusPicker status={task.status} onChange={onChangeStatus} />
          </div>
          <div className="inline-block">
            <DueDatePicker dueDate={task.dueDate} onChange={onChangeDueDate} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
