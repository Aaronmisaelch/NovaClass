"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { WidgetCard } from "@/app/(app)/dashboard/widget-card";
import { DisplayCards } from "@/components/ui/display-cards";
import { getCourseColor } from "@/lib/schedule/colors";
import type { Course } from "@/lib/schedule/types";

// Unlike the task stack (which scrolls), this widget must show every course
// at once — so instead of a fixed card size, the stack's per-card height is
// solved for from the count of courses and the space actually available.
// Every card is CARD_HEIGHT tall, and each one after the first adds only
// PEEK (= OVERLAP_RATIO * CARD_HEIGHT) of new height, so total stack height
// is CARD_HEIGHT * (1 + OVERLAP_RATIO * (count - 1)) — solving that for
// CARD_HEIGHT given a target total is the whole of computeFitSizing below.
// There is deliberately no floor on the solved *card* height: the widget's
// own height is itself derived from the viewport (aspect-ratio off its grid
// column width, see SortableWidget), so a floor that ever won against the
// solve would stop being "responsive" and turn into a fixed px value again
// — exactly what clipped the stack on narrower viewports before. Only a
// ceiling makes sense, so cards don't balloon when there's only a couple.
const OVERLAP_RATIO = 0.7;
// Capped lower than the shared stack's default: with 15 cards needing to
// fit inside the widget's own fixed 1-column x 2-row footprint, every extra
// px on the ceiling is a px the MIN_PEEK budget below can't spend on
// keeping every card's icon/title clear of the one on top of it.
const MAX_CARD_HEIGHT = 72;
// PEEK is what stays uncovered by the card in front, so it has its own
// floor. DisplayCards is rendered here with `compact`, which top-aligns the
// icon+title as tightly as it can: 1px border + 4px top padding (pt-1) +
// a 16px icon circle (12px icon + 0.5 * 4px padding) is the fixed-size
// content block that must clear the next card's edge — 21px, plus a small
// buffer so it doesn't look flush against the covering card. Once
// OVERLAP_RATIO's proportional peek would dip below that, the icon/title
// start getting covered by the next card — so floor it at the content's
// actual height instead of letting it keep shrinking with cardHeight.
const MIN_PEEK = 26;
// DisplayCards wraps the stack in its own pt-1 + pb-2 (4px + 8px) when
// compact; the fit math needs to solve for the space left over *after*
// that padding, or the stack would end up a few px taller than what we
// measured and get clipped.
const STACK_VERTICAL_PADDING = 12;

function computeFitSizing(availableHeight: number, count: number) {
  const usableHeight = Math.max(availableHeight, 0);
  if (count <= 0) {
    return { cardHeight: MAX_CARD_HEIGHT, peek: MAX_CARD_HEIGHT * OVERLAP_RATIO };
  }
  if (count === 1) {
    const cardHeight = Math.min(usableHeight, MAX_CARD_HEIGHT);
    return { cardHeight, peek: 0 };
  }

  const gaps = count - 1;
  const ratioCardHeight = Math.min(usableHeight / (1 + OVERLAP_RATIO * gaps), MAX_CARD_HEIGHT);
  // MIN_PEEK is a hard floor — it's the one thing standing between the
  // icon/title and getting covered by the next card, so it always wins
  // over the ratio-based curve. It's only capped at usableHeight / count as
  // an absolute last resort: past that point there isn't room for all
  // `count` cards to each show even a bare MIN_PEEK slice with zero
  // overlap, so this keeps the solve from overflowing usableHeight (the
  // clipping bug from before) instead of guaranteeing full legibility that
  // the available space genuinely cannot provide.
  const peek = Math.min(Math.max(ratioCardHeight * OVERLAP_RATIO, MIN_PEEK), usableHeight / count);
  const cardHeight = Math.min(Math.max(usableHeight - peek * gaps, peek), MAX_CARD_HEIGHT);
  return { cardHeight, peek };
}

export function CourseCollectionWidget({
  courses,
  dragHandleProps,
}: {
  courses: Course[];
  dragHandleProps?: Record<string, unknown>;
}) {
  const stackRef = useRef<HTMLDivElement>(null);
  const [availableHeight, setAvailableHeight] = useState<number | null>(null);

  useEffect(() => {
    const node = stackRef.current;
    if (!node) return;
    // Safe to measure and react to this element's own size here: unlike an
    // earlier attempt at this, the widget's height is now fixed by its own
    // aspect-ratio (see SortableWidget), not grown to fit its content — so
    // there's no feedback loop between what we measure and what we render.
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setAvailableHeight(entry.contentRect.height);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const { cardHeight, peek } =
    availableHeight != null
      ? computeFitSizing(availableHeight - STACK_VERTICAL_PADDING, courses.length)
      : { cardHeight: MAX_CARD_HEIGHT, peek: MAX_CARD_HEIGHT * OVERLAP_RATIO };

  return (
    <WidgetCard dragHandleProps={dragHandleProps}>
      <p className="mb-3 text-[15px] font-medium text-nova-navy">Colección de cursos</p>

      {courses.length === 0 ? (
        <div className="relative flex flex-1 flex-col items-center justify-center gap-4 overflow-hidden px-4 text-center">
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute h-28 w-28 rounded-full blur-2xl"
            style={{ background: "radial-gradient(circle, rgba(87,185,253,0.14) 0%, rgba(87,185,253,0) 70%)" }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative flex w-full max-w-[13rem] flex-col gap-2">
            {[0.9, 0.7, 0.5].map((width, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-2"
                animate={{ opacity: [0.5, 0.85, 0.5] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-nova-electric/30" />
                <span
                  className="h-2 flex-1 rounded-full bg-nova-navy/[0.06]"
                  style={{ maxWidth: `${width * 100}%` }}
                />
              </motion.div>
            ))}
          </div>
          <div className="relative">
            <p className="text-[15px] font-bold text-nova-navy">Aún no hay cursos creados</p>
            <p className="mt-1 max-w-[14rem] text-[12px] leading-relaxed text-nova-navy/40">
              Tus cursos aparecerán aquí en cuanto crees el primero.
            </p>
          </div>
        </div>
      ) : (
        <div ref={stackRef} className="min-h-0 flex-1 overflow-hidden">
          <DisplayCards
            frontPosition="bottom"
            compact
            cardHeight={cardHeight}
            peek={peek}
            cards={courses.map((course) => ({
              icon: <BookOpen className="size-3" />,
              title: course.name,
              accent: getCourseColor(course.color).hex,
            }))}
          />
        </div>
      )}
    </WidgetCard>
  );
}
