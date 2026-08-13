"use client";

import { motion } from "framer-motion";
import { UserX } from "lucide-react";

export function ExpelMemberDialog({
  memberName,
  onConfirm,
  onClose,
}: {
  memberName: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-nova-navy/20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm rounded-3xl border border-nova-navy/5 bg-nova-white p-8 text-center shadow-[0_20px_60px_-30px_rgba(4,14,60,0.35)]"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <UserX className="h-5 w-5 text-red-500" strokeWidth={1.75} />
        </div>
        <h2 className="mt-4 text-base font-semibold text-nova-navy">¿Expulsar a {memberName}?</h2>
        <p className="mt-2 text-sm text-nova-navy/50">
          Perderá acceso al chat, los enlaces y toda la información de este grupo de inmediato.
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
            onClick={onConfirm}
            className="flex-1 rounded-full bg-red-500 px-6 py-2.5 text-sm font-medium text-nova-white transition-opacity hover:opacity-90"
          >
            Expulsar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
