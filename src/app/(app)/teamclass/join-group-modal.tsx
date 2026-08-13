"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, LoaderCircle, X } from "lucide-react";
import { MAX_GROUP_MEMBERS } from "@/lib/teamclass/types";

export function JoinGroupModal({
  onJoin,
  onClose,
}: {
  onJoin: (code: string) => Promise<void>;
  onClose: () => void;
}) {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      await onJoin(code);
    } catch (err) {
      if (err instanceof Error && err.message === "NOT_FOUND") {
        setError("No existe ningún grupo con ese código.");
      } else if (err instanceof Error && err.message === "GROUP_FULL") {
        setError(`Este grupo ya alcanzó el máximo de ${MAX_GROUP_MEMBERS} integrantes.`);
      } else {
        setError("No se pudo unir al grupo. Inténtalo de nuevo.");
      }
      setIsSubmitting(false);
    }
  }

  const isValid = /^\d{4}$/.test(code);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-nova-navy/20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm rounded-3xl border border-nova-navy/5 bg-nova-white p-8 shadow-[0_20px_60px_-30px_rgba(4,14,60,0.35)]"
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-nova-electric" strokeWidth={1.75} />
            <h2 className="text-base font-semibold text-nova-navy">Unirme a grupo</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-nova-navy/40 hover:text-nova-navy"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <input
          autoFocus
          inputMode="numeric"
          maxLength={4}
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 4))}
          onKeyDown={(event) => {
            if (event.key === "Enter" && isValid) handleSubmit();
          }}
          placeholder="0000"
          className="w-full rounded-2xl border border-nova-navy/10 bg-nova-white px-4 py-2.5 text-center text-2xl tracking-[0.5em] text-nova-navy outline-none transition-colors focus:border-nova-electric"
        />

        <button
          type="button"
          disabled={!isValid || isSubmitting}
          onClick={handleSubmit}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-nova-electric to-nova-intermediate px-6 py-2.5 text-sm font-medium text-nova-white disabled:opacity-40"
        >
          {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Unirme"}
        </button>

        {error && <p className="mt-3 text-center text-sm text-red-500">{error}</p>}
      </motion.div>
    </div>
  );
}
