export type UserRole = 'ADMIN' | 'STAFF';
export type UserStatus = 'AKTIF' | 'NONAKTIF';

export interface User {
  id: string;
  username: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export type ItemCategory =
  | 'Komputer'
  | 'Periferal'
  | 'Multimedia'
  | 'Display'
  | 'Jaringan'
  | 'Lainnya';

export interface Item {
  id: string;
  kode_barang: string;
  nama_barang: string;
  kategori: ItemCategory;
  stok: number;
  lokasi_penyimpanan: string;
  kondisi: 'Baik' | 'Perlu Perbaikan' | 'Rusak';
  spesifikasi: string;
  created_at: string;
  updated_at: string;
}

export type LoanStatus = 'DIPINJAM' | 'SELESAI';
export type ReturnCondition = 'Baik' | 'Perlu Perbaikan' | 'Rusak';

export interface Loan {
  id: string;
  kode_peminjaman: string;
  item_id: string;
  item?: Item; // Joined item info
  nama_peminjam: string;
  nim_identitas: string;
  jumlah: number;
  tanggal_pinjam: string;
  estimasi_kembali: string;
  tanggal_kembali_aktual?: string | null;
  status: LoanStatus;
  kondisi_kembali?: ReturnCondition | null;
  catatan?: string | null;
  catatan_kembali?: string | null;
  staff_username?: string;
  created_at: string;
  updated_at: string;
  // Computed helpers:
  is_overdue?: boolean;
  days_overdue?: number;
}

export interface AuditLog {
  id: string;
  action: string;
  actor_username: string;
  target_type: string;
  target_id?: string;
  details?: Record<string, any>;
  created_at: string;
}

export interface DashboardStats {
  totalJenisBarang: number;
  totalStokTersedia: number;
  sedangDipinjam: number;
  totalTransaksiPeminjaman: number;
  overdueLoansCount: number;
  lowStockItemsCount: number;
  categoryBreakdown: {
    kategori: ItemCategory;
    count: number;
    totalStok: number;
  }[];
}
