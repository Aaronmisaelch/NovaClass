"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, LoaderCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";

const EASE = [0.22, 1, 0.36, 1] as const;

export function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const { deleteAccount } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setError(null);
    setIsDeleting(true);
    try {
      await deleteAccount();
    } catch {
      setIsDeleting(false);
      setError("No se pudo confirmar tu identidad o eliminar la cuenta. Inténtalo de nuevo.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-nova-navy/20 px-6">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="w-full max-w-sm rounded-3xl border border-nova-navy/5 bg-nova-white p-8 text-center shadow-[0_20px_60px_-30px_rgba(4,14,60,0.35)]"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-500" strokeWidth={1.75} />
            </div>
            <h2 className="mt-4 text-base font-semibold text-nova-navy">¿Eliminar tu cuenta?</h2>
            <p className="mt-2 text-sm text-nova-navy/50">
              Se eliminarán tu perfil, tus cursos, tus tareas, tu horario, tu Dashboard y tu
              membresía en cualquier grupo de TeamClass.
            </p>
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
              Esta acción es permanente y no se puede deshacer. Te pediremos confirmar tu
              identidad con Google antes de eliminar la cuenta.
            </p>
            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
            <div className="mt-6 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="flex-1 rounded-full border border-nova-navy/10 px-6 py-2.5 text-sm font-medium text-nova-navy/70 transition-colors hover:bg-nova-navy/[0.03] disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirm}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500 px-6 py-2.5 text-sm font-medium text-nova-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isDeleting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Sí, eliminar cuenta"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
