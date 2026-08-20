import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getUserProfile } from "@/lib/users/profile";
import { Sidebar } from "@/app/(app)/sidebar";
import { MobileNav } from "@/app/(app)/mobile-nav";
import { AppBackdrop } from "@/app/(app)/app-backdrop";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/api/auth/clear-session");
  }

  const profile = await getUserProfile(sessionUser.uid);
  if (!profile?.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <div className="relative flex h-screen overflow-hidden">
      <AppBackdrop />
      <Sidebar userName={profile.name} userPhotoURL={profile.photoURL} />
      <div className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-24 sm:pb-0">
        {children}
      </div>
      <MobileNav />
    </div>
  );
}
