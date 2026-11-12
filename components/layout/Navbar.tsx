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
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import UserProfileModal from '@/components/profile/UserProfileModal';

interface NavbarProps {
  title?: string;
  subtitle?: string;
}

export default function Navbar({ title, subtitle }: NavbarProps) {
  const { user, isAdmin, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 bg-[#ECEFEA]/95 backdrop-blur-md border-b border-[#D9DFDA] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Page Title & Breadcrumb */}
        <div>
          {title && <h1 className="text-[18px] sm:text-[20px] font-semibold text-[#2E3B40] tracking-tight">{title}</h1>}
          {subtitle && <p className="text-[13px] text-[#69777A] hidden sm:block mt-0.5">{subtitle}</p>}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Backend Status Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-[#E9ECE7] border border-[#D9DFDA] text-[#344047]">
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConfigured ? 'bg-[#548C75] animate-pulse' : 'bg-[#648F87]'
              }`}
            />
            <span className="hidden md:inline font-mono">
              {isSupabaseConfigured ? 'Supabase Connected' : 'Local Storage Engine'}
            </span>
            <span className="md:hidden font-mono">
              {isSupabaseConfigured ? 'Cloud' : 'Local'}
            </span>
          </div>

          {/* User Badge - Clickable to open profile */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-2.5 pl-2 sm:border-l sm:border-[#D9DFDA] hover:opacity-85 transition-opacity text-left cursor-pointer group"
            title="Klik untuk melihat profil saya"
          >
            <div className="relative">
              <img
                src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`}
                alt={user?.full_name || 'User'}
                className="w-8 h-8 rounded-full border border-[#D9DFDA] bg-[#E9ECE7] group-hover:border-[#34495E] transition-colors"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#548C75] ring-1 ring-white" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[13px] font-semibold text-[#2E3B40] leading-none group-hover:text-[#34495E] transition-colors">
                {user?.full_name}
              </p>
              <p className="text-[11px] text-[#87918F] mt-1 uppercase font-semibold">
                {user?.role}
              </p>
            </div>
          </button>

          {/* Mobile Logout Quick Icon */}
          <button
            onClick={logout}
            title="Keluar"
            className="lg:hidden p-2 rounded-[8px] text-[#87918F] hover:text-[#A95353] hover:bg-[#F2E3E1] transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        user={user}
        onClose={() => setIsProfileOpen(false)}
        isSelf={true}
      />
    </>
  );
}
