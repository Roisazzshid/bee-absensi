"use client";

import { useEffect, useRef, useState } from "react";

type CameraCaptureModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
  title: string;
  subTitle?: string;
  isSubmitting?: boolean;
};

export function CameraCaptureModal({
  isOpen,
  onClose,
  onCapture,
  title,
  subTitle = "Posisikan wajah Anda di dalam lingkaran panduan",
  isSubmitting = false,
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  // Start webcam stream
  const startCamera = async (facing: "user" | "environment" = facingMode) => {
    setCameraError(null);
    setCameraActive(false);

    // Stop existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Browser tidak mendukung akses kamera secara langsung.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.";
      setCameraError(msg);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (isOpen && !capturedImage) {
      void startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, capturedImage, facingMode]);

  // Take snapshot from video canvas
  const handleSnap = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // If front camera, flip horizontally for mirror preview
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Add watermark timestamp
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    void startCamera();
  };

  const handleConfirm = () => {
    if (!capturedImage) return;
    onCapture(capturedImage);
  };

  // Fallback upload file if camera is not working
  const handleFallbackFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCapturedImage(result);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
                <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3H4.5a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0zm12-1.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground leading-tight">{title}</h2>
              <p className="text-[11px] text-muted-foreground">{subTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex size-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted transition-colors"
          >
            <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Camera Viewport / Preview */}
        <div className="relative bg-black flex items-center justify-center overflow-hidden aspect-square sm:aspect-4/3 w-full">
          {capturedImage ? (
            // Captured Image Preview
            <div className="relative size-full">
              <img
                src={capturedImage}
                alt="Bukti Selfie Absensi"
                className="size-full object-cover"
              />
              <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 text-[11px] font-bold text-white backdrop-blur shadow-sm">
                <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                </svg>
                <span>Foto Siap</span>
              </div>
            </div>
          ) : (
            // Live Video Feed
            <div className="relative size-full flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className={[
                  "size-full object-cover",
                  facingMode === "user" ? "-scale-x-100" : "",
                ].join(" ")}
              />

              {/* Face Guide Overlay Circle */}
              {cameraActive && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="size-52 sm:size-60 rounded-full border-2 border-dashed border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] flex items-center justify-center animate-pulse">
                    <span className="text-[11px] font-bold text-white/90 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur">
                      Posisikan Wajah
                    </span>
                  </div>
                </div>
              )}

              {/* Camera Error or Permission prompt */}
              {cameraError && (
                <div className="absolute inset-0 bg-background/95 p-6 flex flex-col items-center justify-center text-center">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-500 mb-3">
                    <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-foreground">Kamera Tidak Dapat Diakses</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">{cameraError}</p>

                  <div className="mt-4 flex flex-col gap-2 w-full max-w-xs">
                    <button
                      type="button"
                      onClick={() => void startCamera()}
                      className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:opacity-90"
                    >
                      Coba Lagi
                    </button>
                    <label className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground text-center cursor-pointer hover:bg-muted">
                      <span>Pilih Foto dari Galeri / Kamera</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="user"
                        onChange={handleFallbackFileInput}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Switch camera button (if available on mobile) */}
              {cameraActive && (
                <button
                  type="button"
                  onClick={() =>
                    setFacingMode((f) => (f === "user" ? "environment" : "user"))
                  }
                  className="absolute bottom-3 right-3 flex size-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70 transition-colors"
                  title="Ganti Kamera"
                >
                  <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.015.75.75 0 00-.53-.918z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Hidden canvas for snapshot rendering */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Controls Footer */}
        <div className="p-4 sm:p-5 bg-card border-t border-border">
          {!capturedImage ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 rounded-2xl border border-border py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSnap}
                disabled={!cameraActive || isSubmitting}
                className="flex-2 flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-white shadow-md hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
              >
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 4.5a5.25 5.25 0 100 10.5 5.25 5.25 0 000-10.5zm0 2.25a3 3 0 100 6 3 3 0 000-6z" clipRule="evenodd" />
                </svg>
                <span>Ambil Foto</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRetake}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-border py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.015.75.75 0 00-.53-.918z" clipRule="evenodd" />
                </svg>
                <span>Foto Ulang</span>
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex-2 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                  </svg>
                )}
                <span>{isSubmitting ? "Menyimpan Absensi…" : "Konfirmasi & Absen"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
