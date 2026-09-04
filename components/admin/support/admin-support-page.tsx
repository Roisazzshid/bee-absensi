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
    a: "Buka menu Laporan di sidebar. Pilih rentang tanggal dan departemen yang diinginkan, lalu klik tombol 'Export Excel' atau 'Export PDF'.",
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
  open: { label: "Terbuka", bg: "rgba(245,197,24,0.1)", color: "#f5c518", border: "rgba(245,197,24,0.2)" },
  in_progress: { label: "Diproses", bg: "rgba(37,99,235,0.1)", color: "#3b82f6", border: "rgba(37,99,235,0.2)" },
  resolved: { label: "Selesai", bg: "rgba(34,197,94,0.1)", color: "#22c55e", border: "rgba(34,197,94,0.2)" },
};

const MOCK_TICKETS = [
  { id: "TKT-001", subject: "Karyawan tidak bisa check-in", category: "bug", status: "resolved" as const, date: "25 Okt 2023" },
  { id: "TKT-002", subject: "Request fitur export PDF", category: "fitur", status: "in_progress" as const, date: "24 Okt 2023" },
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
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#ffffff" }}>Pusat Bantuan</h1>
        <p className="text-sm mt-1" style={{ color: "#a1a1aa" }}>Temukan jawaban, kirim tiket, atau hubungi tim kami</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Tiket Aktif", value: "2", icon: "📋", bg: "#000000", color: "#60a5fa" },
          { label: "Rata-rata Respons", value: "< 2 jam", icon: "⚡", bg: "#000000", color: "#4ade80" },
          { label: "Uptime Sistem", value: "99.9%", icon: "🟢", bg: "#000000", color: "#facc15" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: s.bg, border: `1px solid #27272a` }}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-semibold" style={{ color: s.color, opacity: 0.8 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Section nav */}
      <div className="flex gap-2 p-1 rounded-2xl" style={{ background: "#1a1a1a" }}>
        {[
          { id: "faq", label: "FAQ", icon: "❓" },
          { id: "tiket", label: "Buat Tiket", icon: "📩" },
          { id: "kontak", label: "Kontak", icon: "📞" },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id as any)}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all"
            style={{
              background: activeSection === s.id ? "#000000" : "transparent",
              color: activeSection === s.id ? "#ffffff" : "#64748b",
              boxShadow: activeSection === s.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}
          >
            <span>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* ── FAQ ── */}
      {activeSection === "faq" && (
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4" fill="none" stroke="#94a3b8" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Cari pertanyaan..."
              className="field-input pl-10"
              value={searchFaq}
              onChange={(e) => setSearchFaq(e.target.value)}
            />
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="text-center py-10" style={{ color: "#a1a1aa" }}>
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-sm font-semibold">Tidak ada hasil untuk &quot;{searchFaq}&quot;</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFaqs.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden transition-all"
                  style={{ border: "1px solid #27272a", background: "transparent" }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left"
                  >
                    <span className="font-semibold text-sm pr-4" style={{ color: "#ffffff" }}>{faq.q}</span>
                    <svg
                      className="size-4 shrink-0 transition-transform duration-200"
                      style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)", color: "#a1a1aa" }}
                      fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4" style={{ borderTop: "1px solid #f1f5f9" }}>
                      <p className="text-sm leading-relaxed pt-3" style={{ color: "#64748b" }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Buat Tiket ── */}
      {activeSection === "tiket" && (
        <div className="space-y-4">
          {ticketSent && (
            <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" }}>
              <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tiket berhasil dikirim! Tim kami akan merespons dalam 2 jam kerja.
            </div>
          )}

          {/* Riwayat tiket */}
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #27272a" }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: "#27272a", borderBottom: "1px solid #27272a" }}>
              <p className="text-sm font-bold" style={{ color: "#ffffff" }}>Riwayat Tiket</p>
              <span className="text-xs" style={{ color: "#a1a1aa" }}>{MOCK_TICKETS.length} tiket</span>
            </div>
            {MOCK_TICKETS.map((t) => {
              const badge = STATUS_BADGES[t.status];
              return (
                <div key={t.id} className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50"
                  style={{ borderBottom: "1px solid #f8fafc" }}>
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-mono font-bold mt-0.5" style={{ color: "#a1a1aa" }}>{t.id}</span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#ffffff" }}>{t.subject}</p>
                      <p className="text-xs" style={{ color: "#a1a1aa" }}>{t.date}</p>
                    </div>
                  </div>
                  <span className="rounded-full px-2.5 py-1 text-[10px] font-bold"
                    style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Form tiket baru */}
          <div className="rounded-2xl p-5" style={{ background: "transparent", border: "1px solid #27272a" }}>
            <h3 className="font-bold text-base mb-4" style={{ color: "#ffffff" }}>Tiket Baru</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold" style={{ color: "#e4e4e7" }}>Subjek</label>
                <input
                  className="field-input"
                  placeholder="Deskripsikan masalah secara singkat..."
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm((f) => ({ ...f, subject: e.target.value }))}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold" style={{ color: "#e4e4e7" }}>Kategori</label>
                  <select className="field-input" value={ticketForm.category}
                    onChange={(e) => setTicketForm((f) => ({ ...f, category: e.target.value as Category }))}>
                    <option value="umum">Umum</option>
                    <option value="bug">Bug / Error</option>
                    <option value="fitur">Permintaan Fitur</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold" style={{ color: "#e4e4e7" }}>Prioritas</label>
                  <select className="field-input" value={ticketForm.priority}
                    onChange={(e) => setTicketForm((f) => ({ ...f, priority: e.target.value }))}>
                    <option value="low">Rendah</option>
                    <option value="normal">Normal</option>
                    <option value="high">Tinggi</option>
                    <option value="critical">Kritis</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold" style={{ color: "#e4e4e7" }}>Deskripsi Detail</label>
                <textarea
                  className="field-input h-32 resize-none py-2.5"
                  placeholder="Jelaskan masalah atau permintaan Anda secara detail. Sertakan langkah-langkah untuk mereproduksi masalah jika ada..."
                  value={ticketForm.message}
                  onChange={(e) => setTicketForm((f) => ({ ...f, message: e.target.value }))}
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSendTicket}
                  disabled={!ticketForm.subject.trim() || !ticketForm.message.trim()}
                  className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "#d97706" }}
                >
                  <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
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
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: "📧",
              title: "Email Support",
              desc: "Kirim email untuk pertanyaan non-urgent",
              value: "support@bee-absensi.id",
              action: "Kirim Email",
              href: "mailto:support@bee-absensi.id",
              bg: "rgba(37,99,235,0.1)",
              color: "#3b82f6",
            },
            {
              icon: "💬",
              title: "Live Chat",
              desc: "Chat langsung dengan tim support kami",
              value: "Senin–Jumat, 08.00–17.00 WIB",
              action: "Mulai Chat",
              href: "#",
              bg: "rgba(34,197,94,0.1)",
              color: "#22c55e",
            },
            {
              icon: "📱",
              title: "WhatsApp",
              desc: "Hubungi kami via WhatsApp Business",
              value: "+62 812-3456-7890",
              action: "Chat WhatsApp",
              href: "https://wa.me/6281234567890",
              bg: "rgba(245,197,24,0.1)",
              color: "#f5c518",
            },
            {
              icon: "📚",
              title: "Dokumentasi",
              desc: "Panduan lengkap penggunaan aplikasi",
              value: "docs.bee-absensi.id",
              action: "Buka Dokumentasi",
              href: "#",
              bg: "rgba(168,85,247,0.1)",
              color: "#a855f7",
            },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "transparent", border: "1px solid #27272a" }}>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl text-xl" style={{ background: c.bg }}>
                  {c.icon}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: "#ffffff" }}>{c.title}</p>
                  <p className="text-xs" style={{ color: "#a1a1aa" }}>{c.desc}</p>
                </div>
              </div>
              <p className="text-sm font-semibold" style={{ color: "#e4e4e7" }}>{c.value}</p>
              <a
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-bold transition-all hover:opacity-90"
                style={{ background: c.bg, color: c.color }}
              >
                {c.action}
                <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
            </div>
          ))}

          {/* SLA info */}
          <div className="sm:col-span-2 rounded-2xl p-5" style={{ background: "#27272a", border: "1px solid #27272a" }}>
            <h3 className="font-bold text-sm mb-3" style={{ color: "#ffffff" }}>⏱ Waktu Respons</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { level: "Kritis", time: "< 1 jam", color: "#f87171", bg: "rgba(239,68,68,0.1)" },
                { level: "Tinggi", time: "< 4 jam", color: "#fb923c", bg: "rgba(249,115,22,0.1)" },
                { level: "Normal", time: "< 1 hari", color: "#60a5fa", bg: "rgba(59,130,246,0.1)" },
                { level: "Rendah", time: "< 3 hari", color: "#a1a1aa", bg: "rgba(161,161,170,0.1)" },
              ].map((s) => (
                <div key={s.level} className="rounded-xl px-3 py-2.5 text-center" style={{ background: s.bg }}>
                  <p className="text-xs font-bold" style={{ color: s.color }}>{s.level}</p>
                  <p className="text-sm font-black mt-0.5" style={{ color: s.color }}>{s.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
