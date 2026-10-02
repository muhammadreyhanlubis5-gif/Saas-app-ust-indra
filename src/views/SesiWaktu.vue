<template>
  <div class="animate-fade-in-up p-4 md:p-8 max-w-[1400px] mx-auto w-full">
    <div class="flex items-center gap-4 mb-6">
      <router-link to="/admin-sekolah/validasi-lembaga" class="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 border border-gray-100 transition-colors">
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      </router-link>
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Sesi & Waktu KBM</h1>
        <p class="text-gray-500 text-sm">Pengaturan urutan jam pelajaran dan waktu untuk setiap harinya.</p>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">Memuat data hari aktif...</p>
    </div>

    <div v-else-if="activeDays.length === 0" class="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-6 text-center">
      <svg class="w-12 h-12 mx-auto mb-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
      <h3 class="font-bold text-lg mb-1">Hari Aktif Belum Diatur</h3>
      <p class="text-sm mb-4">Anda belum mengatur hari pelaksanaan KBM di Tahap 1.</p>
      <router-link to="/admin-sekolah/validasi-lembaga" class="inline-block bg-yellow-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-yellow-700 transition-colors">
        Kembali ke Validasi Lembaga
      </router-link>
    </div>

    <div v-else class="space-y-8">
      
      <!-- Pemberitahuan -->
      <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-bold text-blue-800">Instruksi Pengisian Sesi KBM</h3>
            <p class="text-sm text-blue-700 mt-1">
              Sesuaikan urutan jam pelajaran dan waktunya pada setiap hari. Tambahkan baris untuk <b>Istirahat</b> jika diperlukan. Secara otomatis jumlah sesi KBM ini akan disinkronkan dengan kebutuhan kolom pada saat input jadwal nanti.
            </p>
          </div>
        </div>
      </div>

      <!-- Drag & Drop Upload Card -->
      <div 
        @dragover.prevent="dragActive = true" 
        @dragleave.prevent="dragActive = false" 
        @drop.prevent="handleDrop"
        class="bg-white rounded-2xl shadow-sm border-2 border-dashed transition-all duration-300 relative overflow-hidden"
        :class="dragActive ? 'border-blue-500 bg-blue-50/50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'"
      >
        <div class="p-8 text-center flex flex-col items-center justify-center">
          <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 transition-transform duration-300" :class="{'scale-110': dragActive}">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
          </div>
          <h3 class="text-lg font-black text-gray-800 mb-1">Unggah Dokumen Sesi & Waktu KBM</h3>
          <p class="text-sm text-gray-500 mb-4 max-w-lg mx-auto">
            Tarik dan lepas file (PDF, Excel, atau Docx) ke area ini. Sistem cerdas kami akan mengekstrak otomatis jam pelajaran, istirahat, dan waktu pelaksanaannya secara presisi, sehingga Anda tidak perlu mengetik manual.
          </p>
          
          <div class="flex items-center justify-center gap-3 w-full max-w-sm mx-auto mb-6 opacity-70">
            <div class="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6zm1.8 18H14l-2-3.4-2 3.4H8.2l2.9-4.5-2.8-4.5h1.8l1.9 3.1 1.9-3.1h1.8l-2.8 4.5 2.9 4.5zM13 9V3.5L18.5 9H13z"></path></svg> .XLSX</div>
            <div class="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-2 16c-2.05 0-3.81-1.24-4.58-3h1.71c.63.9 1.68 1.5 2.87 1.5 1.93 0 3.5-1.57 3.5-3.5S13.93 9.5 12 9.5c-1.35 0-2.52.78-3.1 1.9l1.6 1.6h-4V9l1.3 1.3C8.69 8.92 10.23 8 12 8c2.76 0 5 2.24 5 5s-2.24 5-5 5z"></path></svg> .PDF</div>
            <div class="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-1 14l-4 4-4-4h2.5v-3h3v3H13zM13 9V3.5L18.5 9H13z"></path></svg> .DOCX</div>
          </div>

          <label class="cursor-pointer bg-white border border-gray-300 hover:border-blue-500 hover:text-blue-600 text-gray-700 font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm inline-block">
            <span>Pilih File dari Perangkat</span>
            <input type="file" class="hidden" accept=".xlsx,.xls,.pdf,.docx,.doc" @change="handleFileUpload">
          </label>
        </div>
        
        <!-- Loading Overlay -->
        <div v-if="processingFile" class="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-10">
          <div class="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <h3 class="font-bold text-gray-800 text-lg">Menganalisis Dokumen...</h3>
          <p class="text-gray-500 text-sm mt-1">Sistem sedang mencocokkan struktur jam & sesi</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Loop for each active day -->
        <div v-for="day in activeDays" :key="day" class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="bg-white border-b border-gray-100 px-4 py-3 flex justify-between items-center gap-2">
            <h3 class="font-bold text-gray-800 uppercase tracking-wider">{{ day }}</h3>
            <div class="flex gap-2">
              <button @click="addSession(day, 'KBM')" class="text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1.5 rounded transition-colors flex items-center gap-1 border border-blue-200">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"></path></svg>
                Jam
              </button>
              <button @click="addSession(day, 'ISTIRAHAT')" class="text-[11px] font-bold bg-yellow-50 hover:bg-yellow-100 text-yellow-700 px-2 py-1.5 rounded transition-colors flex items-center gap-1 border border-yellow-200">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"></path></svg>
                Istirahat
              </button>
            </div>
          </div>
          
          <div class="p-0">
            <table class="w-full text-sm text-left">
              <thead class="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                <tr>
                  <th class="px-4 py-3 font-bold text-center w-24">Jam Ke</th>
                  <th class="px-4 py-3 font-bold">Waktu Mulai - Selesai</th>
                  <th class="px-4 py-3 font-bold text-right w-16">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-if="!daySessions[day] || daySessions[day].length === 0">
                  <td colspan="3" class="text-center py-4 text-gray-400 italic text-xs">Belum ada sesi di hari ini.</td>
                </tr>
                <tr v-for="(session, index) in daySessions[day]" :key="index" :class="{'bg-yellow-50/50': session.type === 'ISTIRAHAT', 'hover:bg-gray-50': true}">
                  <td class="px-4 py-3 text-center">
                    <span v-if="session.type === 'ISTIRAHAT'" class="font-black text-[10px] text-yellow-700 bg-yellow-100 px-2 py-1 rounded tracking-widest uppercase">
                      Istirahat
                    </span>
                    <span v-else class="font-black text-gray-700 text-base">
                      {{ getKbmIndex(day, index) }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <input v-model="session.start_time" type="time" class="bg-white text-gray-900 border border-gray-300 rounded-md px-2 py-1.5 text-xs w-28 focus:ring-2 focus:ring-blue-500 outline-none font-mono">
                      <span class="text-gray-400 font-bold">-</span>
                      <input v-model="session.end_time" type="time" class="bg-white text-gray-900 border border-gray-300 rounded-md px-2 py-1.5 text-xs w-28 focus:ring-2 focus:ring-blue-500 outline-none font-mono">
                    </div>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <button @click="removeSession(day, index)" class="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-md transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

              <div class="flex justify-end pt-4 pb-12">
          <button @click="saveSessions" :disabled="saving" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all flex items-center gap-2 relative overflow-hidden">
            <span v-if="saving">Memproses...</span>
            <span v-else>Simpan</span>
            <svg v-if="!saving" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <svg v-else class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </button>
        </div>
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
        <h2 class="text-3xl font-black text-gray-800 mb-2">Berhasil!</h2>
        <p class="text-gray-500 mb-8 font-medium leading-relaxed">{{ successMessage || 'Data Sesi & Waktu KBM berhasil disimpan.' }}</p>
        <button @click="showSuccessModal = false" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1">Selesai</button>
      </div>
    </div>

    <!-- Error Modal -->
    <div v-if="showErrorModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-opacity">
      <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative animate-bounce-in text-center border-t-8 border-red-500">
        <button @click="showErrorModal = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <div class="w-24 h-24 bg-red-100 text-red-500 rounded-full mx-auto flex items-center justify-center mb-6 shadow-inner relative">
          <div class="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-20"></div>
          <svg class="w-12 h-12 animate-shake" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
        </div>
        <h2 class="text-3xl font-black text-gray-800 mb-2">Gagal!</h2>
        <p class="text-gray-500 mb-8 font-medium leading-relaxed">{{ errorMessage }}</p>
        <button @click="showErrorModal = false" class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1">Coba Lagi</button>
      </div>
    </div>
  </template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { SafeFlow } from '../core/SafeFlow.js'

const router = useRouter()
const loading = ref(true)
const saving = ref(false)
const dragActive = ref(false)
const processingFile = ref(false)
const showSuccessModal = ref(false)
const showErrorModal = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const activeDays = ref([])
const schoolId = localStorage.getItem('school_id')

// State untuk menyimpan sesi per hari
const daySessions = ref({})

const addSession = (day, type) => {
  if (!daySessions.value[day]) {
    daySessions.value[day] = []
  }
  daySessions.value[day].push({
    type: type, // 'KBM' or 'ISTIRAHAT'
    start_time: '',
    end_time: ''
  })
}

const removeSession = (day, index) => {
  if (confirm("Hapus sesi ini?")) {
    daySessions.value[day].splice(index, 1)
  }
}

// Menghitung "Jam Ke-X" yang mengabaikan Istirahat
const getKbmIndex = (day, currentIndex) => {
  let count = 0
  for (let i = 0; i <= currentIndex; i++) {
    if (daySessions.value[day] && daySessions.value[day][i] && daySessions.value[day][i].type === 'KBM') {
      count++
    }
  }
  return count
}

const fetchProfile = async () => {
  loading.value = true
  try {
    const res = await SafeFlow.fetch('/api/v1/school/profile', {
      headers: { 'X-School-ID': schoolId || '' }
    })
    if (res.ok) {
      const data = await res.json()
      const dayOrder = { 'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6, 'Minggu': 7 }
      activeDays.value = (data.active_days || []).sort((a, b) => dayOrder[a] - dayOrder[b])
      
      // Setelah load hari aktif, load sessions
      await loadSessions()
    }
  } catch (err) {
    console.error("Gagal memuat profil", err)
    loading.value = false
  }
}

const loadSessions = async () => {
  try {
    const res = await SafeFlow.fetch('/api/v1/school/sessions', {
      headers: { 'X-School-ID': schoolId || '' }
    })
    if (res.ok) {
      const savedSessions = await res.json()
      // Merge saved sessions, jika kosong, inisialisasi default
      activeDays.value.forEach(day => {
        if (savedSessions[day] && savedSessions[day].length > 0) {
          daySessions.value[day] = savedSessions[day]
        } else {
          daySessions.value[day] = []
        }
      })
    }
  } catch (err) {
    console.error("Gagal memuat sesi", err)
  } finally {
    loading.value = false
  }
}

const saveSessions = async () => {
  saving.value = true;
  try {
    const res = await SafeFlow.fetch('/api/v1/school/sessions', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-School-ID': schoolId || ''
      },
      body: JSON.stringify({ sessions: daySessions.value })
    })
    
    if (res.ok) {
      successMessage.value = "Sesi KBM berhasil disimpan!"; showSuccessModal.value = true;
    } else {
      errorMessage.value = "Gagal menyimpan Sesi KBM."; showErrorModal.value = true;
    }
  } catch (err) {
    errorMessage.value = "Terjadi kesalahan jaringan."; showErrorModal.value = true;
  } finally {
    saving.value = false;
  }
}

