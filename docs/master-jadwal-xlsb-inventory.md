# INVENTORY DAN AUDIT RESMI WORKBOOK MASTER JADWAL XLSB
## Aplikasi GuruKu — Master Schedule Reference Inspection

- **File Name**: `Master_Jadwal_Jadikan.xlsb`
- **File Size**: `14,038,836 bytes` (13.39 MB)
- **Format**: `Excel Binary Workbook (.xlsb), BIFF12`
- **Worksheet Count**: `29` (20 Visible, 9 Hidden)
- **VBA Macro / Code**: Ada (`vbaraw: true`)
- **Password / Encryption**: Tidak Ada (Unencrypted)
- **External Links**: Tidak Ada (Self-contained workbook)
- **Named Ranges**: `2,296` Named Ranges
- **Status Audit**: `AUDITED`
- **Readiness Classification**: `INVENTORIED` / `TEST_READY`
- **E2E Status**: `NOT_VERIFIED` (Belum diuji dengan real browser automation)
- **RLS Status**: `NOT_VERIFIED` (Membutuhkan PostgreSQL instance dengan RLS session context)
- **Scheduling Engine Status**: `BLOCKED` (Readiness gate aktif)

---

## 1. TABEL INVENTORY 29 WORKSHEET

| No | Sheet Name | Visibility | Rows | Columns | Header Row | Merged Cells | Formula Count | Klasifikasi Kategori | Keterangan & Karakteristik Data |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `Home` | Visible | 1,036 | 102 | Row 12-14 | 17 | 65 | `INSTRUCTIONS` | Menu navigasi alur 1-16, ringkasan alokasi 726 JP, status sinkronisasi beban. |
| 2 | `PPA` | Visible | 184 | 8 | Row 16 | 3 | 0 | `INSTRUCTIONS` | Profil lembaga (MTs Darul Arafah, Kepala Madrasah: Marwan Halim, Waka: Prasilo Heri Yudanto, TA 2026-2027 Ganjil) & panduan unblock VBA. |
| 3 | `Rombel` | Visible | 1,048,566 | 70 | Multi (R4, R16, R23) | 21 | 93 | `MIXED_SCHEMA` | Sheet komposit: Profil Lembaga (R4-11), Pengaturan Hari & Jam (R16-53), Master Kelas (Cols B-D), Master Guru (Cols F-H), Master Mapel (Cols I-K). |
| 4 | `TIME KBM` | Hidden | 120 | 11 | Row 2 | 18 | 30 | `TIME_SLOTS` | Master slot jam per hari, durasi KBM per JP, jeda istirahat (REH 1 & REH 2). |
| 5 | `Kegiatan Non Mapel` | Hidden | 1,048,473 | 24 | Row 1 | 7 | 742 | `CONSTRAINTS` | Slot kegiatan non-mapel terikat waktu: Upacara (`UP`), Istirahat (`REH`), Sholat (`SH`), Dhuha. |
| 6 | `GENARATE KODE` | Visible | 160 | 19 | Row 1 | 0 | 160 | `FORMULA_OR_CALCULATION_ENGINE` | Tabel lookup otomatis yang menyusun kode gabungan Guru + Mapel + Kelas untuk engine scheduling. |
| 7 | `Alokasi` | Visible | 118 | 107 | Row 5-6 | 12 | 404 | `WORKLOAD_ALLOCATION` | Matriks struktur kurikulum: Alokasi jam tatap muka (JP) per mata pelajaran untuk tiap rombel/kelas (Total 726 JP). |
| 8 | `JLH MAPEL DIAMPU` | Hidden | 1,048,576 | 53 | Row 3 | 202 | 1 | `FORMULA_OR_CALCULATION_ENGINE` | Kalkulasi agregat jumlah mata pelajaran unik dan kelas paralel yang diampu tiap guru. |
| 9 | `Pengampu` | Visible | 1,119 | 61 | Row 5-6 | 795 | 1,766 | `WORKLOAD_ALLOCATION` | Matriks distribusi beban mengajar: Guru x Rombel x Mata Pelajaran. Terdapat merge cell ekstensif untuk header dan grouping. |
| 10 | `Rumus Input Jadwal` | Hidden | 228 | 1 | Row 1 | 0 | 0 | `FORMULA_OR_CALCULATION_ENGINE` | Formula ekspresi pembantu untuk lookup koordinat jadwal harian. |
| 11 | `Rumus Ciutkan Baris Pengampu` | Hidden | 1,673 | 16,383 | Row 1 | 0 | 22 | `FORMULA_OR_CALCULATION_ENGINE` | Skrip ekspresi untuk filter visual baris pengampu kosong. |
| 12 | `Input Jadwal` | Visible | 561 | 11,912 | Row 4-5 | 186 | 1,540 | `SCHEDULE_GRID` | Matriks induk jadwal pelajaran: Hari x Jam Ke x Rombel (18 kelas). |
| 13 | `Hit Kode Guru dan Mapel` | Hidden | 153 | 53 | Row 3 | 0 | 7,800 | `FORMULA_OR_CALCULATION_ENGINE` | Mesin validasi duplikasi pengampu dan kalkulasi kode kombinasi di jadwal. |
| 14 | `Model JG` | Visible | 64 | 22 | Row 1 | 1 | 0 | `INSTRUCTIONS` | Template layout cetak Jadwal Guru mingguan. |
| 15 | `Jadwal Guru` | Visible | 106 | 53 | Row 4 | 12 | 226 | `SCHEDULE_GRID` | Tampilan jadwal per guru (individual teacher timetable view). |
| 16 | `Jadwal Guru 2` | Visible | 99 | 53 | Row 4 | 10 | 374 | `SCHEDULE_GRID` | Varian alternatif format cetak jadwal guru. |
| 17 | `Analisis Mapel` | Visible | 332 | 66 | Row 4 | 14 | 16,064 | `FORMULA_OR_CALCULATION_ENGINE` | Audit integritas alokasi: membandingkan alokasi rencana vs jadwal terpasang per mapel. |
| 18 | `Analisis Guru` | Visible | 327 | 66 | Row 4 | 16 | 16,218 | `FORMULA_OR_CALCULATION_ENGINE` | Audit beban guru: jam per hari, jam kosong (gap hour), batas maksimal mengajar harian. |
| 19 | `TT` | Visible | 1,003 | 65 | Row 4 | 96 | 859 | `WORKLOAD_ALLOCATION` | Tugas Tambahan: Kepala Madrasah (12 JP), Waka (12 JP), Wali Kelas, Kepala Lab, Pembina Ekskul. |
| 20 | `MJ` | Visible | 95 | 11,925 | Row 4 | 2 | 382 | `TEACHER_PREFERENCES` | Minta Jadwal: Matriks preferensi hari/jam kosong permintaan guru (ditandai 'X'). |
| 21 | `MJ x` | Hidden | 94 | 11,880 | Row 4 | 2 | 9,281 | `FORMULA_OR_CALCULATION_ENGINE` | Matriks kalkulasi korelasi preferensi guru terkonversi boolean. |
| 22 | `CMJ sebaran` | Hidden | 184 | 11,879 | Row 4 | 2 | 9,281 | `FORMULA_OR_CALCULATION_ENGINE` | Distribusi frekuensi bentrokan antara jadwal aktual dengan preferensi guru. |
| 23 | `CMJ Hasil` | Visible | 184 | 11,877 | Row 4 | 2 | 9,276 | `CONSTRAINTS` | Hasil audit bentrokan: verifikasi otomatis apakah ada guru yang dijadwalkan pada jam yang di-request kosong. |
| 24 | `Jadwal K` | Visible | 102 | 53 | Row 4 | 14 | 222 | `SCHEDULE_GRID` | Format jadwal per rombel/kelas (class timetable view). |
| 25 | `Jadwal K 2` | Visible | 91 | 53 | Row 4 | 18 | 373 | `SCHEDULE_GRID` | Format alternatif jadwal per kelas. |
| 26 | `Model JK` | Visible | 108 | 52 | Row 1 | 1 | 0 | `INSTRUCTIONS` | Template layout cetak Jadwal Kelas. |
| 27 | `Serti` | Visible | 1,003 | 127 | Row 4 | 3 | 1,213 | `FORMULA_OR_CALCULATION_ENGINE` | Audit kelayakan tunjangan profesi: kepatuhan syarat linieritas dan batas minimum 24 JP per guru. |
| 28 | `Tolok U` | Hidden | 109 | 56 | Row 4 | 5 | 5,403 | `CONSTRAINTS` | Tolok Ukur kendala penjadwalan: pembatasan sebaran mapel berat dan batas bentrok. |
| 29 | `JL` | Visible | 21 | 1 | Row 1 | 0 | 0 | `UNUSED_OR_ARCHIVED` | Worksheet dummy/placeholder minimal (21 baris x 1 kolom). |

