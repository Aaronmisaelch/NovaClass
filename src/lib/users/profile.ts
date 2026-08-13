import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import type { UserProfile } from "@/lib/users/types";

function usersCollection() {
  return getAdminDb().collection("users");
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await usersCollection().doc(uid).get();
  return snapshot.exists ? (snapshot.data() as UserProfile) : null;
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
