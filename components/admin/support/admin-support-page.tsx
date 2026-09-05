"use client";

import { useState } from "react";

type Category = "umum" | "bug" | "fitur" | "lainnya";
type FaqItem = { q: string; a: string };

const FAQS: FaqItem[] = [
  {
    q: "Bagaimana cara menambah karyawan baru?",
    a: "Buka menu Karyawan di sidebar, lalu klik tombol '+ Tambah Karyawan'. Isi data lengkap karyawan termasuk email, NIP, departemen, dan posisi.",
  },
  {
    q: "Kenapa karyawan tidak bisa check-in?",
    a: "Pastikan jam check-in masih dalam rentang waktu yang dikonfigurasi di Pengaturan > Absensi. Periksa juga apakah radius lokasi sudah sesuai dengan posisi karyawan.",
  },
  {
    q: "Bagaimana cara mengekspor data absensi?",
    a: "Buka menu Laporan di sidebar. Pilih rentang tanggal dan departemen yang diinginkan, lalu klik tombol 'Export Spreadsheet'.",
  },
  {
    q: "Bagaimana cara menyetujui pengajuan izin karyawan?",
    a: "Buka menu Pengajuan Izin, klik pada pengajuan yang ingin diproses. Pilih 'Setujui' atau 'Tolak' dan berikan catatan jika diperlukan.",
  },
  {
    q: "Apakah data absensi bisa diedit secara manual?",
    a: "Ya, admin dapat mengedit data absensi melalui menu Absensi. Klik pada entri yang ingin diubah dan pilih 'Edit'. Setiap perubahan akan dicatat di log sistem.",
  },
  {
    q: "Bagaimana cara mengatur notifikasi email?",
    a: "Buka Pengaturan > Notifikasi. Di sana Anda dapat mengaktifkan/menonaktifkan berbagai jenis notifikasi email seperti laporan otomatis dan alert keterlambatan.",
  },
];

