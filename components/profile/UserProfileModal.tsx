'use client';

import React from 'react';
import { User } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  X,
  User as UserIcon,
  ShieldCheck,
  UserCheck,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  CheckCircle2,
  Lock,
  LogOut,
  Key,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface UserProfileModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  isSelf?: boolean;
}

export default function UserProfileModal({
  isOpen,
  user,
  onClose,
  isSelf = false,
}: UserProfileModalProps) {
  const { logout } = useAuth();

  if (!isOpen || !user) return null;

  const isAdmin = user.role === 'ADMIN';

  // Role permissions checklist
  const permissions = isAdmin
    ? [
        { label: 'Akses Penuh Seluruh Modul & Pengaturan Lab', active: true },
        { label: 'Tambah, Ubah, & Hapus Inventaris Barang', active: true },
        { label: 'Kelola Akun Operator, Status, & Hapus Staff', active: true },
        { label: 'Proses Peminjaman & Inspeksi Pengembalian', active: true },
        { label: 'Export Rekapitulasi Laporan Transaksi CSV', active: true },
        { label: 'Akses Audit Log Rekam Jejak Keamanan', active: true },
      ]
    : [
        { label: 'Pencarian & Pemeriksaan Stok Katalog Barang', active: true },
        { label: 'Cetak Tag Identitas & QR Code Barang', active: true },
        { label: 'Pencatatan Peminjaman Perangkat Mahasiswa', active: true },
        { label: 'Pemeriksaan & Proses Pengembalian Barang', active: true },
        { label: 'Export Rekapitulasi Laporan Transaksi CSV', active: true },
        { label: 'Kelola Akun Staff & Hapus Data Master', active: false },
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2E3B40]/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#F4F5F1] rounded-[14px] shadow-xl border border-[#D9DFDA] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Cover Banner */}
        <div className="h-24 bg-gradient-to-r from-[#34495E] to-[#648F87] relative px-6 flex items-start justify-end pt-3 shrink-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-[8px] bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Body */}
        <div className="px-6 pb-6 pt-0 relative flex-1 overflow-y-auto space-y-5">
          {/* Avatar & Main Info (Overlapping Cover) */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 -mt-12">
            <div className="flex items-end gap-3.5">
              <img
                src={
                  user.avatar_url ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                }
                alt={user.full_name}
                className="w-20 h-20 rounded-full bg-[#E2E9E3] border-4 border-[#F4F5F1] shadow-md object-cover"
              />
              <div className="mb-1">
                <h3 className="font-bold text-lg text-[#2E3B40] flex items-center gap-2">
                  <span>{user.full_name}</span>
                  {isSelf && (
                    <span className="text-[10px] font-semibold bg-[#DCE8E2] text-[#34495E] px-2 py-0.5 rounded-full border border-[#D9DFDA]">
                      Akun Anda
                    </span>
                  )}
                </h3>
                <p className="font-mono text-xs text-[#69777A]">@{user.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mb-1 self-start sm:self-end">
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#DCE8E2] text-[#34495E] border border-[#D9DFDA]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  ADMINISTRATOR
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#ECEFEA] text-[#69777A] border border-[#D9DFDA]">
                  <UserCheck className="w-3.5 h-3.5" />
                  STAFF OPERASIONAL
                </span>
              )}
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  user.status === 'AKTIF'
                    ? 'bg-[#E1EDE4] text-[#548C75] border-[#548C75]/20'
                    : 'bg-[#F2E3E1] text-[#A95353] border-[#A95353]/20'
                }`}
              >
                {user.status}
              </span>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="bg-[#ECEFEA] p-4 rounded-[10px] border border-[#D9DFDA] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Briefcase className="w-4 h-4 text-[#69777A] shrink-0 mt-0.5" />
              <div>
                <p className="text-[#87918F] text-[11px]">Jabatan / Posisi</p>
                <p className="font-semibold text-[#2E3B40]">
                  {user.jabatan || (isAdmin ? 'Kepala Lab Komputasi' : 'Teknisi Operasional Lab')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-[#69777A] shrink-0 mt-0.5" />
              <div>
                <p className="text-[#87918F] text-[11px]">Email Resmi</p>
                <p className="font-semibold text-[#2E3B40] font-mono">
                  {user.email || `${user.username}@simlab.ac.id`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-[#69777A] shrink-0 mt-0.5" />
              <div>
                <p className="text-[#87918F] text-[11px]">Nomor Telepon / WhatsApp</p>
                <p className="font-semibold text-[#2E3B40] font-mono">
                  {user.phone || '0812-3456-7890'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-[#69777A] shrink-0 mt-0.5" />
              <div>
                <p className="text-[#87918F] text-[11px]">Terdaftar Sejak</p>
                <p className="font-semibold text-[#2E3B40]">
                  {formatDate(user.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Permissions & Security Summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#69777A] mb-2.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#34495E]" />
              <span>Hak Akses & Otorisasi Sistem (RBAC)</span>
            </h4>
            <div className="bg-[#ECEFEA] rounded-[10px] border border-[#D9DFDA] p-3 space-y-2">
              {permissions.map((p, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  {p.active ? (
                    <CheckCircle2 className="w-4 h-4 text-[#548C75] shrink-0" />
                  ) : (
                    <Lock className="w-4 h-4 text-[#87918F] shrink-0 opacity-60" />
                  )}
                  <span
                    className={
                      p.active
                        ? 'text-[#344047] font-medium'
                        : 'text-[#87918F] line-through'
                    }
                  >
                    {p.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-[#E2E9E3] border-t border-[#D9DFDA] flex items-center justify-between gap-3 shrink-0">
          {isSelf ? (
            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#A95353] hover:bg-[#F2E3E1] rounded-[8px] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar (Logout)</span>
            </button>
          ) : (
            <div className="text-[11px] text-[#69777A]">
              ID Pengguna: <span className="font-mono font-semibold">{user.id}</span>
            </div>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#F4F5F1] bg-[#34495E] hover:bg-[#293B4D] rounded-[10px] transition-colors shadow-sm ml-auto"
          >
            Tutup Profil
          </button>
        </div>
      </div>
    </div>
  );
}
