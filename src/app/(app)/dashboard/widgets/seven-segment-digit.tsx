"use client";

// Segment order: a(top) b(top-right) c(bottom-right) d(bottom) e(bottom-left) f(top-left) g(middle)
const DIGIT_SEGMENTS: Record<string, boolean[]> = {
  "0": [true, true, true, true, true, true, false],
  "1": [false, true, true, false, false, false, false],
  "2": [true, true, false, true, true, false, true],
  "3": [true, true, true, true, false, false, true],
  "4": [false, true, true, false, false, true, true],
  "5": [true, false, true, true, false, true, true],
  "6": [true, false, true, true, true, true, true],
  "7": [true, true, true, false, false, false, false],
  "8": [true, true, true, true, true, true, true],
  "9": [true, true, true, true, false, true, true],
};

// group-hover here relies on the clock widget's WidgetCard having the
// "group" class — this component is only ever used inside ClockWidget, so
// it's safe to bake the hover-intensify glow in directly rather than
// threading a hover prop through.
const ON =
  "bg-nova-white shadow-[0_0_10px_rgba(255,255,255,0.65)] transition-shadow duration-300 group-hover:shadow-[0_0_18px_rgba(255,255,255,0.95)]";
// Faint but clearly present, so the full "8" shape reads behind every digit
// — a real LED display's unlit segments are dim, not invisible.
const OFF = "bg-nova-white/[0.14]";

export function SevenSegmentDigit({ char, className = "" }: { char: string; className?: string }) {
  const [a, b, c, d, e, f, g] = DIGIT_SEGMENTS[char] ?? [false, false, false, false, false, false, false];

  return (
    // shrink-0 is load-bearing: this box's segments are absolutely
    // positioned with fixed px offsets, not percentages, so if a flex
    // parent ever shrinks this box (e.g. the 12h format's row is wider
    // than the 24h one because of the added AM/PM label, and flex-shrink
    // defaults to 1) the segments misalign relative to the now-narrower
    // box instead of scaling with it — this pins the digit to its true
    // size regardless of what else is in its row.
    <div className={`relative h-[86px] w-[48px] shrink-0 ${className}`}>
      <span className={`absolute left-[6px] right-[6px] top-0 h-[8px] rounded-none ${a ? ON : OFF}`} />
      <span className={`absolute left-0 top-[3px] h-[36px] w-[8px] rounded-none ${f ? ON : OFF}`} />
      <span className={`absolute right-0 top-[3px] h-[36px] w-[8px] rounded-none ${b ? ON : OFF}`} />
      <span className={`absolute left-[6px] right-[6px] top-[39px] h-[8px] rounded-none ${g ? ON : OFF}`} />
      <span className={`absolute bottom-[3px] left-0 h-[36px] w-[8px] rounded-none ${e ? ON : OFF}`} />
      <span className={`absolute bottom-[3px] right-0 h-[36px] w-[8px] rounded-none ${c ? ON : OFF}`} />
      <span className={`absolute bottom-0 left-[6px] right-[6px] h-[8px] rounded-none ${d ? ON : OFF}`} />
    </div>
  );
}
