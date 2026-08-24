"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

/** Proteksi halaman yang butuh login (role apa pun) */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [pathname, router, status]);

  if (status !== "authenticated") return <div className="grid min-h-[50vh] place-items-center text-sm text-on-surface-variant">Memeriksa sesi…</div>;
  return <>{children}</>;
}

/** Proteksi halaman yang butuh login dengan role admin/superadmin */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { status, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (status === "authenticated" && !isAdmin) {
      // User sudah login tapi bukan admin, redirect ke beranda
      router.replace("/");
    }
  }, [isAdmin, pathname, router, status]);

  if (status === "loading") {
    return <div className="grid min-h-[50vh] place-items-center text-sm text-on-surface-variant">Memeriksa akses…</div>;
  }

  if (status !== "authenticated" || !isAdmin) return null;
  return <>{children}</>;
}
