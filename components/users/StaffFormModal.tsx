'use client';

import React, { useState, useEffect } from 'react';
import { User, UserRole, UserStatus } from '@/types';
import { createUser, updateUser } from '@/lib/db';
import { useToast } from '@/context/ToastContext';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';

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
      });
    } else {
      setFormData({
        username: '',
        full_name: '',
        role: 'STAFF',
        status: 'AKTIF',
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
        });
        success('Staff Diperbarui', `Data akun ${formData.username} berhasil diubah.`);
      } else {
        await createUser({
          full_name: formData.full_name.trim(),
          username: formData.username.trim().toLowerCase(),
          role: formData.role,
          status: formData.status,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-elevated border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {isEditing ? 'Ubah Akun Staff' : 'Tambah Staff Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditing ? 'Perbarui akses dan informasi akun' : 'Buat akun staf operasional baru'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Rian Hidayat, S.Kom."
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Username <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: rian_lab"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Password default untuk akun baru adalah <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">staff123</code>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hak Akses (Role) <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as UserRole })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="STAFF">STAFF (Operasional)</option>
                <option value="ADMIN">ADMIN (Full Control)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Akun <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as UserStatus })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="AKTIF">AKTIF</option>
                <option value="NONAKTIF">NONAKTIF</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
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
