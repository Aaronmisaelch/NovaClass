"use client";

import { motion } from "framer-motion";
import { CalendarCheck, PartyPopper, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { WidgetCard } from "@/app/(app)/dashboard/widget-card";
import { formatRange } from "@/lib/schedule/timeline";
import { getCourseColor, getCourseStyle } from "@/lib/schedule/colors";
import type { TomorrowClasses } from "@/lib/dashboard/stats";

const EASE = [0.22, 1, 0.36, 1] as const;

function SpecialDayMessage({
  icon: Icon,
  gradient,
  glow,
  title,
  message,
}: {
  icon: LucideIcon;
  gradient: string;
  glow: string;
  title: string;
  message: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="relative flex flex-1 flex-col items-center justify-center gap-3 overflow-hidden px-4 text-center"
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute h-28 w-28 rounded-full blur-2xl"
        style={{ background: glow }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.55, 0.9, 0.55] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        animate={{ scale: [1, 1.06, 1], rotate: [0, 3, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="relative flex h-14 w-14 items-center justify-center rounded-2xl shadow-[0_10px_24px_-8px_rgba(4,14,60,0.35)]"
        style={{ background: gradient }}
      >
        <Icon className="h-7 w-7 text-nova-white" strokeWidth={1.75} />
      </motion.div>
      <div className="relative flex flex-col gap-0.5">
        <p className="text-[15px] font-bold text-nova-navy">{title}</p>
        <p className="max-w-[14rem] text-[13px] leading-relaxed text-nova-navy/45">{message}</p>
      </div>
    </motion.div>
  );
}

export function TomorrowClassesWidget({
  data,
  dragHandleProps,
}: {
  data: TomorrowClasses;
  dragHandleProps?: Record<string, unknown>;
}) {
  return (
    <WidgetCard dragHandleProps={dragHandleProps}>
      <p className="mb-1 text-[15px] font-medium text-nova-navy">Clases de mañana</p>
      <p className="mb-4 text-[13px] text-nova-navy/40">Según tu Schedule</p>

      {data.status === "friday" ? (
        <SpecialDayMessage
          icon={PartyPopper}
          gradient="linear-gradient(135deg, #0A6DFD 0%, #57B9FD 100%)"
          glow="radial-gradient(circle, rgba(87,185,253,0.35) 0%, rgba(87,185,253,0) 70%)"
          title="¡Es viernes!"
          message="El fin de semana está a la vuelta de la esquina."
        />
      ) : data.status === "saturday" ? (
        <SpecialDayMessage
          icon={Sun}
          gradient="linear-gradient(135deg, #FFC98A 0%, #FFE9A0 100%)"
          glow="radial-gradient(circle, rgba(255,201,138,0.4) 0%, rgba(255,201,138,0) 70%)"
          title="Fin de semana"
          message="Descansa — no hay clases hasta el lunes."
        />
      ) : data.classes.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2.5 px-4 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-nova-navy/[0.04]">
            <CalendarCheck className="h-5 w-5 text-nova-navy/30" strokeWidth={1.75} />
          </span>
          <p className="max-w-[13rem] text-[13px] font-medium leading-relaxed text-nova-navy/35">
            Sin clases registradas para mañana en tu Schedule.
          </p>
        </div>
      ) : (
        <div className="relative flex flex-1 flex-col gap-3 overflow-y-auto py-0.5 pl-1">
          <div className="absolute bottom-1 left-[7px] top-1 w-px bg-nova-navy/[0.08]" />
          {data.classes.map((item, index) => (
            <motion.div
              key={`${item.courseId}-${item.startMinutes}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex items-center gap-3 pl-5"
            >
              <span
                className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ring-[3px] ring-nova-white"
                style={{ backgroundColor: getCourseColor(item.courseColor).hex }}
              />
              <div
                style={getCourseStyle(item.courseColor)}
                className="flex flex-1 items-center justify-between rounded-xl border px-3 py-1.5 text-[13px] font-medium"
              >
                <span className="truncate">{item.courseName}</span>
                <span className="shrink-0 opacity-70">
                  {formatRange(item.startMinutes, item.endMinutes)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}
