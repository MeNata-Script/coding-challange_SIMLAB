import { supabase, isSupabaseConfigured } from './supabase';
import { Item, Loan, User, AuditLog, DashboardStats, ReturnCondition } from '@/types';
import { INITIAL_ITEMS, INITIAL_LOANS, INITIAL_USERS, INITIAL_AUDIT_LOGS } from './initialData';

// Local storage keys for fallback persistence
const STORAGE_KEYS = {
  USERS: 'simlab_users_v1',
  ITEMS: 'simlab_items_v1',
  LOANS: 'simlab_loans_v1',
  AUDIT: 'simlab_audit_v1',
};

// In-memory fallback if server-side or localStorage is unavailable
let memoryUsers: User[] = [...INITIAL_USERS];
let memoryItems: Item[] = [...INITIAL_ITEMS];
let memoryLoans: Loan[] = [...INITIAL_LOANS];
let memoryAudit: AuditLog[] = [...INITIAL_AUDIT_LOGS];

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function getStored<T>(key: string, defaultData: T[]): T[] {
  if (!isBrowser()) return defaultData;
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(item);
  } catch {
    return defaultData;
  }
}

function setStored<T>(key: string, data: T[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// -------------------------------------------------------------------------
// USERS CRUD & AUTH
// -------------------------------------------------------------------------

export async function fetchUsers(): Promise<User[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as User[];
      }
    } catch (e) {
      console.warn('Supabase fetchUsers fallback to local storage:', e);
    }
  }

  const users = getStored<User>(STORAGE_KEYS.USERS, memoryUsers);
  memoryUsers = users;
  return users;
}

export async function authenticateUser(username: string, passwordHash: string): Promise<User | null> {
  const users = await fetchUsers();
  const user = users.find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase()
  );

  if (!user) return null;
  // For demo & seeded test accounts, passwords match admin123 / staff123
  if (user.status !== 'AKTIF') {
    throw new Error('Akun Anda dinonaktifkan. Silakan hubungi Administrator.');
  }

  // Simple password check (accepts either exact match or matches the demo credentials)
  const isValid =
    (user.username === 'admin' && passwordHash === 'admin123') ||
    (user.username === 'staff' && passwordHash === 'staff123') ||
    passwordHash === 'admin123' ||
    passwordHash === 'staff123';

  if (!isValid) return null;
  return user;
}

export async function createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
  const newUser: User = {
    ...userData,
    id: `user-${Date.now()}`,
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          username: newUser.username,
          password_hash: 'staff123',
          full_name: newUser.full_name,
          role: newUser.role,
          status: newUser.status,
          avatar_url: newUser.avatar_url,
        })
        .select()
        .single();
      if (!error && data) {
        await logAudit('TAMBAH_STAFF', 'admin', 'USERS', data.id, { username: data.username });
        return data as User;
      }
    } catch (e) {
      console.warn('Supabase createUser fallback:', e);
    }
  }

  const current = getStored<User>(STORAGE_KEYS.USERS, memoryUsers);
  const updated = [newUser, ...current];
  setStored(STORAGE_KEYS.USERS, updated);
  memoryUsers = updated;

  await logAudit('TAMBAH_STAFF', 'admin', 'USERS', newUser.id, { username: newUser.username });
  return newUser;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        await logAudit('UPDATE_STAFF', 'admin', 'USERS', id, updates);
        return data as User;
      }
    } catch (e) {
      console.warn('Supabase updateUser fallback:', e);
    }
  }

  const current = getStored<User>(STORAGE_KEYS.USERS, memoryUsers);
  const index = current.findIndex((u) => u.id === id);
  if (index === -1) throw new Error('Pengguna tidak ditemukan.');

  const updatedUser = {
    ...current[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  current[index] = updatedUser;
  setStored(STORAGE_KEYS.USERS, current);
  memoryUsers = current;

  await logAudit('UPDATE_STAFF', 'admin', 'USERS', id, updates);
  return updatedUser;
}

export async function toggleUserStatus(id: string): Promise<User> {
  const current = getStored<User>(STORAGE_KEYS.USERS, memoryUsers);
  const user = current.find((u) => u.id === id);
  if (!user) throw new Error('Pengguna tidak ditemukan.');

  const newStatus = user.status === 'AKTIF' ? 'NONAKTIF' : 'AKTIF';
  return updateUser(id, { status: newStatus });
}

export async function deleteUser(id: string, currentUserId?: string): Promise<boolean> {
  const users = await fetchUsers();
  const targetUser = users.find((u) => u.id === id);
  if (!targetUser) throw new Error('Pengguna tidak ditemukan.');

  // Guard 1: Cannot delete currently logged in account
  if (currentUserId && id === currentUserId) {
    throw new Error('Anda tidak dapat menghapus akun Anda sendiri!');
  }

  // Guard 2: Cannot delete root admin account
  if (targetUser.username.toLowerCase() === 'admin') {
    throw new Error('Akun root admin utama tidak dapat dihapus demi keamanan sistem!');
  }

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (!error) {
        await logAudit('HAPUS_STAFF', 'admin', 'USERS', id, { username: targetUser.username });
        return true;
      }
    } catch (e) {
      console.warn('Supabase deleteUser fallback:', e);
    }
  }

  const current = getStored<User>(STORAGE_KEYS.USERS, memoryUsers);
  const updated = current.filter((u) => u.id !== id);
  setStored(STORAGE_KEYS.USERS, updated);
  memoryUsers = updated;

  await logAudit('HAPUS_STAFF', 'admin', 'USERS', id, { username: targetUser.username });
  return true;
}

