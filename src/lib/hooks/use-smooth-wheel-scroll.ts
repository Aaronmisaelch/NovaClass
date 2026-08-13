import { useCallback, useEffect, useRef, useState } from "react";
import { animate, useMotionValue } from "framer-motion";

// Native overflow-y-auto scrolling jumps scrollTop by the raw wheel delta on
// every tick — CSS scroll-behavior: smooth doesn't change that (it only
// applies to programmatic scrolls like scrollIntoView, not wheel input).
// This intercepts wheel events on the element and chases an accumulated
// target with a spring instead, using the same animation primitive
// (framer-motion) already driving every other motion in the app. Re-running
// animate() on a MotionValue that's still mid-flight retargets it smoothly
// from its current velocity, which is what makes consecutive wheel ticks
// chain into one continuous glide rather than restarting each time.
//
// Returns a ref callback (not a RefObject) so the effect below reliably
// reruns once the element actually mounts — e.g. when this is attached to
// content that first renders empty (loading state) and only appears later,
// a plain useRef's `.current` change wouldn't itself trigger a re-render.
export function useSmoothWheelScroll<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null);
  const ref = useCallback((element: T | null) => setNode(element), []);
  const scrollY = useMotionValue(0);
  const target = useRef(0);

  useEffect(() => {
    if (!node) return;
    const element = node;

    target.current = element.scrollTop;
    scrollY.set(element.scrollTop);
    const unsubscribe = scrollY.on("change", (value) => {
      element.scrollTop = value;
    });

    function handleWheel(event: WheelEvent) {
      const max = element.scrollHeight - element.clientHeight;
      if (max <= 0) return;

      event.preventDefault();
      target.current = Math.min(Math.max(target.current + event.deltaY, 0), max);
      animate(scrollY, target.current, { type: "spring", stiffness: 300, damping: 40, mass: 0.5 });
    }

    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      element.removeEventListener("wheel", handleWheel);
      unsubscribe();
    };
  }, [node, scrollY]);

  return ref;
}
