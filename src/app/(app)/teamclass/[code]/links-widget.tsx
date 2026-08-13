"use client";

import { useEffect, useState } from "react";
import { onSnapshot, orderBy, query } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, ExternalLink, Link2, Plus, X } from "lucide-react";
import { WidgetCard } from "@/app/(app)/dashboard/widget-card";
import { addGroupLink, linksCollectionRef } from "@/lib/teamclass/data";
import type { GroupLink } from "@/lib/teamclass/types";

const EASE = [0.22, 1, 0.36, 1] as const;

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function AddLinkForm({
  onCancel,
  onAdd,
}: {
  onCancel: () => void;
  onAdd: (label: string, url: string) => Promise<void>;
}) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-nova-navy/10 p-4">
      <input
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        placeholder="Nombre del recurso"
        className="w-full rounded-xl border border-nova-navy/10 px-3 py-2 text-sm text-nova-navy outline-none focus:border-nova-electric"
      />
      <input
        value={url}
        onChange={(event) => {
          setUrl(event.target.value);
          setError(false);
        }}
        placeholder="https://…"
        className="w-full rounded-xl border border-nova-navy/10 px-3 py-2 text-sm text-nova-navy outline-none focus:border-nova-electric"
      />
      {error && <p className="text-[11px] font-medium text-red-500">Ese enlace no parece válido.</p>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-full border border-nova-navy/10 px-4 py-2 text-xs font-medium text-nova-navy/70 hover:bg-nova-navy/[0.03]"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={!label.trim() || !url.trim() || isSaving}
          onClick={async () => {
            const normalized = normalizeUrl(url);
            try {
              new URL(normalized);
            } catch {
              setError(true);
              return;
            }
            setIsSaving(true);
            await onAdd(label, normalized);
            setIsSaving(false);
          }}
          className="flex-1 rounded-full bg-gradient-to-r from-nova-electric to-nova-intermediate px-4 py-2 text-xs font-medium text-nova-white disabled:opacity-40"
        >
          Agregar
        </button>
      </div>
    </div>
  );
}

function LinkCard({ link }: { link: GroupLink }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3.5 rounded-2xl border border-nova-navy/5 p-3.5 transition-colors hover:border-nova-electric/20 hover:bg-nova-navy/[0.015]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nova-electric/15 to-nova-sky/10 text-nova-electric">
        <Link2 className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-nova-navy">{link.label}</p>
        <span className="mt-1 inline-block max-w-full truncate rounded-full bg-nova-navy/[0.04] px-2 py-0.5 text-[10px] font-medium text-nova-navy/45">
          {link.platform ?? getHostname(link.url)}
        </span>
      </div>
      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-nova-navy/25 transition-colors group-hover:text-nova-electric" />
    </a>
  );
}

export function LinksWidget({
  code,
  currentUid,
  className = "",
}: {
  code: string;
  currentUid: string;
  className?: string;
}) {
  const [links, setLinks] = useState<GroupLink[]>([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const linksQuery = query(linksCollectionRef(code), orderBy("createdAt", "desc"));
    return onSnapshot(
      linksQuery,
      (snapshot) => {
        setLinks(snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }) as GroupLink));
      },
      (error) => {
        // Same underlying cause as the group/messages listeners: reading
        // this subcollection requires verifying group membership, which
        // fails once the group is deleted. GroupDetailView's own group
        // listener already handles navigating away in that case.
        if (error.code !== "permission-denied") {
          console.error("[teamclass] links listener error:", error);
        }
      }
    );
  }, [code]);

  return (
    <WidgetCard
      noPadding
      className={`gap-0 ${className}`}
      style={{ background: "linear-gradient(165deg, #FFFFFF 0%, #F1F7FE 55%, #E8F1FE 100%)" }}
    >
      <div className="flex items-center justify-between border-b border-nova-navy/5 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-nova-electric/15 to-nova-sky/10 text-nova-electric">
            <Link2 className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <p className="text-sm font-semibold text-nova-navy">Enlaces del proyecto</p>
        </div>
        {!adding && (
          <motion.button
            type="button"
            onClick={() => setAdding(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.15, ease: EASE }}
            aria-label="Agregar enlace"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-nova-electric to-nova-intermediate text-nova-white shadow-[0_4px_10px_-3px_rgba(10,109,253,0.5)] transition-shadow hover:shadow-[0_6px_14px_-3px_rgba(10,109,253,0.6)]"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
          </motion.button>
        )}
        {adding && (
          <button
            type="button"
            onClick={() => setAdding(false)}
            aria-label="Cerrar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-nova-navy/30 hover:text-nova-navy/60"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-5 py-4">
        {adding && (
          <AddLinkForm
            onCancel={() => setAdding(false)}
            onAdd={async (label, url) => {
              await addGroupLink(code, currentUid, url, label).catch(() => {});
              setAdding(false);
            }}
          />
        )}

        {links.length === 0 && !adding ? (
          <div className="relative flex flex-1 flex-col items-center justify-center gap-6 overflow-hidden px-6 py-8 text-center">
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute h-40 w-40 rounded-full blur-2xl"
              style={{ background: "radial-gradient(circle, rgba(87,185,253,0.16) 0%, rgba(87,185,253,0) 70%)" }}
              animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.85, 0.5] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative flex h-28 w-32 items-center justify-center">
              <motion.div
                aria-hidden="true"
                className="absolute left-0 top-0 flex h-14 w-14 -rotate-6 items-center justify-center rounded-2xl bg-gradient-to-br from-nova-electric to-nova-intermediate shadow-[0_10px_22px_-10px_rgba(10,109,253,0.55)]"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Link2 className="h-6 w-6 text-nova-white" strokeWidth={1.75} />
              </motion.div>
              <motion.div
                aria-hidden="true"
                className="absolute bottom-1 right-0 flex h-12 w-12 rotate-6 items-center justify-center rounded-2xl border border-nova-navy/5 bg-nova-white shadow-[0_10px_20px_-12px_rgba(4,14,60,0.2)]"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              >
                <Bookmark className="h-4 w-4 text-nova-electric/60" strokeWidth={1.75} />
              </motion.div>
              <motion.div
                aria-hidden="true"
                className="absolute bottom-0 left-8 flex h-9 w-9 -rotate-3 items-center justify-center rounded-xl bg-nova-electric/[0.08]"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              >
                <ExternalLink className="h-3.5 w-3.5 text-nova-electric/45" strokeWidth={1.75} />
              </motion.div>
              <motion.span
                aria-hidden="true"
                className="absolute right-4 top-2 h-1.5 w-1.5 rounded-full bg-nova-sky/60"
                animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <div className="relative">
              <p className="text-base font-bold text-nova-navy">Aún no hay enlaces</p>
              <p className="mt-1.5 max-w-[16rem] text-xs leading-relaxed text-nova-navy/40">
                Guarda aquí los recursos importantes del proyecto: Canva, Google Slides, Prezi y más.
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {links.map((link) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                <LinkCard link={link} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </WidgetCard>
  );
}
