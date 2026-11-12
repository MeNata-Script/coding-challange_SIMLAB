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
  Sparkles,
  Info,
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
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-[#E2E9E3] border-r border-[#D9DFDA] z-30 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-[#D9DFDA]/70 bg-[#E2E9E3]">
        <div className="w-9 h-9 rounded-[10px] bg-[#34495E] text-[#F4F5F1] flex items-center justify-center shadow-sm">
          <FlaskConical className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-[#2E3B40] tracking-tight text-[17px] flex items-center gap-1.5">
            SIMLAB <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-[6px] bg-[#DCE8E2] text-[#34495E] border border-[#D9DFDA]">v1.0</span>
          </span>
          <p className="text-[11px] text-[#69777A] font-medium leading-none mt-0.5">Laboratorium Terpadu</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3.5 py-5 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2">
          <p className="text-[11px] font-semibold text-[#87918F] uppercase tracking-wider">
            Menu Utama
          </p>
        </div>

        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-[10px] font-medium text-[14px] transition-colors duration-150 ${
                isActive
                  ? 'bg-[#DCE8E2] text-[#34495E] font-semibold border border-[#D9DFDA]/60'
                  : 'text-[#69777A] hover:text-[#2E3B40] hover:bg-[#ECEFEA]'
              }`}
            >
              <Icon
                className={`w-[19px] h-[19px] transition-colors ${
                  isActive ? 'text-[#34495E]' : 'text-[#69777A] group-hover:text-[#2E3B40]'
                }`}
              />
              <span className="flex-1 text-[14px]">{item.name}</span>
              {item.adminOnly && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] bg-[#F2EBDD] text-[#9A7137] border border-[#D9DFDA]">
                  Admin
                </span>
              )}
            </Link>
          );
        })}

        {/* Informational Card (Soft Sage & Muted Ivory) */}
        <div className="mt-8 mx-1 p-3.5 bg-[#F4F5F1] rounded-[12px] border border-[#D9DFDA]">
          <div className="flex items-center gap-2 text-[#34495E] font-semibold text-[12px] mb-1">
            <Info className="w-3.5 h-3.5 text-[#648F87]" />
            <span>SOP Laboratorium</span>
          </div>
          <p className="text-[12px] text-[#69777A] leading-relaxed">
            Wajib membawa kartu identitas mahasiswa (KTM) saat peminjaman alat inventaris.
          </p>
        </div>
      </div>

      {/* User Footer Profile & Role */}
      <div className="p-3.5 border-t border-[#D9DFDA]/80 bg-[#E2E9E3]">
        <div className="flex items-center gap-3 p-2.5 rounded-[12px] bg-[#F4F5F1] border border-[#D9DFDA] mb-2 shadow-soft">
          <div className="relative">
            <img
              src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`}
              alt={user?.full_name || 'User'}
              className="w-9 h-9 rounded-full bg-[#E9ECE7] border border-[#D9DFDA]"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#548C75] ring-2 ring-[#F4F5F1]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#2E3B40] truncate leading-tight">{user?.full_name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#E3EAF0] text-[#527493]">
                  <ShieldCheck className="w-3 h-3" />
                  ADMIN
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#E1EDE4] text-[#548C75]">
                  <UserCheck className="w-3 h-3" />
                  STAFF
                </span>
              )}
              <span className="text-[11px] text-[#87918F]">@{user?.username}</span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-[13px] font-medium text-[#A95353] hover:text-[#8E4444] hover:bg-[#F2E3E1] rounded-[8px] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Sistem</span>
        </button>
      </div>
    </aside>
  );
}
