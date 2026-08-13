"use client";

import { useEffect, useRef } from "react";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function TimeColumn({
  values,
  selected,
  onSelect,
}: {
  values: number[];
  selected: number;
  onSelect: (value: number) => void;
}) {
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Only ever needs to run once, when the wheel first mounts (i.e. the
  // popover opens) — re-centering on every selection would fight the user's
  // own scroll/tap.
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "center" });
  }, []);

  return (
    <div className="h-44 w-14 snap-y snap-mandatory overflow-y-auto py-[70px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {values.map((value) => {
        const isSelected = value === selected;
        return (
          <button
            key={value}
            ref={isSelected ? selectedRef : undefined}
            type="button"
            onClick={() => onSelect(value)}
            className={`flex h-9 w-full snap-center items-center justify-center text-lg font-semibold tabular-nums transition-colors ${
              isSelected ? "text-nova-electric" : "text-nova-navy/25 hover:text-nova-navy/50"
            }`}
          >
            {pad(value)}
          </button>
        );
      })}
    </div>
  );
}

// A compact "wheel" time selector — two independently-scrollable columns
// (hour, minute) with a fixed center highlight band, styled to match
// DateCalendar's premium, minimal treatment rather than the native OS time
// dropdown it replaces.
export function TimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (time: string) => void;
}) {
  const [hourStr, minuteStr] = value.split(":");
  const hour = Number(hourStr) || 0;
  const minute = Number(minuteStr) || 0;

  return (
    <div className="relative w-full p-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 top-1/2 h-9 -translate-y-1/2 rounded-xl bg-nova-electric/[0.06]"
      />
      <div className="relative flex items-center justify-center gap-1">
        <TimeColumn values={HOURS} selected={hour} onSelect={(h) => onChange(`${pad(h)}:${pad(minute)}`)} />
        <span className="pb-0.5 text-lg font-bold text-nova-navy/15">:</span>
        <TimeColumn values={MINUTES} selected={minute} onSelect={(m) => onChange(`${pad(hour)}:${pad(m)}`)} />
      </div>
    </div>
  );
}
