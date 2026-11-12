'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Users,
  LogOut,
  FlaskConical,
  ShieldCheck,
  UserCheck,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Inventaris Barang',
      href: '/inventory',
      icon: Package,
    },
    {
      name: 'Peminjaman & Kembali',
      href: '/loans',
      icon: ArrowLeftRight,
    },
    ...(isAdmin
      ? [
          {
            name: 'Kelola Staff (Admin)',
            href: '/users',
            icon: Users,
            adminOnly: true,
          },
        ]
      : []),
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-slate-200 z-30 shadow-card">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
          <FlaskConical className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-slate-900 tracking-tight text-lg flex items-center gap-1.5">
            SIMLAB <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">v1.0</span>
          </span>
          <p className="text-[11px] text-slate-500 font-medium">Laboratorium Komputasi</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Menu Utama
          </p>
        </div>

        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              <span className="flex-1">{item.name}</span>
              {item.adminOnly && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                  Admin
                </span>
              )}
            </Link>
          );
        })}

        {/* Informational Card */}
        <div className="mt-8 mx-2 p-3.5 bg-gradient-to-br from-indigo-50 to-slate-50 rounded-2xl border border-indigo-100/70">
          <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SOP Peminjaman</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Peminjaman barang wajib menunjukkan KTM/NIM dan dikembalikan maksimal 7 hari kerja.
          </p>
        </div>
      </div>

      {/* User Footer Profile & Role */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs mb-2">
          <div className="relative">
            <img
              src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`}
              alt={user?.full_name || 'User'}
              className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">{user?.full_name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                  <ShieldCheck className="w-3 h-3" />
                  ADMIN
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                  <UserCheck className="w-3 h-3" />
                  STAFF
                </span>
              )}
              <span className="text-[11px] text-slate-400">@{user?.username}</span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Aplikasi</span>
        </button>
      </div>
    </aside>
  );
}
