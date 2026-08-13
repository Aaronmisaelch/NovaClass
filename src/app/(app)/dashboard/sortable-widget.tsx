"use client";

import { useState, type ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";

export function SortableWidget({
  id,
  onRemove,
  rowSpan = 1,
  children,
}: {
  id: string;
  onRemove: () => void;
  rowSpan?: number;
  children: (dragHandleProps: Record<string, unknown>) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={setNodeRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        // rectSortingStrategy derives scaleX/scaleY (part of
        // CSS.Transform) by comparing each widget's own rect to whatever
        // rect lands at its array index in a simulated reorder — that's
        // meaningless once the grid holds a non-uniform item (the 1x2
        // course-collection widget vs the 1x1 squares), since a 1x1 widget
        // displaced into "the 1x2's slot" would get scaled ~2x tall for
        // the duration of the drag. Translate-only ignores that scale
        // component entirely, so every widget just slides without ever
        // resizing, regardless of what shape it's swapping with.
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        gridRow: rowSpan > 1 ? `span ${rowSpan}` : undefined,
        // A multi-row item used to rely on other 1x1 squares sharing its
        // rows to establish the row track height via *their* aspect-ratio,
        // then just stretch to fill it — but with no aspect-ratio of its
        // own, that only works when such siblings actually land in the
        // same rows. Depending on drag/removal order and viewport width,
        // they sometimes don't, and the row collapses to whatever height
        // the widget's own (scrollable) content wants instead of two
        // squares. Giving every item an aspect-ratio of `1 / rowSpan`
        // makes its height self-determined from its own (grid-column-set)
        // width, independent of any other widget in the grid.
        aspectRatio: `1 / ${rowSpan}`,
        zIndex: isDragging ? 10 : undefined,
      }}
      className="relative"
    >
      {hovered && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Eliminar widget"
          className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-nova-navy/5 bg-nova-white text-nova-navy/40 shadow-[0_4px_12px_-4px_rgba(4,14,60,0.3)] transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {children({
        ...attributes,
        ...listeners,
        style: { cursor: "grab" },
      })}

      {hovered && (
        <div className="pointer-events-none absolute left-3 top-3 z-10 text-nova-navy/20">
          <GripVertical className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
