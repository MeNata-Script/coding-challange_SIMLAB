'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Loan } from '@/types';
import { fetchLoans } from '@/lib/db';
import { formatDate, exportToCSV } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowLeftRight,
  Search,
  PlusCircle,
  Clock,
  CheckCircle2,
  RotateCcw,
  FileSpreadsheet,
} from 'lucide-react';
import NewLoanModal from '@/components/loans/NewLoanModal';
import ReturnModal from '@/components/loans/ReturnModal';

export default function LoansPage() {
  const { user } = useAuth();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isNewLoanOpen, setIsNewLoanOpen] = useState(false);
  const [returnLoan, setReturnLoan] = useState<Loan | null>(null);
  const [isReturnOpen, setIsReturnOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchLoans();
      setLoans(data);
    } catch (e) {
      console.error('Failed to load loans:', e);
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

  // Separate Active and Completed Loans
  const activeLoans = useMemo(() => {
    const list = loans.filter((l) => l.status === 'DIPINJAM');
    // Sort overdue to the very top, then by estimasi_kembali ascending
    return list.sort((a, b) => {
      if (a.is_overdue && !b.is_overdue) return -1;
      if (!a.is_overdue && b.is_overdue) return 1;
      return new Date(a.estimasi_kembali).getTime() - new Date(b.estimasi_kembali).getTime();
    });
  }, [loans]);

  const historyLoans = useMemo(() => {
    const list = loans.filter((l) => l.status === 'SELESAI');
    return list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }, [loans]);

  // Filtered by search
  const currentList = useMemo(() => {
    const base = activeTab === 'ACTIVE' ? activeLoans : historyLoans;
    if (!searchQuery.trim()) return base;

    const q = searchQuery.toLowerCase();
    return base.filter(
      (l) =>
        l.nama_peminjam.toLowerCase().includes(q) ||
        l.nim_identitas.toLowerCase().includes(q) ||
        l.kode_peminjaman.toLowerCase().includes(q) ||
        (l.item?.nama_barang && l.item.nama_barang.toLowerCase().includes(q)) ||
        (l.item?.kode_barang && l.item.kode_barang.toLowerCase().includes(q))
    );
  }, [activeTab, activeLoans, historyLoans, searchQuery]);

  const handleOpenReturn = (loan: Loan) => {
    setReturnLoan(loan);
    setIsReturnOpen(true);
  };

  const handleExportCSV = () => {
    const dataToExport = currentList.map((l) => ({
      'Kode Peminjaman': l.kode_peminjaman,
      'Nama Peminjam': l.nama_peminjam,
      'NIM / Identitas': l.nim_identitas,
      'Kode Barang': l.item?.kode_barang || '-',
      'Nama Barang': l.item?.nama_barang || '-',
      'Jumlah': l.jumlah,
      'Tanggal Pinjam': l.tanggal_pinjam,
      'Estimasi Kembali': l.estimasi_kembali,
      'Tanggal Kembali Aktual': l.tanggal_kembali_aktual || '-',
      'Status': l.status,
      'Kondisi Kembali': l.kondisi_kembali || '-',
      'Catatan': l.catatan || '-',
      'Catatan Kembali': l.catatan_kembali || '-',
      'Petugas': l.staff_username || '-',
    }));

    const filename = `Laporan_Peminjaman_Lab_${activeTab === 'ACTIVE' ? 'Aktif' : 'Riwayat'}_${new Date().toISOString().split('T')[0]}`;
    exportToCSV(filename, dataToExport);
  };

  return (
    <AppLayout
      title="Peminjaman & Pengembalian"
      subtitle="Manajemen alur sirkulasi peminjaman perangkat laboratorium"
    >
      <div className="space-y-5">
        {/* Controls: Search, Tabs, Export, New Loan */}
        <div className="bg-[#F4F5F1] p-5 rounded-[14px] border border-[#D9DFDA] shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#87918F]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Cari peminjam, NIM, kode loan, nama barang..."
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

            {/* Buttons: Export CSV & Catat Pinjam */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                disabled={currentList.length === 0}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-[14px] font-medium text-[#34495E] bg-[#DCE8E2] hover:bg-[#C8DBD3] border border-[#D9DFDA] rounded-[10px] transition-colors shadow-xs disabled:opacity-40"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#648F87]" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setIsNewLoanOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-[14px] font-medium text-[#F4F5F1] bg-[#34495E] hover:bg-[#293B4D] rounded-[10px] transition-colors shrink-0 shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Catat Pinjam Baru</span>
              </button>
            </div>
          </div>

          {/* Two Clean Tabs: "Sedang Dipinjam" vs "Riwayat Selesai" */}
          <div className="flex items-center gap-2 border-t border-[#DDE2DC] pt-3">
            <button
              onClick={() => setActiveTab('ACTIVE')}
              className={`px-3.5 py-1.5 rounded-[8px] text-[13px] font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'ACTIVE'
                  ? 'bg-[#34495E] text-[#F4F5F1]'
                  : 'bg-[#E2E9E3] hover:bg-[#ECEFEA] text-[#344047] border border-[#D9DFDA]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Sedang Dipinjam</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                  activeTab === 'ACTIVE'
                    ? 'bg-[#293B4D] text-[#DCE8E2]'
                    : 'bg-[#CBD4CD] text-[#2E3B40]'
                }`}
              >
                {activeLoans.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`px-3.5 py-1.5 rounded-[8px] text-[13px] font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'HISTORY'
                  ? 'bg-[#34495E] text-[#F4F5F1]'
                  : 'bg-[#E2E9E3] hover:bg-[#ECEFEA] text-[#344047] border border-[#D9DFDA]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Riwayat Selesai</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                  activeTab === 'HISTORY'
                    ? 'bg-[#293B4D] text-[#DCE8E2]'
                    : 'bg-[#CBD4CD] text-[#2E3B40]'
                }`}
              >
                {historyLoans.length}
              </span>
            </button>
          </div>
        </div>

        {/* Desktop Data Table */}
        <div className="hidden lg:block bg-[#F4F5F1] rounded-[14px] border border-[#D9DFDA] shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#E2E9E3] border-b border-[#D9DFDA] text-[12px] font-semibold text-[#2E3B40]">
                  <th className="py-3.5 px-5">Kode Peminjaman</th>
                  <th className="py-3.5 px-5">Peminjam (NIM)</th>
                  <th className="py-3.5 px-5">Barang & Jumlah</th>
                  <th className="py-3.5 px-5">Tgl Pinjam / Tenggat</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE2DC] text-[14px]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#87918F]">
                      <div className="inline-block w-6 h-6 border-2 border-[#34495E] border-t-transparent rounded-full animate-spin mb-2" />
                      <p className="text-[13px]">Memuat data transaksi...</p>
                    </td>
                  </tr>
                ) : currentList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#69777A]">
                      <ArrowLeftRight className="w-8 h-8 text-[#87918F] mx-auto mb-2" />
                      <p className="font-semibold text-[#2E3B40] text-[14px]">
                        {activeTab === 'ACTIVE'
                          ? 'Tidak ada peminjaman aktif'
                          : 'Belum ada riwayat pengembalian'}
                      </p>
                      <p className="text-[12px] text-[#87918F] mt-0.5">
                        {activeTab === 'ACTIVE'
                          ? 'Semua barang saat ini tersedia di ruang laboratorium.'
                          : 'Transaksi yang telah selesai akan muncul di sini.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentList.map((loan) => {
                    const isOverdue = loan.is_overdue;

                    return (
                      <tr
                        key={loan.id}
                        className={`hover:bg-[#ECEFEA] transition-colors ${
                          isOverdue ? 'bg-[#F2E3E1]/40' : ''
                        }`}
                      >
                        <td className="py-3.5 px-5 font-mono font-semibold text-[#34495E] text-[13px]">
                          {loan.kode_peminjaman}
                          <span className="block text-[11px] text-[#87918F] font-normal">
                            Petugas: @{loan.staff_username || 'staff'}
                          </span>
                        </td>

                        <td className="py-3.5 px-5">
                          <p className="font-medium text-[#2E3B40]">{loan.nama_peminjam}</p>
                          <p className="font-mono text-[12px] text-[#69777A] mt-0.5">
                            NIM: {loan.nim_identitas}
                          </p>
                        </td>

                        <td className="py-3.5 px-5">
                          <p className="font-medium text-[#2E3B40]">
                            {loan.item?.nama_barang || 'Barang Lab'}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#34495E] bg-[#DCE8E2] px-2 py-0.5 rounded-[4px] border border-[#D9DFDA] mt-0.5">
                            {loan.jumlah} Unit
                          </span>
                        </td>

                        <td className="py-3.5 px-5 text-[13px]">
                          <p className="text-[#344047]">Pinjam: {formatDate(loan.tanggal_pinjam)}</p>
                          {loan.status === 'DIPINJAM' ? (
                            <p
                              className={`text-[12px] font-medium mt-0.5 ${
                                isOverdue ? 'text-[#A95353] font-semibold' : 'text-[#69777A]'
                              }`}
                            >
                              Tenggat: {formatDate(loan.estimasi_kembali)}
                              {isOverdue && ` (${loan.days_overdue} hari lewat)`}
                            </p>
                          ) : (
                            <p className="text-[12px] text-[#548C75] font-medium mt-0.5">
                              Kembali: {formatDate(loan.tanggal_kembali_aktual)}
                            </p>
                          )}
                        </td>

                        <td className="py-3.5 px-5 text-center">
                          {loan.status === 'DIPINJAM' ? (
                            isOverdue ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F2E3E1] text-[#A95353] border border-[#D9DFDA]">
                                Terlambat
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F2EBDD] text-[#9A7137] border border-[#D9DFDA]">
                                Sedang Dipinjam
                              </span>
                            )
                          ) : (
                            <div className="inline-flex flex-col items-center">
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E1EDE4] text-[#548C75] border border-[#D9DFDA]">
                                Selesai
                              </span>
                              <span className="text-[11px] text-[#69777A] font-medium mt-0.5">
                                Kondisi: {loan.kondisi_kembali || 'Baik'}
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          {loan.status === 'DIPINJAM' ? (
                            <button
                              onClick={() => handleOpenReturn(loan)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-[#34495E] bg-[#DCE8E2] hover:bg-[#C8DBD3] border border-[#D9DFDA] rounded-[8px] transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Proses Kembali</span>
                            </button>
                          ) : (
                            <span className="text-[12px] text-[#87918F] italic">
                              {loan.catatan_kembali ? `"${loan.catatan_kembali}"` : 'Selesai'}
                            </span>
                          )}
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
              <p className="text-[13px]">Memuat data...</p>
            </div>
          ) : currentList.length === 0 ? (
            <div className="p-8 text-center text-[#69777A] bg-[#F4F5F1] rounded-[14px] border border-[#D9DFDA]">
              <ArrowLeftRight className="w-8 h-8 text-[#87918F] mx-auto mb-2" />
              <p className="font-semibold text-[13px] text-[#2E3B40]">Tidak ada data transaksi</p>
            </div>
          ) : (
            currentList.map((loan) => {
              const isOverdue = loan.is_overdue;

              return (
                <div
                  key={loan.id}
                  className={`bg-[#F4F5F1] p-4 rounded-[14px] border shadow-soft space-y-3 ${
                    isOverdue ? 'border-[#A95353]/50 bg-[#F2E3E1]/20' : 'border-[#D9DFDA]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[11px] font-semibold text-[#34495E] uppercase bg-[#DCE8E2] px-2 py-0.5 rounded-[4px] border border-[#D9DFDA]">
                        {loan.kode_peminjaman}
                      </span>
                      <h4 className="font-semibold text-[#2E3B40] text-[15px] mt-1">
                        {loan.nama_peminjam}
                      </h4>
                      <p className="text-[12px] font-mono text-[#69777A]">NIM: {loan.nim_identitas}</p>
                    </div>

                    <div>
                      {loan.status === 'DIPINJAM' ? (
                        isOverdue ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F2E3E1] text-[#A95353] border border-[#D9DFDA]">
                            Terlambat
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F2EBDD] text-[#9A7137] border border-[#D9DFDA]">
                            Dipinjam
                          </span>
                        )
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E1EDE4] text-[#548C75] border border-[#D9DFDA]">
                          Selesai
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-[10px] bg-[#ECEFEA] border border-[#D9DFDA] text-[13px]">
                    <p className="font-medium text-[#2E3B40]">
                      {loan.item?.nama_barang || 'Barang Lab'}
                    </p>
                    <div className="flex items-center justify-between mt-1 text-[#69777A] text-[12px]">
                      <span>Jumlah: {loan.jumlah} unit</span>
                      <span>Tenggat: {formatDate(loan.estimasi_kembali)}</span>
                    </div>
                  </div>

                  {loan.status === 'DIPINJAM' && (
                    <button
                      onClick={() => handleOpenReturn(loan)}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 text-[13px] font-medium text-[#34495E] bg-[#DCE8E2] hover:bg-[#C8DBD3] border border-[#D9DFDA] rounded-[8px] transition-colors min-h-[44px]"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Proses Pengembalian Barang</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* New Loan Modal */}
      <NewLoanModal
        isOpen={isNewLoanOpen}
        onClose={() => setIsNewLoanOpen(false)}
        onSuccess={() => {
          loadData();
        }}
      />

      {/* Return Loan Modal */}
      <ReturnModal
        isOpen={isReturnOpen}
        loan={returnLoan}
        onClose={() => setIsReturnOpen(false)}
        onSuccess={() => {
          loadData();
        }}
      />
    </AppLayout>
  );
}
