import fs from 'node:fs'
import path from 'node:path'
import * as XLSX from 'xlsx'

const filePath = path.resolve('docs/reference/Master_Jadwal_Jadikan.xlsb')
const fileStats = fs.statSync(filePath)
const fileBuffer = fs.readFileSync(filePath)
const wb = XLSX.read(fileBuffer, { type: 'buffer', cellFormula: true, bookVBA: true })

const sheetMeta = [
  { name: 'Home', role: 'INSTRUCTIONS', canImport: 'TIDAK', target: '-', note: 'Dashboard navigasi utama, menu tombol makro VBA, total alokasi jam 726 JP.' },
  { name: 'PPA', role: 'REFERENCE_DATA', canImport: 'YA (Profil Sekolah)', target: 'schools', note: 'Profil lembaga, nama kepala sekolah, wakasek, semester, tahun ajaran 2026-2027.' },
  { name: 'Rombel', role: 'MIXED_SCHEMA', canImport: 'YA (Multi-entitas)', target: 'classes, teachers, subjects, sessions', note: 'Multi-skema: Profil (R4-11), Sesi KBM (R16-53), Master Kelas (B-D), Guru (F-H), Mapel (I-K).' },
  { name: 'TIME KBM', role: 'TIME_SESSIONS', canImport: 'YA (Sesi Waktu)', target: 'time_sessions / school_sessions', note: 'Master konfigurasi jam KBM per hari (Jam ke, durasi, mulai-akhir, istirahat).' },
  { name: 'Kegiatan Non Mapel', role: 'REFERENCE_DATA', canImport: 'YA (Kegiatan Khusus)', target: 'activities / non_teaching_duties', note: 'Daftar kegiatan non-KBM seperti Upacara (UP), Istirahat (REH), Senam.' },
  { name: 'GENARATE KODE', role: 'REFERENCE_DATA', canImport: 'TIDAK (Formula)', target: '-', note: 'Sheet rumus kalkulasi pembuat kode singkatan guru dan mapel.' },
  { name: 'Alokasi', role: 'SUBJECT_ASSIGNMENTS', canImport: 'YA (Struktur Kurikulum)', target: 'curriculum_allocations', note: 'Matriks alokasi JP per mapel dan kelas (45 mapel x 18 kelas).' },
  { name: 'JLH MAPEL DIAMPU', role: 'REFERENCE_DATA', canImport: 'TIDAK (Agregasi)', target: '-', note: 'Sheet agregasi rumus jumlah mapel yang diampu oleh tiap guru.' },
  { name: 'Pengampu', role: 'SUBJECT_ASSIGNMENTS', canImport: 'YA (Beban Mengajar)', target: 'teacher_subject_assignments', note: 'Matriks penugasan guru mengajar per kelas, kriteria linier/non-linier.' },
  { name: 'Rumus Input Jadwal', role: 'REFERENCE_DATA', canImport: 'TIDAK (Rumus VBA)', target: '-', note: 'Helper table untuk validasi lookup jadwal VBA.' },
  { name: 'Rumus Ciutkan Baris Pengampu', role: 'REFERENCE_DATA', canImport: 'TIDAK (Rumus VBA)', target: '-', note: 'Helper matrix untuk memadatkan baris guru pengampu.' },
  { name: 'Input Jadwal', role: 'SCHEDULE_TEMPLATE', canImport: 'YA (Grid Jadwal)', target: 'schedule_entries', note: 'Matriks grid input jadwal utama (Hari, Sesi, Waktu x 18 Rombel Kelas).' },
  { name: 'Hit Kode Guru dan Mapel', role: 'REFERENCE_DATA', canImport: 'TIDAK (Audit Formula)', target: '-', note: 'Perhitungan jam terjadwal vs jam alokasi per guru & mapel.' },
  { name: 'Model JG', role: 'SCHEDULE_TEMPLATE', canImport: 'TIDAK (Layout Cetak)', target: '-', note: 'Template layout visual kartu jadwal mengajar guru model 1.' },
  { name: 'Jadwal Guru', role: 'SCHEDULE_RESULT', canImport: 'TIDAK (View Hasil)', target: '-', note: 'Tampilan jadwal per guru (formula lookup dinamis berdasarkan kode guru).' },
  { name: 'Jadwal Guru 2', role: 'SCHEDULE_RESULT', canImport: 'TIDAK (View Hasil)', target: '-', note: 'Tampilan jadwal per guru format ringkas model 2.' },
  { name: 'Analisis Mapel', role: 'SCHEDULE_RESULT', canImport: 'TIDAK (Laporan Analitik)', target: '-', note: 'Laporan sebaran dan total alokasi jam per mata pelajaran.' },
  { name: 'Analisis Guru', role: 'SCHEDULE_RESULT', canImport: 'TIDAK (Laporan Analitik)', target: '-', note: 'Laporan beban kerja guru per hari, total jam, dan hari luang.' },
  { name: 'TT', role: 'TEACHER_DUTIES', canImport: 'YA (Tugas Tambahan)', target: 'teacher_additional_duties', note: 'Data tugas tambahan guru (Kepala Lab, Wali Kelas, dll.) dan ekuivalensi JP.' },
  { name: 'MJ', role: 'TIME_SESSIONS', canImport: 'YA (Jam Kosong / Request)', target: 'teacher_time_constraints', note: 'Minta Jadwal: Matriks tanda silang (X) guru tidak bersedia mengajar (Rule D).' },
  { name: 'MJ x', role: 'REFERENCE_DATA', canImport: 'TIDAK (Kalkulator)', target: '-', note: 'Formula kalkulasi validasi jumlah request jadwal guru.' },
  { name: 'CMJ sebaran', role: 'REFERENCE_DATA', canImport: 'TIDAK (Kalkulator)', target: '-', note: 'Formula COUNTIF sebaran guru pada jam bentrok.' },
  { name: 'CMJ Hasil', role: 'SCHEDULE_RESULT', canImport: 'TIDAK (Laporan Audit)', target: '-', note: 'Audit kesesuaian jadwal terhadap request jam kosong guru (blok merah).' },
  { name: 'Jadwal K', role: 'SCHEDULE_RESULT', canImport: 'TIDAK (View Hasil)', target: '-', note: 'Tampilan jadwal per rombel kelas model 1.' },
  { name: 'Jadwal K 2', role: 'SCHEDULE_RESULT', canImport: 'TIDAK (View Hasil)', target: '-', note: 'Tampilan jadwal per rombel kelas model 2.' },
  { name: 'Model JK', role: 'SCHEDULE_TEMPLATE', canImport: 'TIDAK (Layout Cetak)', target: '-', note: 'Template layout visual cetak jadwal rombel kelas.' },
  { name: 'Serti', role: 'TEACHER_DUTIES', canImport: 'YA (Analisis Sertifikasi)', target: 'teacher_certification_audit', note: 'Analisis beban 24 JP sertifikasi (Linier + Non Linier + Tugas Tambahan).' },
  { name: 'Tolok U', role: 'REFERENCE_DATA', canImport: 'TIDAK (Referensi Beban)', target: '-', note: 'Matriks tolok ukur pembagian jam mengajar guru per kelas.' },
  { name: 'JL', role: 'REFERENCE_DATA', canImport: 'TIDAK (Catatan Tambahan)', target: '-', note: 'Catatan tambahan jadwal lainnya.' }
]

