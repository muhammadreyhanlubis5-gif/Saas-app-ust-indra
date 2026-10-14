<template>
  <div class="animate-fade-in-up p-4 md:p-8 max-w-[1400px] mx-auto w-full">
    <!-- Header modern -->
    <div class="bg-blue-900 rounded-3xl p-6 md:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
      <!-- Background Image Overlay -->
      <div class="absolute inset-0 bg-[url('../assets/banner-bg.png')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-transparent"></div>
      
      <div class="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div class="w-full lg:w-3/5">
          <h1 class="text-2xl md:text-3xl font-black mb-2 flex items-center gap-3 drop-shadow-md">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            Master Data: Mata Pelajaran
          </h1>
          <p class="text-blue-100 max-w-2xl text-sm md:text-base drop-shadow">
            Kelola daftar mata pelajaran yang diajarkan di sekolah. Kode mapel dan nama mapel wajib unik untuk mencegah bentrok jadwal.
          </p>
        </div>
        
        <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <!-- Hidden File Input for Excel -->
          <input 
            type="file" 
            ref="fileInput" 
            accept=".xlsx, .xls" 
            @change="handleFileUpload" 
            class="hidden" 
          />

          <!-- Tombol Download Template Excel -->
          <button 
            @click="downloadTemplate" 
            class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 text-sm"
            title="Unduh format file Excel resmi"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            <span>Unduh Template</span>
          </button>

          <!-- Tombol Upload Excel -->
          <button 
            @click="triggerUpload" 
            :disabled="importing" 
            class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 text-sm border border-blue-400/40"
            title="Unggah template Excel yang telah diisi"
          >
            <svg v-if="importing" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            <span>{{ importing ? 'Membaca Excel...' : 'Upload Excel' }}</span>
          </button>

          <!-- Tombol Manual Tambah Pelajaran -->
          <button 
            @click="showAddModal = true" 
            class="bg-white text-blue-700 hover:bg-gray-50 px-5 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 text-sm"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            <span>Tambah Pelajaran</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-500 font-medium">Memuat data pelajaran...</p>
      </div>

      <div v-else-if="subjects.length === 0" class="text-center py-20 px-4">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
          <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
        </div>
        <h3 class="text-lg font-bold text-gray-800 mb-1">Belum Ada Mata Pelajaran</h3>
        <p class="text-gray-500 mb-6 text-sm max-w-md mx-auto">
          Silakan tambah pelajaran secara manual atau unduh template Excel untuk mengimpor daftar mata pelajaran sekaligus.
        </p>
        <div class="flex flex-wrap justify-center gap-3">
          <button @click="downloadTemplate" class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors text-sm flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Unduh Template Excel
          </button>
          <button @click="triggerUpload" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors text-sm flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            Upload File Excel
          </button>
          <button @click="showAddModal = true" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold transition-colors text-sm">
            + Tambah Manual
          </button>
        </div>
      </div>

      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs tracking-wider">
            <th class="px-6 py-4 font-bold">No</th>
            <th class="px-6 py-4 font-bold">Kode Pelajaran</th>
            <th class="px-6 py-4 font-bold">Nama Mata Pelajaran</th>
            <th class="px-6 py-4 font-bold text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(subject, index) in subjects" :key="subject.id || index" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 text-gray-500">{{ index + 1 }}</td>
            <td class="px-6 py-4">
              <span class="bg-blue-50 text-blue-700 px-3 py-1 rounded font-mono font-bold text-xs">{{ subject.code }}</span>
            </td>
            <td class="px-6 py-4 font-medium text-gray-800">{{ subject.name }}</td>
            <td class="px-6 py-4 text-right">
              <button @click="deleteSubject(index)" class="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Hapus Pelajaran">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Form Modal Tambah Pelajaran Manual -->
    <div v-if="showAddModal" class="fixed inset-0 z-40 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-opacity">
      <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="font-bold text-gray-800 text-lg">Tambah Mata Pelajaran</h3>
          <button @click="showAddModal = false" class="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 rounded-full p-1.5 transition-colors shadow-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form @submit.prevent="saveSubject" class="p-6 space-y-5">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Kode Pelajaran</label>
            <input 
              v-model="form.code" 
              type="text" 
              required 
              placeholder="Contoh: PAI, BING, MAT" 
              class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono transition-shadow"
            >
            <p class="text-xs text-gray-400 mt-1">Kode pelajaran harus unik dan belum pernah dipakai.</p>
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Nama Mata Pelajaran</label>
            <input 
              v-model="form.name" 
              type="text" 
              required 
              placeholder="Contoh: Pendidikan Agama Islam" 
              class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
            >
            <p class="text-xs text-gray-400 mt-1">Nama mata pelajaran tidak boleh sama dengan yang sudah ada.</p>
          </div>
          
          <div class="pt-4 flex gap-3">
            <button type="button" @click="showAddModal = false" class="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold py-3 px-4 rounded-xl transition-colors">
              Batal
            </button>
            <button type="submit" :disabled="saving" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
              <svg v-if="saving" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>{{ saving ? 'Memproses...' : 'Simpan' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-opacity">
      <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative animate-bounce-in text-center border-t-8 border-emerald-500">
        <button @click="showSuccessModal = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <div class="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full mx-auto flex items-center justify-center mb-6 shadow-inner relative">
          <div class="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
          <svg class="w-12 h-12 animate-draw-check" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 class="text-2xl font-black text-gray-800 mb-2">Berhasil!</h2>
        <p class="text-gray-600 mb-8 font-medium leading-relaxed text-sm">{{ successMessage }}</p>
        <button @click="showSuccessModal = false" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1">Selesai</button>
      </div>
    </div>

    <!-- Error Modal (Ditolak karena duplikat / format salah) -->
    <div v-if="showErrorModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-opacity">
      <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative animate-shake text-center border-t-8 border-rose-500">
        <button @click="showErrorModal = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <div class="w-24 h-24 bg-rose-100 text-rose-500 rounded-full mx-auto flex items-center justify-center mb-6 shadow-inner relative">
          <div class="absolute inset-0 bg-rose-400 rounded-full animate-ping opacity-20"></div>
          <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
        </div>
        <h2 class="text-2xl font-black text-gray-800 mb-2">Data Ditolak</h2>
        <p class="text-gray-600 mb-8 font-medium leading-relaxed text-sm">{{ errorMessage }}</p>
        <button @click="showErrorModal = false" class="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1">Tutup & Perbaiki</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as XLSX from 'xlsx'

const loading = ref(true)
const saving = ref(false)
const importing = ref(false)
const showAddModal = ref(false)
const showSuccessModal = ref(false)
const showErrorModal = ref(false)
const successMessage = ref('Mata Pelajaran berhasil ditambahkan ke database.')
const errorMessage = ref('')

const fileInput = ref(null)
const subjects = ref([])
const form = ref({ code: '', name: '' })

onMounted(() => {
  const saved = localStorage.getItem('guruKu_mapel');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Auto-cleanup duplikasi data lama (baik kode mapel maupun nama mapel)
      const seenCodes = new Set();
      const seenNames = new Set();
      const cleanList = [];

      parsed.forEach(item => {
        const c = (item.code || '').trim().toUpperCase();
        const n = (item.name || '').trim().toLowerCase();
        if (c && n && !seenCodes.has(c) && !seenNames.has(n)) {
          seenCodes.add(c);
          seenNames.add(n);
          cleanList.push({
            ...item,
            code: c,
            name: item.name.trim()
          });
        }
      });

      subjects.value = cleanList;
      localStorage.setItem('guruKu_mapel', JSON.stringify(cleanList));
    } catch (e) {
      console.error('Error parsing subjects:', e);
    }
    loading.value = false;
  } else {
    setTimeout(() => {
      subjects.value = [
        { id: 1, code: 'MAT', name: 'Matematika' },
        { id: 2, code: 'BIN', name: 'Bahasa Indonesia' },
        { id: 3, code: 'BING', name: 'Bahasa Inggris' },
        { id: 4, code: 'IPA', name: 'Ilmu Pengetahuan Alam' },
        { id: 5, code: 'IPS', name: 'Ilmu Pengetahuan Sosial' },
        { id: 6, code: 'PPKN', name: 'Pendidikan Pancasila dan Kewarganegaraan' },
        { id: 7, code: 'PAI', name: 'Pendidikan Agama Islam' },
        { id: 8, code: 'PEN', name: 'Penjaskes' }
      ];
      localStorage.setItem('guruKu_mapel', JSON.stringify(subjects.value));
      loading.value = false;
    }, 400);
  }
})

