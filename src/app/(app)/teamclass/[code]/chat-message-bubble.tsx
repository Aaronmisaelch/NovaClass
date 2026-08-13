"use client";

import { motion } from "framer-motion";
import { splitTextWithLinks } from "@/lib/teamclass/links";
import type { GroupMessage } from "@/lib/teamclass/types";

const EASE = [0.22, 1, 0.36, 1] as const;

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function LinkifiedText({ text, isOwn }: { text: string; isOwn: boolean }) {
  const segments = splitTextWithLinks(text);
  return (
    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
      {segments.map((segment, index) =>
        segment.type === "link" ? (
          <a
            key={index}
            href={segment.value}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline underline-offset-2 ${
              isOwn ? "text-nova-white hover:text-nova-white/85" : "text-nova-electric hover:text-nova-electric/80"
            }`}
          >
            {segment.value}
          </a>
        ) : (
          <span key={index}>{segment.value}</span>
        )
      )}
    </p>
  );
}

export function ChatMessageBubble({ message, isOwn }: { message: GroupMessage; isOwn: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      className={`flex items-start gap-2 ${isOwn ? "justify-end" : "justify-start"}`}
    >
      {!isOwn && (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-nova-electric/15 to-nova-sky/10 text-[11px] font-semibold text-nova-electric">
          {getInitial(message.senderName)}
        </span>
      )}

      <div className={`flex max-w-[70%] flex-col gap-1 ${isOwn ? "items-end" : "items-start"}`}>
        {!isOwn && (
          <span className="px-1 text-[11px] font-semibold text-nova-navy/45">{message.senderName}</span>
        )}

        <div
          className={`overflow-hidden rounded-2xl px-4 py-2.5 ${
            isOwn
              ? "rounded-tr-md bg-gradient-to-br from-nova-electric to-nova-intermediate text-nova-white shadow-[0_4px_14px_-6px_rgba(10,109,253,0.5)]"
              : "rounded-tl-md border border-nova-navy/[0.04] bg-nova-navy/[0.04] text-nova-navy"
          }`}
        >
          <LinkifiedText text={message.text} isOwn={isOwn} />
        </div>

        <span className="px-1 text-[10px] text-nova-navy/30">{formatTime(message.createdAt)}</span>
      </div>
    </motion.div>
  );
}
