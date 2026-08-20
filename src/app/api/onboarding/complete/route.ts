import { getSessionUser } from "@/lib/auth/session";
import { completeOnboarding, invalidateUserProfileCache } from "@/lib/users/profile";

export async function POST() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return Response.json({ error: "No autenticado." }, { status: 401 });
  }

  await completeOnboarding(sessionUser.uid);
  invalidateUserProfileCache(sessionUser.uid);
  return Response.json({ ok: true });
}
