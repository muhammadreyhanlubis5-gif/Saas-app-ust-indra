# LAPORAN AUDIT AWAL REPOSITORY
## Aplikasi GuruKu — Arsitektur, Database Neon, Vercel Serverless, & Security

Tanggal: 13 November 2026  
Auditor: Senior Software Engineer, QA Engineer, Security Engineer, Database Engineer  
Status: **COMPLETED**  
Dokumen Target: `docs/audit-report.md`  

---

## 1. Eksekutif Ringkasan

Repository Aplikasi GuruKu telah diaudit secara menyeluruh pada 16 area struktural, mencakup frontend Vue 3, backend Go Gin (Vercel Serverless & standalone daemon), skema database PostgreSQL/Neon, alur autentikasi JWT HttpOnly, parser XLSB, engine penjadwalan (C++ & Go), serta manajemen state dan penyimpanan klien.

### Ringkasan Temuan Berdasarkan Severity
- **P0 (Critical / Blocker)**: 3 Temuan
  1. *Unnormalized Schedule Storage*: Data jadwal disimpan sebagai string JSON mentah (`schools.jadwal_data`) tanpa skema relasional, tanpa foreign key, dan tanpa unique constraint anti-bentrok pada level database.
  2. *LocalStorage sebagai Pseudo-Database*: Komponen view jadwal, tugas tambahan, pengampu mapel, dan jam kosong membaca dan menulis data bisnis ke `localStorage` sebagai sumber data utama/fallback.
  3. *Ketiadaan Transaksi Multi-Entitas Atomik untuk Import XLSB*: Commit import XLSB mengeksekusi kelas, guru, dan mapel secara terpisah tanpa satu transaksi `BEGIN ... COMMIT / ROLLBACK` terpadu antar-tabel di database.
- **P1 (High)**: 3 Temuan
  1. *Cold-Start DDL Migration*: `autoMigrateTables()` dieksekusi pada setiap cold start serverless lambda di Vercel, menambah latency dan memicu risiko DDL lock contention.
  2. *Ketiadaan Script Reset Testing Database Terstandarisasi*: Belum ada script reset data bisnis otomatis (`business data = 0`) yang aman terhadap foreign key dengan proteksi branch database.
  3. *In-Memory Fallback Inconsistency*: Fallback in-memory master data tidak sinkron lintas lambda serverless Vercel saat database tidak terhubung.
- **P2 (Medium)**: 2 Temuan
  1. *Simbol Karakter Obfuscated Route*: Jalur URL tersamarkan menggunakan simbol RFC 3986 kompleks yang berisiko mengalami encoding drift di edge/proxy tertentu.
  2. *Validasi Bentrok Jadwal Terbatas pada Solver*: Validasi bentrok ganda (double-booking guru/kelas) hanya diterapkan di memori solver, bukan sebagai database constraint.
- **P3 (Low)**: 1 Temuan
  1. *Fallback Nama Profil Sekolah dari LocalStorage*: Repository setup sekolah membaca sisa cache nama lisensi dari localStorage saat profil belum dimuat.

---

## 2. Audit Rinci 16 Area Repository

### Area 1: Struktur Folder dan Framework
- **Frontend**: Vue 3.5.42 (Composition API, `<script setup>`), Vite 8.3.0, Tailwind CSS 3.4.1, Pinia 4.1.0, Vue Router 4.6.4, SheetJS (xlsx 0.18.5).
- **Backend**: Go 1.26.1 dengan Gin Framework (`jadwal-api`). Terdiri dari:
  - `api/index.go`: Entrypoint serverless Vercel (`Handler(w http.ResponseWriter, r *http.Request)`).
  - `cmd/server/main.go`: Entrypoint standalone executable untuk localhost (`server.exe`).
  - `core/`: Modul inti arsitektur (`core/database`, `core/router`, `core/handlers`, `core/middleware`, `core/engine`, `core/realtime`).
  - `cpp_worker/`: Modul C++ native constraint solver.
