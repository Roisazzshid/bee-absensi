"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type DashboardData = {
  today: string;
  total_employees: number;
  attendance: { present: number; on_time: number; late: number; absent: number };
  leave_requests: { pending: number; approved_this_month: number };
  chart_last_7_days: { date: string; day: string; present: number; on_time: number; late: number; absent: number }[];
};

export function AdminDashboard() {
  const { request, user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const res = await request<DashboardData>("/admin/dashboard");
        setData(res);
      } catch {
        setError("Gagal memuat data dashboard.");
      } finally {
        setLoading(false);
      }
    })();
  }, [request]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 11) return "Selamat pagi";
    if (h < 15) return "Selamat siang";
    if (h < 18) return "Selamat sore";
    return "Selamat malam";
  };

  const todayLabel = data
    ? (() => {
        const parts = data.today.split("-");
        if (parts.length === 3) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          const d = parseInt(parts[2], 10);
          return new Date(y, m, d).toLocaleDateString("id-ID", {
            weekday: "long", day: "numeric", month: "long", year: "numeric",
          });
        }
        return new Date(data.today).toLocaleDateString("id-ID", {
          weekday: "long", day: "numeric", month: "long", year: "numeric",
        });
      })()
    : "";

  if (loading) return <DashboardSkeleton />;
  if (error) return (
    <div className="rounded-2xl bg-red-50 p-5 text-sm text-error ring-1 ring-red-200 flex items-center gap-3">
      <span className="text-xl">⚠️</span> {error}
    </div>
  );
  if (!data) return null;

  const attendanceRate = data.total_employees > 0
    ? Math.round((data.attendance.present / data.total_employees) * 100)
    : 0;

  const maxPresent = Math.max(...data.chart_last_7_days.map((d) => d.present), 1);

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface md:text-2xl">
            {greeting()}, {user?.profile?.full_name?.split(" ")[0] ?? "Admin"} 👋
          </h1>
          <p className="mt-0.5 text-sm text-on-surface-variant">{todayLabel}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => router.push("/admin/laporan")}
            className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
          >
            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">Laporan & Export</span>
            <span className="sm:hidden">Laporan</span>
          </button>
          {/* Live badge */}
          <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 ring-1 ring-green-200">
            <span className="size-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[11px] font-bold text-green-700">Live</span>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Total Hadir"
          value={data.attendance.present}
          sub={`dari ${data.total_employees} karyawan`}
          colorBg="bg-primary/6"
          colorText="text-primary"
          icon={
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          }
        />
        <StatCard
          label="Tepat Waktu"
          value={data.attendance.on_time}
          sub={`${data.total_employees > 0 ? Math.round((data.attendance.on_time / data.total_employees) * 100) : 0}% dari total`}
          colorBg="bg-emerald-50"
          colorText="text-emerald-600"
          icon={
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <StatCard
          label="Terlambat"
          value={data.attendance.late}
          sub="hari ini"
          colorBg="bg-amber-50"
          colorText="text-amber-600"
          icon={
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }
        />
        <StatCard
          label="Belum Absen"
          value={data.attendance.absent}
          sub="perlu tindak lanjut"
          colorBg="bg-red-50"
          colorText="text-red-500"
          icon={
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
        />
      </div>

      {/* ── Row 2: Progress + Leave ── */}
      <div className="grid gap-3 md:grid-cols-3">
        {/* Attendance rate card */}
        <div className="rounded-2xl bg-white p-5 ring-1 ring-outline-variant/40 shadow-sm md:col-span-2">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="font-bold text-on-surface">Tingkat Kehadiran</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">Persentase karyawan hadir hari ini</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-3xl font-black text-primary">{attendanceRate}%</p>
              <p className="text-[10px] text-on-surface-variant">dari target 100%</p>
            </div>
          </div>

          {/* Segmented progress bar */}
          <div className="h-3 rounded-full bg-surface-container-high overflow-hidden">
            <div className="flex h-full">
              <div
                className="h-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${data.total_employees > 0 ? (data.attendance.on_time / data.total_employees) * 100 : 0}%` }}
              />
              <div
                className="h-full bg-amber-400 transition-all duration-700"
                style={{ width: `${data.total_employees > 0 ? (data.attendance.late / data.total_employees) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            <Legend color="bg-emerald-500" label="Tepat Waktu" value={data.attendance.on_time} />
            <Legend color="bg-amber-400" label="Terlambat" value={data.attendance.late} />
            <Legend color="bg-surface-container-high" label="Belum Hadir" value={data.attendance.absent} />
          </div>
        </div>

        {/* Leave card */}
        <div className="rounded-2xl bg-white p-5 ring-1 ring-outline-variant/40 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-on-surface">Pengajuan Izin</h2>
            <button
              onClick={() => router.push("/admin/izin")}
              className="text-xs font-bold text-primary hover:underline"
            >
              Lihat →
            </button>
          </div>

          <button
            onClick={() => router.push("/admin/izin?status=pending")}
            className="flex w-full items-center justify-between rounded-xl bg-amber-50 p-3.5 ring-1 ring-amber-200 hover:ring-amber-400 transition-all text-left"
          >
            <div>
              <p className="text-[11px] font-semibold text-amber-700">Menunggu Persetujuan</p>
              <p className="text-2xl font-black text-amber-600 mt-0.5">{data.leave_requests.pending}</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100">
              <svg className="size-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </button>

          <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3.5 ring-1 ring-emerald-200">
            <div>
              <p className="text-[11px] font-semibold text-emerald-700">Disetujui Bulan Ini</p>
              <p className="text-2xl font-black text-emerald-600 mt-0.5">{data.leave_requests.approved_this_month}</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100">
              <svg className="size-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bar Chart 7 hari ── */}
      <div className="rounded-2xl bg-white p-5 ring-1 ring-outline-variant/40 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-on-surface">Kehadiran 7 Hari Terakhir</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Jumlah karyawan hadir per hari</p>
          </div>
          <button
            onClick={() => router.push("/admin/absensi")}
            className="text-xs font-bold text-primary hover:underline shrink-0"
          >
            Lihat semua →
          </button>
        </div>

        <div className="flex items-end justify-between gap-1.5" style={{ height: "120px" }}>
          {data.chart_last_7_days.map((d) => {
            const heightPct = (d.present / maxPresent) * 100;
            const isToday = d.date === data.today;
            return (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
                <span className={["text-[10px] font-bold", isToday ? "text-primary" : "text-on-surface-variant"].join(" ")}>
                  {d.present}
                </span>
                <div className="relative w-full flex flex-col justify-end rounded-t-md overflow-hidden bg-primary/8" style={{ height: "80px" }}>
                  <div
                    className={["w-full rounded-t-md transition-all duration-700", isToday ? "bg-primary" : "bg-primary/40"].join(" ")}
                    style={{ height: `${Math.max(heightPct, 6)}%` }}
                  />
                  {isToday && (
                    <div className="absolute bottom-full left-0 right-0 flex justify-center mb-0.5">
                      <div className="size-1.5 rounded-full bg-primary" />
                    </div>
                  )}
                </div>
                <span className={["text-[10px] font-semibold", isToday ? "text-primary" : "text-on-surface-variant"].join(" ")}>
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>

        {/* Chart legend */}
        <div className="mt-4 flex gap-4 text-[11px] text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-sm bg-primary" />Hari ini
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-sm bg-primary/40" />Hari lain
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function StatCard({
  label, value, sub, colorBg, colorText, icon,
}: {
  label: string; value: number; sub: string;
  colorBg: string; colorText: string; icon: React.ReactNode;
}) {
  return (
    <div className={["rounded-2xl p-4 ring-1 ring-outline-variant/30 shadow-sm", colorBg].join(" ")}>
      <div className={["flex size-9 items-center justify-center rounded-xl mb-3", colorBg, "ring-1 ring-black/5"].join(" ")}>
        <span className={colorText}>{icon}</span>
      </div>
      <p className={["text-3xl font-black leading-none", colorText].join(" ")}>{value}</p>
      <p className="mt-1.5 text-xs font-bold text-on-surface">{label}</p>
      <p className="mt-0.5 text-[10px] text-on-surface-variant">{sub}</p>
    </div>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-on-surface-variant">
      <span className={["inline-block size-2.5 rounded-full", color].join(" ")} />
      {label}: <span className="font-bold text-on-surface">{value}</span>
    </span>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-10 w-56 rounded-xl bg-surface-container" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-2xl bg-surface-container" />)}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="md:col-span-2 h-36 rounded-2xl bg-surface-container" />
        <div className="h-36 rounded-2xl bg-surface-container" />
      </div>
      <div className="h-44 rounded-2xl bg-surface-container" />
    </div>
  );
}
