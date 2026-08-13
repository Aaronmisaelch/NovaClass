"use client";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { FixedWidgetId } from "@/lib/dashboard/types";
import type { Task } from "@/lib/tasks/types";
import type { TomorrowClasses } from "@/lib/dashboard/stats";
import { SortableFixedWidget } from "@/app/(app)/dashboard/sortable-fixed-widget";
import { PendingTasksWidget } from "@/app/(app)/dashboard/fixed/pending-tasks-widget";
import { MonthlyPerformanceWidget } from "@/app/(app)/dashboard/fixed/monthly-performance-widget";
import { TomorrowClassesWidget } from "@/app/(app)/dashboard/fixed/tomorrow-classes-widget";

export function FixedWidgetsRow({
  fixedOrder,
  tasks,
  tomorrowClasses,
  onReorder,
}: {
  fixedOrder: FixedWidgetId[];
  tasks: Task[];
  tomorrowClasses: TomorrowClasses;
  onReorder: (order: FixedWidgetId[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fixedOrder.indexOf(active.id as FixedWidgetId);
    const newIndex = fixedOrder.indexOf(over.id as FixedWidgetId);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorder(arrayMove(fixedOrder, oldIndex, newIndex));
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={fixedOrder} strategy={horizontalListSortingStrategy}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {fixedOrder.map((id) => (
            <SortableFixedWidget key={id} id={id}>
              {(dragHandleProps) => {
                switch (id) {
                  case "tareasPendientes":
                    return (
                      <PendingTasksWidget tasks={tasks} dragHandleProps={dragHandleProps} />
                    );
                  case "rendimientoMensual":
                    return (
                      <MonthlyPerformanceWidget
                        tasks={tasks}
                        dragHandleProps={dragHandleProps}
                      />
                    );
                  case "clasesHoy":
                    return (
                      <TomorrowClassesWidget
                        data={tomorrowClasses}
                        dragHandleProps={dragHandleProps}
                      />
                    );
                  default:
                    return null;
                }
              }}
            </SortableFixedWidget>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
