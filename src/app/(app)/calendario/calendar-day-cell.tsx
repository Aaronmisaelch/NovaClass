"use client";

import { motion } from "framer-motion";
import type { CalendarEvent } from "@/lib/calendar/types";
import { EventPill } from "@/app/(app)/calendario/event-pill";
import { EASE } from "@/lib/calendar/motion";

const MAX_VISIBLE_PILLS = 3;

export function CalendarDayCell({
  day,
  events,
  isCurrentMonth,
  isToday,
  isSelected,
  onSelect,
}: {
  day: number;
  events: CalendarEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const hasOverflow = events.length > MAX_VISIBLE_PILLS;
  const visibleEvents = hasOverflow ? events.slice(0, MAX_VISIBLE_PILLS) : events;
  const overflowCount = events.length - visibleEvents.length;

  const showSelectedRing = isSelected && !isToday;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ backgroundColor: "rgba(4,14,60,0.032)" }}
      transition={{ duration: 0.25, ease: EASE }}
      className="flex h-full flex-col items-stretch gap-1 border-l border-t border-nova-navy/[0.05] p-2 text-left sm:aspect-square sm:h-auto"
    >
      <div className="relative flex h-6 w-6 shrink-0 items-center justify-center">
        {isToday && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-2.5 rounded-full bg-nova-electric/[0.12] blur-md"
          />
        )}
        <motion.span
          animate={{ scale: isSelected ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
          className={`relative flex h-6 w-6 items-center justify-center rounded-full text-[14px] font-semibold ${
            isToday
              ? "bg-nova-electric text-nova-white"
              : showSelectedRing
                ? "border-2 border-nova-electric text-nova-electric"
                : isCurrentMonth
                  ? "text-nova-navy"
                  : "text-nova-navy/25"
          }`}
        >
          {day}
        </motion.span>
      </div>

      <div
        className={`flex flex-1 flex-col gap-1.5 overflow-hidden transition-opacity duration-300 sm:gap-1 ${
          isCurrentMonth ? "" : "opacity-40"
        }`}
      >
        {visibleEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: EASE, delay: index * 0.04 }}
          >
            <EventPill event={event} variant="compact" />
          </motion.div>
        ))}
        {hasOverflow && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.22, ease: EASE, delay: visibleEvents.length * 0.04 }}
            className="truncate px-1.5 text-[10px] font-medium text-nova-navy/40"
          >
            +{overflowCount} más
          </motion.span>
        )}
      </div>
    </motion.button>
  );
}
