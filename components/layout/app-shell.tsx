"use client";

import { useAuth } from "@/components/auth/auth-provider";
import type { ReactNode } from "react";

const navItems = ["Beranda", "Riwayat", "Izin & cuti", "Profil"];

export function AppShell({ children, activeItem }: { children: ReactNode; activeItem: string }) {
  const { signOut, user } = useAuth();
  const name = user?.profile?.full_name ?? user?.email ?? "Karyawan";
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <div className="min-h-screen bg-background pb-20 md:flex md:pb-0">
    <aside className="hidden min-h-screen w-72 flex-col border-r border-outline-variant/70 bg-surface p-6 md:flex"><Brand /><div className="mt-8 flex items-center gap-3 rounded-2xl bg-surface-container-low p-3"><Avatar initials={initials} /><div className="min-w-0"><p className="truncate text-sm font-bold text-on-surface">{name}</p><p className="truncate text-xs text-on-surface-variant">{user?.profile?.nip ?? user?.email}</p></div></div><nav className="mt-8 space-y-2" aria-label="Navigasi utama">{navItems.map((item) => <NavItem key={item} active={item === activeItem}>{item}</NavItem>)}</nav><button onClick={() => void signOut()} className="mt-auto rounded-xl px-4 py-3 text-left text-sm font-bold text-error hover:bg-red-50">Keluar</button></aside>
    <div className="min-w-0 flex-1"><header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-surface-container bg-surface/95 px-5 backdrop-blur md:hidden"><Brand compact /><Avatar initials={initials} /></header><main className="mx-auto w-full max-w-3xl px-5 py-6 md:px-8 md:py-10">{children}</main></div>
    <nav className="fixed inset-x-0 bottom-0 z-20 flex h-20 items-center justify-around rounded-t-2xl border-t border-surface-container bg-surface-container-lowest px-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:hidden" aria-label="Navigasi utama">{navItems.map((item) => <NavItem key={item} active={item === activeItem} mobile>{item}</NavItem>)}</nav>
  </div>;
}

function Brand({ compact = false }: { compact?: boolean }) { return <div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-primary font-bold text-on-primary">B</span><span className={compact ? "font-bold text-primary" : "text-xl font-bold text-primary"}>Bee Absensi</span></div>; }
function Avatar({ initials }: { initials: string }) { return <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-xs font-bold text-primary">{initials}</span>; }
function NavItem({ children, active, mobile = false }: { children: ReactNode; active: boolean; mobile?: boolean }) { return <button className={join("font-bold transition", mobile ? "flex min-w-14 flex-col items-center rounded-xl px-2 py-2 text-[10px]" : "w-full rounded-xl px-4 py-3 text-left text-sm", active ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-container-low")}>{children}</button>; }
function join(...values: Array<string | undefined>) { return values.filter(Boolean).join(" "); }
