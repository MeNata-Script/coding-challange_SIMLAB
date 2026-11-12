'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { User } from '@/types';
import { fetchUsers, toggleUserStatus } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  Users,
  UserPlus,
  ShieldCheck,
  UserCheck,
  Edit2,
  Search,
} from 'lucide-react';
import StaffFormModal from '@/components/users/StaffFormModal';

export default function UsersManagementPage() {
  const { user: currentUser } = useAuth();
  const { success, error } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data);
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.full_name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleToggleStatus = async (user: User) => {
    if (user.id === currentUser?.id) {
      error('Tindakan Ditolak', 'Anda tidak dapat menonaktifkan akun Anda sendiri!');
      return;
    }

    try {
      const updated = await toggleUserStatus(user.id);
      success(
        'Status Berubah',
        `Akun ${user.username} sekarang berstatus ${updated.status}.`
      );
      loadData();
    } catch (err: any) {
      error('Gagal Mengubah Status', err.message);
    }
  };

  return (
    <AppLayout
      title="Kelola Staff & Akses"
      subtitle="Manajemen akun operator dan hak akses laboratorium (Khusus Admin)"
      adminOnly={true}
    >
      <div className="space-y-5">
        {/* Controls: Search & Add Staff */}
        <div className="bg-[#F4F5F1] p-4 sm:p-5 rounded-[14px] border border-[#D9DFDA] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#87918F]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Cari nama staff, username, atau role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#E9ECE7] border border-[#D9DFDA] rounded-[10px] text-[#344047] placeholder:text-[#87918F] focus:border-[#34495E] focus:outline-none focus:ring-1 focus:ring-[#34495E] transition-all"
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

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-[#F4F5F1] bg-[#34495E] hover:bg-[#293B4D] rounded-[10px] shadow-sm transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Staff Baru</span>
          </button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-[#F4F5F1] rounded-[14px] border border-[#D9DFDA] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#E2E9E3] border-b border-[#D9DFDA] text-[11px] font-bold uppercase tracking-wider text-[#69777A]">
                  <th className="py-3.5 px-5">Pengguna</th>
                  <th className="py-3.5 px-5">Username</th>
                  <th className="py-3.5 px-5">Hak Akses (Role)</th>
                  <th className="py-3.5 px-5">Terdaftar Sejak</th>
                  <th className="py-3.5 px-5 text-center">Status Akun</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE2DC] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#87918F]">
                      <div className="inline-block w-6 h-6 border-2 border-[#34495E] border-t-transparent rounded-full animate-spin mb-2" />
                      <p>Memuat daftar staff...</p>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#69777A]">
                      <Users className="w-8 h-8 text-[#87918F] mx-auto mb-2" />
                      <p className="font-semibold text-[#2E3B40]">Tidak ada akun staff ditemukan</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    const isActive = u.status === 'AKTIF';

                    return (
                      <tr key={u.id} className="hover:bg-[#ECEFEA] transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                u.avatar_url ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`
                              }
                              alt={u.full_name}
                              className="w-9 h-9 rounded-full bg-[#E2E9E3] border border-[#D9DFDA]"
                            />
                            <div>
                              <p className="font-semibold text-[#2E3B40] flex items-center gap-1.5">
                                <span>{u.full_name}</span>
                                {isSelf && (
                                  <span className="text-[10px] bg-[#DCE8E2] text-[#34495E] px-1.5 py-0.2 rounded font-normal">
                                    Anda
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-[#87918F]">ID: {u.id}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-5 font-mono text-[#344047] font-semibold">
                          @{u.username}
                        </td>

                        <td className="py-3.5 px-5">
                          {u.role === 'ADMIN' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#DCE8E2] text-[#34495E] border border-[#D9DFDA]">
                              <ShieldCheck className="w-3 h-3" />
                              ADMIN
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ECEFEA] text-[#69777A] border border-[#D9DFDA]">
                              <UserCheck className="w-3 h-3" />
                              STAFF
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-5 text-[#69777A]">
                          {formatDate(u.created_at)}
                        </td>

                        <td className="py-3.5 px-5 text-center">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={isSelf}
                            title={isSelf ? 'Tidak dapat mengubah akun sendiri' : 'Klik untuk mengubah status'}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                              isActive
                                ? 'bg-[#E1EDE4] text-[#548C75] border-[#548C75]/20 hover:bg-[#D5E6D9]'
                                : 'bg-[#F2E3E1] text-[#A95353] border-[#A95353]/20 hover:bg-[#EAD4D1]'
                            } ${isSelf ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isActive ? 'bg-[#548C75]' : 'bg-[#A95353]'
                              }`}
                            />
                            <span>{u.status}</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 text-[#69777A] hover:text-[#34495E] hover:bg-[#DCE8E2] rounded-[8px] transition-colors"
                            title="Edit Akun"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile View: Stacked Cards */}
        <div className="lg:hidden space-y-3">
          {loading ? (
            <div className="p-8 text-center text-[#87918F] bg-[#F4F5F1] rounded-[14px] border border-[#D9DFDA]">
              <div className="inline-block w-6 h-6 border-2 border-[#34495E] border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs">Memuat staff...</p>
            </div>
          ) : (
            filteredUsers.map((u) => {
              const isSelf = u.id === currentUser?.id;
              const isActive = u.status === 'AKTIF';

              return (
                <div
                  key={u.id}
                  className="bg-[#F4F5F1] p-4 rounded-[14px] border border-[#D9DFDA] shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={
                          u.avatar_url ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`
                        }
                        alt={u.full_name}
                        className="w-10 h-10 rounded-full bg-[#E2E9E3] border border-[#D9DFDA]"
                      />
                      <div>
                        <h4 className="font-bold text-[#2E3B40] text-sm">{u.full_name}</h4>
                        <p className="text-xs font-mono text-[#69777A]">@{u.username}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="p-2 text-[#69777A] hover:text-[#34495E] hover:bg-[#DCE8E2] rounded-[8px]"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#DDE2DC] text-xs">
                    <span className="font-medium text-[#69777A]">{u.role}</span>

                    <button
                      onClick={() => handleToggleStatus(u)}
                      disabled={isSelf}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border ${
                        isActive
                          ? 'bg-[#E1EDE4] text-[#548C75] border-[#548C75]/20'
                          : 'bg-[#F2E3E1] text-[#A95353] border-[#A95353]/20'
                      }`}
                    >
                      {u.status} (Ubah)
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Staff Form Modal */}
      <StaffFormModal
        isOpen={isFormOpen}
        initialUser={editingUser}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          loadData();
        }}
      />
    </AppLayout>
  );
}
