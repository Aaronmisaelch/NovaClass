import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { LoginView } from "@/app/login/login-view";

export const metadata: Metadata = {
  title: "Iniciar sesión — NovaClass",
};

export default async function LoginPage() {
  const sessionUser = await getSessionUser();
  if (sessionUser) {
    redirect("/dashboard");
  }

  return <LoginView />;
}
