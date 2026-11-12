# 🔬 SIMLAB — Laboratory Inventory & Borrowing Management System
### *Sistem Manajemen Inventaris & Peminjaman Laboratorium Terintegrasi*
**Modern Professional, Soft Neutral & Fully Responsive**

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-34495e?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Netlify Status](https://img.shields.io/badge/Netlify-Deployed-00C7B7?style=for-the-badge&logo=netlify)](https://netlify.com/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-coding--challange__SIMLAB-181717?style=for-the-badge&logo=github)](https://github.com/MeNata-Script/coding-challange_SIMLAB.git)

SIMLAB adalah aplikasi web pengelolaan laboratorium berskala Enterprise/SaaS modern yang dirancang untuk mempermudah inventarisasi perangkat laboratorium, alur peminjaman dan pengembalian barang, pelacakan keterlambatan (*overdue*), pencetakan tag QR-Code dinamis, inspeksi kondisi fisik barang, serta manajemen akun staf laboratorium berbasis **Role-Based Access Control (RBAC)**.

Dibangun dengan estetika **Soft Neutral + Muted Navy**, dirancang khusus agar sangat nyaman dipandang berlama-lama (*eye-friendly* dan anti-silau) tanpa menggunakan background putih polos dominan.

---

## 📋 Daftar Isi
1. [Identitas Visual & Design System](#-identitas-visual--design-system)
2. [Ringkasan Fitur & Modul Utama](#-ringkasan-fitur--modul-utama)
3. [Arsitektur & Tech Stack](#-arsitektur--tech-stack)
4. [Matriks Kontrol Akses Peran (RBAC)](#-matriks-kontrol-akses-peran-rbac)
5. [Kredensial Demo & Data Bawaan](#-kredensial-demo--data-bawaan)
6. [Skema Database & Triggers](#-skema-database--triggers)
7. [Panduan Menjalankan di Lokal](#-panduan-menjalankan-di-lokal)
8. [Panduan Konfigurasi Supabase Cloud](#-panduan-konfigurasi-supabase-cloud)
9. [Panduan Deployment ke Netlify & Vercel](#-panduan-deployment-ke-netlify--vercel)
10. [Struktur Direktori Proyek](#-struktur-direktori-proyek)
11. [Troubleshooting & Solusi](#-troubleshooting--solusi)

---

## 🎨 Identitas Visual & Design System

Sistem antarmuka SIMLAB menerapkan standar desain **SaaS Grade - Modern Professional**:

| Komponen Desain | Nama Warna | Kode Hex | Penggunaan Utama |
|---|---|---|---|
| **Main Background** | Warm Gray | `#EAECE9` | Background kanvas seluruh halaman (nyaman di mata, anti-silau) |
| **Secondary Background** | Soft Sage | `#E2E9E3` | Sidebar navigasi, header tabel data, dan section header |
| **Content Surface** | Muted Ivory | `#F4F5F1` | Background utama seluruh card, modal, dan sheet |
| **Elevated Surface** | Soft Neutral | `#ECEFEA` | Topbar navbar, box preview QR, dan banner info |
| **Input Fields** | Light Sage Gray | `#E9ECE7` | Seluruh form input, text area, dan select dropdown |
| **Primary Brand** | Navy Slate | `#34495E` | Tombol utama, menu aktif, dan identitas brand (Hover: `#293B4D`) |
| **Secondary Accent** | Muted Teal | `#648F87` | Aksen sekunder, chart, dan tombol alternatif (Hover: `#527B73`) |
| **Soft Accent** | Pale Teal | `#DCE8E2` | Tombol sekunder, demo fill pills, dan highlight halus |

### Status Semantic System
* **Success**: Text `#548C75` | Background `#E1EDE4` (Stok aman, peminjaman selesai, status aktif)
* **Warning**: Text `#9A7137` | Background `#F2EBDD` (Stok menipis, barang perlu perbaikan)
* **Danger**: Text `#A95353` | Background `#F2E3E1` (Stok habis, terlambat / overdue, barang rusak, hapus data)
* **Info**: Text `#527493` | Background `#E3EAF0` (Informasi sistem, panduan operasional)

### Sistem Tipografi & Radius
* **Font Utama**: **Inter** (Google Fonts) dengan fallback **Plus Jakarta Sans**.
* **Border Radiuses**: Card `14px`, Modal `14px`, Tombol `10px`, Form Input `10px`.

---

## 🚀 Ringkasan Fitur & Modul Utama

### 1. Dual Data Engine (Hybrid Storage)
* **Supabase Cloud Mode**: Terhubung langsung ke PostgreSQL Supabase lengkap dengan row level security & triggers otomatis.
* **Smart LocalStorage Engine**: Jika kredensial Supabase kosong atau sedang offline, sistem otomatis beralih ke penyimpanan lokal browser. Penguji/dosen dapat langsung mencoba seluruh fitur tanpa kendala konfigurasi.

### 2. Modul Lengkap (A s/d F)
* **Modul A — Otentikasi & Login (`/login`)**:
  * Tampilan pastel modern bertekstur Muted Ivory dan Warm Gray.
  * **Fitur Show/Hide Password**: Tombol ikon mata interaktif untuk mengintip kata sandi.
  * **1-Click Quick Fill**: Tombol pintas pengisian kredensial Admin dan Staff dalam sekali klik.
* **Modul B — Overview Dashboard (`/dashboard`)**:
  * 4 Statistik Utama: *Total Jenis Barang, Total Stok Siap Pakai, Sedang Dipinjam, Total Transaksi*.
  * Multi-bar grafik distribusi stok antar kategori (Komputer, Periferal, Multimedia, Display, Jaringan).
  * **Banner "Perlu Perhatian"**: Otomatis mendeteksi barang berkondisi kritis (< 3 unit) dan peminjaman terlambat.
  * Log aktivitas peminjaman dan rekam jejak audit sistem terbaru.
* **Modul C — Manajemen Inventaris (`/inventory`)**:
  * Pencarian instan (kode barang, nama perangkat, lokasi penyimpanan) dan tab filter kategori.
  * Kontrol CRUD Admin: Tambah barang baru, edit spesifikasi & stok, dan hapus barang.
  * **Proteksi Hapus**: Sistem otomatis memblokir penghapusan barang jika masih ada peminjaman aktif.
  * **Printable QR Code Tag**: Klik baris inventaris untuk membuka *Slide-Over Drawer* detail spesifikasi dan QR Code siap cetak label.
* **Modul D — Transaksi Peminjaman (`/loans`)**:
  * Pencatatan peminjaman dengan live validasi ketersediaan stok fisik.
  * Tombol kuantitas instan `+1`, `+2`, dan `Max`.
  * Animasi mikro interaksi konfeti saat transaksi berhasil dicatat.
* **Modul E — Pengembalian & Laporan Riwayat (`/loans`)**:
  * Tab *Sedang Dipinjam* (Aktif) dan *Riwayat Selesai*.
  * **Overdue Tracking**: Peminjaman yang melewati tanggal estimasi otomatis ditandai badge merah *Terlambat* dan dinaikkan ke urutan teratas.
  * **Proses Pengembalian Multi-Kondisi**:
    * `Baik`: Stok fisik otomatis dikembalikan ke inventaris siap pakai.
    * `Perlu Perbaikan` / `Rusak`: Peminjaman diselesaikan tanpa mengembalikan ke stok siap pakai (ditandai untuk servis lab).
  * **Export Laporan CSV**: Mengunduh seluruh rekap riwayat peminjaman ke format spreadsheet `.csv`.
* **Modul F — Kelola Staff & Akses (`/users` — Khusus Admin)**:
  * Manajemen operator lab: nama lengkap, avatar, username, role, tanggal terdaftar, dan status.
  * Modal Tambah & Ubah Staff.
  * Switch toggle instan status akun (`AKTIF` / `NONAKTIF`).
  * **Hapus Akun Staff**: Dilengkapi modal konfirmasi danger berpalet lembut dan **Multi-layer Safety Guards** (proteksi akun sendiri dan akun root admin).

---

## 🛠️ Arsitektur & Tech Stack

```text
               +--------------------------------------------------+
               |                  USER BROWSER                    |
               | (Desktop >= 1024px: Sidebar | Mobile: Bottom Nav)|
               +--------------------------------------------------+
                                        │
                                        ▼
               +--------------------------------------------------+
               |             NEXT.JS 14 (APP ROUTER)              |
               |           TypeScript + Tailwind CSS              |
               |  AuthContext (RBAC Guard) + ToastContext         |
               +--------------------------------------------------+
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
              [ Supabase Configured? ]       [ Fallback / Offline ]
                         │                             │
                        YES                            NO
                         │                             │
                         ▼                             ▼
               +--------------------+        +--------------------+
               |    SUPABASE API    |        |   LOCAL STORAGE    |
               |  PostgreSQL + RLS  |        |    MOCK ENGINE     |
               | Automatic Triggers |        | (Auto-Persistent)  |
               +--------------------+        +--------------------+
```

* **Frontend Framework**: Next.js 14.2 (App Router)
* **Language**: TypeScript 5.7
* **Styling**: Tailwind CSS 3.4 (Custom Master Palette)
* **Database & BaaS**: Supabase PostgreSQL + Triggers & Row Level Security
* **Icons & Micro-interactions**: Lucide React, Canvas Confetti, QRCode Generator
* **Deployment**: Netlify Continuous Deployment (via GitHub `main`)

---

## 👥 Matriks Kontrol Akses Peran (RBAC)

| Modul / Tindakan | ADMINISTRATOR | STAFF | Keterangan Proteksi |
| :--- | :---: | :---: | :--- |
| **Login & Logout** | ✅ | ✅ | Session tersimpan aman di cookie/local state |
| **Lihat Dashboard & Statistik** | ✅ | ✅ | Real-time metrik peminjaman & stok lab |
| **Katalog Inventaris (Read)** | ✅ | ✅ | Akses pencarian & filter kategori barang |
| **Cetak Tag QR Code** | ✅ | ✅ | Cetak label identitas inventaris |
| **Catat Peminjaman** | ✅ | ✅ | Otomatis potong stok fisik barang |
| **Proses Pengembalian** | ✅ | ✅ | Inspeksi kondisi fisik (Baik/Rusak/Perbaikan) |
| **Export Data CSV** | ✅ | ✅ | Unduh file transaksi `.csv` |
| **Tambah / Edit Barang** | ✅ | ❌ | Disembunyikan & diblokir untuk Staff |
| **Hapus Barang** | ✅ | ❌ | Diblokir jika masih ada transaksi aktif |
| **Akses Menu Staff (`/users`)** | ✅ | ❌ | Route Guard redirect + Toast alert penolakan |
| **Tambah & Edit Akun Staff** | ✅ | ❌ | Hanya Administrator |
| **Toggle Status Akun Staff** | ✅ | ❌ | Nonaktifkan akses login staf |
| **Hapus Akun Staff** | ✅ | ❌ | Diproteksi: tidak bisa hapus diri sendiri & root admin |

---

## 🔑 Kredensial Demo & Data Bawaan

| Peran | Username | Password | Deskripsi Akun |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | Administrator Utama Laboratorium Komputasi |
| **Staff Operasional** | `staff` | `staff123` | Budi Santoso (Staf Operasional Lab) |

*(Tersedia tombol pintas **Demo Admin** & **Demo Staff** di halaman login untuk pengisian instan).*

### 8 Data Inventaris Awal (Seed Data)
1. **BR001** — Laptop Lenovo (Komputer, Stok: 5, Lemari L1)
2. **BR002** — Mouse Logitech (Periferal, Stok: 10, Laci P1)
3. **BR003** — Keyboard Mechanical (Periferal, Stok: 8, Laci P2)
4. **BR004** — Proyektor Epson (Multimedia, Stok: 3, Lemari M1)
5. **BR005** — Monitor LG (Display, Stok: 6, Rak D1)
6. **BR006** — Kabel LAN Cat6 10m (Jaringan, Stok: 15, Box J1)
7. **BR007** — Router Mikrotik RB941 (Jaringan, Stok: 4, Rak R1)
8. **BR008** — Webcam Logitech C920 (Periferal, Stok: 6, Laci W1)

---

## 🗄️ Skema Database & Triggers

File skema DDL PostgreSQL lengkap tersedia di: [`database/schema.sql`](file:///D:/Semester%205/Project%20Coding/database/schema.sql)

```mermaid
erDiagram
    users ||--o{ loans : "handles"
    users ||--o{ audit_logs : "creates"
    items ||--o{ loans : "borrowed_in"

    users {
        uuid id PK
        string username UK
        string password_hash
        string full_name
        string role
        string status
        timestamptz created_at
    }

    items {
        uuid id PK
        string kode_barang UK
        string nama_barang
        string kategori
        int stok
        string lokasi_penyimpanan
        string kondisi
        text spesifikasi
        timestamptz created_at
    }

    loans {
        uuid id PK
        string kode_peminjaman UK
        uuid item_id FK
        string nama_peminjam
        string nim_identitas
        int jumlah
        date tanggal_pinjam
        date estimasi_kembali
        date tanggal_kembali_aktual
        string status
        string kondisi_kembali
        text catatan
        text catatan_kembali
        string staff_username
        timestamptz created_at
    }

    audit_logs {
        uuid id PK
        string action
        string actor_username
        string target_type
        jsonb details
        timestamptz created_at
    }
```

### Logika Triggers Otomatis
1. **`trg_loans_insert_stock` (Auto Cut Stock)**: Terpicu saat peminjaman baru dicatat. Mengurangi `items.stok` dan menolak transaksi jika stok fisik tidak mencukupi.
2. **`trg_loans_return_stock` (Auto Restore Stock)**: Terpicu saat peminjaman diselesaikan. Jika kondisi `Baik`, stok dikembalikan ke stok aktif. Jika `Rusak`/`Perlu Perbaikan`, stok tidak dikembalikan ke stok aktif dan dicatat untuk pemeliharaan.
3. **`trg_items_prevent_delete_active` (Delete Protection)**: Membatalkan penghapusan barang jika masih terdapat transaksi aktif.

---

## 💻 Panduan Menjalankan di Lokal

### 1. Masuk ke Direktori Proyek
```powershell
cd "D:\Semester 5\Project Coding"
```

### 2. Jalankan Server Dev
```powershell
npm.cmd run dev
```

> **Catatan Windows**: Jika muncul pesan PowerShell `PSSecurityException: File npm.ps1 cannot be loaded`, gunakan **`npm.cmd`** sebagai pengganti `npm`.

### 3. Akses Melalui Browser
Buka browser dan buka: **[http://localhost:3000](http://localhost:3000)**

---

## ☁️ Panduan Konfigurasi Supabase Cloud

Jika ingin menghubungkan aplikasi dengan database Supabase di cloud:

1. Buat project baru di [Supabase Dashboard](https://supabase.com).
2. Di menu **SQL Editor**, buka file [`database/schema.sql`](file:///D:/Semester%205/Project%20Coding/database/schema.sql), salin kodenya, lalu klik **Run**.
3. Buka menu **Project Settings > API**, salin:
   - **Project URL**
   - **anon / public key**
4. Isi file [`.env.local`](file:///D:/Semester%205/Project%20Coding/.env.local):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
5. Restart aplikasi (`npm.cmd run dev`). Badge indikator di navbar akan menampilkan **"Supabase Connected"**.

---

## 🚀 Panduan Deployment ke Netlify & Vercel

### A. Deployment Otomatis via Netlify (Rekomendasi)
Aplikasi ini terhubung langsung ke repositori GitHub:
👉 **`https://github.com/MeNata-Script/coding-challange_SIMLAB.git`**

1. Masuk ke [Netlify Dashboard](https://app.netlify.com/).
2. Hubungkan repository `coding-challange_SIMLAB`.
3. Build Settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
4. Set Environment Variables di Netlify:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Setiap kali Anda melakukan `git push origin main`, Netlify akan otomatis melakukan continuous deployment dalam 1-2 menit!

### B. Deployment via Vercel
1. Import repository `coding-challange_SIMLAB` di [Vercel Dashboard](https://vercel.com/dashboard).
2. Masukkan Environment Variables yang sama.
3. Klik **Deploy**.

---

## 📂 Struktur Direktori Proyek

```text
D:\Semester 5\Project Coding\
├── app/
│   ├── dashboard/             # Modul B: Analitik Metrik & Log Aktivitas
│   │   └── page.tsx
│   ├── inventory/             # Modul C: Katalog, Filter Kategori, QR Tag, Modal CRUD
│   │   └── page.tsx
│   ├── loans/                 # Modul D & E: Peminjaman & Pengembalian, Export CSV
│   │   └── page.tsx
│   ├── login/                 # Modul A: Login Pastel, Password Eye Toggle, 1-Click Demo
│   │   └── page.tsx
│   ├── users/                 # Modul F: Kelola Staff, Status Toggle & Hapus Staff (Admin Only)
│   │   └── page.tsx
│   ├── globals.css            # Custom CSS Variables, Inter Font, Muted Scrollbar
│   ├── layout.tsx             # Root Layout (AuthProvider + ToastProvider)
│   └── page.tsx               # Redirector Cerdas
├── components/
│   ├── inventory/
│   │   ├── DeleteConfirmModal.tsx    # Modal konfirmasi hapus barang berpalet soft
│   │   ├── ItemFormModal.tsx         # Modal input & edit data barang
│   │   └── SlideOverItemDetail.tsx   # Drawer detail spesifikasi & Cetak QR Tag
│   ├── layout/
│   │   ├── AppLayout.tsx             # Layout pembungkus halaman (Warm Gray)
│   │   ├── MobileNav.tsx             # Navigasi bawah sticky (Touch Target >= 44px)
│   │   ├── Navbar.tsx                # Topbar Soft Neutral dengan status cloud & profil
│   │   └── Sidebar.tsx               # Sidebar navigasi Soft Sage desktop
│   ├── loans/
│   │   ├── NewLoanModal.tsx          # Modal pencatatan pinjam & kalkulasi stok
│   │   └── ReturnModal.tsx           # Modal proses pengembalian multi-kondisi
│   └── users/
│       ├── DeleteStaffConfirmModal.tsx # Modal konfirmasi hapus akun staff
│       └── StaffFormModal.tsx        # Modal tambah & ubah akun staff
├── context/
│   ├── AuthContext.tsx        # Manajemen sesi otentikasi & RBAC guard
│   └── ToastContext.tsx       # Sistem notifikasi Toast non-intrusif
├── database/
│   └── schema.sql             # Skema DDL PostgreSQL, RLS, Triggers & Seeds
├── lib/
│   ├── db.ts                  # Lapisan abstraksi data (Supabase + Local fallback)
│   ├── initialData.ts         # Data awal 8 item, 2 akun demo, dan audit logs
│   ├── supabase.ts            # Client initializer Supabase
│   └── utils.ts               # Formatter tanggal, CSV exporter, classnames helper
├── types/
│   └── index.ts               # Definisi tipe antarmuka TypeScript lengkap
├── .env.example               # Template environment variables
├── .env.local                 # Konfigurasi environment lokal
├── netlify.toml               # Konfigurasi build pipeline Netlify
├── package.json               # Daftar dependencies & scripts build
├── tailwind.config.ts         # Definisi Master Color Palette & Border Radiuses
└── tsconfig.json              # Konfigurasi TypeScript
```

---

## ❓ Troubleshooting & Solusi

### 1. Muncul error `PSSecurityException` saat menjalankan `npm` di PowerShell
* **Penyebab**: Kebijakan eksekusi skrip Windows PowerShell membatasi file `.ps1`.
* **Solusi**: Gunakan `npm.cmd` di terminal:
  ```powershell
  npm.cmd run dev
  npm.cmd run build
  ```

### 2. Bagaimana cara mereset data demo kembali ke awal jika telah mengubah banyak data?
* Buka Developer Tools di browser (`F12`), pilih tab **Application > Local Storage**, lalu klik **Clear site data**.
* Muat ulang halaman (*refresh*), data akan otomatis ter-reset ke *fresh seed* awal.

### 3. Apakah aplikasi tetap berjalan tanpa akun Supabase?
* **Ya, 100% berjalan normal!** Berkat **Dual Storage Engine**, aplikasi otomatis menggunakan LocalStorage fallback jika Supabase belum dikonfigurasi. Seluruh aksi (tambah barang, catat pinjam, ubah status staff, hapus staff, dan cetak QR) tetap tersimpan di browser Anda.

---
*Dikembangkan untuk Tugas Praktikum & Evaluasi Proyek Coding Semester 5.*  
*Repository: [coding-challange_SIMLAB](https://github.com/MeNata-Script/coding-challange_SIMLAB.git)* 🔬
