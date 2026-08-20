"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { CircleUserRound } from "lucide-react";
import { NAV_ITEMS } from "@/app/(app)/sidebar";

const MOBILE_NAV_ITEMS = [
  ...NAV_ITEMS,
  { href: "/perfil", label: "Perfil", icon: CircleUserRound },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 flex justify-center px-4 sm:hidden">
      <div className="flex items-center gap-0.5 rounded-full border border-nova-navy/[0.04] bg-nova-white/70 px-1 py-1 backdrop-blur-lg shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_1px_2px_-1px_rgba(4,14,60,0.06),0_18px_40px_-22px_rgba(4,14,60,0.18)]">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={`relative flex items-center justify-center rounded-full px-3.5 py-2.5 transition-colors ${
                isActive
                  ? "text-nova-electric"
                  : "text-nova-navy/50 hover:text-nova-navy/70"
              }`}
            >
              <Icon className="relative z-10 h-[18px] w-[18px]" strokeWidth={2.5} />

              {isActive && (
                <motion.div
                  layoutId="mobile-nav-lamp"
                  className="absolute inset-0 w-full rounded-full bg-nova-electric/5"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="absolute -top-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-t-full bg-nova-electric">
                    <div className="absolute -left-2 -top-2 h-6 w-12 rounded-full bg-nova-electric/20 blur-md" />
                    <div className="absolute -top-1 h-6 w-8 rounded-full bg-nova-electric/20 blur-md" />
                    <div className="absolute left-2 top-0 h-4 w-4 rounded-full bg-nova-electric/20 blur-sm" />
                  </div>
                </motion.div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
