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
  "bg-blue-100 text-blue-600", "bg-violet-100 text-violet-600",
  "bg-emerald-100 text-emerald-600", "bg-rose-100 text-rose-600",
  "bg-amber-100 text-amber-600", "bg-cyan-100 text-cyan-600",
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
          <h1 className="text-xl font-bold text-on-surface md:text-2xl">Daftar Karyawan</h1>
          <p className="mt-0.5 text-sm text-on-surface-variant">
            {pagination
              ? <><span className="font-semibold text-on-surface">{pagination.total}</span> karyawan terdaftar</>
              : "Seluruh karyawan yang terdaftar di sistem"}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
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
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Cari nama atau NIP…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-10 w-full rounded-xl border border-outline-variant bg-white pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button type="submit" className="h-10 rounded-xl bg-primary px-4 text-sm font-bold text-white hover:opacity-90 transition-opacity">
            Cari
          </button>
        </form>
        <select
          value={deptFilter}
          onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-xl border border-outline-variant bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Semua Departemen</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {error && <div className="rounded-2xl bg-red-50 p-4 text-sm text-error ring-1 ring-red-200">{error}</div>}

      {/* Grid */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-surface-container" />)}
        </div>
      ) : employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-14 ring-1 ring-outline-variant/40 shadow-sm">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-surface-container-low">
            <svg className="size-7 text-on-surface-variant" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <p className="mt-3 font-bold text-on-surface">Karyawan tidak ditemukan</p>
          <p className="mt-1 text-sm text-on-surface-variant">Coba ubah kata kunci atau tambah karyawan baru</p>
          <button onClick={openCreate} className="mt-4 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white hover:opacity-90">
            + Tambah Karyawan
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {employees.map((emp) => {
            const name = emp.profile?.full_name ?? emp.email;
            const color = avatarColor(name);
            return (
              <div key={emp.id} className="group rounded-2xl bg-white p-4 ring-1 ring-outline-variant/40 shadow-sm hover:ring-primary/30 hover:shadow-md transition-all duration-200">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className={["flex size-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold", color].join(" ")}>
                    {initials(name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="truncate font-bold text-on-surface text-sm">{name}</p>
                      <span className={[
                        "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                        emp.is_active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600",
                      ].join(" ")}>
                        {emp.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">{emp.profile?.nip ?? "—"}</p>
                    <div className="mt-1 flex items-center gap-1 flex-wrap">
                      {emp.profile?.department && (
                        <span className="rounded-md bg-surface-container-low px-1.5 py-0.5 text-[10px] font-semibold text-on-surface-variant">
                          {emp.profile.department}
                        </span>
                      )}
                      {emp.profile?.position && (
                        <span className="text-[10px] text-on-surface-variant">· {emp.profile.position}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer info */}
                <div className="mt-3 flex items-center gap-3 border-t border-outline-variant/20 pt-3 text-[11px] text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <svg className="size-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                    </svg>
                    Cuti: <span className="font-bold text-on-surface ml-0.5">{emp.profile?.leave_quota ?? 0}</span>
                  </span>
                  <span className="flex-1 truncate">{emp.email}</span>
                </div>

                {/* Action buttons — show on hover on desktop, always on mobile */}
                <div className="mt-3 grid grid-cols-3 gap-1.5 md:hidden md:group-hover:grid">
                  <button
                    onClick={() => openEdit(emp)}
                    className="flex items-center justify-center gap-1 rounded-xl bg-primary/8 py-2 text-xs font-bold text-primary hover:bg-primary/15 transition-colors"
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
                        ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
                    ].join(" ")}
                  >
                    <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M18.36 6.64a9 9 0 11-12.73 0M12 2v10" />
                    </svg>
                    {emp.is_active ? "Nonaktif" : "Aktifkan"}
                  </button>
                  <button
                    onClick={() => openDelete(emp)}
                    className="flex items-center justify-center gap-1 rounded-xl bg-red-50 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                    </svg>
                    Hapus
                  </button>
                </div>

                {/* Desktop hover actions */}
                <div className="mt-3 hidden gap-1.5 md:group-hover:grid grid-cols-3">
                  <button onClick={() => openEdit(emp)}
                    className="flex items-center justify-center gap-1 rounded-xl bg-primary/8 py-2 text-xs font-bold text-primary hover:bg-primary/15 transition-colors">
                    <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </button>
                  <button onClick={() => void handleToggleActive(emp)}
                    className={["flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-bold transition-colors",
                      emp.is_active ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"].join(" ")}>
                    <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M18.36 6.64a9 9 0 11-12.73 0M12 2v10" />
                    </svg>
                    {emp.is_active ? "Nonaktif" : "Aktifkan"}
                  </button>
                  <button onClick={() => openDelete(emp)}
                    className="flex items-center justify-center gap-1 rounded-xl bg-red-50 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors">
                    <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
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
          <p className="text-xs text-on-surface-variant">
            Halaman <span className="font-bold text-on-surface">{pagination.current_page}</span> dari{" "}
            <span className="font-bold text-on-surface">{pagination.last_page}</span>
          </p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
              className="flex items-center gap-1 rounded-xl border border-outline-variant bg-white px-3 py-2 text-xs font-semibold disabled:opacity-40 hover:bg-surface-container-low">
              <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg> Prev
            </button>
            <button disabled={page >= pagination.last_page} onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1 rounded-xl border border-outline-variant bg-white px-3 py-2 text-xs font-semibold disabled:opacity-40 hover:bg-surface-container-low">
              Next <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────── MODALS ──────────────────── */}

      {/* Create / Edit Modal */}
      {(modalMode === "create" || modalMode === "edit") && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="sticky top-0 flex items-center justify-between bg-white px-6 pt-6 pb-4 border-b border-outline-variant/30">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10">
                  <svg className="size-5 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    {modalMode === "create"
                      ? <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>
                      : <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></>}
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-on-surface">{modalMode === "create" ? "Tambah Karyawan" : "Edit Karyawan"}</h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {modalMode === "create" ? "Isi data untuk membuat akun karyawan baru" : `Edit data ${selectedEmployee?.profile?.full_name ?? selectedEmployee?.email}`}
                  </p>
                </div>
              </div>
              <button onClick={closeModal} className="flex size-8 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-low">
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
                    className="field-input" />
                </FormField>
                <FormField label={modalMode === "edit" ? "Password Baru (opsional)" : "Password"} required={modalMode === "create"}>
                  <input type="password" value={form.password} onChange={(e) => setField("password", e.target.value)}
                    placeholder={modalMode === "edit" ? "Kosongkan jika tidak diubah" : "Min. 6 karakter"}
                    className="field-input" />
                </FormField>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-3">
                <div>
                  <p className="text-sm font-semibold text-on-surface">Status Akun</p>
                  <p className="text-xs text-on-surface-variant">Karyawan bisa login jika aktif</p>
                </div>
                <button
                  type="button"
                  onClick={() => setField("is_active", !form.is_active)}
                  className={[
                    "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
                    form.is_active ? "bg-primary" : "bg-outline-variant",
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
                    placeholder="Masukkan nama lengkap" className="field-input" />
                </FormField>
                <FormField label="NIP">
                  <input type="text" value={form.nip} onChange={(e) => setField("nip", e.target.value)}
                    placeholder="Nomor Induk Pegawai" className="field-input" />
                </FormField>
                <FormField label="No. Telepon">
                  <input type="tel" value={form.phone} onChange={(e) => setField("phone", e.target.value)}
                    placeholder="08xxxxxxxxxx" className="field-input" />
                </FormField>
                <FormField label="Departemen">
                  <input type="text" value={form.department} onChange={(e) => setField("department", e.target.value)}
                    placeholder="Contoh: Engineering" list="dept-list" className="field-input" />
                  <datalist id="dept-list">
                    {departments.map((d) => <option key={d} value={d} />)}
                  </datalist>
                </FormField>
                <FormField label="Jabatan">
                  <input type="text" value={form.position} onChange={(e) => setField("position", e.target.value)}
                    placeholder="Contoh: Backend Developer" className="field-input" />
                </FormField>
                <FormField label="Kuota Cuti (hari/tahun)">
                  <input type="number" min={0} max={365} value={form.leave_quota}
                    onChange={(e) => setField("leave_quota", e.target.value)}
                    className="field-input" />
                </FormField>
              </div>

              {formError && (
                <div className="rounded-xl bg-red-50 p-3 text-sm text-error ring-1 ring-red-200">{formError}</div>
              )}

              <div className="flex gap-2 pt-1">
                <button onClick={closeModal}
                  className="flex-1 rounded-xl border border-outline-variant py-3 text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors">
                  Batal
                </button>
                <button
                  onClick={() => void (modalMode === "create" ? handleCreate() : handleUpdate())}
                  disabled={formLoading}
                  className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
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
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-red-50">
                <svg className="size-7 text-red-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                </svg>
              </div>
              <h2 className="mt-3 font-bold text-on-surface">Hapus Karyawan</h2>
              <p className="mt-1.5 text-sm text-on-surface-variant">
                Karyawan <span className="font-semibold text-on-surface">
                  {selectedEmployee.profile?.full_name ?? selectedEmployee.email}
                </span> akan dihapus dari sistem.
              </p>
              <div className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-xs text-red-700 ring-1 ring-red-200">
                ⚠️ Data yang dihapus tidak dapat dikembalikan.
              </div>
            </div>

            {formError && <p className="mt-3 text-center text-xs text-error">{formError}</p>}

            <div className="mt-5 flex gap-2">
              <button onClick={closeModal}
                className="flex-1 rounded-xl border border-outline-variant py-3 text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors">
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
    <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant/60">{children}</p>
  );
}

function FormField({
  label, children, required = false, className = "",
}: {
  label: string; children: React.ReactNode; required?: boolean; className?: string;
}) {
  return (
    <label className={["block", className].join(" ")}>
      <span className="mb-1.5 block text-xs font-bold text-on-surface-variant">
        {label}{required && <span className="ml-0.5 text-error">*</span>}
      </span>
      {children}
    </label>
  );
}
