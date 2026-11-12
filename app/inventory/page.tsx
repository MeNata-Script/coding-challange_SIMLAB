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
  MapPin,
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
      title="Inventaris Laboratorium"
      subtitle="Katalog dan pengelolaan ketersediaan perangkat fisik laboratorium"
    >
      <div className="space-y-5">
        {/* Top Control Bar */}
        <div className="bg-[#F4F5F1] p-5 rounded-[14px] border border-[#D9DFDA] shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#87918F]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Cari kode (BR001), nama barang, atau lokasi rak..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-[14px] bg-[#E9ECE7] hover:bg-[#ECEFEA] focus:bg-[#F4F5F1] border border-[#D9DFDA] rounded-[10px] focus:border-[#34495E] transition-colors outline-none text-[#344047]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[12px] text-[#87918F] hover:text-[#344047]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Admin Add Item Button */}
            {isAdmin && (
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-[14px] font-medium text-[#F4F5F1] bg-[#34495E] hover:bg-[#293B4D] rounded-[10px] transition-colors shrink-0 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Barang</span>
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-[#DDE2DC] pt-3 scrollbar-none">
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
                  className={`px-3 py-1.5 rounded-[8px] text-[13px] font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#34495E] text-[#F4F5F1]'
                      : 'bg-[#E2E9E3] hover:bg-[#ECEFEA] text-[#344047] border border-[#D9DFDA]'
                  }`}
                >
                  <span>{tab}</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-[#293B4D] text-[#DCE8E2]'
                        : 'bg-[#CBD4CD] text-[#2E3B40]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Data Table */}
        <div className="hidden lg:block bg-[#F4F5F1] rounded-[14px] border border-[#D9DFDA] shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#E2E9E3] border-b border-[#D9DFDA] text-[12px] font-semibold text-[#2E3B40]">
                  <th className="py-3.5 px-5">Kode Barang</th>
                  <th className="py-3.5 px-5">Nama Barang</th>
                  <th className="py-3.5 px-5">Kategori</th>
                  <th className="py-3.5 px-5 text-center">Status Stok</th>
                  <th className="py-3.5 px-5">Lokasi Rak</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE2DC] text-[14px]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#87918F]">
                      <div className="inline-block w-6 h-6 border-2 border-[#34495E] border-t-transparent rounded-full animate-spin mb-2" />
                      <p className="text-[13px]">Memuat data inventaris...</p>
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#69777A]">
                      <Package className="w-8 h-8 text-[#87918F] mx-auto mb-2" />
                      <p className="font-semibold text-[#2E3B40] text-[14px]">Tidak ada barang yang cocok</p>
                      <p className="text-[12px] text-[#87918F] mt-0.5">
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
                            style: 'bg-[#F2E3E1] text-[#A95353] border-[#D9DFDA]',
                          }
                        : item.stok <= 2
                        ? {
                            label: `Menipis (${item.stok})`,
                            style: 'bg-[#F2EBDD] text-[#9A7137] border-[#D9DFDA]',
                          }
                        : {
                            label: `Tersedia (${item.stok})`,
                            style: 'bg-[#E1EDE4] text-[#548C75] border-[#D9DFDA]',
                          };

                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleOpenDetail(item)}
                        className="hover:bg-[#ECEFEA] cursor-pointer transition-colors group"
                      >
                        <td className="py-3.5 px-5 font-mono font-semibold text-[#34495E] text-[13px]">
                          {item.kode_barang}
                        </td>
                        <td className="py-3.5 px-5">
                          <p className="font-medium text-[#2E3B40] group-hover:text-[#34495E] transition-colors">
                            {item.nama_barang}
                          </p>
                          <p className="text-[12px] text-[#69777A] truncate max-w-xs mt-0.5">
                            {item.spesifikasi || 'Spesifikasi standar lab'}
                          </p>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="px-2.5 py-1 rounded-[6px] text-[12px] font-medium bg-[#ECEFEA] text-[#344047] border border-[#D9DFDA]">
                            {item.kategori}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-semibold border ${statusBadge.style}`}
                          >
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-[#69777A] text-[13px]">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#87918F]" />
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
                              className="p-1.5 text-[#34495E] hover:bg-[#DCE8E2] rounded-[6px] transition-colors"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>

                            {isAdmin && (
                              <>
                                <button
                                  onClick={(e) => handleOpenEdit(item, e)}
                                  title="Edit Barang"
                                  className="p-1.5 text-[#69777A] hover:text-[#2E3B40] hover:bg-[#DCE8E2] rounded-[6px] transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => handleOpenDelete(item, e)}
                                  title="Hapus Barang"
                                  className="p-1.5 text-[#A95353] hover:text-[#8E4444] hover:bg-[#F2E3E1] rounded-[6px] transition-colors"
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

        {/* Stacked Cards for Mobile (< 1024px) */}
        <div className="lg:hidden space-y-3">
          {loading ? (
            <div className="p-8 text-center text-[#87918F] bg-[#F4F5F1] rounded-[14px] border border-[#D9DFDA]">
              <div className="inline-block w-6 h-6 border-2 border-[#34495E] border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-[13px]">Memuat inventaris...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center text-[#69777A] bg-[#F4F5F1] rounded-[14px] border border-[#D9DFDA]">
              <Package className="w-8 h-8 text-[#87918F] mx-auto mb-2" />
              <p className="font-semibold text-[13px] text-[#2E3B40]">Tidak ada barang yang cocok</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const statusBadge =
                item.stok === 0
                  ? { label: 'Habis', style: 'bg-[#F2E3E1] text-[#A95353]' }
                  : item.stok <= 2
                  ? { label: 'Menipis', style: 'bg-[#F2EBDD] text-[#9A7137]' }
                  : { label: 'Tersedia', style: 'bg-[#E1EDE4] text-[#548C75]' };

              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenDetail(item)}
                  className="bg-[#F4F5F1] p-4 rounded-[14px] border border-[#D9DFDA] shadow-soft cursor-pointer active:bg-[#ECEFEA] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[11px] font-semibold text-[#34495E] bg-[#DCE8E2] px-2 py-0.5 rounded-[4px] border border-[#D9DFDA]">
                        {item.kode_barang}
                      </span>
                      <h4 className="font-semibold text-[#2E3B40] text-[15px] mt-1.5">
                        {item.nama_barang}
                      </h4>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-[#D9DFDA] ${statusBadge.style}`}
                    >
                      {statusBadge.label} ({item.stok})
                    </span>
                  </div>

                  <p className="text-[13px] text-[#69777A] mt-1 line-clamp-1">
                    {item.spesifikasi || 'Spesifikasi standar lab'}
                  </p>

                  <div className="mt-3 pt-3 border-t border-[#DDE2DC] flex items-center justify-between text-[12px] text-[#69777A]">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#87918F]" />
                      {item.lokasi_penyimpanan}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(item);
                        }}
                        className="px-2.5 py-1 text-[12px] font-medium text-[#34495E] bg-[#DCE8E2] rounded-[6px] min-h-[36px]"
                      >
                        Detail & QR
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            onClick={(e) => handleOpenEdit(item, e)}
                            className="p-1.5 text-[#69777A] hover:bg-[#ECEFEA] rounded-[6px] min-h-[36px] min-w-[36px] flex items-center justify-center"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleOpenDelete(item, e)}
                            className="p-1.5 text-[#A95353] hover:bg-[#F2E3E1] rounded-[6px] min-h-[36px] min-w-[36px] flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
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
