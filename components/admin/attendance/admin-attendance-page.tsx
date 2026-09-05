"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { useCallback, useEffect, useState } from "react";

type AttendanceItem = {
  id: number;
  date: string;
  status: "on_time" | "late" | "absent";
  clock_in_time: string | null;
  clock_out_time: string | null;
  clock_in_image_url?: string | null;
  clock_out_image_url?: string | null;
  clock_in_lat?: number | string | null;
  clock_in_long?: number | string | null;
  clock_out_lat?: number | string | null;
  clock_out_long?: number | string | null;
  user: { id: number; email: string; full_name: string; nip: string; department: string; position: string };
};

type Pagination = { current_page: number; last_page: number; per_page: number; total: number };

const STATUS_CONFIG = {
  on_time: { label: "Tepat Waktu", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-500 dark:ring-0" },
  late: { label: "Terlambat", dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/20 dark:text-amber-500 dark:ring-0" },
  absent: { label: "Belum Hadir", dot: "bg-red-400", badge: "bg-red-50 text-red-600 ring-red-200 dark:bg-red-500/20 dark:text-red-500 dark:ring-0" },
};

export function AdminAttendancePage() {
  const { request } = useAuth();
  const [items, setItems] = useState<AttendanceItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // Photo modal preview
  const [photoModal, setPhotoModal] = useState<{
    item: AttendanceItem;
    type: "in" | "out";
  } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ date, per_page: "20", page: String(page) });
      if (statusFilter) params.set("status", statusFilter);
      const res = await request<{ attendances: AttendanceItem[]; pagination: Pagination }>(
        `/admin/attendances?${params.toString()}`
      );
      setItems(res.attendances);
      setPagination(res.pagination);
    } catch {
      setError("Gagal memuat data absensi.");
    } finally {
      setLoading(false);
    }
  }, [date, statusFilter, page, request]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  const formatTime = (t: string | null) => {
    if (!t) return "—";
    const safeStr = t.includes(" ") && !t.includes("T") ? t.replace(" ", "T") : t;
    const d = new Date(safeStr);
    return Number.isNaN(d.getTime())
      ? t.slice(11, 16) || t
      : d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (d: string) => {
    if (!d) return "—";
    const datePart = d.includes("T") ? d.split("T")[0] : d.split(" ")[0];
    const parts = datePart.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const localD = new Date(year, month, day);
        return localD.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
    }
    const parsed = new Date(d);
    return Number.isNaN(parsed.getTime())
      ? d
      : parsed.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
  };

  const initials = (name: string) =>
    (name || "K").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground md:text-2xl">Monitoring Absensi</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Pantau kehadiran seluruh karyawan dan bukti foto selfie</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setPage(1); }}
            className="h-10 rounded-xl border border-border bg-background pl-9 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>

        <div className="flex gap-1.5 rounded-xl bg-muted p-1">
          {[
            { val: "", label: "Semua" },
            { val: "on_time", label: "Tepat Waktu" },
            { val: "late", label: "Terlambat" },
          ].map((opt) => (
            <button
              key={opt.val}
              onClick={() => { setStatusFilter(opt.val); setPage(1); }}
              className={[
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                statusFilter === opt.val
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date label */}
      <p className="text-xs text-muted-foreground">
        Menampilkan: <span className="font-semibold text-foreground">{formatDate(date)}</span>
        {pagination && <span> · <span className="font-semibold text-foreground">{pagination.total}</span> data</span>}
      </p>

      {error && (
        <div className="rounded-2xl bg-red-50 dark:bg-red-950/50 p-4 text-sm text-red-600 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-900/50 flex items-center gap-2">
          <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="relative overflow-hidden flex flex-col items-center justify-center rounded-3xl bg-card border border-border py-16 shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-primary" />
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <svg className="size-7 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
            </svg>
          </div>
          <p className="mt-3 font-bold text-foreground">Tidak ada data absensi</p>
          <p className="mt-1 text-sm text-muted-foreground">Belum ada karyawan yang absen pada tanggal ini</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="relative overflow-hidden hidden md:block rounded-3xl bg-card border border-border shadow-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-primary" />
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Karyawan</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Departemen</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Jam Masuk</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Jam Pulang</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Foto Bukti</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => {
                  const cfg = STATUS_CONFIG[item.status] ?? {
                    label: item.status,
                    dot: "bg-muted",
                    badge: "bg-muted text-muted-foreground ring-border dark:ring-0",
                  };
                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {initials(item.user.full_name)}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{item.user.full_name}</p>
                            <p className="text-[11px] text-muted-foreground">{item.user.nip}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-foreground">{item.user.department}</p>
                        <p className="text-[11px] text-muted-foreground">{item.user.position}</p>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-sm font-semibold text-foreground">{formatTime(item.clock_in_time)}</td>
                      <td className="px-5 py-3.5 font-mono text-sm font-semibold text-foreground">{formatTime(item.clock_out_time)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {item.clock_in_image_url ? (
                            <button
                              type="button"
                              onClick={() => setPhotoModal({ item, type: "in" })}
                              className="group/btn relative flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold text-primary hover:border-primary hover:bg-primary/5 transition-all"
                              title="Lihat Foto Masuk"
                            >
                              <svg className="size-3.5 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                <circle cx="12" cy="13" r="4" />
                              </svg>
                              <span>Masuk</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-muted-foreground/40">—</span>
                          )}

                          {item.clock_out_image_url ? (
                            <button
                              type="button"
                              onClick={() => setPhotoModal({ item, type: "out" })}
                              className="group/btn relative flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold text-primary hover:border-primary hover:bg-primary/5 transition-all"
                              title="Lihat Foto Pulang"
                            >
                              <svg className="size-3.5 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                <circle cx="12" cy="13" r="4" />
                              </svg>
                              <span>Pulang</span>
                            </button>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={["inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 dark:ring-0", cfg.badge].join(" ")}>
                          <span className={["size-1.5 rounded-full", cfg.dot].join(" ")} />
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {items.map((item) => {
              const cfg = STATUS_CONFIG[item.status] ?? {
                label: item.status,
                dot: "bg-muted",
                badge: "bg-muted text-muted-foreground ring-border dark:ring-0",
              };
              return (
                <div key={item.id} className="relative overflow-hidden flex flex-col gap-3 rounded-3xl border border-border bg-card shadow-sm p-4">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-primary" />
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {initials(item.user.full_name)}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">{item.user.full_name}</p>
                        <p className="text-[11px] text-muted-foreground">{item.user.nip} · {item.user.department}</p>
                      </div>
                    </div>
                    <span className={["shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 dark:ring-0", cfg.badge].join(" ")}>
                      <span className={["size-1.5 rounded-full", cfg.dot].join(" ")} />{cfg.label}
                    </span>
                  </div>

                  <div className="mt-3 flex gap-4 text-xs text-muted-foreground border-t border-border/50 pt-2">
                    <span className="flex items-center gap-1">
                      Masuk: <span className="font-mono font-bold text-foreground ml-0.5">{formatTime(item.clock_in_time)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      Pulang: <span className="font-mono font-bold text-foreground ml-0.5">{formatTime(item.clock_out_time)}</span>
                    </span>
                  </div>

                  {/* Photo buttons on mobile */}
                  {(item.clock_in_image_url || item.clock_out_image_url) && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground">Bukti Foto:</span>
                      {item.clock_in_image_url && (
                        <button
                          type="button"
                          onClick={() => setPhotoModal({ item, type: "in" })}
                          className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-bold text-primary hover:bg-primary/20 transition-colors"
                        >
                          <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 9a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M9.344 3.071a2.25 2.25 0 012.112-1.321h1.088a2.25 2.25 0 012.112 1.321l.666 1.679h3.54a2.25 2.25 0 012.25 2.25v12a2.25 2.25 0 01-2.25 2.25H3.75a2.25 2.25 0 01-2.25-2.25v-12a2.25 2.25 0 012.25-2.25h3.54l.666-1.679h1.138zM12 7.5a5.25 5.25 0 100 10.5 5.25 5.25 0 000-10.5z"/>
                          </svg>
                          Foto Masuk
                        </button>
                      )}
                      {item.clock_out_image_url && (
                        <button
                          type="button"
                          onClick={() => setPhotoModal({ item, type: "out" })}
                          className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-bold text-primary hover:bg-primary/20 transition-colors"
                        >
                          <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 9a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M9.344 3.071a2.25 2.25 0 012.112-1.321h1.088a2.25 2.25 0 012.112 1.321l.666 1.679h3.54a2.25 2.25 0 012.25 2.25v12a2.25 2.25 0 01-2.25 2.25H3.75a2.25 2.25 0 01-2.25-2.25v-12a2.25 2.25 0 012.25-2.25h3.54l.666-1.679h1.138zM12 7.5a5.25 5.25 0 100 10.5 5.25 5.25 0 000-10.5z"/>
                          </svg>
                          Foto Pulang
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Halaman <span className="font-bold text-foreground">{pagination.current_page}</span> dari{" "}
            <span className="font-bold text-foreground">{pagination.last_page}</span>
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-40 hover:bg-muted transition-colors"
            >
              <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
              Prev
            </button>
            <button
              disabled={page >= pagination.last_page}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-40 hover:bg-muted transition-colors"
            >
              Next
              <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Photo Proof Modal ── */}
      {photoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-background border border-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Foto Bukti Absen {photoModal.type === "in" ? "Masuk" : "Pulang"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {photoModal.item.user.full_name} ({photoModal.item.user.nip})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPhotoModal(null)}
                className="flex size-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted"
              >
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Photo Container */}
            <div className="bg-black/90 flex items-center justify-center aspect-square w-full overflow-hidden">
              <img
                src={
                  photoModal.type === "in"
                    ? photoModal.item.clock_in_image_url ?? ""
                    : photoModal.item.clock_out_image_url ?? ""
                }
                alt={`Bukti Selfie ${photoModal.item.user.full_name}`}
                className="size-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/600x600?text=Foto+Tidak+Tersedia";
                }}
              />
            </div>

            {/* Info details */}
            <div className="p-4 bg-muted/30 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Waktu Absensi:</span>
                <span className="font-mono font-bold text-foreground">
                  {formatDate(photoModal.item.date)} ·{" "}
                  {formatTime(
                    photoModal.type === "in"
                      ? photoModal.item.clock_in_time
                      : photoModal.item.clock_out_time
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Departemen / Jabatan:</span>
                <span className="font-semibold text-foreground">
                  {photoModal.item.user.department} — {photoModal.item.user.position}
                </span>
              </div>
              {(photoModal.type === "in" ? photoModal.item.clock_in_lat : photoModal.item.clock_out_lat) && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Koordinat GPS:</span>
                  <span className="font-mono font-semibold text-primary">
                    {photoModal.type === "in"
                      ? `${photoModal.item.clock_in_lat}, ${photoModal.item.clock_in_long}`
                      : `${photoModal.item.clock_out_lat}, ${photoModal.item.clock_out_long}`}
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border flex gap-2">
              <button
                type="button"
                onClick={() => setPhotoModal(null)}
                className="w-full rounded-2xl bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
