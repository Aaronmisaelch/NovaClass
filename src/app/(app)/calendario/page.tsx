import type { Metadata } from "next";
import { CalendarView } from "@/app/(app)/calendario/calendar-view";

export const metadata: Metadata = { title: "Calendario — NovaClass" };

export default function CalendarioPage() {
  return <CalendarView />;
}
