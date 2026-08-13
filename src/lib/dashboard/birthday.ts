export const MONTH_OPTIONS = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

const MONTH_LENGTHS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function daysInMonth(month: number): number {
  return MONTH_LENGTHS[month - 1] ?? 31;
}

export function formatBirthDate(month: number, day: number): string {
  return `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// UserProfile.birthDate is stored as "MM-DD" (year was dropped since only
// the day/month matter for a yearly countdown). Widget configs created
// before that data lived on the profile stored a full "YYYY-MM-DD" date
// instead — this stays tolerant of the extra leading segment for any of
// those still floating around unmigrated.
export function parseBirthDate(birthDate: string): { month: number; day: number } {
  const parts = birthDate.split("-").map(Number);
  const [month, day] = parts.length === 3 ? parts.slice(1) : parts;
  return { month, day };
}

export function isValidBirthDate(value: string): boolean {
  const match = /^(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const month = Number(match[1]);
  const day = Number(match[2]);
  if (month < 1 || month > 12) return false;
  return day >= 1 && day <= daysInMonth(month);
}
