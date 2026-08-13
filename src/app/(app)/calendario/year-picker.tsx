"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import { EASE } from "@/lib/calendar/motion";

const MENU_WIDTH = 152;
const MENU_MAX_HEIGHT = 244;
const YEARS_BEFORE_AFTER = 7;

export function YearPicker({
  children,
  year,
  onSelectYear,
}: {
  children: React.ReactNode;
  year: number;
  onSelectYear: (year: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; openUp: boolean } | null>(
    null
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  useClickOutside([triggerRef, menuRef], () => setOpen(false), open);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    function updatePosition() {
      const rect = triggerRef.current!.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < MENU_MAX_HEIGHT + 12 && rect.top > spaceBelow;
      const left = Math.min(
        Math.max(rect.left + rect.width / 2 - MENU_WIDTH / 2, 12),
        window.innerWidth - MENU_WIDTH - 12
      );
      setPosition({
        top: openUp ? rect.top - 8 : rect.bottom + 8,
        left,
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

  useEffect(() => {
    if (!open) return;
    selectedItemRef.current?.scrollIntoView({ block: "center" });
  }, [open]);

  const years = Array.from(
    { length: YEARS_BEFORE_AFTER * 2 + 1 },
    (_, index) => year - YEARS_BEFORE_AFTER + index
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Seleccionar año"
        aria-expanded={open}
        className="min-w-[176px] overflow-hidden rounded-xl px-3 py-1.5 text-center transition-colors duration-200 hover:bg-nova-white hover:shadow-[0_1px_4px_-1px_rgba(4,14,60,0.12)]"
      >
        {children}
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && position && (
              <motion.div
                ref={menuRef}
                initial={{ opacity: 0, y: position.openUp ? 6 : -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: position.openUp ? 6 : -6, scale: 0.96 }}
                transition={{ duration: 0.18, ease: EASE }}
                style={{
                  position: "fixed",
                  top: position.openUp ? undefined : position.top,
                  bottom: position.openUp ? window.innerHeight - position.top : undefined,
                  left: position.left,
                  width: MENU_WIDTH,
                  maxHeight: MENU_MAX_HEIGHT,
                }}
                className="z-50 overflow-y-auto rounded-2xl border border-nova-navy/[0.06] bg-nova-white/95 p-1.5 shadow-[0_20px_40px_-20px_rgba(4,14,60,0.4)] backdrop-blur-xl"
              >
                {years.map((candidate, index) => {
                  const isSelected = candidate === year;
                  return (
                    <motion.button
                      key={candidate}
                      ref={isSelected ? selectedItemRef : undefined}
                      type="button"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.16, ease: EASE, delay: index * 0.012 }}
                      onClick={() => {
                        onSelectYear(candidate);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                        isSelected
                          ? "bg-nova-electric/10 font-semibold text-nova-electric"
                          : "text-nova-navy/60 hover:bg-nova-navy/[0.04] hover:text-nova-navy"
                      }`}
                    >
                      {candidate}
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
