"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function WidgetCard({
  children,
  className = "",
  dragHandleProps,
  style,
  noPadding,
}: {
  children: ReactNode;
  className?: string;
  dragHandleProps?: Record<string, unknown>;
  style?: React.CSSProperties;
  noPadding?: boolean;
}) {
  const { style: handleStyle, ...restHandleProps } = dragHandleProps ?? {};

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -3 }}
      whileTap={{ y: -1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{ ...style, ...(handleStyle as React.CSSProperties) }}
      {...restHandleProps}
      className={`relative flex h-full flex-col overflow-hidden rounded-3xl border border-nova-navy/[0.04] bg-nova-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_1px_2px_-1px_rgba(4,14,60,0.06),0_18px_40px_-22px_rgba(4,14,60,0.18)] ${noPadding ? "" : "p-5"} ${className}`}
    >
      {children}
    </motion.div>
  );
}
