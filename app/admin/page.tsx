import { AdminDashboard } from "@/components/admin/dashboard/admin-dashboard";

export const metadata = {
  title: "Dashboard Admin — Bee Absensi",
  description: "Pantau kehadiran karyawan dan kelola pengajuan izin.",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
