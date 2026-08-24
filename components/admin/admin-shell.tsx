"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

const NAV_ITEMS: { label: string; href: string; icon: JSX.Element }[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "Absensi",
    href: "/admin/absensi",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "Pengajuan Izin",
    href: "/admin/izin",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M7 8h10M7 12h6M21 15.5A9 9 0 1 1 3 9.5" />
        <path d="M21 3v5h-5" />
      </svg>
    ),
  },
  {
    label: "Karyawan",
    href: "/admin/karyawan",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    label: "Laporan",
    href: "/admin/laporan",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const name = user?.profile?.full_name ?? user?.email ?? "Admin";
  const role = user?.role ?? "admin";
  const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  const activeItem = NAV_ITEMS.find((i) => i.href === pathname) ?? NAV_ITEMS[0];

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-outline-variant/30">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary shadow-sm">
          <span className="text-lg font-black text-white">B</span>
        </div>
        <div>
          <p className="text-base font-bold text-on-surface leading-tight">Bee Absensi</p>
          <p className="text-[10px] font-semibold tracking-widest text-on-surface-variant uppercase">Admin Panel</p>
        </div>
      </div>

      {/* User profile */}
      <div className="mx-4 mt-4 flex items-center gap-3 rounded-2xl bg-primary/6 px-3 py-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-bold shadow-sm">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-on-surface">{name}</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wide">
            ⚡ {role}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-5 flex-1 space-y-0.5 px-3">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Menu</p>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => { router.push(item.href); setSidebarOpen(false); }}
              className={[
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150",
                active
                  ? "bg-primary text-white shadow-sm shadow-primary/25"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
              ].join(" ")}
            >
              {item.icon}
              {item.label}
              {active && <div className="ml-auto size-1.5 rounded-full bg-white/60" />}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-4 pb-6 space-y-2">
        <div className="rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-700 ring-1 ring-amber-200">
          <p className="font-bold">Mode Admin</p>
          <p className="mt-0.5 opacity-80">Hanya melihat & mengelola data karyawan.</p>
        </div>
        <button
          onClick={() => void signOut()}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-error hover:bg-red-50 transition-colors"
        >
          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* ── Mobile overlay sidebar ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <SidebarContent />
      </aside>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-64 md:flex-col bg-white border-r border-outline-variant/30 shadow-sm">
        <SidebarContent />
      </aside>

      {/* ── Main content ── */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-outline-variant/30 bg-white/90 px-4 backdrop-blur-md md:px-6">
          {/* Mobile: hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex size-9 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-low md:hidden"
          >
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Page title on mobile */}
          <div className="flex items-center gap-2 md:gap-0">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary md:hidden">
              <span className="text-xs font-black text-white">B</span>
            </div>
            <p className="text-sm font-bold text-on-surface md:text-base">{activeItem.label}</p>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary uppercase tracking-wide">
              {role}
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 py-5 md:px-8 md:py-8">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex h-[68px] items-center justify-around bg-white border-t border-outline-variant/30 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] px-2 md:hidden">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={[
                "flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-semibold transition-colors",
                active ? "text-primary" : "text-on-surface-variant",
              ].join(" ")}
            >
              <span className={["flex size-8 items-center justify-center rounded-xl transition-colors", active ? "bg-primary/10" : ""].join(" ")}>
                {item.icon}
              </span>
              {item.label.split(" ")[0]}
            </button>
          );
        })}
      </nav>

      {/* Bottom spacer on mobile */}
      <div className="h-[68px] md:hidden" />
    </div>
  );
}
