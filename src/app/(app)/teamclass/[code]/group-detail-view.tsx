"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onSnapshot } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { expelMember, groupRef, leaveGroup, membersCollectionRef } from "@/lib/teamclass/data";
import type { Group, GroupMember } from "@/lib/teamclass/types";
import { GroupCodeBadge } from "@/app/(app)/teamclass/[code]/group-code-badge";
import { MembersCard } from "@/app/(app)/teamclass/[code]/members-card";
import { LeaveGroupModal } from "@/app/(app)/teamclass/[code]/leave-group-modal";
import { ExpelMemberDialog } from "@/app/(app)/teamclass/[code]/expel-member-dialog";
import { GroupChat } from "@/app/(app)/teamclass/[code]/group-chat";
import { LinksWidget } from "@/app/(app)/teamclass/[code]/links-widget";
import { getCachedView, setCachedView } from "@/lib/cache/view-cache";

const EASE = [0.22, 1, 0.36, 1] as const;

interface GroupDetailSnapshot {
  group: Group;
  members: GroupMember[];
}

export function GroupDetailView({ code }: { code: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const cached = getCachedView<GroupDetailSnapshot>(`teamclass-detail:${code}`);

  const [group, setGroup] = useState<Group | null | undefined>(cached?.group);
  const [members, setMembers] = useState<GroupMember[]>(cached?.members ?? []);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [expelTarget, setExpelTarget] = useState<GroupMember | null>(null);
  const doorGradId = useId();
  const lightGradId = useId();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      groupRef(code),
      (snapshot) => {
        setGroup(snapshot.exists() ? (snapshot.data() as Group) : null);
      },
      (error) => {
        // This page only ever loads for a group the viewer already belonged
        // to; a permission-denied here means it was deleted elsewhere mid-
        // session, not a genuine access problem — treat it the same as
        // exists()===false above rather than an unhandled error.
        if (error.code === "permission-denied") {
          setGroup(null);
        } else {
          console.error("[teamclass] group listener error:", error);
        }
      }
    );
    return unsubscribe;
  }, [code]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      membersCollectionRef(code),
      (snapshot) => {
        setMembers(
          snapshot.docs
            .map((docSnapshot) => docSnapshot.data() as GroupMember)
            .sort((a, b) => a.joinedAt - b.joinedAt)
        );
      },
      (error) => {
        // Same underlying cause as the group listener above — if the group
        // is gone, that listener already handles navigating away, so a
        // permission-denied here is expected and needs no separate action.
        if (error.code !== "permission-denied") {
          console.error("[teamclass] members listener error:", error);
        }
      }
    );
    return unsubscribe;
  }, [code]);

  // Navigating away is a side effect, not something render is allowed to
  // trigger directly (React flags "setState during render" on the Router
  // when it happens inline) — it has to run from an effect instead.
  useEffect(() => {
    if (group === null) {
      router.replace("/teamclass");
    }
  }, [group, router]);

  // Only the happy path (a real, currently-accessible group) gets cached —
  // access-denied/unloaded states are deliberately left uncached so a
  // membership change is always re-verified fresh, never served stale.
  useEffect(() => {
    if (!group) return;
    setCachedView(`teamclass-detail:${code}`, { group, members });
  }, [code, group, members]);

  if (!user || group === undefined || group === null) {
    return <div className="p-10 text-sm text-nova-navy/40">Cargando…</div>;
  }

  if (!group.memberIds.includes(user.uid)) {
    return (
      <main className="relative flex min-h-[70vh] items-center justify-center p-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-nova-navy/[0.04] bg-nova-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_1px_2px_-1px_rgba(4,14,60,0.06),0_18px_40px_-22px_rgba(4,14,60,0.18)]"
        >
          <div className="grid grid-cols-1 items-center gap-4 px-10 py-12 sm:grid-cols-[7rem_1fr] sm:gap-10 sm:px-12 sm:py-14">
            <div className="relative mx-auto h-36 w-32 shrink-0 sm:mx-0">
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 rounded-full blur-2xl"
                style={{ background: "radial-gradient(circle, rgba(10,109,253,0.14) 0%, rgba(10,109,253,0) 70%)" }}
                animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />

              <svg viewBox="0 0 112 128" className="relative h-full w-full" fill="none">
                <defs>
                  <linearGradient id={doorGradId} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0A6DFD" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#57B9FD" stopOpacity="0.07" />
                  </linearGradient>
                  <linearGradient id={lightGradId} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#57B9FD" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#57B9FD" stopOpacity="0" />
                  </linearGradient>
                </defs>

                <rect
                  x="6"
                  y="4"
                  width="100"
                  height="120"
                  rx="18"
                  fill={`url(#${doorGradId})`}
                  stroke="rgba(4,14,60,0.1)"
                  strokeWidth="2"
                />
                <rect x="18" y="18" width="76" height="40" rx="8" fill="none" stroke="rgba(4,14,60,0.07)" strokeWidth="1.5" />
                <rect x="18" y="66" width="76" height="40" rx="8" fill="none" stroke="rgba(4,14,60,0.07)" strokeWidth="1.5" />

                <motion.rect
                  x="6"
                  y="8"
                  width="6"
                  height="112"
                  fill={`url(#${lightGradId})`}
                  animate={{ opacity: [0.3, 0.75, 0.3] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                />

                <motion.circle
                  cx="88"
                  cy="64"
                  r="9"
                  fill="none"
                  stroke="#0A6DFD"
                  strokeOpacity="0.25"
                  strokeWidth="1.5"
                  style={{ transformOrigin: "88px 64px" }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
                <circle cx="88" cy="64" r="4.5" fill="#040E3C" fillOpacity="0.35" />
              </svg>
            </div>

            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold tracking-tight text-nova-navy">
                Ya no tienes acceso a este grupo
              </h1>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-nova-navy/45 sm:mx-0">
                El líder actualizó la lista de integrantes y tu lugar aquí ya no está disponible. Tranquilo,
                tus otros grupos en TeamClass siguen intactos.
              </p>

              <Link
                href="/teamclass"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-nova-electric to-nova-intermediate px-6 py-2.5 text-sm font-semibold text-nova-white shadow-[0_6px_18px_-6px_rgba(10,109,253,0.5)] transition-shadow hover:shadow-[0_10px_24px_-6px_rgba(10,109,253,0.6)]"
              >
                Volver a mis grupos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    );
  }

  const isLeader = group.leaderId === user.uid;
  const isLastMember = members.length === 1;
  const nextLeaderName =
    isLeader && !isLastMember ? (members.find((member) => member.uid !== user.uid)?.name ?? null) : null;

  async function handleLeave() {
    await leaveGroup(user!.uid, code).catch(() => {});
    router.push("/teamclass");
  }

  return (
    <main className="relative p-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-nova-navy">
          {group.projectName || "Proyecto sin nombre"}
        </h1>
        <GroupCodeBadge code={code} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-[520px] lg:h-[760px]">
          <GroupChat code={code} currentUid={user.uid} senderName={user.displayName ?? "Sin nombre"} />
        </div>

        <div className="flex flex-col gap-6">
          <div className="min-h-[240px] shrink-0 lg:h-[280px]">
            <MembersCard
              members={members}
              leaderId={group.leaderId}
              currentUid={user.uid}
              onExpel={(uid) => setExpelTarget(members.find((member) => member.uid === uid) ?? null)}
              onRequestLeave={() => setShowLeaveConfirm(true)}
            />
          </div>
          <div className="min-h-[280px] flex-1 lg:min-h-0">
            <LinksWidget code={code} currentUid={user.uid} />
          </div>
        </div>
      </div>

      {showLeaveConfirm && (
        <LeaveGroupModal
          projectName={group.projectName}
          code={code}
          isLastMember={isLastMember}
          nextLeaderName={nextLeaderName}
          onConfirm={handleLeave}
          onClose={() => setShowLeaveConfirm(false)}
        />
      )}

      <AnimatePresence>
        {expelTarget && (
          <ExpelMemberDialog
            memberName={expelTarget.name}
            onConfirm={() => {
              expelMember(code, expelTarget.uid).catch(() => {});
              setExpelTarget(null);
            }}
            onClose={() => setExpelTarget(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
