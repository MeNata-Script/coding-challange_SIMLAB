'use client';

import React, { useState } from 'react';
import { Item } from '@/types';
import { deleteItem } from '@/lib/db';
import { useToast } from '@/context/ToastContext';
import { AlertTriangle, Trash2, X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-elevated border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Barang</h3>
          <p className="text-xs text-slate-600 mt-2">
            Apakah Anda yakin ingin menghapus barang{' '}
            <span className="font-semibold text-slate-900">
              {item.nama_barang} ({item.kode_barang})
            </span>
            ? Tindakan ini tidak dapat dibatalkan.
          </p>

          {errorMessage && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-left text-xs text-rose-700 leading-relaxed">
              <span className="font-bold block mb-0.5">Penghapusan Diblokir:</span>
              {errorMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{loading ? 'Menghapus...' : 'Ya, Hapus Barang'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
