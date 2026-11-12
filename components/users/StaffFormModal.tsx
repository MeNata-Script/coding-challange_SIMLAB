'use client';

import React, { useState, useEffect } from 'react';
import { User, UserRole, UserStatus } from '@/types';
import { createUser, updateUser } from '@/lib/db';
import { useToast } from '@/context/ToastContext';
import { X, UserPlus, Save, AlertCircle, Mail, Phone, Briefcase } from 'lucide-react';

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialUser?: User | null;
}

export default function StaffFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialUser,
}: StaffFormModalProps) {
  const { success, error } = useToast();
  const isEditing = Boolean(initialUser);

  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    role: 'STAFF' as UserRole,
    status: 'AKTIF' as UserStatus,
    email: '',
    phone: '',
    jabatan: '',
  });

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (initialUser) {
      setFormData({
        username: initialUser.username,
        full_name: initialUser.full_name,
        role: initialUser.role,
        status: initialUser.status,
        email: initialUser.email || '',
        phone: initialUser.phone || '',
        jabatan: initialUser.jabatan || '',
      });
    } else {
      setFormData({
        username: '',
        full_name: '',
        role: 'STAFF',
        status: 'AKTIF',
        email: '',
        phone: '',
        jabatan: '',
      });
    }
    setFormError('');
  }, [initialUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.full_name.trim()) {
      setFormError('Nama lengkap staff wajib diisi!');
      return;
    }
    if (!formData.username.trim()) {
      setFormError('Username wajib diisi!');
      return;
    }

    try {
      setLoading(true);
      if (isEditing && initialUser) {
        await updateUser(initialUser.id, {
          full_name: formData.full_name.trim(),
          username: formData.username.trim().toLowerCase(),
          role: formData.role,
          status: formData.status,
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          jabatan: formData.jabatan.trim() || undefined,
        });
        success('Staff Diperbarui', `Data akun ${formData.username} berhasil diubah.`);
      } else {
        await createUser({
          full_name: formData.full_name.trim(),
          username: formData.username.trim().toLowerCase(),
          role: formData.role,
          status: formData.status,
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          jabatan: formData.jabatan.trim() || undefined,
        });
        success('Staff Ditambahkan', `Akun baru ${formData.username} berhasil dibuat.`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan data akun staff.');
      error('Gagal Simpan', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#2E3B40]/60 backdrop-blur-xs p-3 sm:p-4 flex items-center justify-center animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#F4F5F1] rounded-[14px] shadow-xl border border-[#D9DFDA] w-full max-w-lg my-auto overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#D9DFDA] flex items-center justify-between bg-[#E2E9E3] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[#DCE8E2] text-[#34495E] flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#2E3B40] text-base">
                {isEditing ? 'Ubah Akun Staff' : 'Tambah Staff Baru'}
              </h3>
              <p className="text-xs text-[#69777A]">
                {isEditing ? 'Perbarui akses dan informasi profil akun' : 'Buat akun staf operasional baru'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[10px] text-[#69777A] hover:text-[#2E3B40] hover:bg-[#DCE8E2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {formError && (
            <div className="p-3 bg-[#F2E3E1] border border-[#A95353]/30 rounded-[10px] flex items-center gap-2 text-[#A95353] text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#344047] mb-1">
                Nama Lengkap <span className="text-[#A95353]">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Rian Hidayat, S.Kom."
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#E9ECE7] border border-[#D9DFDA] rounded-[10px] text-[#344047] placeholder:text-[#87918F] focus:border-[#34495E] focus:outline-none focus:ring-1 focus:ring-[#34495E]"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#344047] mb-1">
                Username <span className="text-[#A95353]">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: rian_lab"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#E9ECE7] border border-[#D9DFDA] rounded-[10px] text-[#344047] placeholder:text-[#87918F] focus:border-[#34495E] focus:outline-none focus:ring-1 focus:ring-[#34495E] font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#344047] mb-1">
                Email Resmi Staff
              </label>
              <input
                type="email"
                placeholder="Contoh: rian@simlab.ac.id"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#E9ECE7] border border-[#D9DFDA] rounded-[10px] text-[#344047] placeholder:text-[#87918F] focus:border-[#34495E] focus:outline-none focus:ring-1 focus:ring-[#34495E] font-mono"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#344047] mb-1">
                No. Telepon / WhatsApp
              </label>
              <input
                type="tel"
                placeholder="Contoh: 081234567890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#E9ECE7] border border-[#D9DFDA] rounded-[10px] text-[#344047] placeholder:text-[#87918F] focus:border-[#34495E] focus:outline-none focus:ring-1 focus:ring-[#34495E] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#344047] mb-1">
              Jabatan / Posisi di Lab
            </label>
            <input
              type="text"
              placeholder="Contoh: Teknisi Laboratorium Komputer & Jaringan"
              value={formData.jabatan}
              onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#E9ECE7] border border-[#D9DFDA] rounded-[10px] text-[#344047] placeholder:text-[#87918F] focus:border-[#34495E] focus:outline-none focus:ring-1 focus:ring-[#34495E]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#344047] mb-1">
                Hak Akses (Role) <span className="text-[#A95353]">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as UserRole })
                }
                className="w-full px-3 py-2 text-xs bg-[#E9ECE7] border border-[#D9DFDA] rounded-[10px] text-[#344047] focus:border-[#34495E] focus:outline-none focus:ring-1 focus:ring-[#34495E]"
              >
                <option value="STAFF">STAFF (Operasional)</option>
                <option value="ADMIN">ADMIN (Full Control)</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#344047] mb-1">
                Status Akun <span className="text-[#A95353]">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as UserStatus })
                }
                className="w-full px-3 py-2 text-xs bg-[#E9ECE7] border border-[#D9DFDA] rounded-[10px] text-[#344047] focus:border-[#34495E] focus:outline-none focus:ring-1 focus:ring-[#34495E]"
              >
                <option value="AKTIF">AKTIF</option>
                <option value="NONAKTIF">NONAKTIF</option>
              </select>
            </div>
          </div>

          <p className="text-[11px] text-[#87918F]">
            Password default untuk akun baru adalah <code className="bg-[#E2E9E3] px-1 py-0.5 rounded text-[#344047]">staff123</code>
          </p>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#D9DFDA] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-[#34495E] bg-[#DCE8E2] hover:bg-[#CEDDD5] rounded-[10px] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-[#F4F5F1] bg-[#34495E] hover:bg-[#293B4D] rounded-[10px] shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Buat Akun'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
