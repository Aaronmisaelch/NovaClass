import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

// Invalid/stale session cookies (e.g. the underlying Firebase Auth user or
// Firestore profile was deleted) can't be cleared from a Server Component
// render, only from a Route Handler. Server components redirect here instead
// of straight to /login so the cookie actually gets removed — otherwise
// proxy.ts keeps seeing a cookie, bounces away from /login, and the session
// check keeps bouncing back, looping forever (ERR_TOO_MANY_REDIRECTS).
export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}
