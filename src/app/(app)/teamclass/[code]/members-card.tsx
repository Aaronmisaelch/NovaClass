"use client";

import { LogOut, Users } from "lucide-react";
import { WidgetCard } from "@/app/(app)/dashboard/widget-card";
import { MemberList } from "@/app/(app)/teamclass/[code]/member-list";
import { MAX_GROUP_MEMBERS, type GroupMember } from "@/lib/teamclass/types";

export function MembersCard({
  members,
  leaderId,
  currentUid,
  onExpel,
  onRequestLeave,
  className = "",
}: {
  members: GroupMember[];
  leaderId: string;
  currentUid: string;
  onExpel: (uid: string) => void;
  onRequestLeave: () => void;
  className?: string;
}) {
  return (
    <WidgetCard
      noPadding
      className={`gap-0 ${className}`}
      style={{ background: "linear-gradient(165deg, #FFFFFF 0%, #F1F7FE 55%, #E8F1FE 100%)" }}
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-nova-electric/15 to-nova-sky/10 text-nova-electric">
            <Users className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <p className="text-sm font-semibold text-nova-navy">Integrantes</p>
        </div>
        <span className="rounded-full bg-nova-navy/5 px-2.5 py-1 text-[11px] font-semibold text-nova-navy/60">
          {members.length}/{MAX_GROUP_MEMBERS}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        <MemberList members={members} leaderId={leaderId} currentUid={currentUid} onExpel={onExpel} />
      </div>

      <button
        type="button"
        onClick={onRequestLeave}
        className="flex items-center justify-center gap-2 border-t border-nova-navy/5 px-5 py-3.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50/60"
      >
        <LogOut className="h-3.5 w-3.5" />
        Salir del grupo
      </button>
    </WidgetCard>
  );
}
