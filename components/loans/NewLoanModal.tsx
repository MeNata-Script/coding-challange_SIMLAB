'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Item } from '@/types';
import { fetchItems, createLoan } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  X,
  PlusCircle,
  Calendar,
  User,
  CreditCard,
  Package,
  Layers,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface NewLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedItemId?: string;
}

export default function NewLoanModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedItemId,
}: NewLoanModalProps) {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [namaPeminjam, setNamaPeminjam] = useState('');
  const [nimIdentitas, setNimIdentitas] = useState('');
  const [jumlah, setJumlah] = useState<number>(1);
  const [tanggalPinjam, setTanggalPinjam] = useState('');
  const [estimasiKembali, setEstimasiKembali] = useState('');
  const [catatan, setCatatan] = useState('');

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Default dates
  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Default return 3 days from now
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 3);
    const returnStr = returnDate.toISOString().split('T')[0];

    setTanggalPinjam(todayStr);
    setEstimasiKembali(returnStr);
  }, [isOpen]);

  // Load items
  useEffect(() => {
    if (isOpen) {
      fetchItems().then((data) => {
        setItems(data);
        if (preselectedItemId) {
          setSelectedItemId(preselectedItemId);
        } else if (data.length > 0) {
          const firstAvailable = data.find((i) => i.stok > 0);
          setSelectedItemId(firstAvailable ? firstAvailable.id : data[0].id);
        }
      });
      setFormError('');
      setNamaPeminjam('');
      setNimIdentitas('');
      setJumlah(1);
      setCatatan('');
    }
  }, [isOpen, preselectedItemId]);

  if (!isOpen) return null;

  const currentItem = items.find((i) => i.id === selectedItemId);
  const maxStock = currentItem ? currentItem.stok : 0;

  const handleQuickAdd = (amount: number) => {
    if (!currentItem) return;
    const nextVal = Math.min(jumlah + amount, maxStock);
    setJumlah(Math.max(1, nextVal));
  };

  const handleSetMax = () => {
    if (!currentItem) return;
    setJumlah(Math.max(1, maxStock));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedItemId) {
      setFormError('Silakan pilih barang yang akan dipinjam!');
      return;
    }
    if (!namaPeminjam.trim()) {
      setFormError('Nama peminjam wajib diisi!');
      return;
    }
    if (!nimIdentitas.trim()) {
      setFormError('NIM atau nomor identitas peminjam wajib diisi!');
      return;
    }
    if (jumlah <= 0) {
      setFormError('Jumlah peminjaman minimal 1 unit!');
      return;
    }
    if (currentItem && jumlah > currentItem.stok) {
      setFormError(`Stok tidak mencukupi! Hanya tersedia ${currentItem.stok} unit.`);
      return;
    }
    if (!estimasiKembali) {
      setFormError('Estimasi tanggal kembali wajib ditentukan!');
      return;
    }

    try {
      setLoading(true);
      await createLoan(
        {
          item_id: selectedItemId,
          nama_peminjam: namaPeminjam.trim(),
          nim_identitas: nimIdentitas.trim(),
          jumlah: Number(jumlah),
          tanggal_pinjam: tanggalPinjam,
          estimasi_kembali: estimasiKembali,
          catatan: catatan.trim(),
        },
        user?.username || 'staff'
      );

      // Trigger Confetti micro-interaction
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.65 },
        });
      } catch {
        // Safe fallback
      }

      success(
        'Peminjaman Berhasil Dicatat',
        `${jumlah} unit ${currentItem?.nama_barang} dipinjam oleh ${namaPeminjam}.`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Gagal memproses peminjaman.');
      error('Gagal Pinjam', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-elevated border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Catat Peminjaman Barang</h3>
              <p className="text-xs text-slate-500">Formulir operasional peminjaman laboratorium</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Item Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilih Barang Laboratorium <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedItemId}
                onChange={(e) => {
                  setSelectedItemId(e.target.value);
                  setJumlah(1);
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                required
              >
                {items.map((item) => (
                  <option key={item.id} value={item.id} disabled={item.stok === 0}>
                    [{item.kode_barang}] {item.nama_barang} — (Sisa Stok: {item.stok} unit)
                    {item.stok === 0 ? ' [HABIS]' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected item stock preview */}
            {currentItem && (
              <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">Kategori: </span>
                  <span className="font-semibold text-slate-700">{currentItem.kategori}</span>
                  <span className="text-slate-400 mx-1.5">•</span>
                  <span className="text-slate-500">Lokasi: </span>
                  <span className="text-slate-700">{currentItem.lokasi_penyimpanan}</span>
                </div>
                <div>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      currentItem.stok === 0
                        ? 'bg-rose-100 text-rose-800'
                        : currentItem.stok <= 2
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    Stok: {currentItem.stok}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Borrower Name & NIM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Peminjam <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Contoh: Ahmad Fauzi"
                  value={namaPeminjam}
                  onChange={(e) => setNamaPeminjam(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIM / No. Identitas <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: 21051204012"
                value={nimIdentitas}
                onChange={(e) => setNimIdentitas(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                required
              />
            </div>
          </div>

          {/* Loan Quantity & Helper Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jumlah Pinjam (Maks: {maxStock}) <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={maxStock || 1}
                value={jumlah}
                onChange={(e) => setJumlah(parseInt(e.target.value) || 1)}
                className="w-28 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-bold"
                required
              />

              {/* Quick Helper buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickAdd(1)}
                  disabled={jumlah >= maxStock}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-40"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdd(2)}
                  disabled={jumlah + 2 > maxStock}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-40"
                >
                  +2
                </button>
                <button
                  type="button"
                  onClick={handleSetMax}
                  disabled={maxStock === 0 || jumlah === maxStock}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors border border-indigo-200 disabled:opacity-40"
                >
                  Max ({maxStock})
                </button>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Pinjam <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={tanggalPinjam}
                onChange={(e) => setTanggalPinjam(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimasi Pengembalian <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                min={tanggalPinjam}
                value={estimasiKembali}
                onChange={(e) => setEstimasiKembali(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                required
              />
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keperluan / Catatan
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Praktikum Pemrograman Jaringan di Lab Komputasi"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
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
              disabled={loading || maxStock === 0}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{loading ? 'Menyimpan...' : 'Konfirmasi Peminjaman'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
