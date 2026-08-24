"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { useCallback, useEffect, useState } from "react";


type AttendanceItem = {
  id: number;
  date: string;
  status: "on_time" | "late" | "absent";
  clock_in_time: string | null;
  clock_out_time: string | null;
  user: {
    id: number;
    email: string;
    full_name: string;
    nip: string;
    department: string;
    position: string;
  };
};

type Pagination = { current_page: number; last_page: number; per_page: number; total: number };

const STATUS_MAP = {
  on_time: { label: "Tepat Waktu", cls: "bg-green-100 text-green-700" },
  late: { label: "Terlambat", cls: "bg-amber-100 text-amber-700" },
  absent: { label: "Tidak Hadir", cls: "bg-red-100 text-red-700" },
};

export function AdminAttendancePage() {
  const { request } = useAuth();

  const [items, setItems] = useState<AttendanceItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

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
    if (!t) return "-";
    return new Date(t).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">📋 Monitoring Absensi</h1>
        <p className="mt-1 text-sm text-on-surface-variant">Pantau kehadiran seluruh karyawan</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">Tanggal</label>
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setPage(1); }}
            className="rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Semua Status</option>
            <option value="on_time">Tepat Waktu</option>
            <option value="late">Terlambat</option>
          </select>
        </div>
      </div>

      {/* Date label */}
      <p className="text-xs text-on-surface-variant">Menampilkan data: <span className="font-semibold text-on-surface">{formatDate(date)}</span></p>

      {/* Error */}
      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-error ring-1 ring-red-200">⚠️ {error}</div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-outline-variant/40">
        {loading ? (
          <div className="p-8 text-center">
            <div className="mx-auto size-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
            <p className="mt-3 text-sm text-on-surface-variant">Memuat data…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-4xl">📭</p>
            <p className="mt-2 font-bold text-on-surface">Tidak ada data</p>
            <p className="text-sm text-on-surface-variant">Belum ada absensi untuk tanggal ini</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/40 bg-surface-container-low">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-on-surface-variant">Karyawan</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-on-surface-variant">Departemen</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-on-surface-variant">Masuk</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-on-surface-variant">Pulang</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-on-surface-variant">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {items.map((item) => {
                  const st = STATUS_MAP[item.status] ?? { label: item.status, cls: "bg-surface-container text-on-surface-variant" };
                  return (
                    <tr key={item.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-on-surface">{item.user.full_name}</p>
                        <p className="text-[11px] text-on-surface-variant">{item.user.nip}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-on-surface">{item.user.department}</p>
                        <p className="text-[11px] text-on-surface-variant">{item.user.position}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-on-surface">{formatTime(item.clock_in_time)}</td>
                      <td className="px-4 py-3 font-mono text-on-surface">{formatTime(item.clock_out_time)}</td>
                      <td className="px-4 py-3">
                        <span className={["inline-block rounded-full px-2.5 py-1 text-xs font-bold", st.cls].join(" ")}>
                          {st.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-on-surface-variant">
            {pagination.total} data · Halaman {pagination.current_page} dari {pagination.last_page}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="rounded-xl border border-outline-variant px-4 py-2 text-sm font-bold text-on-surface disabled:opacity-40 hover:bg-surface-container-low"
            >
              ← Prev
            </button>
            <button
              disabled={page >= pagination.last_page}
              onClick={() => setPage(p => p + 1)}
              className="rounded-xl border border-outline-variant px-4 py-2 text-sm font-bold text-on-surface disabled:opacity-40 hover:bg-surface-container-low"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