---

## 2. DETAIL STRUKTUR SHEET KRUSIAL (AUDIT REALITAS)

### 2.1 Sheet `Rombel` (Kategori: `MIXED_SCHEMA`)
Sheet `Rombel` bukan tabel tabular sederhana, melainkan dashboard pengaturan fondasi yang menggabungkan 5 blok data:

1. **Blok Profil Lembaga (Baris 4–11)**:
   - Nama Lembaga: `MTS. DARUL ARAFAH`
   - Kepala Madrasah: `MARWAN HALIM, S.Pd.I`
   - NIP Kepala: `-`
   - WKM Kurikulum: `PRASILO HERI YUDANTO, S.Pd`
   - NIP WKM: `-`
   - Tahun Ajaran: `2026/2027`
   - Semester: `Ganjil`
   - Titimangsa Jadwal: `Lau Bakeri, 13 Juli 2026`

2. **Blok Hari Operasional & Jam Belajar (Baris 16–53, Kolom B–C)**:
   - Sabtu: 8 JP (07.30 - 13.20)
   - Minggu: 8 JP (07.30 - 13.20)
   - Senin: 10 JP (07.30 - 15.00)
   - Selasa: 10 JP (07.30 - 15.00)
   - Rabu: 10 JP (07.30 - 15.00)
   - Kamis: 8 JP (07.30 - 13.20)
   - Jumat: Libur / Non-KBM
   - **Total Sesi Mingguan**: 54 Jam Pelajaran (JP).

