"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FolderPlus, LoaderCircle, X } from "lucide-react";

export function CreateGroupModal({
  onCreate,
  onClose,
}: {
  onCreate: (projectName: string) => Promise<void>;
  onClose: () => void;
}) {
  const [projectName, setProjectName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      await onCreate(projectName.trim());
    } catch {
      setError("No se pudo crear el grupo. Inténtalo de nuevo.");
      setIsSubmitting(false);
    }
  }

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
            <FolderPlus className="h-5 w-5 text-nova-electric" strokeWidth={1.75} />
            <h2 className="text-base font-semibold text-nova-navy">Crear grupo</h2>
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
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && projectName.trim()) handleSubmit();
          }}
          placeholder="Nombre del proyecto"
          className="w-full rounded-2xl border border-nova-navy/10 bg-nova-white px-4 py-2.5 text-sm text-nova-navy outline-none transition-colors focus:border-nova-electric"
        />

        <button
          type="button"
          disabled={projectName.trim().length === 0 || isSubmitting}
          onClick={handleSubmit}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-nova-electric to-nova-intermediate px-6 py-2.5 text-sm font-medium text-nova-white disabled:opacity-40"
        >
          {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Crear grupo"}
        </button>

        {error && <p className="mt-3 text-center text-sm text-red-500">{error}</p>}
      </motion.div>
    </div>
  );
}