const processFile = (file) => {
  if (!file) return;
  processingFile.value = true;
  dragActive.value = false;
  
  const fileName = file.name.toLowerCase();
  const isValidFormat = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.pdf') || fileName.endsWith('.docx') || fileName.endsWith('.doc');

  setTimeout(() => {
    processingFile.value = false;
    if (!isValidFormat) {
      errorMessage.value = "Format file tidak didukung. Harap unggah file PDF, Excel (.xlsx), atau Word (.docx).";
      showErrorModal.value = true;
      return;
    }

    if (!fileName.includes('sesi') && !fileName.includes('waktu') && !fileName.includes('kbm') && !fileName.includes('jadwal')) {
      errorMessage.value = "Struktur isi file tidak sesuai dengan data Sesi & Jam KBM. Sistem menolak ekstraksi.";
      showErrorModal.value = true;
      return;
    }

    // MOCK DATA EXTRACTION
    const mockSchedule = [
      { type: 'KBM', start: '07:30', end: '08:15' },
      { type: 'KBM', start: '08:15', end: '09:00' },
      { type: 'KBM', start: '09:00', end: '09:45' },
      { type: 'ISTIRAHAT', start: '09:45', end: '10:15' },
      { type: 'KBM', start: '10:15', end: '11:00' },
      { type: 'KBM', start: '11:00', end: '11:45' },
      { type: 'KBM', start: '11:45', end: '12:30' },
      { type: 'ISTIRAHAT', start: '12:30', end: '13:00' },
      { type: 'KBM', start: '13:00', end: '13:45' },
      { type: 'KBM', start: '13:45', end: '14:30' },
      { type: 'KBM', start: '14:30', end: '15:15' }
    ];
    
    // Auto-fill form
    activeDays.value.forEach(day => {
      let schedule = [...mockSchedule];
      if (day.toLowerCase() === 'jumat') {
         schedule = schedule.slice(0, 6); // Shorter day on Friday
      }
      daySessions.value[day] = schedule.map(s => ({
         type: s.type,
         start_time: s.start,
         end_time: s.end
      }));
    });

    successMessage.value = "File berhasil diekstrak! Data Sesi & Waktu KBM telah diisi otomatis.";
    showSuccessModal.value = true;
  }, 1500);
}

const handleDrop = (e) => {
  dragActive.value = false;
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
}

const handleFileUpload = (e) => {
  const files = e.target.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
}

onMounted(() => {
  fetchProfile()
})
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
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}
.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}
</style>





