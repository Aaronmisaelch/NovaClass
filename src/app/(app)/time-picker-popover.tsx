"use client";

import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import { TimePicker } from "@/app/(app)/time-picker";
import { EASE } from "@/lib/calendar/motion";

const PANEL_WIDTH = 208;
const PANEL_MAX_HEIGHT = 280;

// Same portal/position/click-outside shell as DatePickerPopover, but doesn't
// close itself on selection — an hour and a minute are two independent
// picks, so closing after the first would cut the second one off. Closes via
// the "Listo" button or a click outside instead.
export function TimePickerPopover({
  open,
  onClose,
  triggerRef,
  value,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLElement | null>;
  value: string;
  onChange: (time: string) => void;
}) {
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    openUp: boolean;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside([triggerRef, menuRef], onClose, open);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    function updatePosition() {
      const rect = triggerRef.current!.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < PANEL_MAX_HEIGHT + 12 && rect.top > spaceBelow;
      setPosition({
        top: openUp ? rect.top - 8 : rect.bottom + 8,
        left: Math.min(rect.left, window.innerWidth - PANEL_WIDTH - 12),
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
  }, [open, triggerRef]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && position && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: position.openUp ? 6 : -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: position.openUp ? 6 : -6, scale: 0.97 }}
          transition={{ duration: 0.18, ease: EASE }}
          style={{
            position: "fixed",
            top: position.openUp ? undefined : position.top,
            bottom: position.openUp ? window.innerHeight - position.top : undefined,
            left: position.left,
            width: PANEL_WIDTH,
          }}
          className="z-50 overflow-hidden rounded-2xl border border-nova-navy/5 bg-nova-white shadow-[0_20px_40px_-20px_rgba(4,14,60,0.4)]"
        >
          <TimePicker value={value} onChange={onChange} />
          <button
            type="button"
            onClick={onClose}
            className="w-full border-t border-nova-navy/5 px-4 py-2.5 text-xs font-semibold text-nova-electric transition-colors hover:bg-nova-navy/[0.03]"
          >
            Listo
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
