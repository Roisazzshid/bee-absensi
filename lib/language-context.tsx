"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Language = "id" | "en";

export const DICTIONARY: Record<Language, Record<string, string>> = {
  id: {
    // Nav & Shell
    nav_home: "Beranda",
    nav_history: "Riwayat",
    nav_leave: "Izin & Cuti",
    nav_profile: "Profil",
    logout: "Keluar",
    menu: "Menu",

    // Profile Page
    profile_title: "Profil & Pengaturan",
    summary_this_month: "Ringkasan Bulan Ini",
    leave_remaining: "Sisa Cuti",
    present: "Hadir",
    late: "Terlambat",
    sick_leave: "Sakit / Izin",
    unit_days: "Hari",
    unit_times: "Kali",

    // Personal Info
    personal_info: "Informasi Personal",
    edit: "Edit",
    email: "Email",
    phone_wa: "WhatsApp / Telepon",
    emergency_contact: "Kontak Darurat",
    not_filled: "Belum diisi",
    department: "Departemen",
    position: "Jabatan",

    // Edit Profile Modal
    edit_contact_title: "Edit Profil",
    edit_profile_desc: "Perbarui foto profil, nama, dan data kontak Anda",
    profile_photo: "Foto Profil",
    change_photo: "Ubah Foto",
    upload_photo: "Pilih Foto",
    remove_photo: "Hapus Foto",
    photo_hint: "Maksimal 5MB (JPG, PNG, WebP)",
    full_name: "Nama Lengkap",
    full_name_placeholder: "Nama lengkap",
    nip_nim: "NIP / NIM",
    nip_nim_placeholder: "Nomor Induk Pegawai / Mahasiswa",
    save_changes: "Simpan Perubahan",
    saving: "Menyimpan…",
    cancel: "Batal",
    profile_updated_toast: "Profil berhasil diperbarui!",

    // Security & Account
    security_account: "Keamanan & Akun",
    change_password: "Ubah Kata Sandi",
    change_password_desc: "Ganti kata sandi akun Anda",
    current_password: "Kata Sandi Saat Ini",
    current_password_placeholder: "Kata sandi lama",
    new_password: "Kata Sandi Baru",
    new_password_placeholder: "Min. 8 karakter",
    confirm_password: "Konfirmasi Kata Sandi Baru",
    confirm_password_placeholder: "Ulangi kata sandi baru",
    password_changed_success: "Kata sandi berhasil diubah!",
    password_changed_desc: "Semua sesi aktif telah diakhiri. Silakan masuk kembali.",
    ok: "Oke",

    // App Settings
    app_settings: "Pengaturan Aplikasi",
    notifications: "Notifikasi",
    notif_active: "Aktif (Menerima pemberitahuan)",
    notif_inactive: "Nonaktif",
    choose_language: "Pilih Bahasa",
    language_display_desc: "Bahasa tampilan aplikasi",
    language_modal_title: "Pilih Bahasa Aplikasi",
    language_modal_subtitle: "Pilih bahasa tampilan yang Anda inginkan",
    lang_id_name: "Bahasa Indonesia",
    lang_id_desc: "Bahasa resmi aplikasi",
    lang_en_name: "English",
    lang_en_desc: "Bahasa internasional",
    notif_enabled_toast: "Notifikasi aplikasi berhasil diaktifkan",
    notif_disabled_toast: "Notifikasi aplikasi dinonaktifkan",
    lang_changed_toast: "Bahasa diubah ke Bahasa Indonesia",
  },
  en: {
    // Nav & Shell
    nav_home: "Home",
    nav_history: "History",
    nav_leave: "Leave & Request",
    nav_profile: "Profile",
    logout: "Sign Out",
    menu: "Menu",

    // Profile Page
    profile_title: "Profile & Settings",
    summary_this_month: "This Month's Summary",
    leave_remaining: "Remaining Leave",
    present: "Present",
    late: "Late",
    sick_leave: "Sick / Leave",
    unit_days: "Days",
    unit_times: "Times",

    // Personal Info
    personal_info: "Personal Information",
    edit: "Edit",
    email: "Email",
    phone_wa: "WhatsApp / Phone",
    emergency_contact: "Emergency Contact",
    not_filled: "Not filled",
    department: "Department",
    position: "Position",

    // Edit Profile Modal
    edit_contact_title: "Edit Profile",
    edit_profile_desc: "Update your profile picture, name, and contact details",
    profile_photo: "Profile Picture",
    change_photo: "Change Photo",
    upload_photo: "Choose Photo",
    remove_photo: "Remove Photo",
    photo_hint: "Max 5MB (JPG, PNG, WebP)",
    full_name: "Full Name",
    full_name_placeholder: "Full name",
    nip_nim: "NIP / NIM",
    nip_nim_placeholder: "Employee or Student ID",
    save_changes: "Save Changes",
    saving: "Saving…",
    cancel: "Cancel",
    profile_updated_toast: "Profile updated successfully!",

    // Security & Account
    security_account: "Security & Account",
    change_password: "Change Password",
    change_password_desc: "Update your account password",
    current_password: "Current Password",
    current_password_placeholder: "Old password",
    new_password: "New Password",
    new_password_placeholder: "Min. 8 characters",
    confirm_password: "Confirm New Password",
    confirm_password_placeholder: "Repeat new password",
    password_changed_success: "Password successfully changed!",
    password_changed_desc: "All active sessions have been terminated. Please sign in again.",
    ok: "OK",

    // App Settings
    app_settings: "App Settings",
    notifications: "Notifications",
    notif_active: "Active (Receiving notifications)",
    notif_inactive: "Disabled",
    choose_language: "Select Language",
    language_display_desc: "App display language",
    language_modal_title: "Select App Language",
    language_modal_subtitle: "Choose your preferred display language",
    lang_id_name: "Bahasa Indonesia",
    lang_id_desc: "Indonesian language",
    lang_en_name: "English",
    lang_en_desc: "International English language",
    notif_enabled_toast: "App notifications enabled",
    notif_disabled_toast: "App notifications disabled",
    lang_changed_toast: "Language changed to English",
  },
};

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("id");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bee_app_language");
      if (saved === "en" || saved === "id") {
        setLanguageState(saved);
      }

      const handleStorage = (e: StorageEvent) => {
        if (e.key === "bee_app_language" && (e.newValue === "en" || e.newValue === "id")) {
          setLanguageState(e.newValue);
        }
      };

      const handleCustom = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (detail === "en" || detail === "id") {
          setLanguageState(detail);
        }
      };

      window.addEventListener("storage", handleStorage);
      window.addEventListener("bee_language_changed", handleCustom);
      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener("bee_language_changed", handleCustom);
      };
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("bee_app_language", lang);
      window.dispatchEvent(new CustomEvent("bee_language_changed", { detail: lang }));
    }
  };

  const t = (key: string, fallback?: string): string => {
    const dict = DICTIONARY[language] || DICTIONARY.id;
    return dict[key] ?? fallback ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      language: "id" as Language,
      setLanguage: () => {},
      t: (key: string, fallback?: string) => DICTIONARY.id[key] ?? fallback ?? key,
    };
  }
  return context;
}
