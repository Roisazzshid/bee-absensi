import { LoginForm } from "@/components/auth/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10 relative">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Memuat halaman masuk…</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
