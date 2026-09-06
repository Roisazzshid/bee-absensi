"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { useLanguage } from "@/lib/language-context";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";

export type UserNotificationItem = {
  id: string;
  category: "leave" | "reminder" | "attendance" | "info";
  title: string;
  description: string;
  badge: string;
  badge_color: "amber" | "emerald" | "orange" | "blue" | "purple" | "red";
  timestamp: string;
  time_formatted: string;
  route: string;
  is_important: boolean;
};

const STORAGE_KEY_USER_READ_NOTIFS = "bee_user_read_notif_ids";

export function UserNotification() {
  const { request } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<UserNotificationItem[]>([]);
  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "leave" | "reminder" | "attendance">("all");
  const notifRef = useRef<HTMLDivElement>(null);

  // Muat ID notifikasi yang sudah dibaca dari localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER_READ_NOTIFS);
      if (saved) {
        setReadNotifIds(JSON.parse(saved));
      }
    } catch {
      // Abaikan jika localStorage tidak tersedia
    }
  }, []);

  const markAllAsRead = useCallback((itemsToMark?: UserNotificationItem[]) => {
    const list = itemsToMark ?? notifications;
    if (list.length === 0) return;
    const allIds = list.map((n) => n.id);
    setReadNotifIds((prev) => {
      const updated = Array.from(new Set([...prev, ...allIds]));
      try {
        localStorage.setItem(STORAGE_KEY_USER_READ_NOTIFS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, [notifications]);

  const markAsRead = useCallback((id: string) => {
    setReadNotifIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY_USER_READ_NOTIFS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const fetchNotifications = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await request<{
        unread_alert_count?: number;
        total_notifications?: number;
        notifications?: UserNotificationItem[];
      }>("/notifications");
      if (res && res.notifications) {
        setNotifications(res.notifications);
      }
    } catch {
      // ignore silently
    } finally {
      if (isManual) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
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

  const handleToggleNotif = useCallback(() => {
    setNotifOpen((prev) => {
      const next = !prev;
      if (next) {
        // Saat dibuka, otomatis tandai semua notifikasi saat ini sebagai sudah dilihat
        markAllAsRead();
        void fetchNotifications();
      }
      return next;
    });
  }, [fetchNotifications, markAllAsRead]);

  // Hitung notifikasi penting yang belum pernah dibaca
  const unreadAlerts = notifications.filter(
    (i) => i.is_important && !readNotifIds.includes(i.id)
  );
  const unreadCount = unreadAlerts.length;

  const leaveCount = notifications.filter((i) => i.category === "leave").length;
  const reminderCount = notifications.filter((i) => i.category === "reminder").length;
  const attendanceCount = notifications.filter((i) => i.category === "attendance").length;

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "leave") return item.category === "leave";
    if (activeTab === "reminder") return item.category === "reminder";
    if (activeTab === "attendance") return item.category === "attendance";
    return true;
  });

  return (
    <div className="relative" ref={notifRef}>
      {/* Notification Bell Button */}
      <button
        type="button"
        onClick={handleToggleNotif}
        className={`relative flex size-9 items-center justify-center rounded-xl transition-all cursor-pointer border ${
          notifOpen
            ? "bg-primary/15 border-primary/40 text-primary shadow-xs"
            : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted/60"
        }`}
        title="Pusat Notifikasi"
        aria-label="Pusat Notifikasi"
      >
        <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>

        {/* Bulet Merah Badge Notifikasi */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex min-w-5 h-5 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-sm ring-2 ring-background animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Modal Dropdown */}
      {notifOpen && (
        <div className="absolute right-0 mt-2.5 z-50 w-84 sm:w-96 rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <div className={`size-2 rounded-full ${unreadCount > 0 ? "bg-red-500 animate-pulse" : "bg-primary"}`} />
              <span className="text-sm font-bold text-foreground">{t("my_notifications")}</span>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/15 text-red-600 dark:text-red-400">
                  {unreadCount} {t("new_badge", "Baru")}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">
                  {notifications.length} {t("activities")}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsRead()}
                  className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition cursor-pointer"
                  title={t("mark_read")}
                >
                  {t("mark_read")}
                </button>
              )}
              <button
                type="button"
                disabled={isRefreshing}
                onClick={() => void fetchNotifications(true)}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold text-primary hover:bg-primary/10 transition cursor-pointer disabled:opacity-50"
                title={t("refresh")}
              >
                <svg
                  className={`size-3.5 ${isRefreshing ? "animate-spin text-primary" : "text-primary"}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span>{isRefreshing ? t("refreshing") : t("refresh")}</span>
              </button>
            </div>
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
                {t("tab_all")} ({notifications.length})
              </button>
              {leaveCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("leave")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer shrink-0 ${
                    activeTab === "leave"
                      ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                      : "bg-card hover:bg-muted text-muted-foreground border border-border/60"
                  }`}
                >
                  {t("tab_leave")} ({leaveCount})
                </button>
              )}
              {reminderCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("reminder")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer shrink-0 ${
                    activeTab === "reminder"
                      ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                      : "bg-card hover:bg-muted text-muted-foreground border border-border/60"
                  }`}
                >
                  {t("tab_reminder")} ({reminderCount})
                </button>
              )}
              {attendanceCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("attendance")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer shrink-0 ${
                    activeTab === "attendance"
                      ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                      : "bg-card hover:bg-muted text-muted-foreground border border-border/60"
                  }`}
                >
                  {t("tab_attendance")} ({attendanceCount})
                </button>
              )}
            </div>
          )}

          {/* List Notifikasi */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border/60">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <svg className="size-5 fill-current" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                    />
                  </svg>
                </div>
                <p className="text-xs font-bold text-foreground">{t("no_notifications")}</p>
                <p className="text-[11px] text-muted-foreground">
                  {t("no_user_notif_desc")}
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const isRead = readNotifIds.includes(item.id);
                const isUnreadAlert = item.is_important && !isRead;

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
                      markAsRead(item.id);
                      setNotifOpen(false);
                      router.push(item.route);
                    }}
                    className={`flex items-start gap-3 p-3.5 hover:bg-muted/60 cursor-pointer transition-colors group ${
                      isUnreadAlert ? "bg-amber-500/10 dark:bg-amber-500/15 border-l-2 border-amber-500" : isRead ? "opacity-80" : ""
                    }`}
                  >
                    {/* Category Icon */}
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-card border border-border shadow-2xs group-hover:scale-105 transition-transform">
                      {item.category === "leave" ? (
                        <svg className="size-4.5 fill-amber-500" viewBox="0 0 24 24">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 2.071-1.679 3.75-3.75 3.75H5.625a3.75 3.75 0 01-3.75-3.75V5.25c0-2.071 1.679-3.75 3.75-3.75zm8.25 1.625v3.375c0 .207.168.375.375.375h3.375l-3.75-3.75zM7.5 12a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 12zm0 3.75a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zm0 3.75a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75z"
                          />
                        </svg>
                      ) : item.category === "reminder" ? (
                        <svg
                          className={`size-4.5 fill-current ${
                            item.badge_color === "orange" ? "text-orange-500" : "text-blue-500"
                          }`}
                          viewBox="0 0 24 24"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
                          />
                        </svg>
                      ) : item.category === "attendance" ? (
                        <svg
                          className={`size-4.5 fill-current ${
                            item.badge_color === "blue" ? "text-blue-500" : item.badge_color === "orange" ? "text-orange-500" : "text-emerald-500"
                          }`}
                          viewBox="0 0 24 24"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                          />
                        </svg>
                      ) : (
                        <svg className="size-4.5 fill-purple-500" viewBox="0 0 24 24">
                          <path d="M12 2.25a.75.75 0 01.75.75v.759a8.999 8.999 0 017.5 7.5h.75a.75.75 0 010 1.5h-.75a8.999 8.999 0 01-7.5 7.5v.741a.75.75 0 01-1.5 0v-.741a8.999 8.999 0 01-7.5-7.5h-.75a.75.75 0 010-1.5h.75a8.999 8.999 0 017.5-7.5V3a.75.75 0 01.75-.75zM12 6a6 6 0 100 12 6 6 0 000-12z" />
                        </svg>
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {item.title}
                        </p>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold border shrink-0 ${badgeStyle}`}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
                        <span>{item.time_formatted}</span>
                        <span className="font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          {t("open_page")}
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
  );
}
