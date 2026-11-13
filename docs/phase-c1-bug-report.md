# LAPORAN BUG RESMI PHASE C.1
## Aplikasi GuruKu — Koreksi Integrasi, Verifikasi XLSB, dan Perbaikan Runtime

Laporan ini mendokumentasikan temuan bug dan status perbaikan pada tahap **Phase C.1**.

---

## BUG-C1-001 — Sheet Dimension False-Positive Overestimation (1,048,566 rows in Excel)

- **Severity**: P1 (High)
- **Status**: FIXED
- **File**: `src/core/xlsbParser.js`
- **Function**: `inspectWorkbook`, `extractRombelData`
- **Steps to reproduce**:
  1. Buka file `Master_Jadwal_Jadikan.xlsb` dengan pembaca XLSX standar.
  2. Baca range `sheet['!ref']` pada sheet `Rombel`, `Kegiatan Non Mapel`, atau `JLH MAPEL DIAMPU`.
  3. Lakukan iterasi baris dari `range.s.r` ke `range.e.r`.
- **Expected**: Sistem hanya memproses baris yang memiliki nilai aktual (~156 baris).
- **Actual**: Range melaporkan 1,048,566 baris, menyebabkan loop memori ekstrem (*memory spike* & *browser freezing*).
- **Root cause**: Formatting warna latar dan border default Excel meluas hingga batas maksimum lembar kerja (Row 1,048,566), menyebabkan SheetJS melaporkan used range penuh.
- **Fix**: Mengimplementasikan *sparse cell traversal* berbasis `Object.keys(sheet)` dan membatasi pembacaan blok master data pada area data bisnis aktual (Row 61–106).
- **Regression test**: `tests/xlsb_import.test.js` (Test 1, 8).
- **Evidence**: `docs/sheet_reality_audit.json` membuktikan baris dengan nilai hanya 156 dari 1,048,566 baris fisik.

---

## BUG-C1-002 — Missing `code` Column on `teachers` Table in Existing DDL

- **Severity**: P1 (High)
- **Status**: FIXED
- **File**: `core/database/migrations/002_create_operating_days_and_time_sessions.sql`, `core/database/db.go`
- **Function**: `runMigrations()` Step 6
- **Steps to reproduce**:
  1. Lakukan audit kolom tabel `teachers` pada `001_create_master_data_tables.sql`.
  2. Bandingkan dengan kebutuhan impor dari sheet `Rombel` (Kolom H: KODE `MH`, `PHY`).
- **Expected**: Kolom `code` tersedia untuk menyimpan inisial/kode guru.
- **Actual**: Kolom `code` tidak ada, sehingga pemetaan penugasan guru berbasis kode pada jadwal gagal.
- **Root cause**: DDL Phase B hanya mendefinisikan `nip_nuptk`, `name`, `subject_specialty`.
- **Fix**: Menambahkan `ALTER TABLE teachers ADD COLUMN IF NOT EXISTS code VARCHAR(50);` dan index parsial unik `(tenant_id, UPPER(TRIM(code))) WHERE code IS NOT NULL AND deleted_at IS NULL`.
- **Regression test**: `tests/migration_audit.test.js` (Suite 5).
- **Evidence**: Test 14 pada `tests/migration_audit.test.js` lulus 100%.

---

## BUG-C1-003 — Hardcoded Equal Daily Sessions Assumption Causing Schedule Truncation

- **Severity**: P0 (Critical)
- **Status**: FIXED
- **File**: `core/database/migrations/002_create_operating_days_and_time_sessions.sql`
- **Function**: Schema creation of `operating_days` & `time_sessions`
- **Steps to reproduce**:
  1. Jalankan sistem penjadwalan dengan asumsi statis 8 jam pelajaran (JP) setiap hari.
  2. Impor alokasi dari file `Master_Jadwal_Jadikan.xlsb`.
