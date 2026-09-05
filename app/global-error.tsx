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
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <svg className="size-8" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
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
