'use client';

import React, { useState } from 'react';
import { Item } from '@/types';
import { deleteItem } from '@/lib/db';
import { useToast } from '@/context/ToastContext';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  item: Item | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  item,
  onClose,
  onSuccess,
}: DeleteConfirmModalProps) {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !item) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      await deleteItem(item.id);
      success('Barang Dihapus', `${item.nama_barang} (${item.kode_barang}) berhasil dihapus.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menghapus barang.');
      error('Penghapusan Ditolak', err.message);
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
        className="bg-[#F4F5F1] rounded-[14px] shadow-2xl border border-[#D9DFDA] w-full max-w-md my-auto overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Content */}
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-[10px] bg-[#F2E3E1] text-[#A95353] flex items-center justify-center mx-auto mb-4 border border-[#D9DFDA]">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-[16px] font-semibold text-[#2E3B40]">Konfirmasi Hapus Barang</h3>
          <p className="text-[13px] text-[#69777A] mt-2">
            Apakah Anda yakin ingin menghapus barang{' '}
            <span className="font-semibold text-[#2E3B40]">
              {item.nama_barang} ({item.kode_barang})
            </span>
            ? Tindakan ini tidak dapat dibatalkan.
          </p>

          {errorMessage && (
            <div className="mt-4 p-3 bg-[#F2E3E1] border border-[#D9DFDA] rounded-[10px] text-left text-[12px] text-[#A95353] leading-relaxed">
              <span className="font-bold block mb-0.5">Penghapusan Diblokir:</span>
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
            className="px-4 py-2 text-[14px] font-medium text-[#34495E] bg-[#DCE8E2] hover:bg-[#C8DBD3] rounded-[10px] transition-colors"
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
            <span>{loading ? 'Menghapus...' : 'Ya, Hapus Barang'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
