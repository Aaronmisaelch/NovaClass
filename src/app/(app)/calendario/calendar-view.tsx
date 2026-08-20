"use client";

import { useEffect, useMemo, useState } from "react";
import { onSnapshot } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { tasksCollectionRef } from "@/lib/tasks/data";
import type { Task } from "@/lib/tasks/types";
import { coursesCollectionRef } from "@/lib/schedule/data";
import type { Course } from "@/lib/schedule/types";
import { widgetsCollectionRef } from "@/lib/dashboard/data";
import type { Widget } from "@/lib/dashboard/types";
import { addMonths, getMonthGridDates } from "@/lib/calendar/month-grid";
import {
  buildBirthdayEvents,
  buildCountdownEvents,
  buildTaskEvents,
  groupEventsByDate,
} from "@/lib/calendar/build-events";
import { CalendarGrid } from "@/app/(app)/calendario/calendar-grid";
import { DayPanel } from "@/app/(app)/calendario/day-panel";
import { YearPicker } from "@/app/(app)/calendario/year-picker";
import { CARD_SHADOW, EASE } from "@/lib/calendar/motion";

const MONTH_LABELS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const NAV_BUTTON_CLASS =
  "flex h-9 w-9 items-center justify-center rounded-full text-nova-navy/45 transition-colors duration-200 hover:bg-nova-white hover:text-nova-navy hover:shadow-[0_1px_4px_-1px_rgba(4,14,60,0.12)]";

export function CalendarView() {
  const { user } = useAuth();

  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [direction, setDirection] = useState(1);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [widgets, setWidgets] = useState<Widget[]>([]);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(tasksCollectionRef(user.uid), (snapshot) => {
      setTasks(snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }) as Task));
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(coursesCollectionRef(user.uid), (snapshot) => {
      setCourses(
        snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }) as Course)
      );
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(widgetsCollectionRef(user.uid), (snapshot) => {
      setWidgets(
        snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }) as Widget)
      );
    });
  }, [user]);

  const coursesById = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);

  const visibleYears = useMemo(() => {
    const gridDates = getMonthGridDates(viewYear, viewMonth);
    return Array.from(new Set(gridDates.map((date) => date.getFullYear())));
  }, [viewYear, viewMonth]);

  const events = useMemo(
    () => [
      ...buildTaskEvents(tasks, coursesById),
      ...buildCountdownEvents(widgets),
      ...buildBirthdayEvents(widgets, visibleYears),
    ],
    [tasks, coursesById, widgets, visibleYears]
  );

  const eventsByDate = useMemo(() => groupEventsByDate(events), [events]);

  const selectedEvents = selectedDateKey ? (eventsByDate.get(selectedDateKey) ?? []) : [];

  function navigate(next: { year: number; month: number }, dir: number) {
    setDirection(dir);
    setViewYear(next.year);
    setViewMonth(next.month);
  }

  if (!user) {
    return <div className="p-10 text-sm text-nova-navy/40">Cargando…</div>;
  }

  return (
    <main className="relative p-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-2.5 text-[29px] font-semibold text-nova-navy">
          <span className="h-2 w-2 rounded-full bg-gradient-to-br from-nova-electric to-nova-sky" />
          Calendario
        </h1>

        <div className="flex items-center gap-0.5 rounded-full border border-nova-navy/5 bg-nova-navy/[0.02] p-1 shadow-[0_1px_2px_-1px_rgba(4,14,60,0.04)]">
          <motion.button
            type="button"
            onClick={() => navigate(addMonths(viewYear, viewMonth, -1), -1)}
            aria-label="Mes anterior"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.15, ease: EASE }}
            className={NAV_BUTTON_CLASS}
          >
            <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </motion.button>

          <YearPicker
            year={viewYear}
            onSelectYear={(selectedYear) =>
              navigate({ year: selectedYear, month: viewMonth }, selectedYear >= viewYear ? 1 : -1)
            }
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={`${viewMonth}-${viewYear}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="block text-[15px] font-semibold tracking-tight text-nova-navy"
              >
                {MONTH_LABELS[viewMonth]} {viewYear}
              </motion.span>
            </AnimatePresence>
          </YearPicker>

          <motion.button
            type="button"
            onClick={() => navigate(addMonths(viewYear, viewMonth, 1), 1)}
            aria-label="Mes siguiente"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.15, ease: EASE }}
            className={NAV_BUTTON_CLASS}
          >
            <ChevronRight className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </motion.button>
        </div>
      </div>

      <div className="flex items-start gap-6">
        <motion.div
          layout
          transition={{ duration: 0.4, ease: EASE }}
          style={{ background: "linear-gradient(165deg, #FFFFFF 0%, #F1F7FE 55%, #E8F1FE 100%)" }}
          className={`min-w-0 flex-1 rounded-3xl border border-nova-navy/[0.04] p-5 ${CARD_SHADOW}`}
        >
          <CalendarGrid
            year={viewYear}
            month={viewMonth}
            direction={direction}
            eventsByDate={eventsByDate}
            selectedDateKey={selectedDateKey}
            onSelectDate={setSelectedDateKey}
          />
        </motion.div>

        <AnimatePresence>
          {selectedDateKey && (
            <DayPanel
              dateKey={selectedDateKey}
              events={selectedEvents}
              onClose={() => setSelectedDateKey(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
