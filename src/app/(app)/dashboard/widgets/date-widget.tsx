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
        className="relative flex h-11 shrink-0 flex-col items-center justify-center gap-1 pt-1 sm:h-[65px] sm:gap-2 sm:pt-2"
        style={{ background: "linear-gradient(180deg, #FF2E4D 0%, #FF6B6B 100%)" }}
      >
        <div className="flex gap-4 sm:gap-9">
          <span className="h-1.5 w-1.5 rounded-full bg-nova-white/85 sm:h-[11px] sm:w-[11px]" />
          <span className="h-1.5 w-1.5 rounded-full bg-nova-white/85 sm:h-[11px] sm:w-[11px]" />
        </div>
        <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-nova-white/90 sm:text-[13px] sm:tracking-[0.2em]">
          {month}
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-0.5 px-2 pb-2 pt-0.5 text-center sm:gap-1 sm:px-4 sm:pb-4 sm:pt-1">
        <p className="text-[44px] font-bold leading-none text-nova-navy sm:text-[97px]">{now.getDate()}</p>
        <p className="mt-1 text-[12px] font-medium capitalize text-nova-navy/50 sm:mt-3 sm:text-[19px]">{weekday}</p>
        <p className="text-[10px] text-nova-navy/35 sm:text-[15px]">{now.getFullYear()}</p>
      </div>
    </WidgetCard>
  );
}
