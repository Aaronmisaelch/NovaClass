import { useEffect, type RefObject } from "react";

export function useClickOutside(
  ref: RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[],
  onOutside: () => void,
  active: boolean
) {
  useEffect(() => {
    if (!active) return;

    const refs = Array.isArray(ref) ? ref : [ref];

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      const isInside = refs.some((r) => r.current && r.current.contains(target));
      if (!isInside) onOutside();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [ref, onOutside, active]);
}
