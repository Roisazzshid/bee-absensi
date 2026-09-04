"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Badge, Button, Card, TextInput } from "@/components/ui";
import { ApiError } from "@/lib/api";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type LeaveType = "sick" | "leave" | "permission";
type LeaveStatus = "pending" | "approved" | "rejected";

type LeaveRequest = {
  id: number;
  type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
  attachment_url: string | null;
  status: LeaveStatus;
  created_at: string;
};

type Summary = { pending: number; approved: number; rejected: number };
type PaginationMeta = { current_page: number; last_page: number; per_page: number; total: number };
type ListData = { summary: Summary; leave_requests: LeaveRequest[]; pagination: PaginationMeta };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<LeaveType, string> = {
  sick: "Sakit",
  leave: "Cuti",
  permission: "Izin",
};

const STATUS_CFG: Record<LeaveStatus, { tone: "primary" | "success" | "error"; label: string; border: string }> = {
  pending:  { tone: "primary",  label: "Menunggu",  border: "border-l-primary" },
  approved: { tone: "success",  label: "Disetujui", border: "border-l-emerald-500" },
  rejected: { tone: "error",    label: "Ditolak",   border: "border-l-red-500" },
};

function fmtDate(d: string) {
  if (!d) return "—";
  try {
    const datePart = d.includes("T") ? d.split("T")[0] : d.split(" ")[0];
    const date = new Date(datePart + "T00:00:00");
    if (Number.isNaN(date.getTime())) return d;
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(date);
  } catch { return d; }
}

function dayCount(start: string, end: string) {
  const s = start.includes("T") ? start.split("T")[0] : start.split(" ")[0];
  const e = end.includes("T") ? end.split("T")[0] : end.split(" ")[0];
  const ms = new Date(e + "T00:00:00").getTime() - new Date(s + "T00:00:00").getTime();
  return Math.max(1, Math.round(ms / 86_400_000) + 1);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-1.5 block text-xs font-bold text-muted-foreground">{children}</span>;
}

function FormSelect({
  id,
  value,
  onChange,
  children,
  required,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="min-h-12 w-full appearance-none rounded-2xl border border-border bg-card px-4 pr-10 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        {children}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
        ▾
      </span>
    </div>
  );
}

