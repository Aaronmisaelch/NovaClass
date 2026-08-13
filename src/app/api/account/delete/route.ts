import { getSessionUser } from "@/lib/auth/session";
import { getAdminAuth } from "@/lib/firebase/admin";
import { deleteUserAccount } from "@/lib/account/delete-account";

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return Response.json({ error: "No autenticado." }, { status: 401 });
  }

  const { idToken } = await request.json();
  if (!idToken || typeof idToken !== "string") {
    return Response.json({ error: "idToken es requerido." }, { status: 400 });
  }

  // Requiring a freshly-minted idToken (not just the long-lived session
  // cookie) is our own extra confirmation step, standing in for the
  // password-reauth flow email/password auth would need — this app is
  // Google-only, so the equivalent proof-of-presence is a fresh Google popup
  // right before the delete call (see auth-provider.tsx's deleteAccount()).
  let decoded;
  try {
    decoded = await getAdminAuth().verifyIdToken(idToken);
  } catch {
    return Response.json(
      { error: "No se pudo verificar tu identidad. Vuelve a intentarlo." },
      { status: 401 }
    );
  }

  if (decoded.uid !== sessionUser.uid) {
    return Response.json({ error: "La sesión no coincide." }, { status: 403 });
  }

  try {
    await deleteUserAccount(sessionUser.uid);
  } catch (error) {
    console.error("[account] delete failed:", error);
    return Response.json(
      { error: "No se pudo eliminar la cuenta. Inténtalo de nuevo." },
      { status: 500 }
    );
  }

  return Response.json({ ok: true });
}
