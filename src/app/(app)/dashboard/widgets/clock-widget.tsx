"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { WidgetCard } from "@/app/(app)/dashboard/widget-card";
import { SevenSegmentDigit } from "@/app/(app)/dashboard/widgets/seven-segment-digit";
import type { ClockConfig } from "@/lib/dashboard/types";

export function ClockWidget({
  config,
  onConfigChange,
  dragHandleProps,
}: {
  config: Partial<ClockConfig>;
  onConfigChange: (config: ClockConfig) => void;
  dragHandleProps?: Record<string, unknown>;
}) {
  const format = config.format ?? "24";
  const [now, setNow] = useState<Date>(() => new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // The digit row is drawn at a fixed "design size" — each digit is a
  // hand-placed LED glyph built from absolute-px segments (see
  // SevenSegmentDigit), so it can't be resized via font-size or flex-shrink
  // without misaligning those segments. Instead, a ResizeObserver on the
  // widget's own available width recomputes a single uniform CSS scale for
  // the whole row (all 4 digits + colon together) every time that width
  // changes — on mount, on an actual resize, on browser zoom. offsetWidth
  // reads the row's true pre-transform layout size regardless of the scale
  // already applied, so this is self-correcting every time it runs. The
  // row's own content never changes between 12h/24h (the AM/PM label lives
  // in its own row below), so the same scale is always correct for both.
  useLayoutEffect(() => {
    const container = containerRef.current;
    const row = rowRef.current;
    if (!container || !row) return;

    function recalc() {
      const containerWidth = container!.offsetWidth;
      const naturalWidth = row!.offsetWidth;
      if (containerWidth <= 0 || naturalWidth <= 0) return;
      setScale(Math.min(1, containerWidth / naturalWidth));
    }

    recalc();
    const observer = new ResizeObserver(recalc);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  let hours = now.getHours();
  const minutes = now.getMinutes();
  let suffix = "";
  if (format === "12") {
    suffix = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
  }

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");

  return (
    <WidgetCard
      dragHandleProps={dragHandleProps}
      className="group justify-between"
      style={{ backgroundColor: "#000000" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-nova-white/40">Hora</span>
        <button
          type="button"
          onClick={() => onConfigChange({ format: format === "24" ? "12" : "24" })}
          className="rounded-full border border-nova-white/10 px-2 py-0.5 text-[10px] font-medium text-nova-white/50 hover:bg-nova-white/5"
        >
          {format}h
        </button>
      </div>

      <div ref={containerRef} className="flex min-w-0 flex-1 items-center justify-center overflow-hidden">
        <div ref={rowRef} style={{ transform: `scale(${scale})` }} className="flex shrink-0 items-center gap-3">
          <SevenSegmentDigit char={hh[0]} />
          <SevenSegmentDigit char={hh[1]} />
          <motion.div
            className="flex shrink-0 flex-col justify-center gap-3 px-0.5"
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="h-[11px] w-[11px] rounded-full bg-nova-white shadow-[0_0_8px_rgba(255,255,255,0.65)] transition-shadow duration-300 group-hover:shadow-[0_0_14px_rgba(255,255,255,0.95)]" />
            <span className="h-[11px] w-[11px] rounded-full bg-nova-white shadow-[0_0_8px_rgba(255,255,255,0.65)] transition-shadow duration-300 group-hover:shadow-[0_0_14px_rgba(255,255,255,0.95)]" />
          </motion.div>
          <SevenSegmentDigit char={mm[0]} />
          <SevenSegmentDigit char={mm[1]} />
        </div>
      </div>

      <div className="flex h-4 items-center justify-center">
        {suffix && (
          <span className="text-[12px] font-medium tracking-widest text-nova-white/40">{suffix}</span>
        )}
      </div>
    </WidgetCard>
  );
}
