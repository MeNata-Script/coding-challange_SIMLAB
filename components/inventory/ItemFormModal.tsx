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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-elevated border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {isEditing ? 'Ubah Data Barang' : 'Tambah Barang Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditing ? 'Perbarui informasi inventaris' : 'Masukkan rincian inventaris baru'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kode Barang <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: BR009"
                value={formData.kode_barang}
                onChange={(e) => setFormData({ ...formData, kode_barang: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.kategori}
                onChange={(e) =>
                  setFormData({ ...formData, kategori: e.target.value as ItemCategory })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Barang <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Monitor Curved Samsung 27 Inch"
              value={formData.nama_barang}
              onChange={(e) => setFormData({ ...formData, nama_barang: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stok Awal <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.stok}
                onChange={(e) => setFormData({ ...formData, stok: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kondisi</label>
              <select
                value={formData.kondisi}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kondisi: e.target.value as 'Baik' | 'Perlu Perbaikan' | 'Rusak',
                  })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="Baik">Baik</option>
                <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                <option value="Rusak">Rusak</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lokasi Rak / Penyimpanan
            </label>
            <input
              type="text"
              placeholder="Contoh: Lab Komputer Utama (Rak A2)"
              value={formData.lokasi_penyimpanan}
              onChange={(e) => setFormData({ ...formData, lokasi_penyimpanan: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Spesifikasi / Keterangan
            </label>
            <textarea
              rows={2}
              placeholder="Rincian teknis, aksesoris, kelengkapan kabel, dll."
              value={formData.spesifikasi}
              onChange={(e) => setFormData({ ...formData, spesifikasi: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
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
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Barang'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
