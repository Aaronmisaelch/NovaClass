"use client";

import { AnimatePresence, motion } from "framer-motion";
import { getMonthGridDates, toDateKey } from "@/lib/calendar/month-grid";
import type { CalendarEvent } from "@/lib/calendar/types";
import { CalendarDayCell } from "@/app/(app)/calendario/calendar-day-cell";
import { EASE } from "@/lib/calendar/motion";

const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function CalendarGrid({
  year,
  month,
  direction,
  eventsByDate,
  selectedDateKey,
  onSelectDate,
}: {
  year: number;
  month: number;
  direction: number;
  eventsByDate: Map<string, CalendarEvent[]>;
  selectedDateKey: string | null;
  onSelectDate: (dateKey: string) => void;
}) {
  const dates = getMonthGridDates(year, month);
  const today = toDateKey(new Date());

  return (
    <div className="relative overflow-hidden">
      <div className="mb-2 grid grid-cols-7">
        {WEEKDAY_LABELS.map((label) => (
          <span
            key={label}
            className="pb-1 text-center text-[13px] font-bold uppercase tracking-wider text-nova-navy/65"
          >
            {label}
          </span>
        ))}
      </div>

      {/* Cells carry their own top/left hairline; this wrapper closes the
          frame with a matching bottom/right edge so the grid reads as one
          continuous surface instead of 42 separately-bordered cells. */}
      <div className="overflow-hidden rounded-2xl border-b border-r border-nova-navy/[0.05]">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={`${year}-${month}`}
            custom={direction}
            initial={{ x: direction >= 0 ? 28 : -28, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction >= 0 ? -28 : 28, opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="grid grid-cols-7"
          >
            {dates.map((date) => {
              const dateKey = toDateKey(date);
              return (
                <CalendarDayCell
                  key={dateKey}
                  day={date.getDate()}
                  events={eventsByDate.get(dateKey) ?? []}
                  isCurrentMonth={date.getMonth() === month}
                  isToday={dateKey === today}
                  isSelected={dateKey === selectedDateKey}
                  onSelect={() => onSelectDate(dateKey)}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
