"use client";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { AnimatePresence } from "framer-motion";
import type { Course } from "@/lib/schedule/types";
import type { Task } from "@/lib/tasks/types";
import type {
  BirthdayConfig,
  ClockConfig,
  CountdownConfig,
  Widget,
  WidgetConfig,
} from "@/lib/dashboard/types";
import { SortableWidget } from "@/app/(app)/dashboard/sortable-widget";
import { ClockWidget } from "@/app/(app)/dashboard/widgets/clock-widget";
import { DateWidget } from "@/app/(app)/dashboard/widgets/date-widget";
import { CountdownWidget } from "@/app/(app)/dashboard/widgets/countdown-widget";
import { BirthdayWidget } from "@/app/(app)/dashboard/widgets/birthday-widget";
import { CourseCollectionWidget } from "@/app/(app)/dashboard/widgets/course-collection-widget";
import { MonthThermometerWidget } from "@/app/(app)/dashboard/widgets/month-thermometer-widget";
import { TaskSummaryWidget } from "@/app/(app)/dashboard/widgets/task-summary-widget";
import { NoWidgetsEmptyState } from "@/app/(app)/dashboard/no-widgets-empty-state";

export function CustomizableGrid({
  widgets,
  courses,
  tasks,
  onReorder,
  onRemove,
  onConfigChange,
}: {
  widgets: Widget[];
  courses: Course[];
  tasks: Task[];
  onReorder: (orderedIds: string[]) => void;
  onRemove: (widgetId: string) => void;
  onConfigChange: (widgetId: string, config: WidgetConfig) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = widgets.findIndex((widget) => widget.id === active.id);
    const newIndex = widgets.findIndex((widget) => widget.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(widgets, oldIndex, newIndex);
    onReorder(reordered.map((widget) => widget.id));
  }

  if (widgets.length === 0) {
    return <NoWidgetsEmptyState />;
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={widgets.map((widget) => widget.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-4 gap-4" style={{ gridAutoFlow: "dense" }}>
          <AnimatePresence>
            {widgets.map((widget) => (
              <SortableWidget
                key={widget.id}
                id={widget.id}
                onRemove={() => onRemove(widget.id)}
                rowSpan={widget.type === "coleccionCursos" ? 2 : 1}
              >
                {(dragHandleProps) => {
                  switch (widget.type) {
                    case "hora":
                      return (
                        <ClockWidget
                          config={widget.config as Partial<ClockConfig>}
                          onConfigChange={(config) => onConfigChange(widget.id, config)}
                          dragHandleProps={dragHandleProps}
                        />
                      );
                    case "fecha":
                      return <DateWidget dragHandleProps={dragHandleProps} />;
                    case "countdown":
                      return (
                        <CountdownWidget
                          config={widget.config as Partial<CountdownConfig>}
                          variant={widget.variant}
                          createdAt={widget.createdAt}
                          onConfigChange={(config) => onConfigChange(widget.id, config)}
                          dragHandleProps={dragHandleProps}
                        />
                      );
                    case "cumpleanos":
                      return (
                        <BirthdayWidget
                          config={widget.config as Partial<BirthdayConfig>}
                          variant={widget.variant}
                          onConfigChange={(config) => onConfigChange(widget.id, config)}
                          dragHandleProps={dragHandleProps}
                        />
                      );
                    case "coleccionCursos":
                      return (
                        <CourseCollectionWidget
                          courses={courses}
                          dragHandleProps={dragHandleProps}
                        />
                      );
                    case "termometroMes":
                      return <MonthThermometerWidget dragHandleProps={dragHandleProps} />;
                    case "resumenTareas":
                      return (
                        <TaskSummaryWidget
                          tasks={tasks}
                          courses={courses}
                          dragHandleProps={dragHandleProps}
                        />
                      );
                    default:
                      return null;
                  }
                }}
              </SortableWidget>
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>
    </DndContext>
  );
}
