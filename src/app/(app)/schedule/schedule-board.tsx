"use client";

import { useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Settings2, Share2, Trash2, X } from "lucide-react";
import { generateTimeline, formatRange } from "@/lib/schedule/timeline";
import { getCourseStyle } from "@/lib/schedule/colors";
import { cellKey, WEEKDAYS, type Course, type ScheduleConfig } from "@/lib/schedule/types";
import {
  addCourse,
  assignCourseToCell,
  clearCell,
  deleteCourse,
  deleteSchedule,
  updateCourse,
} from "@/lib/schedule/data";
import { CourseEditor } from "@/app/(app)/schedule/course-editor";
import { DeleteScheduleDialog } from "@/app/(app)/schedule/delete-schedule-dialog";
import { ExportMenu } from "@/app/(app)/schedule/export-menu";
import { ShareScheduleDialog } from "@/app/(app)/schedule/share-schedule-dialog";

const EASE = [0.22, 1, 0.36, 1] as const;

function CoursePill({ course, isOverlay }: { course: Course; isOverlay?: boolean }) {
  return (
    <span
      style={getCourseStyle(course.color)}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${
        isOverlay ? "shadow-lg" : ""
      }`}
    >
      {course.name}
    </span>
  );
}

function DraggableCourse({
  course,
  onEdit,
}: {
  course: Course;
  onEdit: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `course-${course.id}`,
    data: { courseId: course.id },
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isDragging ? 0.35 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25, ease: EASE }}
      whileHover={{ y: -1 }}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={getCourseStyle(course.color)}
      className="flex cursor-grab items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium active:cursor-grabbing"
    >
      {course.name}
      <button
        type="button"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={onEdit}
        className="opacity-50 hover:opacity-100"
      >
        <Settings2 className="h-3 w-3" />
      </button>
    </motion.div>
  );
}

function BlockCell({
  dayIndex,
  blockIndex,
  course,
  onClear,
}: {
  dayIndex: number;
  blockIndex: number;
  course: Course | null;
  onClear: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${dayIndex}-${blockIndex}`,
    data: { dayIndex, blockIndex },
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-16 rounded-2xl transition-colors ${
        course
          ? ""
          : isOver
            ? "border border-nova-electric bg-nova-electric/5"
            : "border border-dashed border-nova-navy/10"
      }`}
    >
      <AnimatePresence mode="wait">
        {course ? (
          <motion.div
            key={course.id}
            layout
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.25, ease: EASE }}
            style={getCourseStyle(course.color)}
            className="group relative flex h-full min-h-16 w-full flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-2 text-center"
          >
            <span className="line-clamp-3 break-words text-[16.5px] font-bold leading-tight">
              {course.name}
            </span>
            <button
              type="button"
              onClick={onClear}
              className="absolute right-1.5 top-1.5 rounded-full p-0.5 opacity-0 transition-opacity hover:bg-black/5 group-hover:opacity-60 hover:!opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        ) : !isOver ? (
          <div
            aria-hidden="true"
            className="pointer-events-none flex h-full min-h-16 w-full items-center justify-center"
          >
            <Plus className="h-3.5 w-3.5 text-nova-navy/10" strokeWidth={1.75} />
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function ScheduleBoard({
  uid,
  config,
  initialCourses,
  initialCells,
  onScheduleDeleted,
}: {
  uid: string;
  config: ScheduleConfig;
  initialCourses: Course[];
  initialCells: Record<string, string>;
  onScheduleDeleted: () => void;
}) {
  const [courses, setCourses] = useState(initialCourses);
  const [cells, setCells] = useState(initialCells);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | "new" | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareCode, setShareCode] = useState(config.shareCode ?? null);
  const gridRef = useRef<HTMLDivElement>(null);

  const timeline = useMemo(() => generateTimeline(config), [config]);
  const coursesById = useMemo(
    () => new Map(courses.map((course) => [course.id, course])),
    [courses]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveCourseId(event.active.data.current?.courseId ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCourseId(null);
    const { active, over } = event;
    if (!over) return;

    const courseId = active.data.current?.courseId as string | undefined;
    const dayIndex = over.data.current?.dayIndex as number | undefined;
    const blockIndex = over.data.current?.blockIndex as number | undefined;
    if (!courseId || dayIndex === undefined || blockIndex === undefined) return;

    const key = cellKey(dayIndex, blockIndex);
    setCells((current) => ({ ...current, [key]: courseId }));
    assignCourseToCell(uid, dayIndex, blockIndex, courseId).catch(() => {
      setCells((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    });
  }

  function handleClearCell(dayIndex: number, blockIndex: number) {
    const key = cellKey(dayIndex, blockIndex);
    setCells((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    clearCell(uid, dayIndex, blockIndex).catch(() => {});
  }

  async function handleSaveCourse(data: { name: string; color: string }) {
    if (editingCourse === "new") {
      const id = await addCourse(uid, data);
      setCourses((current) => [...current, { id, createdAt: Date.now(), ...data }]);
    } else if (editingCourse) {
      await updateCourse(uid, editingCourse.id, data);
      setCourses((current) =>
        current.map((course) =>
          course.id === editingCourse.id ? { ...course, ...data } : course
        )
      );
    }
    setEditingCourse(null);
  }

  async function handleDeleteCourse() {
    if (editingCourse === "new" || !editingCourse) return;
    const courseId = editingCourse.id;
    setCourses((current) => current.filter((course) => course.id !== courseId));
    setCells((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([, value]) => value !== courseId)
      )
    );
    setEditingCourse(null);
    await deleteCourse(uid, courseId).catch(() => {});
  }

  async function handleConfirmDeleteSchedule() {
    setDeleteDialogOpen(false);
    await deleteSchedule(uid).catch(() => {});
    onScheduleDeleted();
  }

  return (
    <main className="relative p-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="flex items-center gap-2.5 text-[29px] font-semibold text-nova-navy">
          <span className="h-2 w-2 rounded-full bg-gradient-to-br from-nova-electric to-nova-sky" />
          Schedule
        </h1>
        <div className="flex items-center gap-2">
          <ExportMenu targetRef={gridRef} />
          <button
            type="button"
            onClick={() => setShareDialogOpen(true)}
            className="flex items-center gap-2 rounded-full border border-nova-navy/10 px-4 py-2 text-[13px] font-medium text-nova-navy/70 transition-colors hover:bg-nova-navy/[0.03]"
          >
            <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            Compartir
          </button>
          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            className="flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-[13px] font-medium text-red-500 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar horario
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <AnimatePresence>
            {courses.map((course) => (
              <DraggableCourse
                key={course.id}
                course={course}
                onEdit={() => setEditingCourse(course)}
              />
            ))}
          </AnimatePresence>
          <button
            type="button"
            onClick={() => setEditingCourse("new")}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-nova-navy/5 text-nova-navy transition-colors hover:bg-nova-navy/10"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div
          ref={gridRef}
          className="grid gap-2 rounded-2xl bg-nova-white p-2"
          style={{ gridTemplateColumns: "110px repeat(5, minmax(0, 1fr))" }}
        >
          <div />
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="px-1 pb-2 text-center text-lg font-bold uppercase tracking-wide text-nova-navy/70"
            >
              {day}
            </div>
          ))}

          {timeline.map((row) =>
            row.type === "recreo" ? (
              <div
                key={`recreo-${row.recreoId}`}
                className="col-span-6 my-1 flex items-center gap-3 rounded-xl bg-nova-navy/[0.03] px-3 py-2 text-xs font-medium text-nova-navy/80"
              >
                <span>Recreo</span>
                <span className="h-px flex-1 bg-nova-navy/10" />
                <span>{formatRange(row.startMinutes, row.endMinutes)}</span>
              </div>
            ) : (
              <motion.div
                layout
                key={`block-${row.blockIndex}`}
                className="col-span-6 grid gap-2"
                style={{ gridTemplateColumns: "110px repeat(5, minmax(0, 1fr))" }}
              >
                <div className="flex items-center justify-center text-center text-xs font-medium text-nova-navy/80">
                  {formatRange(row.startMinutes, row.endMinutes)}
                </div>
                {WEEKDAYS.map((_, dayIndex) => {
                  const key = cellKey(dayIndex, row.blockIndex);
                  const course = cells[key] ? coursesById.get(cells[key]) ?? null : null;
                  return (
                    <BlockCell
                      key={key}
                      dayIndex={dayIndex}
                      blockIndex={row.blockIndex}
                      course={course}
                      onClear={() => handleClearCell(dayIndex, row.blockIndex)}
                    />
                  );
                })}
              </motion.div>
            )
          )}
        </div>

        <DragOverlay>
          {activeCourseId && coursesById.has(activeCourseId) ? (
            <CoursePill course={coursesById.get(activeCourseId) as Course} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      <AnimatePresence>
        {editingCourse && (
          <CourseEditor
            initial={editingCourse === "new" ? undefined : editingCourse}
            onSave={handleSaveCourse}
            onDelete={editingCourse === "new" ? undefined : handleDeleteCourse}
            onClose={() => setEditingCourse(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteDialogOpen && (
          <DeleteScheduleDialog
            onConfirm={handleConfirmDeleteSchedule}
            onClose={() => setDeleteDialogOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {shareDialogOpen && (
          <ShareScheduleDialog
            uid={uid}
            config={config}
            courses={courses}
            cells={cells}
            existingCode={shareCode}
            onCodeCreated={setShareCode}
            onClose={() => setShareDialogOpen(false)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
