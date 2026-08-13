"use client";

import { useRef, useState } from "react";
import { Calendar } from "lucide-react";
import { formatDueDate, getDaysRemaining, getUrgencyClass } from "@/lib/tasks/format";
import { DatePickerPopover } from "@/app/(app)/date-picker-popover";

export function DueDatePicker({
  dueDate,
  onChange,
}: {
  dueDate: string | null;
  onChange: (dueDate: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const label = formatDueDate(dueDate);
  const daysRemaining = getDaysRemaining(dueDate);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] leading-none transition-colors ${getUrgencyClass(daysRemaining)}`}
      >
        <Calendar className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
        <span className="truncate">{label ?? "Sin fecha"}</span>
      </button>

      <DatePickerPopover
        open={open}
        onClose={() => setOpen(false)}
        triggerRef={triggerRef}
        value={dueDate}
        onChange={(dateKey) => onChange(dateKey)}
        onClear={dueDate ? () => onChange(null) : undefined}
      />
    </div>
  );
}