const STATUS_BADGES = {
  open: { label: "Terbuka", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30" },
  in_progress: { label: "Diproses", cls: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30" },
  resolved: { label: "Selesai", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" },
};

const MOCK_TICKETS = [
  { id: "TKT-001", subject: "Karyawan tidak bisa check-in", category: "bug", status: "resolved" as const, date: "25 Okt 2023" },
  { id: "TKT-002", subject: "Request fitur export spreadsheet", category: "fitur", status: "in_progress" as const, date: "24 Okt 2023" },
  { id: "TKT-003", subject: "Tampilan absensi tidak muncul", category: "bug", status: "open" as const, date: "23 Okt 2023" },
];

export function AdminSupportPage() {
  const [activeSection, setActiveSection] = useState<"faq" | "tiket" | "kontak">("faq");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    category: "umum" as Category,
    message: "",
    priority: "normal",
  });
  const [ticketSent, setTicketSent] = useState(false);
  const [searchFaq, setSearchFaq] = useState("");

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(searchFaq.toLowerCase()) ||
      f.a.toLowerCase().includes(searchFaq.toLowerCase())
  );

  const handleSendTicket = () => {
    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) return;
    setTicketSent(true);
    setTicketForm({ subject: "", category: "umum", message: "", priority: "normal" });
    setTimeout(() => setTicketSent(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground md:text-2xl">Pusat Bantuan</h1>
        <p className="text-sm mt-1 text-muted-foreground">Temukan jawaban pertanyaan umum, buat tiket laporan, atau hubungi tim kami.</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {[
          {
            label: "Tiket Aktif",
            value: "2",
            icon: (
              <svg className="size-5 fill-current text-blue-600 dark:text-blue-400" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 2.071-1.679 3.75-3.75 3.75H5.625a3.75 3.75 0 01-3.75-3.75V5.25c0-2.071 1.679-3.75 3.75-3.75zm8.25 1.625v3.375c0 .207.168.375.375.375h3.375l-3.75-3.75zM7.5 12a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 12zm0 3.75a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zm0 3.75a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75z"/>
              </svg>
            ),
            bg: "bg-blue-500/10 dark:bg-blue-500/20",
          },
          {
            label: "Rata-rata Respons",
            value: "< 2 jam",
            icon: (
              <svg className="size-5 fill-current text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z"/>
              </svg>
            ),
            bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
          },
          {
            label: "Uptime Sistem",
            value: "99.9%",
            icon: (
              <svg className="size-5 fill-current text-amber-600 dark:text-amber-400" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"/>
              </svg>
            ),
            bg: "bg-amber-500/10 dark:bg-amber-500/20",
          },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4 md:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{s.label}</span>
              <div className={`flex size-9 items-center justify-center rounded-xl ${s.bg}`}>
                {s.icon}
              </div>
            </div>
            <p className="mt-3 text-xl md:text-2xl font-black text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Section nav */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-card border border-border shadow-xs">
        {[
          {
            id: "faq",
            label: "FAQ",
            icon: (
              <svg className="size-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.076-.656-.582-1.15-1.24-1.183a3.46 3.46 0 00-2.458.875.75.75 0 00.998 1.12c.38-.34.88-.517 1.393-.49.317.016.544.238.577.514.041.341-.122.646-.37.896l-.99 1c-.512.518-.768 1.074-.768 1.685v.25a.75.75 0 001.5 0v-.25c0-.285.109-.545.394-.834l.99-1c.548-.553.948-1.306.874-2.183zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z"/>
              </svg>
            ),
          },
          {
            id: "tiket",
            label: "Buat Tiket",
            icon: (
              <svg className="size-4 fill-current" viewBox="0 0 24 24">
                <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z"/>
                <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z"/>
              </svg>
            ),
          },
          {
            id: "kontak",
            label: "Kontak",
            icon: (
              <svg className="size-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.251.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"/>
              </svg>
            ),
          },
        ].map((s) => {
          const active = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all cursor-pointer ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm shadow-amber-500/10"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── FAQ ── */}
      {activeSection === "faq" && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"/>
            </svg>
            <input
              type="text"
              placeholder="Cari pertanyaan bantuan..."
              className="field-input pl-10"
              value={searchFaq}
              onChange={(e) => setSearchFaq(e.target.value)}
            />
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <div className="flex justify-center mb-2">
                <svg className="size-8 text-muted-foreground/50 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"/>
                </svg>
              </div>
              <p className="text-sm font-semibold text-muted-foreground">Tidak ada hasil untuk &quot;{searchFaq}&quot;</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredFaqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={i}
                    className="rounded-2xl border border-border bg-card overflow-hidden transition-all shadow-xs"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-muted/40 cursor-pointer"
                    >
                      <span className="font-semibold text-sm pr-4 text-foreground">{faq.q}</span>
                      <svg
                        className={`size-4 shrink-0 transition-transform duration-200 text-muted-foreground ${isOpen ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 pt-2 border-t border-border/60 bg-muted/20">
                        <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Buat Tiket ── */}
      {activeSection === "tiket" && (
        <div className="space-y-5">
          {ticketSent && (
            <div className="flex items-center gap-3 rounded-2xl p-4 text-sm font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 shadow-xs">
              <svg className="size-5 shrink-0 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"/>
              </svg>
              <span>Tiket berhasil dikirim! Tim support kami akan merespons dalam 2 jam kerja.</span>
            </div>
          )}

          {/* Riwayat tiket */}
          <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="px-5 py-4 flex items-center justify-between bg-muted/40 border-b border-border">
              <p className="text-sm font-bold text-foreground">Riwayat Tiket</p>
              <span className="text-xs font-semibold text-muted-foreground">{MOCK_TICKETS.length} tiket</span>
            </div>
            <div className="divide-y divide-border">
              {MOCK_TICKETS.map((t) => {
                const badge = STATUS_BADGES[t.status];
                return (
                  <div key={t.id} className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-muted/30">
                    <div className="flex items-start gap-3.5">
                      <span className="text-xs font-mono font-bold mt-0.5 text-primary">{t.id}</span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t.subject}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.date}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold border ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form tiket baru */}
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
            <h3 className="font-bold text-base mb-4 text-foreground">Buat Tiket Baru</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground">Subjek</label>
                <input
                  className="field-input"
                  placeholder="Deskripsikan masalah secara singkat..."
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm((f) => ({ ...f, subject: e.target.value }))}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground">Kategori</label>
                  <select
                    className="field-input"
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm((f) => ({ ...f, category: e.target.value as Category }))}
                  >
                    <option value="umum">Umum</option>
                    <option value="bug">Bug / Error</option>
                    <option value="fitur">Permintaan Fitur</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground">Prioritas</label>
                  <select
                    className="field-input"
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm((f) => ({ ...f, priority: e.target.value }))}
                  >
                    <option value="low">Rendah</option>
                    <option value="normal">Normal</option>
                    <option value="high">Tinggi</option>
                    <option value="critical">Kritis</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground">Deskripsi Detail</label>
                <textarea
                  className="field-input h-32 resize-none py-2.5"
                  placeholder="Jelaskan masalah atau permintaan secara detail..."
                  value={ticketForm.message}
                  onChange={(e) => setTicketForm((f) => ({ ...f, message: e.target.value }))}
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSendTicket}
                  disabled={!ticketForm.subject.trim() || !ticketForm.message.trim()}
                  className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-primary cursor-pointer"
                >
                  <svg className="size-4 fill-current" viewBox="0 0 24 24">
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"/>
                  </svg>
                  Kirim Tiket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Kontak ── */}
      {activeSection === "kontak" && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: (
                  <svg className="size-5 fill-current text-blue-600 dark:text-blue-400" viewBox="0 0 24 24">
                    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z"/>
                    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z"/>
                  </svg>
                ),
                title: "Email Support",
                desc: "Kirim email untuk pertanyaan atau kendala",
                value: "support@bee-absensi.id",
                action: "Kirim Email",
                href: "mailto:support@bee-absensi.id",
                bg: "bg-blue-500/10 dark:bg-blue-500/20",
                btnBg: "bg-blue-600 hover:bg-blue-700 text-white",
              },
              {
                icon: (
                  <svg className="size-5 fill-current text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.177 7.152.521 1.944.286 3.348 1.986 3.348 3.953v6.75a3.75 3.75 0 01-3.75 3.75H14.4l-4.5 4.5a.75.75 0 01-1.275-.53V17.25h-.375A3.75 3.75 0 014.5 13.5V6.724c0-1.967 1.404-3.667 3.348-3.953z"/>
                  </svg>
                ),
                title: "Live Chat",
                desc: "Chat langsung dengan tim support kami",
                value: "Senin–Jumat, 08.00–17.00 WIB",
                action: "Mulai Chat",
                href: "#",
                bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
                btnBg: "bg-emerald-600 hover:bg-emerald-700 text-white",
              },
              {
                icon: (
                  <svg className="size-5 fill-current text-amber-600 dark:text-amber-400" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.251.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"/>
                  </svg>
                ),
                title: "WhatsApp",
                desc: "Hubungi kami via WhatsApp Business",
                value: "+62 812-3456-7890",
                action: "Chat WhatsApp",
                href: "https://wa.me/6281234567890",
                bg: "bg-amber-500/10 dark:bg-amber-500/20",
                btnBg: "bg-amber-600 hover:bg-amber-700 text-white",
              },
              {
                icon: (
                  <svg className="size-5 fill-current text-purple-600 dark:text-purple-400" viewBox="0 0 24 24">
                    <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z"/>
                  </svg>
                ),
                title: "Dokumentasi",
                desc: "Panduan lengkap penggunaan aplikasi",
                value: "docs.bee-absensi.id",
                action: "Buka Dokumentasi",
                href: "#",
                bg: "bg-purple-500/10 dark:bg-purple-500/20",
                btnBg: "bg-purple-600 hover:bg-purple-700 text-white",
              },
            ].map((c) => (
              <div key={c.title} className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`flex size-11 items-center justify-center rounded-2xl ${c.bg} shrink-0`}>
                    {c.icon}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{c.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-foreground font-mono">{c.value}</p>
                <a
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all shadow-xs active:scale-95 ${c.btnBg}`}
                >
                  <span>{c.action}</span>
                  <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                  </svg>
                </a>
              </div>
            ))}
          </div>

          {/* SLA info */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-bold text-sm mb-4 text-foreground flex items-center gap-2">
              <svg className="size-4 text-primary fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"/>
              </svg>
              Standar Waktu Respons (SLA)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { level: "Kritis", time: "< 1 jam", cls: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" },
                { level: "Tinggi", time: "< 4 jam", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
                { level: "Normal", time: "< 1 hari", cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
                { level: "Rendah", time: "< 3 hari", cls: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20" },
              ].map((s) => (
                <div key={s.level} className={`rounded-2xl p-3.5 text-center border ${s.cls}`}>
                  <p className="text-xs font-bold uppercase tracking-wider">{s.level}</p>
                  <p className="text-base font-black mt-1">{s.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
