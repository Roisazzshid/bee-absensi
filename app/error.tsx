"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Uncaught application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-3xl bg-red-50 text-3xl shadow-inner">
        ⚠️
      </div>
      <h1 className="mt-5 text-xl font-bold text-on-surface">Terjadi Kendala pada Halaman</h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-on-surface-variant">
        Sistem mengalami gangguan saat memuat data. Anda dapat mencoba memuat ulang halaman atau kembali ke beranda.
      </p>
      {error.message && (
        <div className="mt-4 max-w-md rounded-xl bg-surface-container-low px-4 py-2.5 text-xs text-on-surface-variant/80 font-mono">
          {error.message}
        </div>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
        >
          Muat Ulang
        </button>
        <button
          onClick={() => { window.location.href = "/"; }}
          className="rounded-xl border border-outline-variant bg-surface-container-lowest px-5 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}
