'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Item, ItemCategory, Loan } from '@/types';
import { fetchItems, fetchLoans } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import {
  Package,
  Search,
  Plus,
  QrCode,
  Edit2,
  Trash2,
  Layers,
  MapPin,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  ArrowUpDown,
} from 'lucide-react';
import SlideOverItemDetail from '@/components/inventory/SlideOverItemDetail';
import ItemFormModal from '@/components/inventory/ItemFormModal';
import DeleteConfirmModal from '@/components/inventory/DeleteConfirmModal';

const CATEGORY_TABS: (ItemCategory | 'Semua')[] = [
  'Semua',
  'Komputer',
  'Periferal',
  'Multimedia',
  'Display',
  'Jaringan',
];

export default function InventoryPage() {
  const { isAdmin } = useAuth();

  const [items, setItems] = useState<Item[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'Semua'>('Semua');

  // Modals state
  const [detailItem, setDetailItem] = useState<Item | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [itemsData, loansData] = await Promise.all([fetchItems(), fetchLoans()]);
      setItems(itemsData);
      setLoans(loansData);
    } catch (e) {
      console.error('Failed to load inventory:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('simlab_data_changed', handleUpdate);
    return () => window.removeEventListener('simlab_data_changed', handleUpdate);
  }, [loadData]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kode_barang.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lokasi_penyimpanan.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'Semua' || item.kategori === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  const handleOpenDetail = (item: Item) => {
    setDetailItem(item);
    setIsDetailOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: Item, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (item: Item, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingItem(item);
    setIsDeleteOpen(true);
  };

  return (
    <AppLayout
      title="Inventaris Barang"
      subtitle="Katalog dan manajemen perangkat fisik laboratorium komputasi"
    >
      <div className="space-y-5">
        {/* Top Control Bar: Search, Category Tabs, Add Button */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Cari kode (BR001), nama barang, atau lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Admin Add Item Button */}
            {isAdmin && (
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm hover:shadow transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Barang</span>
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-slate-100 pt-3 scrollbar-none">
            {CATEGORY_TABS.map((tab) => {
              const isSelected = selectedCategory === tab;
              const count =
                tab === 'Semua'
                  ? items.length
                  : items.filter((i) => i.kategori === tab).length;

              return (
                <button
                  key={tab}
                  onClick={() => setSelectedCategory(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                  }`}
                >
                  <span>{tab}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-indigo-700 text-indigo-100'
                        : 'bg-slate-200/70 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Data Table for Desktop (>= 1024px) */}
        <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-5">Kode</th>
                  <th className="py-3.5 px-5">Nama Barang</th>
                  <th className="py-3.5 px-5">Kategori</th>
                  <th className="py-3.5 px-5 text-center">Status Stok</th>
                  <th className="py-3.5 px-5">Lokasi Rak</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
                      <p>Memuat data inventaris...</p>
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700">Tidak ada barang yang cocok</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Coba ubah kata kunci pencarian atau ganti filter kategori.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const statusBadge =
                      item.stok === 0
                        ? {
                            label: 'Habis (0)',
                            color: 'bg-rose-100 text-rose-800 border-rose-200',
                          }
                        : item.stok <= 2
                        ? {
                            label: `Menipis (${item.stok})`,
                            color: 'bg-amber-100 text-amber-800 border-amber-200',
                          }
                        : {
                            label: `Tersedia (${item.stok})`,
                            color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                          };

                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleOpenDetail(item)}
                        className="hover:bg-indigo-50/40 cursor-pointer transition-colors group"
                      >
                        <td className="py-3.5 px-5 font-mono font-bold text-indigo-700">
                          {item.kode_barang}
                        </td>
                        <td className="py-3.5 px-5">
                          <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {item.nama_barang}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                            {item.spesifikasi || 'Spesifikasi standar'}
                          </p>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {item.kategori}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusBadge.color}`}
                          >
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {item.lokasi_penyimpanan}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetail(item);
                              }}
                              title="Lihat Detail & Label QR"
                              className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>

                            {isAdmin && (
                              <>
                                <button
                                  onClick={(e) => handleOpenEdit(item, e)}
                                  title="Edit Barang"
                                  className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => handleOpenDelete(item, e)}
                                  title="Hapus Barang"
                                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stacked Touch-Friendly Cards for Mobile (< 1024px) */}
        <div className="lg:hidden space-y-3">
          {loading ? (
            <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs">Memuat inventaris...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
              <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-xs text-slate-700">Tidak ada barang yang cocok</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const statusBadge =
                item.stok === 0
                  ? { label: 'Habis', color: 'bg-rose-100 text-rose-800 border-rose-200' }
                  : item.stok <= 2
                  ? { label: 'Menipis', color: 'bg-amber-100 text-amber-800 border-amber-200' }
                  : { label: 'Tersedia', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };

              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenDetail(item)}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card active:scale-[0.99] transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {item.kode_barang}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1.5">
                        {item.nama_barang}
                      </h4>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.color}`}
                    >
                      {statusBadge.label} ({item.stok})
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {item.spesifikasi || 'Spesifikasi standar'}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {item.lokasi_penyimpanan}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(item);
                        }}
                        className="px-2 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 rounded-lg"
                      >
                        QR Tag
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            onClick={(e) => handleOpenEdit(item, e)}
                            className="p-1 text-slate-600 hover:bg-slate-100 rounded-lg"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleOpenDelete(item, e)}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Slide-Over Drawer for Item Detail & Printable QR Label */}
      <SlideOverItemDetail
        item={detailItem}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        loans={loans}
      />

      {/* Add / Edit Item Modal (Admin Only) */}
      {isAdmin && (
        <ItemFormModal
          isOpen={isFormOpen}
          initialItem={editingItem}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            loadData();
          }}
        />
      )}

      {/* Delete Item Confirmation Modal (Admin Only) */}
      {isAdmin && (
        <DeleteConfirmModal
          isOpen={isDeleteOpen}
          item={deletingItem}
          onClose={() => setIsDeleteOpen(false)}
          onSuccess={() => {
            loadData();
          }}
        />
      )}
    </AppLayout>
  );
}
