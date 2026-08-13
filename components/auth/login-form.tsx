"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { ApiError } from "@/lib/api";
import { Button, Card, TextInput } from "@/components/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export function LoginForm() {
  const { signIn, status } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const nextPath = searchParams.get("next");

  useEffect(() => { if (status === "authenticated") router.replace(nextPath?.startsWith("/") ? nextPath : "/"); }, [nextPath, router, status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      await signIn(email.trim(), password);
      router.replace(nextPath?.startsWith("/") ? nextPath : "/");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Tidak dapat terhubung ke server. Coba lagi.");
    } finally { setPending(false); }
  }

  return <section className="w-full max-w-md">
    <div className="mb-8 flex flex-col items-center text-center">
      <span className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary text-3xl font-bold text-on-primary soft-shadow">B</span>
      <h1 className="text-2xl font-bold text-primary">Bee Absensi</h1>
      <p className="mt-2 text-sm text-on-surface-variant">Masuk untuk melanjutkan ke akun Anda.</p>
    </div>
    <Card className="p-6 sm:p-8">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block"><span className="mb-2 block text-xs font-bold text-on-surface-variant">Alamat email</span><TextInput type="email" autoComplete="email" placeholder="nama@perusahaan.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label className="block"><span className="mb-2 block text-xs font-bold text-on-surface-variant">Kata sandi</span><div className="relative"><TextInput type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Masukkan kata sandi" className="pr-20" value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-3 text-xs font-bold text-primary">{showPassword ? "Sembunyi" : "Tampil"}</button></div></label>
        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-error">{error}</p>}
        <Button type="submit" fullWidth disabled={pending || status === "loading"} className="mt-2 h-14 disabled:cursor-not-allowed disabled:opacity-60">{pending ? "Memproses…" : "Masuk"}</Button>
      </form>
    </Card>
    <p className="mt-5 rounded-2xl border border-surface-container bg-surface-container-low px-4 py-3 text-xs leading-5 text-on-surface-variant">Gunakan akun yang telah didaftarkan oleh admin. Akses Anda terlindungi dengan autentikasi token.</p>
  </section>;
}
