import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NovaClass",
  description:
    "Plataforma académica digital para planificación, seguimiento y colaboración escolar.",
};

// viewport-fit=cover is what makes env(safe-area-inset-*) resolve to a real
// value instead of 0 on notch/home-indicator devices — the mobile bottom
// nav's clearance padding (see (app)/layout.tsx and mobile-nav.tsx) relies
// on that to actually clear the home indicator instead of just guessing a
// fixed px value.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-nova-white text-nova-navy">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
