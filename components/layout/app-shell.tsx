"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { useRouter, usePathname } from "next/navigation";
import type { ReactNode } from "react";

const NAV_ITEMS: { label: string; href: string; icon: (active: boolean) => ReactNode }[] = [
  {
    label: "Beranda",
    href: "/",
    icon: (active) => (
      <svg className={`size-6 ${active ? "text-primary" : "text-on-surface-variant"}`} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9 21 9 15 12 15C15 15 15 21 15 21M9 21H15" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Riwayat",
    href: "/riwayat",
    icon: (active) => (
      <svg className={`size-6 ${active ? "text-primary" : "text-on-surface-variant"}`} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        {active ? (
          <path fillRule="evenodd" clipRule="evenodd" d="M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5ZM7 8C7 7.44772 7.44772 7 8 7H16C16.5523 7 17 7.44772 17 8C17 8.55228 16.5523 9 16 9H8C7.44772 9 7 8.55228 7 8ZM8 11C7.44772 11 7 11.4477 7 12C7 12.5523 7.44772 13 8 13H16C16.5523 13 17 12.5523 17 12C17 11.4477 16.5523 11 16 11H8ZM8 15C7.44772 15 7 15.4477 7 16C7 16.5523 7.44772 17 8 17H12C12.5523 17 13 16.5523 13 16C13 15.4477 12.5523 15 12 15H8Z" />
        ) : (
          <>
            <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round"/>
            <path d="M7 8H17M7 12H17M7 16H12" strokeLinecap="round"/>
          </>
        )}
      </svg>
    ),
  },
  {
    label: "Izin & Cuti",
    href: "/izin-cuti",
    icon: (active) => (
      <svg className={`size-6 ${active ? "text-primary" : "text-on-surface-variant"}`} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        {active ? (
          <path fillRule="evenodd" clipRule="evenodd" d="M8 2C7.44772 2 7 2.44772 7 3V4H6C4.34315 4 3 5.34315 3 7V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V7C21 5.34315 19.6569 4 18 4H17V3C17 2.44772 16.5523 2 16 2C15.4477 2 15 2.44772 15 3V4H9V3C9 2.44772 8.55228 2 8 2ZM8 11C7.44772 11 7 11.4477 7 12C7 12.5523 7.44772 13 8 13H16C16.5523 13 17 12.5523 17 12C17 11.4477 16.5523 11 16 11H8ZM7 16C7 15.4477 7.44772 15 8 15H13C13.5523 15 14 15.4477 14 16C14 16.5523 13.5523 17 13 17H8C7.44772 17 7 16.5523 7 16Z" />
        ) : (
          <>
            <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round"/>
            <path d="M8 2V6M16 2V6M3 10H21M8 14H16M8 18H13" strokeLinecap="round"/>
          </>
        )}
      </svg>
    ),
  },
  {
    label: "Profil",
    href: "/profil",
    icon: (active) => (
      <svg className={`size-6 ${active ? "text-primary" : "text-on-surface-variant"}`} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        {active ? (
          <path fillRule="evenodd" clipRule="evenodd" d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12ZM12 14C8.13401 14 5 16.0147 5 18.5V19C5 19.5523 5.44772 20 6 20H18C18.5523 20 19 19.5523 19 19V18.5C19 16.0147 15.866 14 12 14Z" />
        ) : (
          <>
            <circle cx="12" cy="8" r="4" strokeLinecap="round"/>
            <path d="M6 20C6 17.2386 8.68629 15 12 15C15.3137 15 18 17.2386 18 20" strokeLinecap="round"/>
          </>
        )}
      </svg>
    ),
  },
];

export function AppShell({ children, activeItem, noPadding = false }: { children: ReactNode; activeItem: string; noPadding?: boolean }) {
  const { signOut, user } = useAuth();
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

  return (
    <div className="min-h-screen bg-[#eef2f8] pb-20 md:flex md:pb-0">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden min-h-screen w-72 flex-col border-r border-outline-variant/40 bg-white p-6 shadow-sm md:flex">
        <Brand />
        <div className="mt-8 flex items-center gap-3 rounded-2xl bg-[#eef2f8] p-3">
          <Avatar initials={initials} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-on-surface">{name}</p>
            <p className="truncate text-xs text-on-surface-variant">
              {user?.profile?.nip ?? user?.email}
            </p>
          </div>
        </div>
        <nav className="mt-8 space-y-1" aria-label="Navigasi utama">
          {NAV_ITEMS.map((item) => {
            const isActive = item.label === activeItem;
            return (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-[#eef2f8]"
                }`}
              >
                {item.icon(isActive)}
                {item.label}
              </button>
            );
          })}
        </nav>
        <button
          onClick={() => void signOut()}
          className="mt-auto flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-error hover:bg-red-50"
        >
          <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path d="M17 16L21 12M21 12L17 8M21 12H9M13 16V17A2 2 0 0111 19H6A2 2 0 014 17V7A2 2 0 016 5H11A2 2 0 0113 7V8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Keluar
        </button>
      </aside>

      {/* ── Main content ── */}
      <div className="min-w-0 flex-1">
        {/* Mobile top header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between bg-white px-5 shadow-sm md:hidden">
          <div className="flex items-center gap-2">
            <button
              className="flex items-center justify-center rounded-xl p-2 text-on-surface-variant hover:bg-[#eef2f8]"
              aria-label="Menu"
            >
              <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M4 6H20M4 12H20M4 18H20" strokeLinecap="round"/>
              </svg>
            </button>
            <Brand />
          </div>
          <div
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-bold text-primary ring-2 ring-primary/20"
          >
            {initials}
          </div>
        </header>
        <main className={`mx-auto w-full max-w-md ${noPadding ? "px-0 pt-0" : "px-5 py-6"} md:max-w-3xl md:px-8 md:py-10`}>{children}</main>
      </div>

      {/* ── Mobile bottom nav with icons ── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-20 flex h-[68px] items-center justify-around bg-white px-2 shadow-[0_-2px_20px_rgba(0,0,0,0.08)] md:hidden"
        aria-label="Navigasi utama"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = item.label === activeItem ||
            (currentHref === item.href) ||
            (item.href !== "/" && currentHref.startsWith(item.href));
          return (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-all ${
                isActive ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
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
              <span className={`text-[10px] font-bold ${isActive ? "text-primary" : "text-on-surface-variant"}`}>
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
    <div className="flex items-center gap-2">
      <div className="flex size-8 items-center justify-center rounded-xl bg-primary">
        <svg className="size-4 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
          <path d="M2 17L12 22L22 17M2 12L12 17L22 12" strokeWidth="0"/>
        </svg>
      </div>
      <span className={compact ? "font-bold text-primary text-sm" : "text-lg font-bold text-primary"}>
        Bee Absensi
      </span>
    </div>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary ring-2 ring-primary/20">
      {initials}
    </span>
  );
}
