'use client';

import React from 'react';
import {
  X,
  ShieldAlert,
  IdCard,
  MapPin,
  Phone,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface SOPModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SOPModal({ isOpen, onClose }: SOPModalProps) {
  if (!isOpen) return null;

  const sopRules = [
    {
      icon: IdCard,
      title: 'Wajib Membawa Kartu Identitas Fisik (KTM / KTP)',
      description:
        'Setiap peminjam wajib membawa dan menunjukkan kartu identitas resmi yang masih berlaku (Kartu Tanda Mahasiswa atau KTP) sebelum barang diserahkan.',
      badge: 'Syarat Utama',
    },
    {
      icon: MapPin,
      title: 'Wajib Mencatat Alamat Domisili Lengkap',
      description:
        'Peminjam wajib mengisi alamat tempat tinggal/domisili yang jelas (nama jalan, nomor rumah, kelurahan, atau blok asrama) guna penelusuran barang jika terjadi kendala.',
      badge: 'Data Wajib',
    },
    {
      icon: Phone,
      title: 'Wajib Mencantumkan Kontak WhatsApp Aktif',
      description:
        'Nomor telepon/WhatsApp yang dicantumkan harus selalu aktif untuk mempermudah konfirmasi jadwal, peringatan tenggat waktu, atau tindak lanjut teknis.',
      badge: 'Komunikasi Cepat',
    },
    {
      icon: Clock,
      title: 'Batas Waktu Peminjaman & Pengembalian',
      description:
        'Maksimal durasi peminjaman adalah 3–7 hari kalender. Perpanjangan masa pinjam harus dikonfirmasi langsung kepada petugas laboratorium sebelum melewati jatuh tempo.',
      badge: 'Ketepatan Waktu',
    },
    {
      icon: AlertTriangle,
      title: 'Tanggung Jawab Kondisi Fisik & Ganti Rugi',
      description:
        'Peminjam dan petugas wajib memeriksa kondisi barang saat penyerahan. Kerusakan, kehilangan komponen, atau cacat akibat kelalaian pemakaian menjadi tanggung jawab penuh peminjam.',
      badge: 'Tanggung Jawab',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#2E3B40]/60 backdrop-blur-xs p-3 sm:p-4 flex items-center justify-center animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#F4F5F1] rounded-[16px] shadow-2xl border border-[#D9DFDA] w-full max-w-xl my-auto overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-[#E2E9E3] border-b border-[#D9DFDA] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#DCE8E2] text-[#34495E] flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-[#548C75]" />
            </div>
            <div>
              <h3 className="font-bold text-[#2E3B40] text-base leading-snug flex items-center gap-2">
                <span>SOP Laboratorium SIMLAB</span>
                <span className="text-[10px] font-semibold bg-[#E1EDE4] text-[#548C75] px-2 py-0.5 rounded-full border border-[#548C75]/20">
                  Resmi
                </span>
              </h3>
              <p className="text-xs text-[#69777A]">
                Standar Operasional Prosedur sirkulasi & peminjaman inventaris
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[8px] text-[#69777A] hover:text-[#2E3B40] hover:bg-[#DCE8E2] transition-colors"
            aria-label="Tutup SOP"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-3.5">
          {/* Highlight Box */}
          <div className="p-3.5 bg-[#E1EDE4] border border-[#548C75]/30 rounded-[12px] text-xs text-[#2E3B40] flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#548C75] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Aturan Utama Peminjaman:</strong> Seluruh peminjam wajib membawa kartu identitas resmi serta mencatat alamat domisili dan nomor kontak aktif yang dapat dihubungi demi keamanan dan keteraturan inventaris laboratorium.
            </div>
          </div>

          {/* List of Rules */}
          <div className="space-y-3 pt-1">
            {sopRules.map((rule, idx) => {
              const Icon = rule.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 bg-[#ECEFEA] rounded-[12px] border border-[#D9DFDA] hover:border-[#34495E]/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-[6px] bg-[#DCE8E2] text-[#34495E]">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="font-semibold text-xs text-[#2E3B40]">
                        {idx + 1}. {rule.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-medium bg-[#E2E9E3] text-[#69777A] px-2 py-0.5 rounded-[4px] border border-[#D9DFDA] shrink-0">
                      {rule.badge}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#69777A] pl-8 leading-relaxed">
                    {rule.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3.5 bg-[#E2E9E3] border-t border-[#D9DFDA] flex items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-[#69777A]">
            Ditetapkan oleh Pengelola Laboratorium Komputasi SIMLAB.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#F4F5F1] bg-[#34495E] hover:bg-[#293B4D] rounded-[10px] transition-colors shadow-sm ml-auto"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}
