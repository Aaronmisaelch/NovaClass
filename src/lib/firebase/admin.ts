import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function createAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Faltan credenciales de Firebase Admin. Define FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL y FIREBASE_ADMIN_PRIVATE_KEY en .env.local."
    );
  }

  // TODO: diagnóstico temporal — revertir una vez resuelto el 401 en producción.
  const rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "";
  console.log("[firebase-admin] Inicializando app admin:", {
    projectId,
    privateKeyHasLiteralEscapedNewlines: rawPrivateKey.includes("\\n"),
    privateKeyLength: rawPrivateKey.length,
  });

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

let adminApp: App | undefined;

function getAdminApp(): App {
  if (!adminApp) adminApp = createAdminApp();
  return adminApp;
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
