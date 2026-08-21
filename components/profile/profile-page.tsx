"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Button, Card, TextInput } from "@/components/ui";
import { ApiError } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Dashboard = {
  leave_quota: number;
  hadir: number;
  terlambat: number;
  sakit_izin: number;
};

type ProfileData = {
  user: {
    id: number;
    email: string;
    role: string;
    profile?: {
      full_name?: string;
      nip?: string;
      department?: string;
      position?: string;
      phone?: string;
      emergency_contact?: string | null;
      leave_quota?: number;
    } | null;
  };
  dashboard: Dashboard;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 px-1 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
      {children}
    </h3>
  );
}

function DashCard({
  value,
  unit,
  label,
  colorClass,
  borderClass,
}: {
  value: number | string;
  unit: string;
  label: string;
  colorClass: string;
  borderClass?: string;
}) {
  return (
    <div
      className={`soft-shadow flex flex-col justify-between rounded-2xl border-l-4 bg-surface-container-lowest p-4 ${borderClass ?? ""}`}
    >
      <p className="text-xs text-on-surface-variant">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${colorClass}`}>
        {value} <span className="text-sm font-normal text-outline">{unit}</span>
      </p>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  iconBg = "bg-primary/10",
  iconColor = "text-primary",
}: {
  icon: string;
  label: string;
  value: string;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-full text-lg ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-on-surface-variant">{label}</p>
        <p className="truncate text-sm font-semibold text-on-surface">{value || "—"}</p>
      </div>
    </div>
  );
}

function Toggle({
  id,
  checked,
  onChange,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="relative inline-flex cursor-pointer items-center">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <div className="h-6 w-11 rounded-full bg-surface-container-high after:absolute after:left-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-surface-container-high after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
    </label>
  );
}

// ─── Edit Profile Modal ───────────────────────────────────────────────────────

function EditProfileModal({
  initial,
  onSave,
  onClose,
}: {
  initial: { full_name: string; phone: string; emergency_contact: string };
  onSave: (data: typeof initial) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-surface-container-lowest p-6 sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-bold text-on-surface">Edit Informasi Kontak</h3>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant"
          >
            ✕
          </button>
        </div>
        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-on-surface-variant">Nama Lengkap</label>
            <TextInput
              id="edit-full-name"
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              placeholder="Nama lengkap"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-on-surface-variant">Nomor WhatsApp / Telepon</label>
            <TextInput
              id="edit-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="08xxxxxxxxxx"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-on-surface-variant">Kontak Darurat</label>
            <TextInput
              id="edit-emergency"
              value={form.emergency_contact}
              onChange={(e) => setForm((f) => ({ ...f, emergency_contact: e.target.value }))}
              placeholder="Nama – Hubungan – Nomor"
            />
          </div>
          {error && (
            <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-error">
              {error}
            </p>
          )}
          <Button id="btn-save-profile" type="submit" fullWidth disabled={saving} className="h-14">
            {saving ? "Menyimpan…" : "Simpan Perubahan"}
          </Button>
        </form>
      </div>
    </div>
  );
}

// ─── Change Password Modal ────────────────────────────────────────────────────

function ChangePasswordModal({
  onSave,
  onClose,
}: {
  onSave: (current: string, next: string) => Promise<void>;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) { setError("Konfirmasi kata sandi tidak cocok."); return; }
    if (next.length < 8) { setError("Kata sandi baru minimal 8 karakter."); return; }
    setSaving(true);
    setError(null);
    try {
      await onSave(current, next);
      setSuccess(true);
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      const firstError = apiErr?.errors ? Object.values(apiErr.errors).flat()[0] : null;
      setError(firstError ?? apiErr?.message ?? "Gagal mengubah kata sandi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-surface-container-lowest p-6 sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-bold text-on-surface">Ubah Kata Sandi</h3>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant"
          >
            ✕
          </button>
        </div>
        {success ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <span className="text-5xl">🔐</span>
            <p className="font-semibold text-on-surface">Kata sandi berhasil diubah!</p>
            <p className="text-sm text-on-surface-variant">Semua sesi aktif telah diakhiri. Silakan masuk kembali.</p>
            <Button fullWidth onClick={onClose}>Oke</Button>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-on-surface-variant">Kata Sandi Saat Ini</label>
              <TextInput
                id="pw-current"
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="Kata sandi lama"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-on-surface-variant">Kata Sandi Baru</label>
              <TextInput
                id="pw-new"
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder="Min. 8 karakter"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-on-surface-variant">Konfirmasi Kata Sandi Baru</label>
              <TextInput
                id="pw-confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                required
              />
            </div>
            {error && (
              <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-error">
                {error}
              </p>
            )}
            <Button id="btn-save-password" type="submit" fullWidth disabled={saving} className="h-14">
              {saving ? "Menyimpan…" : "Ubah Kata Sandi"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProfilePage() {
  const { request, signOut } = useAuth();

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await request<ProfileData>("/profile");
      setData(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat profil.");
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => { void loadProfile(); }, [loadProfile]);

  const handleSaveProfile = useCallback(
    async (form: { full_name: string; phone: string; emergency_contact: string }) => {
      await request("/profile", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      await loadProfile();
    },
    [request, loadProfile]
  );

  const handleChangePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      await request("/profile/change-password", {
        method: "POST",
        body: JSON.stringify({
          current_password: currentPassword,
          password: newPassword,
          password_confirmation: newPassword,
        }),
      });
    },
    [request]
  );

  const profile = data?.user?.profile;
  const dashboard = data?.dashboard;
  const name = profile?.full_name ?? data?.user?.email ?? "Karyawan";
  const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  // ── Skeleton loading ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-8">
        <div className="flex flex-col items-center gap-4">
          <div className="size-24 animate-pulse rounded-full bg-surface-container-low" />
          <div className="h-5 w-40 animate-pulse rounded-lg bg-surface-container-low" />
          <div className="h-4 w-24 animate-pulse rounded-lg bg-surface-container-low" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-surface-container-low" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
        <span className="text-5xl">⚠️</span>
        <p className="text-sm text-error">{error}</p>
        <Button variant="secondary" onClick={() => void loadProfile()}>Coba Lagi</Button>
      </div>
    );
  }

  return (
    <>
      {showEditProfile && (
        <EditProfileModal
          initial={{
            full_name: profile?.full_name ?? "",
            phone: profile?.phone ?? "",
            emergency_contact: profile?.emergency_contact ?? "",
          }}
          onSave={handleSaveProfile}
          onClose={() => setShowEditProfile(false)}
        />
      )}

      {showChangePassword && (
        <ChangePasswordModal
          onSave={handleChangePassword}
          onClose={() => {
            setShowChangePassword(false);
            // Jika password berhasil diganti, backend hapus semua token → signOut
            void signOut();
          }}
        />
      )}

      <section className="mx-auto flex max-w-md flex-col gap-8">

        {/* ── 1. Header profil ── */}
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="flex size-24 items-center justify-center rounded-full border-4 border-surface bg-primary shadow-md text-3xl font-bold text-on-primary">
              {initials}
            </div>
          </div>
          <h1 className="text-xl font-bold text-on-surface">{name}</h1>
          <p className="mt-0.5 text-sm text-on-surface-variant">{profile?.nip ?? data?.user?.email}</p>
          {(profile?.position || profile?.department) && (
            <div className="mt-2 flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <span>💼</span>
              <span>
                {[profile.position, profile.department].filter(Boolean).join(" • ")}
              </span>
            </div>
          )}
        </div>

        {/* ── 2. Mini Dashboard ── */}
        <div>
          <SectionLabel>Ringkasan Bulan Ini</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <DashCard
              value={dashboard?.leave_quota ?? 0}
              unit="Hari"
              label="Sisa Cuti"
              colorClass="text-primary"
              borderClass="border-l-primary"
            />
            <DashCard
              value={dashboard?.hadir ?? 0}
              unit="Hari"
              label="Hadir"
              colorClass="text-secondary"
              borderClass="border-l-secondary"
            />
            <DashCard
              value={dashboard?.terlambat ?? 0}
              unit="Kali"
              label="Terlambat"
              colorClass="text-error"
              borderClass="border-l-error"
            />
            <DashCard
              value={dashboard?.sakit_izin ?? 0}
              unit="Hari"
              label="Sakit / Izin"
              colorClass="text-on-surface-variant"
              borderClass="border-l-outline-variant"
            />
          </div>
        </div>

        {/* ── 3. Informasi Personal ── */}
        <div>
          <div className="mb-3 flex items-center justify-between px-1">
            <SectionLabel>Informasi Personal</SectionLabel>
            <button
              id="btn-edit-profile"
              onClick={() => setShowEditProfile(true)}
              className="pressable flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/10"
            >
              ✏️ Edit
            </button>
          </div>
          <Card className="overflow-hidden p-0">
            <div className="divide-y divide-surface-container">
              <InfoRow icon="📧" label="Email" value={data?.user?.email ?? ""} />
              <InfoRow icon="📱" label="WhatsApp / Telepon" value={profile?.phone ?? ""} />
              <InfoRow
                icon="🚨"
                label="Kontak Darurat"
                value={profile?.emergency_contact ?? "Belum diisi"}
                iconBg="bg-red-50"
                iconColor="text-error"
              />
              <InfoRow icon="🏢" label="Departemen" value={profile?.department ?? ""} />
              <InfoRow icon="💼" label="Jabatan" value={profile?.position ?? ""} />
            </div>
          </Card>
        </div>

        {/* ── 4. Keamanan & Akun ── */}
        <div>
          <SectionLabel>Keamanan &amp; Akun</SectionLabel>
          <Card className="overflow-hidden p-0">
            <div className="divide-y divide-surface-container">
              <button
                id="btn-change-password"
                onClick={() => setShowChangePassword(true)}
                className="flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-surface-container-low"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface">
                  🔒
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-on-surface">Ubah Kata Sandi</p>
                  <p className="text-xs text-on-surface-variant">Ganti kata sandi akun Anda</p>
                </div>
                <span className="text-on-surface-variant">›</span>
              </button>
              <div className="flex items-center gap-4 px-4 py-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface">
                  👆
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-on-surface">Biometrik</p>
                  <p className="text-xs text-on-surface-variant">Sidik jari atau Face ID</p>
                </div>
                <Toggle id="toggle-biometric" checked={false} onChange={() => {}} />
              </div>
            </div>
          </Card>
        </div>

        {/* ── 5. Pengaturan Aplikasi ── */}
        <div>
          <SectionLabel>Pengaturan Aplikasi</SectionLabel>
          <Card className="overflow-hidden p-0">
            <div className="divide-y divide-surface-container">
              <div className="flex items-center gap-4 px-4 py-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface">
                  🔔
                </div>
                <p className="flex-1 text-sm font-semibold text-on-surface">Notifikasi</p>
                <Toggle
                  id="toggle-notif"
                  checked={notifEnabled}
                  onChange={setNotifEnabled}
                />
              </div>
              <div className="flex items-center gap-4 px-4 py-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface">
                  🌐
                </div>
                <p className="flex-1 text-sm font-semibold text-on-surface">Pilih Bahasa</p>
                <span className="text-xs font-semibold text-primary">Bahasa Indonesia ›</span>
              </div>
            </div>
          </Card>
        </div>

        {/* ── 6. Logout ── */}
        <div className="pb-4">
          <button
            id="btn-logout"
            onClick={() => void signOut()}
            className="pressable flex w-full items-center justify-center gap-2 rounded-2xl border border-error py-4 text-base font-bold text-error transition hover:bg-red-50"
          >
            <span>🚪</span> Keluar
          </button>
        </div>

      </section>
    </>
  );
}
