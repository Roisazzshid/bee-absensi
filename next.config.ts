import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Matikan header X-Powered-By untuk keamanan
  poweredByHeader: false,

  // Tambah security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },

  // Proxy / Rewrites untuk mengatasi masalah CORS di Localhost & Vercel
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: "https://api-absensi.lebahkreatif.or.id/api/:path*",
      },
    ];
  },
};

export default nextConfig;
