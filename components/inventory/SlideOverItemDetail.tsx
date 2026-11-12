'use client';

import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Item, Loan } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  X,
  Printer,
  QrCode,
  MapPin,
  Layers,
  Cpu,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldAlert,
} from 'lucide-react';

interface SlideOverItemDetailProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  loans?: Loan[];
}

export default function SlideOverItemDetail({
  item,
  isOpen,
  onClose,
  loans = [],
}: SlideOverItemDetailProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (item) {
      // Generate standard lab QR payload
      const payload = JSON.stringify({
        id: item.id,
        kode: item.kode_barang,
        nama: item.nama_barang,
        kategori: item.kategori,
        lab: 'Laboratorium Komputasi',
      });

      QRCode.toDataURL(payload, {
        width: 260,
        margin: 2,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR Gen error:', err));
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const itemLoans = loans.filter((l) => l.item_id === item.id);
  const activeLoans = itemLoans.filter((l) => l.status === 'DIPINJAM');

  const handlePrint = () => {
    const printContent = document.getElementById('qr-printable-area');
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=600,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Label Inventaris - ${item.kode_barang}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; text-align: center; }
            .card { border: 2px dashed #0f172a; border-radius: 12px; padding: 18px; max-width: 320px; margin: 0 auto; }
            .title { font-size: 16px; font-weight: bold; margin-bottom: 2px; }
            .subtitle { font-size: 11px; color: #64748b; margin-bottom: 12px; }
            .qr-img { width: 180px; height: 180px; margin: 0 auto 10px; display: block; }
            .code-badge { font-family: monospace; font-size: 15px; font-weight: bold; background: #e2e8f0; padding: 4px 10px; border-radius: 6px; display: inline-block; }
            .item-name { font-size: 13px; font-weight: 600; margin-top: 6px; }
            .footer { font-size: 9px; color: #94a3b8; margin-top: 12px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="title">SISTEM INVENTARIS LAB</div>
            <div class="subtitle">Laboratorium Komputasi & Jaringan</div>
            <img class="qr-img" src="${qrDataUrl}" alt="QR Code" />
            <div>
              <span class="code-badge">${item.kode_barang}</span>
            </div>
            <div class="item-name">${item.nama_barang}</div>
            <div style="font-size: 11px; color: #475569; margin-top: 4px;">Lokasi: ${item.lokasi_penyimpanan}</div>
            <div class="footer">Dicetak pada ${new Date().toLocaleDateString('id-ID')} | Lab Management</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div>
              <span className="text-[11px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                {item.kode_barang}
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">{item.nama_barang}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Printable QR Tag Section (Value-Add) */}
            <div
              id="qr-printable-area"
              ref={printRef}
              className="p-5 rounded-2xl border-2 border-dashed border-indigo-200 bg-gradient-to-b from-indigo-50/40 to-white flex flex-col items-center text-center shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 mb-2">
                <QrCode className="w-4 h-4" />
                <span>QR Tag Identitas Barang</span>
              </div>

              {qrDataUrl ? (
                <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                  <img
                    src={qrDataUrl}
                    alt={`QR Code ${item.kode_barang}`}
                    className="w-44 h-44 object-contain"
                  />
                </div>
              ) : (
                <div className="w-44 h-44 bg-slate-100 rounded-xl animate-pulse flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-slate-400" />
                </div>
              )}

              <div className="mt-3">
                <span className="font-mono text-xs font-bold text-slate-900 px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200">
                  {item.kode_barang}
                </span>
                <p className="text-xs text-slate-600 font-medium mt-1.5">{item.nama_barang}</p>
              </div>

              <button
                onClick={handlePrint}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm hover:shadow transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Label QR</span>
              </button>
            </div>

            {/* Quick Specs & Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] text-slate-500 font-medium">Stok Tersedia</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span
                    className={`text-2xl font-bold ${
                      item.stok === 0
                        ? 'text-rose-600'
                        : item.stok <= 2
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {item.stok}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">unit</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] text-slate-500 font-medium">Sedang Dipinjam</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-bold text-slate-800">
                    {activeLoans.reduce((acc, curr) => acc + curr.jumlah, 0)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">unit</span>
                </div>
              </div>
            </div>

            {/* Information List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Spesifikasi & Lokasi
              </h3>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <Layers className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-700">Kategori</p>
                  <p className="text-slate-600 mt-0.5">{item.kategori}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-700">Lokasi Rak/Penyimpanan</p>
                  <p className="text-slate-600 mt-0.5">{item.lokasi_penyimpanan}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <Cpu className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-700">Spesifikasi Detail</p>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    {item.spesifikasi || 'Tidak ada spesifikasi khusus.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Active Loans for this item */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Peminjam Aktif Saat Ini ({activeLoans.length})
              </h3>

              {activeLoans.length === 0 ? (
                <div className="p-4 rounded-xl border border-slate-200 text-center text-xs text-slate-500 bg-slate-50/50">
                  Tidak ada peminjaman aktif untuk barang ini.
                </div>
              ) : (
                <div className="space-y-2">
                  {activeLoans.map((l) => (
                    <div
                      key={l.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white text-xs flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">{l.nama_peminjam}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{l.nim_identitas}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Tenggat: {formatDate(l.estimasi_kembali)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-indigo-600">{l.jumlah} unit</span>
                        {l.is_overdue && (
                          <span className="block text-[10px] text-rose-600 font-semibold mt-1">
                            Terlambat
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
            >
              Tutup Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