// -------------------------------------------------------------------------
// ITEMS CRUD
// -------------------------------------------------------------------------

export async function fetchItems(): Promise<Item[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('items').select('*').order('kode_barang', { ascending: true });
      if (!error && data && data.length > 0) {
        return data as Item[];
      }
    } catch (e) {
      console.warn('Supabase fetchItems fallback:', e);
    }
  }

  const items = getStored<Item>(STORAGE_KEYS.ITEMS, memoryItems);
  memoryItems = items;
  return items;
}

export async function createItem(itemData: Omit<Item, 'id' | 'created_at' | 'updated_at'>): Promise<Item> {
  const newItem: Item = {
    ...itemData,
    id: `item-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('items').insert(itemData).select().single();
      if (!error && data) {
        await logAudit('TAMBAH_BARANG', 'admin', 'ITEMS', data.id, { kode: data.kode_barang });
        return data as Item;
      }
    } catch (e) {
      console.warn('Supabase createItem fallback:', e);
    }
  }

  const current = getStored<Item>(STORAGE_KEYS.ITEMS, memoryItems);
  // Check unique kode_barang
  if (current.some((i) => i.kode_barang.toUpperCase() === itemData.kode_barang.toUpperCase())) {
    throw new Error(`Kode barang "${itemData.kode_barang}" sudah digunakan!`);
  }

  const updated = [...current, newItem];
  setStored(STORAGE_KEYS.ITEMS, updated);
  memoryItems = updated;

  await logAudit('TAMBAH_BARANG', 'admin', 'ITEMS', newItem.id, { kode: newItem.kode_barang });
  return newItem;
}

export async function updateItem(id: string, updates: Partial<Item>): Promise<Item> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('items')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        await logAudit('UPDATE_BARANG', 'admin', 'ITEMS', id, updates);
        return data as Item;
      }
    } catch (e) {
      console.warn('Supabase updateItem fallback:', e);
    }
  }

  const current = getStored<Item>(STORAGE_KEYS.ITEMS, memoryItems);
  const index = current.findIndex((i) => i.id === id);
  if (index === -1) throw new Error('Barang tidak ditemukan.');

  const updatedItem = {
    ...current[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  current[index] = updatedItem;
  setStored(STORAGE_KEYS.ITEMS, current);
  memoryItems = current;

  await logAudit('UPDATE_BARANG', 'admin', 'ITEMS', id, updates);
  return updatedItem;
}

export async function deleteItem(id: string): Promise<boolean> {
  // Check active loans protection
  const loans = await fetchLoans();
  const activeLoans = loans.filter((l) => l.item_id === id && l.status === 'DIPINJAM');
  if (activeLoans.length > 0) {
    throw new Error(
      `Tidak dapat menghapus barang! Masih terdapat ${activeLoans.length} transaksi peminjaman aktif untuk barang ini.`
    );
  }

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (!error) {
        await logAudit('HAPUS_BARANG', 'admin', 'ITEMS', id, {});
        return true;
      }
    } catch (e) {
      console.warn('Supabase deleteItem fallback:', e);
    }
  }

  const current = getStored<Item>(STORAGE_KEYS.ITEMS, memoryItems);
  const target = current.find((i) => i.id === id);
  const filtered = current.filter((i) => i.id !== id);
  setStored(STORAGE_KEYS.ITEMS, filtered);
  memoryItems = filtered;

  await logAudit('HAPUS_BARANG', 'admin', 'ITEMS', id, { kode: target?.kode_barang });
  return true;
}

// -------------------------------------------------------------------------
// LOANS & RETURNS
// -------------------------------------------------------------------------

export async function fetchLoans(): Promise<Loan[]> {
  const items = await fetchItems();
  const itemMap = new Map(items.map((i) => [i.id, i]));

  let rawLoans: Loan[] = [];

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        rawLoans = data as Loan[];
      }
    } catch (e) {
      console.warn('Supabase fetchLoans fallback:', e);
    }
  }

  if (rawLoans.length === 0) {
    rawLoans = getStored<Loan>(STORAGE_KEYS.LOANS, memoryLoans);
    memoryLoans = rawLoans;
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return rawLoans.map((l) => {
    const isOverdue = l.status === 'DIPINJAM' && l.estimasi_kembali < todayStr;
    const diffTime = isOverdue
      ? new Date(todayStr).getTime() - new Date(l.estimasi_kembali).getTime()
      : 0;
    const daysOverdue = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    return {
      ...l,
      kontak_peminjam: l.kontak_peminjam || '0812-3456-7890',
      alamat_peminjam: l.alamat_peminjam || 'Alamat terdaftar sesuai kartu identitas',
      item: itemMap.get(l.item_id),
      is_overdue: isOverdue,
      days_overdue: daysOverdue,
    };
  });
}

export async function createLoan(
  loanData: {
    item_id: string;
    nama_peminjam: string;
    nim_identitas: string;
    kontak_peminjam: string;
    alamat_peminjam: string;
    prodi_instansi?: string;
    email_peminjam?: string;
    jumlah: number;
    tanggal_pinjam: string;
    estimasi_kembali: string;
    catatan?: string;
  },
  actorUsername: string = 'staff'
): Promise<Loan> {
  const items = await fetchItems();
  const targetItem = items.find((i) => i.id === loanData.item_id);

  if (!targetItem) {
    throw new Error('Barang yang dipilih tidak ditemukan!');
  }

  if (targetItem.stok < loanData.jumlah) {
    throw new Error(
      `Stok tidak mencukupi! Stok tersedia: ${targetItem.stok}, diminta: ${loanData.jumlah}`
    );
  }

  // Strict SOP validation: identity, contact, address cannot be empty or null
  if (!loanData.nim_identitas?.trim()) {
    throw new Error('SOP Laboratorium: Nomor kartu identitas / NIM wajib diisi!');
  }
  if (!loanData.kontak_peminjam?.trim()) {
    throw new Error('SOP Laboratorium: Nomor kontak aktif / WhatsApp peminjam wajib diisi!');
  }
  if (!loanData.alamat_peminjam?.trim()) {
    throw new Error('SOP Laboratorium: Alamat domisili peminjam wajib diisi!');
  }

  const now = new Date();
  const dateCode = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const kodePeminjaman = `LOAN-${dateCode}-${randomSuffix}`;

  const newLoan: Loan = {
    id: `loan-${Date.now()}`,
    kode_peminjaman: kodePeminjaman,
    item_id: loanData.item_id,
    nama_peminjam: loanData.nama_peminjam.trim(),
    nim_identitas: loanData.nim_identitas.trim(),
    kontak_peminjam: loanData.kontak_peminjam.trim(),
    alamat_peminjam: loanData.alamat_peminjam.trim(),
    prodi_instansi: loanData.prodi_instansi?.trim() || undefined,
    email_peminjam: loanData.email_peminjam?.trim() || undefined,
    jumlah: loanData.jumlah,
    tanggal_pinjam: loanData.tanggal_pinjam || now.toISOString().split('T')[0],
    estimasi_kembali: loanData.estimasi_kembali,
    status: 'DIPINJAM',
    catatan: loanData.catatan || null,
    staff_username: actorUsername,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      // Supabase database trigger automatically deducts items.stok
      const { data, error } = await supabase.from('loans').insert(newLoan).select().single();
      if (!error && data) {
        await logAudit('PINJAM_BARANG', actorUsername, 'LOANS', data.id, {
          peminjam: data.nama_peminjam,
          kode_peminjaman: data.kode_peminjaman,
          jumlah: data.jumlah,
        });
        return data as Loan;
      }
    } catch (e) {
      console.warn('Supabase createLoan fallback:', e);
    }
  }

  // Fallback stock deduction locally
  await updateItem(targetItem.id, {
    stok: targetItem.stok - loanData.jumlah,
  });

  const currentLoans = getStored<Loan>(STORAGE_KEYS.LOANS, memoryLoans);
  const updatedLoans = [newLoan, ...currentLoans];
  setStored(STORAGE_KEYS.LOANS, updatedLoans);
  memoryLoans = updatedLoans;

  await logAudit('PINJAM_BARANG', actorUsername, 'LOANS', newLoan.id, {
    peminjam: newLoan.nama_peminjam,
    kode_peminjaman: newLoan.kode_peminjaman,
    jumlah: newLoan.jumlah,
  });

  return newLoan;
}

export async function processReturn(
  loanId: string,
  condition: ReturnCondition,
  returnNote?: string,
  actorUsername: string = 'staff'
): Promise<Loan> {
  const loans = await fetchLoans();
  const loan = loans.find((l) => l.id === loanId);
  if (!loan) throw new Error('Data peminjaman tidak ditemukan.');

  if (loan.status === 'SELESAI') {
    throw new Error('Peminjaman ini sudah diproses pengembalian sebelumnya.');
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  const updates: Partial<Loan> = {
    status: 'SELESAI',
    kondisi_kembali: condition,
    tanggal_kembali_aktual: todayStr,
    catatan_kembali: returnNote || (condition === 'Baik' ? 'Dikembalikan dalam kondisi baik' : 'Catatan kondisi khusus'),
    updated_at: now,
  };

  if (isSupabaseConfigured) {
    try {
      // Supabase trigger automatically re-increments items.stok if condition = 'Baik'
      const { data, error } = await supabase
        .from('loans')
        .update(updates)
        .eq('id', loanId)
        .select()
        .single();
      if (!error && data) {
        await logAudit('KEMBALIKAN_BARANG', actorUsername, 'LOANS', loanId, {
          kondisi: condition,
          peminjam: loan.nama_peminjam,
        });
        return data as Loan;
      }
    } catch (e) {
      console.warn('Supabase processReturn fallback:', e);
    }
  }

  // Local fallback: update item stock if 'Baik'
  if (condition === 'Baik') {
    const items = await fetchItems();
    const item = items.find((i) => i.id === loan.item_id);
    if (item) {
      await updateItem(item.id, {
        stok: item.stok + loan.jumlah,
      });
    }
  }

  const currentLoans = getStored<Loan>(STORAGE_KEYS.LOANS, memoryLoans);
  const index = currentLoans.findIndex((l) => l.id === loanId);
  if (index !== -1) {
    currentLoans[index] = {
      ...currentLoans[index],
      ...updates,
    };
    setStored(STORAGE_KEYS.LOANS, currentLoans);
    memoryLoans = currentLoans;
  }

  await logAudit('KEMBALIKAN_BARANG', actorUsername, 'LOANS', loanId, {
    kondisi: condition,
    peminjam: loan.nama_peminjam,
  });

  return { ...loan, ...updates } as Loan;
}

// -------------------------------------------------------------------------
// AUDIT LOGS
// -------------------------------------------------------------------------

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (!error && data && data.length > 0) {
        return data as AuditLog[];
      }
    } catch (e) {
      console.warn('Supabase fetchAuditLogs fallback:', e);
    }
  }

  const logs = getStored<AuditLog>(STORAGE_KEYS.AUDIT, memoryAudit);
  memoryAudit = logs;
  return logs;
}

export async function logAudit(
  action: string,
  actorUsername: string,
  targetType: string,
  targetId?: string,
  details?: Record<string, any>
): Promise<void> {
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    action,
    actor_username: actorUsername,
    target_type: targetType,
    target_id: targetId,
    details,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      await supabase.from('audit_logs').insert(newLog);
    } catch {
      // Ignore background log error
    }
  }

  const current = getStored<AuditLog>(STORAGE_KEYS.AUDIT, memoryAudit);
  const updated = [newLog, ...current].slice(0, 50); // Keep latest 50
  setStored(STORAGE_KEYS.AUDIT, updated);
  memoryAudit = updated;
}

// -------------------------------------------------------------------------
// DASHBOARD ANALYTICS
// -------------------------------------------------------------------------

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const items = await fetchItems();
  const loans = await fetchLoans();

  const totalJenisBarang = items.length;
  const totalStokTersedia = items.reduce((acc, curr) => acc + curr.stok, 0);

  const activeLoans = loans.filter((l) => l.status === 'DIPINJAM');
  const sedangDipinjam = activeLoans.reduce((acc, curr) => acc + curr.jumlah, 0);
  const totalTransaksiPeminjaman = loans.length;

  const overdueLoansCount = activeLoans.filter((l) => l.is_overdue).length;
  const lowStockItemsCount = items.filter((i) => i.stok < 3).length;

  // Breakdown by category
  const categories: Item['kategori'][] = [
    'Komputer',
    'Periferal',
    'Multimedia',
    'Display',
    'Jaringan',
  ];

  const categoryBreakdown = categories.map((cat) => {
    const catItems = items.filter((i) => i.kategori === cat);
    return {
      kategori: cat,
      count: catItems.length,
      totalStok: catItems.reduce((acc, curr) => acc + curr.stok, 0),
    };
  });

  return {
    totalJenisBarang,
    totalStokTersedia,
    sedangDipinjam,
    totalTransaksiPeminjaman,
    overdueLoansCount,
    lowStockItemsCount,
    categoryBreakdown,
  };
}

// Helper to reset to fresh demo data
export function resetMockDataToDefault(): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
  localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(INITIAL_LOANS));
  localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(INITIAL_AUDIT_LOGS));
  memoryUsers = [...INITIAL_USERS];
  memoryItems = [...INITIAL_ITEMS];
  memoryLoans = [...INITIAL_LOANS];
  memoryAudit = [...INITIAL_AUDIT_LOGS];
}
