'use client';

import React, { useEffect, useState, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { DashboardStats, Loan, Item, AuditLog } from '@/types';
import { fetchDashboardStats, fetchLoans, fetchAuditLogs, fetchItems } from '@/lib/db';
import { formatDate, formatDateTime } from '@/lib/utils';
import Link from 'next/link';
import {
  Package,
  Layers,
  ArrowLeftRight,
  ClipboardList,
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowUpRight,
  TrendingUp,
  RotateCcw,
  ShieldCheck,
  User,
} from 'lucide-react';
import NewLoanModal from '@/components/loans/NewLoanModal';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLoans, setRecentLoans] = useState<Loan[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, loansData, logsData, itemsData] = await Promise.all([
        fetchDashboardStats(),
        fetchLoans(),
        fetchAuditLogs(),
        fetchItems(),
      ]);

      setStats(statsData);
      setRecentLoans(loansData.slice(0, 5));
      setAuditLogs(logsData.slice(0, 5));
      setLowStockItems(itemsData.filter((i) => i.stok < 3));
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
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

  const overdueLoans = recentLoans.filter((l) => l.is_overdue);

  return (
    <AppLayout
      title="Dashboard Utama"
      subtitle="Ringkasan operasional dan status inventaris laboratorium"
    >
      <div className="space-y-6">
        {/* Top Quick Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">Selamat Bekerja!</h2>
            <p className="text-xs text-slate-500">
              Kelola stok inventaris dan peminjaman alat laboratorium dengan mudah.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/inventory"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
            >
              <Package className="w-4 h-4 text-slate-500" />
              <span>Daftar Barang</span>
            </Link>
            <button
              onClick={() => setIsLoanModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm hover:shadow transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Catat Pinjam Baru</span>
            </button>
          </div>
        </div>

        {/* Value-Add "Perlu Perhatian" Alert Banner */}
        {((stats && stats.overdueLoansCount > 0) || (lowStockItems && lowStockItems.length > 0)) && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Perlu Perhatian Laboratorium</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                    Penting
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {stats && stats.overdueLoansCount > 0 && (
                    <span className="font-semibold text-rose-700 mr-2">
                      • {stats.overdueLoansCount} peminjaman melewati batas pengembalian (Overdue).
                    </span>
                  )}
                  {lowStockItems.length > 0 && (
                    <span className="font-medium text-amber-800">
                      • {lowStockItems.length} barang inventaris memiliki stok kritis (&lt; 3 unit).
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/loans"
                className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-white border border-rose-200 rounded-xl hover:bg-rose-50 transition-colors shadow-xs"
              >
                Cek Peminjaman
              </Link>
              <Link
                href="/inventory"
                className="px-3 py-1.5 text-xs font-bold text-amber-800 bg-white border border-amber-200 rounded-xl hover:bg-amber-50 transition-colors shadow-xs"
              >
                Cek Stok Kritis
              </Link>
            </div>
          </div>
        )}

        {/* 4 Key Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Jenis Barang */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Jenis Barang
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {loading ? '...' : stats?.totalJenisBarang || 0}
              </span>
              <span className="text-xs font-medium text-slate-500">Katalog</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Total item terdaftar di lab</p>
          </div>

          {/* Card 2: Total Stok Tersedia */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Stok Siap Pakai
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
                {loading ? '...' : stats?.totalStokTersedia || 0}
              </span>
              <span className="text-xs font-medium text-slate-500">Unit</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Tersedia untuk dipinjam</p>
          </div>

          {/* Card 3: Sedang Dipinjam */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Sedang Dipinjam
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
                {loading ? '...' : stats?.sedangDipinjam || 0}
              </span>
              <span className="text-xs font-medium text-slate-500">Unit</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Sedang aktif di luar lab</p>
          </div>

          {/* Card 4: Total Transaksi Peminjaman */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Transaksi
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ClipboardList className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {loading ? '...' : stats?.totalTransaksiPeminjaman || 0}
              </span>
              <span className="text-xs font-medium text-slate-500">Log</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Akumulasi sirkulasi peminjaman</p>
          </div>
        </div>

        {/* Visual Category / Status Breakdown Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Distribusi Kategori Inventaris</h3>
              <p className="text-xs text-slate-500">
                Porsi ketersediaan stok fisik per divisi perangkat laboratorium
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
              {stats?.categoryBreakdown.length || 0} Kategori
            </span>
          </div>

          {/* Progress Multi-Bar */}
          <div className="space-y-4">
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              {stats?.categoryBreakdown.map((cat, idx) => {
                const colors = [
                  'bg-indigo-600',
                  'bg-blue-500',
                  'bg-emerald-500',
                  'bg-amber-500',
                  'bg-purple-500',
                  'bg-rose-500',
                ];
                const totalStock = stats.totalStokTersedia || 1;
                const percentage = Math.round((cat.totalStok / totalStock) * 100);
                if (percentage === 0) return null;

                return (
                  <div
                    key={cat.kategori}
                    style={{ width: `${percentage}%` }}
                    className={`${colors[idx % colors.length]} transition-all duration-500 hover:opacity-90`}
                    title={`${cat.kategori}: ${cat.totalStok} unit (${percentage}%)`}
                  />
                );
              })}
            </div>

            {/* Legend Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
              {stats?.categoryBreakdown.map((cat, idx) => {
                const dotColors = [
                  'bg-indigo-600',
                  'bg-blue-500',
                  'bg-emerald-500',
                  'bg-amber-500',
                  'bg-purple-500',
                  'bg-rose-500',
                ];
                return (
                  <div
                    key={cat.kategori}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${dotColors[idx % dotColors.length]}`} />
                      <span className="text-xs font-semibold text-slate-700">{cat.kategori}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-900">
                      {cat.totalStok} <span className="text-[10px] font-normal text-slate-400">unit</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2-Column Section: Recent Loans & Audit Log Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1: Recent Loans */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Peminjaman Terbaru</h3>
              </div>
              <Link
                href="/loans"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3 flex-1">
              {recentLoans.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  Belum ada transaksi peminjaman.
                </div>
              ) : (
                recentLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white transition-all flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">
                        {loan.nama_peminjam}{' '}
                        <span className="text-slate-400 font-normal">({loan.nim_identitas})</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {loan.item?.nama_barang || 'Barang'} • {loan.jumlah} unit
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      {loan.status === 'DIPINJAM' ? (
                        loan.is_overdue ? (
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
                      <p className="text-[10px] text-slate-400 mt-1">
                        {formatDate(loan.tanggal_pinjam)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2: Audit Logs Feed */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Aktivitas Sistem & Audit</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Log Keamanan</span>
            </div>

            <div className="space-y-3 flex-1">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  Belum ada log aktivitas.
                </div>
              ) : (
                auditLogs.map((log) => {
                  const actionMap: Record<string, { label: string; color: string }> = {
                    PINJAM_BARANG: { label: 'Peminjaman', color: 'bg-amber-100 text-amber-800' },
                    KEMBALIKAN_BARANG: { label: 'Pengembalian', color: 'bg-emerald-100 text-emerald-800' },
                    TAMBAH_BARANG: { label: 'Tambah Barang', color: 'bg-indigo-100 text-indigo-800' },
                    UPDATE_BARANG: { label: 'Edit Barang', color: 'bg-blue-100 text-blue-800' },
                    HAPUS_BARANG: { label: 'Hapus Barang', color: 'bg-rose-100 text-rose-800' },
                    TAMBAH_STAFF: { label: 'Tambah Staff', color: 'bg-purple-100 text-purple-800' },
                    INIT_SYSTEM: { label: 'Inisialisasi', color: 'bg-slate-200 text-slate-700' },
                  };

                  const badge = actionMap[log.action] || {
                    label: log.action,
                    color: 'bg-slate-100 text-slate-700',
                  };

                  return (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-800">@{log.actor_username}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${badge.color}`}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {log.details?.barang || log.details?.peminjam || log.details?.message || log.target_type}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 whitespace-nowrap mt-0.5">
                        {formatDateTime(log.created_at)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Loan Modal Trigger */}
      <NewLoanModal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        onSuccess={() => {
          loadData();
        }}
      />
    </AppLayout>
  );
}
