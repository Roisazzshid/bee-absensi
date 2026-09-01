"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Fatal global application error:", error);
  }, [error]);

  return (
    <html lang="id">
      <body className="flex min-h-screen items-center justify-center bg-[#f8f9fa] p-4 text-center font-sans">
        <div className="max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-black/5">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-red-50 text-3xl">
            ⚠️
          </div>
          <h1 className="mt-5 text-xl font-bold text-gray-900">Gangguan Sistem</h1>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            Terjadi masalah saat memuat aplikasi. Silakan muat ulang atau buka kembali halaman login.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => reset()}
              className="w-full rounded-xl bg-[#00629e] py-3 text-sm font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
            >
              Muat Ulang Aplikasi
            </button>
            <a
              href="/login"
              className="w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Kembali ke Login
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
