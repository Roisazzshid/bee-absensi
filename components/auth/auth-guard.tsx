"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

/** Proteksi halaman karyawan (hanya untuk role non-admin/karyawan) */
export function AuthGuard({
  children,
  allowAdmin = false,
}: {
  children: ReactNode;
  allowAdmin?: boolean;
}) {
  const { status, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (status === "authenticated" && isAdmin && !allowAdmin) {
      // Admin tidak boleh masuk ke halaman operasional karyawan, redirect ke /admin
      router.replace("/admin");
    }
  }, [allowAdmin, isAdmin, pathname, router, status]);

  if (status === "loading") {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-3 border-primary/20 border-t-primary" />
          <p className="text-xs font-semibold text-on-surface-variant">Memeriksa sesi…</p>
        </div>
      </div>
    );
  }

  if (status !== "authenticated" || (isAdmin && !allowAdmin)) return null;
  return <>{children}</>;
}

/** Proteksi halaman admin/superadmin */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { status, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (status === "authenticated" && !isAdmin) {
      // User biasa mencoba akses halaman admin, redirect ke beranda
      router.replace("/");
    }
  }, [isAdmin, pathname, router, status]);

  if (status === "loading") {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-3 border-primary/20 border-t-primary" />
          <p className="text-xs font-semibold text-on-surface-variant">Memeriksa hak akses admin…</p>
        </div>
      </div>
    );
  }

  if (status !== "authenticated" || !isAdmin) return null;
  return <>{children}</>;
}

