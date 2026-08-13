const CELLS_IN_GRID = 42;

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addMonths(
  year: number,
  month: number,
  delta: number
): { year: number; month: number } {
  const total = year * 12 + month + delta;
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
}

export function addYears(
  year: number,
  month: number,
  delta: number
): { year: number; month: number } {
  return { year: year + delta, month };
}

/**
 * Returns a fixed 42-cell (6 weeks) Monday-first grid of dates for the given
 * month, including leading/trailing days from adjacent months so every week
 * row is complete.
 */
export function getMonthGridDates(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // 0 = Monday

  const gridStart = new Date(year, month, 1 - firstWeekday);

  const dates: Date[] = [];
  for (let i = 0; i < CELLS_IN_GRID; i += 1) {
    dates.push(new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
  }
  return dates;
}
