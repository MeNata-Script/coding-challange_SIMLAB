'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const value = {
    toast: addToast,
    success: (title: string, message?: string) => addToast('success', title, message),
    error: (title: string, message?: string) => addToast('error', title, message),
    warning: (title: string, message?: string) => addToast('warning', title, message),
    info: (title: string, message?: string) => addToast('info', title, message),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const config = {
            success: {
              style: 'border-[#548C75]/30 bg-[#E1EDE4] text-[#2E3B40]',
              icon: <CheckCircle2 className="w-5 h-5 text-[#548C75] shrink-0" />,
            },
            error: {
              style: 'border-[#A95353]/30 bg-[#F2E3E1] text-[#2E3B40]',
              icon: <AlertCircle className="w-5 h-5 text-[#A95353] shrink-0" />,
            },
            warning: {
              style: 'border-[#9A7137]/30 bg-[#F2EBDD] text-[#2E3B40]',
              icon: <AlertTriangle className="w-5 h-5 text-[#9A7137] shrink-0" />,
            },
            info: {
              style: 'border-[#527493]/30 bg-[#E3EAF0] text-[#2E3B40]',
              icon: <Info className="w-5 h-5 text-[#527493] shrink-0" />,
            },
          }[t.type];

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-[14px] border shadow-soft transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${config.style}`}
            >
              {config.icon}
              <div className="flex-1 text-sm">
                <p className="font-semibold text-[#2E3B40] text-[14px]">{t.title}</p>
                {t.message && <p className="text-[#69777A] text-[13px] mt-0.5 leading-relaxed">{t.message}</p>}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-[#87918F] hover:text-[#2E3B40] transition-colors -mr-1 -mt-1 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
