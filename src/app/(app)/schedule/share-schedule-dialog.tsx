"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, LoaderCircle, Share2 } from "lucide-react";
import { createScheduleShare, saveScheduleShareCode } from "@/lib/schedule/data";
import type { Course, Recreo } from "@/lib/schedule/types";

const EASE = [0.22, 1, 0.36, 1] as const;

export function ShareScheduleDialog({
  uid,
  config,
  courses,
  cells,
  existingCode,
  onCodeCreated,
  onClose,
}: {
  uid: string;
  config: {
    startTime: string;
    blockCount: number;
    blockDurationMinutes: number;
    recreos: Recreo[];
  };
  courses: Course[];
  cells: Record<string, string>;
  existingCode: string | null;
  onCodeCreated: (code: string) => void;
  onClose: () => void;
}) {
  const [code, setCode] = useState<string | null>(existingCode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleConfirm() {
    setError(null);
    setIsSubmitting(true);
    try {
      const generatedCode = await createScheduleShare(uid, config, courses, cells);
      await saveScheduleShareCode(uid, generatedCode);
      setCode(generatedCode);
      onCodeCreated(generatedCode);
    } catch {
      setError("No se pudo generar el código. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCopy() {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-nova-navy/20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="w-full max-w-sm rounded-3xl border border-nova-navy/5 bg-nova-white p-8 text-center shadow-[0_20px_60px_-30px_rgba(4,14,60,0.35)]"
      >
        <Share2 className="mx-auto h-6 w-6 text-nova-electric" strokeWidth={1.75} />

        {!code ? (
          <>
            <h2 className="mt-4 text-base font-semibold text-nova-navy">Compartir horario</h2>
            <p className="mt-2 text-sm text-nova-navy/50">
              Se generará un código de 6 dígitos que puedes copiar y compartir. Quien lo use recibirá tu
              horario y tus cursos ya configurados, listos para usar.
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
                disabled={isSubmitting}
                onClick={handleConfirm}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-nova-electric to-nova-intermediate px-6 py-2.5 text-sm font-medium text-nova-white disabled:opacity-60"
              >
                {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Confirmar"}
              </button>
            </div>
            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
          </>
        ) : (
          <>
            <h2 className="mt-4 text-base font-semibold text-nova-navy">
              {existingCode === code ? "Tu código para compartir" : "¡Listo! Aquí está tu código"}
            </h2>
            <p className="mt-2 text-sm text-nova-navy/50">Compártelo con quien quieras que reciba este horario.</p>

            <button
              type="button"
              onClick={handleCopy}
              className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl border border-nova-navy/10 bg-nova-navy/[0.02] px-4 py-3 transition-colors hover:bg-nova-navy/[0.04]"
            >
              <span className="font-mono text-2xl font-bold tracking-[0.3em] text-nova-navy">{code}</span>
              <span className="h-5 w-px bg-nova-navy/10" />
              <span className="relative flex h-4 w-4 items-center justify-center">
                <AnimatePresence mode="wait" initial={false}>
                  {copied ? (
                    <motion.span
                      key="check"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2, ease: EASE }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Check className="h-4 w-4 text-nova-electric" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2, ease: EASE }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Copy className="h-4 w-4 text-nova-navy/40" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-full bg-gradient-to-r from-nova-electric to-nova-intermediate px-6 py-2.5 text-sm font-medium text-nova-white"
            >
              Listo
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
