"use client";

import { motion } from "framer-motion";
import { ListTodo, Plus } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function NoTasksEmptyState({ onAddTask }: { onAddTask: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="relative overflow-hidden rounded-3xl border border-nova-navy/[0.04] bg-nova-white px-8 py-12 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_1px_2px_-1px_rgba(4,14,60,0.06),0_18px_40px_-22px_rgba(4,14,60,0.18)] sm:px-12 lg:px-16"
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-1/2 -z-10 h-96 w-96 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(87,185,253,0.14) 0%, rgba(87,185,253,0) 70%)" }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <h2 className="text-2xl font-semibold tracking-tight text-nova-navy sm:text-[26px]">
            Organiza tu semana, tarea por tarea
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-nova-navy/45">
            Todavía no tienes tareas pendientes. Agrega la primera y arma tu lista en segundos.
          </p>

          <div className="mt-8">
            <motion.button
              type="button"
              onClick={onAddTask}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2, ease: EASE }}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-nova-electric to-nova-intermediate px-6 py-2.5 text-xs font-semibold text-nova-white shadow-[0_6px_18px_-6px_rgba(10,109,253,0.5)] transition-shadow hover:shadow-[0_10px_24px_-6px_rgba(10,109,253,0.6)]"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
              Agregar tarea
            </motion.button>
          </div>
        </div>

        <div className="relative flex h-36 w-36 shrink-0 items-center justify-center sm:h-40 sm:w-40">
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 rounded-full blur-2xl"
            style={{ background: "radial-gradient(circle, rgba(10,109,253,0.18) 0%, rgba(10,109,253,0) 72%)" }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute h-28 w-28 rounded-[2rem] sm:h-32 sm:w-32"
            style={{
              background: "linear-gradient(135deg, rgba(10,109,253,0.16) 0%, rgba(87,185,253,0.1) 100%)",
              boxShadow: "0 20px 44px -20px rgba(10,109,253,0.35)",
            }}
            animate={{ rotate: [0, 6, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          <ListTodo className="relative h-12 w-12 text-nova-electric sm:h-14 sm:w-14" strokeWidth={1.5} />
          <motion.span
            aria-hidden="true"
            className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full border-4 border-nova-white bg-gradient-to-br from-nova-electric to-nova-sky text-nova-white shadow-[0_6px_16px_-4px_rgba(10,109,253,0.5)] sm:h-11 sm:w-11"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}
