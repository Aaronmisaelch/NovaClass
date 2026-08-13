export interface CourseColor {
  id: string;
  label: string;
  hex: string;
}

// Electric/sky/navy are the official NovaClass brand blues (kept identical
// to the --color-nova-* tokens in globals.css) — never re-tune those three.
// The other twelve are one shade more saturated/deeper than before (mostly
// Tailwind's 500-600 step instead of 400-500) for more energy while staying
// in the same families.
export const COURSE_COLORS: CourseColor[] = [
  { id: "electric", label: "Azul eléctrico", hex: "#0A6DFD" },
  { id: "sky", label: "Celeste", hex: "#57B9FD" },
  { id: "navy", label: "Azul marino", hex: "#040E3C" },
  { id: "indigo", label: "Índigo", hex: "#4F46E5" },
  { id: "violet", label: "Violeta", hex: "#7C3AED" },
  { id: "fuchsia", label: "Fucsia", hex: "#C026D3" },
  { id: "rose", label: "Rosa", hex: "#EC4899" },
  { id: "coral", label: "Coral", hex: "#F43F5E" },
  { id: "orange", label: "Naranja", hex: "#F97316" },
  { id: "amber", label: "Ámbar", hex: "#F59E0B" },
  { id: "lime", label: "Lima", hex: "#84CC16" },
  { id: "emerald", label: "Esmeralda", hex: "#10B981" },
  { id: "teal", label: "Verde azulado", hex: "#14B8A6" },
  { id: "cyan", label: "Cian", hex: "#06B6D4" },
  { id: "slate", label: "Pizarra", hex: "#475569" },
];

export const DEFAULT_COURSE_COLOR = COURSE_COLORS[0].id;

export function getCourseColor(colorId: string): CourseColor {
  return COURSE_COLORS.find((color) => color.id === colorId) ?? COURSE_COLORS[0];
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const value = parseInt(normalized, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

export function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Perceived brightness (YIQ-style weighting) — cheap and good enough to tell
// "light" hues (amber, lime, sky, cyan…) from "dark" ones (indigo, violet,
// navy…) without a full sRGB/WCAG contrast computation.
function perceivedBrightness(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

// The badge/casilla pattern everywhere in the app pairs a ~14% tint of the
// course color as background with the full-strength hex as text. That reads
// fine for darker hues, but bright ones (amber, lime, sky, cyan…) don't hold
// enough contrast against such a light background — so those get darkened
// just for the text, while the background/border keep the true color.
function getReadableCourseText(hex: string): string {
  const brightness = perceivedBrightness(hex);
  const [r, g, b] = hexToRgb(hex);
  const darkenBy = brightness > 165 ? 0.28 : brightness > 140 ? 0.16 : 0;
  if (darkenBy === 0) return hex;
  const mix = (channel: number) => Math.round(channel * (1 - darkenBy));
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export function getCourseStyle(colorId: string) {
  const color = getCourseColor(colorId);
  return {
    backgroundColor: hexToRgba(color.hex, 0.14),
    borderColor: hexToRgba(color.hex, 0.32),
    color: getReadableCourseText(color.hex),
  };
}
