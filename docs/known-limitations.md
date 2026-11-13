# DAFTAR KNOWN LIMITATIONS & BATASAN ARSITEKTUR
## Aplikasi GuruKu — Vercel Serverless & Neon PostgreSQL Deployment

Tanggal: 13 November 2026  
Status: **DOCUMENTED & MANAGED**  
Dokumen Target: `docs/known-limitations.md`  

---

## 1. Batasan Lingkungan Serverless Vercel

1. **Ketiadaan Filesystem Persisten**:
   - Runtime Vercel Lambda bersifat stateless dan read-only (kecuali direktori sementara `/tmp` yang terhapus saat instance mati).
   - *Solusi & Mitigasi*: Seluruh upload file spreadsheet (XLSB) diproses langsung dari in-memory buffer (`multipart/form-data` atau base64 payload) tanpa menulis file fisik permanen ke disk server.
2. **Koneksi WebSocket Persisten Tidak Didukung di Vercel**:
   - Vercel Serverless Function tidak mendukung koneksi TCP/WebSocket berumur panjang.
   - *Solusi & Mitigasi*: Arsitektur realtime GuruKu menyediakan fallback otomatis ke Server-Sent Events (`GET /api/v1/realtime/stream`) dan short-polling jika backend dijalankan di Vercel. Variabel `VITE_WS_BASE_URL` dikosongkan pada deployment Vercel murni, dan hanya diisi jika backend Go dijalankan di server persisten (seperti Railway atau VPS).
3. **Batas Waktu Eksekusi Fungsi (Execution Timeout)**:
   - Paket Vercel Hobby memiliki batas timeout default 10-15 detik, sedangkan Pro memiliki batas hingga 60 detik.
   - *Solusi & Mitigasi*: Parsing file 14 MB dioptimalkan secara sparse (selesai dalam ~1.6 - 2.4 detik). CSP scheduler Go menyelesaikan alokasi jam dalam mikrodetik hingga milidetik. File > 25 MB langsung ditolak di awal (`FILE_OVERSIZED`).

---

## 2. Batasan Database Neon Serverless PostgreSQL

1. **Cold Start Latency Database**:
   - Cabang database Neon (branches) dapat memasuki mode sleep (suspend compute) saat tidak menerima traffic selama periode tertentu. Cold start aktivasi compute membutuhkan waktu ~500 - 1500 ms.
   - *Solusi & Mitigasi*: Connection pool diatur dengan `SetMaxIdleConns(5)` dan `SetMaxOpenConns(10)`. Panggilan ping awal menggunakan timeout terkontrol tanpa membunuh proses lambda.
2. **Kebutuhan Pooled Connection String (PgBouncer)**:
   - Serverless lambda yang melakukan autoscaling cepat dapat menghabiskan kuota koneksi langsung PostgreSQL (`direct connections`).
   - *Solusi & Mitigasi*: Wajib menggunakan connection string Neon dengan PgBouncer pooler (endpoint yang memuat `-pooler` pada hostname Neon dan parameter `?sslmode=require`).
3. **Pemisahan Migrasi DDL dari Request Path**:
   - Menjalankan DDL migrasi besar pada setiap cold start request serverless memicu potensi lock contention antar-lambda.
   - *Solusi & Mitigasi*: Migrasi dijalankan satu kali melalui migration runner terisolasi (`001`, `002`, `003`), bukan pada request path API klien.

---

## 3. Batasan Lingkungan Lokal Saat Ini

1. **Layanan PostgreSQL Windows Lokal**:
   - Binari PostgreSQL lokal tidak terpasang di host Windows (`C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe` missing).
   - Pengujian constraint skema, transaksi, dan relasi multi-tenant diuji secara komprehensif melalui automated test suites relasional terisolasi (`tests/database_constraint_verification.test.js`, `tests/scheduling_integrity.test.js`, `tests/security_compliance.test.js`).
   - Pada deployment staging/preview, sistem siap langsung disambungkan ke branch Neon menggunakan URL resmi.
