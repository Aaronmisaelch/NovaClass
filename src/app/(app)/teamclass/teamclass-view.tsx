"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { onSnapshot } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { FolderPlus, KeyRound, Users } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { createGroup, deleteMembership, groupRef, joinGroup, membershipsCollectionRef } from "@/lib/teamclass/data";
import type { Group, GroupMembership } from "@/lib/teamclass/types";
import { COURSE_COLORS, hexToRgba } from "@/lib/schedule/colors";
import { CreateGroupModal } from "@/app/(app)/teamclass/create-group-modal";
import { JoinGroupModal } from "@/app/(app)/teamclass/join-group-modal";
import { NoGroupsEmptyState } from "@/app/(app)/teamclass/no-groups-empty-state";
import { getCachedView, setCachedView } from "@/lib/cache/view-cache";

const EASE = [0.22, 1, 0.36, 1] as const;

interface TeamClassSnapshot {
  memberships: GroupMembership[];
  groupsById: Record<string, Group | null>;
}

// Deterministic per-group accent, pulled from the same official palette used
// for course colors elsewhere — every group gets its own identity, but they
// all still read as one cohesive NovaClass family instead of a random mix.
function getGroupAccent(groupId: string): string {
  let hash = 0;
  for (let i = 0; i < groupId.length; i += 1) {
    hash = (hash * 31 + groupId.charCodeAt(i)) % COURSE_COLORS.length;
  }
  return COURSE_COLORS[Math.abs(hash) % COURSE_COLORS.length].hex;
}

