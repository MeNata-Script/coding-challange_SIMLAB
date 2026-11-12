'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import NewLoanModal from '@/components/loans/NewLoanModal';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  adminOnly?: boolean;
}

export default function AppLayout({
  children,
  title,
  subtitle,
  adminOnly = false,
}: AppLayoutProps) {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const { warning } = useToast();
  const [isNewLoanOpen, setIsNewLoanOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login');
      } else if (adminOnly && !isAdmin) {
        warning('Akses Ditolak', 'Halaman ini khusus untuk peran Administrator.');
        router.replace('/dashboard');
      }
    }
  }, [user, isAdmin, isLoading, adminOnly, router, warning]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#EAECE9] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-[#34495E] border-t-transparent rounded-full animate-spin" />
          <p className="text-[13px] font-medium text-[#69777A] animate-pulse">Memuat SIMLAB...</p>
        </div>
      </div>
    );
  }

  if (adminOnly && !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#EAECE9] text-[#344047] flex flex-col lg:flex-row antialiased">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen pb-20 lg:pb-8">
        <Navbar title={title} subtitle={subtitle} />

        <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Sticky Bottom Nav */}
      <MobileNav onOpenNewLoan={() => setIsNewLoanOpen(true)} />

      {/* Global Quick Loan Modal (Accessible from anywhere or mobile FAB) */}
      <NewLoanModal
        isOpen={isNewLoanOpen}
        onClose={() => setIsNewLoanOpen(false)}
        onSuccess={() => {
          window.dispatchEvent(new Event('simlab_data_changed'));
        }}
      />
    </div>
  );
}
