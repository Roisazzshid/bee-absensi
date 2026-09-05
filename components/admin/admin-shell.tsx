"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { usePathname, useRouter } from "next/navigation";
import { JSX, useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

type NotificationItem = {
  id: string;
  category: "leave" | "clock_in" | "clock_out" | "new_employee" | "warning" | "report";
  title: string;
  description: string;
  badge: string;
  badge_color: "amber" | "emerald" | "orange" | "blue" | "purple" | "red";
  timestamp: string;
  time_formatted: string;
  route: string;
  is_pending: boolean;
  user_name?: string | null;
};

const NAV_ITEMS: { label: string; href: string; icon: JSX.Element }[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: (
      <svg className="size-5 fill-current" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M3 6a3 3 0 013-3h2.25a3 3 0 013 3v2.25a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm9.75 0a3 3 0 013-3H18a3 3 0 013 3v2.25a3 3 0 01-3 3h-2.25a3 3 0 01-3-3V6zM3 15.75a3 3 0 013-3h2.25a3 3 0 013 3V18a3 3 0 01-3 3H6a3 3 0 01-3-3v-2.25zm9.75 0a3 3 0 013-3H18a3 3 0 013 3V18a3 3 0 01-3 3h-2.25a3 3 0 01-3-3v-2.25z"/>
      </svg>
    ),
  },
  {
    label: "Absensi",
    href: "/admin/absensi",
    icon: (
      <svg className="size-5 fill-current" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75A3.75 3.75 0 0122.5 8.25v10.5A3.75 3.75 0 0118.75 22.5H5.25A3.75 3.75 0 011.5 18.75V8.25A3.75 3.75 0 015.25 4.5H6V3a.75.75 0 01.75-.75zm14.25 7.5H3v9a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 19.5v-9zm-5.47 2.47a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-2-2a.75.75 0 011.06-1.06l1.47 1.47 3.97-3.97a.75.75 0 011.06 0z"/>
      </svg>
    ),
  },
  {
    label: "Pengajuan Izin",
    href: "/admin/izin",
    icon: (
      <svg className="size-5 fill-current" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 2.071-1.679 3.75-3.75 3.75H5.625a3.75 3.75 0 01-3.75-3.75V5.25c0-2.071 1.679-3.75 3.75-3.75zm8.25 1.625v3.375c0 .207.168.375.375.375h3.375l-3.75-3.75zM7.5 12a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 12zm0 3.75a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zm0 3.75a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75z"/>
      </svg>
    ),
  },
  {
    label: "Karyawan",
    href: "/admin/karyawan",
    icon: (
      <svg className="size-5 fill-current" viewBox="0 0 24 24">
        <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.232.75.75 0 00.424-.672v-.003a5.625 5.625 0 00-7.072-5.385 7.12 7.12 0 011.822 6.188z"/>
      </svg>
    ),
  },
  {
    label: "Laporan",
    href: "/admin/laporan",
    icon: (
      <svg className="size-5 fill-current" viewBox="0 0 24 24">
        <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z"/>
      </svg>
    ),
  },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const { signOut, user, request } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"all" | "warning" | "leave" | "attendance">("all");
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await request<{
        pending_leave_count?: number;
        warning_count?: number;
        total_alert_count?: number;
        total_notifications?: number;
        notifications?: NotificationItem[];
      }>("/admin/notifications");
      if (res) {
        setPendingCount(res.total_alert_count ?? res.pending_leave_count ?? 0);
        setNotifications(res.notifications ?? []);
      }
    } catch {
      // ignore
    }
  }, [request]);

  useEffect(() => {
    void fetchNotifications();
    const timer = setInterval(() => {
      void fetchNotifications();
    }, 20000);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notifOpen]);

  const leaveCount = notifications.filter((i) => i.category === "leave").length;
  const attendanceCount = notifications.filter((i) => i.category === "clock_in" || i.category === "clock_out").length;
  const warningCount = notifications.filter((i) => i.category === "warning").length;

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "warning") return item.category === "warning";
    if (activeTab === "leave") return item.category === "leave";
    if (activeTab === "attendance") return item.category === "clock_in" || item.category === "clock_out";
    return true;
  });

  const name = user?.profile?.full_name ?? user?.email ?? "Admin";
  const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const ALL_PAGES: { href: string; label: string }[] = [
    ...NAV_ITEMS,
    { href: "/admin/settings", label: "Pengaturan" },
    { href: "/admin/support", label: "Pusat Bantuan" },
  ];
  const activeItem = ALL_PAGES.find((i) => pathname === i.href || (i.href !== "/admin" && pathname.startsWith(i.href))) ?? { href: "/admin", label: "Dashboard" };

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
        <div className="flex size-9 items-center justify-center rounded-xl p-1 bg-white/95 dark:bg-white border border-border/80 shadow-2xs">
          <img src="/images/logo_lebah_kreatif-removebg.png" alt="Bee Absensi" className="size-full object-contain" />
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
            <svg className="size-5 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.311.144-.424.084L6.177 5.25a1.875 1.875 0 00-2.278.432l-1.05 1.253a1.875 1.875 0 00-.098 2.316l.72.96c.08.106.096.262.03.42a7.575 7.575 0 000 1.138c.066.158.05.314-.03.42l-.72.96a1.875 1.875 0 00.098 2.316l1.05 1.253a1.875 1.875 0 002.278.432l1.166-.641c.113-.06.258-.031.424.084.31.214.64.405.986.57.182.088.277.228.297.348l.178 1.072c.151.904.933 1.567 1.85 1.567h1.844c.917 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.115-.26.297-.348.346-.165.676-.356.986-.57.166-.115.311-.144.424-.084l1.166.641a1.875 1.875 0 002.278-.432l1.05-1.253a1.875 1.875 0 00.098-2.316l-.72-.96c-.08-.106-.096-.262-.03-.42a7.575 7.575 0 000-1.138c-.066-.158-.05-.314.03-.42l.72-.96a1.875 1.875 0 00-.098-2.316l-1.05-1.253a1.875 1.875 0 00-2.278-.432l-1.166.641c-.113.06-.258.031-.424-.084a7.493 7.493 0 00-.986-.57c-.182-.088-.277-.228-.297-.348l-.178-1.072a1.875 1.875 0 00-1.85-1.567h-1.844zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"/>
            </svg>
          }
        />
        <BottomNavButton
          href="/admin/support"
          label="Support"
          icon={
            <svg className="size-5 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.076-.656-.582-1.15-1.24-1.183a3.46 3.46 0 00-2.458.875.75.75 0 00.998 1.12c.38-.34.88-.517 1.393-.49.317.016.544.238.577.514.041.341-.122.646-.37.896l-.99 1c-.512.518-.768 1.074-.768 1.685v.25a.75.75 0 001.5 0v-.25c0-.285.109-.545.394-.834l.99-1c.548-.553.948-1.306.874-2.183zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z"/>
            </svg>
          }
        />
      </div>

      {/* Divider */}
      <div className="mx-4 mb-2 border-t border-border" />

      {/* User profile at bottom */}
      <div
        onClick={() => router.push("/admin/settings?tab=akun")}
        className="mx-3 mb-4 flex items-center gap-3 rounded-xl px-3 py-2.5 bg-card border border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer transition-all group"
        title="Buka Profil Akun"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold bg-primary group-hover:scale-105 transition-transform shadow-xs">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-foreground group-hover:text-primary transition-colors">{name}</p>
          <p className="truncate text-[11px] text-muted-foreground">System Administrator</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            void signOut();
          }}
          className="flex shrink-0 size-7 items-center justify-center rounded-lg transition-colors text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50"
          title="Keluar"
        >
          <svg className="size-4 fill-current" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5v-2.25a.75.75 0 00-1.5 0v2.25a.5.5 0 01-.5.5h-6a.5.5 0 01-.5-.5V5.25a.5.5 0 01.5-.5h6a.5.5 0 01.5.5v2.25a.75.75 0 001.5 0V5.25a1.5 1.5 0 00-1.5-1.5h-6zm9.72 4.72a.75.75 0 011.06 0l3.75 3.75a.75.75 0 010 1.06l-3.75 3.75a.75.75 0 11-1.06-1.06l2.47-2.47H10.5a.75.75 0 010-1.5h9.19l-2.47-2.47a.75.75 0 010-1.06z"/>
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

            {/* Notification bell & Popover Modal */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((prev) => !prev);
                  if (!notifOpen) void fetchNotifications();
                }}
                className={`relative flex size-9 items-center justify-center rounded-xl transition-all cursor-pointer border ${
                  notifOpen
                    ? "bg-primary/15 border-primary/40 text-primary shadow-xs"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
                title="Pusat Notifikasi"
              >
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>

                {/* Bulet Merah Notifikasi */}
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex min-w-5 h-5 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-sm ring-2 ring-background animate-pulse">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </button>

              {/* Modal Dropdown Notifikasi */}
              {notifOpen && (
                <div className="absolute right-0 mt-2.5 z-50 w-84 sm:w-96 rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-primary" />
                      <span className="text-sm font-bold text-foreground">Notifikasi</span>
                      {pendingCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/15 text-red-600 dark:text-red-400">
                          {pendingCount} Perlu Aksi
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">
                          {notifications.length} Aktivitas
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => void fetchNotifications()}
                      className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer"
                    >
                      Segarkan
                    </button>
                  </div>

                  {/* Filter Tabs */}
                  {notifications.length > 0 && (
                    <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-muted/15 text-[11px] overflow-x-auto">
                      <button
                        type="button"
                        onClick={() => setActiveTab("all")}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer shrink-0 ${
                          activeTab === "all"
                            ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                            : "bg-card hover:bg-muted text-muted-foreground border border-border/60"
                        }`}
                      >
                        Semua ({notifications.length})
                      </button>
                      {warningCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveTab("warning")}
                          className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                            activeTab === "warning"
                              ? "bg-red-500 text-white font-bold shadow-2xs"
                              : "bg-card hover:bg-muted text-red-600 dark:text-red-400 border border-red-500/30"
                          }`}
                        >
                          <span className="size-1.5 rounded-full bg-red-500" />
                          Peringatan ({warningCount})
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setActiveTab("leave")}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer shrink-0 ${
                          activeTab === "leave"
                            ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                            : "bg-card hover:bg-muted text-muted-foreground border border-border/60"
                        }`}
                      >
                        Izin &amp; Cuti ({leaveCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("attendance")}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer shrink-0 ${
                          activeTab === "attendance"
                            ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                            : "bg-card hover:bg-muted text-muted-foreground border border-border/60"
                        }`}
                      >
                        Absensi ({attendanceCount})
                      </button>
                    </div>
                  )}

                  {/* List Notifikasi */}
                  <div className="max-h-[380px] overflow-y-auto divide-y divide-border/60">
                    {filteredNotifications.length === 0 ? (
                      <div className="p-8 text-center space-y-2">
                        <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                          <svg className="size-5 fill-current" viewBox="0 0 24 24">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" />
                          </svg>
                        </div>
                        <p className="text-xs font-bold text-foreground">Tidak Ada Notifikasi</p>
                        <p className="text-[11px] text-muted-foreground">
                          Belum ada aktivitas notifikasi terbaru.
                        </p>
                      </div>
                    ) : (
                      filteredNotifications.map((item) => {
                        const badgeStyle =
                          item.badge_color === "amber"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20"
                            : item.badge_color === "emerald"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                            : item.badge_color === "orange"
                            ? "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20"
                            : item.badge_color === "blue"
                            ? "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20"
                            : item.badge_color === "purple"
                            ? "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/20"
                            : "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20";

                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              setNotifOpen(false);
                              router.push(item.route);
                            }}
                            className={`flex items-start gap-3 p-3.5 hover:bg-muted/60 cursor-pointer transition-colors group ${
                              item.is_pending ? "bg-amber-500/5" : ""
                            }`}
                          >
                            {/* Category Icon */}
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-card border border-border shadow-2xs group-hover:scale-105 transition-transform">
                              {item.category === "warning" ? (
                                <svg className="size-4.5 fill-red-500" viewBox="0 0 24 24">
                                  <path fillRule="evenodd" clipRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                                </svg>
                              ) : item.category === "report" ? (
                                <svg className="size-4.5 fill-blue-500" viewBox="0 0 24 24">
                                  <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
                                </svg>
                              ) : item.category === "leave" ? (
                                <svg className="size-4.5 fill-amber-500" viewBox="0 0 24 24">
                                  <path fillRule="evenodd" clipRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 2.071-1.679 3.75-3.75 3.75H5.625a3.75 3.75 0 01-3.75-3.75V5.25c0-2.071 1.679-3.75 3.75-3.75zm8.25 1.625v3.375c0 .207.168.375.375.375h3.375l-3.75-3.75zM7.5 12a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 12zm0 3.75a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zm0 3.75a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75z" />
                                </svg>
                              ) : item.category === "clock_in" ? (
                                <svg className={`size-4.5 fill-current ${item.badge_color === "orange" ? "text-orange-500" : "text-emerald-500"}`} viewBox="0 0 24 24">
                                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" />
                                </svg>
                              ) : item.category === "clock_out" ? (
                                <svg className="size-4.5 fill-blue-500" viewBox="0 0 24 24">
                                  <path fillRule="evenodd" clipRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5v-2.25a.75.75 0 00-1.5 0v2.25a.5.5 0 01-.5.5h-6a.5.5 0 01-.5-.5V5.25a.5.5 0 01.5-.5h6a.5.5 0 01.5.5v2.25a.75.75 0 001.5 0V5.25a1.5 1.5 0 00-1.5-1.5h-6zm9.72 4.72a.75.75 0 011.06 0l3.75 3.75a.75.75 0 010 1.06l-3.75 3.75a.75.75 0 11-1.06-1.06l2.47-2.47H10.5a.75.75 0 010-1.5h9.19l-2.47-2.47a.75.75 0 010-1.06z" />
                                </svg>
                              ) : (
                                <svg className="size-4.5 fill-purple-500" viewBox="0 0 24 24">
                                  <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.232.75.75 0 00.424-.672v-.003a5.625 5.625 0 00-7.072-5.385 7.12 7.12 0 011.822 6.188z" />
                                </svg>
                              )}
                            </div>

                            {/* Content */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                  {item.title}
                                </p>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold border shrink-0 ${badgeStyle}`}>
                                  {item.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                                {item.description}
                              </p>
                              <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
                                <span>{item.time_formatted}</span>
                                <span className="font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  Lihat Detail →
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
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