export function TeamClassView() {
  const { user } = useAuth();
  const cacheKey = user ? `teamclass:${user.uid}` : null;
  const cached = cacheKey ? getCachedView<TeamClassSnapshot>(cacheKey) : undefined;

  const [memberships, setMemberships] = useState<GroupMembership[] | null>(cached?.memberships ?? null);
  const [groupsById, setGroupsById] = useState<Record<string, Group | null>>(cached?.groupsById ?? {});
  const [modal, setModal] = useState<"create" | "join" | null>(null);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(membershipsCollectionRef(user.uid), (snapshot) => {
      setMemberships(snapshot.docs.map((docSnapshot) => docSnapshot.data() as GroupMembership));
    });
  }, [user]);

  // Keeps the cross-navigation cache in sync with whatever the live
  // listeners currently show, so the next time this view mounts it can
  // render immediately from here instead of flashing "Cargando…" again.
  useEffect(() => {
    if (!user || memberships === null) return;
    setCachedView(`teamclass:${user.uid}`, { memberships, groupsById });
  }, [user, memberships, groupsById]);

  const groupIdsKey = useMemo(
    () => Array.from(new Set((memberships ?? []).map((membership) => membership.groupId))).sort().join(","),
    [memberships]
  );

  // For each membership, watch the group document itself in real time
  // rather than trusting the membership pointer alone — so a group deleted
  // directly in the database (bypassing the app's own leave/cascade flow)
  // disappears from this list immediately instead of lingering as a dead
  // link. A membership left pointing at a group that's gone also gets
  // cleaned up client-side here, since TeamClass has no backend of its own
  // to do that housekeeping.
  useEffect(() => {
    if (!user) return;
    const groupIds = groupIdsKey ? groupIdsKey.split(",") : [];

    const unsubscribes = groupIds.map((groupId) =>
      onSnapshot(
        groupRef(groupId),
        (snapshot) => {
          if (snapshot.exists()) {
            setGroupsById((current) => ({ ...current, [groupId]: snapshot.data() as Group }));
          } else {
            setGroupsById((current) => ({ ...current, [groupId]: null }));
            deleteMembership(user.uid, groupId);
          }
        },
        (error) => {
          // Once a group this user belonged to is deleted, Firestore can no
          // longer evaluate this listener's access and reports that as
          // permission-denied rather than a clean "not found" — treat it as
          // the same "group is gone" case the exists()===false branch above
          // already handles, instead of letting it surface as an error.
          if (error.code === "permission-denied") {
            setGroupsById((current) => ({ ...current, [groupId]: null }));
            deleteMembership(user.uid, groupId);
          } else {
            console.error("[teamclass] group listener error:", error);
          }
        }
      )
    );

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [groupIdsKey, user]);

  if (!user || memberships === null) {
    return <div className="p-10 text-sm text-nova-navy/40">Cargando…</div>;
  }

  const profile = { name: user.displayName ?? "Sin nombre", photoURL: user.photoURL };

  async function handleCreate(projectName: string) {
    await createGroup(user!.uid, profile, projectName);
    setModal(null);
  }

  async function handleJoin(code: string) {
    await joinGroup(user!.uid, profile, code);
    setModal(null);
  }

  const visibleMemberships = memberships.filter((membership) => groupsById[membership.groupId] !== null);
  const isFeatured = visibleMemberships.length === 1;

  return (
    <main className="relative p-10">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="flex items-center gap-3 text-[29px] font-semibold tracking-tight text-nova-navy">
          <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-nova-electric to-nova-sky" />
          TeamClass
        </h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2.5">
          <motion.button
            type="button"
            onClick={() => setModal("join")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-nova-navy/10 px-4 py-2 text-[13px] font-medium text-nova-navy/70 transition-colors hover:bg-nova-navy/[0.03] sm:w-auto sm:justify-start"
          >
            <KeyRound className="h-3.5 w-3.5" strokeWidth={1.75} />
            Unirme a grupo
          </motion.button>
          <motion.button
            type="button"
            onClick={() => setModal("create")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-nova-electric to-nova-intermediate px-5 py-2.5 text-[13px] font-semibold text-nova-white shadow-[0_6px_18px_-6px_rgba(10,109,253,0.5)] transition-shadow hover:shadow-[0_10px_24px_-6px_rgba(10,109,253,0.6)] sm:w-auto sm:justify-start"
          >
            <FolderPlus className="h-3.5 w-3.5" strokeWidth={2} />
            Crear grupo
          </motion.button>
        </div>
      </div>

      {visibleMemberships.length === 0 ? (
        <NoGroupsEmptyState onCreateClick={() => setModal("create")} onJoinClick={() => setModal("join")} />
      ) : (
        <motion.div
          layout
          className={
            isFeatured
              ? "grid grid-cols-1"
              : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          }
        >
          <AnimatePresence>
            {visibleMemberships.map((membership) => {
              const count = groupsById[membership.groupId]?.memberIds.length;
              const accent = getGroupAccent(membership.groupId);
              return (
                <motion.div
                  key={membership.groupId}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className={isFeatured ? "max-w-md" : undefined}
                >
                  <Link
                    href={`/teamclass/${membership.groupId}`}
                    className={`group relative flex flex-col gap-5 overflow-hidden rounded-3xl border transition-colors ${
                      isFeatured ? "p-8" : "p-6"
                    }`}
                    style={{
                      borderColor: hexToRgba(accent, 0.22),
                      backgroundColor: hexToRgba(accent, 0.045),
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 h-1.5"
                      style={{ background: accent }}
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-60 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        background: `radial-gradient(circle, ${hexToRgba(accent, 0.24)} 0%, ${hexToRgba(accent, 0)} 70%)`,
                      }}
                    />

                    <div className="flex items-start justify-between">
                      <div
                        className={`relative flex shrink-0 items-center justify-center rounded-2xl ${
                          isFeatured ? "h-20 w-20" : "h-16 w-16"
                        }`}
                        style={{
                          background: `linear-gradient(135deg, ${hexToRgba(accent, 0.3)} 0%, ${hexToRgba(accent, 0.14)} 100%)`,
                          boxShadow: `0 10px 22px -12px ${hexToRgba(accent, 0.55)}`,
                        }}
                      >
                        <Users
                          className={isFeatured ? "h-8 w-8" : "h-7 w-7"}
                          strokeWidth={1.75}
                          style={{ color: accent }}
                        />
                      </div>
                      <span className="rounded-full bg-nova-navy/5 px-2.5 py-1 font-mono text-[13px] font-medium tracking-wider text-nova-navy/50">
                        {membership.groupId}
                      </span>
                    </div>

                    <div>
                      <p
                        className={`font-semibold text-nova-navy ${isFeatured ? "text-xl" : "text-lg"}`}
                      >
                        {membership.projectName || "Proyecto sin nombre"}
                      </p>
                      <div className="mt-2 flex items-center gap-1.5 text-[13px] text-nova-navy/40">
                        <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
                        {count === undefined ? (
                          <span className="opacity-0">—</span>
                        ) : (
                          <span>
                            {count} {count === 1 ? "integrante" : "integrantes"}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {modal === "create" && (
          <CreateGroupModal onCreate={handleCreate} onClose={() => setModal(null)} />
        )}
        {modal === "join" && (
          <JoinGroupModal onJoin={handleJoin} onClose={() => setModal(null)} />
        )}
      </AnimatePresence>
    </main>
  );
}
