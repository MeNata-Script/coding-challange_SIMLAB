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
} from 'lucide-react';

interface MobileNavProps {
  onOpenNewLoan?: () => void;
}

export default function MobileNav({ onOpenNewLoan }: MobileNavProps) {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

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
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-[#E2E9E3]/95 backdrop-blur-md border-t border-[#D9DFDA] z-40 px-2 py-1.5 shadow-sm">
      <div className="flex items-center justify-around">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-[8px] transition-colors min-h-[44px] min-w-[44px] ${
                isActive ? 'text-[#34495E] font-semibold' : 'text-[#69777A] hover:text-[#2E3B40]'
              }`}
            >
              <Icon className="w-[19px] h-[19px] mb-0.5" />
              <span className="text-[11px] tracking-tight">{link.name}</span>
            </Link>
          );
        })}

        {/* Quick Loan Button */}
        {onOpenNewLoan && (
          <button
            onClick={onOpenNewLoan}
            className="flex flex-col items-center justify-center py-1.5 px-3 text-[#34495E] font-semibold active:scale-95 transition-transform min-h-[44px] min-w-[44px]"
          >
            <div className="w-8 h-8 rounded-full bg-[#34495E] text-[#F4F5F1] flex items-center justify-center shadow-xs">
              <PlusCircle className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-[#34495E] font-bold mt-0.5">Pinjam</span>
          </button>
        )}
      </div>
    </nav>
  );
}
