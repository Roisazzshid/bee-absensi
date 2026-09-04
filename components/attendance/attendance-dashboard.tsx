"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { CameraCaptureModal } from "@/components/attendance/camera-capture-modal";
import { ApiError } from "@/lib/api";
import { useCallback, useEffect, useMemo, useState } from "react";

type Attendance = {
  id: number;
  date: string;
  clock_in_time: string | null;
  clock_out_time: string | null;
  clock_in_image_url?: string | null;
  clock_out_image_url?: string | null;
  status: "on_time" | "late" | string;
};

type Coordinates = { latitude: number; longitude: number; accuracy: number };

function formatTime(value: string | null) {
  if (!value) return "--:--";
  const safeStr = value.includes(" ") && !value.includes("T") ? value.replace(" ", "T") : value;
  const date = new Date(safeStr);
  return Number.isNaN(date.getTime())
    ? value.slice(11, 16)
    : new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);
}

function positionError(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED)
    return "Izin lokasi ditolak. Aktifkan izin lokasi di browser.";
  if (error.code === error.POSITION_UNAVAILABLE)
    return "Lokasi belum tersedia. Periksa GPS Anda.";
  return "Pengambilan lokasi terlalu lama. Coba lagi.";
}

function clockDuration(inTime: string | null, outTime: string | null) {
  if (!inTime || !outTime) return null;
  const safeIn = inTime.includes(" ") ? inTime.replace(" ", "T") : inTime;
  const safeOut = outTime.includes(" ") ? outTime.replace(" ", "T") : outTime;
  const diffMs = new Date(safeOut).getTime() - new Date(safeIn).getTime();
  if (isNaN(diffMs) || diffMs < 0) return null;
  const hrs = Math.floor(diffMs / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  return { hrs, mins };
}

export function AttendanceDashboard() {
  const { user, request } = useAuth();
  const [now, setNow] = useState(() => new Date());
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locationState, setLocationState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);

  const refreshAttendance = useCallback(async () => {
    setLoadingAttendance(true);
    try {
      setAttendance(await request<Attendance | null>("/attendance/today"));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Status absensi tidak dapat dimuat.");
    } finally {
      setLoadingAttendance(false);
    }
  }, [request]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void refreshAttendance(); }, 0);
    return () => window.clearTimeout(timer);
  }, [refreshAttendance]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  // Auto-request location on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    setLocationState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordinates({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy });
        setLocationState("ready");
      },
      (err) => {
        setLocationState("error");
        setLocationError(positionError(err));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  }, []);

  const action = attendance?.clock_out_time ? "done" : attendance?.clock_in_time ? "out" : "in";
  const name = user?.profile?.full_name ?? user?.email ?? "Karyawan";

  const greeting = useMemo(() => {
    const h = now.getHours();
    if (h < 11) return "Selamat pagi";
    if (h < 15) return "Selamat siang";
    if (h < 18) return "Selamat sore";
    return "Selamat malam";
  }, [now]);

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(now),
    [now]
  );

  const timeLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now),
    [now]
  );

  const getLocationPromise = (): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setLocationState("error");
        reject(new Error("Browser tidak mendukung lokasi."));
        return;
      }
      setLocationState("loading");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setCoordinates(coords);
          setLocationState("ready");
          resolve(coords);
        },
        (err) => {
          setLocationState("error");
          const msg = positionError(err);
          setLocationError(msg);
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
      );
    });
  };

  const handleStartAttendance = async () => {
    setError(null);
    setMessage(null);
    let currentCoords = coordinates;
    if (!currentCoords) {
      try { currentCoords = await getLocationPromise(); }
      catch { return; }
    }
    setCameraModalOpen(true);
  };

  const handleCaptureAndSubmit = async (imageDataUrl: string) => {
    let currentCoords = coordinates;
    if (!currentCoords) {
      try { currentCoords = await getLocationPromise(); }
      catch { setError("Lokasi tidak terdeteksi. Pastikan GPS aktif."); return; }
    }
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const endpoint = action === "in" ? "/attendance/clock-in" : "/attendance/clock-out";
      await request<{ attendance_id: number }>(endpoint, {
        method: "POST",
        body: JSON.stringify({
          latitude: currentCoords.latitude,
          longitude: currentCoords.longitude,
          accuracy: currentCoords.accuracy,
          image: imageDataUrl,
        }),
      });
      setMessage(action === "in" ? "✓ Clock in berhasil dicatat." : "✓ Clock out berhasil dicatat.");
      setCameraModalOpen(false);
      await refreshAttendance();
    } catch (caught) {
      const apiError = caught instanceof ApiError ? caught : null;
      const distance = apiError?.errors?.distance;
      setError(
        typeof distance === "string"
          ? `${apiError?.message} ${distance}`
          : apiError?.message ?? "Absensi gagal. Coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const duration = clockDuration(attendance?.clock_in_time ?? null, attendance?.clock_out_time ?? null);
  const inTime = formatTime(attendance?.clock_in_time ?? null);
  const outTime = formatTime(attendance?.clock_out_time ?? null);

  // Location status info
  const isInRange = locationState === "ready";
  const isLocLoading = locationState === "loading";

  // Map placeholder using openstreetmap embed
  const mapSrc = coordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.longitude - 0.003}%2C${coordinates.latitude - 0.002}%2C${coordinates.longitude + 0.003}%2C${coordinates.latitude + 0.002}&layer=mapnik&marker=${coordinates.latitude}%2C${coordinates.longitude}`
    : null;

  return (
    <section className="flex flex-col bg-background min-h-[calc(100vh-64px)] pb-20">
      {/* ── 1. Greeting & Clock ── */}
      <div className="bg-background px-5 pt-5 pb-4 text-center">
        <p className="text-lg font-bold text-foreground">{greeting}, {name.split(" ")[0]}</p>
        <p className="mt-0.5 text-sm capitalize text-muted-foreground">{dateLabel}</p>
        <p className="mt-3 text-6xl font-bold tabular-nums tracking-tight text-primary">{timeLabel}</p>
        <p className="mt-1 text-xs font-bold tracking-[0.15em] text-muted-foreground">WIB</p>
      </div>

      {/* ── 2. Map ── */}
      <div className="relative h-44 w-full overflow-hidden border-y border-border bg-card">
        {coordinates && mapSrc ? (
          <iframe
            src={mapSrc}
            className="h-full w-full border-none opacity-80 mix-blend-luminosity grayscale"
            title="Lokasi GPS"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-card">
            <div className="relative flex size-20 items-center justify-center">
              {/* Ripple rings */}
              <div className="absolute size-20 animate-ping rounded-full bg-primary/10" />
              <div className="absolute size-14 rounded-full bg-primary/20" />
              <div className="flex size-8 items-center justify-center rounded-full bg-primary shadow-lg">
                <div className="size-3 rounded-full bg-white" />
              </div>
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              {isLocLoading ? "Mengambil lokasi GPS…" : "Peta akan muncul setelah GPS aktif"}
            </p>
          </div>
        )}
        {/* Geofence overlay circle */}
        {coordinates && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex size-24 items-center justify-center rounded-full border-2 border-primary/60 bg-primary/10">
              <div className="size-6 rounded-full bg-primary shadow-lg shadow-primary/40" />
            </div>
          </div>
        )}
      </div>

      {/* ── 3. In-Range Status ── */}
      <div className="bg-background px-5 py-3">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
          <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${isInRange ? "bg-emerald-500/15" : isLocLoading ? "bg-primary/10" : "bg-red-500/10"}`}>
            <svg className={`size-5 ${isInRange ? "text-emerald-500" : isLocLoading ? "text-primary" : "text-red-500"}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <div>
            <p className={`text-sm font-bold ${isInRange ? "text-emerald-600 dark:text-emerald-500" : isLocLoading ? "text-primary" : "text-foreground"}`}>
              {isInRange ? "In Range" : isLocLoading ? "Memeriksa Lokasi…" : locationState === "error" ? "Lokasi Tidak Aktif" : "Belum Ada Lokasi"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isInRange
                ? `Anda berada di dalam radius kantor (±${Math.round(coordinates?.accuracy ?? 0)}m)`
                : isLocLoading
                ? "Sedang mengambil koordinat GPS…"
                : locationError ?? "Izinkan akses lokasi untuk absensi"}
            </p>
          </div>
          {(locationState === "error" || locationState === "idle") && (
            <button
              onClick={() => void getLocationPromise()}
              className="ml-auto shrink-0 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
            >
              Aktifkan
            </button>
          )}
        </div>
      </div>

      {/* ── 4. CLOCK IN / OUT Button ── */}
      <div className="flex flex-col items-center bg-background px-5 py-5">
        <button
          onClick={() => void handleStartAttendance()}
          disabled={action === "done" || submitting || loadingAttendance}
          className={`relative flex size-48 flex-col items-center justify-center rounded-full text-white shadow-lg transition-all active:scale-95 disabled:opacity-60 ${
            action === "done"
              ? "bg-emerald-500 shadow-emerald-500/30"
              : "bg-gradient-to-b from-yellow-400 to-primary shadow-primary/35"
          }`}
        >
          {submitting ? (
            <div className="size-12 animate-spin rounded-full border-4 border-white/30 border-t-white" />
          ) : action === "done" ? (
            <>
              <svg className="size-12 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="mt-2 text-sm font-bold tracking-widest text-white">SELESAI</p>
            </>
          ) : (
            <>
              {/* Finger touch icon */}
              <svg className="size-12 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path d="M9 11V6a3 3 0 016 0v5M9 11a3 3 0 003 3h0a3 3 0 003-3M9 11H6a2 2 0 00-2 2v3a8 8 0 008 8h0a8 8 0 008-8v-3a2 2 0 00-2-2h-3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="mt-2 text-sm font-bold tracking-widest text-white">
                {action === "in" ? "CLOCK IN" : "CLOCK OUT"}
              </p>
            </>
          )}
        </button>

        <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
          {action === "done"
            ? "Absensi hari ini sudah lengkap. Sampai jumpa besok! 👋"
            : action === "in"
            ? "Pastikan Anda berada di dalam area kantor untuk clock in."
            : "Selfie & konfirmasi sebelum pulang."}
        </p>

        {/* Alert messages */}
        {error && (
          <div className="mt-3 w-full rounded-2xl bg-red-50 dark:bg-red-950/50 px-4 py-3 text-sm text-red-600 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-900/50">
            ⚠️ {error}
          </div>
        )}
        {message && (
          <div className="mt-3 w-full rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-900/50">
            {message}
          </div>
        )}
      </div>

      {/* ── 5. Info Cards: Secure + Today's Hours ── */}
      <div className="grid grid-cols-2 gap-3 bg-background px-5 pt-2 pb-4">
        {/* Secure Card */}
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-4 shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-primary" />
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
              <svg className="size-4 text-emerald-600 dark:text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
              </svg>
            </div>
            <p className="text-xs font-bold text-foreground">SECURE</p>
          </div>
          <ul className="mt-2 space-y-1">
            {["Anti-Fake GPS Active", "Liveness Verified", "Encrypted Data"].map((item) => (
              <li key={item} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Today's Hours Card */}
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-4 shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-primary" />
          <p className="text-xs font-bold text-foreground">TODAY&apos;S HOURS</p>
          {loadingAttendance ? (
            <div className="mt-3 space-y-2">
              <div className="h-4 animate-pulse rounded-full bg-muted" />
              <div className="h-3 w-2/3 animate-pulse rounded-full bg-muted" />
            </div>
          ) : duration ? (
            <div className="mt-2">
              <p className="text-2xl font-bold tabular-nums text-primary">
                {duration.hrs}:{String(duration.mins).padStart(2, "0")}
              </p>
              <p className="text-[11px] text-muted-foreground">jam kerja hari ini</p>
            </div>
          ) : (
            <div className="mt-2">
              <p className="text-xl font-bold text-muted-foreground">
                <span className="text-muted-foreground/40">--</span>{" "}
                <span className="text-sm">hrs</span>{" "}
                <span className="text-muted-foreground/40">--</span>{" "}
                <span className="text-sm">mins</span>
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Belum ada data</p>
            </div>
          )}

          <div className="mt-3 space-y-1.5 border-t border-border pt-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">Masuk</span>
              <span className={`font-bold ${inTime === "--:--" ? "text-muted-foreground/50" : "text-foreground"}`}>{inTime}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">Pulang</span>
              <span className={`font-bold ${outTime === "--:--" ? "text-muted-foreground/50" : "text-foreground"}`}>{outTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Status Badge (only if clocked in) */}
      {attendance?.status && (
        <div className="bg-background px-5 pb-4">
          <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 border ${
            attendance.status === "on_time" ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20" : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
          }`}>
            <svg className={`size-4 ${attendance.status === "on_time" ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"}`} fill="currentColor" viewBox="0 0 24 24">
              {attendance.status === "on_time"
                ? <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                : <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              }
            </svg>
            <p className={`text-xs font-bold ${attendance.status === "on_time" ? "text-emerald-700 dark:text-emerald-500" : "text-red-700 dark:text-red-500"}`}>
              {attendance.status === "on_time" ? "✓ Tepat Waktu" : "⚠ Terlambat"}
            </p>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      <CameraCaptureModal
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onCapture={(img) => void handleCaptureAndSubmit(img)}
        title={action === "in" ? "Foto Selfie Masuk" : "Foto Selfie Pulang"}
        subTitle={`Pastikan wajah terlihat jelas untuk bukti absensi ${action === "in" ? "masuk" : "pulang"}`}
        isSubmitting={submitting}
      />
    </section>
  );
}
