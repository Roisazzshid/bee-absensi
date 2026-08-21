import { AuthGuard } from "@/components/auth/auth-guard";
import { ProfilePage } from "@/components/profile/profile-page";
import { AppShell } from "@/components/layout/app-shell";

export const metadata = {
  title: "Profil & Pengaturan — Bee Absensi",
  description: "Kelola informasi profil, keamanan, dan pengaturan akun Anda.",
};

export default function ProfilPage() {
  return (
    <AuthGuard>
      <AppShell activeItem="Profil">
        <ProfilePage />
      </AppShell>
    </AuthGuard>
  );
}
