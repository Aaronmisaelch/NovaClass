"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Crown, UserX } from "lucide-react";
import type { GroupMember } from "@/lib/teamclass/types";

const EASE = [0.22, 1, 0.36, 1] as const;

export function MemberList({
  members,
  leaderId,
  currentUid,
  onExpel,
}: {
  members: GroupMember[];
  leaderId: string;
  currentUid: string;
  onExpel: (uid: string) => void;
}) {
  const isLeader = leaderId === currentUid;

  return (
    <div className="flex flex-col gap-1">
      <AnimatePresence>
        {members.map((member) => (
          <motion.div
            layout
            key={member.uid}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="flex items-center gap-3 rounded-2xl px-2.5 py-2.5 transition-colors hover:bg-nova-navy/[0.025]"
          >
            <div className="relative shrink-0">
              {member.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.photoURL} alt="" className="h-12 w-12 rounded-full" />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-nova-electric/15 to-nova-sky/10" />
              )}
              {member.uid === leaderId && (
                <span className="absolute -bottom-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-nova-white ring-2 ring-nova-white">
                  <Crown className="h-3 w-3 text-nova-electric" strokeWidth={2} fill="currentColor" />
                </span>
              )}
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="truncate text-sm font-medium text-nova-navy">{member.name}</span>
              {member.uid === leaderId && (
                <span className="shrink-0 rounded-full bg-nova-electric/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-nova-electric">
                  Líder
                </span>
              )}
            </div>

            {isLeader && member.uid !== currentUid && (
              <button
                type="button"
                onClick={() => onExpel(member.uid)}
                aria-label="Expulsar integrante"
                className="shrink-0 text-nova-navy/30 transition-colors hover:text-red-500"
              >
                <UserX className="h-3.5 w-3.5" />
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
