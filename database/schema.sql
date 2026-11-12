-- =========================================================================
-- SISTEM MANAJEMEN INVENTARIS & PEMINJAMAN LABORATORIUM (SIMLAB)
-- Database: PostgreSQL (Supabase Compatible)
-- Schema Setup, RLS Policies, Automatic Stock Triggers, and Seed Data
-- =========================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables & functions cleanly with CASCADE if re-running
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP FUNCTION IF EXISTS fn_loans_handle_borrow() CASCADE;
DROP FUNCTION IF EXISTS fn_loans_handle_return() CASCADE;
DROP FUNCTION IF EXISTS fn_items_prevent_delete_if_active_loan() CASCADE;

-- =========================================================================
-- 2. TABLES
-- =========================================================================

-- TABLE: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'STAFF')),
    status VARCHAR(20) NOT NULL DEFAULT 'AKTIF' CHECK (status IN ('AKTIF', 'NONAKTIF')),
    avatar_url TEXT,
    email VARCHAR(100),
    phone VARCHAR(30),
    jabatan VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLE: items
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_barang VARCHAR(50) UNIQUE NOT NULL,
    nama_barang VARCHAR(150) NOT NULL,
    kategori VARCHAR(50) NOT NULL CHECK (kategori IN ('Komputer', 'Periferal', 'Multimedia', 'Display', 'Jaringan', 'Lainnya')),
    stok INTEGER NOT NULL DEFAULT 0 CHECK (stok >= 0),
    lokasi_penyimpanan VARCHAR(100) NOT NULL DEFAULT 'Lab Komputer Utama (Rak A1)',
    kondisi VARCHAR(50) NOT NULL DEFAULT 'Baik',
    spesifikasi TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLE: loans (Peminjaman & Pengembalian)
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_peminjaman VARCHAR(50) UNIQUE NOT NULL,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    nama_peminjam VARCHAR(100) NOT NULL,
    nim_identitas VARCHAR(50) NOT NULL,
    kontak_peminjam VARCHAR(50) NOT NULL,
    alamat_peminjam TEXT NOT NULL,
    prodi_instansi VARCHAR(100),
    email_peminjam VARCHAR(100),
    jumlah INTEGER NOT NULL CHECK (jumlah > 0),
    tanggal_pinjam DATE NOT NULL DEFAULT CURRENT_DATE,
    estimasi_kembali DATE NOT NULL,
    tanggal_kembali_aktual DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'DIPINJAM' CHECK (status IN ('DIPINJAM', 'SELESAI')),
    kondisi_kembali VARCHAR(30) CHECK (kondisi_kembali IN ('Baik', 'Perlu Perbaikan', 'Rusak')),
    catatan TEXT,
    catatan_kembali TEXT,
    staff_username VARCHAR(50) REFERENCES users(username) ON UPDATE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLE: audit_logs (Riwayat Audit Aktivitas)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(100) NOT NULL,
    actor_username VARCHAR(50) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(100),
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================================
-- 3. INDEXES FOR HIGH QUERY PERFORMANCE
-- =========================================================================
CREATE INDEX idx_items_kategori ON items(kategori);
CREATE INDEX idx_items_kode ON items(kode_barang);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_item_id ON loans(item_id);
CREATE INDEX idx_loans_estimasi ON loans(estimasi_kembali);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- =========================================================================
-- 4. AUTOMATIC STOCK & INTEGRITY TRIGGERS
-- =========================================================================

-- Trigger 1: Kurangi stok saat peminjaman dibuat
CREATE OR REPLACE FUNCTION fn_loans_handle_borrow()
RETURNS TRIGGER AS $$
DECLARE
    current_stock INTEGER;
BEGIN
    SELECT stok INTO current_stock FROM items WHERE id = NEW.item_id FOR UPDATE;

    IF current_stock IS NULL THEN
        RAISE EXCEPTION 'Barang dengan ID % tidak ditemukan!', NEW.item_id;
    END IF;

    IF current_stock < NEW.jumlah THEN
        RAISE EXCEPTION 'Stok barang tidak mencukupi! Tersedia: %, diminta: %', current_stock, NEW.jumlah;
    END IF;

    UPDATE items
    SET stok = stok - NEW.jumlah,
        updated_at = now()
    WHERE id = NEW.item_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_loans_insert_stock
BEFORE INSERT ON loans
FOR EACH ROW
EXECUTE FUNCTION fn_loans_handle_borrow();

