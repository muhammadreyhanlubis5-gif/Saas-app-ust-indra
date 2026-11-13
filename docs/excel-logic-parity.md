# PEMETAAN STRUKTUR & BUSINESS LOGIC EXCEL (PARITY REPORT)
## Aplikasi GuruKu — Master Jadwal Excel Reference Specification

Tanggal: 13 November 2026  
File Referensi Resmi: `docs/reference/Master_Jadwal_Jadikan.xlsb` (14,038,836 bytes)  
Target Parser: `src/core/xlsbParser.js` & `src/core/canonicalMapper.js`  
Dokumen Target: `docs/excel-logic-parity.md`  

---

## 1. Pemetaan Worksheet & 13 Canonical Roles

Workbook `Master_Jadwal_Jadikan.xlsb` memiliki total 29 lembar kerja (worksheets). Berdasarkan audit arsitektur, seluruh worksheet diklasifikasikan ke dalam 13 peran kanonikal:

| No | Nama Sheet | Klasifikasi Peran | Fungsi Bisnis |
|---|---|---|---|
| 1 | `HOME` | `INSTRUCTIONS` | Halaman selamat datang dan panduan pengguna |
| 2 | `PPA` | `INSTRUCTIONS` | Profil pesantren/madrasah dan parameter yayasan (Nama Sekolah: cell B8) |
| 3 | `Rombel` | `MIXED_SCHEMA` | Lembar kerja utama master data (memuat 5 blok data esensial) |
| 4 | `Time KBM` | `TIME_SLOTS` | Definisi jam sesi KBM dan waktu istirahat harian |
| 5 | `Kegiatan Non Mapel` | `CONSTRAINTS` | Pembatasan upacara, sholat dhuha/dzuhur, dan apel |
| 6 | `Genarate Kode` | `FORMULA_OR_CALCULATION_ENGINE` | Generator formula kode guru dan kode unik mapel |
| 7 | `Alokasi` | `WORKLOAD_ALLOCATION` | Distribusi alokasi jam mengajar guru per tingkat |
| 8 | `Jlh Mapel Diampu` | `FORMULA_OR_CALCULATION_ENGINE` | Rekapitulasi beban jam total per guru |
| 9 | `Pengampu` | `WORKLOAD_ALLOCATION` | Matriks penugasan guru pengampu terhadap rombel kelas |
| 10 | `Rumus Input Jadwal` | `FORMULA_OR_CALCULATION_ENGINE` | Helper perhitungan penempatan slot |
| 11 | `Rumus Ciutkan Baris Pengampu` | `FORMULA_OR_CALCULATION_ENGINE` | Filter dinamis guru aktif |
| 12 | `Input Jadwal` | `SCHEDULE_GRID` | Matriks input manual jadwal kelas |
| 13 | `Hit Kode Guru dan Mapel` | `FORMULA_OR_CALCULATION_ENGINE` | Validasi silang kode guru vs mapel |
| 14 | `Model JG` | `INSTRUCTIONS` | Format template cetak jadwal guru |
| 15 | `Jadwal Guru` | `SCHEDULE_GRID` | Tampilan jadwal mingguan berorientasi guru (Sheet 1) |
| 16 | `Jadwal Guru 2` | `SCHEDULE_GRID` | Tampilan jadwal mingguan berorientasi guru (Sheet 2) |
| 17 | `Analisis Mapel` | `FORMULA_OR_CALCULATION_ENGINE` | Analisis pemenuhan kurikulum per mapel |
| 18 | `Analisis Guru` | `FORMULA_OR_CALCULATION_ENGINE` | Analisis ekuivalensi beban kerja 24 JP sertifikasi |
| 19 | `TT` | `WORKLOAD_ALLOCATION` | Daftar tugas tambahan (Wakasek, Pembina, Kepala Lab) |
| 20 | `MJ` | `TEACHER_PREFERENCES` | Minta Jadwal (preferensi hari libur dan jam kosong guru) |
| 21 | `MJ X` | `FORMULA_OR_CALCULATION_ENGINE` | Helper kalkulasi matriks preferensi guru |
| 22 | `CMJ Sebaran` | `FORMULA_OR_CALCULATION_ENGINE` | Analisis sebaran jam kosong guru |
| 23 | `CMJ Hasil` | `CONSTRAINTS` | Hasil akhir matriks constraint jam kosong (Rule D) |
| 24 | `Jadwal K` | `SCHEDULE_GRID` | Tampilan jadwal mingguan berorientasi rombel kelas |
| 25 | `Jadwal K 2` | `SCHEDULE_GRID` | Tampilan jadwal rombel kelas (Halaman kedua) |
| 26 | `Model JK` | `INSTRUCTIONS` | Panduan tata letak format cetak jadwal kelas |
| 27 | `Serti` | `FORMULA_OR_CALCULATION_ENGINE` | Verifikasi syarat pencairan tunjangan profesi guru |
| 28 | `Tolok U` | `CONSTRAINTS` | Parameter batas maksimal jam per hari (Rule C: 4 JP) |
| 29 | `JL` | `UNUSED_OR_ARCHIVED` | Arsip formula legacy |

