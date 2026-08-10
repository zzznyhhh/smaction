# **Product Requirements Document (PRD)**

## **Aplikasi E-Voting Pemilihan Ketua OSIS**

**Versi:** 1.0

**Status:** Draft

**Tech Stack:** Next.js (Frontend & Backend), Vercel (Hosting), Supabase (Database & Realtime)

## **1\. Pendahuluan**

### **1.1 Latar Belakang**

Pemilihan Ketua OSIS secara konvensional (kertas) membutuhkan waktu yang lama dalam penghitungan suara, rentan terhadap kerusakan/kehilangan surat suara, dan kurang ramah lingkungan. Aplikasi E-Voting ini dirancang untuk mendigitalkan proses tersebut agar lebih cepat, transparan, dan akurat.

### **1.2 Tujuan**

Menyediakan platform e-voting yang:

* Aman: Memastikan satu siswa (NISN) hanya dapat memilih satu kali.  
* Anonim: Merahasiakan pilihan siswa.  
* Real-time: Menyediakan dashboard perolehan suara secara langsung.  
* Praktis: Memudahkan panitia dalam mencetak laporan hasil pemilihan secara otomatis.

## **2\. Arsitektur Sistem**

* **Frontend:** Next.js (App Router), React, Tailwind CSS. Digunakan untuk merender antarmuka pengguna (UI) bagi pemilih dan admin.  
* **Backend (API):** Next.js Route Handlers (Serverless Functions) yang di-hosting di Vercel. Bertugas sebagai perantara (middleware) yang aman antara frontend dan database.  
* **Database:** Supabase (PostgreSQL). Menyimpan data master dan transaksional.  
* **Realtime Engine:** Supabase Realtime. Mengirimkan event perubahan data (suara masuk) ke klien secara instan.  
* **PDF Generator:** jspdf dan jspdf-autotable dijalankan di sisi klien (frontend) Admin.

## **3\. Skema Database (Supabase / PostgreSQL)**

Sistem menggunakan 3 tabel utama yang dipisah untuk menjaga anonimitas (data pemilih tidak terikat langsung dengan data suara).

### **3.1 Tabel voters (DPT)**

Menyimpan data pemilih yang berhak memberikan suara.

* nisn (VARCHAR, Primary Key) \- Nomor Induk Siswa Nasional.  
* name (VARCHAR) \- Nama lengkap siswa.  
* class (VARCHAR) \- Kelas siswa (misal: "X-A", "XI-MIPA 1").  
* has\_voted (BOOLEAN) \- Status memilih, default FALSE.  
* *Index disarankan pada kolom nisn untuk mempercepat pencarian.*

### **3.2 Tabel candidates (Kandidat)**

Menyimpan data pasangan calon (Paslon).

* id (UUID, Primary Key) \- ID unik kandidat.  
* candidate\_number (INT) \- Nomor urut (1, 2, 3, dst).  
* chairman\_name (VARCHAR) \- Nama Calon Ketua.  
* vice\_chairman\_name (VARCHAR) \- Nama Calon Wakil Ketua.  
* photo\_url (TEXT) \- URL pas foto kandidat (bisa disimpan di Supabase Storage).  
* vision\_mission (TEXT) \- Teks visi dan misi.

### **3.3 Tabel votes (Kotak Suara)**

Menyimpan suara yang masuk. **Tidak boleh ada kolom yang merujuk balik ke NISN pemilih.**

* id (UUID, Primary Key) \- ID unik suara.  
* candidate\_id (UUID, Foreign Key ke candidates.id) \- Paslon yang dipilih.  
* created\_at (TIMESTAMPTZ) \- Waktu suara masuk, default NOW().

## **4\. Alur Data & User Flow (Data Flow)**

### **4.1 Alur Pemilih (Voter Flow)**

1. **Akses Web:** Pemilih membuka halaman utama melalui perangkat yang disediakan (misal di bilik suara lab komputer) atau perangkat masing-masing.  
2. **Otentikasi (Login):**  
   * Pemilih memasukkan NISN.  
   * Frontend mengirim request POST /api/auth ke Backend.  
   * Backend mengecek tabel voters. Jika has\_voted \== true, tolak akses. Jika valid, berikan *session token* (HTTP-only cookie / JWT sederhana) dan arahkan ke halaman Bilik Suara.  
3. **Voting (Bilik Suara):**  
   * Sistem menampilkan daftar dari tabel candidates.  
   * Pemilih memilih paslon dan menekan tombol konfirmasi.  
   * Frontend mengirim request POST /api/vote berisi NISN dan candidate\_id.  