function FileUploadZone({
  file,
  onFileChange,
}: {
  file: File | null;
  onFileChange: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card p-8 transition hover:border-primary hover:bg-primary/5"
    >
      <span className="text-4xl">{file ? "📎" : "☁️"}</span>
      {file ? (
        <>
          <span className="text-sm font-bold text-primary">{file.name}</span>
          <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onFileChange(null); }}
            className="mt-1 text-xs font-bold text-red-600 dark:text-red-500"
          >
            Hapus
          </button>
        </>
      ) : (
        <>
          <span className="text-sm font-bold text-primary">Ketuk untuk upload file</span>
          <span className="text-xs text-muted-foreground">PDF, JPG, PNG hingga 5 MB</span>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

function LeaveRequestItem({
  item,
  onCancel,
  cancelling,
}: {
  item: LeaveRequest;
  onCancel: (id: number) => void;
  cancelling: number | null;
}) {
  const cfg = STATUS_CFG[item.status];
  const days = dayCount(item.start_date, item.end_date);
  return (
    <div className={`shadow-sm relative overflow-hidden rounded-2xl border-l-4 bg-card border border-border p-4 ${cfg.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-foreground">{TYPE_LABELS[item.type]}</span>
            <Badge tone={cfg.tone}>{cfg.label}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {fmtDate(item.start_date)} – {fmtDate(item.end_date)}
            <span className="ml-2 font-bold text-primary">({days} hari)</span>
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.reason}</p>
        </div>
        {item.status === "pending" && (
          <button
            onClick={() => onCancel(item.id)}
            disabled={cancelling === item.id}
            className="shrink-0 rounded-xl border border-red-500/30 bg-red-50 dark:bg-red-950/50 px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-500 transition hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-60"
          >
            {cancelling === item.id ? "…" : "Batal"}
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-14 text-center text-muted-foreground">
      <span className="text-5xl">📋</span>
      <p className="text-sm font-semibold text-foreground">Belum ada pengajuan</p>
      <p className="text-xs">Gunakan form di atas untuk mengajukan izin atau cuti.</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LeaveRequestPage() {
  const { request } = useAuth();

  // Form state
  const [type, setType]           = useState<LeaveType | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [reason, setReason]       = useState("");
  const [file, setFile]           = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // List state
  const [items, setItems]         = useState<LeaveRequest[]>([]);
  const [summary, setSummary]     = useState<Summary>({ pending: 0, approved: 0, rejected: 0 });
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | "">("");
  const pageRef = useRef(1);

  // ── Fetch list ───────────────────────────────────────────────────────────────

  const fetchPage = useCallback(
    async (status: LeaveStatus | "", page: number) => {
      const params = new URLSearchParams({ page: String(page), per_page: "8" });
      if (status) params.set("status", status);
      return request<ListData>(`/leave-requests?${params.toString()}`);
    },
    [request]
  );

  const loadList = useCallback(
    async (status: LeaveStatus | "") => {
      setLoading(true);
      setListError(null);
      pageRef.current = 1;
      try {
        const data = await fetchPage(status, 1);
        setItems(data.leave_requests);
        setSummary(data.summary);
        setPagination(data.pagination);
      } catch (err) {
        setListError(err instanceof ApiError ? err.message : "Gagal memuat daftar pengajuan.");
      } finally {
        setLoading(false);
      }
    },
    [fetchPage]
  );

  const loadMore = useCallback(async () => {
    if (!pagination || pagination.current_page >= pagination.last_page) return;
    const next = pageRef.current + 1;
    setLoadingMore(true);
    try {
      const data = await fetchPage(statusFilter, next);
      setItems((prev) => [...prev, ...data.leave_requests]);
      setPagination(data.pagination);
      pageRef.current = next;
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : "Gagal memuat lebih banyak.");
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, pagination, statusFilter]);

  useEffect(() => { void loadList(statusFilter); }, [loadList, statusFilter]);

  // ── Submit form ──────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!type) { setFormError("Pilih jenis pengajuan."); return; }
    if (!startDate || !endDate) { setFormError("Pilih rentang tanggal."); return; }
    if (endDate < startDate) { setFormError("Tanggal selesai harus setelah atau sama dengan tanggal mulai."); return; }
    if (reason.trim().length < 10) { setFormError("Alasan minimal 10 karakter."); return; }

    setFormError(null);
    setFormSuccess(null);
    setSubmitting(true);

    try {
      const body = new FormData();
      body.append("type", type);
      body.append("start_date", startDate);
      body.append("end_date", endDate);
      body.append("reason", reason.trim());
      if (file) body.append("attachment", file);

      await request<LeaveRequest>("/leave-requests", { method: "POST", body });

      setFormSuccess("Pengajuan berhasil dikirim dan menunggu persetujuan.");
      // Reset form
      setType(""); setStartDate(""); setEndDate(""); setReason(""); setFile(null);
      // Reload list
      await loadList(statusFilter);
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      const firstError = apiErr?.errors
        ? Object.values(apiErr.errors).flat()[0]
        : null;
      setFormError(firstError ?? apiErr?.message ?? "Pengajuan gagal dikirim. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Cancel ───────────────────────────────────────────────────────────────────

  async function handleCancel(id: number) {
    if (!confirm("Batalkan pengajuan ini?")) return;
    setCancelling(id);
    try {
      await request<null>(`/leave-requests/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((item) => item.id !== id));
      setSummary((prev) => ({ ...prev, pending: Math.max(0, prev.pending - 1) }));
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : "Gagal membatalkan pengajuan.");
    } finally {
      setCancelling(null);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const filterOptions: { key: LeaveStatus | ""; label: string }[] = [
    { key: "", label: "Semua" },
    { key: "pending", label: "Menunggu" },
    { key: "approved", label: "Disetujui" },
    { key: "rejected", label: "Ditolak" },
  ];

  const today = new Date().toISOString().split("T")[0];

  return (
    <section className="mx-auto flex max-w-md flex-col gap-8">

      {/* ── Form pengajuan ── */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Pengajuan Izin / Cuti</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ajukan izin, cuti, atau sakit kepada admin.</p>
      </div>

      <Card className="p-5">
        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-5" noValidate>

          {/* Jenis pengajuan */}
          <div>
            <FieldLabel>Jenis Pengajuan</FieldLabel>
            <FormSelect id="leave-type" value={type} onChange={(v) => setType(v as LeaveType | "")} required>
              <option value="" disabled>Pilih jenis pengajuan…</option>
              <option value="leave">Cuti Tahunan</option>
              <option value="sick">Sakit</option>
              <option value="permission">Izin</option>
            </FormSelect>
          </div>

          {/* Rentang tanggal */}
          <div>
            <FieldLabel>Rentang Tanggal</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="leave-start-date" className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Mulai</label>
                <TextInput
                  id="leave-start-date"
                  type="date"
                  value={startDate}
                  min={today}
                  onChange={(e) => { setStartDate(e.target.value); if (endDate && e.target.value > endDate) setEndDate(e.target.value); }}
                  required
                />
              </div>
              <div>
                <label htmlFor="leave-end-date" className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Selesai</label>
                <TextInput
                  id="leave-end-date"
                  type="date"
                  value={endDate}
                  min={startDate || today}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
            {startDate && endDate && endDate >= startDate && (
              <p className="mt-1.5 text-xs text-primary font-semibold">{dayCount(startDate, endDate)} hari</p>
            )}
          </div>

          {/* Alasan */}
          <div>
            <FieldLabel>Alasan</FieldLabel>
            <textarea
              id="leave-reason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Jelaskan alasan pengajuan Anda (min. 10 karakter)…"
              required
              className="min-h-[96px] w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <p className="mt-1 text-right text-[10px] text-muted-foreground">{reason.length}/1000</p>
          </div>

          {/* Lampiran */}
          <div>
            <FieldLabel>Dokumen Pendukung <span className="font-normal text-muted-foreground">(opsional)</span></FieldLabel>
            <p className="mb-2 text-xs text-muted-foreground">Mis. Surat Keterangan Dokter</p>
            <FileUploadZone file={file} onFileChange={setFile} />
          </div>

          {/* Alert */}
          {formError && (
            <p role="alert" className="rounded-2xl bg-red-50 dark:bg-red-950/50 px-4 py-3 text-sm leading-5 text-red-600 dark:text-red-400">
              {formError}
            </p>
          )}
          {formSuccess && (
            <p role="status" className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 px-4 py-3 text-sm leading-5 text-emerald-600 dark:text-emerald-400">
              {formSuccess}
            </p>
          )}

          {/* Submit */}
          <Button
            id="btn-submit-leave"
            type="submit"
            fullWidth
            disabled={submitting}
            className="h-14 text-base disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Mengirim…" : "Kirim Pengajuan"}
          </Button>
        </form>
      </Card>

      {/* ── Daftar pengajuan ── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Riwayat Pengajuan</h2>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span className="font-bold text-primary">{summary.pending}</span> menunggu ·{" "}
            <span className="font-bold text-emerald-600 dark:text-emerald-500">{summary.approved}</span> disetujui
          </div>
        </div>

        {/* Filter chips */}
        <div className="mb-4 flex flex-wrap gap-2">
          {filterOptions.map(({ key, label }) => (
            <button
              key={key || "all"}
              id={`filter-leave-${key || "all"}`}
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

        {/* Error */}
        {listError && (
          <p role="alert" className="mb-4 rounded-2xl bg-red-50 dark:bg-red-950/50 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {listError}
          </p>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl border border-border bg-muted" />
            ))}
          </div>
        )}

        {/* List */}
        {!loading && (
          <>
            {items.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <LeaveRequestItem
                    key={item.id}
                    item={item}
                    onCancel={handleCancel}
                    cancelling={cancelling}
                  />
                ))}
              </div>
            )}

            {pagination && pagination.current_page < pagination.last_page && (
              <Button
                id="btn-load-more-leave"
                variant="secondary"
                fullWidth
                onClick={() => void loadMore()}
                disabled={loadingMore}
                className="mt-4"
              >
                {loadingMore ? "Memuat…" : `Muat lebih banyak (${pagination.total - items.length} lagi)`}
              </Button>
            )}

            {items.length > 0 && pagination && pagination.current_page >= pagination.last_page && (
              <p className="py-4 text-center text-xs text-muted-foreground">
                Semua {pagination.total} pengajuan ditampilkan.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
