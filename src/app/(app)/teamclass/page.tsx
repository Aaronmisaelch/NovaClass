import type { Metadata } from "next";
import { TeamClassView } from "@/app/(app)/teamclass/teamclass-view";

export const metadata: Metadata = { title: "TeamClass — NovaClass" };

export default function TeamClassPage() {
  return <TeamClassView />;
}
