import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getUserProfile } from "@/lib/users/profile";
import { OnboardingView } from "@/app/onboarding/onboarding-view";

export const metadata: Metadata = {
  title: "Bienvenido — NovaClass",
};

export default async function OnboardingPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/api/auth/clear-session");
  }

  const profile = await getUserProfile(sessionUser.uid);
  if (profile?.onboardingCompleted) {
    redirect("/dashboard");
  }

  return (
    <OnboardingView
      initialName={profile?.name ?? ""}
      initialAge={profile?.age ?? null}
    />
  );
}
