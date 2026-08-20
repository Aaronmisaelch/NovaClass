"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { hexToRgba } from "@/lib/schedule/colors";

// The shared NovaClass easing curve, used everywhere else in the app for
// hover/lift motion — kept identical here so this stack's animation reads
// as consistent with the rest of the product. Fast on purpose: this is a
// hover micro-interaction, not a scene transition.
const EASE = [0.22, 1, 0.36, 1] as const;
const LIFT_TRANSITION = { duration: 0.25, ease: EASE, type: "tween" as const };

// Card height minus PEEK is how much of each subsequent card gets pulled up
// behind the one before it (negative margin-top, real layout — not a
// transform — so the stack's true height still drives scrollHeight and a
// plain overflow-y-auto on the parent just works for any count).
const CARD_HEIGHT = 88;
const PEEK = 26;
const LIFT = 16;

// Whichever card is hovered rises above every other card in the stack, full
// stop — that's the point of the interaction (read one card in full without
// another one covering it), so its hover z-index always wins outright.
const HOVER_Z = 9999;

// Lifting a card on hover moves its own hit-testing box (the lift is a real
// transform), so a cursor sitting right on the boundary between a card and
// the empty widget background can end up alternating in/out of that moved
// box every frame — hover fires, the card lifts, the box moves away from
// the cursor, hover ends, the card drops back under the cursor, hover fires
// again. This delay only applies to the *leave* edge: entering is instant,
// but leaving waits briefly in case it's just that oscillation, which keeps
// the card visually settled instead of flickering.
const HOVER_LEAVE_DELAY = 120;

export interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  accent?: string;
}

interface PositionedDisplayCardProps extends DisplayCardProps {
  marginTop: number;
  zIndex: number;
  cardHeight: number;
  compact: boolean;
}

function DisplayCard({
  className,
  icon = <Sparkles className="size-4" />,
  title = "Featured",
  description,
  date,
  accent = "#0A6DFD",
  marginTop,
  zIndex,
  cardHeight,
  compact,
}: PositionedDisplayCardProps) {
  const [hovered, setHovered] = useState(false);
  const leaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
    };
  }, []);

  function handleHoverStart() {
    if (leaveTimeout.current) {
      clearTimeout(leaveTimeout.current);
      leaveTimeout.current = null;
    }
    setHovered(true);
  }

  function handleHoverEnd() {
    leaveTimeout.current = setTimeout(() => {
      setHovered(false);
      leaveTimeout.current = null;
    }, HOVER_LEAVE_DELAY);
  }

  return (
    <motion.div
      initial={false}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      animate={{ y: hovered ? -LIFT : 0, zIndex: hovered ? HOVER_Z : zIndex }}
      transition={{ y: LIFT_TRANSITION, zIndex: { duration: 0 } }}
      style={{ marginTop, height: cardHeight, borderColor: hexToRgba(accent, 0.35) }}
      className={cn(
        "relative flex w-full shrink-0 select-none flex-col overflow-hidden rounded-xl bg-nova-white/95 shadow-[0_10px_26px_-16px_rgba(4,14,60,0.4)] backdrop-blur-sm after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-24 after:bg-gradient-to-l after:from-nova-white after:to-transparent after:content-[''] [&>*]:flex [&>*]:items-center [&>*]:gap-1 sm:[&>*]:gap-2",
        // Compact cards anchor their icon+title as close to the top edge as
        // possible (small pt, border-1) — that top strip is the only part
        // of the card guaranteed to still be showing once the next card in
        // the stack covers the rest, so the padding that matters for
        // legibility is above the content, not below it. Side padding is
        // additionally shrunk below the mobile breakpoint (reverting to the
        // original values at sm:) since that's the narrower context where a
        // long course name needs every spare px to avoid truncating.
        compact ? "border pb-2 pl-1.5 pr-1.5 pt-1 sm:pl-3 sm:pr-3" : "border-2 px-4 py-3",
        description || date ? "justify-between" : "justify-start",
        className
      )}
    >
      <div>
        <span
          className={cn(
            "relative inline-block shrink-0 rounded-full",
            compact ? "p-0 sm:p-0.5" : "p-1.5"
          )}
          style={{ backgroundColor: hexToRgba(accent, 0.16), color: accent }}
        >
          {icon}
        </span>
        <p
          className={cn(
            "truncate font-semibold",
            compact ? "text-[10px] sm:text-[12.5px]" : "text-[14px]"
          )}
          style={{ color: accent }}
        >
          {title}
        </p>
      </div>
      {description ? (
        <p className="whitespace-nowrap text-[12px] text-nova-navy/55">{description}</p>
      ) : null}
      {date ? <p className="text-[11px] text-nova-navy/35">{date}</p> : null}
    </motion.div>
  );
}

export interface DisplayCardsProps {
  cards: DisplayCardProps[];
  // Which end of the array sits fully visible (highest resting z-index):
  // "top" (default) puts cards[0] there and cascades the rest downward
  // behind it — unchanged from the original behavior. "bottom" flips it so
  // the *last* card is the fully-visible one, sitting at the bottom of the
  // stack, with the rest peeking above it — for stacks where every card
  // only carries a title (no description/date footer), since with "top"
  // ordering every peeking sliver would show a card's *bottom* edge, which
  // is blank once there's no footer left to put there.
  frontPosition?: "top" | "bottom";
  // Fixed per-card sizing, in px. Defaults match the original stack
  // (CARD_HEIGHT/PEEK) — override for a more compact card, e.g. one with no
  // description/date footer. These are deliberately static: the stack's
  // total height is left to grow with the card count, and the caller's own
  // overflow-y-auto handles whatever doesn't fit, rather than this
  // component measuring its container and resizing cards to fill it (that
  // approach fed back into the container's own auto-sized height and made
  // the whole widget balloon instead of scrolling).
  cardHeight?: number;
  peek?: number;
  // Shrinks the card's own padding/icon/title so more of them fit legibly
  // in a fixed-height stack (e.g. the course collection, which must show
  // every card at once within a widget of set dimensions). Off by default
  // so stacks like the task summary — which already fit fine — keep their
  // original look.
  compact?: boolean;
}

// Renders any number of cards as a straight vertical stack in array order,
// with no horizontal offset or skew — every card shares the same left/right
// edges. The caller decides what array order means (e.g. sort ascending for
// "most urgent up front", or reverse it first for the opposite). Hovering
// any card overrides the resting z-index outright via HOVER_Z so it always
// reads in full.
export function DisplayCards({
  cards,
  frontPosition = "top",
  cardHeight = CARD_HEIGHT,
  peek = PEEK,
  compact = false,
}: DisplayCardsProps) {
  return (
    <div className={cn("flex w-full flex-col items-stretch px-1", compact ? "pb-2 pt-1" : "pb-3 pt-2")}>
      {cards.map((cardProps, index) => (
        <DisplayCard
          key={index}
          {...cardProps}
          cardHeight={cardHeight}
          compact={compact}
          marginTop={index === 0 ? 0 : -(cardHeight - peek)}
          zIndex={frontPosition === "bottom" ? index + 1 : cards.length - index}
        />
      ))}
    </div>
  );
}
