"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

function subscribeNoop() {
  return () => {};
}

// SSR-safe "has this hydrated on the client yet" flag — avoids calling
// document.body (which doesn't exist server-side) before hydration, without
// the cascading-render setState-in-effect pattern a plain useState+useEffect
// mount flag would trigger.
function useIsClient(): boolean {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

export interface SelectDropdownOption {
  value: number;
  label: string;
}

// Custom trigger + panel instead of a native <select>, so day/month pickers
// (birthday step, birthday widget edit form) get the same premium look,
// motion, and hover/press feedback as the rest of NovaClass. The panel
// renders through a portal because both call sites live inside an
// `overflow-hidden` card (step-transition clipping / WidgetCard), which
// would otherwise cut off a dropdown taller than the card.
export function SelectDropdown({
  value,
  options,
  placeholder,
  onChange,
  className = "",
  size = "md",
}: {
  value: number | null;
  options: SelectDropdownOption[];
  placeholder: string;
  onChange: (value: number) => void;
  className?: string;
  size?: "md" | "sm";
}) {
  const [open, setOpen] = useState(false);
  const mounted = useIsClient();
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function updateRect() {
    const el = triggerRef.current;
    if (!el) return;
    const bounds = el.getBoundingClientRect();
    setRect({ top: bounds.bottom + 6, left: bounds.left, width: bounds.width });
  }

  useEffect(() => {
    if (!open) return;
    updateRect();

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const selected = options.find((option) => option.value === value);
  const triggerSizeClass =
    size === "sm" ? "rounded-xl px-3 py-2 text-sm" : "rounded-2xl px-4 py-3 text-base";

  return (
    <div className={className}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between gap-2 border bg-nova-white outline-none transition-colors ${triggerSizeClass} ${
          open ? "border-nova-electric" : "border-nova-navy/10"
        } ${selected ? "text-nova-navy" : "text-nova-navy/35"}`}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="text-nova-navy/35"
        >
          <ChevronDown className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={2} />
        </motion.span>
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && rect && (
              <motion.div
                ref={panelRef}
                role="listbox"
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.18, ease: EASE }}
                style={{ position: "fixed", top: rect.top, left: rect.left, width: rect.width }}
                className="z-50 max-h-56 overflow-y-auto rounded-2xl border border-nova-navy/10 bg-nova-white p-1.5 shadow-[0_20px_45px_-20px_rgba(4,14,60,0.35)]"
              >
                {options.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <motion.button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.15, ease: EASE }}
                      onClick={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                        isSelected
                          ? "bg-nova-electric/10 font-semibold text-nova-electric"
                          : "text-nova-navy/70 hover:bg-nova-navy/[0.05] hover:text-nova-navy"
                      }`}
                    >
                      {option.label}
                      {isSelected && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
                    </motion.button>
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
