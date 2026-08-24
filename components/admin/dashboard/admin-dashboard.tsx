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
    ? new Date(data.today).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "";

  if (loading) return <DashboardSkeleton />;
  if (error) return (
    <div className="rounded-2xl bg-red-50 p-6 text-center text-sm text-error ring-1 ring-red-200">
      ⚠️ {error}
    </div>
  );
  if (!data) return null;

  const attendanceRate = data.total_employees > 0
    ? Math.round((data.attendance.present / data.total_employees) * 100)
    : 0;

  const maxPresent = Math.max(...data.chart_last_7_days.map(d => d.present), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">
          {greeting()}, {user?.profile?.full_name?.split(" ")[0] ?? "Admin"}! 👋
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">{todayLabel}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          title="Total Hadir"
          value={data.attendance.present}
          total={data.total_employees}
          color="primary"
          icon="✅"
          sub={`dari ${data.total_employees} karyawan`}
        />
        <StatCard
          title="Tepat Waktu"
          value={data.attendance.on_time}
          total={data.total_employees}
          color="green"
          icon="🟢"
          sub={`${data.total_employees > 0 ? Math.round((data.attendance.on_time / data.total_employees) * 100) : 0}% kehadiran`}
        />
        <StatCard
          title="Terlambat"
          value={data.attendance.late}
          total={data.total_employees}
          color="amber"
          icon="🟡"
          sub="hari ini"
        />
        <StatCard
          title="Belum Absen"
          value={data.attendance.absent}
          total={data.total_employees}
          color="red"
          icon="🔴"
          sub="perlu tindak lanjut"
        />
      </div>

      {/* Second row */}
      <div className="grid gap-3 md:grid-cols-3">
        {/* Attendance rate */}
        <div className="rounded-2xl bg-surface p-5 ring-1 ring-outline-variant/40 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-on-surface">Tingkat Kehadiran Hari Ini</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">Persentase karyawan yang sudah absen</p>
            </div>
            <span className="text-3xl font-black text-primary">{attendanceRate}%</span>
          </div>
          {/* Progress bar */}
          <div className="h-3 rounded-full bg-surface-container-high overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
          <div className="mt-3 flex gap-4 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1.5"><span className="inline-block size-2 rounded-full bg-green-500" />Tepat waktu: {data.attendance.on_time}</span>
            <span className="flex items-center gap-1.5"><span className="inline-block size-2 rounded-full bg-amber-400" />Terlambat: {data.attendance.late}</span>
            <span className="flex items-center gap-1.5"><span className="inline-block size-2 rounded-full bg-red-400" />Belum: {data.attendance.absent}</span>
          </div>
        </div>

        {/* Leave requests */}
        <div className="rounded-2xl bg-surface p-5 ring-1 ring-outline-variant/40 space-y-4">
          <h2 className="font-bold text-on-surface">Pengajuan Izin</h2>
          <div
            className="flex items-center justify-between rounded-xl bg-amber-50 p-4 cursor-pointer hover:bg-amber-100 transition-colors ring-1 ring-amber-200"
            onClick={() => router.push("/admin/izin?status=pending")}
          >
            <div>
              <p className="text-xs font-medium text-amber-700">Menunggu Persetujuan</p>
              <p className="text-3xl font-black text-amber-600">{data.leave_requests.pending}</p>
            </div>
            <span className="text-3xl">📋</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-green-50 p-4 ring-1 ring-green-200">
            <div>
              <p className="text-xs font-medium text-green-700">Disetujui Bulan Ini</p>
              <p className="text-3xl font-black text-green-600">{data.leave_requests.approved_this_month}</p>
            </div>
            <span className="text-3xl">✅</span>
          </div>
        </div>
      </div>

      {/* Chart 7 hari */}
      <div className="rounded-2xl bg-surface p-5 ring-1 ring-outline-variant/40">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-on-surface">Kehadiran 7 Hari Terakhir</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Jumlah karyawan yang hadir per hari</p>
          </div>
          <button
            onClick={() => router.push("/admin/absensi")}
            className="text-xs font-bold text-primary hover:underline"
          >
            Lihat semua →
          </button>
        </div>

        <div className="flex items-end gap-2 h-36">
          {data.chart_last_7_days.map((d) => {
            const heightPct = maxPresent > 0 ? (d.present / maxPresent) * 100 : 0;
            const isToday = d.date === data.today;
            return (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-on-surface-variant">{d.present}</span>
                <div className="w-full flex flex-col justify-end" style={{ height: "90px" }}>
                  <div
                    className={[
                      "w-full rounded-t-lg transition-all duration-500",
                      isToday ? "bg-primary" : "bg-primary/30",
                    ].join(" ")}
                    style={{ height: `${Math.max(heightPct, 5)}%` }}
                    title={`${d.date}: ${d.present} hadir`}
                  />
                </div>
                <span className={["text-[10px] font-medium", isToday ? "text-primary font-bold" : "text-on-surface-variant"].join(" ")}>
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Monitoring Absensi", icon: "📋", href: "/admin/absensi", color: "bg-blue-50 text-blue-700 ring-blue-200" },
          { label: "Kelola Izin Pending", icon: "📝", href: "/admin/izin?status=pending", color: "bg-amber-50 text-amber-700 ring-amber-200" },
          { label: "Daftar Karyawan", icon: "👥", href: "/admin/karyawan", color: "bg-purple-50 text-purple-700 ring-purple-200" },
          { label: "Laporan Bulan Ini", icon: "📈", href: "/admin/absensi", color: "bg-green-50 text-green-700 ring-green-200" },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => router.push(action.href)}
            className={["rounded-2xl p-4 text-left ring-1 transition-all hover:scale-[1.02] hover:shadow-md", action.color].join(" ")}
          >
            <span className="text-2xl">{action.icon}</span>
            <p className="mt-2 text-sm font-bold">{action.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  title, value, total, icon, color, sub,
}: {
  title: string;
  value: number;
  total: number;
  icon: string;
  color: "primary" | "green" | "amber" | "red";
  sub: string;
}) {
  const colorMap = {
    primary: "bg-primary/8 text-primary ring-primary/20",
    green: "bg-green-50 text-green-700 ring-green-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    red: "bg-red-50 text-red-700 ring-red-200",
  };

  const numColorMap = {
    primary: "text-primary",
    green: "text-green-700",
    amber: "text-amber-700",
    red: "text-red-700",
  };

  return (
    <div className={["rounded-2xl p-4 ring-1", colorMap[color]].join(" ")}>
      <div className="flex items-start justify-between">
        <span className="text-xl">{icon}</span>
      </div>
      <p className={["mt-3 text-3xl font-black", numColorMap[color]].join(" ")}>{value}</p>
      <p className="mt-0.5 text-xs font-bold opacity-80">{title}</p>
      <p className="mt-0.5 text-[10px] opacity-60">{sub}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-64 rounded-xl bg-surface-container" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-2xl bg-surface-container" />)}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="md:col-span-2 h-40 rounded-2xl bg-surface-container" />
        <div className="h-40 rounded-2xl bg-surface-container" />
      </div>
      <div className="h-48 rounded-2xl bg-surface-container" />
    </div>
  );
}
