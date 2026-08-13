"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth/auth-provider";
import { OnboardingFlowBackground } from "@/app/onboarding-flow-background";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.26A12 12 0 0 0 0 12c0 1.94.46 3.77 1.26 5.39l4.01-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.26 6.61l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

export function LoginView() {
  const { signInWithGoogle } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setError(null);
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch {
      setError("No pudimos iniciar sesión. Inténtalo nuevamente.");
      setIsSigningIn(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <OnboardingFlowBackground />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="flex flex-col items-center gap-8 rounded-3xl border border-nova-navy/5 bg-nova-white p-10 shadow-[0_20px_60px_-30px_rgba(4,14,60,0.35)]">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-2 text-center"
          >
            <div
              className="h-10 w-10 rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, #0A6DFD 0%, #2F94FD 55%, #57B9FD 100%)",
              }}
            />
            <h1 className="text-xl font-semibold tracking-tight text-nova-navy">
              NovaClass
            </h1>
            <p className="text-sm text-nova-navy/50">
              Organiza tu vida académica en un solo lugar.
            </p>
          </motion.div>

          <motion.button
            type="button"
            onClick={handleSignIn}
            disabled={isSigningIn}
            whileHover={{ y: -1 }}
            whileTap={{ y: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-nova-navy/10 bg-nova-white px-6 py-3 text-sm font-medium text-nova-navy shadow-sm transition-colors hover:bg-nova-navy/[0.03] disabled:opacity-60"
          >
            <GoogleIcon />
            {isSigningIn ? "Conectando..." : "Continuar con Google"}
          </motion.button>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-500"
            >
              {error}
            </motion.p>
          )}

          <p className="text-center text-xs leading-relaxed text-nova-navy/40">
            El acceso a NovaClass requiere una cuenta de Google.
          </p>
        </div>
      </motion.div>
    </main>
  );
}
