"use client";

import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { WidgetCard } from "@/app/(app)/dashboard/widget-card";
import { AnimatedList } from "@/components/ui/animated-list";
import { cn } from "@/lib/utils";
import { getCourseColor, hexToRgba } from "@/lib/schedule/colors";
import { getPrioritizedTasks, type PrioritizedTask } from "@/lib/dashboard/stats";
import { formatDueDate, getDaysRemaining, getUrgencyClass } from "@/lib/tasks/format";
import { useSmoothWheelScroll } from "@/lib/hooks/use-smooth-wheel-scroll";
import type { Course } from "@/lib/schedule/types";
import type { Task } from "@/lib/tasks/types";

function TaskListItem({ task }: { task: PrioritizedTask }) {
  const accent = task.courseColor ? getCourseColor(task.courseColor).hex : "#040E3C";
  const daysRemaining = getDaysRemaining(task.dueDate);

  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-nova-navy/[0.06] bg-nova-white/95 px-3 py-2.5 shadow-[0_6px_16px_-12px_rgba(4,14,60,0.35)]">
      <span
        className="relative inline-flex size-8 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: hexToRgba(accent, 0.16), color: accent }}
      >
        <CalendarDays className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-semibold text-nova-navy">{task.title}</p>
        <p className="truncate text-[9.5px] text-nova-navy/50">{task.courseName}</p>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-medium leading-none",
          getUrgencyClass(daysRemaining)
        )}
      >
        {formatDueDate(task.dueDate) ?? "Sin fecha"}
      </span>
    </div>
  );
}

export function TaskSummaryWidget({
  tasks,
  courses,
  dragHandleProps,
}: {
  tasks: Task[];
  courses: Course[];
  dragHandleProps?: Record<string, unknown>;
}) {
  const prioritized = getPrioritizedTasks(tasks, courses);
  const scrollRef = useSmoothWheelScroll<HTMLDivElement>();

  return (
    // WidgetCard's own p-5 is symmetric; this widget instead uses a
    // deliberately lopsided pl-3/pr-2 so the cards sit close to the grid's
    // left edge and the reclaimed width on the right goes to the card text,
    // which is what was getting clipped at laptop widths.
    <WidgetCard dragHandleProps={dragHandleProps} noPadding>
      <div className="flex h-full min-h-0 flex-col pb-5 pl-3 pr-2 pt-5">
        <p className="mb-3 text-[14px] font-medium text-nova-navy">Resumen de tareas</p>

        {prioritized.length === 0 ? (
          <div className="relative flex flex-1 flex-col items-center justify-center gap-4 overflow-hidden px-4 text-center">
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute h-28 w-28 rounded-full blur-2xl"
              style={{ background: "radial-gradient(circle, rgba(10,109,253,0.14) 0%, rgba(10,109,253,0) 70%)" }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.85, 0.5] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative flex w-full max-w-[13rem] flex-col gap-2">
              {[0.9, 0.7, 0.5].map((width, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-2"
                  animate={{ opacity: [0.5, 0.85, 0.5] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-nova-electric/30" />
                  <span
                    className="h-2 flex-1 rounded-full bg-nova-navy/[0.06]"
                    style={{ maxWidth: `${width * 100}%` }}
                  />
                </motion.div>
              ))}
            </div>
            <div className="relative">
              <p className="text-[14px] font-bold text-nova-navy">Aún no hay tareas activas</p>
              <p className="mt-1 max-w-[14rem] text-[11px] leading-relaxed text-nova-navy/40">
                Tu carga académica activa aparecerá aquí en cuanto sumes una tarea con curso.
              </p>
            </div>
          </div>
        ) : (
          <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden">
            {/* AnimatedList reveals children in the order given, and each
                newly-revealed one is placed above the ones already showing —
                so the *last* child to reveal ends up on top. `prioritized`
                is sorted most-urgent-first, and we want the most urgent
                task at the top, so it must be the last one revealed: pass
                the reversed order (least urgent / no date first, most
                urgent last) here. */}
            <AnimatedList delay={100}>
              {[...prioritized].reverse().map((task) => (
                <TaskListItem key={task.taskId} task={task} />
              ))}
            </AnimatedList>
          </div>
        )}
      </div>
    </WidgetCard>
  );
}
