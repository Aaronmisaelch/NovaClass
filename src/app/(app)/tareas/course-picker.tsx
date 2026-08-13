"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import { getCourseStyle } from "@/lib/schedule/colors";
import type { Course } from "@/lib/schedule/types";

const MENU_WIDTH = 192;
const MENU_MAX_HEIGHT = 256;

export function CoursePicker({
  courses,
  course,
  onChange,
}: {
  courses: Course[];
  course: Course | null;
  onChange: (courseId: string | null) => void;
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

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center"
      >
        {course ? (
          <span
            style={getCourseStyle(course.color)}
            className="inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-[13px] font-semibold leading-none tracking-wide"
          >
            {course.name}
          </span>
        ) : (
          <span className="inline-flex items-center justify-center rounded-full border border-dashed border-nova-navy/15 px-3 py-1.5 text-[13px] font-medium leading-none text-nova-navy/30">
            Sin curso
          </span>
        )}
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
                  maxHeight: MENU_MAX_HEIGHT,
                }}
                className="z-50 overflow-y-auto rounded-2xl border border-nova-navy/5 bg-nova-white p-2 shadow-[0_20px_40px_-20px_rgba(4,14,60,0.4)]"
              >
                <button
                  type="button"
                  onClick={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                  className="flex w-full items-center rounded-xl px-2 py-1.5 text-left text-xs text-nova-navy/50 hover:bg-nova-navy/[0.04]"
                >
                  Sin curso
                </button>
                {courses.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      onChange(option.id);
                      setOpen(false);
                    }}
                    className="flex w-full items-center rounded-xl px-2 py-1.5 hover:bg-nova-navy/[0.04]"
                  >
                    <span
                      style={getCourseStyle(option.color)}
                      className="inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-semibold leading-none tracking-wide"
                    >
                      {option.name}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
