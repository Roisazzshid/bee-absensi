"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Tab = "umum" | "absensi" | "notifikasi" | "akun";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "umum",
    label: "Umum",
    icon: (
      <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.16 5.43a1.875 1.875 0 00-2.282.818l1.642 1.642a1.875 1.875 0 002.582 2.582l-1.642-1.642a1.875 1.875 0 00-.818 2.282l.46 1.157c.043.116.032.284-.083.45-.17.238-.363.468-.57.686-.088.182-.228.277-.348.297L3.817 12.922a1.875 1.875 0 00-1.567 1.85v1.456c0 .917.663 1.699 1.567 1.85l1.062.177c.12.02.26.115.348.297.207.218.4.448.57.686.115.166.126.334.083.45l-.46 1.157a1.875 1.875 0 00.818 2.282l1.03.595a1.875 1.875 0 002.282-.818l.459-1.157c.043-.116.211-.127.377-.083.313.19.642.355.986.494.182.088.277.228.297.348l.177 1.062c.151.904.933 1.567 1.85 1.567h1.844c.917 0 1.699-.663 1.85-1.567l.177-1.062c.02-.12.115-.26.297-.348.344-.139.673-.304.986-.494.166-.115.334-.126.45-.083l1.157.46a1.875 1.875 0 002.282-.818l.595-1.03a1.875 1.875 0 00-.818-2.282l-1.157-.459c-.116-.043-.127-.211-.083-.377.19-.313.355-.642.494-.986.088-.182.228-.277.348-.297l1.062-.177c.904-.151 1.567-.933 1.567-1.85v-1.844c0-.917-.663-1.699-1.567-1.85l-1.062-.177c-.12-.02-.26-.115-.348-.297a7.493 7.493 0 00-.494-.986c-.115-.166-.126-.334-.083-.45l.46-1.157a1.875 1.875 0 00-.818-2.282l-1.03-.595a1.875 1.875 0 00-2.282.818l-.459 1.157c-.043.116-.211.127-.377.083a7.493 7.493 0 00-.986-.494c-.182-.088-.277-.228-.297-.348l-.177-1.062A1.875 1.875 0 0012.922 2.25h-1.844zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: "absensi",
    label: "Absensi",
    icon: (
      <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
        <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75A3.75 3.75 0 0122.5 8.25v10.5A3.75 3.75 0 0118.75 22.5H5.25A3.75 3.75 0 011.5 18.75V8.25A3.75 3.75 0 015.25 4.5H6V3a.75.75 0 01.75-.75zm12 6H5.25a2.25 2.25 0 00-2.25 2.25v8.25c0 1.243 1.007 2.25 2.25 2.25h13.5c1.243 0 2.25-1.007 2.25-2.25v-8.25a2.25 2.25 0 00-2.25-2.25z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: "notifikasi",
    label: "Notifikasi",
    icon: (
      <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 004.496 0 25.057 25.057 0 01-4.496 0z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: "akun",
    label: "Akun",
    icon: (
      <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export function AdminSettingsPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-muted" />}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(
    tabParam && ["umum", "absensi", "notifikasi", "akun"].includes(tabParam) ? tabParam : "umum"
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (tabParam && ["umum", "absensi", "notifikasi", "akun"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Pengaturan Sistem</h1>
        <p className="text-sm mt-1 text-muted-foreground">Kelola konfigurasi aplikasi, aturan absensi, notifikasi, dan profil akun administrator</p>
      </div>

      {/* Saved toast */}
      {saved && (
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg animate-pulse bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/50">
          <svg className="size-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
          </svg>
          Pengaturan berhasil disimpan!
        </div>
      )}

      <div className="flex gap-6 flex-col md:flex-row">
        {/* Sidebar tabs */}
        <div className="flex md:flex-col gap-2 md:w-56 shrink-0 overflow-x-auto md:overflow-visible">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold whitespace-nowrap transition-all duration-200 text-left w-full cursor-pointer ${
                  active
                    ? "bg-primary text-primary-foreground shadow-md shadow-amber-500/10"
                    : "bg-card text-muted-foreground border border-border hover:bg-muted/70 hover:text-foreground shadow-2xs"
                }`}
              >
                <span className={`flex size-5 items-center justify-center ${active ? "text-primary-foreground" : "text-muted-foreground"}`}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content panel */}
        <div className="flex-1 rounded-3xl p-6 md:p-8 border border-border bg-card shadow-sm">
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
  const { request } = useAuth();
  const [form, setForm] = useState({
    app_name: "Bee Absensi",
    company: "PT. Bee Digital Indonesia",
    timezone: "Asia/Jakarta",
    language: "id",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const cached = typeof window !== "undefined" ? localStorage.getItem("bee_settings_general") : null;
    if (cached) {
      try {
        setForm((prev) => ({ ...prev, ...JSON.parse(cached) }));
      } catch {}
    }

    request<Record<string, string>>("/admin/settings")
      .then((res) => {
        if (res && typeof res === "object") {
          setForm((prev) => {
            const updated = {
              app_name: res.app_name || prev.app_name,
              company: res.company || prev.company,
              timezone: res.timezone || prev.timezone,
              language: res.language || prev.language,
            };
            localStorage.setItem("bee_settings_general", JSON.stringify(updated));
            return updated;
          });
        }
      })
      .catch(() => {});
  }, [request]);

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem("bee_settings_general", JSON.stringify(form));
      window.dispatchEvent(new CustomEvent("bee_settings_updated", { detail: form }));
      await request("/admin/settings", {
        method: "POST",
        body: JSON.stringify(form),
      });
    } catch (err) {
      console.warn("Save settings error:", err);
    } finally {
      setSaving(false);
      onSave();
    }
  };

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

      <SaveButton onClick={handleSave} saving={saving} />
    </div>
  );
}

/* ── Tab Absensi ── */
type DaySchedule = {
  active: boolean;
  start_time: string; // Batas Masuk / Tepat Waktu
  end_time: string;   // Jam Pulang
};

const DEFAULT_DAYS: Record<string, DaySchedule> = {
  Senin: { active: true, start_time: "08:30", end_time: "17:00" },
  Selasa: { active: true, start_time: "08:30", end_time: "17:00" },
  Rabu: { active: true, start_time: "08:30", end_time: "17:00" },
  Kamis: { active: true, start_time: "08:30", end_time: "17:00" },
  Jumat: { active: true, start_time: "10:00", end_time: "17:00" },
  Sabtu: { active: false, start_time: "08:30", end_time: "13:00" },
  Minggu: { active: false, start_time: "08:30", end_time: "17:00" },
};

const ALL_DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

const TOLERANCE_PRESETS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120];
const CUTOFF_PRESETS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120];

function formatMinuteOption(min: number) {
  if (min === 0) return "0 Menit (Tepat Waktu - Tanpa Toleransi)";
  if (min === 60) return "60 Menit (1 Jam)";
  if (min === 90) return "90 Menit (1.5 Jam)";
  if (min === 120) return "120 Menit (2 Jam)";
  return `${min} Menit`;
}

function TabAbsensi({ onSave }: { onSave: () => void }) {
  const { request } = useAuth();
  const [form, setForm] = useState({
    schedule_mode: "same" as "same" | "custom",
    start_time: "08:30",
    check_out_time: "17:00",
    late_tolerance_minutes: "30",
    check_in_cutoff_mode: "none" as "none" | "duration",
    check_in_cutoff_minutes: "60",
    work_days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"],
    allow_weekend: false,
    radius_meter: "100",
    daily_schedules: DEFAULT_DAYS,
  });
  const [customTolerance, setCustomTolerance] = useState(false);
  const [customCutoff, setCustomCutoff] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const cached = typeof window !== "undefined" ? localStorage.getItem("bee_settings_absensi") : null;
    if (cached) {
      try {
        setForm((prev) => ({ ...prev, ...JSON.parse(cached) }));
      } catch {}
    }

    request<Record<string, any>>("/admin/settings")
      .then((res) => {
        if (res && typeof res === "object") {
          let scheduleMode: "same" | "custom" = res.schedule_mode || "same";
          let dailySchedules = { ...DEFAULT_DAYS };

          if (res.daily_schedules) {
            try {
              const parsed = typeof res.daily_schedules === "string"
                ? JSON.parse(res.daily_schedules)
                : res.daily_schedules;
              if (parsed && typeof parsed === "object") {
                if (parsed.mode) scheduleMode = parsed.mode;
                if (parsed.schedules) {
                  dailySchedules = { ...DEFAULT_DAYS, ...parsed.schedules };
                }
              }
            } catch {}
          }

          let workDays = form.work_days;
          if (res.work_days) {
            try {
              workDays = typeof res.work_days === "string" ? JSON.parse(res.work_days) : res.work_days;
            } catch {}
          }

          setForm((prev) => ({
            ...prev,
            schedule_mode: scheduleMode,
            start_time: res.start_time || res.late_threshold || prev.start_time,
            check_out_time: res.check_out_time || res.end_time || prev.check_out_time,
            late_tolerance_minutes: res.late_tolerance_minutes !== undefined ? String(res.late_tolerance_minutes) : prev.late_tolerance_minutes,
            check_in_cutoff_mode: (res.check_in_cutoff_mode as "none" | "duration") || prev.check_in_cutoff_mode,
            check_in_cutoff_minutes: res.check_in_cutoff_minutes !== undefined ? String(res.check_in_cutoff_minutes) : prev.check_in_cutoff_minutes,
            work_days: Array.isArray(workDays) ? workDays : prev.work_days,
            radius_meter: res.radius_meter || prev.radius_meter,
            daily_schedules: dailySchedules,
          }));
        }
      })
      .catch(() => {});
  }, [request]);

  const toggleDay = (day: string) => {
    setForm((f) => ({
      ...f,
      work_days: f.work_days.includes(day)
        ? f.work_days.filter((d) => d !== day)
        : [...f.work_days, day],
    }));
  };

  const updateDaySchedule = (day: string, updates: Partial<DaySchedule>) => {
    setForm((f) => ({
      ...f,
      daily_schedules: {
        ...f.daily_schedules,
        [day]: {
          ...f.daily_schedules[day],
          ...updates,
        },
      },
    }));
  };

  const applyPresetWeekdayFriday = () => {
    setForm((f) => ({
      ...f,
      schedule_mode: "custom",
      daily_schedules: {
        Senin: { active: true, start_time: "08:30", end_time: "17:00" },
        Selasa: { active: true, start_time: "08:30", end_time: "17:00" },
        Rabu: { active: true, start_time: "08:30", end_time: "17:00" },
        Kamis: { active: true, start_time: "08:30", end_time: "17:00" },
        Jumat: { active: true, start_time: "10:00", end_time: "17:00" },
        Sabtu: { active: false, start_time: "08:30", end_time: "13:00" },
        Minggu: { active: false, start_time: "08:30", end_time: "17:00" },
      },
    }));
  };

  const copyMondayToWeekdays = () => {
    const monday = form.daily_schedules.Senin;
    setForm((f) => ({
      ...f,
      daily_schedules: {
        ...f.daily_schedules,
        Selasa: { ...f.daily_schedules.Selasa, start_time: monday.start_time, end_time: monday.end_time },
        Rabu: { ...f.daily_schedules.Rabu, start_time: monday.start_time, end_time: monday.end_time },
        Kamis: { ...f.daily_schedules.Kamis, start_time: monday.start_time, end_time: monday.end_time },
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Sync active days into work_days if in custom mode
      const activeWorkDays = form.schedule_mode === "custom"
        ? Object.entries(form.daily_schedules).filter(([_, s]) => s.active).map(([day]) => day)
        : form.work_days;

      const payload = {
        ...form,
        start_time: form.start_time,
        late_threshold: form.start_time,
        check_out_time: form.check_out_time,
        end_time: form.check_out_time,
        late_tolerance_minutes: form.late_tolerance_minutes,
        check_in_cutoff_mode: form.check_in_cutoff_mode,
        check_in_cutoff_minutes: form.check_in_cutoff_minutes,
        work_days: activeWorkDays,
        daily_schedules: {
          mode: form.schedule_mode,
          schedules: form.daily_schedules,
        },
      };

      localStorage.setItem("bee_settings_absensi", JSON.stringify(payload));
      await request("/admin/settings", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn("Save absensi error:", err);
    } finally {
      setSaving(false);
      onSave();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-base text-foreground">Pengaturan Absensi</h2>
        <p className="text-xs mt-0.5 text-muted-foreground">Konfigurasi jam kerja dan aturan kehadiran karyawan</p>
      </div>

      {/* Mode Jam Kerja Switcher */}
      <div className="rounded-2xl border border-border bg-muted/30 p-4">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
          Mode Jam Kerja
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, schedule_mode: "same" }))}
            className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              form.schedule_mode === "same"
                ? "border-primary bg-primary/10 shadow-xs"
                : "border-border bg-card hover:bg-muted/50 text-muted-foreground"
            }`}
          >
            <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
              form.schedule_mode === "same" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            }`}>
              <svg className="size-5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M4.5 2.25a.75.75 0 00-.75.75v18c0 .414.336.75.75.75h15a.75.75 0 00.75-.75V3a.75.75 0 00-.75-.75H4.5zm3 4.5a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75V6.75zm6 0a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75V6.75zm-6 4.5a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-1.5zm6 0a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-1.5zm-6 4.5a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-1.5zm6 0a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-1.5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Semua Hari Sama</p>
              <p className="text-xs text-muted-foreground mt-0.5">Satu jam masuk & jam pulang yang sama untuk semua hari kerja.</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, schedule_mode: "custom" }))}
            className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              form.schedule_mode === "custom"
                ? "border-primary bg-primary/10 shadow-xs"
                : "border-border bg-card hover:bg-muted/50 text-muted-foreground"
            }`}
          >
            <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
              form.schedule_mode === "custom" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            }`}>
              <svg className="size-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                <path fillRule="evenodd" clipRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75A3.75 3.75 0 0122.5 8.25v10.5A3.75 3.75 0 0118.75 22.5H5.25A3.75 3.75 0 011.5 18.75V8.25A3.75 3.75 0 015.25 4.5H6V3a.75.75 0 01.75-.75zm14.25 7.5H3v9a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 19.5v-9z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Beda Jam Tiap Hari (Kustom)</p>
              <p className="text-xs text-muted-foreground mt-0.5">Atur jam masuk & jam pulang berbeda untuk tiap hari (misal: Jumat beda jam).</p>
            </div>
          </button>
        </div>
      </div>

      {/* ── MODE 1: SEMUA HARI SAMA ── */}
      {form.schedule_mode === "same" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div>
            <h3 className="font-semibold text-sm mb-3 text-foreground">Jam Kerja Seragam</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Jam Masuk Kerja">
                <input
                  type="time"
                  className="field-input font-bold"
                  value={form.start_time}
                  onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value, late_threshold: e.target.value }))}
                />
              </Field>
              <Field label="Jam Pulang Kerja">
                <input
                  type="time"
                  className="field-input font-bold"
                  value={form.check_out_time}
                  onChange={(e) => setForm((f) => ({ ...f, check_out_time: e.target.value }))}
                />
              </Field>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="font-semibold text-sm mb-3 text-foreground">Hari Kerja Aktif</h3>
            <div className="flex flex-wrap gap-2">
              {ALL_DAYS.map((day) => {
                const active = form.work_days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition-all border cursor-pointer ${
                      active
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground shadow-2xs"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── MODE 2: BEDA JAM TIAP HARI (KUSTOM) ── */}
      {form.schedule_mode === "custom" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 shadow-2xs text-xs">
            <div>
              <p className="font-bold text-sm text-amber-950 dark:text-amber-100 flex items-center gap-1.5">
                <svg className="size-4 fill-amber-700 dark:fill-amber-400" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm.75 4.5a.75.75 0 00-1.5 0v5.25c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5H12.75V6.75z" />
                </svg>
                Jadwal Jam Kerja Kustom Aktif
              </p>
              <p className="text-amber-900 dark:text-amber-200/90 font-medium mt-1">
                Tiap hari memiliki jam masuk dan jam pulang tersendiri.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={applyPresetWeekdayFriday}
                className="flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold px-3.5 py-2 cursor-pointer shadow-xs transition"
              >
                <svg className="size-3.5 fill-white" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" />
                </svg>
                <span>Set Senin–Kamis 08:30 & Jumat 10:00</span>
              </button>
              <button
                type="button"
                onClick={copyMondayToWeekdays}
                className="flex items-center gap-1.5 rounded-xl bg-card border border-amber-300/80 dark:border-border px-3.5 py-2 font-bold text-foreground hover:bg-muted active:scale-95 cursor-pointer shadow-2xs transition"
              >
                <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l2.25 2.25a.75.75 0 010 1.06l-2.25 2.25a.75.75 0 11-1.06-1.06l.97-.97H14.25a.75.75 0 010-1.5h4.94l-.97-.97a.75.75 0 010-1.06z" />
                </svg>
                <span>Salin Jam Senin ke Sel-Kam</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
            {ALL_DAYS.map((day) => {
              const sched = form.daily_schedules[day] || { active: false, start_time: "08:30", end_time: "17:00" };
              const isFriday = day === "Jumat";

              return (
                <div
                  key={day}
                  className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 transition-colors ${
                    sched.active ? "bg-card" : "bg-muted/20 opacity-70"
                  }`}
                >
                  {/* Status & Nama Hari */}
                  <div className="flex items-center gap-3 min-w-44">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={sched.active}
                        onChange={(e) => updateDaySchedule(day, { active: e.target.checked })}
                        className="peer sr-only"
                      />
                      <div className="h-6 w-11 rounded-full bg-muted-foreground/30 after:absolute after:left-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-border after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
                    </label>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{day}</span>
                        {isFriday && (
                          <span className="text-[10px] font-extrabold bg-primary/20 text-primary px-2 py-0.5 rounded-md">
                            Khusus
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {sched.active ? "Hari Kerja Aktif" : "Libur"}
                      </p>
                    </div>
                  </div>

                  {/* Jam Masuk & Jam Pulang */}
                  {sched.active ? (
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                          Jam Masuk:
                        </span>
                        <input
                          type="time"
                          value={sched.start_time}
                          onChange={(e) => updateDaySchedule(day, { start_time: e.target.value })}
                          className="field-input w-28 text-center text-xs font-bold py-1.5"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                          Jam Pulang:
                        </span>
                        <input
                          type="time"
                          value={sched.end_time}
                          onChange={(e) => updateDaySchedule(day, { end_time: e.target.value })}
                          className="field-input w-28 text-center text-xs font-bold py-1.5"
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs italic text-muted-foreground">
                      Karyawan tidak diwajibkan absensi pada hari ini
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── ATURAN KETERLAMBATAN & BATAS AKHIR CHECK-IN (DI ATAS LOKASI & RADIUS) ── */}
      <div className="pt-5 border-t border-border space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-primary" />
            <h3 className="font-bold text-sm text-foreground">
              Aturan Keterlambatan &amp; Batas Check-in
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 ml-4">
            Aturan kelonggaran telat dan batas akhir check-in (berlaku untuk semua mode jam kerja).
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* 1. Toleransi Keterlambatan */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3 flex flex-col justify-between">
            <div>
              <label className="text-xs font-bold text-foreground block">
                Toleransi Keterlambatan
              </label>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Kelonggaran waktu setelah jam masuk sebelum kehadiran dihitung terlambat.
              </p>

              <div className="mt-3">
                {!customTolerance && TOLERANCE_PRESETS.includes(Number(form.late_tolerance_minutes)) ? (
                  <select
                    className="field-input font-bold text-xs py-2 w-full cursor-pointer"
                    value={form.late_tolerance_minutes}
                    onChange={(e) => {
                      if (e.target.value === "custom") {
                        setCustomTolerance(true);
                      } else {
                        setForm((f) => ({ ...f, late_tolerance_minutes: e.target.value }));
                      }
                    }}
                  >
                    {TOLERANCE_PRESETS.map((m) => (
                      <option key={m} value={String(m)}>
                        {formatMinuteOption(m)}
                      </option>
                    ))}
                    <option value="custom">✏️ Kustom / Isi Menit Sendiri...</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="720"
                      className="field-input font-bold text-xs py-1.5 w-24 text-center"
                      placeholder="Menit"
                      value={form.late_tolerance_minutes}
                      onChange={(e) => setForm((f) => ({ ...f, late_tolerance_minutes: e.target.value }))}
                      autoFocus
                    />
                    <span className="text-xs font-semibold text-muted-foreground">Menit</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomTolerance(false);
                        if (!TOLERANCE_PRESETS.includes(Number(form.late_tolerance_minutes))) {
                          setForm((f) => ({ ...f, late_tolerance_minutes: "15" }));
                        }
                      }}
                      className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 px-3.5 py-1.5 text-xs font-bold shadow-xs transition cursor-pointer shrink-0 ml-auto"
                    >
                      Pilih
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Helper Info */}
            <div className="rounded-xl bg-muted/40 border border-border/80 px-3 py-2 text-[11px] text-muted-foreground flex items-center gap-2">
              <svg className="size-4 shrink-0 text-primary fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.464-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" />
              </svg>
              <span>
                {Number(form.late_tolerance_minutes) === 0 ? (
                  <span>Check-in lewat dari jam masuk langsung dihitung <strong>Terlambat</strong>.</span>
                ) : (
                  <span>
                    Check-in hingga <strong>+{form.late_tolerance_minutes} menit</strong> tetap <strong>Tepat Waktu</strong>. Di atas itu dihitung <strong>Terlambat</strong>.
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* 2. Batas Akhir Check-in */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3 flex flex-col justify-between">
            <div>
              <label className="text-xs font-bold text-foreground block">
                Batas Akhir Check-in
              </label>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Batas waktu toleransi maksimal sebelum sistem menolak absen masuk.
              </p>

              <div className="mt-3">
                {!customCutoff && (form.check_in_cutoff_mode === "none" || CUTOFF_PRESETS.includes(Number(form.check_in_cutoff_minutes))) ? (
                  <select
                    className="field-input font-bold text-xs py-2 w-full cursor-pointer"
                    value={form.check_in_cutoff_mode === "none" || Number(form.check_in_cutoff_minutes) === 0 ? "none" : form.check_in_cutoff_minutes}
                    onChange={(e) => {
                      if (e.target.value === "custom") {
                        setCustomCutoff(true);
                        setForm((f) => ({ ...f, check_in_cutoff_mode: "duration" }));
                      } else if (e.target.value === "none" || e.target.value === "0") {
                        setForm((f) => ({ ...f, check_in_cutoff_mode: "none", check_in_cutoff_minutes: "0" }));
                      } else {
                        setForm((f) => ({
                          ...f,
                          check_in_cutoff_mode: "duration",
                          check_in_cutoff_minutes: e.target.value,
                        }));
                      }
                    }}
                  >
                    <option value="none">0 / Tanpa Batas Akhir (Bebas Kapan Saja)</option>
                    {CUTOFF_PRESETS.map((m) => (
                      <option key={m} value={String(m)}>
                        {formatMinuteOption(m)}
                      </option>
                    ))}
                    <option value="custom">✏️ Kustom / Isi Menit Sendiri...</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="720"
                      className="field-input font-bold text-xs py-1.5 w-24 text-center"
                      placeholder="Menit"
                      value={form.check_in_cutoff_minutes}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm((f) => ({
                          ...f,
                          check_in_cutoff_minutes: val,
                          check_in_cutoff_mode: Number(val) > 0 ? "duration" : "none",
                        }));
                      }}
                      autoFocus
                    />
                    <span className="text-xs font-semibold text-muted-foreground">Menit</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomCutoff(false);
                        if (!CUTOFF_PRESETS.includes(Number(form.check_in_cutoff_minutes)) && Number(form.check_in_cutoff_minutes) !== 0) {
                          setForm((f) => ({ ...f, check_in_cutoff_minutes: "60", check_in_cutoff_mode: "duration" }));
                        }
                      }}
                      className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 px-3.5 py-1.5 text-xs font-bold shadow-xs transition cursor-pointer shrink-0 ml-auto"
                    >
                      Pilih
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Helper info */}
            <div className="rounded-xl bg-muted/40 border border-border/80 px-3 py-2 text-[11px] text-muted-foreground flex items-center gap-2">
              <svg className="size-4 shrink-0 text-primary fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" />
              </svg>
              <span>
                {form.check_in_cutoff_mode === "none" || Number(form.check_in_cutoff_minutes) === 0 ? (
                  <span>Check-in <strong>bisa dilakukan kapan saja</strong> sepanjang hari kerja (tanpa batas penutupan).</span>
                ) : (
                  <span>
                    Check-in ditutup setelah <strong>{form.check_in_cutoff_minutes} menit</strong> ({Number(form.check_in_cutoff_minutes) >= 60 ? `${Number(form.check_in_cutoff_minutes) / 60} jam` : `${form.check_in_cutoff_minutes} menit`}) dari jam masuk.
                  </span>
                )}
              </span>
            </div>
          </div>
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

      <SaveButton onClick={handleSave} saving={saving} />
    </div>
  );
}