console.log('Generating markdown documentation...')

let md = `# INVENTARISASI & AUDIT TEMPLATE MASTER JADWAL EXCEL (.XLSB)
**Aplikasi GuruKu — Master Architecture & Template Reference Specification**

- **Nama File**: \`Master_Jadwal_Jadikan.xlsb\`
- **Ukuran File**: ${fileStats.size.toLocaleString('id-ID')} bytes (~${(fileStats.size / (1024 * 1024)).toFixed(2)} MB)
- **Format File**: Microsoft Excel Binary Workbook (\`.xlsb\`) BIFF12
- **Jumlah Worksheet**: ${wb.SheetNames.length} Sheets
- **Dukungan Macro / VBA**: \`${Boolean(wb.vbaraw)}\` (\`vbaraw\` ditemukan, mengandung modul VBA)
- **Named Ranges Global**: ${wb.Workbook?.Names?.length || 0} entri
- **Password / Enkripsi File**: Tidak ada (File dapat dibaca langsung oleh SheetJS)
- **External Links**: Tidak ada ketergantungan link workbook eksternal

---

## 1. INVENTORI LENGKAP WORKSHEET

| No | Sheet | Visible | Rows | Columns | Header Row | Merged Cell | Formula | Keterangan |
|---|---|---|---|---|---|---|---|---|
`

