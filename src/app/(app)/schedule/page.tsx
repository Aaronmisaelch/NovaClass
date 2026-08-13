import type { Metadata } from "next";
import { ScheduleView } from "@/app/(app)/schedule/schedule-view";

export const metadata: Metadata = { title: "Schedule — NovaClass" };

export default function SchedulePage() {
  return <ScheduleView />;
}
