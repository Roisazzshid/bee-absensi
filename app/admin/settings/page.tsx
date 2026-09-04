import { AdminSettingsPage } from "@/components/admin/settings/admin-settings-page";

export const metadata = {
  title: "Pengaturan — Admin Bee Absensi",
  description: "Kelola konfigurasi aplikasi, jam kerja, notifikasi, dan akun administrator.",
};

export default function SettingsPage() {
  return <AdminSettingsPage />;
}
