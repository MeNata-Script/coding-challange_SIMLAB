import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';

export const metadata: Metadata = {
  title: 'SIMLAB - Sistem Manajemen Inventaris & Peminjaman Laboratorium',
  description:
    'Sistem Manajemen Inventaris dan Peminjaman Laboratorium Terintegrasi berbasis Next.js dan Supabase PostgreSQL.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased selection:bg-[#34495E] selection:text-[#F4F5F1] bg-[#EAECE9] text-[#344047]">
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
