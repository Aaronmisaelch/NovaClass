import type { Metadata } from "next";
import { GroupDetailView } from "@/app/(app)/teamclass/[code]/group-detail-view";

export const metadata: Metadata = { title: "TeamClass — NovaClass" };

export default async function GroupPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <GroupDetailView code={code} />;
}
