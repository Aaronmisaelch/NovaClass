import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase/admin";
import { ensureUserProfile } from "@/lib/users/profile";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

const SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  const { idToken } = await request.json();

  if (!idToken || typeof idToken !== "string") {
    return Response.json({ error: "idToken es requerido." }, { status: 400 });
  }

  let decoded;
  try {
    decoded = await getAdminAuth().verifyIdToken(idToken);
  } catch (error) {
    // TODO: diagnóstico temporal — revertir una vez resuelto el 401 en producción.
    console.error(
      "[auth/session] verifyIdToken falló:",
      error instanceof Error ? error.message : error,
      (error as { code?: string })?.code
    );
    return Response.json({ error: "Token inválido." }, { status: 401 });
  }

  await ensureUserProfile(decoded.uid, {
    email: decoded.email ?? null,
    photoURL: (decoded.picture as string | undefined) ?? null,
    name: (decoded.name as string | undefined) ?? "",
  });

  const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE_MS,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_MS / 1000,
  });

  return Response.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return Response.json({ ok: true });
}
