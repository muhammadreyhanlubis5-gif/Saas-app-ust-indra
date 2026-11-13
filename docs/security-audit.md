# LAPORAN SECURITY AUDIT & DEFENSE ARCHITECTURE
## Aplikasi GuruKu — Enterprise Security, Multi-Tenant Isolation & DevSecOps

Tanggal: 13 November 2026  
Status Keamanan: **AUDITED & SECURED**  
Target Verifikasi: Sesi, Token, RBAC, Isolasi Tenant, Anti-IDOR, SQL Injection, Anti-XSS, CSRF, Sanitasi Error, Proteksi File Upload  
Dokumen Target: `docs/security-audit.md`  

---

## 1. Arsitektur Pertahanan Berlapis (Defense-in-Depth)

Sistem Aplikasi GuruKu menerapkan 8 pilar pertahanan keamanan siber:

1. **Zero-Token Client Storage (Anti-XSS)**:
   Token JWT sesi tidak pernah disimpan di `localStorage` atau `sessionStorage`. Token dikirimkan dan disimpan secara eksklusif menggunakan cookie server-side dengan atribut `HttpOnly`, `SameSite=Strict`, `Path=/`, dan `Secure` otomatis pada TLS/HTTPS. Skrip JavaScript yang disusupi di sisi klien (XSS) tidak dapat membaca atau mencuri token otentikasi.
2. **Klaim Sesi Otoritatif (Anti-Tenant Spoofing)**:
   Nilai `tenant_id` dan `role` diekstrak dari claims token yang telah diverifikasi signature-nya oleh server. Nilai `tenant_id` yang dikirimkan di dalam request body, query parameter, form input, atau spreadsheet file diabaikan atau dioverwrite secara paksa oleh middleware backend.
3. **Database Multi-Tenant Isolation & Anti-IDOR**:
   Setiap query ke tabel bertarget tenant (`teachers`, `classes`, `subjects`, `schedules`, `operating_days`, `time_sessions`) memuat filter ganda wajib:
   ```sql
   WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL
   ```
   Upaya mengakses record sekolah lain dengan menebak atau memanipulasi UUID pada URL langsung mengembalikan HTTP 404 (Not Found) / 401 (Unauthorized).
4. **Composite Foreign Keys Lintas Relasi**:
   Seluruh foreign key antartabel menerapkan kunci komposit `(tenant_id, target_id) REFERENCES parent_table(tenant_id, id)`. Menjamin bahwa referensi data lintas sekolah (misal: kelas Sekolah A mereferensikan guru Sekolah B) langsung ditolak oleh PostgreSQL constraint engine.
5. **Pencegahan SQL Injection**:
   100% query database menggunakan *parameterized queries* (`$1`, `$2`, `$3` pada PostgreSQL driver). Tidak ada konkatenasi string SQL mentah pada alur produksi.
6. **Perlindungan Upload Spreadsheet**:
   - Batas ukuran file maksimal: **25 MB** (`MAX_FILE_SIZE_BYTES`).
   - Validasi format magic bytes (menolak file biner bukan spreadsheet / PDF).
   - Eksekusi macro VBA diblokir (SheetJS binary decoding murni tanpa eksekusi script).
   - Penolakan buffer kosong atau null.
7. **Sanitasi Error Internal (Anti-Information Leakage)**:
   Error HTTP 500 disanitasi menggunakan envelope baku `middleware.RespondError(...)`. Stack trace sistem operasi, path file lokal, dan pesan sintaks SQL database tidak pernah dibocorkan ke respon klien; sistem menyertakan `requestId` unik untuk audit log internal.
8. **DevSecOps Defense: Token Bucket Rate Limiter**:
   Middleware rate limiter membatasi traffic hingga 60 req/s per IP dengan burst capacity 20 req/s untuk mencegah serangan brute-force dan DoS.

---

## 2. Hasil Eksekusi 13 Skenario Security Test Wajib

File pengujian: `tests/security_compliance.test.js`

