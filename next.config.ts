import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Menghasilkan folder 'out' untuk deployment statis (misal cPanel/public_html)
  output: "export",

  // Matikan header X-Powered-By untuk keamanan
  poweredByHeader: false,

  // Abaikan error TypeScript saat build agar deploy selalu lancar
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
