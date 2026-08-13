"use client";

import { motion } from "framer-motion";
import { BookOpen, Cake, Timer, type LucideIcon } from "lucide-react";
import type { CalendarEvent, CalendarEventKind } from "@/lib/calendar/types";
import { hexToRgba } from "@/lib/schedule/colors";
import { EASE } from "@/lib/calendar/motion";

const REST_SHADOW_COMPACT = "0 1px 2px -1px rgba(4,14,60,0.05)";
const HOVER_SHADOW_COMPACT = "0 5px 12px -5px rgba(4,14,60,0.18)";
const REST_SHADOW_FULL = "0 1px 2px -1px rgba(4,14,60,0.05)";
const HOVER_SHADOW_FULL = "0 8px 20px -8px rgba(4,14,60,0.16)";

const KIND_ICON: Record<CalendarEventKind, LucideIcon> = {
  tarea: BookOpen,
  countdown: Timer,
  cumpleanos: Cake,
};

function getSecondaryLabel(event: CalendarEvent): string | null {
  if (event.kind === "tarea") return event.courseName;
  return null;
}

function getCompactLabel(event: CalendarEvent): string {
  if (event.kind === "tarea") return event.courseName?.trim() || "Sin curso";
  return event.title;
}

export function EventPill({
  event,
  variant = "compact",
}: {
  event: CalendarEvent;
  variant?: "compact" | "full";
}) {
  const isNeutral = event.kind === "tarea" && event.courseName === null;
  const Icon = KIND_ICON[event.kind];

  if (variant === "full") {
    const secondaryLabel = getSecondaryLabel(event);
    // style.color is a raw hex for real event colors but an already-resolved
    // rgba() string in the neutral "sin curso" case — only re-tint via
    // hexToRgba when it's safe to do so.
    const iconBadgeBg = isNeutral ? "rgba(4,14,60,0.07)" : hexToRgba(event.style.color, 0.16);

    return (
      <motion.div
        initial={{ boxShadow: REST_SHADOW_FULL }}
        whileHover={{ y: -1, boxShadow: HOVER_SHADOW_FULL }}
        transition={{ duration: 0.22, ease: EASE }}
        className={`flex items-center gap-4 rounded-2xl border px-4 py-4 ${
          isNeutral ? "border-dashed" : ""
        }`}
        style={{ backgroundColor: event.style.backgroundColor, borderColor: event.style.borderColor }}
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: iconBadgeBg }}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} style={{ color: event.style.color }} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-snug text-nova-navy">{event.title}</p>
          {secondaryLabel && (
            <p className="mt-1 truncate text-xs text-nova-navy/45">{secondaryLabel}</p>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ boxShadow: REST_SHADOW_COMPACT }}
      whileHover={{ y: -1, boxShadow: HOVER_SHADOW_COMPACT }}
      transition={{ duration: 0.2, ease: EASE }}
      className={`flex items-center gap-2 overflow-hidden rounded-xl border px-2.5 py-1.5 ${
        isNeutral ? "border-dashed" : ""
      }`}
      style={{
        backgroundColor: event.style.backgroundColor,
        borderColor: event.style.borderColor,
      }}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} style={{ color: event.style.color }} />
      <span
        className="truncate text-xs font-medium leading-tight"
        style={{ color: event.style.color }}
      >
        {getCompactLabel(event)}
      </span>
    </motion.div>
  );
}
