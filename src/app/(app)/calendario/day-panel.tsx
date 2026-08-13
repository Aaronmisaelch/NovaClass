"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { X, CalendarX2 } from "lucide-react";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import { parseDateKey } from "@/lib/calendar/month-grid";
import type { CalendarEvent } from "@/lib/calendar/types";
import { EASE, CARD_SHADOW } from "@/lib/calendar/motion";
import { EventPill } from "@/app/(app)/calendario/event-pill";
import { EmptyState } from "@/app/(app)/empty-state";

function formatDayHeading(dateKey: string): string {
  const date = parseDateKey(dateKey);
  const formatted = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function PanelContent({
  dateKey,
  events,
  onClose,
}: {
  dateKey: string;
  events: CalendarEvent[];
  onClose: () => void;
}) {
  const isEmpty = events.length === 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-nova-navy/[0.05] px-6 py-5">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold leading-snug text-nova-navy">
            {formatDayHeading(dateKey)}
          </h2>
          {!isEmpty && (
            <p className="mt-1 text-xs font-medium text-nova-navy/40">
              {events.length} {events.length === 1 ? "evento" : "eventos"}
            </p>
          )}
        </div>
        <motion.button
          type="button"
          onClick={onClose}
          aria-label="Cerrar panel"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.15, ease: EASE }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-nova-navy/40 transition-colors hover:bg-nova-navy/[0.04] hover:text-nova-navy"
        >
          <X className="h-4 w-4" />
        </motion.button>
      </div>

      <div
        className={`flex flex-1 flex-col gap-3 overflow-y-auto px-6 py-5 ${
          isEmpty ? "items-center justify-center" : ""
        }`}
      >
        {isEmpty ? (
          <EmptyState
            icon={<CalendarX2 strokeWidth={1.5} />}
            title="Sin eventos"
            description="Este día no tiene tareas, entregas ni fechas registradas."
            compact
          />
        ) : (
          events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: EASE, delay: index * 0.04 }}
            >
              <EventPill event={event} variant="full" />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export function DayPanel({
  dateKey,
  events,
  onClose,
}: {
  dateKey: string;
  events: CalendarEvent[];
  onClose: () => void;
}) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const panelRef = useRef<HTMLDivElement>(null);

  useClickOutside(panelRef, onClose, !isDesktop);

  if (isDesktop) {
    return (
      <motion.aside
        layout
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 375, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{
          width: { duration: 0.4, ease: EASE },
          opacity: { duration: 0.25, ease: EASE, delay: 0.08 },
        }}
        className="h-full shrink-0 overflow-hidden"
      >
        <div className={`h-full w-[375px] overflow-hidden rounded-3xl border border-nova-navy/[0.04] bg-nova-white ${CARD_SHADOW}`}>
          <PanelContent dateKey={dateKey} events={events} onClose={onClose} />
        </div>
      </motion.aside>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: EASE }}
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-nova-navy/20"
      />
      <motion.div
        ref={panelRef}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 36 }}
        className="fixed inset-y-0 right-0 z-50 w-full overflow-hidden bg-nova-white shadow-[0_20px_60px_-30px_rgba(4,14,60,0.35)] sm:w-[420px] sm:border-l sm:border-nova-navy/5"
      >
        <PanelContent dateKey={dateKey} events={events} onClose={onClose} />
      </motion.div>
    </>
  );
}
