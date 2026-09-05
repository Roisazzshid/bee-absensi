"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { useLanguage } from "@/lib/language-context";
import { useRouter, usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNotification } from "@/components/layout/user-notification";

const NAV_CONFIG = [
  {
    key: "nav_home",
    defaultLabel: "Beranda",
    href: "/",
    icon: (active: boolean) => (
      <svg className={`size-6 fill-current ${active ? "text-primary" : "text-muted-foreground"}`} viewBox="0 0 24 24">
        <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z"/>
        <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.432z"/>
      </svg>
    ),
  },
  {
    key: "nav_history",
    defaultLabel: "Riwayat",
    href: "/riwayat",
    icon: (active: boolean) => (
      <svg className={`size-6 fill-current ${active ? "text-primary" : "text-muted-foreground"}`} viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5ZM7 8C7 7.44772 7.44772 7 8 7H16C16.5523 7 17 7.44772 17 8C17 8.55228 16.5523 9 16 9H8C7.44772 9 7 8.55228 7 8ZM8 11C7.44772 11 7 11.4477 7 12C7 12.5523 7.44772 13 8 13H16C16.5523 13 17 12.5523 17 12C17 11.4477 16.5523 11 16 11H8ZM8 15C7.44772 15 7 15.4477 7 16C7 16.5523 7.44772 17 8 17H12C12.5523 17 13 16.5523 13 16C13 15.4477 12.5523 15 12 15H8Z" />
      </svg>
    ),
  },
  {
    key: "nav_leave",
    defaultLabel: "Izin & Cuti",
    href: "/izin-cuti",
    icon: (active: boolean) => (
      <svg className={`size-6 fill-current ${active ? "text-primary" : "text-muted-foreground"}`} viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M8 2C7.44772 2 7 2.44772 7 3V4H6C4.34315 4 3 5.34315 3 7V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V7C21 5.34315 19.6569 4 18 4H17V3C17 2.44772 16.5523 2 16 2C15.4477 2 15 2.44772 15 3V4H9V3C9 2.44772 8.55228 2 8 2ZM8 11C7.44772 11 7 11.4477 7 12C7 12.5523 7.44772 13 8 13H16C16.5523 13 17 12.5523 17 12C17 11.4477 16.5523 11 16 11H8ZM7 16C7 15.4477 7.44772 15 8 15H13C13.5523 15 14 15.4477 14 16C14 16.5523 13.5523 17 13 17H8C7.44772 17 7 16.5523 7 16Z" />
      </svg>
    ),
  },
  {
    key: "nav_profile",
    defaultLabel: "Profil",
    href: "/profil",
    icon: (active: boolean) => (
      <svg className={`size-6 fill-current ${active ? "text-primary" : "text-muted-foreground"}`} viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12ZM12 14C8.13401 14 5 16.0147 5 18.5V19C5 19.5523 5.44772 20 6 20H18C18.5523 20 19 19.5523 19 19V18.5C19 16.0147 15.866 14 12 14Z" />
      </svg>
    ),
  },
];

export function AppShell({ children, activeItem, noPadding = false }: { children: ReactNode; activeItem: string; noPadding?: boolean }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const name = user?.profile?.full_name ?? user?.email ?? "Karyawan";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Detect active nav from pathname for accuracy
  const currentHref = pathname ?? "/";

  const navItems = NAV_CONFIG.map((item) => ({
    ...item,
    label: t(item.key, item.defaultLabel),
  }));

  return (
    <div className="min-h-screen bg-background pb-20 md:flex md:pb-0">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden min-h-screen w-72 flex-col border-r border-border bg-card p-6 shadow-sm md:flex">
        <Brand />
        <div
          onClick={() => router.push("/profil")}
          className="mt-8 flex items-center gap-3 rounded-2xl bg-muted/50 p-3 cursor-pointer transition hover:bg-muted/80"
        >
          <Avatar initials={initials} avatarUrl={user?.profile?.avatar_url} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">{name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.profile?.nip ?? user?.email}
            </p>
          </div>
        </div>
        <nav className="mt-8 space-y-1" aria-label="Navigasi utama">
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? currentHref === "/" : currentHref.startsWith(item.href);
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {item.icon(isActive)}
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Main content ── */}
      <div className="min-w-0 flex-1 flex flex-col min-h-screen">
        {/* Mobile top header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between bg-card px-5 shadow-sm md:hidden border-b border-border">
          <div className="flex items-center gap-2">
            <button
              className="flex items-center justify-center rounded-xl p-2 text-muted-foreground hover:bg-muted"
              aria-label="Menu"
            >
              <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
              </svg>
            </button>
            <Brand />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserNotification />
            <div
              onClick={() => router.push("/profil")}
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-bold text-primary ring-2 ring-primary/20"
            >
              {user?.profile?.avatar_url ? (
                <img
                  src={user.profile.avatar_url}
                  alt={name}
                  className="size-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
          </div>
        </header>

        {/* Desktop top bar with Theme Toggle & User Notification */}
        <div className="hidden md:flex items-center gap-3 p-4 lg:p-6 absolute top-0 right-0 z-30">
          <ThemeToggle />
          <UserNotification />
        </div>

        <main className={`relative mx-auto w-full max-w-md flex-1 ${noPadding ? "px-0 pt-0" : "px-5 py-6"} md:max-w-3xl md:px-8 md:py-10`}>
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav with icons ── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-20 flex h-[68px] items-center justify-around bg-card px-2 shadow-[0_-2px_20px_rgba(0,0,0,0.08)] border-t border-border md:hidden"
        aria-label="Navigasi utama"
      >
        {navItems.map((item) => {
          const isActive = (currentHref === item.href) ||
            (item.href !== "/" && currentHref.startsWith(item.href));
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-all ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active: filled pill bg */}
              <span
                className={`flex items-center justify-center rounded-full px-5 py-1 transition-all ${
                  isActive ? "bg-primary/10" : ""
                }`}
              >
                {item.icon(isActive)}
              </span>
              <span className={`text-[10px] font-bold ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-9 items-center justify-center rounded-xl p-1 bg-white/95 dark:bg-white border border-border/80 shadow-2xs">
        <img
          src="/images/logo_lebah_kreatif-removebg.png"
          alt="Bee Absensi"
          className="size-full object-contain"
        />
      </div>
      <span className={compact ? "font-bold text-primary text-sm" : "text-lg font-bold text-primary"}>
        Bee Absensi
      </span>
    </div>
  );
}

function Avatar({ initials, avatarUrl }: { initials: string; avatarUrl?: string | null }) {
  if (avatarUrl) {
    return (
      <div className="size-10 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20">
        <img src={avatarUrl} alt="Avatar" className="size-full object-cover" />
      </div>
    );
  }
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary ring-2 ring-primary/20">
      {initials}
    </span>
  );
}
