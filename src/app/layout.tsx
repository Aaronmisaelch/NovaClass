import type { Metadata } from "next";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-nova-white text-nova-navy">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