- **Status Evaluasi**: Struktur modular, rapi, dan terpisah dengan baik antara web UI dan Go core.

### Area 2: Semua Halaman & Frontend Route
- Rute utama dikonfigurasi di `src/router/index.js` menggunakan obfuscated paths dari `src/config/routePaths.js`.
- Total 22 View:
  - Publik: `LoginView.vue` (`/`), `CheckoutView.vue` (`/checkout`), `ExpiredView.vue` (`/expired`).
  - Super Admin: `SuperAdminDashboard.vue`.
  - Guru: `TeacherDashboard.vue`.
  - School Admin: `SchoolAdminDashboard.vue`, `ValidasiLembaga.vue`, `DaftarKelas.vue`, `DaftarGuru.vue`, `SesiWaktu.vue`, `MataPelajaran.vue`, `PengampuMapel.vue`, `JamKosong.vue`, `TugasTambahan.vue`, `JadwalGuru.vue`, `JadwalKelas.vue`, `AnalisisGuru.vue`, `TunjanganSertifikasi.vue`, `KeuanganAset.vue`, `KalkulatorHPP.vue`, `PesananView.vue`, `CustomRequestView.vue`, `EtalaseProdukView.vue`, `LaporanInvestorView.vue`, `PengaturanView.vue`, `PusatBantuan.vue`.
- Route Guard: `router.beforeEach` memverifikasi sesi melalui `authStore.checkAuth()` sebelum mengizinkan rute terproteksi.

### Area 3: API Route & Backend Service
- Rute terdaftar di `core/router/router.go` di bawah grup `/api/v1`:
  - Publik & Health: `/ping`, `/health`, `/login`, `/logout`, `/auth/session`, `/forgot-password`.
  - Super Admin (`/super/*`): Kelola sekolah, lisensi, tagihan, metrics, tiket.
  - School Admin (`/school/*`): Profil sekolah, sesi KBM, master kelas, guru, mapel, pengampu, tugas tambahan, jam kosong, jadwal, import XLSB.
  - Scheduling Solver: `POST /school/auto-schedule/solve`.
  - Realtime: `/ws` (WebSocket) dan `/realtime/stream` (SSE).

### Area 4: Authentication dan Authorization
- **Mekanisme**: JWT ditandatangani menggunakan HMAC-SHA256 (`JwtSecretKey`).
- **Cookie Flags**: Disimpan di cookie `guruku_jwt` dengan atribut `HttpOnly`, `SameSite=Strict`, `Path=/`, dan `Secure` otomatis pada koneksi HTTPS.
- **Anti-XSS**: Token tidak disimpan di `localStorage` klien.
- **RBAC**: 5 Role (`SUPER_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`, `STUDENT`, `STAFF`). Ditegakkan via `middleware.RequireRoles(...)`.
- **Tenant Context**: `middleware.TenantContextMiddleware()` mengekstrak klaim identitas sekolah (`claims.SchoolID`) langsung dari sesi terverifikasi.

### Area 5: Database Schema, Migration, Relation, Index, dan Constraint
- **Migration Files**:
  - `core/database/migrations/001_create_master_data_tables.sql`: Tabel `teachers`, `classes`, `subjects`, composite FK `(tenant_id, homeroom_teacher_id) -> teachers(tenant_id, id)`, unique indexes dengan `WHERE deleted_at IS NULL`.
  - `core/database/migrations/002_create_operating_days_and_time_sessions.sql`: Tabel `operating_days`, `time_sessions`, composite FK `(tenant_id, operating_day_id) -> operating_days(tenant_id, id)`.
- **Kelemahan Terdeteksi (P0)**: Belum ada tabel relasional `schedules` (jadwal pelajaran). Jadwal saat ini disimpan di kolom `jadwal_data` teks JSON pada tabel `schools`.

