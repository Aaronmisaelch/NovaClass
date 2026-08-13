"use client";

import { motion } from "framer-motion";

/**
 * Shared ambient background for the pre-app flow (Login and the unified
 * account Onboarding). One static image, always mounted for the full
 * duration of whichever page renders it, with a slow, desynchronized
 * translate/scale/skew drift so it never looks perfectly still.
 *
 * Deliberately NOT used by ScheduleOnboarding (Schedule's own setup flow,
 * used both the first time a user opens the module and to reconfigure after
 * "Eliminar horario") — that one renders inside the normal app layout
 * (sidebar visible), and this component is `position: fixed` full-viewport,
 * which would cover it.
 *
 * Every positioning/sizing/z-index value here is set via inline `style`
 * (not Tailwind classes) so nothing depends on build-time class generation —
 * this is the actual background layer and it must never fail to render.
 */
export function OnboardingFlowBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: "url(/onboarding-bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        animate={{
          x: ["0%", "1%", "-0.6%", "0.8%", "-0.3%", "0%"],
          y: ["0%", "-0.7%", "0.9%", "-0.4%", "0.5%", "0%"],
          scale: [1.06, 1.08, 1.095, 1.075, 1.09, 1.06],
          skewX: [0, 0.4, -0.3, 0.2, -0.35, 0],
          skewY: [0, -0.25, 0.35, -0.15, 0.3, 0],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
