"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { ApiError } from "@/lib/api";
import { Button, Card, TextInput } from "@/components/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export function LoginForm() {
  const { signIn, status, isAdmin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const nextPath = searchParams.get("next");

  // Muat kredensial yang tersimpan jika pengguna mengaktifkan "Ingat saya"
  useEffect(() => {
    try {
      const isRemembered = localStorage.getItem("bee_remember_me") === "true";
      if (isRemembered) {
        setRememberMe(true);
        const savedEmail = localStorage.getItem("bee_remembered_email") ?? "";
        const savedPassword = localStorage.getItem("bee_remembered_password") ?? "";
        if (savedEmail) setEmail(savedEmail);
        if (savedPassword) setPassword(savedPassword);
      }
    } catch {
      // Abaikan jika localStorage tidak dapat diakses
    }
  }, []);

  // Redirect setelah authenticated berdasarkan role
  useEffect(() => {
    if (status === "authenticated") {
      if (isAdmin) {
        // Jika admin, hanya boleh lanjut ke sub-rute /admin jika ada di nextPath
        const targetAdminPath = nextPath?.startsWith("/admin") ? nextPath : "/admin";
        router.replace(targetAdminPath);
      } else {
        // Jika karyawan, hanya boleh lanjut ke rute karyawan (bukan /admin)
        const targetUserPath =
          nextPath?.startsWith("/") && !nextPath.startsWith("/admin") ? nextPath : "/";
        router.replace(targetUserPath);
      }
    }
  }, [isAdmin, nextPath, router, status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      await signIn(email.trim(), password);

      // Simpan atau bersihkan data "Ingat saya"
      try {
        if (rememberMe) {
          localStorage.setItem("bee_remember_me", "true");
          localStorage.setItem("bee_remembered_email", email.trim());
          localStorage.setItem("bee_remembered_password", password);
        } else {
          localStorage.removeItem("bee_remember_me");
          localStorage.removeItem("bee_remembered_email");
          localStorage.removeItem("bee_remembered_password");
        }
      } catch {
        // Abaikan jika localStorage error
      }
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Tidak dapat terhubung ke server. Coba lagi.");
    } finally { setPending(false); }
  }

  return <section className="w-full max-w-md relative z-10">
    <div className="mb-8 flex flex-col items-center text-center">
      <div className="mb-4 flex size-20 items-center justify-center rounded-3xl p-2.5 bg-white/95 dark:bg-white shadow-[0_4px_30px_rgba(245,197,24,0.3)] ring-1 ring-amber-500/20">
        <img
          src="/images/logo_lebah_kreatif-removebg.png"
          alt="Bee Absensi"
          className="size-full object-contain drop-shadow-sm"
        />
      </div>
      <h1 className="text-3xl font-black tracking-tight text-foreground">Bee Absensi</h1>
      <p className="mt-2 text-sm text-muted-foreground">Masuk untuk melanjutkan ke akun Anda.</p>
    </div>
    
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-xs font-bold text-muted-foreground">Alamat email</span>
          <TextInput type="email" autoComplete="email" placeholder="nama@perusahaan.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        
        <label className="block">
          <span className="mb-2 block text-xs font-bold text-muted-foreground">Kata sandi</span>
          <div className="relative">
            <TextInput type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Masukkan kata sandi" className="pr-20" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-3 text-xs font-bold text-primary hover:text-foreground transition-colors">{showPassword ? "Sembunyi" : "Tampil"}</button>
          </div>
        </label>
        
        <div className="flex items-center justify-between pt-1">
          <label htmlFor="remember-me" className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              id="remember-me"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="size-4 rounded border-border text-primary accent-primary focus:ring-primary/20 cursor-pointer"
            />
            <span className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Ingat saya
            </span>
          </label>
        </div>

        {error && <p role="alert" className="rounded-xl bg-red-950/50 border border-red-900/50 px-4 py-3 text-sm text-red-400">{error}</p>}
        
        <Button type="submit" fullWidth disabled={pending || status === "loading"} className="mt-4 h-14 disabled:cursor-not-allowed disabled:opacity-60">{pending ? "Memproses…" : "Masuk"}</Button>
      </form>
    </div>
    
    <p className="mt-6 rounded-2xl border border-border bg-card/50 px-5 py-4 text-center text-xs leading-5 text-muted-foreground">
      Gunakan akun yang telah didaftarkan oleh admin.<br/>Akses Anda terlindungi dengan autentikasi token.
    </p>
  </section>;
}
