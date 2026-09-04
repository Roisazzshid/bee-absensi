"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { ApiError } from "@/lib/api";

type LeaveItem = {
  id: number;
  type: "sick" | "leave" | "permission";
  start_date: string;
  end_date: string;
  reason: string;
  attachment_url: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  created_at: string;
  user: { id: number; full_name: string; nip: string; department: string; position: string };
  approved_by: { id: number; full_name: string } | null;
};

type Pagination = { current_page: number; last_page: number; per_page: number; total: number };

const TYPE_MAP: Record<string, string> = { sick: "Sakit", leave: "Cuti", permission: "Izin" };
const TYPE_COLOR: Record<string, string> = {
  sick: "bg-red-50 text-red-600 ring-red-200 dark:bg-red-500/20 dark:text-red-500 dark:ring-0",
  leave: "bg-blue-50 text-blue-600 ring-blue-200 dark:bg-blue-500/20 dark:text-blue-500 dark:ring-0",
  permission: "bg-purple-50 text-purple-600 ring-purple-200 dark:bg-purple-500/20 dark:text-purple-500 dark:ring-0",
};
const STATUS_CONFIG: Record<string, { label: string; badge: string; dot: string }> = {
  pending: { label: "Pending", badge: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/20 dark:text-amber-500 dark:ring-0", dot: "bg-amber-400" },
  approved: { label: "Disetujui", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-500 dark:ring-0", dot: "bg-emerald-500" },
  rejected: { label: "Ditolak", badge: "bg-red-50 text-red-600 ring-red-200 dark:bg-red-500/20 dark:text-red-500 dark:ring-0", dot: "bg-red-400" },
};

export function AdminLeavePage() {
  const { request } = useAuth();
  const [items, setItems] = useState<LeaveItem[]>([]);
  const [summary, setSummary] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const [rejectTarget, setRejectTarget] = useState<LeaveItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [detailItem, setDetailItem] = useState<LeaveItem | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ per_page: "15", page: String(page) });
      if (statusFilter) params.set("status", statusFilter);
      const res = await request<{ summary: typeof summary; leave_requests: LeaveItem[]; pagination: Pagination }>(
        `/admin/leave-requests?${params.toString()}`
      );
      setItems(res.leave_requests);
      setSummary(res.summary);
      setPagination(res.pagination);
    } catch {
      setError("Gagal memuat data pengajuan.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, request]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  async function handleApprove(item: LeaveItem) {
    setActionLoading(true);
    setActionError("");
    try {
      await request(`/admin/leave-requests/${item.id}/approve`, { method: "PUT" });
      await fetchData();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Gagal menyetujui.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRejectSubmit() {
    if (!rejectTarget) return;
    setActionLoading(true);
    setActionError("");
    try {
      await request(`/admin/leave-requests/${rejectTarget.id}/reject`, {
        method: "PUT",
        body: JSON.stringify({ rejection_reason: rejectionReason }),
      });
      setRejectTarget(null);
      setRejectionReason("");
      await fetchData();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Gagal menolak.");
    } finally {
      setActionLoading(false);
    }
  }

  const fmtDate = (d: string) => {
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
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  };

  const daysDiff = (s: string, e: string) => {
    if (!s || !e) return 1;
    const sPart = s.includes("T") ? s.split("T")[0] : s.split(" ")[0];
    const ePart = e.includes("T") ? e.split("T")[0] : e.split(" ")[0];
    const diff = Math.ceil((new Date(ePart + "T00:00:00").getTime() - new Date(sPart + "T00:00:00").getTime()) / 86400000) + 1;
    return Number.isNaN(diff) ? 1 : Math.max(1, diff);
  };

  const initials = (name: string) =>
    (name || "K").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  const tabs = [
    { key: "", label: "Semua", count: summary.pending + summary.approved + summary.rejected },
    { key: "pending", label: "Pending", count: summary.pending },
    { key: "approved", label: "Disetujui", count: summary.approved },
    { key: "rejected", label: "Ditolak", count: summary.rejected },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground md:text-2xl">Pengajuan Izin & Cuti</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Kelola dan proses pengajuan dari karyawan</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar rounded-xl bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setStatusFilter(tab.key); setPage(1); }}
            className={[
              "flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
              statusFilter === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={["rounded-full px-1.5 py-0.5 text-[10px] font-bold", statusFilter === tab.key ? "bg-primary/10 text-primary" : "bg-card text-muted-foreground"].join(" ")}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {(error || actionError) && (
        <div className="rounded-2xl bg-red-50 dark:bg-red-950/50 p-4 text-sm text-red-600 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-900/50">
          {error || actionError}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-card border border-border py-14 shadow-sm">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/50">
            <svg className="size-7 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="mt-3 font-bold text-foreground">Tidak ada pengajuan</p>
          <p className="mt-1 text-sm text-muted-foreground">Belum ada pengajuan dengan filter ini</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const st = STATUS_CONFIG[item.status];
            const tc = TYPE_COLOR[item.type] ?? "bg-muted text-muted-foreground ring-border dark:ring-0";
            return (
              <div
                key={item.id}
                className="relative overflow-hidden group rounded-3xl bg-card p-5 border border-border shadow-sm hover:border-yellow-500/50 transition-all"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-primary" />
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="hidden sm:flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {initials(item.user.full_name)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-bold text-foreground text-sm">{item.user.full_name}</span>
                      <span className="text-[11px] text-muted-foreground">{item.user.nip}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {item.user.department}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={["inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 dark:ring-0", tc].join(" ")}>
                        {TYPE_MAP[item.type] ?? item.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {fmtDate(item.start_date)} – {fmtDate(item.end_date)}
                        <span className="ml-1 text-primary font-semibold">({daysDiff(item.start_date, item.end_date)} hari)</span>
                      </span>
                      <span className={["inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 dark:ring-0", st.badge].join(" ")}>
                        <span className={["size-1.5 rounded-full", st.dot].join(" ")} />{st.label}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">{item.reason}</p>

                    {item.rejection_reason && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400 italic">Ditolak: {item.rejection_reason}</p>
                    )}
                    {item.approved_by && (
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Diproses: <span className="font-semibold">{item.approved_by.full_name}</span>
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => setDetailItem(item)}
                      className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
                    >
                      Detail
                    </button>
                    {item.status === "pending" && (
                      <>
                        <button
                          onClick={() => void handleApprove(item)}
                          disabled={actionLoading}
                          className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
                        >
                          ✓ Setujui
                        </button>
                        <button
                          onClick={() => { setRejectTarget(item); setRejectionReason(""); setActionError(""); }}
                          disabled={actionLoading}
                          className="rounded-xl bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          ✕ Tolak
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Halaman <span className="font-bold text-foreground">{pagination.current_page}</span> dari <span className="font-bold text-foreground">{pagination.last_page}</span>
          </p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
              className="flex items-center gap-1 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold disabled:opacity-40 hover:bg-muted">
              <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg> Prev
            </button>
            <button disabled={page >= pagination.last_page} onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold disabled:opacity-40 hover:bg-muted">
              Next <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Modal Reject ── */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-background border border-border p-6 shadow-2xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/50">
                <svg className="size-5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-foreground">Tolak Pengajuan</h2>
                <p className="text-xs text-muted-foreground mt-0.5">dari <span className="font-semibold">{rejectTarget.user.full_name}</span></p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-2">
                Alasan penolakan <span className="font-normal opacity-60">(opsional)</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Tulis alasan penolakan…"
                rows={3}
                className="w-full resize-none rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {actionError && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{actionError}</p>}

            <div className="mt-4 flex gap-2">
              <button onClick={() => setRejectTarget(null)}
                className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                Batal
              </button>
              <button onClick={() => void handleRejectSubmit()} disabled={actionLoading}
                className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-60 transition-colors">
                {actionLoading ? "Memproses…" : "Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Detail ── */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-background border border-border p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-foreground">Detail Pengajuan</h2>
              <button onClick={() => setDetailItem(null)}
                className="flex size-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted">
                <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-3">
              <Row label="Karyawan" value={`${detailItem.user.full_name} (${detailItem.user.nip})`} />
              <Row label="Departemen" value={`${detailItem.user.department} — ${detailItem.user.position}`} />
              <Row label="Jenis">
                <span className={["inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 dark:ring-0", TYPE_COLOR[detailItem.type]].join(" ")}>
                  {TYPE_MAP[detailItem.type]}
                </span>
              </Row>
              <Row label="Tanggal" value={`${fmtDate(detailItem.start_date)} – ${fmtDate(detailItem.end_date)} (${daysDiff(detailItem.start_date, detailItem.end_date)} hari)`} />
              <Row label="Status">
                <span className={["inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 dark:ring-0", STATUS_CONFIG[detailItem.status].badge].join(" ")}>
                  <span className={["size-1.5 rounded-full", STATUS_CONFIG[detailItem.status].dot].join(" ")} />
                  {STATUS_CONFIG[detailItem.status].label}
                </span>
              </Row>
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-[10px] font-bold text-muted-foreground mb-1">Alasan</p>
                <p className="text-sm text-foreground">{detailItem.reason}</p>
              </div>
              {detailItem.rejection_reason && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/50 p-3 ring-1 ring-red-200 dark:ring-red-900/50">
                  <p className="text-[10px] font-bold text-red-600 dark:text-red-400 mb-1">Alasan Penolakan</p>
                  <p className="text-sm text-red-700 dark:text-red-300">{detailItem.rejection_reason}</p>
                </div>
              )}
              {detailItem.attachment_url && (
                <Row label="Lampiran">
                  <a href={detailItem.attachment_url} target="_blank" rel="noreferrer" className="text-primary text-sm font-bold hover:underline">
                    Lihat dokumen →
                  </a>
                </Row>
              )}
              {detailItem.approved_by && <Row label="Diproses" value={detailItem.approved_by.full_name} />}
            </div>

            {detailItem.status === "pending" && (
              <div className="mt-5 flex gap-2">
                <button onClick={() => { void handleApprove(detailItem); setDetailItem(null); }} disabled={actionLoading}
                  className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-60">
                  ✓ Setujui
                </button>
                <button onClick={() => { setRejectTarget(detailItem); setDetailItem(null); }}
                  className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-bold text-white hover:bg-red-600">
                  ✕ Tolak
                </button>
              </div>
            )}
            <button onClick={() => setDetailItem(null)}
              className="mt-2 w-full rounded-xl border border-border py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-24 shrink-0 text-[11px] font-bold text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{children ?? value}</span>
    </div>
  );
}
