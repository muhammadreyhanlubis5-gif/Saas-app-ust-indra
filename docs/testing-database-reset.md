# PANDUAN RESET DATABASE TESTING
## Aplikasi GuruKu — Safe Business Data Purge Procedure

Tanggal: 13 November 2026  
Target Utility: `scripts/reset-testing-database.ts`  
Tujuan: Mengembalikan status data bisnis ke kondisi awal (`business data = 0`) untuk pengujian deterministik tanpa dummy data.

---

## 1. Aturan Keamanan & Pencegahan Kerusakan Data

1. **Proteksi Environment Produksi**:
   Script memeriksa `NODE_ENV` dan nama host/database. Jika terdeteksi string `production`, `prod-db`, atau `live-db`, eksekusi dibatalkan secara otomatis.
2. **Flag Konfirmasi Wajib (`CONFIRM_RESET_TEST_DB=true`)**:
   Script tidak akan mengeksekusi penghapusan apa pun jika environment variable `CONFIRM_RESET_TEST_DB=true` tidak didefinisikan secara eksplisit.
3. **Preservasi Akun Auth / Admin**:
   Tabel akun pengguna (`users`) **TIDAK DIHAPUS**. Kredensial super admin dan sekolah tetap dapat digunakan untuk login pengujian.
4. **Preservasi Skema & Migrasi**:
   Tidak ada perintah `DROP TABLE`, `DROP SCHEMA`, atau penghapusan histori migrasi. Struktur tabel, constraint, dan index tetap utuh 100%.

---

## 2. Urutan Penghapusan Aman (Foreign Key Safe Order)

Data bisnis dihapus dalam satu blok transaksi database (`BEGIN ... COMMIT`) dengan urutan terbalik dari dependensi relasi:

1. `schedules` (Tabel anak: memiliki foreign key ke seluruh entitas master)
2. `time_sessions` (Tabel anak: foreign key ke `operating_days`)
3. `operating_days` (Tabel induk sesi)
4. `classes` (Tabel anak: foreign key ke `teachers`)
5. `teachers` (Tabel induk wali kelas)
6. `subjects` (Tabel master mata pelajaran)
7. `support_tickets` & `payment_confirmations` (Data operasional pendukung)
8. Reset kolom blob legacy pada tabel `schools` (`jadwal_data = NULL`, `pengampu_data = NULL`, dll.)

Jika terjadi error pada salah satu langkah, database menjalankan `ROLLBACK` penuh.

---

## 3. Cara Menjalankan Script

### Pada Terminal Lokal / Staging:
```bash
# Menggunakan Node 24 TypeScript Runner
CONFIRM_RESET_TEST_DB=true DATABASE_URL="postgres://user:pass@ep-cool-sample.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" node scripts/reset-testing-database.ts
```

### Pada PowerShell Windows:
```powershell
$env:CONFIRM_RESET_TEST_DB="true"
$env:DATABASE_URL="postgres://user:pass@ep-cool-sample.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
node scripts/reset-testing-database.ts
```

---

## 4. Contoh Output Verifikasi Sukses

```text
====================================================
GURUKU TEST DATABASE RESET UTILITY
====================================================
Target Host: ep-cool-sample.ap-southeast-1.aws.neon.tech
Target Database: neondb
[RESET] Starting database cleanup transaction...
[RESET] Transaction committed successfully.

====================================================
Business data reset completed.
====================================================
teachers: 0
subjects: 0
classes: 0
rooms: 0
operating_days: 0
time_sessions: 0
schedules: 0
import_batches: 0

Auth/admin account:
preserved (count: 1)
====================================================
```
