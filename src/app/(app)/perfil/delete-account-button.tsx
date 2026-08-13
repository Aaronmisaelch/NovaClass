"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { DeleteAccountModal } from "@/app/(app)/perfil/delete-account-modal";

export function DeleteAccountButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileHover={{ y: -1 }}
        whileTap={{ y: 0, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="flex items-center gap-2 rounded-full border border-red-200 px-5 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
        Eliminar cuenta
      </motion.button>
      {open && <DeleteAccountModal onClose={() => setOpen(false)} />}
    </>
  );
}
