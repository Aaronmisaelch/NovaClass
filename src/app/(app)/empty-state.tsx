"use client";

import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

export function EmptyState({
  icon,
  title,
  description,
  action,
  compact,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className={`flex flex-col items-center justify-center gap-5 rounded-3xl border border-dashed border-nova-navy/10 text-center ${
        compact ? "px-6 py-10" : "px-8 py-16"
      }`}
    >
      <div className="relative flex h-24 w-24 items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-[2rem]"
          style={{
            background:
              "linear-gradient(135deg, rgba(10,109,253,0.12) 0%, rgba(87,185,253,0.08) 100%)",
          }}
          animate={{ rotate: [0, 6, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          aria-hidden="true"
          className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-nova-sky/40"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          aria-hidden="true"
          className="absolute -bottom-1 -left-1 h-2.5 w-2.5 rounded-full bg-nova-electric/30"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        <span className="relative flex h-9 w-9 items-center justify-center text-nova-electric [&>svg]:h-9 [&>svg]:w-9">
          {icon}
        </span>
      </div>

      <div className="flex max-w-xs flex-col gap-1.5">
        <p className="text-sm font-medium text-nova-navy">{title}</p>
        <p className="text-xs leading-relaxed text-nova-navy/45">{description}</p>
      </div>

      {action}
    </motion.div>
  );
}
