"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, LoaderCircle } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function LeaveGroupModal({
  projectName,
  code,
  isLastMember,
  nextLeaderName,
  onConfirm,
  onClose,
}: {
  projectName: string;
  code: string;
  isLastMember: boolean;
  nextLeaderName: string | null;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLeaving, setIsLeaving] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-nova-navy/20 px-6">
      <AnimatePresence mode="wait">
        {isLastMember ? (
          <motion.div
            key="last-member"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="w-full max-w-sm rounded-3xl border border-nova-navy/5 bg-nova-white p-8 text-center shadow-[0_20px_60px_-30px_rgba(4,14,60,0.35)]"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-500" strokeWidth={1.75} />
            </div>
            <h2 className="mt-4 text-base font-semibold text-nova-navy">
              Esto eliminará {projectName || "el grupo"} por completo
            </h2>
            <p className="mt-2 text-sm text-nova-navy/50">
              Eres el último integrante: al salir, se eliminarán para siempre el chat, los enlaces y los archivos del
              grupo. Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLeaving}
                className="flex-1 rounded-full border border-nova-navy/10 px-6 py-2.5 text-sm font-medium text-nova-navy/70 transition-colors hover:bg-nova-navy/[0.03] disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isLeaving}
                onClick={async () => {
                  setIsLeaving(true);
                  await onConfirm();
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500 px-6 py-2.5 text-sm font-medium text-nova-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isLeaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Sí, salir"}
              </button>
            </div>
          </motion.div>
        ) : step === 1 ? (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="w-full max-w-sm rounded-3xl border border-nova-navy/5 bg-nova-white p-8 text-center shadow-[0_20px_60px_-30px_rgba(4,14,60,0.35)]"
          >
            <h2 className="text-base font-semibold text-nova-navy">
              ¿Salir de {projectName || "este grupo"}?
            </h2>
            <p className="mt-2 text-sm text-nova-navy/50">Podrás volver a integrarte más tarde con el código {code}.</p>
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
                onClick={() => setStep(2)}
                className="flex-1 rounded-full bg-red-500 px-6 py-2.5 text-sm font-medium text-nova-white transition-opacity hover:opacity-90"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="w-full max-w-sm rounded-3xl border border-nova-navy/5 bg-nova-white p-8 text-center shadow-[0_20px_60px_-30px_rgba(4,14,60,0.35)]"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-500" strokeWidth={1.75} />
            </div>
            <h2 className="mt-4 text-base font-semibold text-nova-navy">Última confirmación</h2>
            <p className="mt-2 text-sm text-nova-navy/50">
              {nextLeaderName
                ? `El liderazgo pasará a ${nextLeaderName}. Esta acción no se puede deshacer.`
                : "Esta acción no se puede deshacer."}
            </p>
            <div className="mt-6 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLeaving}
                className="flex-1 rounded-full border border-nova-navy/10 px-6 py-2.5 text-sm font-medium text-nova-navy/70 transition-colors hover:bg-nova-navy/[0.03] disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isLeaving}
                onClick={async () => {
                  setIsLeaving(true);
                  await onConfirm();
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500 px-6 py-2.5 text-sm font-medium text-nova-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isLeaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Sí, salir"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
