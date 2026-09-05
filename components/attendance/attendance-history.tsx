"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui";
import { ApiError } from "@/lib/api";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AttendanceStatus = "on_time" | "late" | "absent";

type AttendanceRecord = {
  id: number;
  date: string;
  clock_in_time: string | null;
  clock_out_time: string | null;
  status: AttendanceStatus;
};

type Summary = { on_time: number; late: number; absent: number; total: number };

type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

type HistoryData = {
  summary: Summary;
  month: string;
  attendances: AttendanceRecord[];
  pagination: PaginationMeta;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(value: string | null): string {
  if (!value) return "--:--";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value.slice(11, 16) || "--:--";
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

function fmtDate(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    // Ambil hanya bagian tanggal (YYYY-MM-DD) — potong jika ada bagian waktu
    const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr.split(" ")[0];
    const d = new Date(datePart + "T00:00:00");
    if (Number.isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
}


function monthLabel(ym: string): string {
  const [year, month] = ym.split("-");
  return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(
    new Date(Number(year), Number(month) - 1, 1)
  );
}

function addMonth(ym: string, delta: number): string {
  const [year, month] = ym.split("-").map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function currentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; border: string; badge: string; text: string }
> = {
  on_time: {
    label: "Tepat Waktu",
    border: "border-l-emerald-500",
    badge: "bg-emerald-500/10 border border-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-500",
  },
  late: {
    label: "Terlambat",
    border: "border-l-red-500",
    badge: "bg-red-500/10 border border-red-500/20",
    text: "text-red-600 dark:text-red-500",
  },
  absent: {
    label: "Tidak Hadir",
    border: "border-l-primary",
    badge: "bg-primary/10 border border-primary/20",
    text: "text-primary",
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryCard({
  value,
  label,
  colorClass,
  borderClass,
}: {
  value: number;
  label: string;
  colorClass: string;
  borderClass: string;
}) {
  return (
    <div
      className={`shadow-sm flex flex-col items-center justify-center rounded-2xl border-l-4 bg-card border border-border p-4 text-center ${borderClass}`}
    >
      <span className={`text-3xl font-bold leading-none ${colorClass}`}>{value}</span>
      <span className="mt-1 text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

function AttendanceItem({ record }: { record: AttendanceRecord }) {
  const cfg = STATUS_CONFIG[record.status] ?? STATUS_CONFIG.absent;
  const noData = !record.clock_in_time && !record.clock_out_time;

  return (
    <div
      className={`shadow-sm relative flex items-center justify-between overflow-hidden rounded-2xl border-l-4 bg-card border border-border p-4 ${cfg.border}`}
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">{fmtDate(record.date)}</span>
        <div className={`mt-1 flex items-center gap-4 ${noData ? "opacity-50" : ""}`}>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Masuk
            </span>
            <span className="text-xl font-bold leading-none text-foreground">
              {fmtTime(record.clock_in_time)}
            </span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Pulang
            </span>
            <span className="text-xl font-bold leading-none text-foreground">
              {fmtTime(record.clock_out_time)}
            </span>
          </div>
        </div>
      </div>

      <div className={`rounded-full px-3 py-1 ${cfg.badge}`}>
        <span className={`text-xs font-bold uppercase tracking-wide ${cfg.text}`}>
          {cfg.label}
        </span>
      </div>
    </div>
  );
}

function EmptyState({ month }: { month: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground/80">
        <svg className="size-8 fill-current" viewBox="0 0 24 24">
          <path fillRule="evenodd" clipRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75A3.75 3.75 0 0122.5 8.25v10.5A3.75 3.75 0 0118.75 22.5H5.25A3.75 3.75 0 011.5 18.75V8.25A3.75 3.75 0 015.25 4.5H6V3a.75.75 0 01.75-.75zm14.25 7.5H3v9a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 19.5v-9z"/>
        </svg>
      </div>
      <p className="text-sm font-semibold text-foreground">Tidak ada data untuk {monthLabel(month)}</p>
      <p className="text-xs">Coba pilih bulan lain atau hapus filter status.</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AttendanceHistory() {
  const { request } = useAuth();
  const today = currentYearMonth();

  const [month, setMonth] = useState(today);
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | "">("");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<Summary>({ on_time: 0, late: 0, absent: 0, total: 0 });
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageRef = useRef(1);

  const fetchPage = useCallback(
    async (targetMonth: string, status: AttendanceStatus | "", page: number) => {
      const params = new URLSearchParams({ month: targetMonth, page: String(page), per_page: "10" });
      if (status) params.set("status", status);
      return request<HistoryData>(`/attendance?${params.toString()}`);
    },
    [request]
  );

  const load = useCallback(
    async (targetMonth: string, status: AttendanceStatus | "") => {
      setLoading(true);
      setError(null);
      pageRef.current = 1;
      try {
        const data = await fetchPage(targetMonth, status, 1);
        setRecords(data.attendances);
        setSummary(data.summary);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Gagal memuat riwayat kehadiran.");
      } finally {
        setLoading(false);
      }
    },
    [fetchPage]
  );

  const loadMore = useCallback(async () => {
    if (!pagination || pagination.current_page >= pagination.last_page) return;
    const nextPage = pageRef.current + 1;
    setLoadingMore(true);
    try {
      const data = await fetchPage(month, statusFilter, nextPage);
      setRecords((prev) => [...prev, ...data.attendances]);
      setPagination(data.pagination);
      pageRef.current = nextPage;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat lebih banyak data.");
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, month, pagination, statusFilter]);

  useEffect(() => {
    void load(month, statusFilter);
  }, [load, month, statusFilter]);

  const canGoNext = month < today;

  const filterOptions: { key: AttendanceStatus | ""; label: string }[] = [
    { key: "", label: "Semua" },
    { key: "on_time", label: "Tepat Waktu" },
    { key: "late", label: "Terlambat" },
    { key: "absent", label: "Tidak Hadir" },
  ];

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Riwayat Kehadiran</h1>
        <p className="mt-1 text-sm text-muted-foreground">Rekap absensi Anda per bulan.</p>
      </div>

      {/* Month navigator */}
      <div className="flex items-center gap-3">
        <button
          id="btn-prev-month"
          onClick={() => setMonth((m) => addMonth(m, -1))}
          className="pressable flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-lg text-muted-foreground transition hover:bg-muted"
          aria-label="Bulan sebelumnya"
        >
          ‹
        </button>
        <span className="flex-1 text-center text-sm font-bold text-foreground">
          {monthLabel(month)}
        </span>
        <button
          id="btn-next-month"
          onClick={() => setMonth((m) => addMonth(m, 1))}
          disabled={!canGoNext}
          className="pressable flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-lg text-muted-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Bulan berikutnya"
        >
          ›
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard
          value={summary.total}
          label="Total Hadir"
          colorClass="text-emerald-600 dark:text-emerald-500"
          borderClass="border-l-emerald-500"
        />
        <SummaryCard
          value={summary.late}
          label="Terlambat"
          colorClass="text-red-600 dark:text-red-500"
          borderClass="border-l-red-500"
        />
        <SummaryCard
          value={summary.absent}
          label="Tidak Hadir"
          colorClass="text-primary"
          borderClass="border-l-primary"
        />
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map(({ key, label }) => (
          <button
            key={key || "all"}
            id={`filter-status-${key || "all"}`}
            onClick={() => setStatusFilter(key)}
            className={[
              "pressable rounded-full border px-4 py-1.5 text-xs font-bold transition",
              statusFilter === key
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-muted",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <p role="alert" className="rounded-2xl bg-red-50 dark:bg-red-950/50 px-4 py-3 text-sm leading-5 text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl border border-border bg-muted"
            />
          ))}
        </div>
      )}

      {/* List */}
      {!loading && (
        <>
          {records.length === 0 ? (
            <EmptyState month={month} />
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <AttendanceItem key={record.id} record={record} />
              ))}
            </div>
          )}

          {/* Load more */}
          {pagination && pagination.current_page < pagination.last_page && (
            <Button
              id="btn-load-more"
              variant="secondary"
              fullWidth
              onClick={() => void loadMore()}
              disabled={loadingMore}
              className="mt-2"
            >
              {loadingMore
                ? "Memuat…"
                : `Muat lebih banyak (${pagination.total - records.length} lagi)`}
            </Button>
          )}

          {records.length > 0 && pagination && pagination.current_page >= pagination.last_page && (
            <p className="py-4 text-center text-xs text-muted-foreground">
              Semua {pagination.total} data telah ditampilkan.
            </p>
          )}
        </>
      )}
    </section>
  );
}
