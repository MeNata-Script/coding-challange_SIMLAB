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
  CheckCircle2,
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
    <div className="min-h-screen bg-gradient-to-br from-[#E2E8F0] via-[#E8EDF5] to-[#DFE7F3] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Eye-Soothing Soft Pastel Ambient Glows */}
      <div className="absolute top-10 left-1/4 -translate-x-1/2 w-[450px] h-[450px] bg-indigo-200/35 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 translate-x-1/3 w-[450px] h-[450px] bg-purple-200/30 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-12 w-[350px] h-[350px] bg-sky-200/30 rounded-full blur-[90px] pointer-events-none -z-10" />
      <div className="absolute bottom-20 left-10 w-[300px] h-[300px] bg-amber-100/30 rounded-full blur-[80px] pointer-events-none -z-10" />

      {/* Header Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Soft Lavender Icon Container */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-[22px] bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-300/40 mb-3.5 transform transition-transform hover:scale-105 duration-300">
          <FlaskConical className="w-8 h-8" />
        </div>

        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center justify-center gap-2">
          <span>SIMLAB</span>
          <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-indigo-100/90 text-indigo-700 border border-indigo-200/60 shadow-xs">
            v1.0
          </span>
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 font-medium">
          Sistem Manajemen Inventaris & Peminjaman Laboratorium
        </p>

        {/* Backend Status indicator */}
        <div className="inline-flex items-center gap-2 mt-3 px-3.5 py-1 rounded-full text-[11px] font-semibold bg-white/70 backdrop-blur-md border border-slate-300/60 shadow-xs text-slate-700">
          <span
            className={`w-2 h-2 rounded-full ${
              isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-400'
            }`}
          />
          <span>{isSupabaseConfigured ? 'Supabase PostgreSQL Aktif' : 'Engine Siap Pakai (Standby)'}</span>
        </div>
      </div>

      {/* Main Glassmorphism Login Card (Comfortable Non-White Ambient) */}
      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-[420px] px-4">
        <div className="bg-white/80 backdrop-blur-2xl py-8 px-6 sm:px-9 shadow-[0_25px_60px_-15px_rgba(30,41,59,0.08)] rounded-[32px] border border-white/70 relative transition-all">
          
          {/* Quick Fill Demo Pills (Pastel Aesthetic) */}
          <div className="mb-6 p-4 bg-slate-100/60 border border-slate-200/70 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                1-Click Akun Demo Cepat
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Pengujian</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl bg-violet-100/70 hover:bg-violet-200/70 text-violet-800 border border-violet-200/80 transition-all shadow-xs active:scale-95"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-violet-600" />
                <span>Demo Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('staff')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl bg-emerald-100/70 hover:bg-emerald-200/70 text-emerald-800 border border-emerald-200/80 transition-all shadow-xs active:scale-95"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Demo Staff</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 text-center">
              Admin: <code className="font-mono text-violet-700 font-semibold">admin/admin123</code> • Staff:{' '}
              <code className="font-mono text-emerald-700 font-semibold">staff/staff123</code>
            </p>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-50/90 border border-rose-200/80 rounded-2xl flex items-start gap-2.5 text-rose-700 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Username Pengguna
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="admin atau staff"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-100/80 hover:bg-white focus:bg-white border border-slate-200/90 rounded-2xl focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 transition-all outline-none text-slate-800 font-medium"
                  required
                />
              </div>
            </div>

            {/* Password Input with Eye (Show/Hide) Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 text-xs sm:text-sm bg-slate-100/80 hover:bg-white focus:bg-white border border-slate-200/90 rounded-2xl focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 transition-all outline-none font-sans text-slate-800 font-medium"
                  required
                />
                {/* Eye Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-indigo-600 transition-transform hover:scale-110" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400 transition-transform hover:scale-110" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-[0.99] shadow-md shadow-indigo-300/50 transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Footer Card */}
          <div className="mt-6 pt-5 border-t border-slate-200/60 text-center">
            <p className="text-[11px] text-slate-400 font-medium">
              Dilindungi Role-Based Access Control (RBAC) • SIMLAB 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