-- Trigger 2: Kembalikan stok saat peminjaman berstatus SELESAI
CREATE OR REPLACE FUNCTION fn_loans_handle_return()
RETURNS TRIGGER AS $$
BEGIN
    -- Hanya berjalan ketika status berubah dari 'DIPINJAM' ke 'SELESAI'
    IF OLD.status = 'DIPINJAM' AND NEW.status = 'SELESAI' THEN
        -- Jika kondisi kembali 'Baik', stok ditambahkan kembali ke inventaris aktif
        IF NEW.kondisi_kembali = 'Baik' THEN
            UPDATE items
            SET stok = stok + NEW.jumlah,
                updated_at = now()
            WHERE id = NEW.item_id;
        END IF;

        -- Jika kondisi 'Perlu Perbaikan' atau 'Rusak', stok tidak langsung ditambah ke stok siap pakai
        -- Item dicatat status kerusakannya
        IF NEW.kondisi_kembali IN ('Perlu Perbaikan', 'Rusak') THEN
            -- Tidak menambah stok siap pakai; catat catatan pemeliharaan jika diperlukan
            UPDATE items
            SET updated_at = now()
            WHERE id = NEW.item_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_loans_return_stock
AFTER UPDATE ON loans
FOR EACH ROW
EXECUTE FUNCTION fn_loans_handle_return();

-- Trigger 3: Larang penghapusan barang jika masih ada peminjaman aktif
CREATE OR REPLACE FUNCTION fn_items_prevent_delete_if_active_loan()
RETURNS TRIGGER AS $$
DECLARE
    active_loans_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO active_loans_count
    FROM loans
    WHERE item_id = OLD.id AND status = 'DIPINJAM';

    IF active_loans_count > 0 THEN
        RAISE EXCEPTION 'Penghapusan dibatalkan! Barang % masih memiliki % peminjaman aktif yang belum dikembalikan.', OLD.kode_barang, active_loans_count;
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_items_prevent_delete_active
BEFORE DELETE ON items
FOR EACH ROW
EXECUTE FUNCTION fn_items_prevent_delete_if_active_loan();

-- =========================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow anon & authenticated client full read/write for demo/application operational purposes
CREATE POLICY "Public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Public write users" ON users FOR ALL USING (true);

CREATE POLICY "Public read items" ON items FOR SELECT USING (true);
CREATE POLICY "Public write items" ON items FOR ALL USING (true);

CREATE POLICY "Public read loans" ON loans FOR SELECT USING (true);
CREATE POLICY "Public write loans" ON loans FOR ALL USING (true);

CREATE POLICY "Public read audit_logs" ON audit_logs FOR SELECT USING (true);
CREATE POLICY "Public write audit_logs" ON audit_logs FOR INSERT WITH CHECK (true);

-- =========================================================================
-- 6. MANDATORY INITIAL SEED DATA
-- =========================================================================

-- Seed Users: Admin & Staff (Default Admin: Yeni Natalia)
INSERT INTO users (username, password_hash, full_name, role, status, email, phone, jabatan) VALUES
('admin', 'admin123', 'Yeni Natalia', 'ADMIN', 'AKTIF', 'yeni.natalia@simlab.ac.id', '081234567890', 'Kepala Laboratorium Komputasi'),
('staff', 'staff123', 'Budi Santoso', 'STAFF', 'AKTIF', 'budi.santoso@simlab.ac.id', '085712345678', 'Teknisi Operasional Lab')
ON CONFLICT (username) DO NOTHING;

