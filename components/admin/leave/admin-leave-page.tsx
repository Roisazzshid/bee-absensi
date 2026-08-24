"use client";

import React from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { ApiError } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

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
const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};
const STATUS_LABEL: Record<string, string> = {
  pending: "Pending", approved: "Disetujui", rejected: "Ditolak",
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

  // Modal reject
  const [rejectTarget, setRejectTarget] = useState<LeaveItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  // Modal detail
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

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  const daysDiff = (start: string, end: string) => {
    const diff = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${diff} hari`;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">📝 Pengajuan Izin & Cuti</h1>
        <p className="mt-1 text-sm text-on-surface-variant">Kelola dan proses pengajuan dari karyawan</p>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "", label: "Semua", value: summary.pending + summary.approved + summary.rejected, cls: "bg-surface-container" },
          { key: "pending", label: "Pending", value: summary.pending, cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
          { key: "approved", label: "Disetujui", value: summary.approved, cls: "bg-green-50 text-green-700 ring-1 ring-green-200" },
          { key: "rejected", label: "Ditolak", value: summary.rejected, cls: "bg-red-50 text-red-700 ring-1 ring-red-200" },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => { setStatusFilter(s.key); setPage(1); }}
            className={[
              "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all",
              s.cls,
              statusFilter === s.key ? "ring-2 ring-primary scale-105" : "",
            ].join(" ")}
          >
            {s.label}
            <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-xs">{s.value}</span>
          </button>
        ))}
      </div>

      {error && <div className="rounded-2xl bg-red-50 p-4 text-sm text-error ring-1 ring-red-200">⚠️ {error}</div>}
      {actionError && <div className="rounded-2xl bg-red-50 p-4 text-sm text-error ring-1 ring-red-200">⚠️ {actionError}</div>}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-28 animate-pulse rounded-2xl bg-surface-container" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl bg-surface p-10 text-center ring-1 ring-outline-variant/40">
          <p className="text-4xl">📭</p>
          <p className="mt-2 font-bold text-on-surface">Tidak ada pengajuan</p>
          <p className="text-sm text-on-surface-variant">Belum ada pengajuan dengan filter ini</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-surface p-4 ring-1 ring-outline-variant/40 hover:ring-primary/30 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* User info */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-bold text-on-surface">{item.user.full_name}</span>
                    <span className="text-xs text-on-surface-variant">{item.user.nip}</span>
                    <span className="rounded-full bg-surface-container px-2 py-0.5 text-xs text-on-surface-variant">
                      {item.user.department}
                    </span>
                  </div>

                  {/* Leave info */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                      {TYPE_MAP[item.type] ?? item.type}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {formatDate(item.start_date)} – {formatDate(item.end_date)} ({daysDiff(item.start_date, item.end_date)})
                    </span>
                    <span className={["rounded-full px-2.5 py-0.5 text-xs font-bold", STATUS_STYLE[item.status]].join(" ")}>
                      {STATUS_LABEL[item.status]}
                    </span>
                  </div>

                  <p className="text-sm text-on-surface-variant line-clamp-2">
                    {item.reason}
                  </p>

                  {item.rejection_reason && (
                    <p className="mt-1 text-xs text-red-600 italic">
                      Alasan penolakan: {item.rejection_reason}
                    </p>
                  )}

                  {item.approved_by && (
                    <p className="mt-1 text-xs text-on-surface-variant">
                      Diproses oleh: <span className="font-semibold">{item.approved_by.full_name}</span>
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => setDetailItem(item)}
                    className="rounded-xl border border-outline-variant px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors"
                  >
                    Detail
                  </button>
                  {item.status === "pending" && (
                    <>
                      <button
                        onClick={() => void handleApprove(item)}
                        disabled={actionLoading}
                        className="rounded-xl bg-green-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-600 transition-colors disabled:opacity-50"
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
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-on-surface-variant">
            {pagination.total} data · Halaman {pagination.current_page} dari {pagination.last_page}
          </p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="rounded-xl border border-outline-variant px-4 py-2 text-sm font-bold disabled:opacity-40 hover:bg-surface-container-low">
              ← Prev
            </button>
            <button disabled={page >= pagination.last_page} onClick={() => setPage(p => p + 1)}
              className="rounded-xl border border-outline-variant px-4 py-2 text-sm font-bold disabled:opacity-40 hover:bg-surface-container-low">
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ── Modal: Reject ── */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-surface p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-on-surface">Tolak Pengajuan</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Pengajuan dari <span className="font-semibold">{rejectTarget.user.full_name}</span>
            </p>

            <div className="mt-4">
              <label className="block text-xs font-bold text-on-surface-variant mb-2">
                Alasan penolakan <span className="font-normal text-on-surface-variant/60">(opsional)</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Tulis alasan penolakan…"
                rows={3}
                className="w-full resize-none rounded-xl border border-outline-variant bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {actionError && (
              <p className="mt-2 text-xs text-error">{actionError}</p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setRejectTarget(null)}
                className="flex-1 rounded-xl border border-outline-variant py-3 text-sm font-bold text-on-surface hover:bg-surface-container-low"
              >
                Batal
              </button>
              <button
                onClick={() => void handleRejectSubmit()}
                disabled={actionLoading}
                className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-60"
              >
                {actionLoading ? "Memproses…" : "Tolak Pengajuan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Detail ── */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-surface p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-bold text-on-surface">Detail Pengajuan</h2>
              <button onClick={() => setDetailItem(null)} className="text-on-surface-variant hover:text-on-surface text-xl">✕</button>
            </div>

            <div className="space-y-3">
              <Row label="Karyawan" value={`${detailItem.user.full_name} (${detailItem.user.nip})`} />
              <Row label="Departemen" value={`${detailItem.user.department} — ${detailItem.user.position}`} />
              <Row label="Jenis" value={TYPE_MAP[detailItem.type] ?? detailItem.type} />
              <Row label="Tanggal" value={`${formatDate(detailItem.start_date)} s/d ${formatDate(detailItem.end_date)} (${daysDiff(detailItem.start_date, detailItem.end_date)})`} />
              <Row label="Status">
                <span className={["rounded-full px-2.5 py-0.5 text-xs font-bold", STATUS_STYLE[detailItem.status]].join(" ")}>
                  {STATUS_LABEL[detailItem.status]}
                </span>
              </Row>
              <div className="rounded-xl bg-surface-container-low p-3">
                <p className="text-xs font-bold text-on-surface-variant mb-1">Alasan Pengajuan</p>
                <p className="text-sm text-on-surface">{detailItem.reason}</p>
              </div>
              {detailItem.rejection_reason && (
                <div className="rounded-xl bg-red-50 p-3 ring-1 ring-red-200">
                  <p className="text-xs font-bold text-red-600 mb-1">Alasan Penolakan</p>
                  <p className="text-sm text-red-700">{detailItem.rejection_reason}</p>
                </div>
              )}
              {detailItem.attachment_url && (
                <Row label="Lampiran">
                  <a href={detailItem.attachment_url} target="_blank" rel="noreferrer" className="text-primary text-sm font-bold hover:underline">
                    Lihat dokumen →
                  </a>
                </Row>
              )}
              {detailItem.approved_by && (
                <Row label="Diproses oleh" value={detailItem.approved_by.full_name} />
              )}
            </div>

            {detailItem.status === "pending" && (
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => { void handleApprove(detailItem); setDetailItem(null); }}
                  disabled={actionLoading}
                  className="flex-1 rounded-xl bg-green-500 py-3 text-sm font-bold text-white hover:bg-green-600 disabled:opacity-60"
                >
                  ✓ Setujui
                </button>
                <button
                  onClick={() => { setRejectTarget(detailItem); setDetailItem(null); }}
                  className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-bold text-white hover:bg-red-600"
                >
                  ✕ Tolak
                </button>
              </div>
            )}

            <button onClick={() => setDetailItem(null)} className="mt-3 w-full rounded-xl border border-outline-variant py-3 text-sm font-bold text-on-surface hover:bg-surface-container-low">
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
    <div className="flex items-start gap-2">
      <span className="w-28 shrink-0 text-xs font-bold text-on-surface-variant">{label}</span>
      <span className="text-sm text-on-surface">{children ?? value}</span>
    </div>
  );
}
