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
  Phone,
  MessageCircle,
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
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#2E3B40]/60 backdrop-blur-xs p-3 sm:p-4 flex items-center justify-center animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#F4F5F1] rounded-[14px] shadow-2xl border border-[#D9DFDA] w-full max-w-md my-auto overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#D9DFDA] flex items-center justify-between bg-[#E2E9E3] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[#DCE8E2] text-[#34495E] flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#2E3B40] text-base">Proses Pengembalian Barang</h3>
              <p className="text-xs text-[#69777A] font-mono">{loan.kode_peminjaman}</p>
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

          {/* Loan Summary Summary */}
          <div className="p-3.5 bg-[#ECEFEA] rounded-[10px] border border-[#D9DFDA] text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[#69777A]">Peminjam:</span>
              <span className="font-semibold text-[#344047]">
                {loan.nama_peminjam} ({loan.nim_identitas})
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#69777A]">Kontak / WA:</span>
              <span className="font-semibold text-[#344047] flex items-center gap-1.5">
                <span className="font-mono">{loan.kontak_peminjam || '-'}</span>
                {loan.kontak_peminjam && (
                  <a
                    href={`https://wa.me/${loan.kontak_peminjam.replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-[#548C75] bg-[#E1EDE4] px-1.5 py-0.5 rounded border border-[#548C75]/20 hover:underline"
                  >
                    Chat WA
                  </a>
                )}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-[#69777A]">Alamat Domisili:</span>
              <span className="font-semibold text-[#344047] text-right max-w-[220px]">
                {loan.alamat_peminjam || 'Alamat sesuai kartu identitas'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#69777A]">Barang:</span>
              <span className="font-semibold text-[#344047]">
                {loan.item?.nama_barang || 'Barang Lab'} ({loan.jumlah} unit)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#69777A]">Estimasi Kembali:</span>
              <span className={`font-semibold ${loan.is_overdue ? 'text-[#A95353] font-bold' : 'text-[#344047]'}`}>
                {formatDate(loan.estimasi_kembali)}
                {loan.is_overdue && ' (TERLAMBAT)'}
              </span>
            </div>
          </div>

          {/* Condition Selector */}
          <div>
            <label className="block text-[13px] font-medium text-[#344047] mb-2">
              Kondisi Barang Saat Dikembalikan <span className="text-[#A95353]">*</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {/* Baik */}
              <button
                type="button"
                onClick={() => setCondition('Baik')}
                className={`p-3 rounded-[10px] border flex flex-col items-center gap-1.5 text-center transition-all ${
                  condition === 'Baik'
                    ? 'border-[#548C75] bg-[#E1EDE4] text-[#548C75] ring-1 ring-[#548C75]'
                    : 'border-[#D9DFDA] bg-[#E9ECE7] hover:bg-[#E2E9E3] text-[#344047]'
                }`}
              >
                <CheckCircle2
                  className={`w-5 h-5 ${condition === 'Baik' ? 'text-[#548C75]' : 'text-[#87918F]'}`}
                />
                <span className="text-xs font-bold">Baik</span>
                <span className="text-[10px] text-[#69777A] leading-tight">Masuk stok siap pakai</span>
              </button>

              {/* Perlu Perbaikan */}
              <button
                type="button"
                onClick={() => setCondition('Perlu Perbaikan')}
                className={`p-3 rounded-[10px] border flex flex-col items-center gap-1.5 text-center transition-all ${
                  condition === 'Perlu Perbaikan'
                    ? 'border-[#9A7137] bg-[#F2EBDD] text-[#9A7137] ring-1 ring-[#9A7137]'
                    : 'border-[#D9DFDA] bg-[#E9ECE7] hover:bg-[#E2E9E3] text-[#344047]'
                }`}
              >
                <AlertTriangle
                  className={`w-5 h-5 ${
                    condition === 'Perlu Perbaikan' ? 'text-[#9A7137]' : 'text-[#87918F]'
                  }`}
                />
                <span className="text-xs font-bold">Perbaikan</span>
                <span className="text-[10px] text-[#69777A] leading-tight">Perlu servis lab</span>
              </button>

              {/* Rusak */}
              <button
                type="button"
                onClick={() => setCondition('Rusak')}
                className={`p-3 rounded-[10px] border flex flex-col items-center gap-1.5 text-center transition-all ${
                  condition === 'Rusak'
                    ? 'border-[#A95353] bg-[#F2E3E1] text-[#A95353] ring-1 ring-[#A95353]'
                    : 'border-[#D9DFDA] bg-[#E9ECE7] hover:bg-[#E2E9E3] text-[#344047]'
                }`}
              >
                <XCircle
                  className={`w-5 h-5 ${condition === 'Rusak' ? 'text-[#A95353]' : 'text-[#87918F]'}`}
                />
                <span className="text-xs font-bold">Rusak</span>
                <span className="text-[10px] text-[#69777A] leading-tight">Karantina barang</span>
              </button>
            </div>

            {/* Condition Impact Notice */}
            <p className="mt-2 text-[11px]">
              {condition === 'Baik' ? (
                <span className="text-[#548C75] font-medium">
                  ✓ Stok {loan.jumlah} unit akan otomatis dikembalikan ke inventaris siap pakai.
                </span>
              ) : (
                <span className="text-[#9A7137] font-medium">
                  ⚠ Stok tidak akan dikembalikan ke stok aktif dan dicatat untuk pemeliharaan/ganti rugi.
                </span>
              )}
            </p>

            {/* Damage Contact Outreach Card */}
            {condition !== 'Baik' && (
              <div className="mt-3 p-3 bg-[#F2E3E1] border border-[#A95353]/30 rounded-[10px] text-xs space-y-1.5 text-[#A95353]">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Klarifikasi Kerusakan / Ganti Rugi</span>
                </p>
                <p className="text-[11px] text-[#69777A]">
                  Peminjam dapat segera dihubungi untuk tindak lanjut servis atau pertanggungjawaban:
                </p>
                {loan.kontak_peminjam ? (
                  <a
                    href={`https://wa.me/${loan.kontak_peminjam.replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=${encodeURIComponent(`Halo ${loan.nama_peminjam}, kami dari SIMLAB mengonfirmasi pengembalian ${loan.item?.nama_barang} (${loan.kode_peminjaman}) tercatat berstatus ${condition}. Mohon segera konfirmasi ke pihak laboratorium.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#A95353] text-[#F4F5F1] rounded-[6px] text-[11px] font-semibold hover:bg-[#8E4444] transition-colors mt-0.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Hubungi {loan.nama_peminjam} ({loan.kontak_peminjam}) via WA</span>
                  </a>
                ) : (
                  <p className="text-[11px] italic">Kontak peminjam belum terdaftar pada transaksi ini.</p>
                )}
              </div>
            )}
          </div>

          {/* Return Note */}
          <div>
            <label className="block text-[13px] font-medium text-[#344047] mb-1">
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
              className="w-full px-3 py-2 text-xs bg-[#E9ECE7] border border-[#D9DFDA] rounded-[10px] text-[#344047] placeholder:text-[#87918F] focus:border-[#34495E] focus:outline-none focus:ring-1 focus:ring-[#34495E] resize-none"
            />
          </div>

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
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{loading ? 'Memproses...' : 'Selesaikan Pengembalian'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
