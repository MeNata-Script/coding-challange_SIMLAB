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
  PlusCircle,
  LogOut,
} from 'lucide-react';

interface MobileNavProps {
  onOpenNewLoan?: () => void;
}

export default function MobileNav({ onOpenNewLoan }: MobileNavProps) {
  const pathname = usePathname();
  const { isAdmin, logout } = useAuth();

  const links = [
    {
      name: 'Beranda',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Barang',
      href: '/inventory',
      icon: Package,
    },
    {
      name: 'Peminjaman',
      href: '/loans',
      icon: ArrowLeftRight,
    },
    ...(isAdmin
      ? [
          {
            name: 'Staff',
            href: '/users',
            icon: Users,
          },
        ]
      : []),
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-2 py-1 shadow-elevated">
      <div className="flex items-center justify-around">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg transition-colors ${
                isActive ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{link.name}</span>
            </Link>
          );
        })}

        {/* Quick Loan Button */}
        {onOpenNewLoan && (
          <button
            onClick={onOpenNewLoan}
            className="flex flex-col items-center justify-center py-1.5 px-3 text-indigo-600 font-semibold active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-indigo-700 font-bold mt-0.5">Pinjam</span>
          </button>
        )}
      </div>
    </nav>
  );
}