4. **Proses Transaksi (Database Level):**  
   * API memanggil Stored Procedure (RPC) di Supabase bernama submit\_vote.  
   * RPC menjalankan transaksi *atomic*: Update voters.has\_voted \= true **DAN** Insert ke votes. (Jika salah satu gagal, seluruh transaksi di-*rollback*).  
5. **Penyelesaian:**  
   * Session pemilih dihapus (Logout).  
   * Ditampilkan halaman "Sukses Memilih" dengan tombol "Kembali ke Login" untuk antrean pemilih berikutnya.

### **4.2 Alur Admin (Leaderboard & Report)**

1. **Leaderboard Real-time:**  
   * Halaman dashboard memanggil data awal total suara.  
   * Frontend membuka koneksi WebSocket via Supabase Client (supabase.channel).  
   * Setiap ada baris baru di tabel votes, Supabase mengirim event ke Frontend, lalu grafik diperbarui secara reaktif.  
2. **Cetak Laporan:**  
   * Admin menekan tombol "Cetak Laporan".  
   * Sistem mengambil rekapitulasi data: Total DPT (COUNT voters), Suara Masuk (COUNT votes), Golput (Total DPT \- Suara Masuk), dan agregasi suara per kandidat.  
   * Library PDF men-generate file laporan dan mengunduhnya ke perangkat Admin.

## **5\. Spesifikasi Frontend**

### **5.1 Halaman Publik (Pemilih)**

* **/ (Login Page):** Form input NISN tunggal yang responsif. Menampilkan pesan error jika NISN salah atau sudah terpakai.  
* **/vote (Voting Booth Page):** Halaman yang diproteksi (hanya bisa diakses setelah login). Menampilkan *Cards* kandidat. Terdapat modal konfirmasi ("Apakah Anda yakin memilih Paslon No X?") sebelum submit.  
* **/success (Thank You Page):** Halaman statis berisi pesan terima kasih dan tombol *Back to Home*.

### **5.2 Halaman Admin (Panitia)**

* **/admin (Login Admin):** Dilindungi dengan password.  
* **/admin/dashboard (Leaderboard):** Menampilkan Bar/Pie Chart hasil suara realtime. Menampilkan persentase partisipasi pemilih.  
* **/admin/voters (DPT Manager):** Tabel daftar siswa, status memilih, dan fitur untuk import data pemilih (CSV/Excel).  
* **/admin/report (Laporan):** Preview laporan akhir dan tombol Export PDF.

## **6\. Spesifikasi Backend (Vercel API Routes)**

* **POST /api/auth**  
  * **Input:** { nisn: string }  
  * **Proses:** Validasi eksistensi NISN dan status has\_voted. Set Cookie session.  
  * **Output:** { success: boolean, voterName: string } / Error message.  
* **POST /api/vote**  
  * **Input:** { nisn: string, candidateId: string }  
  * **Proses:** Validasi session, panggil RPC Supabase submit\_vote. Clear Cookie session.  
  * **Output:** { success: boolean } / Error message.  
* **GET /api/results (Opsional, untuk load awal)**  
  * **Output:** { totalVoters: int, totalVotes: int, candidates: \[{ id, name, votes, percentage }\] }

## **7\. Keamanan & Mitigasi Risiko**

1. **Row Level Security (RLS) di Supabase:**  
   * Tabel voters, candidates, dan votes ditutup sepenuhnya (Disable Public Access).  
   * Hanya API Vercel (menggunakan SUPABASE\_SERVICE\_ROLE\_KEY) yang memiliki akses baca/tulis ke database. Klien (browser) tidak bisa menembak database secara langsung (kecuali untuk listen Realtime Dashboard).  
2. **Pencegahan Double-Voting (Race Condition):**  
   * Ditangani secara ketat di tingkat *database engine* menggunakan PostgreSQL Stored Procedure (Atomic Transaction). Walaupun user mengirim request vote 10x dalam satu milidetik, database hanya akan memproses yang pertama.  
3. **Mencegah URL Bypass:**  
   * Gunakan Next.js Middleware. Jika pengguna mengakses /vote tanpa memiliki session/cookie valid, sistem akan otomatis melakukan *redirect* kembali ke / (Login).  
4. **Perlindungan Data (Anonimitas):**  
   * Secara konseptual, sistem **tidak tahu** NISN "A" memilih paslon yang mana, karena tabel votes tidak memiliki Foreign Key ke voters. Sistem hanya mencatat bahwa NISN "A" sudah memilih, dan kotak suara bertambah 1 untuk paslon terkait.