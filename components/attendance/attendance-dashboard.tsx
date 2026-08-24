"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Badge, Button, Card } from "@/components/ui";
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
  if (!value) return "-";
  const date = new Date(value);
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
    return "Izin lokasi ditolak. Aktifkan izin lokasi di browser untuk absensi.";
  if (error.code === error.POSITION_UNAVAILABLE)
    return "Lokasi belum tersedia. Periksa GPS atau koneksi Anda.";
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

  // Camera Modal State
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
    const timer = window.setTimeout(() => {
      void refreshAttendance();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refreshAttendance]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const action = attendance?.clock_out_time ? "done" : attendance?.clock_in_time ? "out" : "in";
  const title = action === "in" ? "Clock in" : action === "out" ? "Clock out" : "Absensi selesai";
  const name = user?.profile?.full_name?.split(" ")[0] ?? "Karyawan";
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

  const getLocationPromise = (): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setLocationState("error");
        reject(new Error("Browser ini tidak mendukung lokasi."));
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
          setError(msg);
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
      );
    });
  };

  const handleStartAttendance = async () => {
    setError(null);
    setMessage(null);

    // If location is not yet ready, fetch it first
    let currentCoords = coordinates;
    if (!currentCoords) {
      try {
        currentCoords = await getLocationPromise();
      } catch {
        return; // error handled inside getLocationPromise
      }
    }

    // Open Camera Modal
    setCameraModalOpen(true);
  };

  const handleCaptureAndSubmit = async (imageDataUrl: string) => {
    let currentCoords = coordinates;
    if (!currentCoords) {
      try {
        currentCoords = await getLocationPromise();
      } catch {
        setError("Lokasi tidak dapat dideteksi. Pastikan GPS aktif.");
        return;
      }
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

      setMessage(
        action === "in"
          ? "✓ Clock in dan foto bukti absensi berhasil dicatat."
          : "✓ Clock out dan foto bukti absensi berhasil dicatat."
      );
      setCameraModalOpen(false);
      await refreshAttendance();
    } catch (caught) {
      const apiError = caught instanceof ApiError ? caught : null;
      const distance = apiError?.errors?.distance;
      setError(
        typeof distance === "string"
          ? `${apiError?.message} ${distance}`
          : apiError?.message ?? "Absensi gagal dicatat. Coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 pb-3 text-center sm:py-4">
      {/* Header Greeting & Real-time Clock */}
      <div>
        <p className="text-xl font-semibold text-on-surface">Selamat datang, {name}</p>
        <p className="mt-1.5 text-sm capitalize text-on-surface-variant">{dateLabel}</p>
        <p className="mt-3 text-5xl font-bold tracking-tight text-primary tabular-nums">
          {new Intl.DateTimeFormat("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }).format(now)}
        </p>
        <p className="mt-1 text-xs font-bold tracking-widest text-on-surface-variant">WAKTU PERANGKAT</p>
      </div>

      {/* Geolocation Card */}
      <Card className="text-left">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-secondary-container text-lg" aria-hidden="true">
            📍
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold text-on-surface text-sm">Lokasi Absensi</h2>
              <Badge tone={locationState === "ready" ? "success" : locationState === "error" ? "error" : "neutral"}>
                {locationState === "loading" ? "Mencari GPS…" : locationState === "ready" ? "Siap" : locationState === "error" ? "Gagal" : "Belum aktif"}
              </Badge>
            </div>
            <p className="mt-1 text-xs leading-5 text-on-surface-variant">
              {coordinates
                ? `Akurasi GPS sekitar ${Math.round(coordinates.accuracy)} meter.`
                : "Izinkan akses lokasi GPS agar sistem dapat memeriksa area kantor."}
            </p>
            <Button
              variant="ghost"
              onClick={() => void getLocationPromise()}
              disabled={locationState === "loading"}
              className="mt-1 min-h-0 px-0 py-1 text-xs font-bold text-primary"
            >
              {locationState === "loading" ? "Mengambil lokasi…" : coordinates ? "Perbarui lokasi" : "Aktifkan GPS"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Hero Circular Action / Status */}
      <div className="rounded-full bg-linear-to-b from-primary to-primary-container p-1 shadow-[0_10px_40px_rgba(7,95,171,0.25)]">
        <div className="flex aspect-square w-full items-center justify-center rounded-full border border-white/20 bg-primary/15 p-8 text-on-primary">
          <div>
            <div className="flex justify-center mb-2">
              <span className="text-4xl">{action === "done" ? "🎉" : "📸"}</span>
            </div>
            <p className="text-2xl font-bold tracking-wide">{loadingAttendance ? "Memuat…" : title}</p>
            <p className="mt-1.5 text-xs text-white/90">
              {action === "in"
                ? "Selfie & catat kehadiran masuk Anda"
                : action === "out"
                ? "Selfie & catat waktu pulang Anda"
                : "Absensi hari ini telah lengkap"}
            </p>
          </div>
        </div>
      </div>

      {/* Attendance summary card with photo proof badge */}
      <Card className="grid grid-cols-2 gap-4 text-left">
        <div>
          <p className="text-xs font-bold text-on-surface-variant">MASUK</p>
          <p className="mt-1 text-xl font-bold text-on-surface">{formatTime(attendance?.clock_in_time ?? null)}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {attendance?.status && (
              <Badge tone={attendance.status === "late" ? "primary" : "success"}>
                {attendance.status === "late" ? "Terlambat" : "Tepat waktu"}
              </Badge>
            )}
            {attendance?.clock_in_image_url && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                📷 Foto Tersimpan
              </span>
            )}
          </div>
        </div>
        <div className="border-l border-surface-container pl-4">
          <p className="text-xs font-bold text-on-surface-variant">PULANG</p>
          <p className="mt-1 text-xl font-bold text-on-surface">{formatTime(attendance?.clock_out_time ?? null)}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <p className="text-xs text-on-surface-variant">{action === "done" ? "Selesai" : "Belum dicatat"}</p>
            {attendance?.clock_out_image_url && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                📷 Foto Tersimpan
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Alert Messages */}
      {error && (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-left text-sm leading-5 text-error ring-1 ring-red-200">
          ⚠️ {error}
        </p>
      )}
      {message && (
        <p role="status" className="rounded-2xl bg-emerald-50 px-4 py-3 text-left text-sm leading-5 text-emerald-700 ring-1 ring-emerald-200">
          {message}
        </p>
      )}

      {/* Main Action Button */}
      <div className="space-y-3">
        <Button
          className="h-16 text-base font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
          fullWidth
          onClick={() => void handleStartAttendance()}
          disabled={action === "done" || submitting || loadingAttendance}
        >
          <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span>{submitting ? "Menyimpan Absen…" : action === "done" ? "Absensi Selesai" : `Buka Kamera & ${title}`}</span>
        </Button>
        <p className="text-xs leading-5 text-on-surface-variant">
          Absensi memerlukan foto selfie bukti kehadiran dan verifikasi lokasi GPS kantor.
        </p>
      </div>

      {/* Camera Capture Modal */}
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
