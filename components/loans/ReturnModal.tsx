'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Loan, ReturnCondition } from '@/types';
import { processReturn } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatDate } from '@/lib/utils';
import {
  X,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface ReturnModalProps {
  isOpen: boolean;
  loan: Loan | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReturnModal({
  isOpen,
  loan,
  onClose,
  onSuccess,
}: ReturnModalProps) {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [condition, setCondition] = useState<ReturnCondition>('Baik');
  const [returnNote, setReturnNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isOpen || !loan) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      setLoading(true);
      await processReturn(
        loan.id,
        condition,
        returnNote.trim(),
        user?.username || 'staff'
      );

      // Trigger Confetti micro-interaction
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }

      success(
        'Pengembalian Diproses',
        `Peminjaman ${loan.kode_peminjaman} telah diselesaikan dengan kondisi ${condition}.`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Gagal memproses pengembalian.');
      error('Gagal Mengembalikan', err.message);
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
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Proses Pengembalian Barang</h3>
              <p className="text-xs text-slate-500 font-mono">{loan.kode_peminjaman}</p>
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

          {/* Loan Summary Summary */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Peminjam:</span>
              <span className="font-semibold text-slate-800">
                {loan.nama_peminjam} ({loan.nim_identitas})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Barang:</span>
              <span className="font-semibold text-slate-800">
                {loan.item?.nama_barang || 'Barang Lab'} ({loan.jumlah} unit)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Estimasi Kembali:</span>
              <span className={`font-semibold ${loan.is_overdue ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                {formatDate(loan.estimasi_kembali)}
                {loan.is_overdue && ' (TERLAMBAT)'}
              </span>
            </div>
          </div>

          {/* Condition Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Kondisi Barang Saat Dikembalikan <span className="text-rose-500">*</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {/* Baik */}
              <button
                type="button"
                onClick={() => setCondition('Baik')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                  condition === 'Baik'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <CheckCircle2
                  className={`w-5 h-5 ${condition === 'Baik' ? 'text-emerald-600' : 'text-slate-400'}`}
                />
                <span className="text-xs font-bold">Baik</span>
                <span className="text-[10px] text-slate-500 leading-tight">Masuk stok siap pakai</span>
              </button>

              {/* Perlu Perbaikan */}
              <button
                type="button"
                onClick={() => setCondition('Perlu Perbaikan')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                  condition === 'Perlu Perbaikan'
                    ? 'border-amber-500 bg-amber-50/70 text-amber-900 ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <AlertTriangle
                  className={`w-5 h-5 ${
                    condition === 'Perlu Perbaikan' ? 'text-amber-600' : 'text-slate-400'
                  }`}
                />
                <span className="text-xs font-bold">Perbaikan</span>
                <span className="text-[10px] text-slate-500 leading-tight">Perlu servis lab</span>
              </button>

              {/* Rusak */}
              <button
                type="button"
                onClick={() => setCondition('Rusak')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                  condition === 'Rusak'
                    ? 'border-rose-500 bg-rose-50/70 text-rose-900 ring-2 ring-rose-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <XCircle
                  className={`w-5 h-5 ${condition === 'Rusak' ? 'text-rose-600' : 'text-slate-400'}`}
                />
                <span className="text-xs font-bold">Rusak</span>
                <span className="text-[10px] text-slate-500 leading-tight">Karantina barang</span>
              </button>
            </div>

            {/* Condition Impact Helper Notice */}
            <p className="mt-2 text-[11px] text-slate-500">
              {condition === 'Baik' ? (
                <span className="text-emerald-700 font-medium">
                  ✓ Stok {loan.jumlah} unit akan otomatis dikembalikan ke inventaris aktif.
                </span>
              ) : (
                <span className="text-amber-700 font-medium">
                  ⚠ Stok tidak akan dikembalikan ke stok aktif dan dicatat untuk pemeliharaan.
                </span>
              )}
            </p>
          </div>

          {/* Return Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Pengembalian
            </label>
            <textarea
              rows={2}
              placeholder={
                condition === 'Baik'
                  ? 'Contoh: Dikembalikan lengkap bersama adaptor dan tas bawaan'
                  : 'Jelaskan rincian kerusakan atau kendala...'
              }
              value={returnNote}
              onChange={(e) => setReturnNote(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
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
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{loading ? 'Memproses...' : 'Selesaikan Pengembalian'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