// Sinkronkan ke localStorage agar DaftarGuru, PengampuMapel, dll otomatis membaca
watch(subjects, (newVal) => {
  localStorage.setItem('guruKu_mapel', JSON.stringify(newVal));
}, { deep: true });

// 1. Download Template Excel Resmi Mapel
const downloadTemplate = () => {
  const templateRows = [
    { 'No': 1, 'Kode Pelajaran': 'MAT', 'Nama Mata Pelajaran': 'Matematika' },
    { 'No': 2, 'Kode Pelajaran': 'BIN', 'Nama Mata Pelajaran': 'Bahasa Indonesia' },
    { 'No': 3, 'Kode Pelajaran': 'BING', 'Nama Mata Pelajaran': 'Bahasa Inggris' },
    { 'No': 4, 'Kode Pelajaran': 'IPA', 'Nama Mata Pelajaran': 'Ilmu Pengetahuan Alam' },
    { 'No': 5, 'Kode Pelajaran': 'IPS', 'Nama Mata Pelajaran': 'Ilmu Pengetahuan Sosial' },
    { 'No': 6, 'Kode Pelajaran': 'PEN', 'Nama Mata Pelajaran': 'Penjaskes' },
  ]

  const ws = XLSX.utils.json_to_sheet(templateRows)
  ws['!cols'] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 36 }
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Template Mata Pelajaran')
  XLSX.writeFile(wb, 'Template_Mata_Pelajaran_GuruKu.xlsx')
}