3. **Blok Master Rombel / Kelas (Baris 24–41, Kolom B–D)**:
   - Kolom B: No (1–18)
   - Kolom C: Nama Rombel (`4 TM`, `4 MAPK`, `4 SAINS`, `4 BHS A`, `4 BHS B`, `5 IPA-A`, `5 IPS-B`, `5 SAINS`, `5 MAPK`, `5 TM-A IPA`, `5 TM-B IPS`, `6 IPA-A`, `6 IPA-B`, `6 IPS-C`, `6 IPS-D`, `6 SAINS`, `6 MAPK`, `18 TES`)
   - Kolom D: Tingkat / Jenjang (`4`, `5`, `6`)

4. **Blok Master Guru (Baris 24–67, Kolom F–H)**:
   - Kolom F: No (1–44)
   - Kolom G: Kode Guru (2-3 huruf: `MH`, `PHY`, `IS`, `MF`, `AS`, `US`, `SA`, `SB`, `MHD`, dll.)
   - Kolom H: Nama Lengkap Guru (`Marwan Halim, S.Pd.I`, `Prasilo Heri Yudanto, S.Pd`, dll.)

5. **Blok Master Mata Pelajaran (Baris 24–68, Kolom I–K)**:
   - Kolom I: No (1–45)
   - Kolom J: Kode Mapel (`AD`, `AKU`, `ATR`, `BA`, `BI`, `BING`, `BAL`, `BIO`, `EKO`, `FIS`, `GEO`, `KIM`, `MAT`, `PKN`, `PAI`, dll.)
   - Kolom K: Nama Mata Pelajaran (`Adab`, `Al-Qur'an Hadits`, `Bahasa Arab`, `Bahasa Indonesia`, `Bahasa Inggris`, `Biologi`, `Ekonomi`, `Fisika`, `Geografi`, `Kimia`, `Matematika`, dll.)

---

## 3. CANONICAL DATA MAPPING & GAP ANALYSIS TERHADAP DATABASE

Berdasarkan audit DDL database PostgreSQL existing (`001_create_master_data_tables.sql` dan `core/database/db.go`), ditemukan temuan gap struktural:

### 3.1 Gap 1: Kolom `code` pada Tabel `teachers`
- **Temuan**: File referensi `.xlsb` secara konsisten menghubungkan alokasi beban, matriks jadwal, dan preferensi waktu menggunakan **Kode Guru** (`MH`, `PHY`, dll.). Tabel `teachers` existing baru memiliki kolom `name`, `nip`, `email`, `phone`, `specialization`, tanpa kolom `code`.
- **Koreksi Diperlukan**: Tambahkan kolom `code VARCHAR(50) NULL` pada tabel `teachers` dengan unique partial index `(tenant_id, UPPER(TRIM(code))) WHERE deleted_at IS NULL`.

### 3.2 Gap 2: Dukungan Hari Operasional & Variasi Jumlah Sesi Harian
- **Temuan**: Workbook referensi membuktikan secara faktual bahwa jumlah jam pelajaran (JP) **tidak sama setiap hari**:
  - Sabtu: 8 JP
  - Minggu: 8 JP
  - Senin: 10 JP
  - Selasa: 10 JP
  - Rabu: 10 JP
  - Kamis: 8 JP
  - Jumat: 0 JP (Libur)
  Jika sistem mengasumsikan durasi/jumlah slot statis 8 JP setiap hari, maka jadwal hari Senin–Rabu (10 JP) akan terpotong 2 JP per hari (kehilangan 6 JP x 18 kelas = 108 JP tidak terjadwal!).
