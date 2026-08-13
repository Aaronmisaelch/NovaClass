"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function GroupCodeBadge({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex shrink-0 items-center gap-3 rounded-2xl border border-nova-navy/10 bg-nova-navy/[0.02] px-4 py-2.5 transition-colors hover:bg-nova-navy/[0.04]"
    >
      <span className="text-xs font-medium uppercase tracking-wide text-nova-navy/40">Código</span>
      <span className="font-mono text-lg font-bold tracking-[0.15em] text-nova-navy">{code}</span>
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
  );
}
