"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { ApiError } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

type Employee = {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
  profile: {
    full_name: string;
    nip: string;
    phone: string;
    department: string;
    position: string;
    avatar_url: string | null;
    leave_quota: number;
  } | null;
};

type Pagination = { current_page: number; last_page: number; per_page: number; total: number };

type EmployeeForm = {
  email: string;
  password: string;
  full_name: string;
  nip: string;
  phone: string;
  department: string;
  position: string;
  leave_quota: string;
  is_active: boolean;
};

const EMPTY_FORM: EmployeeForm = {
  email: "", password: "", full_name: "", nip: "", phone: "",
  department: "", position: "", leave_quota: "12", is_active: true,
};

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-500", 
  "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-500",
  "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-500", 
  "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-500",
  "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-500", 
  "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-500",
];

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export function AdminEmployeePage() {
  const { request } = useAuth();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [page, setPage] = useState(1);

  // Modal state
  const [modalMode, setModalMode] = useState<"create" | "edit" | "delete" | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmployeeForm>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ per_page: "20", page: String(page) });
      if (search) params.set("search", search);
      if (deptFilter) params.set("department", deptFilter);
      const res = await request<{ employees: Employee[]; departments: string[]; pagination: Pagination }>(
        `/admin/employees?${params.toString()}`
      );
      setEmployees(res.employees);
      setDepartments(res.departments);
      setPagination(res.pagination);
    } catch {
      setError("Gagal memuat data karyawan.");
    } finally {
      setLoading(false);
    }
  }, [search, deptFilter, page, request]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormError("");
    setModalMode("create");
  }

  function openEdit(emp: Employee) {
    setSelectedEmployee(emp);
    setForm({
      email: emp.email,
      password: "",
      full_name: emp.profile?.full_name ?? "",
      nip: emp.profile?.nip ?? "",
      phone: emp.profile?.phone ?? "",
      department: emp.profile?.department ?? "",
      position: emp.profile?.position ?? "",
      leave_quota: String(emp.profile?.leave_quota ?? 12),
      is_active: emp.is_active,
    });
    setFormError("");
    setModalMode("edit");
  }

  function openDelete(emp: Employee) {
    setSelectedEmployee(emp);
    setFormError("");
    setModalMode("delete");
  }

  function closeModal() {
    setModalMode(null);
    setSelectedEmployee(null);
    setFormError("");
  }

  function setField(key: keyof EmployeeForm, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreate() {
    setFormLoading(true);
    setFormError("");
    try {
      await request("/admin/employees", {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          nip: form.nip || undefined,
          phone: form.phone || undefined,
          department: form.department || undefined,
          position: form.position || undefined,
          leave_quota: Number(form.leave_quota) || 12,
          is_active: form.is_active,
        }),
      });
      closeModal();
      await fetchData();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Gagal membuat karyawan.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleUpdate() {
    if (!selectedEmployee) return;
    setFormLoading(true);
    setFormError("");
    try {
      const payload: Record<string, unknown> = {
        email: form.email,
        full_name: form.full_name,
        nip: form.nip || undefined,
        phone: form.phone || undefined,
        department: form.department || undefined,
        position: form.position || undefined,
        leave_quota: Number(form.leave_quota) || 12,
        is_active: form.is_active,
      };
      if (form.password) payload["password"] = form.password;

      await request(`/admin/employees/${selectedEmployee.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      closeModal();
      await fetchData();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Gagal memperbarui karyawan.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete() {
    if (!selectedEmployee) return;
    setFormLoading(true);
    setFormError("");
    try {
      await request(`/admin/employees/${selectedEmployee.id}`, { method: "DELETE" });
      closeModal();
      await fetchData();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Gagal menghapus karyawan.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleToggleActive(emp: Employee) {
    try {
      await request(`/admin/employees/${emp.id}/toggle-active`, { method: "PATCH" });
      await fetchData();
    } catch {
      // silent fail
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground md:text-2xl">Daftar Karyawan</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {pagination
              ? <><span className="font-semibold text-foreground">{pagination.total}</span> karyawan terdaftar</>
              : "Seluruh karyawan yang terdaftar di sistem"}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
        >
          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="hidden sm:inline">Tambah Karyawan</span>
          <span className="sm:hidden">Tambah</span>
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Cari nama atau NIP…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button type="submit" className="h-10 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity">
            Cari
          </button>
        </form>
        <select
          value={deptFilter}
          onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Semua Departemen</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {error && <div className="rounded-2xl bg-red-50 dark:bg-red-950/50 p-4 text-sm text-red-600 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-900/50">{error}</div>}

      {/* Grid */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />)}
        </div>
      ) : employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-card py-14 border border-border shadow-sm">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/50">
            <svg className="size-7 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <p className="mt-3 font-bold text-foreground">Karyawan tidak ditemukan</p>
          <p className="mt-1 text-sm text-muted-foreground">Coba ubah kata kunci atau tambah karyawan baru</p>
          <button onClick={openCreate} className="mt-4 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:opacity-90">
            + Tambah Karyawan
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {employees.map((emp) => {
            const name = emp.profile?.full_name ?? emp.email;
            const color = avatarColor(name);
            return (
              <div key={emp.id} className="relative overflow-hidden group rounded-3xl bg-card p-5 border border-border shadow-sm hover:border-yellow-500/50 transition-all duration-200">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-primary" />
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className={["flex size-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold", color].join(" ")}>
                    {initials(name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="truncate font-bold text-foreground text-sm">{name}</p>
                      <span className={[
                        "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                        emp.is_active ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-500" : "bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-500",
                      ].join(" ")}>
                        {emp.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{emp.profile?.nip ?? "—"}</p>
                    <div className="mt-1 flex items-center gap-1 flex-wrap">
                      {emp.profile?.department && (
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          {emp.profile.department}
                        </span>
                      )}
                      {emp.profile?.position && (
                        <span className="text-[10px] text-muted-foreground">· {emp.profile.position}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer info */}
                <div className="mt-3 flex items-center gap-3 border-t border-border pt-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <svg className="size-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                    </svg>
                    Cuti: <span className="font-bold text-foreground ml-0.5">{emp.profile?.leave_quota ?? 0}</span>
                  </span>
                  <span className="flex-1 truncate">{emp.email}</span>
                </div>

                {/* Action buttons */}
                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => openEdit(emp)}
                    className="flex items-center justify-center gap-1 rounded-xl bg-primary/10 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
                  >
                    <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => void handleToggleActive(emp)}
                    className={[
                      "flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-bold transition-colors",
                      emp.is_active
                        ? "bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-950/30 dark:text-amber-500 dark:hover:bg-amber-950/50"
                        : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-500 dark:hover:bg-emerald-950/50",
                    ].join(" ")}
                  >
                    <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M18.36 6.64a9 9 0 11-12.73 0M12 2v10" />
                    </svg>
                    {emp.is_active ? "Nonaktif" : "Aktifkan"}
                  </button>
                  <button
                    onClick={() => openDelete(emp)}
                    className="flex items-center justify-center gap-1 rounded-xl bg-red-100 py-2 text-xs font-bold text-red-600 hover:bg-red-200 dark:bg-red-950/30 dark:text-red-500 dark:hover:bg-red-950/50 transition-colors"
                  >
                    <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                    </svg>
                    Hapus
                  </button>
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
            Halaman <span className="font-bold text-foreground">{pagination.current_page}</span> dari{" "}
            <span className="font-bold text-foreground">{pagination.last_page}</span>
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

      {/* ──────────────────── MODALS ──────────────────── */}

      {/* Create / Edit Modal */}
      {(modalMode === "create" || modalMode === "edit") && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-background border border-border shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="sticky top-0 flex items-center justify-between bg-background px-6 pt-6 pb-4 border-b border-border z-10">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10">
                  <svg className="size-5 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    {modalMode === "create"
                      ? <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>
                      : <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></>}
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-foreground">{modalMode === "create" ? "Tambah Karyawan" : "Edit Karyawan"}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {modalMode === "create" ? "Isi data untuk membuat akun karyawan baru" : `Edit data ${selectedEmployee?.profile?.full_name ?? selectedEmployee?.email}`}
                  </p>
                </div>
              </div>
              <button onClick={closeModal} className="flex size-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted">
                <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-5 space-y-4">
              {/* Section: Akun */}
              <SectionLabel>Data Akun</SectionLabel>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Email" required>
                  <input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)}
                    placeholder="nama@perusahaan.com"
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </FormField>
                <FormField label={modalMode === "edit" ? "Password Baru (opsional)" : "Password"} required={modalMode === "create"}>
                  <input type="password" value={form.password} onChange={(e) => setField("password", e.target.value)}
                    placeholder={modalMode === "edit" ? "Kosongkan jika tidak diubah" : "Min. 6 karakter"}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </FormField>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Status Akun</p>
                  <p className="text-xs text-muted-foreground">Karyawan bisa login jika aktif</p>
                </div>
                <button
                  type="button"
                  onClick={() => setField("is_active", !form.is_active)}
                  className={[
                    "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
                    form.is_active ? "bg-primary" : "bg-muted-foreground",
                  ].join(" ")}
                >
                  <span className={[
                    "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200",
                    form.is_active ? "translate-x-5" : "translate-x-0",
                  ].join(" ")} />
                </button>
              </div>

              {/* Section: Profil */}
              <SectionLabel>Data Profil</SectionLabel>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Nama Lengkap" required className="sm:col-span-2">
                  <input type="text" value={form.full_name} onChange={(e) => setField("full_name", e.target.value)}
                    placeholder="Masukkan nama lengkap" className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </FormField>
                <FormField label="NIP">
                  <input type="text" value={form.nip} onChange={(e) => setField("nip", e.target.value)}
                    placeholder="Nomor Induk Pegawai" className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </FormField>
                <FormField label="No. Telepon">
                  <input type="tel" value={form.phone} onChange={(e) => setField("phone", e.target.value)}
                    placeholder="08xxxxxxxxxx" className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </FormField>
                <FormField label="Departemen">
                  <input type="text" value={form.department} onChange={(e) => setField("department", e.target.value)}
                    placeholder="Contoh: Engineering" list="dept-list" className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <datalist id="dept-list">
                    {departments.map((d) => <option key={d} value={d} />)}
                  </datalist>
                </FormField>
                <FormField label="Jabatan">
                  <input type="text" value={form.position} onChange={(e) => setField("position", e.target.value)}
                    placeholder="Contoh: Backend Developer" className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </FormField>
                <FormField label="Kuota Cuti (hari/tahun)">
                  <input type="number" min={0} max={365} value={form.leave_quota}
                    onChange={(e) => setField("leave_quota", e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </FormField>
              </div>

              {formError && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/50 p-3 text-sm text-red-600 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-900/50">{formError}</div>
              )}

              <div className="flex gap-2 pt-1">
                <button onClick={closeModal}
                  className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                  Batal
                </button>
                <button
                  onClick={() => void (modalMode === "create" ? handleCreate() : handleUpdate())}
                  disabled={formLoading}
                  className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity"
                >
                  {formLoading ? "Menyimpan…" : modalMode === "create" ? "Buat Karyawan" : "Simpan Perubahan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modalMode === "delete" && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-background border border-border p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/50">
                <svg className="size-7 text-red-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                </svg>
              </div>
              <h2 className="mt-3 font-bold text-foreground">Hapus Karyawan</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Karyawan <span className="font-semibold text-foreground">
                  {selectedEmployee.profile?.full_name ?? selectedEmployee.email}
                </span> akan dihapus dari sistem.
              </p>
              <div className="mt-3 rounded-xl bg-red-50 dark:bg-red-950/50 px-4 py-2.5 text-xs text-red-700 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-900/50">
                ⚠️ Data yang dihapus tidak dapat dikembalikan.
              </div>
            </div>

            {formError && <p className="mt-3 text-center text-xs text-red-600 dark:text-red-400">{formError}</p>}

            <div className="mt-5 flex gap-2">
              <button onClick={closeModal}
                className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                Batal
              </button>
              <button onClick={() => void handleDelete()} disabled={formLoading}
                className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-60 transition-colors">
                {formLoading ? "Menghapus…" : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Small helpers ─── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">{children}</p>
  );
}

function FormField({
  label, children, required = false, className = "",
}: {
  label: string; children: React.ReactNode; required?: boolean; className?: string;
}) {
  return (
    <label className={["block", className].join(" ")}>
      <span className="mb-1.5 block text-xs font-bold text-muted-foreground">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
