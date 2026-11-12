'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-[#EAECE9] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-[#34495E] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-[#69777A] animate-pulse">Menghubungkan ke SIMLAB...</p>
      </div>
    </div>
  );
}
