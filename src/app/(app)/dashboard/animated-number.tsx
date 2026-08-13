"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

export function AnimatedNumber({
  value,
  className,
  suffix = "",
}: {
  value: number;
  className?: string;
  suffix?: string;
}) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => `${Math.round(latest)}${suffix}`);

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.9, ease: [0.22, 1, 0.36, 1] });
    return controls.stop;
  }, [value, motionValue]);

  return <motion.span className={className}>{rounded}</motion.span>;
}
