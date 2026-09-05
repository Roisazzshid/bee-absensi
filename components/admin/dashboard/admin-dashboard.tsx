"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

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
    <div className="rounded-2xl p-5 text-sm flex items-center gap-3 bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900/50">
      <svg className="size-5 shrink-0 fill-current text-red-600 dark:text-red-400" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"/>
      </svg>
      {error}
    </div>
  );
  if (!data) return null;

  const attendanceRate = data.total_employees > 0
    ? Math.round((data.attendance.present / data.total_employees) * 100)
    : 0;

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {greeting()}, {user?.profile?.full_name ?? "Administrator"}!
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <svg className="size-4 text-primary fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75A3.75 3.75 0 0122.5 8.25v10.5A3.75 3.75 0 0118.75 22.5H5.25A3.75 3.75 0 011.5 18.75V8.25A3.75 3.75 0 015.25 4.5H6V3a.75.75 0 01.75-.75zm14.25 7.5H3v9a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 19.5v-9z"/>
            </svg>
            <p className="text-sm text-primary">{todayLabel}</p>
          </div>
        </div>
        <button
          onClick={() => router.push("/admin/laporan")}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary/90 active:scale-95 bg-primary cursor-pointer"
        >
          <svg className="size-4 fill-current" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z"/>
          </svg>
          <span className="hidden sm:inline">Export Laporan</span>
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="TOTAL HADIR"
          value={data.attendance.present}
          iconBgClass="bg-green-500/15"
          icon={
            <svg className="size-6 text-green-600 dark:text-green-500 fill-current" viewBox="0 0 24 24">
              <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.232.75.75 0 00.424-.672v-.003a5.625 5.625 0 00-7.072-5.385 7.12 7.12 0 011.822 6.188z"/>
            </svg>
          }
        />
        <StatCard
          label="TEPAT WAKTU"
          value={data.attendance.on_time}
          iconBgClass="bg-primary/15"
          icon={
            <svg className="size-6 text-primary fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"/>
            </svg>
          }
        />
        <StatCard
          label="TERLAMBAT"
          value={data.attendance.late}
          iconBgClass="bg-orange-500/15"
          icon={
            <svg className="size-6 text-orange-600 dark:text-orange-500 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75-4.365 9.75-9.75 9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"/>
            </svg>
          }
        />
        <StatCard
          label="BELUM ABSEN"
          value={data.attendance.absent}
          iconBgClass="bg-red-500/15"
          icon={
            <svg className="size-6 text-red-600 dark:text-red-500 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75-4.365 9.75-9.75 9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"/>
            </svg>
          }
        />
      </div>

      {/* ── Row 2: Persentase Kehadiran + Pengajuan Izin ── */}
      <div className="grid gap-3 lg:grid-cols-5">
        {/* Donut chart card */}
        <div className="relative overflow-hidden rounded-3xl p-5 lg:col-span-3 border border-border bg-card shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f5c518] to-[#d97706]" />
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base text-foreground">Persentase Kehadiran</h2>
            <span className="rounded-full px-3 py-1 text-xs font-semibold bg-primary/10 text-primary">Hari Ini</span>
          </div>

          {/* SVG Donut Chart */}
          <div className="flex justify-center my-4">
            <DonutChart
              onTime={data.attendance.on_time}
              late={data.attendance.late}
              absent={data.attendance.absent}
              total={data.total_employees}
              rate={attendanceRate}
            />
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[#f5c518]" />
              <span className="text-xs text-muted-foreground">Tepat Waktu ({data.attendance.on_time})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[#f97316]" />
              <span className="text-xs text-muted-foreground">Terlambat ({data.attendance.late})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[#ef4444]" />
              <span className="text-xs text-muted-foreground">Belum ({data.attendance.absent})</span>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 flex flex-col">
          {/* Pengajuan Izin Card — full height */}
          <div className="relative overflow-hidden flex-1 rounded-3xl p-4 border border-border bg-card shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f5c518] to-[#d97706]" />
            <div className="flex items-center gap-2 mb-4">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#f5c518] to-[#d97706]">
                <svg className="size-4 text-white dark:text-black fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 2.071-1.679 3.75-3.75 3.75H5.625a3.75 3.75 0 01-3.75-3.75V5.25c0-2.071 1.679-3.75 3.75-3.75zm8.25 1.625v3.375c0 .207.168.375.375.375h3.375l-3.75-3.75zM7.5 12a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 12zm0 3.75a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zm0 3.75a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75z"/>
                </svg>
              </div>
              <h2 className="font-bold text-sm text-foreground">Pengajuan Izin</h2>
            </div>

            {/* Menunggu Persetujuan */}
            <button
              onClick={() => router.push("/admin/izin?status=pending")}
              className="flex w-full items-center justify-between py-3 px-1 transition-colors rounded-lg hover:bg-muted border-b border-border"
            >
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#f97316]" />
                <span className="text-sm text-muted-foreground">Menunggu Persetujuan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">{data.leave_requests.pending}</span>
                <svg className="size-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
                </svg>
              </div>
            </button>

            {/* Disetujui Bulan Ini */}
            <button
              onClick={() => router.push("/admin/izin?status=approved")}
              className="flex w-full items-center justify-between py-3 px-1 transition-colors rounded-lg hover:bg-muted mt-1"
            >
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#22c55e]" />
                <span className="text-sm text-muted-foreground">Disetujui Bulan Ini</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">{data.leave_requests.approved_this_month}</span>
                <svg className="size-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ── Bar Chart 7 hari ── */}
      <div className="relative overflow-hidden rounded-3xl p-5 border border-border bg-card shadow-2xl mt-3">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f5c518] to-[#d97706]" />
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-bold text-base text-foreground">Kehadiran 7 Hari Terakhir</h2>
            <p className="text-xs mt-0.5 text-primary">Tren tingkat kehadiran karyawan mingguan</p>
          </div>
          <button
            onClick={() => router.push("/admin/absensi")}
            className="flex items-center gap-1 text-xs font-semibold transition-colors hover:opacity-80 text-primary"
          >
            Lihat Detail
            <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <LineChart data={data.chart_last_7_days} today={data.today} total={data.total_employees} />
      </div>
    </div>
  );
}

/* ── Donut Chart ── */
function DonutChart({ onTime, late, absent, total, rate }: {
  onTime: number; late: number; absent: number; total: number; rate: number;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const size = 160;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const safeTotal = total || 1;
  const onTimePct = onTime / safeTotal;
  const latePct = late / safeTotal;
  const absentPct = absent / safeTotal;
  const emptyPct = Math.max(0, 1 - onTimePct - latePct - absentPct);

  const gap = 0.01;
  const onTimeEnd = onTimePct;
  const lateEnd = onTimeEnd + latePct;
  const absentEnd = lateEnd + absentPct;

  function Segment({ pct, offset, color }: { pct: number; offset: number; color: string }) {
    const dashLen = Math.max(0, pct - gap) * circumference;
    const dashOff = (1 - offset) * circumference;
    return (
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dashLen} ${circumference}`}
        strokeDashoffset={dashOff}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.7s ease" }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    );
  }

  const emptyColor = isDark ? "#1a1a1a" : "#f1f5f9";
  const trackColor = isDark ? "#1a1a1a" : "#f1f5f9";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size}>
        {/* Background track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={trackColor} strokeWidth={strokeWidth}
        />
        {/* Segments */}
        <Segment pct={onTimePct} offset={0} color="#f5c518" />
        <Segment pct={latePct} offset={onTimeEnd} color="#f97316" />
        <Segment pct={absentPct} offset={lateEnd} color="#ef4444" />
        {/* Empty if < 100% */}
        {emptyPct > 0.01 && (
          <Segment pct={emptyPct} offset={absentEnd} color={emptyColor} />
        )}
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-foreground">{rate}%</span>
        <span className="text-xs text-muted-foreground">Tingkat Hadir</span>
      </div>
    </div>
  );
}

/* ── Line/Area Chart ── */
function LineChart({ data, today, total }: {
  data: DashboardData["chart_last_7_days"];
  today: string;
  total: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const isDark = theme === "dark";
    const gridColor = isDark ? "#27272a" : "#e2e8f0";
    
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || data.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = 140;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const padL = 30, padR = 20, padT = 20, padB = 30;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    const maxVal = Math.max(...data.map((d) => d.present), total, 1);

    const xPos = (i: number) => padL + (i / (data.length - 1)) * chartW;
    const yPos = (v: number) => padT + chartH - (v / maxVal) * chartH;

    // Draw horizontal grid lines
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = padT + (i / gridLines) * chartH;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(w - padR, y);
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Y-axis labels
      const val = Math.round(maxVal - (i / gridLines) * maxVal);
      ctx.fillStyle = isDark ? "#c9a84c" : "#92400e";
      ctx.font = "10px system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(String(val), padL - 4, y + 3);
    }

    // Draw area gradient
    const gradient = ctx.createLinearGradient(0, padT, 0, padT + chartH);
    gradient.addColorStop(0, "rgba(245,197,24,0.25)");
    gradient.addColorStop(1, "rgba(245,197,24,0.02)");

    ctx.beginPath();
    data.forEach((d, i) => {
      const x = xPos(i);
      const y = yPos(d.present);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    // Close to bottom
    ctx.lineTo(xPos(data.length - 1), padT + chartH);
    ctx.lineTo(xPos(0), padT + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = xPos(i);
      const y = yPos(d.present);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#d97706";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.stroke();

    // Draw dots and x-labels
    data.forEach((d, i) => {
      const x = xPos(i);
      const y = yPos(d.present);
      const isToday = d.date === today;

      // Dot
      ctx.beginPath();
      ctx.arc(x, y, isToday ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isToday ? "#d97706" : "#fcd34d";
      ctx.fill();
      if (isToday) {
        ctx.strokeStyle = isDark ? "#000000" : "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // X-label (shortened date)
      const label = d.date ? d.date.slice(5).replace("-", " ").replace(/^0/, "") : d.day;
      const months = ["","Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
      const [mm, dd] = d.date.split("-").slice(1);
      const shortLabel = `${parseInt(dd)} ${months[parseInt(mm)] ?? ""}`;

      ctx.fillStyle = isToday ? "#d97706" : (isDark ? "#c9a84c" : "#92400e");
      ctx.font = `${isToday ? "bold " : ""}10px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(shortLabel, x, h - 6);
    });

  }, [data, today, total, theme]);

  return (
    <div ref={containerRef} className="w-full">
      <canvas ref={canvasRef} style={{ display: "block", width: "100%" }} />
    </div>
  );
}

function StatCard({ label, value, icon, iconBgClass }: {
  label: string; value: number; icon: React.ReactNode; iconBgClass: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl p-5 border border-border bg-card shadow-2xl">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f5c518] to-[#d97706]" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider mb-2 text-muted-foreground">{label}</p>
          <p className="text-3xl font-black leading-none text-foreground">{value}</p>
        </div>
        <div className={`flex size-10 items-center justify-center rounded-xl ${iconBgClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton ── */
function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-10 w-72 rounded-xl bg-muted" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 rounded-2xl bg-muted" />)}
      </div>
      <div className="grid gap-3 lg:grid-cols-5">
        <div className="lg:col-span-3 h-64 rounded-2xl bg-muted" />
        <div className="lg:col-span-2 h-64 rounded-2xl bg-muted" />
      </div>
      <div className="h-52 rounded-2xl bg-muted" />
    </div>
  );
}
