"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { useState } from "react";

type Tab = "umum" | "absensi" | "notifikasi" | "akun";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "umum",
    label: "Umum",
    icon: (
      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
  {
    id: "absensi",
    label: "Absensi",
    icon: (
      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M9 16l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: "notifikasi",
    label: "Notifikasi",
    icon: (
      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
  },
  {
    id: "akun",
    label: "Akun",
    icon: (
      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export function AdminSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("umum");
  const [saved, setSaved] = useState(false);

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pengaturan</h1>
        <p className="text-sm mt-1 text-muted-foreground">Kelola konfigurasi aplikasi dan preferensi sistem</p>
      </div>

      {/* Saved toast */}
      {saved && (
        <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg animate-pulse bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-900/50">
          <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Pengaturan berhasil disimpan!
        </div>
      )}

      <div className="flex gap-5 flex-col md:flex-row">
        {/* Sidebar tabs */}
        <div className="flex md:flex-col gap-1 md:w-52 shrink-0 overflow-x-auto md:overflow-visible">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap transition-all duration-150 text-left w-full border ${
                  active
                    ? "bg-muted text-foreground border-border"
                    : "bg-transparent text-muted-foreground border-transparent hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content panel */}
        <div className="flex-1 rounded-2xl p-5 md:p-6 border border-border bg-transparent">
          {activeTab === "umum" && <TabUmum onSave={showSaved} />}
          {activeTab === "absensi" && <TabAbsensi onSave={showSaved} />}
          {activeTab === "notifikasi" && <TabNotifikasi onSave={showSaved} />}
          {activeTab === "akun" && <TabAkun user={user} onSave={showSaved} />}
        </div>
      </div>
    </div>
  );
}

/* ── Tab Umum ── */
function TabUmum({ onSave }: { onSave: () => void }) {
  const [form, setForm] = useState({
    app_name: "Bee Absensi",
    company: "PT. Bee Digital Indonesia",
    timezone: "Asia/Jakarta",
    language: "id",
    logo_text: "B",
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-base text-foreground">Pengaturan Umum</h2>
        <p className="text-xs mt-0.5 text-muted-foreground">Informasi dasar aplikasi dan perusahaan</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama Aplikasi">
          <input
            className="field-input"
            value={form.app_name}
            onChange={(e) => setForm((f) => ({ ...f, app_name: e.target.value }))}
          />
        </Field>
        <Field label="Nama Perusahaan">
          <input
            className="field-input"
            value={form.company}
            onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
          />
        </Field>
        <Field label="Zona Waktu">
          <select
            className="field-input"
            value={form.timezone}
            onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
          >
            <option value="Asia/Jakarta">Asia/Jakarta (WIB, UTC+7)</option>
            <option value="Asia/Makassar">Asia/Makassar (WITA, UTC+8)</option>
            <option value="Asia/Jayapura">Asia/Jayapura (WIT, UTC+9)</option>
          </select>
        </Field>
        <Field label="Bahasa">
          <select
            className="field-input"
            value={form.language}
            onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
          >
            <option value="id">Bahasa Indonesia</option>
            <option value="en">English</option>
          </select>
        </Field>
      </div>

      <div className="pt-4 border-t border-border">
        <h3 className="font-semibold text-sm mb-3 text-foreground">Tampilan Aplikasi</h3>
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl text-2xl font-black text-primary-foreground shadow-md bg-primary">
            {form.logo_text || "B"}
          </div>
          <div>
            <Field label="Teks Logo">
              <input
                className="field-input w-24"
                maxLength={2}
                value={form.logo_text}
                onChange={(e) => setForm((f) => ({ ...f, logo_text: e.target.value.toUpperCase() }))}
              />
            </Field>
          </div>
        </div>
      </div>

      <SaveButton onClick={onSave} />
    </div>
  );
}

/* ── Tab Absensi ── */
function TabAbsensi({ onSave }: { onSave: () => void }) {
  const [form, setForm] = useState({
    check_in_start: "07:00",
    check_in_end: "09:00",
    late_threshold: "08:00",
    check_out_time: "17:00",
    work_days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"],
    allow_weekend: false,
    radius_meter: "100",
  });

  const ALL_DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  const toggleDay = (day: string) => {
    setForm((f) => ({
      ...f,
      work_days: f.work_days.includes(day)
        ? f.work_days.filter((d) => d !== day)
        : [...f.work_days, day],
    }));
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-base text-foreground">Pengaturan Absensi</h2>
        <p className="text-xs mt-0.5 text-muted-foreground">Konfigurasi jam kerja dan aturan kehadiran</p>
      </div>

      {/* Jam Kerja */}
      <div>
        <h3 className="font-semibold text-sm mb-3 text-foreground">Jam Kerja</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Check-in Mulai">
            <input type="time" className="field-input" value={form.check_in_start}
              onChange={(e) => setForm((f) => ({ ...f, check_in_start: e.target.value }))} />
          </Field>
          <Field label="Check-in Berakhir">
            <input type="time" className="field-input" value={form.check_in_end}
              onChange={(e) => setForm((f) => ({ ...f, check_in_end: e.target.value }))} />
          </Field>
          <Field label="Batas Tepat Waktu (Terlambat setelah)">
            <input type="time" className="field-input" value={form.late_threshold}
              onChange={(e) => setForm((f) => ({ ...f, late_threshold: e.target.value }))} />
          </Field>
          <Field label="Jam Pulang">
            <input type="time" className="field-input" value={form.check_out_time}
              onChange={(e) => setForm((f) => ({ ...f, check_out_time: e.target.value }))} />
          </Field>
        </div>
      </div>

      {/* Hari Kerja */}
      <div className="pt-4 border-t border-border">
        <h3 className="font-semibold text-sm mb-3 text-foreground">Hari Kerja</h3>
        <div className="flex flex-wrap gap-2">
          {ALL_DAYS.map((day) => {
            const active = form.work_days.includes(day);
            return (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all border ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Radius */}
      <div className="pt-4 border-t border-border">
        <h3 className="font-semibold text-sm mb-3 text-foreground">Lokasi & Radius</h3>
        <Field label="Radius Check-in (meter)">
          <input
            type="number" min="10" max="5000" className="field-input w-40"
            value={form.radius_meter}
            onChange={(e) => setForm((f) => ({ ...f, radius_meter: e.target.value }))}
          />
        </Field>
        <p className="text-xs mt-1 text-muted-foreground">
          Karyawan harus berada dalam radius ini dari kantor untuk bisa check-in
        </p>
      </div>

      <SaveButton onClick={onSave} />
    </div>
  );
}

/* ── Tab Notifikasi ── */
function TabNotifikasi({ onSave }: { onSave: () => void }) {
  const [notifs, setNotifs] = useState({
    email_late: true,
    email_absent: true,
    email_leave_request: true,
    email_leave_approved: false,
    email_weekly_report: true,
    email_monthly_report: false,
    system_login: true,
    system_export: false,
  });

  const toggle = (key: keyof typeof notifs) =>
    setNotifs((n) => ({ ...n, [key]: !n[key] }));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-base text-foreground">Pengaturan Notifikasi</h2>
        <p className="text-xs mt-0.5 text-muted-foreground">Pilih notifikasi yang ingin Anda terima</p>
      </div>

      <NotifGroup title="Email — Kehadiran">
        <NotifRow
          label="Karyawan Terlambat"
          desc="Kirim email saat karyawan check-in setelah batas waktu"
          checked={notifs.email_late}
          onChange={() => toggle("email_late")}
        />
        <NotifRow
          label="Karyawan Belum Absen"
          desc="Kirim email harian daftar karyawan yang belum check-in"
          checked={notifs.email_absent}
          onChange={() => toggle("email_absent")}
        />
      </NotifGroup>

      <NotifGroup title="Email — Pengajuan Izin">
        <NotifRow
          label="Pengajuan Izin Baru"
          desc="Kirim email saat ada karyawan mengajukan izin/cuti"
          checked={notifs.email_leave_request}
          onChange={() => toggle("email_leave_request")}
        />
        <NotifRow
          label="Izin Disetujui/Ditolak"
          desc="Kirim email konfirmasi ke karyawan setelah diproses"
          checked={notifs.email_leave_approved}
          onChange={() => toggle("email_leave_approved")}
        />
      </NotifGroup>

      <NotifGroup title="Email — Laporan Otomatis">
        <NotifRow
          label="Laporan Mingguan"
          desc="Kirim ringkasan kehadiran setiap Senin pagi"
          checked={notifs.email_weekly_report}
          onChange={() => toggle("email_weekly_report")}
        />
        <NotifRow
          label="Laporan Bulanan"
          desc="Kirim rekap bulanan setiap tanggal 1"
          checked={notifs.email_monthly_report}
          onChange={() => toggle("email_monthly_report")}
        />
      </NotifGroup>

      <NotifGroup title="Log Sistem">
        <NotifRow
          label="Login Admin"
          desc="Catat setiap aktivitas login ke panel admin"
          checked={notifs.system_login}
          onChange={() => toggle("system_login")}
        />
        <NotifRow
          label="Export Data"
          desc="Catat setiap kali data di-export"
          checked={notifs.system_export}
          onChange={() => toggle("system_export")}
        />
      </NotifGroup>

      <SaveButton onClick={onSave} />
    </div>
  );
}

/* ── Tab Akun ── */
function TabAkun({ user, onSave }: { user: any; onSave: () => void }) {
  const [profile, setProfile] = useState({
    full_name: user?.profile?.full_name ?? "",
    email: user?.email ?? "",
    phone: user?.profile?.phone ?? "",
  });
  const [pw, setPw] = useState({ current: "", new_pw: "", confirm: "" });
  const [pwError, setPwError] = useState("");

  const handleSaveProfile = () => onSave();

  const handleChangePassword = () => {
    setPwError("");
    if (!pw.current) return setPwError("Masukkan password saat ini.");
    if (pw.new_pw.length < 8) return setPwError("Password baru minimal 8 karakter.");
    if (pw.new_pw !== pw.confirm) return setPwError("Konfirmasi password tidak cocok.");
    setPw({ current: "", new_pw: "", confirm: "" });
    onSave();
  };

  const initials = profile.full_name
    ? profile.full_name.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase()
    : "AD";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-base text-foreground">Profil Akun</h2>
        <p className="text-xs mt-0.5 text-muted-foreground">Kelola informasi akun administrator</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-2xl text-xl font-black text-primary-foreground shadow bg-primary">
          {initials}
        </div>
        <div>
          <p className="font-bold text-sm text-foreground">{profile.full_name || "Administrator"}</p>
          <p className="text-xs text-muted-foreground">{profile.email}</p>
          <span className="mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-muted text-blue-600 dark:text-blue-400">
            ⚡ Administrator
          </span>
        </div>
      </div>

      {/* Profile form */}
      <div className="grid gap-4 sm:grid-cols-2 pt-5 border-t border-border">
        <Field label="Nama Lengkap">
          <input className="field-input" value={profile.full_name}
            onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))} />
        </Field>
        <Field label="Email">
          <input className="field-input" type="email" value={profile.email}
            onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
        </Field>
        <Field label="No. Telepon">
          <input className="field-input" type="tel" value={profile.phone}
            onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
        </Field>
      </div>
      <button
        onClick={handleSaveProfile}
        className="rounded-xl px-4 py-2 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-95 bg-primary"
      >
        Simpan Profil
      </button>

      {/* Change password */}
      <div className="pt-5 border-t border-border">
        <h3 className="font-semibold text-sm mb-4 text-foreground">Ubah Password</h3>
        {pwError && (
          <div className="mb-3 rounded-xl px-3 py-2 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900/50">
            {pwError}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password Saat Ini">
            <input className="field-input" type="password" value={pw.current} placeholder="••••••••"
              onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} />
          </Field>
          <div />
          <Field label="Password Baru">
            <input className="field-input" type="password" value={pw.new_pw} placeholder="Min. 8 karakter"
              onChange={(e) => setPw((p) => ({ ...p, new_pw: e.target.value }))} />
          </Field>
          <Field label="Konfirmasi Password Baru">
            <input className="field-input" type="password" value={pw.confirm} placeholder="Ulangi password baru"
              onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} />
          </Field>
        </div>
        <button
          onClick={handleChangePassword}
          className="mt-4 rounded-xl px-4 py-2 text-sm font-bold transition-all hover:opacity-90 active:scale-95 bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/50"
        >
          Ganti Password
        </button>
      </div>
    </div>
  );
}

/* ── Helpers ── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-foreground">{label}</label>
      {children}
    </div>
  );
}

function SaveButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-end pt-4 border-t border-border">
      <button
        onClick={onClick}
        className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-95 bg-primary"
      >
        <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
        Simpan Pengaturan
      </button>
    </div>
  );
}

function NotifGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold mb-2 uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="rounded-xl overflow-hidden border border-border">
        {children}
      </div>
    </div>
  );
}

function NotifRow({ label, desc, checked, onChange }: {
  label: string; desc: string; checked: boolean; onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 transition-colors border-b border-border last:border-b-0">
      <div className="flex-1 min-w-0 mr-4">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs mt-0.5 text-muted-foreground">{desc}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative shrink-0 h-6 w-11 rounded-full transition-all duration-200 ${
          checked ? "bg-primary" : "bg-muted border border-border"
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white dark:bg-black shadow transition-transform duration-200"
          style={{ transform: checked ? "translateX(1.25rem)" : "translateX(0.125rem)" }}
        />
      </button>
    </div>
  );
}
