"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { WidgetCard } from "@/app/(app)/dashboard/widget-card";
import { AnimatedNumber } from "@/app/(app)/dashboard/animated-number";
import { getMonthProgress } from "@/lib/dashboard/stats";

export function MonthThermometerWidget({
  dragHandleProps,
}: {
  dragHandleProps?: Record<string, unknown>;
}) {
  const { day, percent, daysRemaining } = getMonthProgress();
  const gridId = useId();

  return (
    <WidgetCard
      dragHandleProps={dragHandleProps}
      style={{
        background: "linear-gradient(160deg, #FFFFFF 0%, #EAF3FE 55%, #DCEBFE 100%)",
      }}
    >
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-[0.05]"
      >
        <defs>
          <pattern id={gridId} width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M 22 0 L 0 0 0 22" fill="none" stroke="#0A6DFD" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${gridId})`} />
      </svg>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 -z-10 h-40 w-40 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(87,185,253,0.18) 0%, rgba(87,185,253,0) 70%)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <p className="shrink-0 text-[13px] font-medium text-nova-navy/40">Termómetro del mes</p>

      <div className="flex min-h-0 flex-1 items-stretch gap-3 pt-1 sm:gap-[30px]">
        <div className="relative flex h-full w-6 shrink-0 flex-col items-center sm:w-[38px]">
          <div className="relative w-[18px] flex-1 overflow-hidden rounded-full bg-nova-navy/[0.06] shadow-[inset_0_2px_6px_rgba(4,14,60,0.08)] sm:w-[30px]">
            <div className="pointer-events-none absolute inset-y-2 inset-x-0 z-10 flex flex-col justify-between sm:inset-y-[15px]">
              {Array.from({ length: 7 }).map((_, index) => (
                <span key={index} className="ml-1 h-px w-[5px] bg-nova-navy/15 sm:ml-1.5 sm:w-[9px]" />
              ))}
            </div>

            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${percent}%` }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-0 w-full overflow-hidden rounded-full bg-gradient-to-t from-nova-electric via-nova-intermediate to-nova-sky"
            >
              <motion.div
                aria-hidden="true"
                className="absolute inset-x-0 h-12 bg-gradient-to-b from-white/40 to-transparent"
                animate={{ y: ["120%", "-140%"] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.span
                aria-hidden="true"
                className="absolute left-2 h-1.5 w-1.5 rounded-full bg-white/50"
                animate={{ y: [0, -70], opacity: [0, 0.8, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
              />
            </motion.div>
          </div>

          <div
            className="relative -mt-1 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 border-nova-white sm:-mt-2 sm:h-[34px] sm:w-[34px]"
            style={{
              background: "radial-gradient(circle at 35% 30%, #57B9FD 0%, #0A6DFD 60%, #075BD6 100%)",
              boxShadow: "0 4px 14px -2px rgba(10,109,253,0.45)",
            }}
          >
            <span className="absolute left-[5px] top-[4px] h-1.5 w-1.5 rounded-full bg-white/45 sm:left-[9px] sm:top-[8px] sm:h-2 sm:w-2" />
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 @container flex-col justify-center">
          <AnimatedNumber
            value={percent}
            suffix="%"
            className="text-[clamp(20px,40cqw,91px)] font-black leading-none tracking-tight text-nova-navy"
          />
          <p className="mt-1 text-[9px] font-medium text-nova-navy/40 sm:mt-2 sm:text-[11px]">Avance del mes</p>
          <div className="mt-1.5 flex items-center gap-1.5 sm:mt-3 sm:gap-2.5">
            <span className="rounded-full bg-nova-navy/[0.05] px-2 py-0.5 text-[9px] font-semibold text-nova-navy/70 sm:px-3.5 sm:py-1 sm:text-[11px]">
              Día {day}
            </span>
            <span className="text-[9px] text-nova-navy/40 sm:text-[11px]">{daysRemaining} restantes</span>
          </div>

          <div className="mt-2 h-1.5 w-full max-w-[209px] overflow-hidden rounded-full bg-nova-navy/[0.06] sm:mt-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              className="h-full rounded-full bg-gradient-to-r from-nova-electric to-nova-sky"
            />
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}
