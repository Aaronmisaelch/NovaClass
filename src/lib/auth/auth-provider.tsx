"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  reauthenticateWithPopup,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@/lib/firebase/client";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  async function signInWithGoogle() {
    const credential = await signInWithPopup(auth, googleProvider);
    const idToken = await credential.user.getIdToken();

    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    router.refresh();
  }

  async function signOut() {
    await fetch("/api/auth/session", { method: "DELETE" });
    await firebaseSignOut(auth);
    router.push("/login");
    router.refresh();
  }

  async function deleteAccount() {
    if (!auth.currentUser) throw new Error("No hay sesión activa.");

    // NovaClass only supports Google sign-in, so the "recent login" proof
    // Firebase requires for destructive account operations is a fresh Google
    // popup rather than a password prompt.
    const credential = await reauthenticateWithPopup(auth.currentUser, googleProvider);
    const idToken = await credential.user.getIdToken();

    const res = await fetch("/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "No se pudo eliminar la cuenta.");
    }

    await fetch("/api/auth/session", { method: "DELETE" });
    await firebaseSignOut(auth).catch(() => {});
    router.push("/login");
    router.refresh();
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider.");
  }
  return context;
}
