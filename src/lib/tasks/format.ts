function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseDueDate(dueDate: string): Date {
  const [year, month, day] = dueDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getDaysRemaining(dueDate: string | null): number | null {
  if (!dueDate) return null;
  const today = startOfDay(new Date());
  const due = parseDueDate(dueDate);
  const diffMs = due.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function formatDueDate(dueDate: string | null): string | null {
  const daysRemaining = getDaysRemaining(dueDate);
  if (daysRemaining === null) return null;
  if (daysRemaining < 0) return "Vencida";
  if (daysRemaining === 0) return "Hoy";
  if (daysRemaining === 1) return "Mañana";
  return `${daysRemaining} días`;
}

// Urgency ramp: overdue is the single most severe state (bold/darker red),
// "hoy"/"mañana" both read as red per spec but hoy is emphasized a touch
// more; 2-5 días is amber; beyond that reuses the app's existing emerald
// ("finalizado" status color) to signal "no rush" without introducing blue,
// which is already the brand/course-electric color elsewhere.
export function getUrgencyClass(daysRemaining: number | null): string {
  if (daysRemaining === null) {
    return "border-dashed border-nova-navy/15 text-nova-navy/30 font-medium";
  }
  if (daysRemaining < 0) {
    return "border-red-300 bg-red-100 text-red-700 font-semibold";
  }
  if (daysRemaining === 0) {
    return "border-red-200 bg-red-50 text-red-600 font-semibold";
  }
  if (daysRemaining === 1) {
    return "border-red-200 bg-red-50 text-red-600 font-medium";
  }
  if (daysRemaining <= 5) {
    return "border-amber-200 bg-amber-50 text-amber-700 font-medium";
  }
  return "border-emerald-200 bg-emerald-50 text-emerald-700 font-medium";
}
