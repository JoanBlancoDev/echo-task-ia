import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import { getSupabaseAccessTokenFromCookies } from "@/lib/auth/cookie";
import { cookies } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EchoTask - Tu asistente de productividad por voz",
  description: "Convierte tus notas de voz en tareas organizadas. Prioriza, categoriza y mantente al día con tu productividad, todo con la ayuda de la inteligencia artificial.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const accessToken = getSupabaseAccessTokenFromCookies(cookieStore);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <AppProviders isAuthenticated={Boolean(accessToken)}>{children}</AppProviders>
      </body>
    </html>
  );
}
