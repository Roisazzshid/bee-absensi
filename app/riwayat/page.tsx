import { AuthGuard } from "@/components/auth/auth-guard";
import { AttendanceHistory } from "@/components/attendance/attendance-history";
import { AppShell } from "@/components/layout/app-shell";

export const metadata = {
  title: "Riwayat Kehadiran — Bee Absensi",
  description: "Lihat rekap dan riwayat absensi bulanan Anda.",
};

export default function RiwayatPage() {
  return (
    <AuthGuard>
      <AppShell activeItem="Riwayat">
        <AttendanceHistory />
      </AppShell>
    </AuthGuard>
  );
}
