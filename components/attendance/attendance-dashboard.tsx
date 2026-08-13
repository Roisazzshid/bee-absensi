"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Badge, Button, Card } from "@/components/ui";
import { ApiError } from "@/lib/api";
import { useCallback, useEffect, useMemo, useState } from "react";

type Attendance = { id: number; date: string; clock_in_time: string | null; clock_out_time: string | null; status: "on_time" | "late" | string };
type Coordinates = { latitude: number; longitude: number; accuracy: number };

function formatTime(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value.slice(11, 16) : new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
}

function positionError(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) return "Izin lokasi ditolak. Aktifkan izin lokasi di browser untuk absensi.";
  if (error.code === error.POSITION_UNAVAILABLE) return "Lokasi belum tersedia. Periksa GPS atau koneksi Anda.";
  return "Pengambilan lokasi terlalu lama. Silakan coba lagi.";
}

export function AttendanceDashboard() {
  const { user, request } = useAuth();
  const [now, setNow] = useState(() => new Date());
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locationState, setLocationState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const refreshAttendance = useCallback(async () => {
    setLoadingAttendance(true);
    try { setAttendance(await request<Attendance | null>("/attendance/today")); }
    catch (caught) { setError(caught instanceof ApiError ? caught.message : "Status absensi tidak dapat dimuat."); }
    finally { setLoadingAttendance(false); }
  }, [request]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void refreshAttendance(); }, 0);
    return () => window.clearTimeout(timer);
  }, [refreshAttendance]);
  useEffect(() => { const interval = window.setInterval(() => setNow(new Date()), 1_000); return () => window.clearInterval(interval); }, []);

  const action = attendance?.clock_out_time ? "done" : attendance?.clock_in_time ? "out" : "in";
  const title = action === "in" ? "Clock in" : action === "out" ? "Clock out" : "Absensi selesai";
  const name = user?.profile?.full_name?.split(" ")[0] ?? "Karyawan";
  const dateLabel = useMemo(() => new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now), [now]);

  function getLocation() {
    setError(null); setMessage(null);
    if (!navigator.geolocation) { setLocationState("error"); setError("Browser ini tidak mendukung lokasi."); return; }
    setLocationState("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => { setCoordinates({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy }); setLocationState("ready"); },
      (positionErrorValue) => { setLocationState("error"); setError(positionError(positionErrorValue)); },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 },
    );
  }

  async function submitAttendance() {
    if (!coordinates) { setError("Aktifkan lokasi terlebih dahulu sebelum melakukan absensi."); return; }
    setSubmitting(true); setError(null); setMessage(null);
    try {
      const endpoint = action === "in" ? "/attendance/clock-in" : "/attendance/clock-out";
      const result = await request<{ attendance_id: number }>(endpoint, { method: "POST", body: JSON.stringify(coordinates) });
      setMessage(action === "in" ? "Clock in berhasil dicatat." : "Clock out berhasil dicatat.");
      await refreshAttendance();
      void result;
    } catch (caught) {
      const apiError = caught instanceof ApiError ? caught : null;
      const distance = apiError?.errors?.distance;
      setError(typeof distance === "string" ? `${apiError?.message} ${distance}` : apiError?.message ?? "Absensi gagal dicatat. Coba lagi.");
    } finally { setSubmitting(false); }
  }

  return <section className="mx-auto flex max-w-md flex-col gap-6 pb-3 text-center sm:py-4">
    <div><p className="text-xl font-semibold text-on-surface">Selamat datang, {name}</p><p className="mt-2 text-sm capitalize text-on-surface-variant">{dateLabel}</p><p className="mt-3 text-5xl font-bold tracking-tight text-primary tabular-nums">{new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(now)}</p><p className="mt-1 text-xs font-bold tracking-widest text-on-surface-variant">WAKTU PERANGKAT</p></div>

    <Card className="text-left"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-lg" aria-hidden="true">&#8982;</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-on-surface">Lokasi untuk absensi</h2><Badge tone={locationState === "ready" ? "success" : "neutral"}>{locationState === "loading" ? "Mencari…" : locationState === "ready" ? "Siap" : "Belum aktif"}</Badge></div><p className="mt-1 text-sm leading-5 text-on-surface-variant">{coordinates ? `Akurasi lokasi sekitar ${Math.round(coordinates.accuracy)} meter.` : "Izinkan akses lokasi agar sistem dapat memeriksa area kantor."}</p><Button variant="ghost" onClick={getLocation} disabled={locationState === "loading"} className="mt-2 min-h-0 px-0 py-1 text-xs">{locationState === "loading" ? "Mengambil lokasi…" : coordinates ? "Perbarui lokasi" : "Aktifkan lokasi"}</Button></div></div></Card>

    <div className="rounded-full bg-linear-to-b from-primary to-primary-container p-1 shadow-[0_10px_40px_rgba(7,95,171,0.3)]"><div className="flex aspect-square w-full items-center justify-center rounded-full border border-white/20 bg-primary/15 p-8 text-on-primary"><div><p className="text-2xl font-bold tracking-wide">{loadingAttendance ? "Memuat…" : title}</p><p className="mt-2 text-sm">{action === "in" ? "Catat kehadiran Anda" : action === "out" ? "Catat waktu pulang Anda" : "Sampai jumpa besok"}</p></div></div></div>

    <Card className="grid grid-cols-2 gap-4 text-left"><div><p className="text-xs font-bold text-on-surface-variant">MASUK</p><p className="mt-1 text-xl font-bold text-on-surface">{formatTime(attendance?.clock_in_time ?? null)}</p>{attendance?.status && <Badge tone={attendance.status === "late" ? "primary" : "success"}>{attendance.status === "late" ? "Terlambat" : "Tepat waktu"}</Badge>}</div><div className="border-l border-surface-container pl-4"><p className="text-xs font-bold text-on-surface-variant">PULANG</p><p className="mt-1 text-xl font-bold text-on-surface">{formatTime(attendance?.clock_out_time ?? null)}</p><p className="mt-2 text-xs text-on-surface-variant">{action === "done" ? "Selesai" : "Belum dicatat"}</p></div></Card>

    {error && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-left text-sm leading-5 text-error">{error}</p>}
    {message && <p role="status" className="rounded-2xl bg-secondary-container px-4 py-3 text-left text-sm leading-5 text-secondary">{message}</p>}
    <div className="space-y-3"><Button className="h-16 text-base" fullWidth onClick={() => void submitAttendance()} disabled={action === "done" || submitting || loadingAttendance}>{submitting ? "Memproses…" : title}</Button><p className="text-xs leading-5 text-on-surface-variant">Absensi hanya dapat dilakukan dari area kantor yang telah ditentukan.</p></div>
  </section>;
}
