"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Circle, CircleCheckBig, LoaderCircle } from "lucide-react";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import { TASK_STATUSES, type TaskStatus } from "@/lib/tasks/types";

const STATUS_STYLES: Record<TaskStatus, { color: string; icon: typeof Circle }> = {
  pendiente: { color: "#040E3CB3", icon: Circle },
  en_progreso: { color: "#0A6DFD", icon: LoaderCircle },
  finalizado: { color: "#34D399", icon: CircleCheckBig },
};

const MENU_WIDTH = 160;
const MENU_MAX_HEIGHT = 160;

export function StatusPicker({
  status,
  onChange,
}: {
  status: TaskStatus;
  onChange: (status: TaskStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    openUp: boolean;
  } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside([triggerRef, menuRef], () => setOpen(false), open);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    function updatePosition() {
      const rect = triggerRef.current!.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < MENU_MAX_HEIGHT + 12 && rect.top > spaceBelow;
      setPosition({
        top: openUp ? rect.top - 8 : rect.bottom + 8,
        left: Math.min(rect.left, window.innerWidth - MENU_WIDTH - 12),
        openUp,
      });
    }

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  const current = TASK_STATUSES.find((option) => option.id === status)!;
  const CurrentIcon = STATUS_STYLES[status].icon;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1.5 rounded-full border border-nova-navy/10 px-3 py-1 text-[13px] font-medium text-nova-navy/70 transition-colors hover:bg-nova-navy/[0.03]"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={status}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex shrink-0 items-center justify-center"
          >
            <CurrentIcon
              className="h-3.5 w-3.5"
              style={{ color: STATUS_STYLES[status].color }}
              strokeWidth={2.25}
            />
          </motion.span>
        </AnimatePresence>
        <span className="truncate">{current.label}</span>
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && position && (
              <motion.div
                ref={menuRef}
                initial={{ opacity: 0, y: position.openUp ? 6 : -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: position.openUp ? 6 : -6, scale: 0.97 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: "fixed",
                  top: position.openUp ? undefined : position.top,
                  bottom: position.openUp ? window.innerHeight - position.top : undefined,
                  left: position.left,
                  width: MENU_WIDTH,
                }}
                className="z-50 rounded-2xl border border-nova-navy/5 bg-nova-white p-2 shadow-[0_20px_40px_-20px_rgba(4,14,60,0.4)]"
              >
                {TASK_STATUSES.map((option) => {
                  const OptionIcon = STATUS_STYLES[option.id].icon;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        onChange(option.id);
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-1.5 rounded-xl px-2 py-1.5 text-left text-xs text-nova-navy/70 hover:bg-nova-navy/[0.04]"
                    >
                      <OptionIcon
                        className="h-3.5 w-3.5"
                        style={{ color: STATUS_STYLES[option.id].color }}
                        strokeWidth={2}
                      />
                      {option.label}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
