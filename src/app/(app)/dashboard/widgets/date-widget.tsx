"use client";

import { WidgetCard } from "@/app/(app)/dashboard/widget-card";

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("es-PE", { weekday: "long" });
const MONTH_FORMATTER = new Intl.DateTimeFormat("es-PE", { month: "long" });

export function DateWidget({
  dragHandleProps,
}: {
  dragHandleProps?: Record<string, unknown>;
}) {
  const now = new Date();
  const weekday = WEEKDAY_FORMATTER.format(now);
  const month = MONTH_FORMATTER.format(now);

  return (
    <WidgetCard dragHandleProps={dragHandleProps} noPadding>
      <div
        className="relative flex h-[65px] shrink-0 flex-col items-center justify-center gap-2 pt-2"
        style={{ background: "linear-gradient(180deg, #FF2E4D 0%, #FF6B6B 100%)" }}
      >
        <div className="flex gap-9">
          <span className="h-[11px] w-[11px] rounded-full bg-nova-white/85" />
          <span className="h-[11px] w-[11px] rounded-full bg-nova-white/85" />
        </div>
        <span className="text-[13px] font-semibold uppercase tracking-[0.2em] text-nova-white/90">
          {month}
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-1 px-4 pb-4 pt-1 text-center">
        <p className="text-[97px] font-bold leading-none text-nova-navy">{now.getDate()}</p>
        <p className="mt-3 text-[19px] font-medium capitalize text-nova-navy/50">{weekday}</p>
        <p className="text-[15px] text-nova-navy/35">{now.getFullYear()}</p>
      </div>
    </WidgetCard>
  );
}
