"use client";

import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";

export function SignOutButton() {
  const { signOut } = useAuth();

  return (
    <motion.button
      type="button"
      onClick={() => signOut()}
      whileHover={{ y: -1 }}
      whileTap={{ y: 0, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="flex items-center gap-2 rounded-full border border-nova-navy/10 px-5 py-2.5 text-sm font-medium text-nova-navy/70 transition-colors hover:bg-nova-navy/[0.03]"
    >
      <LogOut className="h-4 w-4" strokeWidth={1.75} />
      Cerrar sesión
    </motion.button>
  );
}
