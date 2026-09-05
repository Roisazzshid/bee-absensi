"use client";

import { useAuth, type AuthUser } from "@/components/auth/auth-provider";
import { Button, Card, TextInput } from "@/components/ui";
import { ApiError } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";
import { useCallback, useEffect, useRef, useState } from "react";

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
      avatar_url?: string | null;
      leave_quota?: number;
    } | null;
  };
  dashboard: Dashboard;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 px-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
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
      className={`shadow-sm flex flex-col justify-between rounded-2xl border-l-4 border border-border bg-card p-4 ${borderClass ?? ""}`}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${colorClass}`}>
        {value} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
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
  icon: React.ReactNode;
  label: string;
  value: string;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold text-foreground">{value || "—"}</p>
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
      <div className="h-6 w-11 rounded-full bg-muted-foreground/30 after:absolute after:left-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-border after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
    </label>
  );
}

// ─── Edit Profile Modal ───────────────────────────────────────────────────────

function EditProfileModal({
  initial,
  onSave,
  onClose,
}: {
  initial: {
    full_name: string;
    nip: string;
    phone: string;
    emergency_contact: string;
    avatar_url?: string | null;
  };
  onSave: (data: FormData) => Promise<void>;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState({
    full_name: initial.full_name,
    nip: initial.nip,
    phone: initial.phone,
    emergency_contact: initial.emergency_contact,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initial.avatar_url ?? null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initials = (form.full_name || "Karyawan")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError(t("photo_hint", "Maksimal 5MB (JPG, PNG, WebP)"));
      return;
    }

    setAvatarFile(file);
    setRemoveAvatar(false);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarFile(null);
    setPreviewUrl(null);
    setRemoveAvatar(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("full_name", form.full_name.trim());
      formData.append("nip", form.nip.trim());
      formData.append("phone", form.phone.trim());
      formData.append("emergency_contact", form.emergency_contact.trim());

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      } else if (removeAvatar) {
        formData.append("remove_avatar", "1");
      }

      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl bg-card border border-border p-6 sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">{t("edit_contact_title", "Edit Profil")}</h3>
            <p className="text-xs text-muted-foreground">{t("edit_profile_desc", "Perbarui foto profil, nama, dan data kontak Anda")}</p>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer"
          >
            <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Avatar Upload Section */}
        <div className="mb-6 flex flex-col items-center gap-3 rounded-2xl bg-muted/40 p-4 border border-border/50">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />
          <div className="relative group">
            <div className="flex size-20 items-center justify-center overflow-hidden rounded-full border-2 border-primary/20 bg-primary/10 text-2xl font-bold text-primary ring-2 ring-background">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="size-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-2 ring-background hover:scale-105 active:scale-95 transition cursor-pointer"
              title={t("change_photo", "Ubah Foto")}
            >
              <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
                <path fillRule="evenodd" clipRule="evenodd" d="M9.344 3.071a1.5 1.5 0 011.06-.442h3.192c.398 0 .779.159 1.06.442l1.171 1.172a3 3 0 002.122.879H20.25a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 17.872V7.372a2.25 2.25 0 012.25-2.25h2.205a3 3 0 002.122-.88l1.171-1.171zM12 7.5a5.25 5.25 0 100 10.5 5.25 5.25 0 000-10.5z" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-upload-photo"
              onClick={() => fileInputRef.current?.click()}
              className="pressable rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition cursor-pointer"
            >
              {previewUrl ? t("change_photo", "Ubah Foto") : t("upload_photo", "Pilih Foto")}
            </button>
            {previewUrl && (
              <button
                type="button"
                id="btn-remove-photo"
                onClick={handleRemovePhoto}
                className="pressable rounded-xl bg-red-50 dark:bg-red-950/50 px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 transition cursor-pointer"
              >
                {t("remove_photo", "Hapus Foto")}
              </button>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">{t("photo_hint", "Maksimal 5MB (JPG, PNG, WebP)")}</p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted-foreground">{t("full_name", "Nama Lengkap")}</label>
            <TextInput
              id="edit-full-name"
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              placeholder={t("full_name_placeholder", "Nama lengkap")}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted-foreground">{t("nip_nim", "NIP / NIM")}</label>
            <TextInput
              id="edit-nip"
              value={form.nip}
              onChange={(e) => setForm((f) => ({ ...f, nip: e.target.value }))}
              placeholder={t("nip_nim_placeholder", "Nomor Induk Pegawai / Mahasiswa")}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted-foreground">{t("phone_wa", "Nomor WhatsApp / Telepon")}</label>
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
            <label className="mb-1.5 block text-xs font-bold text-muted-foreground">{t("emergency_contact", "Kontak Darurat")}</label>
            <TextInput
              id="edit-emergency"
              value={form.emergency_contact}
              onChange={(e) => setForm((f) => ({ ...f, emergency_contact: e.target.value }))}
              placeholder="Nama – Hubungan – Nomor"
            />
          </div>
          {error && (
            <p role="alert" className="rounded-2xl bg-red-50 dark:bg-red-950/50 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <Button id="btn-save-profile" type="submit" fullWidth disabled={saving} className="h-14 cursor-pointer">
            {saving ? t("saving", "Menyimpan…") : t("save_changes", "Simpan Perubahan")}
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
  const { t } = useLanguage();
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-card border border-border p-6 sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">{t("change_password", "Ubah Kata Sandi")}</h3>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer"
          >
            <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        {success ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-500">
              <svg className="size-8" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="font-semibold text-foreground">{t("password_changed_success", "Kata sandi berhasil diubah!")}</p>
            <p className="text-sm text-muted-foreground">{t("password_changed_desc", "Semua sesi aktif telah diakhiri. Silakan masuk kembali.")}</p>
            <Button fullWidth onClick={onClose} className="cursor-pointer">{t("ok", "Oke")}</Button>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-muted-foreground">{t("current_password", "Kata Sandi Saat Ini")}</label>
              <TextInput
                id="pw-current"
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder={t("current_password_placeholder", "Kata sandi lama")}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-muted-foreground">{t("new_password", "Kata Sandi Baru")}</label>
              <TextInput
                id="pw-new"
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder={t("new_password_placeholder", "Min. 8 karakter")}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-muted-foreground">{t("confirm_password", "Konfirmasi Kata Sandi Baru")}</label>
              <TextInput
                id="pw-confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder={t("confirm_password_placeholder", "Ulangi kata sandi baru")}
                required
              />
            </div>
            {error && (
              <p role="alert" className="rounded-2xl bg-red-50 dark:bg-red-950/50 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
            <Button id="btn-save-password" type="submit" fullWidth disabled={saving} className="h-14 cursor-pointer">
              {saving ? t("saving", "Menyimpan…") : t("change_password", "Ubah Kata Sandi")}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Language Modal ───────────────────────────────────────────────────────────

function LanguageModal({
  currentLanguage,
  onSelect,
  onClose,
}: {
  currentLanguage: string;
  onSelect: (lang: "id" | "en") => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const languages: { code: "id" | "en"; name: string; desc: string; flag: string }[] = [
    {
      code: "id",
      name: t("lang_id_name", "Bahasa Indonesia"),
      desc: t("lang_id_desc", "Bahasa resmi aplikasi"),
      flag: "🇮🇩",
    },
    {
      code: "en",
      name: t("lang_en_name", "English"),
      desc: t("lang_en_desc", "International English language"),
      flag: "🇬🇧",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-card border border-border p-6 sm:rounded-3xl shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">{t("language_modal_title", "Pilih Bahasa Aplikasi")}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{t("language_modal_subtitle", "Pilih bahasa tampilan yang Anda inginkan")}</p>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer"
          >
            <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {languages.map((item) => {
            const isSelected = currentLanguage === item.code;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  onSelect(item.code);
                  onClose();
                }}
                className={`flex w-full items-center justify-between p-4 rounded-2xl border transition-all text-left cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-xs"
                    : "border-border bg-card hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">{item.flag}</span>
                  <div>
                    <p className="text-sm font-bold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
                {isSelected && (
                  <div className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <svg className="size-4 fill-current" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 011.04-.207z" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProfilePage() {
  const { request, signOut, updateUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedNotif = localStorage.getItem("bee_user_notif");
      if (savedNotif !== null) {
        setNotifEnabled(savedNotif === "true");
      }
    }
  }, []);

  const handleToggleNotif = (val: boolean) => {
    setNotifEnabled(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("bee_user_notif", String(val));
      if (val && "Notification" in window && Notification.permission === "default") {
        void Notification.requestPermission();
      }
    }
    showToast(val ? t("notif_enabled_toast", "Notifikasi aplikasi berhasil diaktifkan") : t("notif_disabled_toast", "Notifikasi aplikasi dinonaktifkan"));
  };

  const handleSelectLanguage = (lang: "id" | "en") => {
    setLanguage(lang);
    showToast(lang === "id" ? "Bahasa diubah ke Bahasa Indonesia" : "Language changed to English");
  };

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
    async (formData: FormData) => {
      const updatedUser = await request<AuthUser>("/profile", {
        method: "POST",
        body: formData,
      });
      if (updatedUser) {
        updateUser(updatedUser);
      }
      await loadProfile();
      showToast(t("profile_updated_toast", "Profil berhasil diperbarui!"));
    },
    [request, updateUser, loadProfile, showToast, t]
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
          <div className="size-24 animate-pulse rounded-full bg-muted" />
          <div className="h-5 w-40 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-24 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-500">
          <svg className="size-8" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-sm text-red-600 dark:text-red-500">{error}</p>
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
            nip: profile?.nip ?? "",
            phone: profile?.phone ?? "",
            emergency_contact: profile?.emergency_contact ?? "",
            avatar_url: profile?.avatar_url ?? null,
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

      {showLanguageModal && (
        <LanguageModal
          currentLanguage={language}
          onSelect={handleSelectLanguage}
          onClose={() => setShowLanguageModal(false)}
        />
      )}

      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl bg-primary text-primary-foreground px-5 py-3 text-sm font-bold shadow-xl animate-in fade-in slide-in-from-top-4">
          <svg className="size-4 shrink-0 fill-current" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S17.385 2.25 12 2.25zM13.36 10.186a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"/>
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      <section className="mx-auto flex max-w-md flex-col gap-8">

        {/* ── 1. Header profil ── */}
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="relative mb-4 group">
            <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-primary shadow-md text-3xl font-bold text-on-primary">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={name}
                  className="size-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <button
              type="button"
              id="btn-edit-avatar-badge"
              onClick={() => setShowEditProfile(true)}
              className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-2 ring-background transition hover:scale-105 active:scale-95 cursor-pointer"
              title={t("change_photo", "Ubah Foto")}
            >
              <svg className="size-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
                <path fillRule="evenodd" clipRule="evenodd" d="M9.344 3.071a1.5 1.5 0 011.06-.442h3.192c.398 0 .779.159 1.06.442l1.171 1.172a3 3 0 002.122.879H20.25a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 17.872V7.372a2.25 2.25 0 012.25-2.25h2.205a3 3 0 002.122-.88l1.171-1.171zM12 7.5a5.25 5.25 0 100 10.5 5.25 5.25 0 000-10.5z" />
              </svg>
            </button>
          </div>
          <h1 className="text-xl font-bold text-foreground">{name}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{profile?.nip ?? data?.user?.email}</p>
          {(profile?.position || profile?.department) && (
            <div className="mt-2 flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <svg className="size-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M7.5 5.25a3 3 0 013-3h3a3 3 0 013 3v.205c.933.085 1.857.197 2.774.334 1.454.218 2.476 1.483 2.476 2.917v3.033a48.86 48.86 0 01-7.003.57 49.02 49.02 0 01-7.494-.57V8.706c0-1.434 1.022-2.7 2.476-2.917A48.814 48.814 0 017.5 5.455V5.25zm7.5 0v.09a49.488 49.488 0 00-6 0v-.09a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5zm-9.75 8.87v4.63c0 1.434 1.022 2.7 2.476 2.917.92.138 1.845.249 2.774.334v-3.75a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5v3.75c.93-.085 1.853-.196 2.774-.334 1.454-.218 2.476-1.483 2.476-2.917v-4.63a50.36 50.36 0 01-8.25.68 50.364 50.364 0 01-8.25-.68z" clipRule="evenodd" />
              </svg>
              <span>
                {[profile.position, profile.department].filter(Boolean).join(" • ")}
              </span>
            </div>
          )}
        </div>

        {/* ── 2. Mini Dashboard ── */}
        <div>
          <SectionLabel>{t("summary_this_month", "Ringkasan Bulan Ini")}</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <DashCard
              value={dashboard?.leave_quota ?? 0}
              unit={t("unit_days", "Hari")}
              label={t("leave_remaining", "Sisa Cuti")}
              colorClass="text-primary"
              borderClass="border-l-primary"
            />
            <DashCard
              value={dashboard?.hadir ?? 0}
              unit={t("unit_days", "Hari")}
              label={t("present", "Hadir")}
              colorClass="text-emerald-600 dark:text-emerald-500"
              borderClass="border-l-emerald-500"
            />
            <DashCard
              value={dashboard?.terlambat ?? 0}
              unit={t("unit_times", "Kali")}
              label={t("late", "Terlambat")}
              colorClass="text-red-600 dark:text-red-500"
              borderClass="border-l-red-500"
            />
            <DashCard
              value={dashboard?.sakit_izin ?? 0}
              unit={t("unit_days", "Hari")}
              label={t("sick_leave", "Sakit / Izin")}
              colorClass="text-muted-foreground"
              borderClass="border-l-border"
            />
          </div>
        </div>

        {/* ── 3. Informasi Personal ── */}
        <div>
          <div className="mb-3 flex items-center justify-between px-1">
            <SectionLabel>{t("personal_info", "Informasi Personal")}</SectionLabel>
            <button
              id="btn-edit-profile"
              onClick={() => setShowEditProfile(true)}
              className="pressable flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/10 cursor-pointer"
            >
              <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z"/>
              </svg>
              {t("edit", "Edit")}
            </button>
          </div>
          <Card className="overflow-hidden p-0 border border-border">
            <div className="divide-y divide-border">
              <InfoRow
                icon={
                  <svg className="size-5 fill-current" viewBox="0 0 24 24">
                    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z"/>
                    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z"/>
                  </svg>
                }
                label={t("email", "Email")}
                value={data?.user?.email ?? ""}
              />
              <InfoRow
                icon={
                  <svg className="size-5 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M4.5 3.75A1.5 1.5 0 003 5.25v13.5A1.5 1.5 0 004.5 20.25h15a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H4.5zm10.5 4.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-5.25 6.75a3 3 0 016 0H9.75z" />
                  </svg>
                }
                label={t("nip_nim", "NIP / NIM")}
                value={profile?.nip || t("not_filled", "Belum diisi")}
              />
              <InfoRow
                icon={
                  <svg className="size-5 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.251.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"/>
                  </svg>
                }
                label={t("phone_wa", "WhatsApp / Telepon")}
                value={profile?.phone ?? ""}
              />
              <InfoRow
                icon={
                  <svg className="size-5 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5a.75.75 0 01.75.75V4.5a.75.75 0 01-1.5 0V2.25A.75.75 0 0112 1.5zM5.636 4.136a.75.75 0 011.06 0l1.592 1.591a.75.75 0 01-1.06 1.061L5.636 5.197a.75.75 0 010-1.061zm12.728 0a.75.75 0 010 1.06l-1.591 1.592a.75.75 0 01-1.061-1.06l1.592-1.592a.75.75 0 011.06 0zM12 6a6 6 0 00-6 6v3.25c0 .414-.336.75-.75.75H4.5a.75.75 0 000 1.5h15a.75.75 0 000-1.5h-.75a.75.75 0 01-.75-.75V12a6 6 0 00-6-6zm-3.25 13.5a3.25 3.25 0 006.5 0h-6.5z"/>
                  </svg>
                }
                label={t("emergency_contact", "Kontak Darurat")}
                value={profile?.emergency_contact || t("not_filled", "Belum diisi")}
                iconBg="bg-red-50 dark:bg-red-950/50"
                iconColor="text-red-600 dark:text-red-500"
              />
              <InfoRow
                icon={
                  <svg className="size-5 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M4.5 2.25a.75.75 0 00-.75.75v18c0 .414.336.75.75.75h15a.75.75 0 00.75-.75V3a.75.75 0 00-.75-.75H4.5zm3 4.5a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75V6.75zm6 0a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75V6.75zm-6 4.5a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-1.5zm6 0a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-1.5zm-6 4.5a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-1.5zm6 0a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-1.5z"/>
                  </svg>
                }
                label={t("department", "Departemen")}
                value={profile?.department ?? ""}
              />
              <InfoRow
                icon={
                  <svg className="size-5 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v1.5H3.75A2.25 2.25 0 001.5 9v10.5A2.25 2.25 0 003.75 21.75h16.5A2.25 2.25 0 0022.5 19.5V9a2.25 2.25 0 00-2.25-2.25H18v-1.5a1.5 1.5 0 00-1.5-1.5h-9zm9 3V5.25a.5.5 0 00-.5-.5h-8a.5.5 0 00-.5.5v1.5h9zM3 10.5v9c0 .414.336.75.75.75h16.5a.75.75 0 00.75-.75v-9H3z"/>
                  </svg>
                }
                label={t("position", "Jabatan")}
                value={profile?.position ?? ""}
              />
            </div>
          </Card>
        </div>

        {/* ── 4. Keamanan & Akun ── */}
        <div>
          <SectionLabel>{t("security_account", "Keamanan & Akun")}</SectionLabel>
          <Card className="overflow-hidden p-0 border border-border">
            <div className="divide-y divide-border">
              <button
                id="btn-change-password"
                onClick={() => setShowChangePassword(true)}
                className="flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-muted cursor-pointer"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg className="size-5 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5zM12 13.5a1.5 1.5 0 00-.75 2.8v1.45a.75.75 0 001.5 0V16.3A1.5 1.5 0 0012 13.5z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{t("change_password", "Ubah Kata Sandi")}</p>
                  <p className="text-xs text-muted-foreground">{t("change_password_desc", "Ganti kata sandi akun Anda")}</p>
                </div>
                <span className="text-muted-foreground">›</span>
              </button>
            </div>
          </Card>
        </div>

        {/* ── 5. Pengaturan Aplikasi ── */}
        <div>
          <SectionLabel>{t("app_settings", "Pengaturan Aplikasi")}</SectionLabel>
          <Card className="overflow-hidden p-0 border border-border">
            <div className="divide-y divide-border">
              <div className="flex items-center gap-4 px-4 py-3.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg className="size-5 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.23H3.429a.75.75 0 01-.297-1.23A8.25 8.25 0 005.25 9.75V9zm3.5 10.5a3.25 3.25 0 006.5 0h-6.5z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{t("notifications", "Notifikasi")}</p>
                  <p className="text-xs text-muted-foreground">{notifEnabled ? t("notif_active", "Aktif (Menerima pemberitahuan)") : t("notif_inactive", "Nonaktif")}</p>
                </div>
                <Toggle
                  id="toggle-notif"
                  checked={notifEnabled}
                  onChange={handleToggleNotif}
                />
              </div>
              <button
                type="button"
                id="btn-select-language"
                onClick={() => setShowLanguageModal(true)}
                className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition hover:bg-muted cursor-pointer"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg className="size-5 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 3.75c.983 0 2.052 1.34 2.802 3.75H9.198C9.948 5.09 11.017 3.75 12 3.75zm-4.36 4.5h8.72c.42 1.543.64 3.238.64 5s-.22 3.457-.64 5H7.64c-.42-1.543-.64-3.238-.64-5s.22-3.457.64-5zm1.558 11.25C8.448 17.09 7.379 15.75 6.396 15.75h11.208c-.983 0-2.052 1.34-2.802 3.75H9.198z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{t("choose_language", "Pilih Bahasa")}</p>
                  <p className="text-xs text-muted-foreground">{t("language_display_desc", "Bahasa tampilan aplikasi")}</p>
                </div>
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  {language === "id" ? "🇮🇩 Bahasa Indonesia" : "🇬🇧 English"}
                  <span className="text-base leading-none text-muted-foreground">›</span>
                </span>
              </button>
            </div>
          </Card>
        </div>

        {/* ── 6. Logout ── */}
        <div className="pb-4">
          <button
            id="btn-logout"
            onClick={() => void signOut()}
            className="pressable flex w-full items-center justify-center gap-2 rounded-2xl border border-red-600/30 py-4 text-base font-bold text-red-600 transition hover:bg-red-50 dark:border-red-500/30 dark:text-red-500 dark:hover:bg-red-950/50 cursor-pointer"
          >
            <svg className="size-5 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5v-2.25a.75.75 0 00-1.5 0v2.25a.5.5 0 01-.5.5h-6a.5.5 0 01-.5-.5V5.25a.5.5 0 01.5-.5h6a.5.5 0 01.5.5v2.25a.75.75 0 001.5 0V5.25a1.5 1.5 0 00-1.5-1.5h-6zm9.72 4.72a.75.75 0 011.06 0l3.75 3.75a.75.75 0 010 1.06l-3.75 3.75a.75.75 0 11-1.06-1.06l2.47-2.47H10.5a.75.75 0 010-1.5h9.19l-2.47-2.47a.75.75 0 010-1.06z"/>
            </svg>
            {t("logout", "Keluar")}
          </button>
        </div>

      </section>
    </>
  );
}