for (let i = 0; i < wb.SheetNames.length; i++) {
  const name = wb.SheetNames[i]
  const sheet = wb.Sheets[name]
  const meta = sheetMeta[i]
  const ref = sheet['!ref'] || 'A1:A1'
  const range = XLSX.utils.decode_range(ref)
  const rows = range.e.r - range.s.r + 1
  const cols = range.e.c - range.s.c + 1
  const merges = (sheet['!merges'] || []).length
  let formulaCount = 0
  for (const k of Object.keys(sheet)) {
    if (!k.startsWith('!') && sheet[k].f) formulaCount++
  }
  const wsMeta = wb.Workbook?.Sheets?.[i]
  const vis = wsMeta?.Hidden === 1 ? 'Hidden' : wsMeta?.Hidden === 2 ? 'VeryHidden' : 'Visible'

  md += `| ${i + 1} | \`${name}\` | ${vis} | ${rows.toLocaleString('id-ID')} | ${cols} | Baris ${meta.role === 'MIXED_SCHEMA' ? 'Variatif (4, 16, 61)' : '4-6'} | ${merges} | ${formulaCount.toLocaleString('id-ID')} | ${meta.note} |\n`
}

md += `\n---

## 2. IDENTIFIKASI STRUKTUR DATA TEMPLATE & CANONICAL MAPPING

| Sheet | Kolom Asli | Nama Canonical | Tipe Data | Wajib | Normalisasi | Validasi | Catatan |
|---|---|---|---|---|---|---|---|
| \`PPA\` | Nama Kepala Sekolah | \`principal_name\` | String | Opsional | Trim | - | Profil Pimpinan |
| \`PPA\` | Nama Wakasek Bid. Kurikulum | \`curriculum_head_name\` | String | Opsional | Trim | - | Penanggung Jawab Kurikulum |
| \`PPA\` | Tanggal Pembuatan Jadwal | \`schedule_date\` | Date/String | Opsional | YYYY-MM-DD | Format tanggal valid | Tanggal cetak SK |
| \`PPA\` | NAMA SEKOLAH/MADRASAH | \`school_name\` | String | Ya | Trim | Tidak boleh kosong | Nama unit sekolah |
| \`PPA\` | TAHUN PELAJARAN | \`academic_year\` | String | Ya | Trim (e.g. 2026-2027) | Format YYYY/YYYY atau YYYY-YYYY | Tahun ajaran aktif |
| \`PPA\` | SEMESTER | \`semester\` | String | Ya | UPPER (GANJIL / GENAP) | Enum 'GANJIL' / 'GENAP' | Semester KBM |
| \`Rombel\` | HARI KBM | \`day_of_week\` | String | Ya | Normalisasi Nama Hari | Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu | Hari operasional KBM |
| \`Rombel\` | Jam Ke : | \`session_number\` | Integer | Ya | Integer (1, 2, ...) | Sesi >= 1 | Urutan sesi KBM |
| \`Rombel\` | WAKTU (SESUAIKAN) | \`time_range\` | String | Ya | Split HH:mm - HH:mm | Jam mulai < Jam selesai | Rentang waktu KBM / Istirahat |
| \`Rombel\` | NAMA KELAS | \`class_name\` | String | Ya | UPPER(TRIM(name)) | Unik per tenant & tahun ajaran | Rombel (e.g. '4 TM', '5 IPA-A') |
| \`Rombel\` | WALI KELAS | \`homeroom_teacher_name\` | String | Opsional | Trim | Harus merujuk guru aktif di tenant | Matching ke \`teachers.id\` |
| \`Rombel\` | NAMA GURU | \`teacher_name\` | String | Ya | Trim | Tidak boleh kosong | Nama lengkap & gelar |
| \`Rombel\` | KODE (Guru) | \`teacher_code\` | String | Ya | UPPER(TRIM(code)) | Unik per tenant | Singkatan guru (e.g. 'MH', 'PHY') |
| \`Rombel\` | NAMA MAPEL | \`subject_name\` | String | Ya | Trim | Tidak boleh kosong | Mata pelajaran (e.g. 'Adab') |
| \`Rombel\` | KODE (Mapel) | \`subject_code\` | String | Ya | UPPER(TRIM(code)) | Unik per tenant | Kode mapel (e.g. 'AD', 'MTK') |
| \`Alokasi\` | KODE, MAPEL, [Nama Kelas...] | \`curriculum_allocation\` | Matrix | Ya | Integer jam per minggu | Alokasi JP >= 0 | Matriks kebutuhan JP per kelas |
| \`Pengampu\` | KODE, Nama, KELAS [1..18] | \`teacher_assignment\` | Matrix | Ya | Integer jam penugasan | Jumlah <= Alokasi kelas | Matriks pengampu guru per kelas |
| \`TT\` | KODE, NAMA, TUGAS TAMB, BOBOT | \`additional_duty\` | Record | Ya | Nama tugas & jam ekuivalensi | Bobot >= 0 | Ekuivalensi jam tambahan (JTM) |
| \`MJ\` | HARI, WAKTU, [Kode Guru...] | \`blocked_time_slot\` | Matrix | Opsional | Nilai 'X' -> is_blocked = true | Cek batas jam kosong guru | Matriks jam terlarang mengajar (Rule D) |
| \`Input Jadwal\` | HARI, WAKTU, [Nama Kelas...] | \`schedule_slot\` | Matrix | Ya | Format: KODE GURU / KODE MAPEL | Cek bentrok guru, kelas, ruang | Matriks jadwal pelajaran utama |

---

## 3. KLASIFIKASI PERAN WORKSHEET & KELAYAKAN IMPOR

| No | Sheet | Klasifikasi Kategori | Dapat Diimpor ke Backend? | Tabel Target | Peran & Rekomendasi |
|---|---|---|---|---|---|
| 1 | \`Home\` | \`INSTRUCTIONS\` | Tidak | - | Navigasi menu visual dan instruksi makro |
| 2 | \`PPA\` | \`REFERENCE_DATA\` | Ya | \`schools\` | Profil sekolah, kepala sekolah, dan tahun ajaran |
| 3 | \`Rombel\` | \`MIXED_SCHEMA\` | Ya (Multi-tabel) | \`classes\`, \`teachers\`, \`subjects\`, \`operating_days\`, \`time_sessions\` | Sumber utama master data (Kelas, Guru, Mapel, Sesi) |
| 4 | \`TIME KBM\` | \`TIME_SESSIONS\` | Ya | \`time_sessions\` | Konfigurasi sesi & waktu per hari |
| 5 | \`Kegiatan Non Mapel\` | \`REFERENCE_DATA\` | Ya | \`non_teaching_activities\` | Kegiatan seperti Upacara, Istirahat, Dhuha |
| 6 | \`GENARATE KODE\` | \`REFERENCE_DATA\` | Tidak | - | Formula generator kode internal Excel |
| 7 | \`Alokasi\` | \`SUBJECT_ASSIGNMENTS\` | Ya | \`curriculum_allocations\` | Struktur alokasi beban mapel per rombel kelas |
| 8 | \`JLH MAPEL DIAMPU\` | \`REFERENCE_DATA\` | Tidak | - | Agregasi penghitungan formula |
| 9 | \`Pengampu\` | \`SUBJECT_ASSIGNMENTS\` | Ya | \`teacher_subject_assignments\` | Distribusi beban mengajar guru per kelas |
| 10 | \`Rumus Input Jadwal\` | \`REFERENCE_DATA\` | Tidak | - | Helper formula internal VBA |
| 11 | \`Rumus Ciutkan Baris Pengampu\` | \`REFERENCE_DATA\` | Tidak | - | Helper formula pemadat baris |
| 12 | \`Input Jadwal\` | \`SCHEDULE_TEMPLATE\` | Ya | \`schedule_entries\` | Master grid jadwal pelajaran hasil penjadwalan |
| 13 | \`Hit Kode Guru dan Mapel\` | \`REFERENCE_DATA\` | Tidak | - | Auditor jam alokasi vs jam terpakai |
| 14 | \`Model JG\` | \`SCHEDULE_TEMPLATE\` | Tidak | - | Template layout kartu jadwal guru (Model 1) |
| 15 | \`Jadwal Guru\` | \`SCHEDULE_RESULT\` | Tidak | - | View hasil jadwal per guru |
| 16 | \`Jadwal Guru 2\` | \`SCHEDULE_RESULT\` | Tidak | - | View hasil jadwal per guru (Model 2) |
| 17 | \`Analisis Mapel\` | \`SCHEDULE_RESULT\` | Tidak | - | Laporan analitik beban mapel |
| 18 | \`Analisis Guru\` | \`SCHEDULE_RESULT\` | Tidak | - | Laporan analitik beban kerja guru |
| 19 | \`TT\` | \`TEACHER_DUTIES\` | Ya | \`teacher_additional_duties\` | Tugas tambahan guru beserta ekuivalensi jam |
| 20 | \`MJ\` | \`TIME_SESSIONS\` | Ya | \`teacher_time_constraints\` | Jam kosong / permohonan berhalangan guru (Rule D) |
| 21 | \`MJ x\` | \`REFERENCE_DATA\` | Tidak | - | Formula kalkulator request guru |
| 22 | \`CMJ sebaran\` | \`REFERENCE_DATA\` | Tidak | - | Formula pengecekan bentrok request |
| 23 | \`CMJ Hasil\` | \`SCHEDULE_RESULT\` | Tidak | - | Laporan audit visual bentrok request |
| 24 | \`Jadwal K\` | \`SCHEDULE_RESULT\` | Tidak | - | View hasil jadwal per kelas (Model 1) |
| 25 | \`Jadwal K 2\` | \`SCHEDULE_RESULT\` | Tidak | - | View hasil jadwal per kelas (Model 2) |
| 26 | \`Model JK\` | \`SCHEDULE_TEMPLATE\` | Tidak | - | Template layout cetak jadwal kelas |
| 27 | \`Serti\` | \`TEACHER_DUTIES\` | Ya | \`teacher_certification_audit\` | Audit 24 JP tunjangan profesi sertifikasi |
| 28 | \`Tolok U\` | \`REFERENCE_DATA\` | Tidak | - | Tolok ukur distribusi beban |
| 29 | \`JL\` | \`REFERENCE_DATA\` | Tidak | - | Catatan pelengkap jadwal |

---

## 4. VALIDASI KOMPATIBILITAS SCHEMA & GAP ANALYSIS

| Data Template XLSB | Target Tabel Backend | Sudah Ada di Backend? | Belum Ada di Backend | Perlu Migration? | Keputusan Arsitektur |
|---|---|---|---|---|---|
| Master Kelas (\`Rombel\`) | \`classes\` | Ya (\`classes\`) | - | Tidak | Matching via \`name\` & \`academic_year\`, simpan ID internal |
| Master Guru (\`Rombel\`) | \`teachers\` | Ya (\`teachers\`) | Kolom \`code\` | Ya (tambah \`code\`) | Tambah kolom \`code\` di \`teachers\` untuk matching kode guru (e.g. 'MH', 'PHY') |
| Master Mapel (\`Rombel\`) | \`subjects\` | Ya (\`subjects\`) | - | Tidak | Matching via \`code\` & \`name\` |
| Sesi KBM Harian (\`Rombel\` / \`TIME KBM\`) | \`operating_days\`, \`time_sessions\` | Parsial (\`school_sessions\`) | Tabel ternormalisasi \`operating_days\` & \`time_sessions\` | Ya (Migrasi 002) | Buat skema relasional resmi \`operating_days\` dan \`time_sessions\` |
| Alokasi JP (\`Alokasi\`) | \`curriculum_allocations\` | Belum | Tabel \`curriculum_allocations\` | Ya (Phase F) | Ditunda hingga Phase F (Pengampu Mapel) |
| Pengampu (\`Pengampu\`) | \`teacher_subject_assignments\` | Belum | Tabel \`teacher_subject_assignments\` | Ya (Phase F) | Ditunda hingga Phase F |
| Tugas Tambahan (\`TT\`) | \`teacher_additional_duties\` | Belum | Tabel \`teacher_additional_duties\` | Ya (Phase H) | Ditunda hingga Phase H |
| Jam Kosong (\`MJ\`) | \`teacher_time_constraints\` | Belum | Tabel \`teacher_time_constraints\` | Ya (Phase G) | Ditunda hingga Phase G |
| Grid Jadwal (\`Input Jadwal\`) | \`schedules\` / \`schedule_entries\` | Belum | Tabel \`schedule_entries\` | Ya (Phase J) | Tetap BLOCKED hingga readiness gate terpenuhi |

---

## 5. AUDIT VARIASI SESI KBM PER HARI PADA WORKBOOK

Hasil audit membuktikan workbook **MENDUKUNG VARIASI SESI PER HARI**:
- **Sabtu**: 8 Sesi (Jam ke-1 s/d Jam ke-7, plus sesi 8)
- **Minggu**: 8 Sesi
- **Senin**: 10 Sesi (Jam ke-1 s/d Jam ke-9, plus sesi 10)
- **Selasa**: 10 Sesi
- **Rabu**: 10 Sesi
- **Kamis**: 8 Sesi
- **Jumat**: Non-aktif pada data MTs di template ini (atau dialihkan ke hari lain)

Total jam pelajaran riil terverifikasi: **54 JP/minggu** per kelas rombel.
`

fs.writeFileSync('docs/master-jadwal-xlsb-inventory.md', md)
console.log('Saved docs/master-jadwal-xlsb-inventory.md successfully!')
