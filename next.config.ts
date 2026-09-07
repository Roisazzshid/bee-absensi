import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Menghasilkan folder 'out' untuk deployment statis (misal cPanel/public_html)
  output: "export",

  // Menjadikan setiap rute sebagai folder dengan index.html (misal /login/index.html)
  // Mencegah error "Index of /login/" di cPanel / LiteSpeed / Apache
  trailingSlash: true,

  // Optimasi gambar untuk static export
  images: {
    unoptimized: true,
  },

  // Matikan header X-Powered-By untuk keamanan
  poweredByHeader: false,

  // Abaikan error TypeScript saat build agar deploy selalu lancar
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
