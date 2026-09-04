"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { usePathname, useRouter } from "next/navigation";
import { JSX, useState, type ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_ITEMS: { label: string; href: string; icon: JSX.Element }[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "Absensi",
    href: "/admin/absensi",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M8 2v3M16 2v3M3 8h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "Pengajuan Izin",
    href: "/admin/izin",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M9 12h6M9 16h4M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 3l5 5h-5V3z" />
      </svg>
    ),
  },
  {
    label: "Karyawan",
    href: "/admin/karyawan",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
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
      <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
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
  const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const activeItem = NAV_ITEMS.find((i) => i.href === pathname) ?? NAV_ITEMS[0];

  const NavButton = ({ item, onClick }: { item: typeof NAV_ITEMS[0]; onClick?: () => void }) => {
    const active = pathname === item.href;
    return (
      <button
        onClick={() => { router.push(item.href); onClick?.(); }}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 border ${
          active
            ? "bg-primary/15 text-[#f5c518] border-primary/30"
            : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        {item.icon}
        {item.label}
      </button>
    );
  };

  const BottomNavButton = ({ href, label, icon }: { href: string; label: string; icon: JSX.Element }) => {
    const active = pathname === href;
    return (
      <button
        onClick={() => { router.push(href); setSidebarOpen(false); }}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 border ${
          active
            ? "bg-primary/15 text-[#f5c518] border-primary/30"
            : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        {icon}
        {label}
      </button>
    );
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-background">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-5">
        <div className="flex size-9 items-center justify-center rounded-xl overflow-hidden bg-card">
          <img src="/images/logo%20lebah%20kreatif.jpeg" alt="Bee Absensi" className="size-9 object-cover" />
        </div>
        <div>
          <p className="text-base font-bold leading-tight text-foreground">Bee Absensi</p>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 mt-2">
        {NAV_ITEMS.map((item) => (
          <NavButton key={item.href} item={item} onClick={() => setSidebarOpen(false)} />
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-4 my-2 border-t border-border" />

      {/* Bottom nav: Settings & Support */}
      <div className="px-3 pb-2 space-y-0.5">
        <BottomNavButton
          href="/admin/settings"
          label="Settings"
          icon={
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          }
        />
        <BottomNavButton
          href="/admin/support"
          label="Support"
          icon={
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
            </svg>
          }
        />
      </div>

      {/* Divider */}
      <div className="mx-4 mb-2 border-t border-border" />

      {/* User profile at bottom */}
      <div className="mx-3 mb-4 flex items-center gap-3 rounded-xl px-3 py-3 bg-card">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold bg-primary">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-foreground">{name}</p>
          <p className="truncate text-[11px] text-muted-foreground">System Administrator</p>
        </div>
        <button
          onClick={() => void signOut()}
          className="flex shrink-0 size-7 items-center justify-center rounded-lg transition-colors text-muted-foreground hover:text-red-500"
          title="Keluar"
        >
          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Mobile overlay sidebar ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={["fixed inset-y-0 left-0 z-50 w-64 shadow-2xl transition-transform duration-300 ease-in-out md:hidden", sidebarOpen ? "translate-x-0" : "-translate-x-full"].join(" ")}>
        <SidebarContent />
      </aside>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-56 md:flex-col">
        <SidebarContent />
      </aside>

      {/* ── Main content ── */}
      <div className="md:pl-56 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between px-4 md:px-8 bg-background">
          {/* Mobile: hamburger */}
          <button onClick={() => setSidebarOpen(true)} className="flex size-9 items-center justify-center rounded-xl md:hidden text-muted-foreground">
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Page title */}
          <p className="text-lg font-bold hidden md:block text-foreground">
            {activeItem.label === "Dashboard" ? "Dashboard Overview" : activeItem.label}
          </p>
          <p className="text-sm font-bold md:hidden text-foreground">{activeItem.label}</p>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden sm:block">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 h-9 w-[180px] rounded-xl text-sm border outline-none transition-all bg-card border-border text-foreground"
              />
            </div>
            
            <ThemeToggle />

            {/* Notification bell */}
            <button className="flex size-9 items-center justify-center rounded-xl transition-colors bg-card border border-border text-muted-foreground hover:text-foreground">
              <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </button>

            {/* Avatar */}
            <div className="flex size-9 items-center justify-center rounded-full text-white text-xs font-bold shadow-sm bg-primary">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 py-5 md:px-8 md:py-6">{children}</main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex h-[68px] items-center justify-around px-2 md:hidden bg-background border-t border-border">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-semibold transition-colors ${
                active ? "text-[#f5c518]" : "text-muted-foreground"
              }`}
            >
              <span className={`flex size-8 items-center justify-center rounded-xl transition-colors ${
                active ? "bg-primary/15" : "transparent"
              }`}>
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
