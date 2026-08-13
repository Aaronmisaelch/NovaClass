import type { Metadata } from "next";
import { TareasView } from "@/app/(app)/tareas/tareas-view";

export const metadata: Metadata = { title: "Mis Tareas — NovaClass" };

export default function TareasPage() {
  return <TareasView />;
}
