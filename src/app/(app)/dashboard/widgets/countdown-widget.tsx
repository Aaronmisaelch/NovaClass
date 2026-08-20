"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Pencil } from "lucide-react";
import { WidgetCard } from "@/app/(app)/dashboard/widget-card";
import { AnimatedNumber } from "@/app/(app)/dashboard/animated-number";
import { DatePickerPopover } from "@/app/(app)/date-picker-popover";
import { parseDateKey } from "@/lib/calendar/month-grid";
import type { CountdownConfig } from "@/lib/dashboard/types";

const DATE_LABEL_FORMAT = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function CountdownWidget({
  config,
  createdAt,
  onConfigChange,
  dragHandleProps,
}: {
  config: Partial<CountdownConfig>;
  variant: number;
  createdAt: number;
  onConfigChange: (config: CountdownConfig) => void;
  dragHandleProps?: Record<string, unknown>;
}) {
  const [editing, setEditing] = useState(!config.title || !config.targetDate);
  const [title, setTitle] = useState(config.title ?? "");
  const [targetDate, setTargetDate] = useState(config.targetDate ?? "");
  const [now] = useState(() => Date.now());
  const [dateOpen, setDateOpen] = useState(false);
  const dateTriggerRef = useRef<HTMLButtonElement>(null);

  if (editing) {
    return (
      <WidgetCard dragHandleProps={dragHandleProps} className="justify-center gap-3">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Título"
          className="w-full rounded-xl border border-nova-navy/10 px-3 py-2 text-sm text-nova-navy outline-none focus:border-nova-electric"
        />
        <button
          ref={dateTriggerRef}
          type="button"
          onClick={() => setDateOpen((value) => !value)}
          className="flex w-full items-center gap-2 rounded-xl border border-nova-navy/10 px-3 py-2 text-left text-sm text-nova-navy outline-none focus:border-nova-electric"
        >
          <CalendarDays className="h-4 w-4 shrink-0 text-nova-navy/40" strokeWidth={1.75} />
          <span className={targetDate ? "" : "text-nova-navy/35"}>
            {targetDate ? DATE_LABEL_FORMAT.format(parseDateKey(targetDate)) : "Elegir fecha"}
          </span>
        </button>
        <DatePickerPopover
          open={dateOpen}
          onClose={() => setDateOpen(false)}
          triggerRef={dateTriggerRef}
          value={targetDate || null}
          onChange={(dateKey) => setTargetDate(dateKey)}
        />
        <button
          type="button"
          disabled={!title.trim() || !targetDate}
          onClick={() => {
            onConfigChange({ title: title.trim(), targetDate });
            setEditing(false);
          }}
          className="rounded-full bg-gradient-to-r from-nova-electric to-nova-intermediate px-4 py-1.5 text-xs font-medium text-nova-white disabled:opacity-40"
        >
          Guardar
        </button>
      </WidgetCard>
    );
  }

  const target = new Date(config.targetDate as string);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysRemaining = Math.round((target.getTime() - today.getTime()) / 86400000);
  const elapsed = createdAt ? now - createdAt : 0;
  const total = createdAt ? target.getTime() - createdAt : 1;
  const progress = Math.min(100, Math.max(0, (elapsed / Math.max(total, 1)) * 100));

  const urgency = daysRemaining <= 0 ? 1 : daysRemaining <= 3 ? 0.75 : daysRemaining <= 7 ? 0.4 : 0.15;
  const urgent = urgency > 0.5;
  const dotColor = urgent ? "#F97316" : "#FFFFFF";
  const barGradient = urgent
    ? "linear-gradient(90deg, #FDBA74 0%, #F97316 100%)"
    : "linear-gradient(90deg, rgba(255,255,255,0.75) 0%, #FFFFFF 100%)";

  const isWord = daysRemaining <= 0;
  const heroText =
    daysRemaining < 0 ? "Vencido" : daysRemaining === 0 ? "Hoy" : String(daysRemaining);
  const subLabel =
    daysRemaining < 0
      ? "esta fecha ya pasó"
      : daysRemaining === 0
        ? "¡es hoy!"
        : daysRemaining === 1
          ? "día restante"
          : "días restantes";

  return (
    <WidgetCard
      dragHandleProps={dragHandleProps}
      noPadding
      className="group"
      style={{
        // NovaClass brand blues only: Electric → Intermediate → Sky, with
        // interpolated midpoints so the transition reads as continuous.
        backgroundImage:
          "linear-gradient(165deg, #0A6DFD 0%, #1D81FD 25%, #2F94FD 50%, #43A7FD 75%, #57B9FD 100%)",
      }}
    >
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="absolute right-3 top-3 z-10 text-nova-white/50 hover:text-nova-white/85"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>

      <div className="flex h-full flex-col pt-2 sm:pt-4">
        <div className="flex items-center gap-2 px-3 sm:px-5">
          <motion.span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: dotColor }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-nova-white/70 sm:text-[14px]">
            {config.title}
          </p>
        </div>
        <p className="mt-0.5 pl-[10px] text-[10px] font-medium text-nova-white/45 sm:pl-[14px] sm:text-[13px]">
          {DATE_LABEL_FORMAT.format(target)}
        </p>

        <div className="flex flex-1 flex-col items-center justify-center gap-0.5 px-3 text-center sm:gap-1 sm:px-5">
          {/* Minimalist bomb — the widget's visual protagonist. A rounded
              body with the days-remaining number set inside it, a short
              fuse arcing up from its cap, and a flickering spark at the
              tip — the same simple-shapes-plus-soft-glow language as the
              door illustration and birthday cake, in NovaClass blues
              instead of a realistic bomb's black/red. The fuse's burn
              point shortens as `progress` climbs, so it doubles as a
              second read of the same countdown the bar below shows. */}
          <div className="relative h-[78px] w-[78px] sm:h-[136px] sm:w-[136px]">
            <svg
              aria-hidden="true"
              viewBox="0 0 136 136"
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              fill="none"
            >
              <motion.path
                d="M68 24 C 82 14, 78 -2, 98 -8"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 - progress / 100 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
              {/* Hover redirect target: the corner glow used to live here as
                  a plain always-on decoration. Instead, widget hover (via
                  the WidgetCard's "group" class) now brightens the fuse's
                  own spark with this extra glow ring, layered under the
                  always-flickering spark circles below. */}
              <circle
                cx="98"
                cy="-8"
                r="16"
                fill="rgba(255,255,255,0.55)"
                className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              <motion.circle
                cx="98"
                cy="-8"
                r="11"
                fill="rgba(255,255,255,0.35)"
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.15, 0.4] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.circle
                cx="98"
                cy="-8"
                r="6"
                fill="rgba(255,255,255,0.92)"
                animate={{ scale: [1, 1.35, 1], opacity: [0.75, 1, 0.75] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
              />
            </svg>

            <div className="absolute left-1/2 top-[14px] h-[7px] w-[10px] -translate-x-1/2 rounded-t-md bg-nova-navy/40 sm:top-[24px] sm:h-3 sm:w-[18px]" />

            <div
              className="absolute bottom-0 left-1/2 h-[60px] w-[60px] -translate-x-1/2 rounded-full border border-white/20 sm:h-[104px] sm:w-[104px]"
              style={{
                background: "radial-gradient(circle at 35% 30%, #2F94FD 0%, #0A6DFD 55%, #040E3C 100%)",
                boxShadow: "0 14px 30px -10px rgba(4,14,60,0.55), inset 0 2px 10px rgba(255,255,255,0.15)",
              }}
            >
              <span className="pointer-events-none absolute left-[10px] top-[9px] h-[14px] w-[21px] -rotate-12 rounded-full bg-white/25 blur-[2px] sm:left-[18px] sm:top-[16px] sm:h-6 sm:w-9" />
              <div className="flex h-full w-full flex-col items-center justify-center">
                {isWord ? (
                  <span className="text-sm font-black leading-none text-nova-white sm:text-2xl">{heroText}</span>
                ) : (
                  <AnimatedNumber
                    value={daysRemaining}
                    className="text-xl font-black leading-none tracking-tight text-nova-white sm:text-4xl"
                  />
                )}
              </div>
            </div>
          </div>
          <p className="mt-0.5 text-[10px] font-medium text-nova-white/70 sm:mt-1 sm:text-[13px]">{subLabel}</p>
        </div>

        <div className="px-3 pb-2 sm:px-5 sm:pb-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-nova-white/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full"
              style={{ background: barGradient }}
            />
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}
