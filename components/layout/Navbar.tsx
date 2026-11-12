'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  Bell,
  Database,
  Cloud,
  ShieldCheck,
  UserCheck,
  Menu,
  X,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  title?: string;
  subtitle?: string;
}

export default function Navbar({ title, subtitle }: NavbarProps) {
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Page Title & Breadcrumb */}
      <div>
        {title && <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{title}</h1>}
        {subtitle && <p className="text-xs text-slate-500 hidden sm:block mt-0.5">{subtitle}</p>}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Backend Status Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 border border-slate-200/60 text-slate-700">
          <span
            className={`w-2 h-2 rounded-full ${
              isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500'
            }`}
          />
          <span className="hidden md:inline font-mono">
            {isSupabaseConfigured ? 'Supabase Connected' : 'Local Storage Engine'}
          </span>
          <span className="md:hidden font-mono">
            {isSupabaseConfigured ? 'Cloud' : 'Local'}
          </span>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2.5 pl-2 sm:border-l sm:border-slate-200">
          <img
            src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`}
            alt={user?.full_name || 'User'}
            className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50"
          />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-none">{user?.full_name}</p>
            <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">
              {user?.role}
            </p>
          </div>
        </div>

        {/* Mobile Logout Quick Icon */}
        <button
          onClick={logout}
          title="Keluar"
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
