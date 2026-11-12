'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { User, UserRole, UserStatus } from '@/types';
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
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Search,
  Key,
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
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Cari nama staff, username, atau role..."
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

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm hover:shadow transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Staff Baru</span>
          </button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-5">Pengguna</th>
                  <th className="py-3.5 px-5">Username</th>
                  <th className="py-3.5 px-5">Hak Akses (Role)</th>
                  <th className="py-3.5 px-5">Terdaftar Sejak</th>
                  <th className="py-3.5 px-5 text-center">Status Akun</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
                      <p>Memuat daftar staff...</p>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700">Tidak ada akun staff ditemukan</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    const isActive = u.status === 'AKTIF';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                u.avatar_url ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`
                              }
                              alt={u.full_name}
                              className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200"
                            />
                            <div>
                              <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                                <span>{u.full_name}</span>
                                {isSelf && (
                                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-normal">
                                    Anda
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-slate-400">ID: {u.id}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-5 font-mono text-slate-700 font-semibold">
                          @{u.username}
                        </td>

                        <td className="py-3.5 px-5">
                          {u.role === 'ADMIN' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                              <ShieldCheck className="w-3 h-3" />
                              ADMIN
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              <UserCheck className="w-3 h-3" />
                              STAFF
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-5 text-slate-600">
                          {formatDate(u.created_at)}
                        </td>

                        <td className="py-3.5 px-5 text-center">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={isSelf}
                            title={isSelf ? 'Tidak dapat mengubah akun sendiri' : 'Klik untuk mengubah status'}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200/80 border border-emerald-200'
                                : 'bg-rose-100 text-rose-800 hover:bg-rose-200/80 border border-rose-200'
                            } ${isSelf ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isActive ? 'bg-emerald-600' : 'bg-rose-600'
                              }`}
                            />
                            <span>{u.status}</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
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
            <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs">Memuat staff...</p>
            </div>
          ) : (
            filteredUsers.map((u) => {
              const isSelf = u.id === currentUser?.id;
              const isActive = u.status === 'AKTIF';

              return (
                <div
                  key={u.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={
                          u.avatar_url ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`
                        }
                        alt={u.full_name}
                        className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{u.full_name}</h4>
                        <p className="text-xs font-mono text-slate-500">@{u.username}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="p-1.5 text-slate-400 hover:text-slate-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="font-semibold text-slate-500">{u.role}</span>

                    <button
                      onClick={() => handleToggleStatus(u)}
                      disabled={isSelf}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
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