- **Koreksi Diperlukan**: Buat tabel `operating_days` dan `time_sessions` ternormalisasi dengan relasi `1-to-many` ke sekolah/tenant dan foreign key per hari, sehingga setiap hari dapat memiliki jumlah sesi, label KBM, dan durasi istirahat yang independen.

---

## 4. SKEMA CANONICAL MAPPING

### 4.1 Master Kelas (`classes`)
| Kolom XLSB (Sheet `Rombel`) | Alias Alternatif | Canonical Database Column | Tipe Data | Aturan Validasi |
|---|---|---|---|---|
| `Nama Rombel` / `Kelas` | `ROMBEL`, `NAMA KELAS`, `KELAS` | `name` | `VARCHAR(100)` | Wajib diisi, trim, unik per tenant |
| `Tingkat` / `Jenjang` | `TINGKAT`, `GRADE`, `LEVEL` | `grade_level` | `INTEGER` | Integer 1-12 |
| `Jurusan` (opsional) | `JURUSAN`, `PROGRAM`, `MAJOR` | `major` | `VARCHAR(100)` | Nullable, e.g. `IPA`, `IPS`, `MAPK` |
| `Tahun Ajaran` (dari Profile/Sheet) | `TAHUN AJARAN`, `TP` | `academic_year` | `VARCHAR(20)` | Format `YYYY/YYYY` |

### 4.2 Master Guru (`teachers`)
| Kolom XLSB (Sheet `Rombel`) | Alias Alternatif | Canonical Database Column | Tipe Data | Aturan Validasi |
|---|---|---|---|---|
| `Nama Guru` | `NAMA`, `NAMA LENGKAP` | `name` | `VARCHAR(150)` | Wajib diisi, minimal 2 karakter |
| `Kode Guru` | `KODE`, `KD GURU`, `INISIAL` | `code` | `VARCHAR(50)` | Unik per tenant (case-insensitive) |
| `NIP` | `NIP/NUPTK`, `NO INDUK` | `nip` | `VARCHAR(50)` | Nullable |
| `Email` | `E-MAIL`, `SUREL` | `email` | `VARCHAR(100)` | Format email valid jika diisi |

### 4.3 Master Mata Pelajaran (`subjects`)
| Kolom XLSB (Sheet `Rombel`) | Alias Alternatif | Canonical Database Column | Tipe Data | Aturan Validasi |
|---|---|---|---|---|
| `Kode Mapel` | `KODE`, `KD MAPEL`, `ALIAS` | `code` | `VARCHAR(50)` | Wajib diisi, unik per tenant |
| `Nama Mata Pelajaran` | `NAMA MAPEL`, `MATA PELAJARAN` | `name` | `VARCHAR(150)` | Wajib diisi |
| `Kelompok / Kategori` | `KELOMPOK`, `KATEGORI`, `GROUP` | `category` | `VARCHAR(50)` | Nullable (e.g. `UMUM`, `KEAGAMAAN`) |

---

## 5. REKOMENDASI PIPELINE IMPORT XLSB

1. **Parser Binary Aman**:
   - Membaca buffer menggunakan SheetJS binary decoder tanpa mengeksekusi skrip VBA macro (`bookVBA: false` pada runtime parser).
   - Validasi MIME type dan ekstensi `.xlsb`.
   - Pembatasan ukuran file maksimal: **25 MB**.
2. **Multi-Mode Import**:
   - `VALIDATE_ONLY`: Melakukan parsing dan validasi data baris per baris tanpa mengubah isi database sama sekali. Mengembalikan struktur error lengkap.
   - `INSERT_ONLY`: Hanya menambahkan record baru. Jika record dengan kunci unik (misal nama kelas atau kode guru) sudah ada, batalkan atau tandai sebagai duplikat tanpa overwrite.
   - `UPSERT`: Memperbarui record jika kunci unik telah ada, atau membuat record baru jika belum ada.
3. **Penyajian Error Baris & Kolom**:
   Setiap kegagalan validasi menghasilkan JSON terstruktur:
   ```json
   {
     "sheet": "Rombel",
     "row": 28,
     "column": "G",
     "canonicalField": "code",
     "code": "DUPLICATE_CODE",
     "message": "Kode guru 'MH' sudah digunakan pada baris 24"
   }
   ```
4. **Isolasi Multi-Tenant Mutlak**:
   `tenant_id` tidak pernah diambil dari isi file Excel atau body payload yang tidak terotentikasi, melainkan diambil mutlak dari claims session token JWT backend.