// 2. Trigger Upload Input
const triggerUpload = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

// 3. Handle File Upload & Parse Excel dengan Validasi Duplikasi Ketat
const handleFileUpload = (event) => {
  const file = event.target.files && event.target.files[0]
  if (!file) return

  importing.value = true

  const reader = new FileReader()

  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('File Excel tidak memiliki lembar kerja (worksheet).')
      }

      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' })

      if (!rawRows || rawRows.length === 0) {
        throw new Error('File Excel kosong atau tidak memiliki baris data.')
      }

      const importedList = []
      const duplicateCodes = []
      const duplicateNames = []

      rawRows.forEach((row, idx) => {
        const normalized = {}
        for (const key in row) {
          normalized[key.trim().toLowerCase()] = row[key]
        }

        const code = (
          normalized['kode pelajaran'] ||
          normalized['kode_pelajaran'] ||
          normalized['kode mapel'] ||
          normalized['kode_mapel'] ||
          normalized['kode'] ||
          ''
        ).toString().trim().toUpperCase()

        const name = (
          normalized['nama mata pelajaran'] ||
          normalized['nama_mata_pelajaran'] ||
          normalized['nama mapel'] ||
          normalized['nama_mapel'] ||
          normalized['mata pelajaran'] ||
          normalized['mapel'] ||
          normalized['nama'] ||
          ''
        ).toString().trim()

        if (code && name) {
          importedList.push({
            id: Date.now() + idx,
            code,
            name
          })
        }
      })

      if (importedList.length === 0) {
        throw new Error('Kolom "Kode Pelajaran" dan "Nama Mata Pelajaran" tidak ditemukan. Silakan unduh dan gunakan template resmi.')
      }

      let addedCount = 0

      importedList.forEach(item => {
        // Cek duplikat Kode Mapel terhadap database dan list yang baru dimasukkan
        const existingCode = subjects.value.find(s => s.code.toUpperCase() === item.code)
        // Cek duplikat Nama Mapel terhadap database dan list yang baru dimasukkan
        const existingName = subjects.value.find(s => s.name.toLowerCase() === item.name.toLowerCase())

        if (existingCode) {
          duplicateCodes.push(`${item.code} (${item.name})`)
        } else if (existingName) {
          duplicateNames.push(`${item.name} [Kode: ${item.code}]`)
        } else {
          subjects.value.push(item)
          addedCount++
        }
      })

      if (addedCount === 0) {
        let errDesc = 'Semua data di file Excel ditolak karena sudah terdaftar di sistem!'
        if (duplicateCodes.length > 0) {
          errDesc += ` Kode mapel bentrok: ${duplicateCodes.join(', ')}.`
        }
        if (duplicateNames.length > 0) {
          errDesc += ` Nama mapel bentrok: ${duplicateNames.join(', ')}.`
        }
        throw new Error(errDesc)
      }

      let msg = `Berhasil mengimpor ${addedCount} mata pelajaran baru!`
      const rejectedList = [...duplicateCodes, ...duplicateNames]
      if (rejectedList.length > 0) {
        msg += ` (${rejectedList.length} data ditolak/dilewati karena kode/nama sudah ada).`
      }
      successMessage.value = msg
      showSuccessModal.value = true
    } catch (err) {
      console.error('Error saat parsing file Excel mapel:', err)
      errorMessage.value = err.message || 'Format file Excel tidak dapat dibaca atau tidak sesuai.'
      showErrorModal.value = true
    } finally {
      importing.value = false
      if (fileInput.value) fileInput.value.value = ''
    }
  }

  reader.onerror = () => {
    importing.value = false
    errorMessage.value = 'Gagal membaca file dari penyimpanan lokal komputer Anda.'
    showErrorModal.value = true
    if (fileInput.value) fileInput.value.value = ''
  }

  reader.readAsArrayBuffer(file)
}

