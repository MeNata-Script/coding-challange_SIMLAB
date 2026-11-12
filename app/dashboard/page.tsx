'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { DashboardStats, Loan, AuditLog, Item } from '@/types';
import {
  fetchDashboardStats,
  fetchLoans,
  fetchAuditLogs,
  fetchItems,
} from '@/lib/db';
import { formatDate, formatDateTime } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  Package,
  Layers,
  ArrowLeftRight,
  ClipboardList,
  AlertTriangle,
  Clock,
  PlusCircle,
  TrendingUp,
  ShieldCheck,
  User,
  Activity,
  Check,
} from 'lucide-react';
import NewLoanModal from '@/components/loans/NewLoanModal';
import StatDetailModal, { StatModalType } from '@/components/dashboard/StatDetailModal';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [allLoans, setAllLoans] = useState<Loan[]>([]);
  const [recentLoans, setRecentLoans] = useState<Loan[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [selectedStatType, setSelectedStatType] = useState<StatModalType>(null);

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
      setAllItems(itemsData);
      setAllLoans(loansData);
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

  return (
    <AppLayout
      title="Dashboard Utama"
      subtitle={isAdmin ? "Panel analitik dan manajemen operasional laboratorium" : "Ringkasan operasional dan status inventaris laboratorium"}
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-[#F4F5F1] p-5 sm:p-6 rounded-[14px] border border-[#D9DFDA] shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-[18px] sm:text-[20px] font-semibold text-[#2E3B40] tracking-tight">
                Selamat Datang, {user?.full_name}
              </h2>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-[6px] border ${
                isAdmin ? 'bg-[#E3EAF0] text-[#527493] border-[#D9DFDA]' : 'bg-[#E1EDE4] text-[#548C75] border-[#D9DFDA]'
              }`}>
                {isAdmin ? 'Mode Administrator' : 'Mode Staff'}
              </span>
            </div>
            <p className="text-[13px] text-[#69777A]">
              Sistem manajemen inventaris laboratorium, sirkulasi peminjaman alat, dan inspeksi pengembalian.
            </p>
          </div>
          
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/inventory"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[14px] font-medium text-[#34495E] bg-[#DCE8E2] hover:bg-[#C8DBD3] border border-[#D9DFDA] rounded-[10px] transition-colors"
            >
              <Package className="w-4 h-4 text-[#34495E]" />
              <span>Daftar Barang</span>
            </Link>
            <button
              onClick={() => setIsLoanModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[14px] font-medium text-[#F4F5F1] bg-[#34495E] hover:bg-[#293B4D] rounded-[10px] shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Catat Pinjam</span>
            </button>
          </div>
        </div>

        {/* Banner Peringatan "Perlu Perhatian" */}
        {((stats && stats.overdueLoansCount > 0) || (lowStockItems && lowStockItems.length > 0)) && (
          <div className="p-4 sm:p-5 rounded-[14px] bg-[#F2EBDD] border border-[#D9DFDA] shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#F2EBDD] border border-[#D9DFDA] text-[#9A7137] rounded-[10px] shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-[#9A7137]" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-[#2E3B40] flex items-center gap-2">
                  <span>Perlu Perhatian Laboratorium</span>
                  <span className="text-[11px] font-bold px-2 py-0.2 rounded-[6px] bg-[#F2E3E1] text-[#A95353] border border-[#D9DFDA]">
                    Tindakan
                  </span>
                </h3>
                <p className="text-[13px] text-[#69777A] mt-1 leading-relaxed">
                  {stats && stats.overdueLoansCount > 0 && (
                    <span className="font-semibold text-[#A95353] mr-2">
                      • {stats.overdueLoansCount} transaksi melewati batas estimasi pengembalian.
                    </span>
                  )}
                  {lowStockItems.length > 0 && (
                    <span className="font-medium text-[#9A7137]">
                      • {lowStockItems.length} barang inventaris memiliki stok kritis (&lt; 3 unit).
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/loans"
                className="px-3 py-1.5 text-[13px] font-medium text-[#A95353] bg-[#F4F5F1] border border-[#D9DFDA] rounded-[8px] hover:bg-[#F2E3E1] transition-colors"
              >
                Cek Keterlambatan
              </Link>
              <Link
                href="/inventory"
                className="px-3 py-1.5 text-[13px] font-medium text-[#9A7137] bg-[#F4F5F1] border border-[#D9DFDA] rounded-[8px] hover:bg-[#F2EBDD] transition-colors"
              >
                Cek Stok Kritis
              </Link>
            </div>
          </div>
        )}

        {/* 4 Clickable Statistic Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Jenis Barang */}
          <button
            type="button"
            onClick={() => setSelectedStatType('total_inventory')}
            className="bg-[#F4F5F1] p-5 rounded-[14px] border border-[#D9DFDA] shadow-soft text-left hover:border-[#34495E] hover:shadow-md transition-all group active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#87918F] uppercase tracking-wider group-hover:text-[#34495E] transition-colors">
                Total Inventaris
              </span>
              <div className="w-8 h-8 rounded-[8px] bg-[#E3EAF0] text-[#527493] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-[24px] sm:text-[28px] font-bold text-[#2E3B40] tracking-tight">
                {loading ? '...' : stats?.totalJenisBarang || 0}
              </span>
              <span className="text-[12px] font-medium text-[#69777A]">Item</span>
            </div>
            <p className="mt-1 text-[12px] text-[#87918F]">Katalog terdaftar aktif</p>
            <div className="mt-3 pt-2.5 border-t border-[#DDE2DC] flex items-center justify-between text-[11px] text-[#69777A] group-hover:text-[#34495E] transition-colors">
              <span className="font-medium">Lihat daftar item</span>
              <span className="font-bold group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </button>

          {/* Card 2: Total Stok Tersedia */}
          <button
            type="button"
            onClick={() => setSelectedStatType('available_stock')}
            className="bg-[#F4F5F1] p-5 rounded-[14px] border border-[#D9DFDA] shadow-soft text-left hover:border-[#548C75] hover:shadow-md transition-all group active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#87918F] uppercase tracking-wider group-hover:text-[#548C75] transition-colors">
                Stok Tersedia
              </span>
              <div className="w-8 h-8 rounded-[8px] bg-[#E1EDE4] text-[#548C75] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-[24px] sm:text-[28px] font-bold text-[#548C75] tracking-tight">
                {loading ? '...' : stats?.totalStokTersedia || 0}
              </span>
              <span className="text-[12px] font-medium text-[#69777A]">Unit</span>
            </div>
            <p className="mt-1 text-[12px] text-[#87918F]">Siap dipinjam di lab</p>
            <div className="mt-3 pt-2.5 border-t border-[#DDE2DC] flex items-center justify-between text-[11px] text-[#69777A] group-hover:text-[#548C75] transition-colors">
              <span className="font-medium">Lihat barang siap pakai</span>
              <span className="font-bold group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </button>

          {/* Card 3: Sedang Dipinjam */}
          <button
            type="button"
            onClick={() => setSelectedStatType('active_loans')}
            className="bg-[#F4F5F1] p-5 rounded-[14px] border border-[#D9DFDA] shadow-soft text-left hover:border-[#9A7137] hover:shadow-md transition-all group active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#87918F] uppercase tracking-wider group-hover:text-[#9A7137] transition-colors">
                Sedang Dipinjam
              </span>
              <div className="w-8 h-8 rounded-[8px] bg-[#F2EBDD] text-[#9A7137] flex items-center justify-center group-hover:scale-105 transition-transform">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-[24px] sm:text-[28px] font-bold text-[#9A7137] tracking-tight">
                {loading ? '...' : stats?.sedangDipinjam || 0}
              </span>
              <span className="text-[12px] font-medium text-[#69777A]">Unit</span>
            </div>
            <p className="mt-1 text-[12px] text-[#87918F]">Sedang berada di peminjam</p>
            <div className="mt-3 pt-2.5 border-t border-[#DDE2DC] flex items-center justify-between text-[11px] text-[#69777A] group-hover:text-[#9A7137] transition-colors">
              <span className="font-medium">Lihat pinjaman aktif</span>
              <span className="font-bold group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </button>

          {/* Card 4: Total Transaksi Peminjaman */}
          <button
            type="button"
            onClick={() => setSelectedStatType('total_transactions')}
            className="bg-[#F4F5F1] p-5 rounded-[14px] border border-[#D9DFDA] shadow-soft text-left hover:border-[#34495E] hover:shadow-md transition-all group active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#87918F] uppercase tracking-wider group-hover:text-[#34495E] transition-colors">
                Total Transaksi
              </span>
              <div className="w-8 h-8 rounded-[8px] bg-[#DCE8E2] text-[#34495E] flex items-center justify-center group-hover:scale-105 transition-transform">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-[24px] sm:text-[28px] font-bold text-[#2E3B40] tracking-tight">
                {loading ? '...' : stats?.totalTransaksiPeminjaman || 0}
              </span>
              <span className="text-[12px] font-medium text-[#69777A]">Log</span>
            </div>
            <p className="mt-1 text-[12px] text-[#87918F]">Akumulasi peminjaman lab</p>
            <div className="mt-3 pt-2.5 border-t border-[#DDE2DC] flex items-center justify-between text-[11px] text-[#69777A] group-hover:text-[#34495E] transition-colors">
              <span className="font-medium">Lihat seluruh riwayat</span>
              <span className="font-bold group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </button>
        </div>

        {/* Visual Category Distribution */}
        <div className="bg-[#F4F5F1] p-5 sm:p-6 rounded-[14px] border border-[#D9DFDA] shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-[16px] font-semibold text-[#2E3B40]">Distribusi Kategori Inventaris</h3>
              <p className="text-[13px] text-[#69777A] mt-0.5">
                Porsi stok fisik per divisi perangkat laboratorium
              </p>
            </div>
            <span className="text-[12px] font-medium text-[#34495E] bg-[#DCE8E2] px-2.5 py-1 rounded-[6px] border border-[#D9DFDA]">
              {stats?.totalStokTersedia || 0} Unit Fisik
            </span>
          </div>

          {/* Multi-segment Progress Bar */}
          <div className="h-3 w-full bg-[#E9ECE7] rounded-full overflow-hidden flex shadow-inner">
            {stats?.categoryBreakdown && stats.totalStokTersedia > 0 ? (
              stats.categoryBreakdown.map((cat, idx) => {
                const percent = Math.round((cat.totalStok / stats.totalStokTersedia) * 100);
                if (percent === 0) return null;
                const colors = [
                  'bg-[#34495E]', // Navy Slate
                  'bg-[#648F87]', // Muted Teal
                  'bg-[#527493]', // Info Slate
                  'bg-[#548C75]', // Soft Green
                  'bg-[#9A7137]', // Muted Amber
                  'bg-[#87918F]', // Slate Gray
                ];
                return (
                  <div
                    key={cat.kategori}
                    style={{ width: `${percent}%` }}
                    className={`${colors[idx % colors.length]} transition-all duration-500`}
                    title={`${cat.kategori}: ${cat.totalStok} unit (${percent}%)`}
                  />
                );
              })
            ) : (
              <div className="w-full bg-[#E2E9E3]" />
            )}
          </div>

          {/* Legend Items */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
            {stats?.categoryBreakdown.map((cat, idx) => {
              const dots = [
                'bg-[#34495E]',
                'bg-[#648F87]',
                'bg-[#527493]',
                'bg-[#548C75]',
                'bg-[#9A7137]',
                'bg-[#87918F]',
              ];
              return (
                <div key={cat.kategori} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dots[idx % dots.length]}`} />
                  <div className="text-xs truncate">
                    <span className="font-semibold text-[#2E3B40]">{cat.kategori}</span>
                    <span className="text-[#87918F] ml-1.5">({cat.totalStok})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2-Column Split: Recent Loans & Audit Log Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kolom Kiri: Peminjaman Terkini */}
          <div className="bg-[#F4F5F1] p-5 sm:p-6 rounded-[14px] border border-[#D9DFDA] shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[16px] font-semibold text-[#2E3B40] flex items-center gap-2">
                  <span>Peminjaman Terkini</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#DCE8E2] text-[#34495E] border border-[#D9DFDA]">
                    Real-time
                  </span>
                </h3>
                <p className="text-[12px] text-[#69777A] mt-0.5">Sirkulasi peminjaman perangkat terkini</p>
              </div>
              <Link
                href="/loans"
                className="text-[13px] font-medium text-[#34495E] hover:text-[#293B4D] hover:underline"
              >
                Lihat Semua →
              </Link>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="py-10 text-center text-[#87918F] text-xs">
                  <div className="inline-block w-5 h-5 border-2 border-[#34495E] border-t-transparent rounded-full animate-spin mb-2" />
                  <p>Memuat transaksi...</p>
                </div>
              ) : recentLoans.length === 0 ? (
                <div className="py-8 text-center text-[#87918F] text-xs">
                  <ArrowLeftRight className="w-8 h-8 mx-auto mb-1 opacity-40 text-[#87918F]" />
                  <p>Belum ada data peminjaman aktif.</p>
                </div>
              ) : (
                recentLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className="p-3.5 rounded-[10px] border border-[#D9DFDA] bg-[#ECEFEA] hover:bg-[#EAECE9] transition-colors flex items-center justify-between gap-3 text-[13px]"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#2E3B40] truncate">
                          {loan.nama_peminjam}
                        </span>
                        <span className="text-[11px] font-mono text-[#87918F]">
                          ({loan.nim_identitas})
                        </span>
                      </div>
                      <p className="text-[12px] text-[#69777A] truncate mt-0.5">
                        {loan.item?.nama_barang || 'Barang Lab'} • <span className="font-medium text-[#2E3B40]">{loan.jumlah} unit</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      {loan.status === 'DIPINJAM' ? (
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            loan.is_overdue
                              ? 'bg-[#F2E3E1] text-[#A95353] border-[#A95353]/30'
                              : 'bg-[#F2EBDD] text-[#9A7137] border-[#9A7137]/30'
                          }`}
                        >
                          {loan.is_overdue ? 'TERLAMBAT' : 'DIPINJAM'}
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E1EDE4] text-[#548C75] border border-[#548C75]/30">
                          SELESAI
                        </span>
                      )}
                      <p className="text-[11px] text-[#87918F] mt-1 font-mono">
                        {formatDate(loan.estimasi_kembali)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Kolom Kanan: Log Aktivitas Audit */}
          <div className="bg-[#F4F5F1] p-5 sm:p-6 rounded-[14px] border border-[#D9DFDA] shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[16px] font-semibold text-[#2E3B40] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#527493]" />
                  <span>Log Aktivitas Sistem</span>
                </h3>
                <p className="text-[12px] text-[#69777A] mt-0.5">Audit trail aksi pengguna & keamanan</p>
              </div>
              <span className="text-[11px] font-mono text-[#87918F]">Auto-recorded</span>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="py-10 text-center text-[#87918F] text-xs">
                  <div className="inline-block w-5 h-5 border-2 border-[#34495E] border-t-transparent rounded-full animate-spin mb-2" />
                  <p>Memuat log...</p>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="py-8 text-center text-[#87918F] text-xs">
                  <Clock className="w-8 h-8 mx-auto mb-1 opacity-40 text-[#87918F]" />
                  <p>Belum ada rekaman audit log.</p>
                </div>
              ) : (
                auditLogs.map((log) => {
                  const getActionBadge = (act: string) => {
                    switch (act) {
                      case 'PINJAM_BARANG':
                        return { label: 'Peminjaman', badge: 'bg-[#F2EBDD] text-[#9A7137]' };
                      case 'KEMBALI_BARANG':
                        return { label: 'Kembali', badge: 'bg-[#E1EDE4] text-[#548C75]' };
                      case 'TAMBAH_BARANG':
                      case 'UPDATE_BARANG':
                        return { label: 'Inventaris', badge: 'bg-[#E3EAF0] text-[#527493]' };
                      case 'HAPUS_BARANG':
                      case 'HAPUS_STAFF':
                        return { label: 'Hapus Data', badge: 'bg-[#F2E3E1] text-[#A95353]' };
                      default:
                        return { label: act, badge: 'bg-[#ECEFEA] text-[#69777A]' };
                    }
                  };
                  const badge = getActionBadge(log.action);

                  return (
                    <div
                      key={log.id}
                      className="p-3 rounded-[10px] border border-[#D9DFDA] bg-[#ECEFEA] flex items-start justify-between gap-3 text-[13px]"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#E2E9E3] text-[#34495E] flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-[#2E3B40]">@{log.actor_username}</span>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-[4px] border border-[#D9DFDA] ${badge.badge}`}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-[12px] text-[#69777A] mt-0.5">
                            {log.details?.barang || log.details?.peminjam || log.details?.message || log.target_type}
                          </p>
                        </div>
                      </div>

                      <span className="text-[11px] text-[#87918F] whitespace-nowrap mt-0.5">
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

      {/* Stat Detail Interactive Modal */}
      <StatDetailModal
        type={selectedStatType}
        items={allItems}
        loans={allLoans}
        onClose={() => setSelectedStatType(null)}
      />
    </AppLayout>
  );
}
