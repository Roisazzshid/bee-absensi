"use client";

import { useAuth } from "@/components/auth/auth-provider";
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

export function AdminEmployeePage() {
  const { request } = useAuth();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");

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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  const initials = (name: string) => name
    .split(" ")
    .map(p => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">👥 Daftar Karyawan</h1>
        <p className="mt-1 text-sm text-on-surface-variant">Seluruh karyawan yang terdaftar di sistem</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Cari nama atau NIP…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="rounded-xl border border-outline-variant bg-surface px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-52"
          />
          <button
            type="submit"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary hover:opacity-90"
          >
            Cari
          </button>
        </form>
        <select
          value={deptFilter}
          onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Semua Departemen</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {error && <div className="rounded-2xl bg-red-50 p-4 text-sm text-error ring-1 ring-red-200">⚠️ {error}</div>}

      {/* Stats */}
      {pagination && (
        <p className="text-sm text-on-surface-variant">
          Menampilkan <span className="font-semibold text-on-surface">{employees.length}</span> dari{" "}
          <span className="font-semibold text-on-surface">{pagination.total}</span> karyawan
        </p>
      )}

      {/* Grid cards */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-surface-container" />
          ))}
        </div>
      ) : employees.length === 0 ? (
        <div className="rounded-2xl bg-surface p-10 text-center ring-1 ring-outline-variant/40">
          <p className="text-4xl">🔍</p>
          <p className="mt-2 font-bold text-on-surface">Karyawan tidak ditemukan</p>
          <p className="text-sm text-on-surface-variant">Coba ubah kata kunci atau filter</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {employees.map((emp) => {
            const name = emp.profile?.full_name ?? emp.email;
            return (
              <div
                key={emp.id}
                className="flex items-start gap-4 rounded-2xl bg-surface p-4 ring-1 ring-outline-variant/40 hover:ring-primary/30 transition-all"
              >
                {/* Avatar */}
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                  {initials(name)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-bold text-on-surface">{name}</p>
                    <span className={[
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                      emp.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    ].join(" ")}>
                      {emp.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>

                  <p className="mt-0.5 text-xs text-on-surface-variant">{emp.profile?.nip ?? "-"}</p>
                  <p className="text-xs text-on-surface-variant">
                    {emp.profile?.department ?? "-"} · {emp.profile?.position ?? "-"}
                  </p>

                  <div className="mt-2 flex items-center gap-3 text-[11px] text-on-surface-variant">
                    <span title="Kuota cuti">🏖️ {emp.profile?.leave_quota ?? 0} hari</span>
                    <span title="Email">✉️ {emp.email}</span>
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
          <p className="text-sm text-on-surface-variant">
            Halaman {pagination.current_page} dari {pagination.last_page}
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
    </div>
  );
}