### Area 6: Parser & Import Excel (XLSB)
- **Modul**: `src/core/xlsbParser.js` (922 baris).
- **Kapasitas**: Mampu membaca binary XLSB 14 MB (`Master_Jadwal_Jadikan.xlsb`) secara sparse, mengklasifikasikan 29 worksheet ke 13 canonical roles, dan mengekstrak 18 kelas, 44 guru, 45 mapel, 7 hari, dan sesi KBM.
- **Validasi**: Error terstruktur mencakup sheet sumber, baris, kolom, dan kode error baku.
- **3 Mode**: `VALIDATE_ONLY`, `INSERT_ONLY`, `UPSERT`.
- **Determinisme**: `src/core/canonicalMapper.js` menghitung `computeUpsertKey` dengan proteksi `UPSERT_UNSAFE_KEY`.

### Area 7: Scheduling Engine
- **Solver Go**: `core/engine/scheduler.go` (CSP Zero-Alloc solver dengan heuristik Most Constrained First).
- **Solver Native**: `core/engine/scheduler.cpp` + `core/engine/scheduler_cgo.go` via CGO.
- **Constraint Tercover**:
  - Rule C: Batas JP harian guru (default 4 JP/hari).
  - Rule D: Matriks jam kosong / blocked slot guru.
  - Bentrok guru ganda pada hari & sesi yang sama.
- **Kelemahan**: Validasi bentrok belum ditegakkan pada layer database karena data jadwal disimpan sebagai raw JSON.

### Area 8: Export Excel & Output
- **Modul**: `src/core/exportSchedule.js`.
- **Format**: File resmi `.xlsx` berisi kop sekolah, judul dokumen, tahun pelajaran, semester, tabel grid hari x jam KBM, detail guru/wali kelas, statistik JP, dan blok tanda tangan kepala sekolah.

### Area 9: State Management Frontend
- **Framework**: Pinia Store (`src/stores/auth.js`, `src/stores/masterData.js`, dll.).
- **Repositories**: `src/core/masterDataRepository.js`, `src/core/schoolSetupRepository.js`, `src/core/canonicalMapper.js`.
- **Kelemahan (P0)**: Sebagian halaman (`TugasTambahan.vue`, `PengampuMapel.vue`, `JamKosong.vue`, `JadwalGuru.vue`) masih melakukan `localStorage.setItem` dan `localStorage.getItem` untuk data bisnis operasional.

### Area 10: Error Handling
- **Backend**: Sanitasi error via `middleware.RespondError(...)`. Stack trace dan query SQL tidak dibocorkan ke klien; menyertakan `requestId` unik.
- **Frontend**: State `isLoading`, `isError`, `errorMessage`, `requestId`, dan tombol `retry` terpasang di seluruh view master data dan dashboard.

### Area 11: Validasi Frontend dan Backend
- **Frontend**: Validasi form real-time (nama wajib, durasi sesi valid, format waktu HH:mm, urutan waktu end > start, deteksi overlap).
- **Backend**: Validasi DTO struct via `ShouldBindJSON`, pengecekan constraint CHECK dan UNIQUE pada layer database.

### Area 12: Konfigurasi Vercel
- **File**: `vercel.json`.
- **Rewrites**:
  - `/api/(.*)` -> `/api/index.go`
  - `/(.*)` -> `/index.html`
- **Cache Headers**: Service Worker dan webmanifest dikonfigurasi dengan `no-cache, must-revalidate`.

### Area 13: Konfigurasi Neon
- **Database Driver**: `github.com/lib/pq` dengan `sslmode=require`.
- **Connection Pool**: 10 MaxOpenConns, 5 MaxIdleConns, 5m MaxLifetime.
- **Kebutuhan**: Memerlukan URL pooled connection Neon (menggunakan port 5432 / PgBouncer pooler endpoint) untuk mencegah koneksi berlebih pada runtime serverless.

### Area 14: Environment Variable
- Template di `.env.example`: `DATABASE_URL`, `JWT_SECRET`, `PORT`, `GIN_MODE`, `VITE_API_BASE_URL`, `VITE_WS_BASE_URL`.
- Variabel rahasia (`DATABASE_URL`, `JWT_SECRET`) tidak boleh dibocorkan ke client bundle Vite.

