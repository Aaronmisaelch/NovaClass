"use client";

import { useEffect, useMemo, useState } from "react";
import { getDoc, getDocs } from "firebase/firestore";
import { useAuth } from "@/lib/auth/auth-provider";
import {
  coursesCollectionRef,
  scheduleAssignmentsRef,
  scheduleConfigRef,
} from "@/lib/schedule/data";
import type { Course, ScheduleConfig } from "@/lib/schedule/types";
import { tasksCollectionRef } from "@/lib/tasks/data";
import type { Task } from "@/lib/tasks/types";
import {
  addWidget,
  getDashboardConfig,
  getWidgets,
  removeWidget,
  reorderWidgets,
  saveFixedOrder,
  updateWidget,
} from "@/lib/dashboard/data";
import type {
  FixedWidgetId,
  Widget,
  WidgetConfig,
  WidgetType,
} from "@/lib/dashboard/types";
import { getTomorrowClasses } from "@/lib/dashboard/stats";
import { FixedWidgetsRow } from "@/app/(app)/dashboard/fixed-widgets-row";
import { CustomizableGrid } from "@/app/(app)/dashboard/customizable-grid";
import { AddWidgetMenu } from "@/app/(app)/dashboard/add-widget-menu";
import { getCachedView, setCachedView } from "@/lib/cache/view-cache";
import { SkeletonBlock } from "@/app/(app)/skeleton-block";

interface DashboardSnapshot {
  tasks: Task[];
  courses: Course[];
  scheduleConfig: ScheduleConfig | null;
  cells: Record<string, string>;
  fixedOrder: FixedWidgetId[];
  widgets: Widget[];
}

export function DashboardView() {
  const { user } = useAuth();
  const cacheKey = user ? `dashboard:${user.uid}` : null;
  const cached = cacheKey ? getCachedView<DashboardSnapshot>(cacheKey) : undefined;

  const [tasks, setTasks] = useState<Task[]>(cached?.tasks ?? []);
  const [courses, setCourses] = useState<Course[]>(cached?.courses ?? []);
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig | null>(
    cached?.scheduleConfig ?? null
  );
  const [cells, setCells] = useState<Record<string, string>>(cached?.cells ?? {});
  const [fixedOrder, setFixedOrder] = useState<FixedWidgetId[]>(cached?.fixedOrder ?? []);
  const [widgets, setWidgets] = useState<Widget[] | null>(cached?.widgets ?? null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      const uid = user!.uid;
      const [
        tasksSnapshot,
        coursesSnapshot,
        scheduleSnapshot,
        assignmentsSnapshot,
        dashboardConfig,
        dashboardWidgets,
      ] = await Promise.all([
        getDocs(tasksCollectionRef(uid)),
        getDocs(coursesCollectionRef(uid)),
        getDoc(scheduleConfigRef(uid)),
        getDoc(scheduleAssignmentsRef(uid)),
        getDashboardConfig(uid),
        getWidgets(uid),
      ]);
      if (cancelled) return;

      const snapshot: DashboardSnapshot = {
        tasks: tasksSnapshot.docs.map(
          (docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }) as Task
        ),
        courses: coursesSnapshot.docs.map(
          (docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }) as Course
        ),
        scheduleConfig: scheduleSnapshot.exists()
          ? (scheduleSnapshot.data() as ScheduleConfig)
          : null,
        cells: (assignmentsSnapshot.data()?.cells ?? {}) as Record<string, string>,
        fixedOrder: dashboardConfig.fixedOrder,
        widgets: dashboardWidgets,
      };

      setTasks(snapshot.tasks);
      setCourses(snapshot.courses);
      setScheduleConfig(snapshot.scheduleConfig);
      setCells(snapshot.cells);
      setFixedOrder(snapshot.fixedOrder);
      setWidgets(snapshot.widgets);
      setCachedView(`dashboard:${uid}`, snapshot);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const tomorrowClasses = useMemo(
    () => getTomorrowClasses(scheduleConfig, cells, courses),
    [scheduleConfig, cells, courses]
  );

  if (!user || widgets === null) {
    const CARD_SHADOW =
      "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_1px_2px_-1px_rgba(4,14,60,0.06),0_18px_40px_-22px_rgba(4,14,60,0.18)]";
    return (
      <main className="relative p-10">
        <SkeletonBlock className="mb-6 h-8 w-40" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonBlock key={index} className={`h-32 rounded-3xl ${CARD_SHADOW}`} />
          ))}
        </div>

        <div className="mb-4 mt-10 flex items-center justify-between">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-7 w-7 rounded-full" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonBlock key={index} className={`aspect-square rounded-3xl ${CARD_SHADOW}`} />
          ))}
        </div>
      </main>
    );
  }

  async function handleFixedReorder(order: FixedWidgetId[]) {
    setFixedOrder(order);
    await saveFixedOrder(user!.uid, order).catch(() => {});
  }

  async function handleAddWidget(type: WidgetType) {
    const widget = await addWidget(user!.uid, type, widgets!.length);
    setWidgets((current) => [...(current ?? []), widget]);
  }

  async function handleReorder(orderedIds: string[]) {
    setWidgets((current) => {
      if (!current) return current;
      const byId = new Map(current.map((widget) => [widget.id, widget]));
      return orderedIds.map((id) => byId.get(id)!).filter(Boolean);
    });
    await reorderWidgets(user!.uid, orderedIds).catch(() => {});
  }

  async function handleRemove(widgetId: string) {
    setWidgets((current) => (current ? current.filter((w) => w.id !== widgetId) : current));
    await removeWidget(user!.uid, widgetId).catch(() => {});
  }

  async function handleConfigChange(widgetId: string, config: WidgetConfig) {
    setWidgets((current) =>
      current ? current.map((w) => (w.id === widgetId ? { ...w, config } : w)) : current
    );
    await updateWidget(user!.uid, widgetId, { config }).catch(() => {});
  }

  return (
    <main className="relative p-10">
      <h1 className="mb-6 flex items-center gap-2.5 text-[29px] font-semibold text-nova-navy">
        <span className="h-2 w-2 rounded-full bg-gradient-to-br from-nova-electric to-nova-sky" />
        Dashboard
      </h1>

      <FixedWidgetsRow
        fixedOrder={fixedOrder}
        tasks={tasks}
        tomorrowClasses={tomorrowClasses}
        onReorder={handleFixedReorder}
      />

      <div className="mb-4 mt-10 flex items-center justify-between">
        <h2 className="text-sm font-medium text-nova-navy/50">Tus widgets</h2>
        <AddWidgetMenu onAdd={handleAddWidget} />
      </div>

      <CustomizableGrid
        widgets={widgets}
        courses={courses}
        tasks={tasks}
        onReorder={handleReorder}
        onRemove={handleRemove}
        onConfigChange={handleConfigChange}
      />
    </main>
  );
}
