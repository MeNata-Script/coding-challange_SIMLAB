'use client';

import React, { useEffect, useState, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { DashboardStats, Loan, Item, AuditLog } from '@/types';
import { fetchDashboardStats, fetchLoans, fetchAuditLogs, fetchItems } from '@/lib/db';
import { formatDate, formatDateTime } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Package,
  Layers,
  ArrowLeftRight,
  ClipboardList,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PlusCircle,
  ArrowUpRight,
  ShieldCheck,
  User,
  Activity,
  Check,
} from 'lucide-react';
import NewLoanModal from '@/components/loans/NewLoanModal';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
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

        {/* 4 Statistic Cards: Content Surface (#F4F5F1) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Jenis Barang */}
          <div className="bg-[#F4F5F1] p-5 rounded-[14px] border border-[#D9DFDA] shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#87918F] uppercase tracking-wider">
                Total Inventaris
              </span>
              <div className="w-8 h-8 rounded-[8px] bg-[#E3EAF0] text-[#527493] flex items-center justify-center">
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
          </div>

          {/* Card 2: Total Stok Tersedia */}
          <div className="bg-[#F4F5F1] p-5 rounded-[14px] border border-[#D9DFDA] shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#87918F] uppercase tracking-wider">
                Stok Tersedia
              </span>
              <div className="w-8 h-8 rounded-[8px] bg-[#E1EDE4] text-[#548C75] flex items-center justify-center">
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
          </div>

          {/* Card 3: Sedang Dipinjam */}
          <div className="bg-[#F4F5F1] p-5 rounded-[14px] border border-[#D9DFDA] shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#87918F] uppercase tracking-wider">
                Sedang Dipinjam
              </span>
              <div className="w-8 h-8 rounded-[8px] bg-[#F2EBDD] text-[#9A7137] flex items-center justify-center">
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
          </div>

          {/* Card 4: Total Transaksi Peminjaman */}
          <div className="bg-[#F4F5F1] p-5 rounded-[14px] border border-[#D9DFDA] shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#87918F] uppercase tracking-wider">
                Total Transaksi
              </span>
              <div className="w-8 h-8 rounded-[8px] bg-[#DCE8E2] text-[#34495E] flex items-center justify-center">
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
          </div>
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
              {stats?.categoryBreakdown.length || 0} Kategori
            </span>
          </div>

          {/* Progress Multi-Bar */}
          <div className="space-y-4">
            <div className="h-3 w-full bg-[#E9ECE7] rounded-full overflow-hidden flex">
              {stats?.categoryBreakdown.map((cat, idx) => {
                const colors = [
                  'bg-[#34495E]',
                  'bg-[#648F87]',
                  'bg-[#548C75]',
                  'bg-[#9A7137]',
                  'bg-[#527493]',
                  'bg-[#87918F]',
                ];
                const totalStock = stats.totalStokTersedia || 1;
                const percentage = Math.round((cat.totalStok / totalStock) * 100);
                if (percentage === 0) return null;

                return (
                  <div
                    key={cat.kategori}
                    style={{ width: `${percentage}%` }}
                    className={`${colors[idx % colors.length]} transition-all duration-300`}
                    title={`${cat.kategori}: ${cat.totalStok} unit (${percentage}%)`}
                  />
                );
              })}
            </div>

            {/* Legend Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
              {stats?.categoryBreakdown.map((cat, idx) => {
                const dotColors = [
                  'bg-[#34495E]',
                  'bg-[#648F87]',
                  'bg-[#548C75]',
                  'bg-[#9A7137]',
                  'bg-[#527493]',
                  'bg-[#87918F]',
                ];
                return (
                  <div
                    key={cat.kategori}
                    className="p-2.5 rounded-[10px] bg-[#ECEFEA] border border-[#D9DFDA] flex items-center justify-between text-[13px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${dotColors[idx % dotColors.length]}`} />
                      <span className="font-medium text-[#344047]">{cat.kategori}</span>
                    </div>
                    <span className="font-semibold text-[#2E3B40]">
                      {cat.totalStok} <span className="text-[11px] font-normal text-[#87918F]">unit</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2-Column Section: Peminjaman Terbaru & Audit Log Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Column 1: Recent Loans */}
          <div className="bg-[#F4F5F1] p-5 sm:p-6 rounded-[14px] border border-[#D9DFDA] shadow-soft flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#34495E]" />
                <h3 className="text-[16px] font-semibold text-[#2E3B40]">Peminjaman Terbaru</h3>
              </div>
              <Link
                href="/loans"
                className="text-[13px] font-medium text-[#34495E] hover:text-[#293B4D] flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5 flex-1">
              {recentLoans.length === 0 ? (
                <div className="p-8 text-center text-[13px] text-[#87918F] bg-[#ECEFEA] rounded-[10px]">
                  Belum ada transaksi peminjaman.
                </div>
              ) : (
                recentLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className="p-3 rounded-[10px] border border-[#D9DFDA] bg-[#ECEFEA] hover:bg-[#E9ECE7] transition-colors flex items-center justify-between gap-3 text-[13px]"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-[#2E3B40] truncate">
                        {loan.nama_peminjam}{' '}
                        <span className="text-[#87918F] font-normal font-mono text-[12px]">({loan.nim_identitas})</span>
                      </p>
                      <p className="text-[12px] text-[#69777A] mt-0.5">
                        {loan.item?.nama_barang || 'Barang Lab'} • {loan.jumlah} unit
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      {loan.status === 'DIPINJAM' ? (
                        loan.is_overdue ? (
                          <span className="px-2 py-0.5 rounded-[5px] text-[11px] font-semibold bg-[#F2E3E1] text-[#A95353] border border-[#D9DFDA]">
                            Terlambat
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-[5px] text-[11px] font-semibold bg-[#F2EBDD] text-[#9A7137] border border-[#D9DFDA]">
                            Dipinjam
                          </span>
                        )
                      ) : (
                        <span className="px-2 py-0.5 rounded-[5px] text-[11px] font-semibold bg-[#E1EDE4] text-[#548C75] border border-[#D9DFDA]">
                          Selesai
                        </span>
                      )}
                      <p className="text-[11px] text-[#87918F] mt-1">
                        {formatDate(loan.tanggal_pinjam)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2: Audit Logs Feed */}
          <div className="bg-[#F4F5F1] p-5 sm:p-6 rounded-[14px] border border-[#D9DFDA] shadow-soft flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#648F87]" />
                <h3 className="text-[16px] font-semibold text-[#2E3B40]">Aktivitas Sistem & Audit</h3>
              </div>
              <span className="text-[12px] text-[#87918F] font-medium">Log Operasional</span>
            </div>

            <div className="space-y-2.5 flex-1">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-[13px] text-[#87918F] bg-[#ECEFEA] rounded-[10px]">
                  Belum ada log aktivitas.
                </div>
              ) : (
                auditLogs.map((log) => {
                  const actionMap: Record<string, { label: string; badge: string }> = {
                    PINJAM_BARANG: { label: 'Peminjaman', badge: 'bg-[#F2EBDD] text-[#9A7137]' },
                    KEMBALIKAN_BARANG: { label: 'Pengembalian', badge: 'bg-[#E1EDE4] text-[#548C75]' },
                    TAMBAH_BARANG: { label: 'Tambah Barang', badge: 'bg-[#E3EAF0] text-[#527493]' },
                    UPDATE_BARANG: { label: 'Edit Barang', badge: 'bg-[#ECEFEA] text-[#34495E]' },
                    HAPUS_BARANG: { label: 'Hapus Barang', badge: 'bg-[#F2E3E1] text-[#A95353]' },
                    TAMBAH_STAFF: { label: 'Tambah Staff', badge: 'bg-[#DCE8E2] text-[#34495E]' },
                    INIT_SYSTEM: { label: 'Inisialisasi', badge: 'bg-[#E9ECE7] text-[#69777A]' },
                  };

                  const badge = actionMap[log.action] || {
                    label: log.action,
                    badge: 'bg-[#E9ECE7] text-[#69777A]',
                  };

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
    </AppLayout>
  );
}
