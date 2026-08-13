import { LoginForm } from "@/components/auth/login-form";
import { Suspense } from "react";

export default function LoginPage() {
  return <main className="flex min-h-screen items-center justify-center px-5 py-10"><Suspense fallback={<p className="text-sm text-on-surface-variant">Memuat halaman masuk…</p>}><LoginForm /></Suspense></main>;
}
