"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

const NAV_ITEMS: { label: string; href: string; icon: string }[] = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { label: "Absensi", href: "/admin/absensi", icon: "📋" },
  { label: "Pengajuan Izin", href: "/admin/izin", icon: "📝" },
  { label: "Karyawan", href: "/admin/karyawan", icon: "👥" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const name = user?.profile?.full_name ?? user?.email ?? "Admin";
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-24 md:flex md:pb-0">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden min-h-screen w-72 flex-col border-r border-outline-variant/70 bg-surface p-6 md:flex">
        <Brand />

        {/* Admin badge */}
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-primary/8 p-3 ring-1 ring-primary/20">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-on-primary text-sm">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-on-surface">{name}</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wide">
              ⚡ {user?.role ?? "admin"}
            </span>
          </div>
        </div>

        <nav className="mt-8 space-y-1" aria-label="Navigasi Admin">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.href}
              active={pathname === item.href}
              icon={item.icon}
              onClick={() => router.push(item.href)}
            >
              {item.label}
            </NavItem>
          ))}
        </nav>

        <div className="mt-auto space-y-2">
          <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-700 ring-1 ring-amber-200">
            <span className="font-bold">Mode Admin</span> — Hanya dapat melihat & mengelola data karyawan.
          </div>
          <button
            onClick={() => void signOut()}
            className="w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-error hover:bg-red-50 transition-colors"
          >
            🚪 Keluar
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="min-w-0 flex-1">
        {/* Mobile header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-surface-container bg-surface/95 px-5 backdrop-blur md:hidden">
          <Brand compact />
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">Admin</span>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-on-primary text-xs">
              {initials}
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-20 flex h-20 items-center justify-around rounded-t-2xl border-t border-surface-container bg-surface-container-lowest px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden"
        aria-label="Navigasi Admin"
      >
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            active={pathname === item.href}
            icon={item.icon}
            onClick={() => router.push(item.href)}
            mobile
          >
            {item.label}
          </NavItem>
        ))}
      </nav>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary font-bold text-on-primary">
        B
      </span>
      {!compact && (
        <div>
          <p className="text-lg font-bold text-primary leading-tight">Bee Absensi</p>
          <p className="text-[10px] text-on-surface-variant font-medium tracking-wide uppercase">Admin Panel</p>
        </div>
      )}
      {compact && <span className="font-bold text-primary">Bee Admin</span>}
    </div>
  );
}

function NavItem({
  children,
  active,
  icon,
  mobile = false,
  onClick,
}: {
  children: ReactNode;
  active: boolean;
  icon: string;
  mobile?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "font-semibold transition-all duration-150",
        mobile
          ? "flex min-w-14 flex-col items-center rounded-xl px-2 py-2 text-[10px] gap-0.5"
          : "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm",
        active
          ? "bg-primary/10 text-primary"
          : "text-on-surface-variant hover:bg-surface-container-low",
      ].join(" ")}
    >
      <span className={mobile ? "text-lg" : "text-base"}>{icon}</span>
      <span>{children}</span>
    </button>
  );
}
