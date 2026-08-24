import { AdminReportPage } from "@/components/admin/report/admin-report-page";

export const metadata = {
  title: "Laporan & Export Absensi — Admin Bee Absensi",
  description: "Export dan analisa laporan absensi harian, mingguan, dan bulanan.",
};

export default function LaporanPage() {
  return <AdminReportPage />;
}
