"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CalendarRange,
  CircleUserRound,
  LayoutDashboard,
  ListTodo,
  Users,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/tareas", label: "Mis Tareas", icon: ListTodo },
  { href: "/teamclass", label: "TeamClass", icon: Users },
  { href: "/calendario", label: "Calendario", icon: CalendarRange },
];

const EASE = [0.22, 1, 0.36, 1] as const;

function NavRowContent({
  isActive,
  children,
}: {
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={isActive ? undefined : { x: 2 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors duration-300 ${
        isActive
          ? "text-nova-electric"
          : "text-nova-navy/55 hover:bg-nova-navy/[0.04] hover:text-nova-navy"
      }`}
    >
      {children}
    </motion.div>
  );
}

export function Sidebar({
  userName,
  userPhotoURL,
}: {
  userName: string;
  userPhotoURL: string | null;
}) {
  const pathname = usePathname();
  const asideRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [indicator, setIndicator] = useState<{ top: number; height: number } | null>(null);

  const activeHref =
    NAV_ITEMS.find((item) => pathname.startsWith(item.href))?.href ??
    (pathname.startsWith("/perfil") ? "/perfil" : null);

  useLayoutEffect(() => {
    if (!activeHref || !asideRef.current) return;
    const el = itemRefs.current.get(activeHref);
    if (!el) return;
    const asideRect = asideRef.current.getBoundingClientRect();
    const itemRect = el.getBoundingClientRect();
    setIndicator({ top: itemRect.top - asideRect.top, height: itemRect.height });
  }, [activeHref]);

  return (
    <aside
      ref={asideRef}
      className="sticky top-0 flex h-screen w-[14.5rem] shrink-0 flex-col overflow-hidden border-r border-nova-navy/5 bg-nova-white px-4 py-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(87,185,253,0.14) 0%, rgba(87,185,253,0) 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(4,14,60,0.05) 0%, rgba(4,14,60,0) 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-full w-px"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,109,253,0.18) 0%, rgba(87,185,253,0.08) 45%, rgba(4,14,60,0.05) 100%)",
        }}
      />

      <div className="relative flex items-center gap-2 px-2 pb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mark.png" alt="" className="h-8 w-8 select-none" draggable={false} />
        <span className="text-[17px] font-semibold tracking-tight text-nova-navy">
          NovaClass
        </span>
      </div>

      {indicator && (
        <>
          <motion.div
            aria-hidden="true"
            initial={false}
            animate={{ top: indicator.top, height: indicator.height }}
            transition={{ duration: 0.4, ease: EASE }}
            className="pointer-events-none absolute left-4 right-4 z-0 rounded-xl bg-nova-electric/10"
          />
          <motion.div
            aria-hidden="true"
            initial={false}
            animate={{ top: indicator.top + indicator.height / 2 - 12 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="pointer-events-none absolute -left-1 z-10 h-6 w-1 rounded-full bg-gradient-to-b from-nova-sky to-nova-electric"
          />
        </>
      )}

      <nav className="relative z-10 flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              ref={(el) => {
                if (el) itemRefs.current.set(item.href, el);
              }}
            >
              <NavRowContent isActive={isActive}>
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                {item.label}
              </NavRowContent>
            </Link>
          );
        })}
      </nav>

      <Link
        href="/perfil"
        className="relative z-10"
        ref={(el) => {
          if (el) itemRefs.current.set("/perfil", el);
        }}
      >
        <NavRowContent isActive={pathname.startsWith("/perfil")}>
          {userPhotoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={userPhotoURL}
              alt=""
              className="h-[18px] w-[18px] rounded-full"
            />
          ) : (
            <CircleUserRound className="h-[18px] w-[18px]" strokeWidth={1.75} />
          )}
          <span className="truncate">{userName || "Perfil"}</span>
        </NavRowContent>
      </Link>
    </aside>
  );
}
