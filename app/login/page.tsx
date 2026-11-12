'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  FlaskConical,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const { success, error: toastError } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password) {
      setErrorMessage('Silakan masukkan username dan kata sandi Anda.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(username.trim(), password);
      if (res.success) {
        success('Selamat Datang!', 'Berhasil masuk ke Sistem Inventaris Lab.');
        router.push('/dashboard');
      } else {
        setErrorMessage(res.error || 'Username atau password tidak sesuai.');
        toastError('Gagal Masuk', res.error);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role: 'admin' | 'staff') => {
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('staff');
      setPassword('staff123');
    }
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#EAECE9] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative select-none">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Institutional Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-[12px] bg-[#34495E] text-[#F4F5F1] shadow-soft mb-3.5">
          <FlaskConical className="w-7 h-7" />
        </div>

        <h1 className="text-[26px] sm:text-[28px] font-bold text-[#2E3B40] tracking-tight flex items-center justify-center gap-2">
          <span>SIMLAB</span>
          <span className="text-[11px] font-semibold font-mono px-2 py-0.5 rounded-[6px] bg-[#DCE8E2] text-[#34495E] border border-[#D9DFDA]">
            v1.0
          </span>
        </h1>
        <p className="mt-1 text-[13px] sm:text-[14px] text-[#69777A]">
          Sistem Manajemen Inventaris & Peminjaman Laboratorium
        </p>

        {/* Status Cloud Indicator */}
        <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full text-[11px] font-medium bg-[#ECEFEA] border border-[#D9DFDA] text-[#344047]">
          <span
            className={`w-2 h-2 rounded-full ${
              isSupabaseConfigured ? 'bg-[#548C75] animate-pulse' : 'bg-[#648F87]'
            }`}
          />
          <span>{isSupabaseConfigured ? 'Supabase PostgreSQL Aktif' : 'Engine Siap Pakai (Standby)'}</span>
        </div>
      </div>

      {/* Main Elevated Card: Muted Ivory (#F4F5F1) */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-[420px]">
        <div className="bg-[#F4F5F1] py-8 px-6 sm:px-8 rounded-[14px] border border-[#D9DFDA] shadow-soft relative">
          
          {/* Quick Fill Demo Section */}
          <div className="mb-5 p-3.5 bg-[#E2E9E3]/70 border border-[#D9DFDA] rounded-[10px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-semibold text-[#2E3B40] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#648F87]" />
                Akun Demo Cepat
              </span>
              <span className="text-[11px] text-[#87918F]">Pengujian</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-[13px] font-medium rounded-[8px] bg-[#DCE8E2] hover:bg-[#C8DBD3] text-[#34495E] border border-[#D9DFDA] transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#34495E]" />
                <span>Demo Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('staff')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-[13px] font-medium rounded-[8px] bg-[#DCE8E2] hover:bg-[#C8DBD3] text-[#34495E] border border-[#D9DFDA] transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#34495E]" />
                <span>Demo Staff</span>
              </button>
            </div>
            <p className="text-[11px] text-[#69777A] mt-2 text-center">
              Admin: <code className="font-mono text-[#34495E] font-medium">admin/admin123</code> • Staff:{' '}
              <code className="font-mono text-[#34495E] font-medium">staff/staff123</code>
            </p>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-[#F2E3E1] border border-[#D9DFDA] rounded-[10px] flex items-start gap-2.5 text-[#A95353] text-[13px]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-[13px] font-medium text-[#2E3B40] mb-1.5">
                Username Pengguna
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#87918F]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="admin atau staff"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-[14px] bg-[#E9ECE7] hover:bg-[#ECEFEA] focus:bg-[#F4F5F1] border border-[#D9DFDA] rounded-[10px] focus:border-[#34495E] transition-colors outline-none text-[#344047]"
                  required
                />
              </div>
            </div>

            {/* Password Input with Eye (Show/Hide) Toggle */}
            <div>
              <label className="block text-[13px] font-medium text-[#2E3B40] mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#87918F]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 text-[14px] bg-[#E9ECE7] hover:bg-[#ECEFEA] focus:bg-[#F4F5F1] border border-[#D9DFDA] rounded-[10px] focus:border-[#34495E] transition-colors outline-none text-[#344047]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#87918F] hover:text-[#34495E] transition-colors focus:outline-none min-h-[44px] min-w-[44px] justify-center"
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-[#34495E]" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button: Navy Slate (#34495E) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-[10px] text-[14px] font-medium text-[#F4F5F1] bg-[#34495E] hover:bg-[#293B4D] active:bg-[#1F2D3A] transition-colors disabled:opacity-50 min-h-[44px]"
              >
                <span>{loading ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Footer Card */}
          <div className="mt-5 pt-4 border-t border-[#DDE2DC] text-center">
            <p className="text-[12px] text-[#87918F]">
              Role-Based Access Control • SIMLAB 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