-- Seed Mandatory Items
INSERT INTO items (kode_barang, nama_barang, kategori, stok, lokasi_penyimpanan, kondisi, spesifikasi) VALUES
('BR001', 'Laptop Lenovo', 'Komputer', 5, 'Lab Komputer Utama (Lemari L1)', 'Baik', 'Intel Core i5 Gen 11, RAM 16GB, SSD 512GB, Display 14 FHD'),
('BR002', 'Mouse Logitech', 'Periferal', 10, 'Lab Komputer Utama (Laci P1)', 'Baik', 'Logitech B100 Optical USB Mouse, Panjang kabel 1.8m'),
('BR003', 'Keyboard Mechanical', 'Periferal', 8, 'Lab Komputer Utama (Laci P2)', 'Baik', 'Blue Switch TKL, Rainbow Backlit, USB-C Detachable'),
('BR004', 'Proyektor Epson', 'Multimedia', 3, 'Ruang Multimedia (Lemari M1)', 'Baik', 'Epson EB-X400 3300 Lumens XGA 3LCD Projector, HDMI/VGA'),
('BR005', 'Monitor LG', 'Display', 6, 'Lab Komputer Utama (Rak D1)', 'Baik', 'LG 24MP400 24 Inch Full HD IPS 75Hz AMD FreeSync'),
('BR006', 'Kabel LAN Cat6 (10m)', 'Jaringan', 15, 'Gudang Jaringan (Box J1)', 'Baik', 'UTP Cat6 High Speed Gigabit Ethernet Patch Cord RJ45 10 Meter'),
('BR007', 'Router Mikrotik RB941', 'Jaringan', 4, 'Lab Jaringan (Rak R1)', 'Baik', 'hAP-Lite RB941-2nD 4-Port Fast Ethernet, Wireless 2.4GHz'),
('BR008', 'Webcam Logitech C920', 'Periferal', 6, 'Lab Multimedia (Laci W1)', 'Baik', 'Full HD 1080p Video Calling with Stereo Audio & Privacy Shutter')
ON CONFLICT (kode_barang) DO NOTHING;

-- Seed Sample Borrowing / Loan Data (1 Active, 1 Overdue, 1 Completed)
DO $$
DECLARE
    laptop_id UUID;
    proyektor_id UUID;
    router_id UUID;
BEGIN
    SELECT id INTO laptop_id FROM items WHERE kode_barang = 'BR001' LIMIT 1;
    SELECT id INTO proyektor_id FROM items WHERE kode_barang = 'BR004' LIMIT 1;
    SELECT id INTO router_id FROM items WHERE kode_barang = 'BR007' LIMIT 1;

    -- Note: When inserting loans manually in seed, triggers adjust item stock.
    -- Overdue loan example (Estimasi kemarin)
    IF laptop_id IS NOT NULL THEN
        INSERT INTO loans (kode_peminjaman, item_id, nama_peminjam, nim_identitas, jumlah, tanggal_pinjam, estimasi_kembali, status, catatan, staff_username)
        VALUES ('LOAN-202611-001', laptop_id, 'Ahmad Fauzi', '21051204012', 1, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '1 day', 'DIPINJAM', 'Peminjaman untuk praktikum komputasi', 'staff')
        ON CONFLICT (kode_peminjaman) DO NOTHING;
    END IF;

    -- Active on-time loan example (Estimasi 2 hari ke depan)
    IF proyektor_id IS NOT NULL THEN
        INSERT INTO loans (kode_peminjaman, item_id, nama_peminjam, nim_identitas, jumlah, tanggal_pinjam, estimasi_kembali, status, catatan, staff_username)
        VALUES ('LOAN-202611-002', proyektor_id, 'Siti Rahmawati', '21051204045', 1, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '2 days', 'DIPINJAM', 'Seminar proposal tugas akhir di ruang B201', 'staff')
        ON CONFLICT (kode_peminjaman) DO NOTHING;
    END IF;

    -- Completed loan example
    IF router_id IS NOT NULL THEN
        INSERT INTO loans (kode_peminjaman, item_id, nama_peminjam, nim_identitas, jumlah, tanggal_pinjam, estimasi_kembali, tanggal_kembali_aktual, status, kondisi_kembali, catatan, catatan_kembali, staff_username)
        VALUES ('LOAN-202611-003', router_id, 'Dwi Cahyo', '21051204089', 1, CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE - INTERVAL '4 days', 'SELESAI', 'Baik', 'Uji coba konfigurasi routing dinamis', 'Dikembalikan tepat waktu, kondisi normal lengkap adaptor', 'staff')
        ON CONFLICT (kode_peminjaman) DO NOTHING;
    END IF;
END $$;

-- Seed Sample Audit Logs
INSERT INTO audit_logs (action, actor_username, target_type, details) VALUES
('INIT_SYSTEM', 'admin', 'SYSTEM', '{"message": "Sistem inventaris laboratorium diinisialisasi"}'),
('TAMBAH_BARANG', 'admin', 'ITEMS', '{"kode_barang": "BR001", "nama_barang": "Laptop Lenovo", "jumlah": 5}'),
('PINJAM_BARANG', 'staff', 'LOANS', '{"kode_peminjaman": "LOAN-202611-001", "peminjam": "Ahmad Fauzi", "barang": "Laptop Lenovo"}');
