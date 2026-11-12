'use client';

import React, { useState, useEffect } from 'react';
import { Item, ItemCategory } from '@/types';
import { createItem, updateItem } from '@/lib/db';
import { useToast } from '@/context/ToastContext';
import { X, PackagePlus, Save, AlertCircle } from 'lucide-react';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialItem?: Item | null;
}

const CATEGORIES: ItemCategory[] = [
  'Komputer',
  'Periferal',
  'Multimedia',
  'Display',
  'Jaringan',
  'Lainnya',
];

export default function ItemFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialItem,
}: ItemFormModalProps) {
  const { success, error } = useToast();
  const isEditing = Boolean(initialItem);

  const [formData, setFormData] = useState({
    kode_barang: '',
    nama_barang: '',
    kategori: 'Komputer' as ItemCategory,
    stok: 1,
    lokasi_penyimpanan: 'Lab Komputer Utama (Rak A1)',
    kondisi: 'Baik' as 'Baik' | 'Perlu Perbaikan' | 'Rusak',
    spesifikasi: '',
  });

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (initialItem) {
      setFormData({
        kode_barang: initialItem.kode_barang,
        nama_barang: initialItem.nama_barang,
        kategori: initialItem.kategori,
        stok: initialItem.stok,
        lokasi_penyimpanan: initialItem.lokasi_penyimpanan,
        kondisi: initialItem.kondisi,
        spesifikasi: initialItem.spesifikasi || '',
      });
    } else {
      setFormData({
        kode_barang: '',
        nama_barang: '',
        kategori: 'Komputer',
        stok: 1,
        lokasi_penyimpanan: 'Lab Komputer Utama (Rak A1)',
        kondisi: 'Baik',
        spesifikasi: '',
      });
    }
    setFormError('');
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.kode_barang.trim()) {
      setFormError('Kode barang wajib diisi!');
      return;
    }
    if (!formData.nama_barang.trim()) {
      setFormError('Nama barang wajib diisi!');
      return;
    }
    if (formData.stok < 0) {
      setFormError('Stok barang tidak boleh negatif!');
      return;
    }

    try {
      setLoading(true);
      if (isEditing && initialItem) {
        await updateItem(initialItem.id, {
          kode_barang: formData.kode_barang.trim().toUpperCase(),
          nama_barang: formData.nama_barang.trim(),
          kategori: formData.kategori,
          stok: Number(formData.stok),
          lokasi_penyimpanan: formData.lokasi_penyimpanan.trim(),
          kondisi: formData.kondisi,
          spesifikasi: formData.spesifikasi.trim(),
        });
        success('Berhasil Diperbarui', `Barang ${formData.nama_barang} berhasil diubah.`);
      } else {
        await createItem({
          kode_barang: formData.kode_barang.trim().toUpperCase(),
          nama_barang: formData.nama_barang.trim(),
          kategori: formData.kategori,
          stok: Number(formData.stok),
          lokasi_penyimpanan: formData.lokasi_penyimpanan.trim(),
          kondisi: formData.kondisi,
          spesifikasi: formData.spesifikasi.trim(),
        });
        success('Barang Ditambahkan', `Barang baru ${formData.nama_barang} berhasil disimpan.`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan saat menyimpan data.');
      error('Gagal Menyimpan', err.message);
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
        <div className="px-6 py-4 border-b border-[#D9DFDA] flex items-center justify-between bg-[#E2E9E3]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#DCE8E2] text-[#34495E] rounded-[8px]">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[#2E3B40] text-[16px]">
                {isEditing ? 'Ubah Data Inventaris' : 'Tambah Barang Baru'}
              </h3>
              <p className="text-[12px] text-[#69777A]">
                {isEditing ? 'Perbarui informasi spesifikasi dan stok' : 'Masukkan rincian inventaris laboratorium'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[6px] text-[#87918F] hover:text-[#2E3B40] hover:bg-[#ECEFEA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {formError && (
            <div className="p-3 bg-[#F2E3E1] border border-[#D9DFDA] rounded-[10px] flex items-center gap-2 text-[#A95353] text-[13px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#2E3B40] mb-1">
                Kode Barang <span className="text-[#A95353]">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: BR009"
                value={formData.kode_barang}
                onChange={(e) => setFormData({ ...formData, kode_barang: e.target.value })}
                className="w-full px-3 py-2 text-[14px] bg-[#E9ECE7] border border-[#D9DFDA] rounded-[10px] focus:border-[#34495E] focus:bg-[#F4F5F1] outline-none uppercase font-mono text-[#344047]"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#2E3B40] mb-1">
                Kategori <span className="text-[#A95353]">*</span>
              </label>
              <select
                value={formData.kategori}
                onChange={(e) =>
                  setFormData({ ...formData, kategori: e.target.value as ItemCategory })
                }
                className="w-full px-3 py-2 text-[14px] bg-[#E9ECE7] border border-[#D9DFDA] rounded-[10px] focus:border-[#34495E] focus:bg-[#F4F5F1] outline-none text-[#344047]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#2E3B40] mb-1">
              Nama Barang <span className="text-[#A95353]">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Monitor Curved Samsung 27 Inch"
              value={formData.nama_barang}
              onChange={(e) => setFormData({ ...formData, nama_barang: e.target.value })}
              className="w-full px-3 py-2 text-[14px] bg-[#E9ECE7] border border-[#D9DFDA] rounded-[10px] focus:border-[#34495E] focus:bg-[#F4F5F1] outline-none text-[#344047]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#2E3B40] mb-1">
                Stok Awal <span className="text-[#A95353]">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.stok}
                onChange={(e) => setFormData({ ...formData, stok: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-[14px] bg-[#E9ECE7] border border-[#D9DFDA] rounded-[10px] focus:border-[#34495E] focus:bg-[#F4F5F1] outline-none text-[#344047]"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#2E3B40] mb-1">Kondisi</label>
              <select
                value={formData.kondisi}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kondisi: e.target.value as 'Baik' | 'Perlu Perbaikan' | 'Rusak',
                  })
                }
                className="w-full px-3 py-2 text-[14px] bg-[#E9ECE7] border border-[#D9DFDA] rounded-[10px] focus:border-[#34495E] focus:bg-[#F4F5F1] outline-none text-[#344047]"
              >
                <option value="Baik">Baik</option>
                <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                <option value="Rusak">Rusak</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#2E3B40] mb-1">
              Lokasi Rak / Penyimpanan
            </label>
            <input
              type="text"
              placeholder="Contoh: Lab Komputer Utama (Rak A2)"
              value={formData.lokasi_penyimpanan}
              onChange={(e) => setFormData({ ...formData, lokasi_penyimpanan: e.target.value })}
              className="w-full px-3 py-2 text-[14px] bg-[#E9ECE7] border border-[#D9DFDA] rounded-[10px] focus:border-[#34495E] focus:bg-[#F4F5F1] outline-none text-[#344047]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#2E3B40] mb-1">
              Spesifikasi / Keterangan
            </label>
            <textarea
              rows={2}
              placeholder="Rincian teknis, kelengkapan kabel, aksesoris, dll."
              value={formData.spesifikasi}
              onChange={(e) => setFormData({ ...formData, spesifikasi: e.target.value })}
              className="w-full px-3 py-2 text-[14px] bg-[#E9ECE7] border border-[#D9DFDA] rounded-[10px] focus:border-[#34495E] focus:bg-[#F4F5F1] outline-none resize-none text-[#344047]"
            />
          </div>

          {/* Action Buttons */}
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
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[14px] font-medium text-[#F4F5F1] bg-[#34495E] hover:bg-[#293B4D] rounded-[10px] transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Barang'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