- **Expected**: Jadwal hari Senin, Selasa, dan Rabu menampung 10 JP KBM.
- **Actual**: Jam ke-9 dan ke-10 (2 JP/hari x 3 hari x 18 rombel = 108 JP) terpotong dan tidak terjadwal.
- **Root cause**: Ketiadaan tabel ternormalisasi untuk variasi jumlah sesi harian. Sheet `Rombel` membuktikan Sabtu (8 JP), Minggu (8 JP), Senin-Rabu (10 JP), Kamis (8 JP).
- **Fix**: Membuat tabel `operating_days` dan `time_sessions` ternormalisasi dengan composite foreign key `(tenant_id, operating_day_id)` yang mencegah referensi lintas tenant.
- **Regression test**: `tests/xlsb_import.test.js` (Test 8) & `tests/migration_audit.test.js` (Suite 5).
- **Evidence**: Pengujian ekstraksi variasi hari di `tests/xlsb_import.test.js` lulus.

---

## BUG-C1-004 — Master Rombel Data Offset & Header Misalignment

- **Severity**: P1 (High)
- **Status**: FIXED
- **File**: `src/core/xlsbParser.js`
- **Function**: `extractRombelData`
- **Steps to reproduce**:
  1. Jalankan ekstraksi data kelas pada baris 24.
- **Expected**: Mendapatkan 18 kelas, 44 guru, 45 mapel.
- **Actual**: Baris 24 berisi data slot jam KBM, menghasilkan baris kosong atau mapping salah.
- **Root cause**: Sheet `Rombel` adalah dashboard campuran (*mixed schema*). Baris 16–53 adalah pengaturan jam operasional, sedangkan header master data terletak pada baris 61.
- **Fix**: Memperbarui deteksi header ke Baris 61 dan mengekstrak data dari baris 62–106.
- **Regression test**: `tests/xlsb_import.test.js` (Test 1, 7, 8).
- **Evidence**: `docs/rombel_blocks_factual_audit.json` mengonfirmasi 18 rombel, 44 guru, dan 45 mapel.

---

## BUG-C1-005 — Import Modal Re-entrancy & Modal Retention on Close

- **Severity**: P2 (Medium)
- **Status**: FIXED
- **File**: `src/components/XlsbImportModal.vue`
- **Function**: `executeImport`, `closeModal`
- **Steps to reproduce**:
  1. Buka modal impor dan pilih file.
  2. Tutup modal tanpa commit.
  3. Buka modal kembali.
- **Expected**: Modal dalam kondisi bersih/reset dan tidak dapat diklik ganda saat memproses.
- **Actual**: Data file lama masih tersimpan di memori komponen, dan tombol submit dapat diklik ganda sebelum response selesai.
- **Root cause**: Ketiadaan panggilan `resetFile()` saat modal di-close dan ketiadaan pengecekan re-entrancy di awal `executeImport()`.
- **Fix**: Menambahkan `resetFile()` pada event `closeModal()` dan guard `if (isSubmitting.value) return` pada `executeImport()`.
- **Regression test**: Validasi statis ESLint & build test.
- **Evidence**: `npm run lint` lulus 0 error.

---

## BUG-C1-006 — In-Memory Database Reality: Migration 002 Not Executed on Live PostgreSQL

- **Severity**: P1 (High)
- **Status**: OPEN (Documented Architectural Reality)
- **File**: `core/database/db.go` & Windows Service
- **Function**: `postgresql-x64-18`
- **Steps to reproduce**:
  1. Jalankan `Start-Service postgresql-x64-18` dari user shell non-elevated.
- **Expected**: PostgreSQL service berjalan dan migration DDL tereksekusi pada database live.
- **Actual**: Akses ditolak (`Cannot open postgresql-x64-18 service`), service berstatus `Stopped`.
- **Root cause**: Batasan hak akses sistem operasi host lokal (membutuhkan elevated administrator).
- **Fix**: Sesuai aturan Phase C.1, status migrasi diklasifikasikan secara jujur dan transparan sebagai `IMPLEMENTED_IN_SOURCE_ONLY` (bukan `VERIFIED`), dan status RLS tetap `RLS status: NOT_VERIFIED`.
- **Regression test**: `tests/migration_audit.test.js` memverifikasi integritas sintaks dan constraint DDL.
- **Evidence**: Query `Get-Service *postgres*` menunjukkan status `Stopped`.
