import { hexToRgba } from "@/lib/schedule/colors";

// Exclusive colors for non-course event kinds. Chosen to never collide with
// any hex in COURSE_COLORS so a task pill is never mistaken for one of these.
// Charcoal slate rather than flat black — reads as "neutral/serious" while
// staying soft and consistent with the rest of the interface.
export const COUNTDOWN_COLOR = "#334155";
export const BIRTHDAY_COLOR = "#EF6FA8";

// Neutral treatment for personal/group tasks with no linked course (or a
// deleted one) — mirrors the "Sin curso" dashed style used in tareas/course-picker.tsx.
export const NEUTRAL_COLOR = "#040E3C";

export function getEventStyle(hex: string, neutral = false) {
  if (neutral) {
    return {
      backgroundColor: "transparent",
      borderColor: hexToRgba(NEUTRAL_COLOR, 0.16),
      color: hexToRgba(NEUTRAL_COLOR, 0.45),
    };
  }
  return {
    backgroundColor: hexToRgba(hex, 0.1),
    borderColor: hexToRgba(hex, 0.18),
    color: hex,
  };
}
