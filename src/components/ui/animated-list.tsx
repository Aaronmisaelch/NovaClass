"use client";

import React, { useEffect, useMemo, useState, type ReactElement } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AnimatedListProps {
  className?: string;
  children: React.ReactNode;
  delay?: number;
}

// Reveals its children one at a time, each with a spring scale+fade entrance
// (see AnimatedListItem below). The item revealed first ends up at the
// bottom once later items are added above it — React.Children.toArray order
// is the reveal order, so callers control final position purely through the
// order they pass children in.
//
// Adapted from a notification-feed demo, which looped forever
// ((prevIndex + 1) % length) since an ambient feed never "finishes". A task
// list does: once every child has been revealed, this stops for good — no
// modulo, no re-hiding, no restart.
export const AnimatedList = React.memo(
  ({ className, children, delay = 120 }: AnimatedListProps) => {
    const [index, setIndex] = useState(0);
    const childrenArray = React.Children.toArray(children);

    useEffect(() => {
      if (index >= childrenArray.length - 1) return;
      const timeout = setTimeout(() => {
        setIndex((prevIndex) => prevIndex + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }, [index, childrenArray.length, delay]);

    const itemsToShow = useMemo(
      () => childrenArray.slice(0, index + 1).reverse(),
      [index, childrenArray]
    );

    return (
      <div className={cn("flex flex-col items-stretch gap-2", className)}>
        <AnimatePresence>
          {itemsToShow.map((item) => (
            <AnimatedListItem key={(item as ReactElement).key}>
              {item}
            </AnimatedListItem>
          ))}
        </AnimatePresence>
      </div>
    );
  }
);

AnimatedList.displayName = "AnimatedList";

export function AnimatedListItem({ children }: { children: React.ReactNode }) {
  const animations = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1, originY: 0 },
    exit: { scale: 0, opacity: 0 },
    transition: { type: "spring" as const, stiffness: 350, damping: 40 },
  };

  return (
    <motion.div {...animations} layout className="mx-auto w-full">
      {children}
    </motion.div>
  );
}
