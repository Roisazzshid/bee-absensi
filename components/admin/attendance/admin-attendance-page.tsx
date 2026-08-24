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
  on_time: { label: "Tepat Waktu", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  late: { label: "Terlambat", dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 ring-amber-200" },
  absent: { label: "Belum Hadir", dot: "bg-red-400", badge: "bg-red-50 text-red-600 ring-red-200" },
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

  const formatTime = (t: string | null) =>
    t ? new Date(t).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "—";

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const initials = (name: string) =>
    name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-on-surface md:text-2xl">Monitoring Absensi</h1>
        <p className="mt-0.5 text-sm text-on-surface-variant">Pantau kehadiran seluruh karyawan dan bukti foto selfie</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setPage(1); }}
            className="h-10 rounded-xl border border-outline-variant bg-white pl-9 pr-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>

        <div className="flex gap-1.5 rounded-xl bg-surface-container-low p-1">
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
                  ? "bg-white text-primary shadow-sm ring-1 ring-outline-variant/40"
                  : "text-on-surface-variant hover:text-on-surface",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date label */}
      <p className="text-xs text-on-surface-variant">
        Menampilkan: <span className="font-semibold text-on-surface">{formatDate(date)}</span>
        {pagination && <span> · <span className="font-semibold text-on-surface">{pagination.total}</span> data</span>}
      </p>

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-error ring-1 ring-red-200 flex items-center gap-2">
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
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-surface-container" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 ring-1 ring-outline-variant/40 shadow-sm">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-surface-container-low">
            <svg className="size-7 text-on-surface-variant" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
            </svg>
          </div>
          <p className="mt-3 font-bold text-on-surface">Tidak ada data absensi</p>
          <p className="mt-1 text-sm text-on-surface-variant">Belum ada karyawan yang absen pada tanggal ini</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-hidden rounded-2xl bg-white ring-1 ring-outline-variant/40 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-low/60">
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Karyawan</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Departemen</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Jam Masuk</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Jam Pulang</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Foto Bukti</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {items.map((item) => {
                  const cfg = STATUS_CONFIG[item.status] ?? {
                    label: item.status,
                    dot: "bg-surface-container",
                    badge: "bg-surface-container text-on-surface-variant ring-outline-variant",
                  };
                  return (
                    <tr key={item.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {initials(item.user.full_name)}
                          </div>
                          <div>
                            <p className="font-semibold text-on-surface">{item.user.full_name}</p>
                            <p className="text-[11px] text-on-surface-variant">{item.user.nip}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-on-surface">{item.user.department}</p>
                        <p className="text-[11px] text-on-surface-variant">{item.user.position}</p>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-sm font-semibold text-on-surface">{formatTime(item.clock_in_time)}</td>
                      <td className="px-5 py-3.5 font-mono text-sm font-semibold text-on-surface">{formatTime(item.clock_out_time)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {item.clock_in_image_url ? (
                            <button
                              type="button"
                              onClick={() => setPhotoModal({ item, type: "in" })}
                              className="group/btn relative flex items-center gap-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-2 py-1 text-xs font-semibold text-primary hover:border-primary hover:bg-primary/5 transition-all"
                              title="Lihat Foto Masuk"
                            >
                              <svg className="size-3.5 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                <circle cx="12" cy="13" r="4" />
                              </svg>
                              <span>Masuk</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-on-surface-variant/40">—</span>
                          )}

                          {item.clock_out_image_url ? (
                            <button
                              type="button"
                              onClick={() => setPhotoModal({ item, type: "out" })}
                              className="group/btn relative flex items-center gap-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-2 py-1 text-xs font-semibold text-primary hover:border-primary hover:bg-primary/5 transition-all"
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
                        <span className={["inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1", cfg.badge].join(" ")}>
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
          <div className="md:hidden space-y-2">
            {items.map((item) => {
              const cfg = STATUS_CONFIG[item.status] ?? {
                label: item.status,
                dot: "bg-surface-container",
                badge: "bg-surface-container text-on-surface-variant ring-outline-variant",
              };
              return (
                <div key={item.id} className="rounded-2xl bg-white p-4 ring-1 ring-outline-variant/40 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {initials(item.user.full_name)}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface text-sm">{item.user.full_name}</p>
                        <p className="text-[11px] text-on-surface-variant">{item.user.nip} · {item.user.department}</p>
                      </div>
                    </div>
                    <span className={["shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1", cfg.badge].join(" ")}>
                      <span className={["size-1.5 rounded-full", cfg.dot].join(" ")} />{cfg.label}
                    </span>
                  </div>

                  <div className="mt-3 flex gap-4 text-xs text-on-surface-variant border-t border-outline-variant/20 pt-2">
                    <span className="flex items-center gap-1">
                      Masuk: <span className="font-mono font-bold text-on-surface ml-0.5">{formatTime(item.clock_in_time)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      Pulang: <span className="font-mono font-bold text-on-surface ml-0.5">{formatTime(item.clock_out_time)}</span>
                    </span>
                  </div>

                  {/* Photo buttons on mobile */}
                  {(item.clock_in_image_url || item.clock_out_image_url) && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-on-surface-variant">Bukti Foto:</span>
                      {item.clock_in_image_url && (
                        <button
                          type="button"
                          onClick={() => setPhotoModal({ item, type: "in" })}
                          className="flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-bold text-primary"
                        >
                          📷 Foto Masuk
                        </button>
                      )}
                      {item.clock_out_image_url && (
                        <button
                          type="button"
                          onClick={() => setPhotoModal({ item, type: "out" })}
                          className="flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-bold text-primary"
                        >
                          📷 Foto Pulang
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
          <p className="text-xs text-on-surface-variant">
            Halaman <span className="font-bold text-on-surface">{pagination.current_page}</span> dari{" "}
            <span className="font-bold text-on-surface">{pagination.last_page}</span>
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex items-center gap-1.5 rounded-xl border border-outline-variant bg-white px-4 py-2 text-sm font-semibold text-on-surface disabled:opacity-40 hover:bg-surface-container-low transition-colors"
            >
              <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
              Prev
            </button>
            <button
              disabled={page >= pagination.last_page}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1.5 rounded-xl border border-outline-variant bg-white px-4 py-2 text-sm font-semibold text-on-surface disabled:opacity-40 hover:bg-surface-container-low transition-colors"
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
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between border-b border-outline-variant/30 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-on-surface">
                    Foto Bukti Absen {photoModal.type === "in" ? "Masuk" : "Pulang"}
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    {photoModal.item.user.full_name} ({photoModal.item.user.nip})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPhotoModal(null)}
                className="flex size-8 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-low"
              >
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Photo Container */}
            <div className="bg-black flex items-center justify-center aspect-square w-full overflow-hidden">
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
            <div className="p-4 bg-surface-container-lowest space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Waktu Absensi:</span>
                <span className="font-mono font-bold text-on-surface">
                  {formatDate(photoModal.item.date)} ·{" "}
                  {formatTime(
                    photoModal.type === "in"
                      ? photoModal.item.clock_in_time
                      : photoModal.item.clock_out_time
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Departemen / Jabatan:</span>
                <span className="font-semibold text-on-surface">
                  {photoModal.item.user.department} — {photoModal.item.user.position}
                </span>
              </div>
              {(photoModal.type === "in" ? photoModal.item.clock_in_lat : photoModal.item.clock_out_lat) && (
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Koordinat GPS:</span>
                  <span className="font-mono font-semibold text-primary">
                    {photoModal.type === "in"
                      ? `${photoModal.item.clock_in_lat}, ${photoModal.item.clock_in_long}`
                      : `${photoModal.item.clock_out_lat}, ${photoModal.item.clock_out_long}`}
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-outline-variant/30 flex gap-2">
              <button
                type="button"
                onClick={() => setPhotoModal(null)}
                className="w-full rounded-2xl bg-primary py-2.5 text-xs font-bold text-white hover:opacity-90 transition-opacity"
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
