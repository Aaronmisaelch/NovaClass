"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, getMonthGridDates, parseDateKey, toDateKey } from "@/lib/calendar/month-grid";
import { EASE } from "@/lib/calendar/motion";

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

const WEEKDAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

const NAV_BUTTON_CLASS =
  "flex h-7 w-7 items-center justify-center rounded-full text-nova-navy/45 transition-colors duration-200 hover:bg-nova-navy/[0.05] hover:text-nova-navy";

// A self-contained calendar body (month nav + day grid), meant to be dropped
// into a popover shell. Not the Calendario module's grid — that one is built
// to show events across a whole month; this one is sized and simplified for
// picking a single date inline in a form.
export function DateCalendar({
  value,
  onChange,
  onClear,
}: {
  value: string | null;
  onChange: (dateKey: string) => void;
  onClear?: () => void;
}) {
  const [viewYear, setViewYear] = useState(() => (value ? parseDateKey(value) : new Date()).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => (value ? parseDateKey(value) : new Date()).getMonth());
  const [direction, setDirection] = useState(1);

  const today = useMemo(() => toDateKey(new Date()), []);
  const dates = useMemo(() => getMonthGridDates(viewYear, viewMonth), [viewYear, viewMonth]);

  function navigate(delta: number) {
    const next = addMonths(viewYear, viewMonth, delta);
    setDirection(delta);
    setViewYear(next.year);
    setViewMonth(next.month);
  }

  function selectDate(date: Date) {
    const dateMonthIndex = date.getFullYear() * 12 + date.getMonth();
    const viewMonthIndex = viewYear * 12 + viewMonth;
    if (dateMonthIndex !== viewMonthIndex) {
      setDirection(dateMonthIndex > viewMonthIndex ? 1 : -1);
      setViewYear(date.getFullYear());
      setViewMonth(date.getMonth());
    }
    onChange(toDateKey(date));
  }

  return (
    <div className="w-full p-4">
      <div className="mb-3 flex items-center justify-between">
        <motion.button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Mes anterior"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.15, ease: EASE }}
          className={NAV_BUTTON_CLASS}
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        </motion.button>

        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={`${viewYear}-${viewMonth}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="text-sm font-semibold tracking-tight text-nova-navy"
          >
            {MONTH_LABELS[viewMonth]} {viewYear}
          </motion.span>
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={() => navigate(1)}
          aria-label="Mes siguiente"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.15, ease: EASE }}
          className={NAV_BUTTON_CLASS}
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
        </motion.button>
      </div>

      <div className="mb-1.5 grid grid-cols-7">
        {WEEKDAY_LABELS.map((label, index) => (
          <span
            key={index}
            className="flex h-6 items-center justify-center text-[10px] font-semibold uppercase tracking-wider text-nova-navy/35"
          >
            {label}
          </span>
        ))}
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={`${viewYear}-${viewMonth}`}
            custom={direction}
            initial={{ x: direction >= 0 ? 24 : -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction >= 0 ? -24 : 24, opacity: 0 }}
            transition={{ duration: 0.26, ease: EASE }}
            className="grid grid-cols-7 gap-1"
          >
            {dates.map((date) => {
              const dateKey = toDateKey(date);
              const isCurrentMonth = date.getMonth() === viewMonth;
              const isToday = dateKey === today;
              const isSelected = value !== null && dateKey === value;

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => selectDate(date)}
                  className="flex h-9 w-9 items-center justify-center"
                >
                  <motion.span
                    whileHover={{ scale: isSelected ? 1 : 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] transition-colors ${
                      isSelected
                        ? "bg-gradient-to-br from-nova-electric to-nova-intermediate font-semibold text-nova-white shadow-[0_4px_12px_-4px_rgba(10,109,253,0.6)]"
                        : isToday
                          ? "border border-nova-electric/60 font-semibold text-nova-electric"
                          : isCurrentMonth
                            ? "font-medium text-nova-navy hover:bg-nova-navy/[0.05]"
                            : "font-medium text-nova-navy/25 hover:bg-nova-navy/[0.04]"
                    }`}
                  >
                    {date.getDate()}
                  </motion.span>
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="mt-3 w-full rounded-xl px-2 py-1.5 text-left text-xs text-nova-navy/50 transition-colors hover:bg-nova-navy/[0.04]"
        >
          Quitar fecha
        </button>
      )}
    </div>
  );
}
