import { AuthGuard } from "@/components/auth/auth-guard";
import { LeaveRequestPage } from "@/components/leave/leave-request-page";
import { AppShell } from "@/components/layout/app-shell";

export const metadata = {
  title: "Pengajuan Izin & Cuti — Bee Absensi",
  description: "Ajukan izin, cuti tahunan, atau sakit kepada admin.",
};

export default function IzinCutiPage() {
  return (
    <AuthGuard>
      <AppShell activeItem="Izin & Cuti">
        <LeaveRequestPage />
      </AppShell>
    </AuthGuard>
  );
}