### Area 15: Test yang Sudah Tersedia
- 17 file pengujian di folder `tests/` dengan 39 test suites dan 189 tests.
- Status eksekusi regresi: **189/189 PASSED** (0 failed, 0 skipped, 18.61s).

### Area 16: Penggunaan Mock, Seed, Dummy, dan Storage Client
- Terdapat fungsi `seedSuperAdmin()` di `core/database/db.go` yang membuat user `admin` / `admin123` jika tabel `users` kosong.
- Terdapat sisa penggunaan `localStorage` pada 7 file view frontend yang bertindak sebagai data store lokal alih-alih menghubungi API backend.

---

## 3. Matriks Temuan & Tingkat Severity

| ID Temuan | Severity | File & Baris Terkait | Dampak | Root Cause | Solusi Direkomendasikan | Status |
|---|---|---|---|---|---|---|
| `AUD-P0-001` | **P0** | `core/handlers/school_handler.go:505-555` | Jadwal tidak memiliki constraint integritas database; rawan data corrupt, bentrok ganda lolos, dan race condition overwrite. | Jadwal disimpan sebagai text JSON di kolom `schools.jadwal_data` alih-alih tabel relasional normal. | Buat migration `003_create_schedules_table.sql` dengan FK ke kelas, guru, mapel, hari, dan sesi waktu, serta unique index anti-bentrok. | **IDENTIFIED** |
| `AUD-P0-002` | **P0** | `src/views/TugasTambahan.vue:145-375`, `src/views/PengampuMapel.vue:361-540`, `src/views/JamKosong.vue:822-940`, `src/views/JadwalGuru.vue:350-455`, `src/views/JadwalKelas.vue:356-460`, `src/core/scheduleStore.js:156-189` | Data bisnis tidak tersimpan di Neon; hilang saat dibuka di perangkat lain atau browser refresh mode incognito. | Komponen frontend menggunakan `localStorage` sebagai primary data store atau fallback permanen. | Bersihkan seluruh read/write data bisnis dari `localStorage`; jadikan API backend sumber kebenaran tunggal. | **IDENTIFIED** |
| `AUD-P0-003` | **P0** | `core/handlers/master_data_handler.go:2482-2525` | Import XLSB multi-entitas dapat mengalami partial insert jika satu entitas gagal di tengah proses. | `CommitXlsbImport` memanggil batch handler secara terpisah tanpa satu database transaction (`BEGIN ... COMMIT`) pembungkus. | Buat pipeline commit XLSB atomik dengan satu transaksi database untuk seluruh entitas dalam workbook. | **IDENTIFIED** |
| `AUD-P1-001` | **P1** | `core/database/db.go:46-50, 53-434`, `api/index.go:17` | Cold start serverless lambda di Vercel lambat (500-1500ms) dan berisiko DDL lock contention di Neon. | `autoMigrateTables()` dijalankan pada setiap inisialisasi cold start fungsi serverless Vercel. | Pisahkan migrasi DDL ke migration runner terpisah; nonaktifkan auto-DDL pada request path Vercel. | **IDENTIFIED** |
| `AUD-P1-002` | **P1** | `scripts/` (belum ada script reset testing) | Pengujian tidak dapat diulang secara deterministik dari kondisi `business data = 0`. | Ketiadaan script reset database testing yang aman terhadap foreign key dan terisolasi dari production. | Buat `scripts/reset-testing-database.ts` dengan konfirmasi `CONFIRM_RESET_TEST_DB=true` dan urutan cascade aman. | **IDENTIFIED** |
| `AUD-P1-003` | **P1** | `core/handlers/master_data_handler.go:84-90, 233-280` | Data master yang disimpan di memory satu lambda Vercel tidak terlihat oleh lambda lain (stateless ephemeral). | In-memory store fallback digunakan saat `database.DB == nil`. | Nonaktifkan in-memory fallback pada environment staging/production Vercel; wajibkan koneksi Neon aktif. | **IDENTIFIED** |
| `AUD-P2-001` | **P2** | `src/config/routePaths.js:8-35` | Risiko URL encoding drift pada proxy edge atau browser tertentu akibat simbol RFC 3986 tidak standar. | Penggunaan simbol acak kompleks untuk obfuscation rute. | Pastikan route guard dan Vercel rewrites melakukan normalisasi rute secara konsisten. | **IDENTIFIED** |
| `AUD-P2-002` | **P2** | `core/engine/scheduler.go:65-120` | Bentrok jadwal masih dapat terjadi jika data diupdate langsung via API tanpa melewati solver. | Validasi bentrok ganda hanya ada di solver CSP in-memory, belum ada trigger/constraint di database. | Terapkan unique constraint dan validasi bentrok di handler database `schedules`. | **IDENTIFIED** |
| `AUD-P3-001` | **P3** | `src/core/schoolSetupRepository.js:91-105` | Tampilan profil sekolah sesaat memunculkan nama sisa dari browser sebelumnya. | Repository membaca sisa string lisensi dari localStorage sebagai fallback instan. | Tampilkan state loading / skeleton hingga response API profil sekolah diterima. | **IDENTIFIED** |

