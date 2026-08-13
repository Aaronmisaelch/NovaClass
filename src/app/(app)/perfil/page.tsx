import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getUserProfile } from "@/lib/users/profile";
import { SignOutButton } from "@/app/(app)/perfil/sign-out-button";
import { DeleteAccountButton } from "@/app/(app)/perfil/delete-account-button";
import { ProfileInfoCards } from "@/app/(app)/perfil/profile-info-cards";

export const metadata: Metadata = { title: "Perfil — NovaClass" };

export default async function PerfilPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/api/auth/clear-session");

  const profile = await getUserProfile(sessionUser.uid);
  if (!profile) redirect("/onboarding");

  return (
    <main className="relative p-10">
      <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-nova-navy">
        <span className="h-2 w-2 rounded-full bg-gradient-to-br from-nova-electric to-nova-sky" />
        Perfil
      </h1>

      <div className="mt-6 flex items-center gap-4">
        {profile.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.photoURL}
            alt=""
            className="h-14 w-14 rounded-full"
          />
        ) : (
          <div className="h-14 w-14 rounded-full bg-nova-electric/10" />
        )}
        <div>
          <p className="text-base font-medium text-nova-navy">
            {profile.name}
          </p>
          <p className="text-sm text-nova-navy/50">{profile.email}</p>
        </div>
      </div>

      <ProfileInfoCards
        age={profile.age}
        birthDate={profile.birthDate}
        educationLevel={profile.educationLevel}
        grade={profile.grade}
      />

      <div className="mt-8 flex items-center gap-3">
        <SignOutButton />
        <DeleteAccountButton />
      </div>
    </main>
  );
}