| No | Skenario Pengujian | Target Uji | Mekanisme Proteksi | Status |
|---|---|---|---|---|
| 1 | Request tanpa login ditolak | Endpoint terproteksi | Route guard & AuthMiddleware me-reject request tanpa token ke HTTP 401 | **VERIFIED** |
| 2 | Token invalid ditolak | Validasi JWT | HMAC-SHA256 signature mismatch langsung melempar error `AUTH_TOKEN_INVALID` | **VERIFIED** |
| 3 | User tanpa permission ditolak | Hak akses RBAC | Role `TEACHER` mengakses endpoint `SUPER_ADMIN` diblokir dengan HTTP 403 `INSUFFICIENT_PERMISSIONS` | **VERIFIED** |
| 4 | Tenant A tidak dapat membaca data Tenant B | Isolasi data | Query difilter ketat per tenant context; data Tenant B tidak pernah bocor ke Tenant A | **VERIFIED** |
| 5 | tenant_id dari body tidak dapat mengganti session | Manipulasi payload | Server hanya membaca `tenant_id` dari server-side JWT claims yang terotentikasi | **VERIFIED** |
| 6 | ID record tenant lain tidak dapat diakses via URL | Anti-IDOR | Query memverifikasi kepemilikan tenant; ID asing mengembalikan 404 / kosong | **VERIFIED** |
| 7 | File bukan Excel ditolak | Validasi upload | Buffer biner non-spreadsheet (misal PDF) ditolak dengan `FILE_INVALID_TYPE` | **VERIFIED** |
| 8 | File corrupt ditolak | Integritas file | Buffer kosong atau format rusak ditolak dengan `REQUIRED_FIELD_MISSING` | **VERIFIED** |
| 9 | File melebihi batas ukuran ditolak | Pembatasan DoS | File > 25 MB langsung ditolak dengan error `FILE_OVERSIZED` sebelum parsing | **VERIFIED** |
| 10 | Payload invalid ditolak | Validasi format | Input JSON tanpa field wajib (nama, tahun ajaran) ditolak dengan HTTP 400 | **VERIFIED** |
| 11 | Secret tidak muncul dalam respon | Sanitasi endpoint | Endpoint `/health` dan respons publik tidak membocorkan connection string, password, atau secret key | **VERIFIED** |
| 12 | Error internal tidak bocor ke klien | Sanitasi exception | Pesan error SQL/stack trace digantikan oleh pesan generik aman dengan `requestId` | **VERIFIED** |
| 13 | Double submit tidak membuat duplicate | Re-entrancy | Guard `isSaving` memblokir klik ganda cepat sebelum proses pertama selesai | **VERIFIED** |

---

## 3. Matriks Hak Akses Peran (RBAC Matrix)

| Modul / Endpoint | SUPER_ADMIN | SCHOOL_ADMIN | TEACHER | STUDENT | STAFF |
|---|:---:|:---:|:---:|:---:|:---:|
| `/api/v1/super/*` | Ya | Tidak (403) | Tidak (403) | Tidak (403) | Tidak (403) |
| `/api/v1/school/classes` (CRUD) | Ya | Ya | Baca Saja | Tidak | Tidak |
| `/api/v1/school/teachers` (CRUD) | Ya | Ya | Baca Saja | Tidak | Tidak |
| `/api/v1/school/subjects` (CRUD) | Ya | Ya | Baca Saja | Tidak | Tidak |
| `/api/v1/school/import/xlsb/*` | Ya | Ya | Tidak (403) | Tidak (403) | Tidak (403) |
| `/api/v1/school/auto-schedule/solve` | Ya | Ya | Tidak (403) | Tidak (403) | Tidak (403) |
| `/api/v1/school/jadwal` (Read) | Ya | Ya | Ya | Ya | Ya |
| `/api/v1/school/jadwal` (Update) | Ya | Ya | Tidak (403) | Tidak (403) | Tidak (403) |