// 4. Tambah Mata Pelajaran Manual dengan Validasi Kode & Nama Unik
const saveSubject = () => {
  const code = form.value.code.trim().toUpperCase()
  const name = form.value.name.trim()

  if (!code || !name) return

  // 1. Validasi Kode Mapel Sama -> TOLAK
  const existingByCode = subjects.value.find(s => s.code.trim().toUpperCase() === code)
  if (existingByCode) {
    errorMessage.value = `Kode Pelajaran "${code}" sudah digunakan oleh mata pelajaran "${existingByCode.name}". Sistem menolak kode mapel yang sama. Silakan gunakan kode lain!`
    showErrorModal.value = true
    return
  }

  // 2. Validasi Nama Mapel Sama -> TOLAK
  const existingByName = subjects.value.find(s => s.name.trim().toLowerCase() === name.toLowerCase())
  if (existingByName) {
    errorMessage.value = `Mata Pelajaran "${name}" sudah terdaftar dengan kode "${existingByName.code}". Sistem menolak nama mapel yang sama agar jadwal tidak bentrok!`
    showErrorModal.value = true
    return
  }

  saving.value = true
  setTimeout(() => {
    subjects.value.push({
      id: Date.now(),
      code: code,
      name: name
    })
    
    // Reset state
    form.value.code = ''
    form.value.name = ''
    saving.value = false
    showAddModal.value = false
    
    successMessage.value = `Mata Pelajaran "${name}" (${code}) berhasil ditambahkan ke database.`
    showSuccessModal.value = true
  }, 400)
}

const deleteSubject = (index) => {
  if (confirm('Yakin ingin menghapus mata pelajaran ini?')) {
    subjects.value.splice(index, 1)
  }
}
</script>

<style scoped>
@keyframes bounce-in {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
.animate-bounce-in {
  animation: bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
@keyframes draw-check {
  0% { stroke-dasharray: 50; stroke-dashoffset: 50; }
  100% { stroke-dasharray: 50; stroke-dashoffset: 0; }
}
.animate-draw-check {
  animation: draw-check 0.5s ease-out forwards;
  animation-delay: 0.2s;
  stroke-dasharray: 50;
  stroke-dashoffset: 50;
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}
.animate-shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
</style>