---

## 2. Struktur Khusus Sheet `Rombel` (Mixed Schema)

Sheet `Rombel` tidak memiliki skema datar tunggal. Terdapat 5 blok data independen yang diekstrak secara sparse oleh parser:

1. **Blok 1: Header Profil Sekolah (Baris 3-10, Kolom B-D)**:
   - Nama Lembaga: Kolom D Baris 4.
   - Fallback: Sheet `PPA` Cell `B8`.
2. **Blok 2: Hari Operasional & Variasi Jam Harian (Baris 16-53)**:
   - Sabtu: Kolom B (8 sesi KBM, 07:30 - 13:20).
   - Minggu: Kolom F (8 sesi KBM, 07:30 - 13:20).
   - Senin: Kolom I (10 sesi KBM, 07:30 - 15:00).
   - Selasa: Kolom B Baris 36 (10 sesi KBM, 07:30 - 15:00).
   - Rabu: Kolom F Baris 36 (10 sesi KBM, 07:30 - 15:00).
   - Kamis: Kolom I Baris 36 (8 sesi KBM, 07:30 - 13:20).
   - Jumat: Hari Libur Pesantren / Non-Aktif (`isActive: false`).
3. **Blok 3: Master Rombel Kelas (Baris 61-85, Kolom B-D)**:
   - Header: Baris 61 (`B61: No`, `C61: Nama Rombel/Kelas`, `D61: Wali Kelas`).
   - Data Kelas: 18 Kelas riil (e.g. `1 A`, `1 B`, `1 C`, ..., `6 MAPK`).
4. **Blok 4: Master Dewan Guru (Baris 61-110, Kolom E-G)**:
   - Header: Baris 61 (`E61: No`, `F61: Kode Guru`, `G61: Nama Guru`).
   - Data Guru: 44 Guru aktif (e.g. `01 / T. Saiful Bahri, Lc`, `02 / Drs. Ahmad`).
5. **Blok 5: Master Mata Pelajaran (Baris 61-115, Kolom I-L)**:
   - Header: Baris 61 (`I61: No`, `J61: Kode Mapel`, `K61: Nama Mata Pelajaran`, `L61: Alokasi JP`).
   - Data Mapel: 45 Mata Pelajaran resmi.

---

## 3. Penanganan Tipikal Data Excel

1. **Preservasi Leading Zero**:
   Kode guru seperti `'01'`, `'02'`, `'09'` disimpan secara ketat sebagai string `VARCHAR(50)`, tidak pernah di-cast menjadi integer `1`, `2`, `9`.
2. **Cell Kosong & Sparse Traversal**:
   Parser tidak melakukan loop hingga batas baris Excel (1.048.576). Hanya sel yang memiliki nilai nyata yang dibaca untuk mencegah memory spike.
3. **Error Formula**:
   Nilai formula error (`#N/A`, `#VALUE!`, `#REF!`) ditangkap dan menghasilkan warning/error validasi terstruktur tanpa menghentikan parser secara kasar.
4. **Merged Cell Resolution**:
   Nilai sel yang tergabung (merged range) diambil dari sel induk (top-left anchor cell).

---

## 4. Alur Import Terpadu & Format Error

Alur impor transaksi wajib:
```text
Upload File (.xlsb)
  -> Safe Binary Parser (xlsbParser.js)
  -> Validasi Skema & Aturan Bisnis
  -> Tampilan Preview Hasil Validasi (18 kelas, 44 guru, 45 mapel)
  -> Konfirmasi User (Pilihan Mode: INSERT_ONLY atau UPSERT)
  -> Satu Transaksi Database (Atomic BEGIN ... COMMIT)
  -> Invalidate Store Cache & Sinkronisasi UI
```

### Format Error Baku:
```json
{
  "sheet": "Rombel",
  "row": 12,
  "column": "G",
  "field": "teacher_code",
  "canonicalField": "code",
  "code": "REQUIRED",
  "message": "Kode guru wajib diisi"
}
```

---

## 5. Idempotency & Pencegahan Double Submit

1. **Re-entrancy Lock**: Tombol submit UI memicu guard `isCommitting = true` hingga network request selesai, mencegah request ganda.
2. **Import Collision Protection**: Pada mode `INSERT_ONLY`, file yang diunggah dua kali ditolak dengan kode `COLLISION_EXISTING`, tanpa membuat data ganda atau parsial.
3. **Deterministik Natural Key (UPSERT)**: Pencocokan update menggunakan natural key sah (`tenant_id + academic_year + normalized_name`). Record yang tidak memiliki identitas stabil ditolak dengan `UPSERT_UNSAFE_KEY`.
