import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/lib/language-context";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Bee Absensi",
    template: "%s — Bee Absensi",
  },
  description: "Aplikasi kehadiran karyawan digital yang mudah dan aman.",
  icons: {
    icon: [
      { url: "/images/logo_lebah_kreatif-removebg.png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/images/logo_lebah_kreatif-removebg.png",
    apple: "/images/logo_lebah_kreatif-removebg.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>{children}</AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
