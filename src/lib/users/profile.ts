import "server-only";
import { revalidateTag, unstable_cache } from "next/cache";
import { getAdminDb } from "@/lib/firebase/admin";
import type { UserProfile } from "@/lib/users/types";

function usersCollection() {
  return getAdminDb().collection("users");
}

function profileCacheTag(uid: string): string {
  return `user-profile-${uid}`;
}

async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await usersCollection().doc(uid).get();
  return snapshot.exists ? (snapshot.data() as UserProfile) : null;
}

// The (app) shell layout reads this on every client-side navigation (it's a
// Server Component using cookies(), so Next can't reuse it across routes —
// see getSessionUser). That verification must stay uncached and run in
// full every time, but the profile document behind it rarely changes, so a
// short-lived cache here removes a Firestore round trip from the common
// case (repeat navigations) without ever skipping the session check itself.
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const getCached = unstable_cache(fetchUserProfile, ["user-profile", uid], {
    revalidate: 20,
    tags: [profileCacheTag(uid)],
  });
  return getCached(uid);
}

// Called from every server route that mutates the profile document, so an
// edit is reflected immediately instead of waiting out the cache window
// above. These are Route Handlers, not Server Actions, so `updateTag` (which
// would otherwise be the read-your-own-writes API) isn't available here —
// `{ expire: 0 }` is the documented equivalent for that context: it forces
// an immediate expiry instead of `revalidateTag`'s default stale-while-
// revalidate behavior.
export function invalidateUserProfileCache(uid: string): void {
  revalidateTag(profileCacheTag(uid), { expire: 0 });
}

export async function ensureUserProfile(
  uid: string,
  data: { email: string | null; photoURL: string | null; name: string }
): Promise<UserProfile> {
  const ref = usersCollection().doc(uid);
  const snapshot = await ref.get();

  if (snapshot.exists) {
    return snapshot.data() as UserProfile;
  }

  const now = Date.now();
  const profile: UserProfile = {
    uid,
    email: data.email,
    photoURL: data.photoURL,
    name: data.name,
    age: null,
    birthDate: null,
    educationLevel: null,
    grade: null,
    onboardingCompleted: false,
    createdAt: now,
    updatedAt: now,
  };

  await ref.set(profile);
  return profile;
}

export async function updateOnboardingDetails(
  uid: string,
  data: {
    name: string;
    age: number;
    birthDate: string | null;
    educationLevel: UserProfile["educationLevel"];
    grade: number;
  }
): Promise<void> {
  await usersCollection().doc(uid).update({
    name: data.name,
    age: data.age,
    birthDate: data.birthDate,
    educationLevel: data.educationLevel,
    grade: data.grade,
    updatedAt: Date.now(),
  });
}

// Partial updates from the Perfil page, where each info card (Edad,
// Cumpleaños, Grado y nivel) saves independently — unlike
// updateOnboardingDetails, which writes the full onboarding batch at once.
export async function updateProfileDetails(
  uid: string,
  patch: Partial<Pick<UserProfile, "age" | "birthDate" | "educationLevel" | "grade">>
): Promise<void> {
  await usersCollection().doc(uid).update({
    ...patch,
    updatedAt: Date.now(),
  });
}

export async function completeOnboarding(uid: string): Promise<void> {
  await usersCollection().doc(uid).update({
    onboardingCompleted: true,
    updatedAt: Date.now(),
  });
}
