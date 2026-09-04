"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { API_BASE_URL } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

type AttendanceReportItem = {
  id: number;
  date: string;
  clock_in_time: string | null;
  clock_out_time: string | null;
  clock_in_image_url?: string | null;
  clock_out_image_url?: string | null;
  clock_in_lat?: number | string | null;
  clock_in_long?: number | string | null;
  clock_out_lat?: number | string | null;
  clock_out_long?: number | string | null;
  duration: string | null;
  status: "on_time" | "late" | "absent";
  user: {
    id: number;
    email: string;
    full_name: string;
    nip: string;
    department: string;
    position: string;
  };
};

type ReportSummary = {
  total: number;
  on_time: number;
  late: number;
  absent: number;
};

type Pagination = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const STATUS_CONFIG = {
  on_time: { label: "Tepat Waktu", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  late: { label: "Terlambat", dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 ring-amber-200" },
  absent: { label: "Belum Hadir", dot: "bg-red-400", badge: "bg-red-50 text-red-600 ring-red-200" },
};

export function AdminReportPage() {
  const { request, token } = useAuth();

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  // Period mode: 'yearly' | 'monthly' | 'weekly' | 'daily' | 'custom'
  const [period, setPeriod] = useState<"yearly" | "monthly" | "weekly" | "daily" | "custom">("yearly");

  // Filter params
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());
  const [dailyDate, setDailyDate] = useState<string>(todayStr);

  // Weekly helper (current week Monday to Sunday)
  const getThisWeekRange = () => {
    const d = new Date();
    const day = d.getDay();
    const diffToMon = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d.setDate(diffToMon));
    const sun = new Date(d.setDate(mon.getDate() + 6));
    return {
      start: mon.toISOString().split("T")[0],
      end: sun.toISOString().split("T")[0],
    };
  };

  const initialWeek = getThisWeekRange();
  const [startDate, setStartDate] = useState<string>(initialWeek.start);
  const [endDate, setEndDate] = useState<string>(initialWeek.end);

  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState<number>(50);
  const [page, setPage] = useState(1);

  // Data states
  const [items, setItems] = useState<AttendanceReportItem[]>([]);
  const [summary, setSummary] = useState<ReportSummary>({ total: 0, on_time: 0, late: 0, absent: 0 });
  const [departments, setDepartments] = useState<string[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [periodLabel, setPeriodLabel] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  // Photo modal preview
  const [photoModal, setPhotoModal] = useState<{
    item: AttendanceReportItem;
    type: "in" | "out";
  } | null>(null);

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    params.set("period", period);
    params.set("page", String(page));
    params.set("per_page", String(perPage));

    if (period === "daily") {
      params.set("date", dailyDate);
    } else if (period === "yearly") {
      params.set("year", String(year));
    } else if (period === "monthly") {
      params.set("month", String(month));
      params.set("year", String(year));
    } else if (period === "weekly" || period === "custom") {
      params.set("start_date", startDate);
      params.set("end_date", endDate);
    }

    if (deptFilter) params.set("department", deptFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);

    return params;
  }, [period, page, perPage, dailyDate, month, year, startDate, endDate, deptFilter, statusFilter, search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = buildQueryParams();
      const res = await request<{
        period_label: string;
        start_date: string;
        end_date: string;
        summary: ReportSummary;
        departments: string[];
        attendances: AttendanceReportItem[];
        pagination: Pagination;
      }>(`/admin/reports/preview?${params.toString()}`);

      setItems(res.attendances);
      setSummary(res.summary);
      setDepartments(res.departments);
      setPagination(res.pagination);
      setPeriodLabel(res.period_label);
    } catch {
      setError("Gagal memuat laporan absensi.");
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams, request]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  // Export to spreadsheet (CSV file)
  const handleExport = async () => {
    setExporting(true);
    try {
      const params = buildQueryParams();
      params.delete("page");
      params.delete("per_page");

      const exportUrl = `${API_BASE_URL}/admin/reports/export?${params.toString()}`;

      const res = await fetch(exportUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/csv",
        },
      });

      if (!res.ok) {
        throw new Error("Gagal mengunduh file export");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Extract filename from headers or generate fallback
      const contentDisposition = res.headers.get("content-disposition");
      let filename = `Laporan_Absensi_${period}_${todayStr}.csv`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengunduh laporan spreadsheet.");
    } finally {
      setExporting(false);
    }
  };

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
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
    }
    const parsed = new Date(d);
    return Number.isNaN(parsed.getTime())
      ? d
      : parsed.toLocaleDateString("id-ID", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  };

  const initials = (name: string) =>
    (name || "K").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  const yearsList = [
    now.getFullYear() - 3,
    now.getFullYear() - 2,
    now.getFullYear() - 1,
    now.getFullYear(),
    now.getFullYear() + 1,
    now.getFullYear() + 2,
  ];

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground md:text-2xl">Laporan & Export Absensi</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Rekap dan unduh spreadsheet absensi tahunan, bulanan, mingguan, maupun harian.
          </p>
        </div>

        {/* Export Button */}
        <button
          onClick={() => void handleExport()}
          disabled={exporting || loading}
          className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-all cursor-pointer"
        >
          {exporting ? (
            <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          <span>{exporting ? "Membuat Spreadsheet…" : "Export Spreadsheet (Excel / CSV)"}</span>
        </button>
      </div>

      {/* ── Period Selector Bar ── */}
      <div className="rounded-3xl bg-card border border-border shadow-sm p-5 space-y-4">
        {/* Period Tabs */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar rounded-xl bg-muted p-1">
          {[
            { key: "yearly", label: "Tahunan" },
            { key: "monthly", label: "Bulanan" },
            { key: "weekly", label: "Mingguan" },
            { key: "daily", label: "Harian" },
            { key: "custom", label: "Rentang Kustom" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setPeriod(tab.key as typeof period);
                setPage(1);
              }}
              className={[
                "flex-1 rounded-xl py-3 text-sm font-semibold transition-all",
                period === tab.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Period Inputs */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
          {/* Yearly Picker */}
          {period === "yearly" && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">Pilih Tahun:</span>
              <select
                value={year}
                onChange={(e) => { setYear(Number(e.target.value)); setPage(1); }}
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-semibold text-primary"
              >
                {yearsList.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}

          {/* Monthly Picker */}
          {period === "monthly" && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">Bulan & Tahun:</span>
              <select
                value={month}
                onChange={(e) => { setMonth(Number(e.target.value)); setPage(1); }}
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1}>{name}</option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => { setYear(Number(e.target.value)); setPage(1); }}
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              >
                {yearsList.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}

          {/* Daily Picker */}
          {period === "daily" && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">Pilih Tanggal:</span>
              <input
                type="date"
                value={dailyDate}
                onChange={(e) => { setDailyDate(e.target.value); setPage(1); }}
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>
          )}

          {/* Weekly / Custom Range Picker */}
          {(period === "weekly" || period === "custom") && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">Dari:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
              <span className="text-xs font-bold text-muted-foreground">Sampai:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
              {period === "weekly" && (
                <button
                  type="button"
                  onClick={() => {
                    const range = getThisWeekRange();
                    setStartDate(range.start);
                    setEndDate(range.end);
                    setPage(1);
                  }}
                  className="h-10 rounded-xl bg-primary/10 px-3 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
                >
                  Minggu Ini
                </button>
              )}
            </div>
          )}

          {/* Department Filter */}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            >
              <option value="">Semua Departemen</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            >
              <option value="">Semua Status</option>
              <option value="on_time">Tepat Waktu</option>
              <option value="late">Terlambat</option>
              <option value="absent">Belum Absen</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Cari nama atau NIP karyawan…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>
          <button type="submit" className="h-10 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity">
            Cari
          </button>
        </form>
      </div>

      {/* ── Summary Stats Cards ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-5 shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-primary" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary">Total Kehadiran</span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-3xl font-black text-foreground">{summary.total}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Data absensi tercatat</p>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-5 shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-500">Tepat Waktu</span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-500">
              <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-3xl font-black text-foreground">{summary.on_time}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {summary.total > 0 ? Math.round((summary.on_time / summary.total) * 100) : 0}% dari total
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-5 shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-500">Terlambat</span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-500">
              <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-3xl font-black text-foreground">{summary.late}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {summary.total > 0 ? Math.round((summary.late / summary.total) * 100) : 0}% dari total
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-5 shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-red-600" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-600 dark:text-red-500">Belum Hadir</span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-red-500/20 text-red-600 dark:text-red-500">
              <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-3xl font-black text-foreground">{summary.absent}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Perlu tindak lanjut</p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 dark:bg-red-950/50 p-4 text-sm text-red-600 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-900/50 flex items-center gap-2">
          <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* ── Table Preview ── */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Preview Data {periodLabel && <span className="text-primary font-bold">({periodLabel.replace(/_/g, " ")})</span>}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Tampilkan:</span>
              <select
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value={15}>15 baris</option>
                <option value={25}>25 baris</option>
                <option value={50}>50 baris</option>
                <option value={100}>100 baris</option>
              </select>
            </div>
            {pagination && (
              <p className="text-xs text-muted-foreground">
                Total <span className="font-bold text-foreground">{pagination.total}</span> data
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-card border border-border py-16 shadow-sm">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
              <svg className="size-7 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="mt-3 font-bold text-foreground">Tidak ada data absensi</p>
            <p className="mt-1 text-sm text-muted-foreground">Tidak ada data untuk filter periode yang dipilih.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden rounded-3xl bg-card border border-border shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Tanggal</th>
                    <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Karyawan</th>
                    <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Departemen</th>
                    <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Masuk</th>
                    <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Pulang</th>
                    <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Foto Bukti</th>
                    <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Durasi</th>
                    <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item) => {
                    const cfg = STATUS_CONFIG[item.status] ?? {
                      label: item.status,
                      dot: "bg-muted",
                      badge: "bg-muted text-muted-foreground ring-border",
                    };
                    return (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3.5 font-medium text-xs text-foreground">
                          {formatDate(item.date)}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {initials(item.user.full_name)}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-xs">{item.user.full_name}</p>
                              <p className="text-[10px] text-muted-foreground">{item.user.nip}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-foreground">
                          <p>{item.user.department}</p>
                          <p className="text-[10px] text-muted-foreground">{item.user.position}</p>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs font-semibold text-foreground">
                          {formatTime(item.clock_in_time)}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs font-semibold text-foreground">
                          {formatTime(item.clock_out_time)}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {item.clock_in_image_url ? (
                              <button
                                type="button"
                                onClick={() => setPhotoModal({ item, type: "in" })}
                                className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-0.5 text-[11px] font-semibold text-primary hover:border-primary hover:bg-primary/5 transition-all"
                              >
                                📷 Masuk
                              </button>
                            ) : null}
                            {item.clock_out_image_url ? (
                              <button
                                type="button"
                                onClick={() => setPhotoModal({ item, type: "out" })}
                                className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-0.5 text-[11px] font-semibold text-primary hover:border-primary hover:bg-primary/5 transition-all"
                              >
                                📷 Pulang
                              </button>
                            ) : null}
                            {!item.clock_in_image_url && !item.clock_out_image_url && (
                              <span className="text-[11px] text-muted-foreground/40">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground">
                          {item.duration ?? "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={["inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 dark:ring-0", cfg.badge].join(" ")}>
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-2">
              {items.map((item) => {
                const cfg = STATUS_CONFIG[item.status] ?? {
                  label: item.status,
                  dot: "bg-muted",
                  badge: "bg-muted text-muted-foreground ring-border",
                };
                return (
                  <div key={item.id} className="rounded-3xl bg-card border border-border shadow-sm p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {initials(item.user.full_name)}
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-xs">{item.user.full_name}</p>
                          <p className="text-[10px] text-muted-foreground">{item.user.nip} · {item.user.department}</p>
                        </div>
                      </div>
                      <span className={["shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 dark:ring-0", cfg.badge].join(" ")}>
                        <span className={["size-1.5 rounded-full", cfg.dot].join(" ")} />
                        {cfg.label}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-2 text-[11px] text-muted-foreground">
                      <div>
                        <p className="text-[10px] opacity-60">Tanggal</p>
                        <p className="font-semibold text-foreground">{formatDate(item.date)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] opacity-60">Masuk - Pulang</p>
                        <p className="font-mono font-semibold text-foreground">{formatTime(item.clock_in_time)} - {formatTime(item.clock_out_time)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] opacity-60">Durasi</p>
                        <p className="font-semibold text-foreground">{item.duration ?? "—"}</p>
                      </div>
                    </div>

                    {(item.clock_in_image_url || item.clock_out_image_url) && (
                      <div className="mt-2.5 flex items-center gap-2 border-t border-border/50 pt-2">
                        <span className="text-[10px] font-bold text-muted-foreground">Foto:</span>
                        {item.clock_in_image_url && (
                          <button
                            type="button"
                            onClick={() => setPhotoModal({ item, type: "in" })}
                            className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary"
                          >
                            📷 Masuk
                          </button>
                        )}
                        {item.clock_out_image_url && (
                          <button
                            type="button"
                            onClick={() => setPhotoModal({ item, type: "out" })}
                            className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary"
                          >
                            📷 Pulang
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
      </div>

      {/* ── Pagination ── */}
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
              className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground disabled:opacity-40 hover:bg-muted transition-colors"
            >
              <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
              Prev
            </button>
            <button
              disabled={page >= pagination.last_page}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground disabled:opacity-40 hover:bg-muted transition-colors"
            >
              Next
              <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
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
                <span className="text-muted-foreground">Departemen:</span>
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

            <div className="p-4 border-t border-border">
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
