'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Loan, LoanStatus } from '@/types';
import { fetchLoans } from '@/lib/db';
import { formatDate, exportToCSV } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowLeftRight,
  Search,
  PlusCircle,
  Download,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Calendar,
  User,
  Package,
  Layers,
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
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Cari peminjam, NIM, kode loan, nama barang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200/90 rounded-2xl focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 transition-all outline-none"
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

            {/* Buttons: Export CSV & Catat Pinjam */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                disabled={currentList.length === 0}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl transition-all shadow-xs disabled:opacity-40"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setIsNewLoanOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-2xl shadow-md shadow-indigo-200/60 transition-all shrink-0 active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Catat Pinjam Baru</span>
              </button>
            </div>
          </div>

          {/* Two Clean Tabs: "Sedang Dipinjam" vs "Riwayat Selesai" */}
          <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
            <button
              onClick={() => setActiveTab('ACTIVE')}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'ACTIVE'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100/80 text-slate-600 border border-slate-200/70'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Sedang Dipinjam</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  activeTab === 'ACTIVE'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200/70 text-slate-700'
                }`}
              >
                {activeLoans.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'HISTORY'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100/80 text-slate-600 border border-slate-200/70'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Riwayat Selesai</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  activeTab === 'HISTORY'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200/70 text-slate-700'
                }`}
              >
                {historyLoans.length}
              </span>
            </button>
          </div>
        </div>

        {/* Desktop Data Table */}
        <div className="hidden lg:block bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-5">Kode Peminjaman</th>
                  <th className="py-3.5 px-5">Peminjam (NIM)</th>
                  <th className="py-3.5 px-5">Barang & Jumlah</th>
                  <th className="py-3.5 px-5">Tgl Pinjam / Tenggat</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
                      <p>Memuat data transaksi...</p>
                    </td>
                  </tr>
                ) : currentList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <ArrowLeftRight className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700">
                        {activeTab === 'ACTIVE'
                          ? 'Tidak ada peminjaman aktif'
                          : 'Belum ada riwayat pengembalian'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
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
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isOverdue ? 'bg-rose-50/30' : ''
                        }`}
                      >
                        <td className="py-3.5 px-5 font-mono font-bold text-slate-800">
                          {loan.kode_peminjaman}
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Petugas: @{loan.staff_username || 'staff'}
                          </span>
                        </td>

                        <td className="py-3.5 px-5">
                          <p className="font-semibold text-slate-900">{loan.nama_peminjam}</p>
                          <p className="font-mono text-[11px] text-slate-500 mt-0.5">
                            NIM: {loan.nim_identitas}
                          </p>
                        </td>

                        <td className="py-3.5 px-5">
                          <p className="font-semibold text-slate-800">
                            {loan.item?.nama_barang || 'Barang Lab'}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded mt-0.5">
                            {loan.jumlah} Unit
                          </span>
                        </td>

                        <td className="py-3.5 px-5">
                          <p className="text-slate-600">Pinjam: {formatDate(loan.tanggal_pinjam)}</p>
                          {loan.status === 'DIPINJAM' ? (
                            <p
                              className={`text-[11px] font-semibold mt-0.5 ${
                                isOverdue ? 'text-rose-600 font-bold' : 'text-slate-500'
                              }`}
                            >
                              Tenggat: {formatDate(loan.estimasi_kembali)}
                              {isOverdue && ` (${loan.days_overdue} hari lewat)`}
                            </p>
                          ) : (
                            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                              Kembali: {formatDate(loan.tanggal_kembali_aktual)}
                            </p>
                          )}
                        </td>

                        <td className="py-4 px-5 text-center">
                          {loan.status === 'DIPINJAM' ? (
                            isOverdue ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/70 animate-pulse">
                                Terlambat
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/70">
                                Sedang Dipinjam
                              </span>
                            )
                          ) : (
                            <div className="inline-flex flex-col items-center">
                              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                                Selesai
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                                Kondisi: {loan.kondisi_kembali || 'Baik'}
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          {loan.status === 'DIPINJAM' ? (
                            <button
                              onClick={() => handleOpenReturn(loan)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-xs transition-all active:scale-95"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Proses Kembali</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
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

        {/* Stacked Touch-Friendly Cards for Mobile (< 1024px) */}
        <div className="lg:hidden space-y-3">
          {loading ? (
            <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs">Memuat data...</p>
            </div>
          ) : currentList.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
              <ArrowLeftRight className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-xs text-slate-700">Tidak ada data transaksi</p>
            </div>
          ) : (
            currentList.map((loan) => {
              const isOverdue = loan.is_overdue;

              return (
                <div
                  key={loan.id}
                  className={`bg-white p-4 rounded-2xl border shadow-card space-y-3 ${
                    isOverdue ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-slate-500 uppercase">
                        {loan.kode_peminjaman}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                        {loan.nama_peminjam}
                      </h4>
                      <p className="text-xs font-mono text-slate-500">NIM: {loan.nim_identitas}</p>
                    </div>

                    <div>
                      {loan.status === 'DIPINJAM' ? (
                        isOverdue ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Terlambat
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Dipinjam
                          </span>
                        )
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Selesai
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <p className="font-semibold text-slate-800">
                      {loan.item?.nama_barang || 'Barang Lab'}
                    </p>
                    <div className="flex items-center justify-between mt-1 text-slate-500 text-[11px]">
                      <span>Jumlah: {loan.jumlah} unit</span>
                      <span>Tenggat: {formatDate(loan.estimasi_kembali)}</span>
                    </div>
                  </div>

                  {loan.status === 'DIPINJAM' && (
                    <button
                      onClick={() => handleOpenReturn(loan)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
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
