"use client";

import { useEffect, useRef, useState } from "react";
import { onSnapshot, orderBy, query } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send } from "lucide-react";
import { WidgetCard } from "@/app/(app)/dashboard/widget-card";
import { messagesCollectionRef, sendTextMessage } from "@/lib/teamclass/data";
import type { GroupMessage } from "@/lib/teamclass/types";
import { ChatMessageBubble } from "@/app/(app)/teamclass/[code]/chat-message-bubble";

const EASE = [0.22, 1, 0.36, 1] as const;

export function GroupChat({
  code,
  currentUid,
  senderName,
  className = "",
}: {
  code: string;
  currentUid: string;
  senderName: string;
  className?: string;
}) {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const messagesQuery = query(messagesCollectionRef(code), orderBy("createdAt", "asc"));
    return onSnapshot(
      messagesQuery,
      (snapshot) => {
        setMessages(
          snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }) as GroupMessage)
        );
      },
      (error) => {
        // Reading this subcollection requires verifying group membership,
        // which fails once the group itself is deleted — Firestore reports
        // that as permission-denied. GroupDetailView's own group listener
        // already handles navigating away in that case, so this is expected
        // and needs no separate handling here.
        if (error.code !== "permission-denied") {
          console.error("[teamclass] messages listener error:", error);
        }
      }
    );
  }, [code]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sender = { uid: currentUid, name: senderName };

  async function handleSendText() {
    const text = draft.trim();
    if (!text || isSending) return;
    setDraft("");
    setIsSending(true);
    await sendTextMessage(code, sender, text).catch(() => {});
    setIsSending(false);
  }

  // Messages created back when the chat also supported attachments have no
  // "text" (it was null for image/file/voice messages) — those are simply
  // not rendered now that the chat is text-only again, rather than showing
  // an empty bubble or trying to read fields the model no longer has.
  const textMessages = messages.filter((message) => Boolean(message.text));

  return (
    <WidgetCard
      noPadding
      className={`gap-0 ${className}`}
      style={{ background: "linear-gradient(165deg, #FFFFFF 0%, #F1F7FE 55%, #E8F1FE 100%)" }}
    >
      <div className="flex items-center gap-2.5 border-b border-nova-navy/5 px-5 py-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-nova-electric/15 to-nova-sky/10 text-nova-electric">
          <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <div>
          <p className="text-sm font-semibold text-nova-navy">Chat del grupo</p>
          <p className="text-[11px] text-nova-navy/35">Conversación en tiempo real</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
        {textMessages.length === 0 ? (
          <div className="relative flex flex-1 flex-col items-center justify-center gap-6 overflow-hidden px-6 py-8 text-center">
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute h-40 w-40 rounded-full blur-2xl"
              style={{ background: "radial-gradient(circle, rgba(87,185,253,0.16) 0%, rgba(87,185,253,0) 70%)" }}
              animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.85, 0.5] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative flex h-28 w-40 items-center justify-center">
              <motion.div
                aria-hidden="true"
                className="absolute left-0 top-0 flex h-11 w-[5.5rem] -rotate-3 flex-col justify-center gap-1.5 rounded-2xl rounded-bl-sm bg-gradient-to-br from-nova-electric to-nova-intermediate px-3.5 shadow-[0_10px_22px_-10px_rgba(10,109,253,0.55)]"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="h-1.5 w-full rounded-full bg-nova-white/35" />
                <span className="h-1.5 w-2/3 rounded-full bg-nova-white/35" />
              </motion.div>

              <motion.div
                aria-hidden="true"
                className="absolute right-0 top-9 flex h-11 w-24 rotate-2 flex-col justify-center gap-1.5 rounded-2xl rounded-br-sm border border-nova-navy/5 bg-nova-white px-3.5 shadow-[0_10px_22px_-12px_rgba(4,14,60,0.25)]"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              >
                <span className="h-1.5 w-full rounded-full bg-nova-navy/10" />
                <span className="h-1.5 w-1/2 rounded-full bg-nova-navy/10" />
              </motion.div>

              <motion.div
                aria-hidden="true"
                className="absolute bottom-0 left-6 flex h-7 w-12 -rotate-2 items-center justify-center gap-0.5 rounded-full rounded-bl-sm bg-nova-navy/[0.05]"
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              >
                {[0, 1, 2].map((dot) => (
                  <motion.span
                    key={dot}
                    className="h-1.5 w-1.5 rounded-full bg-nova-navy/25"
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: dot * 0.15 }}
                  />
                ))}
              </motion.div>

              <motion.span
                aria-hidden="true"
                className="absolute right-3 top-0 h-1.5 w-1.5 rounded-full bg-nova-sky/60"
                animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <div className="relative">
              <p className="text-base font-bold text-nova-navy">Todavía no hay mensajes</p>
              <p className="mt-1.5 max-w-[16rem] text-xs leading-relaxed text-nova-navy/40">
                Escribe el primero para arrancar la conversación del grupo.
              </p>
            </div>
          </div>
        ) : (
          <>
            <AnimatePresence initial={false}>
              {textMessages.map((message) => (
                <ChatMessageBubble key={message.id} message={message} isOwn={message.senderId === currentUid} />
              ))}
            </AnimatePresence>
            <div ref={listEndRef} />
          </>
        )}
      </div>

      <div className="border-t border-nova-navy/5 bg-nova-navy/[0.015] px-4 py-3.5">
        <div className="flex items-end gap-1 rounded-2xl border border-nova-navy/10 bg-nova-white pr-1.5 transition-colors focus-within:border-nova-electric">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSendText();
              }
            }}
            placeholder="Escribe un mensaje…"
            rows={1}
            className="max-h-28 flex-1 resize-none bg-transparent py-2.5 pl-4 text-sm text-nova-navy outline-none"
          />

          <motion.button
            type="button"
            onClick={handleSendText}
            disabled={!draft.trim() || isSending}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.15, ease: EASE }}
            aria-label="Enviar"
            className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-nova-electric to-nova-intermediate text-nova-white disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" strokeWidth={2} />
          </motion.button>
        </div>
      </div>
    </WidgetCard>
  );
}
