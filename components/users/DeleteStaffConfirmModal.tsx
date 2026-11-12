'use client';

import React, { useState } from 'react';
import { User } from '@/types';
import { deleteUser } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteStaffConfirmModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteStaffConfirmModal({
  isOpen,
  user,
  onClose,
  onSuccess,
}: DeleteStaffConfirmModalProps) {
  const { user: currentUser } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !user) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      await deleteUser(user.id, currentUser?.id);
      success('Staff Dihapus', `Akun ${user.full_name} (@${user.username}) telah berhasil dihapus dari sistem.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menghapus akun staff.');
      error('Penghapusan Ditolak', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2E3B40]/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#F4F5F1] rounded-[14px] shadow-lg border border-[#D9DFDA] w-full max-w-md overflow-hidden">
        {/* Content */}
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-[10px] bg-[#F2E3E1] text-[#A95353] flex items-center justify-center mx-auto mb-4 border border-[#D9DFDA]">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-[16px] font-semibold text-[#2E3B40]">Konfirmasi Hapus Akun Staff</h3>
          <p className="text-[13px] text-[#69777A] mt-2">
            Apakah Anda yakin ingin menghapus akun staff{' '}
            <span className="font-semibold text-[#2E3B40]">
              {user.full_name} (@{user.username})
            </span>
            ? Tindakan ini akan menghapus hak akses yang bersangkutan secara permanen.
          </p>

          <div className="mt-3 p-3 bg-[#ECEFEA] border border-[#D9DFDA] rounded-[10px] text-xs text-[#344047] flex items-center justify-center gap-2">
            <span className="text-[#69777A]">Role:</span>
            <span className="font-bold">{user.role}</span>
            <span className="text-[#D9DFDA]">•</span>
            <span className="text-[#69777A]">Status:</span>
            <span className="font-bold">{user.status}</span>
          </div>

          {errorMessage && (
            <div className="mt-4 p-3 bg-[#F2E3E1] border border-[#D9DFDA] rounded-[10px] text-left text-[12px] text-[#A95353] leading-relaxed">
              <span className="font-bold block mb-0.5">Penghapusan Ditolak:</span>
              {errorMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#E2E9E3] border-t border-[#D9DFDA] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-[14px] font-medium text-[#34495E] bg-[#DCE8E2] hover:bg-[#CEDDD5] rounded-[10px] transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[14px] font-medium text-[#F4F5F1] bg-[#A95353] hover:bg-[#8E4444] rounded-[10px] transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{loading ? 'Menghapus...' : 'Ya, Hapus Akun'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
