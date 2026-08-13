"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import type { TaskSort } from "@/lib/tasks/types";

const SORT_OPTIONS: { id: TaskSort; label: string }[] = [
  { id: "creacion", label: "Fecha de creación" },
  { id: "urgencia", label: "Urgencia" },
  { id: "curso", label: "Curso" },
  { id: "estado", label: "Estado" },
];

export function SortControl({
  sort,
  onChange,
}: {
  sort: TaskSort;
  onChange: (sort: TaskSort) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, () => setOpen(false), open);

  const current = SORT_OPTIONS.find((option) => option.id === sort)!;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-nova-navy/70 transition-colors hover:bg-nova-navy/[0.05]"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.75} />
        {current.label}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full z-20 mt-2 w-48 rounded-2xl border border-nova-navy/5 bg-nova-white p-2 shadow-[0_20px_40px_-20px_rgba(4,14,60,0.4)]"
          >
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange(option.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center rounded-xl px-3 py-1.5 text-left text-xs transition-colors ${
                  option.id === sort
                    ? "bg-nova-electric/10 text-nova-electric"
                    : "text-nova-navy/70 hover:bg-nova-navy/[0.04]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