/* ── Tab Notifikasi ── */
function TabNotifikasi({ onSave }: { onSave: () => void }) {
  const { request } = useAuth();
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const cached = typeof window !== "undefined" ? localStorage.getItem("bee_settings_notif") : null;
    if (cached) {
      try {
        setNotifs((prev) => ({ ...prev, ...JSON.parse(cached) }));
      } catch {}
    }

    request<Record<string, any>>("/admin/settings")
      .then((res) => {
        if (res && res.notifs_config) {
          try {
            const parsed = typeof res.notifs_config === "string" ? JSON.parse(res.notifs_config) : res.notifs_config;
            setNotifs((prev) => ({ ...prev, ...parsed }));
          } catch {}
        }
      })
      .catch(() => {});
  }, [request]);

  const toggle = (key: keyof typeof notifs) =>
    setNotifs((n) => ({ ...n, [key]: !n[key] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem("bee_settings_notif", JSON.stringify(notifs));
      await request("/admin/settings", {
        method: "POST",
        body: JSON.stringify({ notifs_config: JSON.stringify(notifs) }),
      });
    } catch (err) {
      console.warn("Save notifs error:", err);
    } finally {
      setSaving(false);
      onSave();
    }
  };

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

      <SaveButton onClick={handleSave} saving={saving} />
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

      {/* Avatar Card */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/40 border border-border">
        <div className="flex size-14 items-center justify-center rounded-2xl text-lg font-black text-primary-foreground shadow-xs bg-primary">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-base text-foreground">{profile.full_name || "Administrator"}</p>
          <p className="text-xs text-muted-foreground">{profile.email}</p>
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
            <svg className="size-3 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z"/>
            </svg>
            Administrator
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
      <div>
        <button
          onClick={handleSaveProfile}
          className="rounded-xl px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-95 bg-primary shadow-xs"
        >
          Simpan Profil
        </button>
      </div>

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
          className="mt-4 rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:opacity-90 active:scale-95 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/25 hover:bg-red-600 hover:text-white"
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
      <label className="block text-xs font-bold text-foreground">{label}</label>
      {children}
    </div>
  );
}

function SaveButton({ onClick, saving = false }: { onClick: () => void; saving?: boolean }) {
  return (
    <div className="flex justify-end pt-5 border-t border-border">
      <button
        onClick={onClick}
        disabled={saving}
        className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 bg-primary cursor-pointer"
      >
        {saving ? (
          <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z" />
            <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
          </svg>
        )}
        <span>{saving ? "Menyimpan…" : "Simpan Pengaturan"}</span>
      </button>
    </div>
  );
}

function NotifGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold mb-2 uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="rounded-2xl overflow-hidden border border-border bg-card">
        {children}
      </div>
    </div>
  );
}

function NotifRow({ label, desc, checked, onChange }: {
  label: string; desc: string; checked: boolean; onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 transition-colors border-b border-border last:border-b-0 hover:bg-muted/30">
      <div className="flex-1 min-w-0 mr-4">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs mt-0.5 text-muted-foreground">{desc}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? "bg-primary" : "bg-zinc-300 dark:bg-zinc-700"
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
