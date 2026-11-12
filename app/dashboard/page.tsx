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
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-indigo-50/80 via-purple-50/40 to-pink-50/40 p-5 rounded-3xl border border-indigo-100/70 shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Selamat Bekerja!</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200/60">
                SIMLAB Lab Komputasi
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola ketersediaan alat, sirkulasi peminjaman, dan status kondisi laboratorium secara real-time.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/inventory"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white/90 hover:bg-white border border-slate-200/80 rounded-2xl transition-all shadow-xs"
            >
              <Package className="w-4 h-4 text-slate-500" />
              <span>Daftar Barang</span>
            </Link>
            <button
              onClick={() => setIsLoanModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-2xl shadow-md shadow-indigo-200/60 hover:shadow transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Catat Pinjam Baru</span>
            </button>
          </div>
        </div>

        {/* Value-Add "Perlu Perhatian" Alert Banner */}
        {((stats && stats.overdueLoansCount > 0) || (lowStockItems && lowStockItems.length > 0)) && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-50/90 via-rose-50/70 to-pink-50/50 border border-amber-200/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-amber-100/80 text-amber-800 rounded-2xl shrink-0 mt-0.5 shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Perlu Perhatian Laboratorium</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100/90 text-rose-700 border border-rose-200/60">
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
                className="px-3.5 py-1.5 text-xs font-bold text-rose-700 bg-white/90 border border-rose-200/80 rounded-xl hover:bg-rose-50 transition-colors shadow-xs"
              >
                Cek Peminjaman
              </Link>
              <Link
                href="/inventory"
                className="px-3.5 py-1.5 text-xs font-bold text-amber-800 bg-white/90 border border-amber-200/80 rounded-xl hover:bg-amber-50 transition-colors shadow-xs"
              >
                Cek Stok Kritis
              </Link>
            </div>
          </div>
        )}

        {/* 4 Key Metric Cards (Soft Pastel Design) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Jenis Barang */}
          <div className="bg-gradient-to-br from-white to-indigo-50/40 p-5 rounded-3xl border border-indigo-100/70 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Jenis Barang
              </span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-100/70 text-indigo-700 flex items-center justify-center shadow-xs">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {loading ? '...' : stats?.totalJenisBarang || 0}
              </span>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Katalog</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Total item terdaftar di lab</p>
          </div>

          {/* Card 2: Total Stok Tersedia */}
          <div className="bg-gradient-to-br from-white to-emerald-50/40 p-5 rounded-3xl border border-emerald-100/70 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Stok Siap Pakai
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center shadow-xs">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
                {loading ? '...' : stats?.totalStokTersedia || 0}
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Unit Siap</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Tersedia untuk dipinjam</p>
          </div>

          {/* Card 3: Sedang Dipinjam */}
          <div className="bg-gradient-to-br from-white to-amber-50/40 p-5 rounded-3xl border border-amber-100/70 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Sedang Dipinjam
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-100/70 text-amber-700 flex items-center justify-center shadow-xs">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
                {loading ? '...' : stats?.sedangDipinjam || 0}
              </span>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">Aktif</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Sedang aktif di luar lab</p>
          </div>

          {/* Card 4: Total Transaksi Peminjaman */}
          <div className="bg-gradient-to-br from-white to-purple-50/40 p-5 rounded-3xl border border-purple-100/70 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Transaksi
              </span>
              <div className="w-10 h-10 rounded-2xl bg-purple-100/70 text-purple-700 flex items-center justify-center shadow-xs">
                <ClipboardList className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {loading ? '...' : stats?.totalTransaksiPeminjaman || 0}
              </span>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">Sirkulasi</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Akumulasi sirkulasi peminjaman</p>
          </div>
        </div>

        {/* Visual Category / Status Breakdown Bar */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Distribusi Kategori Inventaris</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Porsi ketersediaan stok fisik per divisi perangkat laboratorium
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50/80 px-3 py-1 rounded-full border border-indigo-200/50">
              {stats?.categoryBreakdown.length || 0} Kategori Lab
            </span>
          </div>

          {/* Progress Multi-Bar (Pastel Palette) */}
          <div className="space-y-4">
            <div className="h-4 w-full bg-slate-100/80 rounded-full overflow-hidden flex shadow-inner p-0.5">
              {stats?.categoryBreakdown.map((cat, idx) => {
                const pastelColors = [
                  'bg-indigo-400',
                  'bg-sky-400',
                  'bg-emerald-400',
                  'bg-amber-400',
                  'bg-purple-400',
                  'bg-rose-400',
                ];
                const totalStock = stats.totalStokTersedia || 1;
                const percentage = Math.round((cat.totalStok / totalStock) * 100);
                if (percentage === 0) return null;

                return (
                  <div
                    key={cat.kategori}
                    style={{ width: `${percentage}%` }}
                    className={`${pastelColors[idx % pastelColors.length]} rounded-full transition-all duration-500 hover:opacity-90`}
                    title={`${cat.kategori}: ${cat.totalStok} unit (${percentage}%)`}
                  />
                );
              })}
            </div>

            {/* Legend Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
              {stats?.categoryBreakdown.map((cat, idx) => {
                const pastelDots = [
                  'bg-indigo-400',
                  'bg-sky-400',
                  'bg-emerald-400',
                  'bg-amber-400',
                  'bg-purple-400',
                  'bg-rose-400',
                ];
                return (
                  <div
                    key={cat.kategori}
                    className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/60 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${pastelDots[idx % pastelDots.length]}`} />
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
