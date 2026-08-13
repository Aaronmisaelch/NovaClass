"use client";

import { motion } from "framer-motion";
import { Clock, Flame, Gift } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function NoWidgetsEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="relative flex items-center gap-6 overflow-hidden rounded-3xl border border-nova-navy/[0.04] bg-nova-white px-8 py-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_1px_2px_-1px_rgba(4,14,60,0.06),0_18px_40px_-22px_rgba(4,14,60,0.18)] sm:px-10"
    >
      <div className="flex-1">
        <p className="text-base font-semibold text-nova-navy">Personaliza tu espacio</p>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-nova-navy/45">
          Agrega widgets de hora, countdown, cumpleaños y más — elige uno desde el botón de arriba para
          empezar.
        </p>
      </div>

      <div className="relative hidden h-28 w-40 shrink-0 sm:block">
        <motion.div
          aria-hidden="true"
          className="absolute left-0 top-3 flex h-16 w-16 -rotate-[8deg] items-center justify-center rounded-2xl"
          style={{ background: "linear-gradient(135deg, rgba(10,109,253,0.12) 0%, rgba(87,185,253,0.06) 100%)" }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Clock className="h-5 w-5 text-nova-electric/50" strokeWidth={1.75} />
        </motion.div>

        <motion.div
          aria-hidden="true"
          className="absolute left-14 top-0 z-10 flex h-16 w-20 rotate-[4deg] items-center justify-center rounded-2xl border border-nova-navy/5 bg-nova-white shadow-[0_14px_28px_-16px_rgba(4,14,60,0.25)]"
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        >
          <Flame className="h-5 w-5 text-nova-electric/60" strokeWidth={1.75} />
        </motion.div>

        <motion.div
          aria-hidden="true"
          className="absolute bottom-0 right-0 flex h-14 w-14 -rotate-[5deg] items-center justify-center rounded-xl"
          style={{ background: "linear-gradient(135deg, rgba(87,185,253,0.14) 0%, rgba(10,109,253,0.06) 100%)" }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        >
          <Gift className="h-4 w-4 text-nova-electric/50" strokeWidth={1.75} />
        </motion.div>

        <motion.span
          aria-hidden="true"
          className="absolute right-6 top-0 h-1.5 w-1.5 rounded-full bg-nova-sky/50"
          animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          aria-hidden="true"
          className="absolute bottom-2 left-2 h-1 w-1 rounded-full bg-nova-electric/40"
          animate={{ y: [0, 5, 0], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </div>
    </motion.div>
  );
}
