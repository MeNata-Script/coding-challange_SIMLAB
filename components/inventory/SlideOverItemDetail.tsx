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
          dark: '#2E3B40',
          light: '#F4F5F1',
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
            body { font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; text-align: center; background: #fafafa; }
            .card { border: 2px dashed #34495e; border-radius: 12px; padding: 18px; max-width: 320px; margin: 0 auto; background: #ffffff; }
            .title { font-size: 16px; font-weight: 700; color: #2e3b40; margin-bottom: 2px; }
            .subtitle { font-size: 11px; color: #69777a; margin-bottom: 12px; }
            .qr-img { width: 170px; height: 170px; margin: 0 auto 10px; display: block; }
            .code-badge { font-family: monospace; font-size: 15px; font-weight: 700; background: #dce8e2; color: #34495e; padding: 4px 10px; border-radius: 6px; display: inline-block; }
            .item-name { font-size: 14px; font-weight: 600; color: #2e3b40; margin-top: 8px; }
            .footer { font-size: 10px; color: #87918f; margin-top: 12px; border-top: 1px solid #e2e9e3; padding-top: 8px; }
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
            <div style="font-size: 12px; color: #69777a; margin-top: 4px;">Lokasi: ${item.lokasi_penyimpanan}</div>
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
        className="absolute inset-0 bg-[#2E3B40]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#F4F5F1] shadow-modal border-l border-[#D9DFDA] flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#D9DFDA] flex items-center justify-between bg-[#E2E9E3]">
            <div>
              <span className="text-[11px] font-mono font-semibold uppercase px-2 py-0.5 rounded-[4px] bg-[#DCE8E2] text-[#34495E] border border-[#D9DFDA]">
                {item.kode_barang}
              </span>
              <h2 className="text-[17px] font-semibold text-[#2E3B40] mt-1">{item.nama_barang}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-[8px] text-[#87918F] hover:text-[#2E3B40] hover:bg-[#ECEFEA] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Printable QR Tag Section */}
            <div
              id="qr-printable-area"
              ref={printRef}
              className="p-5 rounded-[14px] border border-dashed border-[#D9DFDA] bg-[#ECEFEA] flex flex-col items-center text-center"
            >
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#34495E] mb-2.5">
                <QrCode className="w-4 h-4 text-[#648F87]" />
                <span>QR Tag Identitas Barang</span>
              </div>

              {qrDataUrl ? (
                <div className="p-2.5 bg-[#F4F5F1] rounded-[10px] border border-[#D9DFDA]">
                  <img
                    src={qrDataUrl}
                    alt={`QR Code ${item.kode_barang}`}
                    className="w-40 h-40 object-contain"
                  />
                </div>
              ) : (
                <div className="w-40 h-40 bg-[#E9ECE7] rounded-[10px] animate-pulse flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-[#87918F]" />
                </div>
              )}

              <div className="mt-3">
                <span className="font-mono text-[12px] font-bold text-[#34495E] px-2.5 py-1 bg-[#DCE8E2] rounded-[6px] border border-[#D9DFDA]">
                  {item.kode_barang}
                </span>
                <p className="text-[13px] text-[#2E3B40] font-medium mt-1.5">{item.nama_barang}</p>
              </div>

              <button
                onClick={handlePrint}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-[#F4F5F1] bg-[#34495E] hover:bg-[#293B4D] rounded-[10px] transition-colors shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Label QR</span>
              </button>
            </div>

            {/* Quick Specs & Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-[12px] bg-[#ECEFEA] border border-[#D9DFDA]">
                <span className="text-[12px] text-[#87918F] font-medium">Stok Tersedia</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span
                    className={`text-[24px] font-bold ${
                      item.stok === 0
                        ? 'text-[#A95353]'
                        : item.stok <= 2
                        ? 'text-[#9A7137]'
                        : 'text-[#548C75]'
                    }`}
                  >
                    {item.stok}
                  </span>
                  <span className="text-[12px] text-[#87918F]">unit</span>
                </div>
              </div>

              <div className="p-3.5 rounded-[12px] bg-[#ECEFEA] border border-[#D9DFDA]">
                <span className="text-[12px] text-[#87918F] font-medium">Sedang Dipinjam</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-[24px] font-bold text-[#2E3B40]">
                    {activeLoans.reduce((acc, curr) => acc + curr.jumlah, 0)}
                  </span>
                  <span className="text-[12px] text-[#87918F]">unit</span>
                </div>
              </div>
            </div>

            {/* Information List */}
            <div className="space-y-2.5">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#87918F]">
                Spesifikasi & Lokasi
              </h3>

              <div className="flex items-start gap-3 p-3 rounded-[10px] bg-[#ECEFEA] border border-[#D9DFDA] text-[13px]">
                <Layers className="w-4 h-4 text-[#648F87] mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-[#2E3B40]">Kategori</p>
                  <p className="text-[#69777A] mt-0.5">{item.kategori}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-[10px] bg-[#ECEFEA] border border-[#D9DFDA] text-[13px]">
                <MapPin className="w-4 h-4 text-[#648F87] mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-[#2E3B40]">Lokasi Rak/Penyimpanan</p>
                  <p className="text-[#69777A] mt-0.5">{item.lokasi_penyimpanan}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-[10px] bg-[#ECEFEA] border border-[#D9DFDA] text-[13px]">
                <Cpu className="w-4 h-4 text-[#648F87] mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-[#2E3B40]">Spesifikasi Detail</p>
                  <p className="text-[#69777A] mt-0.5 leading-relaxed">
                    {item.spesifikasi || 'Tidak ada spesifikasi khusus.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Active Loans for this item */}
            <div className="space-y-2.5">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#87918F]">
                Peminjam Aktif Saat Ini ({activeLoans.length})
              </h3>

              {activeLoans.length === 0 ? (
                <div className="p-4 rounded-[10px] border border-[#D9DFDA] text-center text-[12px] text-[#87918F] bg-[#ECEFEA]">
                  Tidak ada peminjaman aktif untuk barang ini.
                </div>
              ) : (
                <div className="space-y-2">
                  {activeLoans.map((l) => (
                    <div
                      key={l.id}
                      className="p-3 rounded-[10px] border border-[#D9DFDA] bg-[#ECEFEA] text-[13px] flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-[#2E3B40]">{l.nama_peminjam}</p>
                        <p className="text-[11px] text-[#69777A] font-mono">{l.nim_identitas}</p>
                        <p className="text-[11px] text-[#87918F] mt-0.5">
                          Tenggat: {formatDate(l.estimasi_kembali)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#34495E]">{l.jumlah} unit</span>
                        {l.is_overdue && (
                          <span className="block text-[10px] text-[#A95353] font-semibold mt-1">
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
          <div className="p-4 border-t border-[#D9DFDA] bg-[#E2E9E3] flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium text-[#34495E] bg-[#DCE8E2] hover:bg-[#C8DBD3] rounded-[8px] border border-[#D9DFDA] transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
