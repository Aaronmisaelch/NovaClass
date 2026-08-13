import "server-only";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase/admin";
import type { DecodedIdToken } from "firebase-admin/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

export { SESSION_COOKIE_NAME };

export async function getSessionUser(): Promise<DecodedIdToken | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) return null;

  try {
    return await getAdminAuth().verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
}
