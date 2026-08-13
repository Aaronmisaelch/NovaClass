import type { Metadata } from "next";
import { DashboardView } from "@/app/(app)/dashboard/dashboard-view";

export const metadata: Metadata = { title: "Dashboard — NovaClass" };

export default function DashboardPage() {
  return <DashboardView />;
}
