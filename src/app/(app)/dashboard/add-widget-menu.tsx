"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import { WIDGET_TYPES, type WidgetType } from "@/lib/dashboard/types";

export function AddWidgetMenu({ onAdd }: { onAdd: (type: WidgetType) => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, () => setOpen(false), open);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-nova-electric to-nova-intermediate px-4 py-2 text-sm font-medium text-nova-white"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
        Agregar widget
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full z-20 mt-2 w-56 rounded-2xl border border-nova-navy/5 bg-nova-white p-2 shadow-[0_20px_40px_-20px_rgba(4,14,60,0.4)]"
          >
            {WIDGET_TYPES.map((option) => (
              <button
                key={option.type}
                type="button"
                onClick={() => {
                  onAdd(option.type);
                  setOpen(false);
                }}
                className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-nova-navy/70 transition-colors hover:bg-nova-navy/[0.04]"
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