---

## 4. Rencana Kerja Perbaikan Terstruktur

1. **Tahap 1 — Database Schema & Migration Normalization**:
   - Buat migration `003_create_schedules_table.sql` untuk menampung data jadwal secara terstruktur relasional:
     - `schedules` (`id`, `tenant_id`, `academic_year`, `day_id`, `session_id`, `class_id`, `teacher_id`, `subject_id`, `room_id`, `created_at`, `updated_at`, `deleted_at`).
     - Composite Foreign Keys dengan `ON DELETE CASCADE`.
     - Unique Partial Indexes:
       - `uk_schedules_teacher_slot`: `UNIQUE (tenant_id, academic_year, day_id, session_id, teacher_id) WHERE deleted_at IS NULL` (Anti-bentrok guru).
       - `uk_schedules_class_slot`: `UNIQUE (tenant_id, academic_year, day_id, session_id, class_id) WHERE deleted_at IS NULL` (Anti-bentrok kelas).
       - `uk_schedules_room_slot`: `UNIQUE (tenant_id, academic_year, day_id, session_id, room_id) WHERE room_id IS NOT NULL AND deleted_at IS NULL` (Anti-bentrok ruangan).

2. **Tahap 2 — Pembuatan Script Reset Testing Database (`scripts/reset-testing-database.ts`)**:
   - Buat script eksekusi reset dengan proteksi environment, konfirmasi eksplisit, transaksi aman, urutan penghapusan sesuai dependensi foreign key, dan verifikasi `business data = 0`.
   - Dokumentasikan di `docs/testing-database-reset.md`.

3. **Tahap 3 — Eliminasi LocalStorage & Pembersihan Data Store Frontend**:
   - Bersihkan direct `localStorage` reads/writes pada `TugasTambahan.vue`, `PengampuMapel.vue`, `JamKosong.vue`, `JadwalGuru.vue`, `JadwalKelas.vue`, dan `scheduleStore.js`.
   - Sambungkan langsung ke API backend dengan state loading, empty, error, dan success.

4. **Tahap 4 — Transaksi Atomik Import XLSB**:
   - Buat endpoint commit import XLSB atomik di Go backend yang membungkus seluruh insert kelas, guru, mapel, hari, dan sesi dalam satu transaksi SQL.
   - Dokumentasikan pemetaan struktur dan logic di `docs/excel-logic-parity.md`.

5. **Tahap 5 — Validasi Bentrok Scheduling di Backend & Security Hardening**:
   - Terapkan validasi bentrok jadwal di handler dan uji skenario concurrent request.
   - Buat dokumen `docs/security-audit.md` dan jalankan checklist 30 poin.
   - Terbitkan `docs/production-like-test-report.md` dan `docs/known-limitations.md`.
