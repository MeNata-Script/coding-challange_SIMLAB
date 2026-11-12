'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Item } from '@/types';
import { fetchItems, createLoan } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  X,
  Package,
  Calendar,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  Phone,
  GraduationCap,
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
  const [kontakPeminjam, setKontakPeminjam] = useState('');
  const [prodiInstansi, setProdiInstansi] = useState('');
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
      setKontakPeminjam('');
      setProdiInstansi('');
      setJumlah(1);
      setCatatan('');
    }
  }, [isOpen, preselectedItemId]);

  if (!isOpen) return null;

  const currentItem = items.find((i) => i.id === selectedItemId);
  const maxStock = currentItem ? currentItem.stok : 0;

  const handleQuickAdd = (qty: number) => {
    const nextVal = jumlah + qty;
    if (nextVal <= maxStock) {
      setJumlah(nextVal);
    } else {
      setJumlah(maxStock);
    }
  };

  const handleSetMax = () => {
    if (maxStock > 0) {
      setJumlah(maxStock);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedItemId) {
      setFormError('Silakan pilih barang yang ingin dipinjam!');
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
    if (!kontakPeminjam.trim()) {
      setFormError('Nomor WhatsApp / telepon peminjam wajib diisi untuk keperluan darurat atau konfirmasi!');
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
          kontak_peminjam: kontakPeminjam.trim(),
          prodi_instansi: prodiInstansi.trim(),
          jumlah: Number(jumlah),
          tanggal_pinjam: tanggalPinjam,
          estimasi_kembali: estimasiKembali,
          catatan: catatan.trim(),
        },
        user?.username || 'staff'
      );

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}

      success(
        'Peminjaman Berhasil',
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
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#2E3B40]/60 backdrop-blur-xs p-3 sm:p-4 flex items-center justify-center animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#F4F5F1] rounded-[14px] shadow-2xl border border-[#D9DFDA] w-full max-w-lg my-auto overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#E2E9E3] border-b border-[#D9DFDA] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[#DCE8E2] text-[#34495E] flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[#2E3B40] text-[16px]">Catat Peminjaman Baru</h3>
              <p className="text-[12px] text-[#69777A]">Pastikan identitas & nomor kontak mahasiswa terverifikasi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[8px] text-[#69777A] hover:text-[#2E3B40] hover:bg-[#DCE8E2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {formError && (
            <div className="p-3 bg-[#F2E3E1] border border-[#D9DFDA] rounded-[10px] flex items-center gap-2 text-[#A95353] text-[13px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Select Item */}
          <div>
            <label className="block text-[13px] font-medium text-[#2E3B40] mb-1">
              Pilih Barang Laboratorium <span className="text-[#A95353]">*</span>
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => {
                setSelectedItemId(e.target.value);
                setJumlah(1);
              }}
              className="w-full px-3 py-2 text-[14px] bg-[#E9ECE7] border border-[#D9DFDA] rounded-[10px] focus:border-[#34495E] focus:bg-[#F4F5F1] outline-none text-[#344047]"
              required
            >
              {items.map((item) => (
                <option key={item.id} value={item.id} disabled={item.stok === 0}>
                  [{item.kode_barang}] {item.nama_barang} — (Sisa: {item.stok} unit)
                  {item.stok === 0 ? ' [HABIS]' : ''}
                </option>
              ))}
            </select>

            {/* Selected item stock preview */}
            {currentItem && (
              <div className="mt-2 p-2.5 rounded-[8px] bg-[#ECEFEA] border border-[#D9DFDA] flex items-center justify-between text-[12px]">
                <div className="text-[#69777A]">
                  <span>Kategori: </span>
                  <span className="font-semibold text-[#2E3B40]">{currentItem.kategori}</span>
                  <span className="mx-1.5">•</span>
                  <span>Lokasi: </span>
                  <span className="text-[#344047]">{currentItem.lokasi_penyimpanan}</span>
                </div>
                <div>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-[4px] text-[11px] border border-[#D9DFDA] ${
                      currentItem.stok === 0
                        ? 'bg-[#F2E3E1] text-[#A95353]'
                        : currentItem.stok <= 2
                        ? 'bg-[#F2EBDD] text-[#9A7137]'
                        : 'bg-[#E1EDE4] text-[#548C75]'
                    }`}
                  >
                    Stok: {currentItem.stok} unit
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Borrower Name & NIM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#2E3B40] mb-1">
                Nama Peminjam <span className="text-[#A95353]">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Ahmad Fauzi"
                value={namaPeminjam}
                onChange={(e) => setNamaPeminjam(e.target.value)}
                className="w-full px-3 py-2 text-[14px] bg-[#E9ECE7] border border-[#D9DFDA] rounded-[10px] focus:border-[#34495E] focus:bg-[#F4F5F1] outline-none text-[#344047]"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#2E3B40] mb-1">
                NIM / No. Identitas <span className="text-[#A95353]">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: 21051204012"
                value={nimIdentitas}
                onChange={(e) => setNimIdentitas(e.target.value)}
                className="w-full px-3 py-2 text-[14px] bg-[#E9ECE7] border border-[#D9DFDA] rounded-[10px] focus:border-[#34495E] focus:bg-[#F4F5F1] outline-none font-mono text-[#344047]"
                required
              />
            </div>
          </div>

          {/* Contact Details: No. WA & Prodi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#2E3B40] mb-1 flex items-center justify-between">
                <span>No. WhatsApp / HP <span className="text-[#A95353]">*</span></span>
                <span className="text-[11px] text-[#548C75] font-semibold">Bisa Dihubungi</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={kontakPeminjam}
                  onChange={(e) => setKontakPeminjam(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-[14px] bg-[#E9ECE7] border border-[#D9DFDA] rounded-[10px] focus:border-[#34495E] focus:bg-[#F4F5F1] outline-none font-mono text-[#344047]"
                  required
                />
                <Phone className="w-3.5 h-3.5 text-[#87918F] absolute left-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#2E3B40] mb-1">
                Program Studi / Jurusan
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Contoh: S1 Teknik Informatika"
                  value={prodiInstansi}
                  onChange={(e) => setProdiInstansi(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-[14px] bg-[#E9ECE7] border border-[#D9DFDA] rounded-[10px] focus:border-[#34495E] focus:bg-[#F4F5F1] outline-none text-[#344047]"
                />
                <GraduationCap className="w-3.5 h-3.5 text-[#87918F] absolute left-2.5 top-3" />
              </div>
            </div>
          </div>

          {/* Loan Quantity & Helper Buttons */}
          <div>
            <label className="block text-[13px] font-medium text-[#2E3B40] mb-1">
              Jumlah Pinjam (Maks: {maxStock}) <span className="text-[#A95353]">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={maxStock || 1}
                value={jumlah}
                onChange={(e) => setJumlah(parseInt(e.target.value) || 1)}
                className="w-28 px-3 py-2 text-[14px] bg-[#E9ECE7] border border-[#D9DFDA] rounded-[10px] focus:border-[#34495E] focus:bg-[#F4F5F1] outline-none font-semibold text-[#2E3B40]"
                required
              />

              {/* Quick Helper buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickAdd(1)}
                  disabled={jumlah >= maxStock}
                  className="px-2.5 py-1.5 text-[12px] font-medium bg-[#DCE8E2] hover:bg-[#C8DBD3] text-[#34495E] border border-[#D9DFDA] rounded-[8px] transition-colors disabled:opacity-40"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdd(2)}
                  disabled={jumlah + 2 > maxStock}
                  className="px-2.5 py-1.5 text-[12px] font-medium bg-[#DCE8E2] hover:bg-[#C8DBD3] text-[#34495E] border border-[#D9DFDA] rounded-[8px] transition-colors disabled:opacity-40"
                >
                  +2
                </button>
                <button
                  type="button"
                  onClick={handleSetMax}
                  disabled={maxStock === 0 || jumlah === maxStock}
                  className="px-2.5 py-1.5 text-[12px] font-semibold bg-[#DCE8E2] hover:bg-[#C8DBD3] text-[#34495E] border border-[#D9DFDA] rounded-[8px] transition-colors disabled:opacity-40"
                >
                  Max ({maxStock})
                </button>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#2E3B40] mb-1">
                Tanggal Pinjam <span className="text-[#A95353]">*</span>
              </label>
              <input
                type="date"
                value={tanggalPinjam}
                onChange={(e) => setTanggalPinjam(e.target.value)}
                className="w-full px-3 py-2 text-[14px] bg-[#E9ECE7] border border-[#D9DFDA] rounded-[10px] focus:border-[#34495E] focus:bg-[#F4F5F1] outline-none text-[#344047]"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#2E3B40] mb-1">
                Estimasi Pengembalian <span className="text-[#A95353]">*</span>
              </label>
              <input
                type="date"
                min={tanggalPinjam}
                value={estimasiKembali}
                onChange={(e) => setEstimasiKembali(e.target.value)}
                className="w-full px-3 py-2 text-[14px] bg-[#E9ECE7] border border-[#D9DFDA] rounded-[10px] focus:border-[#34495E] focus:bg-[#F4F5F1] outline-none text-[#344047]"
                required
              />
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-[13px] font-medium text-[#2E3B40] mb-1">
              Keperluan / Catatan
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Praktikum Pemrograman Jaringan di Lab Komputasi"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full px-3 py-2 text-[14px] bg-[#E9ECE7] border border-[#D9DFDA] rounded-[10px] focus:border-[#34495E] focus:bg-[#F4F5F1] outline-none resize-none text-[#344047]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#DDE2DC] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-[14px] font-medium text-[#34495E] bg-[#DCE8E2] hover:bg-[#C8DBD3] rounded-[10px] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || maxStock === 0}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-[14px] font-medium text-[#F4F5F1] bg-[#34495E] hover:bg-[#293B4D] rounded-[10px] transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Menyimpan...' : 'Konfirmasi Peminjaman'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
