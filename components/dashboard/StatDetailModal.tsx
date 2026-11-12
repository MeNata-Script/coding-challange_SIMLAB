'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Item, Loan } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  X,
  Search,
  Package,
  Layers,
  ArrowLeftRight,
  ClipboardList,
  ExternalLink,
  MapPin,
  MessageCircle,
} from 'lucide-react';

export type StatModalType =
  | 'total_inventory'
  | 'available_stock'
  | 'active_loans'
  | 'total_transactions'
  | null;

interface StatDetailModalProps {
  type: StatModalType;
  items: Item[];
  loans: Loan[];
  onClose: () => void;
}

const STAT_CONFIGS = {
  total_inventory: {
    title: 'Daftar Seluruh Inventaris Barang',
    subtitle: 'Katalog seluruh perangkat dan komponen laboratorium yang terdaftar',
    icon: Package,
    iconColor: 'text-[#527493] bg-[#E3EAF0]',
    linkHref: '/inventory',
    linkLabel: 'Buka Halaman Inventaris Lengkap',
    isItem: true,
  },
  available_stock: {
    title: 'Daftar Barang Siap Pakai (Tersedia)',
    subtitle: 'Inventaris laboratorium dengan stok fisik tersedia (> 0 unit)',
    icon: Layers,
    iconColor: 'text-[#548C75] bg-[#E1EDE4]',
    linkHref: '/inventory',
    linkLabel: 'Kelola Stok di Inventaris',
    isItem: true,
  },
  active_loans: {
    title: 'Daftar Peminjaman Aktif',
    subtitle: 'Barang yang saat ini sedang dipinjam mahasiswa dan belum dikembalikan',
    icon: ArrowLeftRight,
    iconColor: 'text-[#9A7137] bg-[#F2EBDD]',
    linkHref: '/loans',
    linkLabel: 'Buka Manajemen Peminjaman',
    isItem: false,
  },
  total_transactions: {
    title: 'Daftar Riwayat Seluruh Transaksi',
    subtitle: 'Akumulasi log sirkulasi peminjaman laboratorium (Aktif & Selesai)',
    icon: ClipboardList,
    iconColor: 'text-[#34495E] bg-[#DCE8E2]',
    linkHref: '/loans',
    linkLabel: 'Lihat Semua di Halaman Transaksi',
    isItem: false,
  },
};

