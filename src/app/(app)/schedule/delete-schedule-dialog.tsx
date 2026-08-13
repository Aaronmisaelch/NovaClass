"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";

export function DeleteScheduleDialog({
  onConfirm,
  onClose,
}: {
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [confirmedOnce, setConfirmedOnce] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-nova-navy/20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm rounded-3xl border border-nova-navy/5 bg-nova-white p-8 text-center shadow-[0_20px_60px_-30px_rgba(4,14,60,0.35)]"
      >
        <TriangleAlert className="mx-auto h-6 w-6 text-red-500" strokeWidth={1.75} />

        <AnimatePresence mode="wait">
          {!confirmedOnce ? (
            <motion.div
              key="step-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="mt-4 text-base font-semibold text-nova-navy">
                Eliminar horario
              </h2>
              <p className="mt-2 text-sm text-nova-navy/50">
                Esto eliminará la hora de inicio, los bloques de clase y los
                recreos, junto con la posición de tus cursos en la grilla. Tus
                cursos y tus tareas no se ven afectados.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="step-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="mt-4 text-base font-semibold text-nova-navy">
                ¿Confirmas la eliminación?
              </h2>
              <p className="mt-2 text-sm text-nova-navy/50">
                Esta acción no se puede deshacer.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-nova-navy/10 px-6 py-2.5 text-sm font-medium text-nova-navy/70 transition-colors hover:bg-nova-navy/[0.03]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => (confirmedOnce ? onConfirm() : setConfirmedOnce(true))}
            className="flex-1 rounded-full bg-red-500 px-6 py-2.5 text-sm font-medium text-nova-white transition-opacity hover:opacity-90"
          >
            {confirmedOnce ? "Sí, eliminar horario" : "Eliminar horario"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
