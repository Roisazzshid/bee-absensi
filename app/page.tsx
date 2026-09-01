import { AuthGuard } from "@/components/auth/auth-guard";
import { AttendanceDashboard } from "@/components/attendance/attendance-dashboard";
import { AppShell } from "@/components/layout/app-shell";

export default function Home() {
  return <AuthGuard><AppShell activeItem="Beranda" noPadding><AttendanceDashboard /></AppShell></AuthGuard>;
}