export default function StatDetailModal({
  type,
  items = [],
  loans = [],
  onClose,
}: StatDetailModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const config = type ? STAT_CONFIGS[type] : null;

  // Filter items or loans based on card type and search query - Hook called unconditionally
  const filteredData = useMemo(() => {
    if (!type || !config) return [];
    const q = (searchQuery || '').toLowerCase().trim();

    if (config.isItem) {
      let base = items || [];
      if (type === 'available_stock') {
        base = base.filter((i) => i && Number(i.stok) > 0);
      }
      if (!q) return base;
      return base.filter(
        (i) =>
          (i.nama_barang && i.nama_barang.toLowerCase().includes(q)) ||
          (i.kode_barang && i.kode_barang.toLowerCase().includes(q)) ||
          (i.kategori && i.kategori.toLowerCase().includes(q)) ||
          (i.lokasi_penyimpanan && i.lokasi_penyimpanan.toLowerCase().includes(q))
      );
    } else {
      let base = loans || [];
      if (type === 'active_loans') {
        base = base.filter((l) => l && l.status === 'DIPINJAM');
      }
      if (!q) return base;
      return base.filter(
        (l) =>
          (l.kode_peminjaman && l.kode_peminjaman.toLowerCase().includes(q)) ||
          (l.nama_peminjam && l.nama_peminjam.toLowerCase().includes(q)) ||
          (l.nim_identitas && l.nim_identitas.toLowerCase().includes(q)) ||
          (l.alamat_peminjam && l.alamat_peminjam.toLowerCase().includes(q)) ||
          (l.kontak_peminjam && l.kontak_peminjam.toLowerCase().includes(q)) ||
          (l.item?.nama_barang && l.item.nama_barang.toLowerCase().includes(q))
      );
    }
  }, [type, config, items, loans, searchQuery]);

  // Safe early exit AFTER hooks have run
  if (!type || !config) return null;

  const IconComponent = config.icon;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#2E3B40]/60 backdrop-blur-xs p-3 sm:p-4 flex items-center justify-center animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#F4F5F1] rounded-[16px] shadow-2xl border border-[#D9DFDA] w-full max-w-4xl max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] my-auto flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#E2E9E3] border-b border-[#D9DFDA] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 ${config.iconColor}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#2E3B40] text-base leading-snug">
                {config.title}
              </h3>
              <p className="text-xs text-[#69777A]">
                {config.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[10px] text-[#69777A] hover:text-[#2E3B40] hover:bg-[#DCE8E2] transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar & filter status */}
        <div className="p-4 border-b border-[#DDE2DC] bg-[#ECEFEA] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#87918F]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder={config.isItem ? "Cari nama barang, kode, kategori, atau lokasi..." : "Cari peminjam, NIM, alamat, kontak, atau barang..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#E9ECE7] border border-[#D9DFDA] rounded-[10px] text-[#344047] placeholder:text-[#87918F] focus:border-[#34495E] focus:outline-none focus:ring-1 focus:ring-[#34495E] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-[#87918F] hover:text-[#344047]"
              >
                Clear
              </button>
            )}
          </div>

          <div className="text-xs text-[#69777A] flex items-center gap-2 self-end sm:self-center font-medium">
            <span>Ditemukan:</span>
            <span className="font-bold text-[#2E3B40] bg-[#DCE8E2] px-2 py-0.5 rounded-[6px]">
              {filteredData.length} {config.isItem ? 'Item' : 'Transaksi'}
            </span>
          </div>
        </div>

        {/* Content Body: Scrollable Table / List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredData.length === 0 ? (
            <div className="p-12 text-center text-[#69777A] bg-[#F4F5F1] rounded-[10px] border border-[#D9DFDA]">
              <IconComponent className="w-10 h-10 text-[#87918F] mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-sm text-[#2E3B40]">Tidak ada data ditemukan</p>
              <p className="text-xs text-[#87918F] mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
            </div>
          ) : config.isItem ? (
            /* Items List (Table for Desktop, Cards for Mobile) */
            <>
              <div className="hidden md:block overflow-x-auto rounded-[10px] border border-[#D9DFDA]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#E2E9E3] border-b border-[#D9DFDA] text-[#69777A] font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-4">Barang</th>
                      <th className="py-2.5 px-4">Kategori</th>
                      <th className="py-2.5 px-4">Lokasi</th>
                      <th className="py-2.5 px-4 text-center">Stok Fisik</th>
                      <th className="py-2.5 px-4 text-center">Kondisi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE2DC] bg-[#F4F5F1]">
                    {(filteredData as Item[]).map((item) => (
                      <tr key={item.id} className="hover:bg-[#ECEFEA] transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-[#2E3B40]">{item.nama_barang}</p>
                          <p className="font-mono text-[11px] text-[#69777A]">{item.kode_barang}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-[6px] text-[11px] font-semibold bg-[#DCE8E2] text-[#34495E] border border-[#D9DFDA]">
                            {item.kategori}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#69777A]">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#87918F] shrink-0" />
                            <span>{item.lokasi_penyimpanan}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`font-bold text-xs px-2.5 py-0.5 rounded-full ${
                              item.stok > 2
                                ? 'bg-[#E1EDE4] text-[#548C75]'
                                : item.stok > 0
                                ? 'bg-[#F2EBDD] text-[#9A7137]'
                                : 'bg-[#F2E3E1] text-[#A95353]'
                            }`}
                          >
                            {item.stok} unit
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-[11px] font-medium text-[#344047]">
                            {item.kondisi}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="md:hidden space-y-2.5">
                {(filteredData as Item[]).map((item) => (
                  <div key={item.id} className="p-3 bg-[#F4F5F1] rounded-[10px] border border-[#D9DFDA] space-y-1.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-[#2E3B40]">{item.nama_barang}</h4>
                        <p className="font-mono text-xs text-[#69777A]">{item.kode_barang}</p>
                      </div>
                      <span
                        className={`font-bold text-xs px-2 py-0.5 rounded-full ${
                          item.stok > 2
                            ? 'bg-[#E1EDE4] text-[#548C75]'
                            : item.stok > 0
                            ? 'bg-[#F2EBDD] text-[#9A7137]'
                            : 'bg-[#F2E3E1] text-[#A95353]'
                        }`}
                      >
                        {item.stok} unit
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#69777A] pt-1 border-t border-[#DDE2DC]">
                      <span>{item.kategori}</span>
                      <span>{item.lokasi_penyimpanan}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Loans List (Table for Desktop, Cards for Mobile) */
            <>
              <div className="hidden md:block overflow-x-auto rounded-[10px] border border-[#D9DFDA]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#E2E9E3] border-b border-[#D9DFDA] text-[#69777A] font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-4">Peminjaman</th>
                      <th className="py-2.5 px-4">Peminjam</th>
                      <th className="py-2.5 px-4">Barang</th>
                      <th className="py-2.5 px-4 text-center">Jumlah</th>
                      <th className="py-2.5 px-4">Estimasi Kembali</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE2DC] bg-[#F4F5F1]">
                    {(filteredData as Loan[]).map((loan) => {
                      const cleanPhone = typeof loan.kontak_peminjam === 'string'
                        ? loan.kontak_peminjam.replace(/[^0-9]/g, '').replace(/^0/, '62')
                        : '';

                      return (
                        <tr key={loan.id} className="hover:bg-[#ECEFEA] transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-[#344047]">{loan.kode_peminjaman}</span>
                            <p className="text-[11px] text-[#87918F]">{formatDate(loan.tanggal_pinjam)}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-[#2E3B40]">{loan.nama_peminjam}</p>
                            <p className="font-mono text-[11px] text-[#69777A]">NIM: {loan.nim_identitas}</p>
                            <div className="flex items-start gap-1 text-[10px] text-[#69777A] mt-0.5 max-w-[200px]">
                              <MapPin className="w-2.5 h-2.5 text-[#87918F] shrink-0 mt-0.5" />
                              <span className="truncate" title={loan.alamat_peminjam}>
                                {loan.alamat_peminjam || 'Alamat sesuai kartu identitas'}
                              </span>
                            </div>
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Halo ${loan.nama_peminjam}, kami dari SIMLAB mengenai peminjaman alat ${loan.item?.nama_barang || 'lab'} (${loan.kode_peminjaman})...`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-[#548C75] bg-[#E1EDE4] hover:bg-[#D5E6D9] px-1.5 py-0.5 rounded border border-[#548C75]/20 font-semibold mt-1"
                              >
                                <MessageCircle className="w-2.5 h-2.5" />
                                <span>{loan.kontak_peminjam}</span>
                              </a>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-[#2E3B40]">{loan.item?.nama_barang || 'Barang Lab'}</p>
                            <p className="text-[11px] text-[#87918F]">{loan.item?.kategori}</p>
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-[#344047]">
                            {loan.jumlah} unit
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${loan.is_overdue ? 'text-[#A95353] font-bold' : 'text-[#69777A]'}`}>
                              {formatDate(loan.estimasi_kembali)}
                            </span>
                            {loan.is_overdue && (
                              <span className="block text-[10px] text-[#A95353] font-bold">Terlambat!</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {loan.status === 'DIPINJAM' ? (
                              <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                  loan.is_overdue
                                    ? 'bg-[#F2E3E1] text-[#A95353] border-[#A95353]/30'
                                    : 'bg-[#F2EBDD] text-[#9A7137] border-[#9A7137]/30'
                                }`}
                              >
                                {loan.is_overdue ? 'TERLAMBAT' : 'DIPINJAM'}
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E1EDE4] text-[#548C75] border border-[#548C75]/30">
                                SELESAI
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List for Loans */}
              <div className="md:hidden space-y-2.5">
                {(filteredData as Loan[]).map((loan) => {
                  const cleanPhone = typeof loan.kontak_peminjam === 'string'
                    ? loan.kontak_peminjam.replace(/[^0-9]/g, '').replace(/^0/, '62')
                    : '';

                  return (
                    <div key={loan.id} className="p-3 bg-[#F4F5F1] rounded-[10px] border border-[#D9DFDA] space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono font-bold text-xs text-[#344047]">{loan.kode_peminjaman}</span>
                          <h4 className="font-bold text-sm text-[#2E3B40] mt-0.5">{loan.nama_peminjam}</h4>
                          <p className="text-xs text-[#69777A]">{loan.item?.nama_barang || 'Barang Lab'} ({loan.jumlah} unit)</p>
                          <div className="flex items-start gap-1 text-[11px] text-[#69777A] mt-0.5">
                            <MapPin className="w-3 h-3 text-[#87918F] shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{loan.alamat_peminjam || 'Alamat sesuai identitas'}</span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            loan.status === 'SELESAI'
                              ? 'bg-[#E1EDE4] text-[#548C75] border-[#548C75]/30'
                              : loan.is_overdue
                              ? 'bg-[#F2E3E1] text-[#A95353] border-[#A95353]/30'
                              : 'bg-[#F2EBDD] text-[#9A7137] border-[#9A7137]/30'
                          }`}
                        >
                          {loan.is_overdue ? 'TERLAMBAT' : loan.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#69777A] pt-1.5 border-t border-[#DDE2DC]">
                        <span>Pinjam: {formatDate(loan.tanggal_pinjam)}</span>
                        <span className={loan.is_overdue ? 'text-[#A95353] font-bold' : ''}>
                          Kembali: {formatDate(loan.estimasi_kembali)}
                        </span>
                      </div>

                      {cleanPhone && (
                        <div className="pt-1 flex items-center justify-between text-[11px]">
                          <span className="text-[#87918F]">Kontak Peminjam:</span>
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Halo ${loan.nama_peminjam}, kami dari SIMLAB mengenai peminjaman alat ${loan.item?.nama_barang || 'lab'}...`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-[#548C75] bg-[#E1EDE4] px-2 py-0.5 rounded-[4px] border border-[#548C75]/20"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>WA: {loan.kontak_peminjam}</span>
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#E2E9E3] border-t border-[#D9DFDA] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
          <p className="text-xs text-[#69777A]">
            Klik tombol di samping untuk membuka modul halaman penuh.
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#34495E] bg-[#DCE8E2] hover:bg-[#CEDDD5] rounded-[10px] transition-colors"
            >
              Tutup
            </button>
            <Link
              href={config.linkHref}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#F4F5F1] bg-[#34495E] hover:bg-[#293B4D] rounded-[10px] shadow-sm transition-colors"
            >
              <span>{config.linkLabel}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
