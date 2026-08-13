"use client";

import { motion } from "framer-motion";

export function AppBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-nova-white"
    >
      <motion.div
        className="absolute -right-32 -top-40 h-[34rem] w-[34rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(87,185,253,0.14) 0%, rgba(87,185,253,0) 70%)",
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-48 -left-32 h-[38rem] w-[38rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(10,109,253,0.08) 0%, rgba(10,109,253,0) 70%)",
        }}
        animate={{ scale: [1, 1.07, 1] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute left-1/3 top-1/4 h-72 w-72 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(47,148,253,0.06) 0%, rgba(47,148,253,0) 70%)",
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <svg
        className="absolute right-16 top-1/3 h-28 w-28 text-nova-electric/[0.05]"
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle cx="50" cy="50" r="49" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" />
      </svg>

      <svg
        className="absolute bottom-24 left-1/4 h-40 w-[32rem] text-nova-intermediate/[0.05]"
        viewBox="0 0 400 120"
        fill="none"
      >
        <path
          d="M0 80 C 80 10, 160 130, 240 60 S 380 20, 400 50"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>

      <span className="absolute left-[15%] top-[12%] h-1.5 w-1.5 rounded-full bg-nova-electric/10" />
      <span className="absolute right-[22%] top-[55%] h-2 w-2 rounded-full bg-nova-sky/15" />
      <span className="absolute left-[8%] bottom-[20%] h-1 w-1 rounded-full bg-nova-navy/10" />
      <span className="absolute right-[12%] bottom-[10%] h-1.5 w-1.5 rounded-full bg-nova-intermediate/12" />

      <div
        aria-hidden="true"
        className="absolute bottom-[-10vw] right-[-10vw] h-[44vw] w-[44vw] opacity-[0.03]"
        style={{
          backgroundImage: "url(/logo-mark.png)",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
        }}
      />
    </div>
  );
}
