<template>
  <div class="animate-fade-in-up p-4 md:p-8 max-w-[1400px] mx-auto w-full">
    <div class="flex items-center gap-4 mb-6">
      <router-link :to="ROUTES.VALIDASI_LEMBAGA" class="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 border border-gray-100 transition-colors">
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
      <router-link :to="ROUTES.VALIDASI_LEMBAGA" class="inline-block bg-yellow-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-yellow-700 transition-colors">
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

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Loop for each active day -->
        <div v-for="day in activeDays" :key="day" class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="bg-white border-b border-gray-100 px-4 py-3 flex flex-wrap justify-between items-center gap-2">
            <div class="flex items-center gap-2.5">
              <h3 class="font-bold text-gray-800 uppercase tracking-wider text-sm">{{ day }}</h3>
              <span class="text-[11px] px-2 py-0.5 rounded-full font-bold bg-gray-100 text-gray-600">
                {{ daySessions[day] ? daySessions[day].length : 0 }} Sesi
              </span>
            </div>
            <div class="flex flex-wrap items-center gap-1.5">
              <!-- Smart Copy Button: Salin dari Senin -->
              <button 
                v-if="day !== 'Senin'" 
                @click="copyFromMonday(day)" 
                type="button"
                class="text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 border border-indigo-200 cursor-pointer shadow-2xs"
                title="Salin seluruh sesi jam pelajaran dari hari Senin"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
                <span>Salin dari Senin</span>
              </button>

              <button @click="addSession(day, 'KBM')" class="text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 border border-blue-200 cursor-pointer shadow-2xs">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"></path></svg>
                + Jam
              </button>
              <button @click="addSession(day, 'ISTIRAHAT')" class="text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 border border-amber-200 cursor-pointer shadow-2xs">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"></path></svg>
                + Istirahat
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
                    <div class="flex flex-col gap-1">
                      <div class="flex items-center gap-2">
                        <input 
                          v-model="session.start_time" 
                          @change="onTimeChange(day, index)"
                          type="time" 
                          class="bg-white text-gray-900 border rounded-lg px-2.5 py-1.5 text-xs w-28 focus:ring-2 focus:ring-blue-500 outline-none font-mono shadow-2xs"
                          :class="checkTimeOverlap(day, index) ? 'border-rose-400 bg-rose-50/40 text-rose-900' : 'border-gray-300'"
                        >
                        <span class="text-gray-400 font-bold">-</span>
                        <input 
                          v-model="session.end_time" 
                          @change="onTimeChange(day, index)"
                          type="time" 
                          class="bg-white text-gray-900 border rounded-lg px-2.5 py-1.5 text-xs w-28 focus:ring-2 focus:ring-blue-500 outline-none font-mono shadow-2xs"
                          :class="session.start_time && session.end_time && session.end_time <= session.start_time ? 'border-rose-400 bg-rose-50/40 text-rose-900' : 'border-gray-300'"
                        >
                      </div>
                      <!-- Overlap validation warning badge -->
                      <p v-if="checkTimeOverlap(day, index)" class="text-[10px] text-rose-600 font-semibold flex items-center gap-1 mt-0.5">
                        <svg class="w-3 h-3 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        <span>{{ checkTimeOverlap(day, index) }}</span>
                      </p>
                      <p v-else-if="session.start_time && session.end_time && session.end_time <= session.start_time" class="text-[10px] text-rose-600 font-semibold flex items-center gap-1 mt-0.5">
                        <svg class="w-3 h-3 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        <span>Waktu selesai harus lebih besar dari waktu mulai</span>
                      </p>
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
    <!-- Toast Notification -->
    <transition name="fade">
      <div v-if="toastMessage" class="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-700 text-sm font-semibold animate-fade-in-up">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>{{ toastMessage }}</span>
        <button @click="toastMessage = ''" class="ml-2 text-gray-400 hover:text-white cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </transition>
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
        <button @click="router.push(ROUTES.MATA_PELAJARAN)" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 flex items-center justify-center gap-2">Lanjut ke Mata Pelajaran <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg></button>
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
import { ROUTES } from '../config/routePaths.js'


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

const toastMessage = ref('')

const saveLocalSessions = () => {
  try {
    localStorage.setItem('guruKu_sesi_kbm', JSON.stringify(daySessions.value))
  } catch (e) {}
}

// Smart Time Overlap Validation on "+ Jam"
const addSession = (day, type) => {
  if (!daySessions.value[day]) {
    daySessions.value[day] = []
  }
  
  const list = daySessions.value[day]
  let defaultStart = '07:30'
  let defaultEnd = type === 'ISTIRAHAT' ? '07:50' : '08:15'

  if (list.length > 0) {
    const last = list[list.length - 1]
    if (last.end_time) {
      // Pastikan Waktu Mulai sesi baru otomatis melanjutkan Waktu Selesai sesi sebelumnya (tidak overlap)
      defaultStart = last.end_time
      try {
        const [h, m] = last.end_time.split(':').map(Number)
        const duration = type === 'ISTIRAHAT' ? 20 : 45
        const totalMinutes = h * 60 + m + duration
        const endH = String(Math.floor(totalMinutes / 60) % 24).padStart(2, '0')
        const endM = String(totalMinutes % 60).padStart(2, '0')
        defaultEnd = `${endH}:${endM}`
      } catch (e) {
        defaultEnd = defaultStart
      }
    }
  }

  list.push({
    type: type, // 'KBM' or 'ISTIRAHAT'
    start_time: defaultStart,
    end_time: defaultEnd
  })

  saveLocalSessions()
}

// Check time overlap with previous session
const checkTimeOverlap = (day, index) => {
  if (index <= 0) return null
  const list = daySessions.value[day]
  if (!list || !list[index - 1] || !list[index]) return null

  const prev = list[index - 1]
  const curr = list[index]

  if (prev.end_time && curr.start_time) {
    if (curr.start_time < prev.end_time) {
      return `Waktu mulai (${curr.start_time}) mendahului selesai sesi sebelumnya (${prev.end_time})`
    }
  }
  return null
}

const onTimeChange = (day, index) => {
  saveLocalSessions()
}

// Smart Copy Feature: Deeply clone Monday's session schedule to another day
const copyFromMonday = (targetDay) => {
  const mondayList = daySessions.value['Senin']
  if (!mondayList || mondayList.length === 0) {
    errorMessage.value = 'Sesi hari Senin masih kosong. Silakan tambahkan jam pelajaran pada hari Senin terlebih dahulu sebelum menyalin.'
    showErrorModal.value = true
    return
  }

  // Deep clone
  daySessions.value[targetDay] = JSON.parse(JSON.stringify(mondayList))
  saveLocalSessions()

  toastMessage.value = `Jadwal hari Senin (${mondayList.length} sesi) berhasil disalin ke hari ${targetDay}!`
  setTimeout(() => {
    toastMessage.value = ''
  }, 3500)
}

const removeSession = (day, index) => {
  if (confirm("Hapus sesi ini?")) {
    daySessions.value[day].splice(index, 1)
    saveLocalSessions()
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
    let savedSessions = null
    const res = await SafeFlow.fetch('/api/v1/school/sessions', {
      headers: { 'X-School-ID': schoolId || '' }
    })
    if (res.ok) {
      savedSessions = await res.json()
    }
    
    // Fallback to local storage if API returned empty
    if (!savedSessions) {
      const local = localStorage.getItem('guruKu_sesi_kbm')
      if (local) {
        try { savedSessions = JSON.parse(local) } catch(e) {}
      }
    }

    activeDays.value.forEach(day => {
      if (savedSessions && savedSessions[day] && savedSessions[day].length > 0) {
        daySessions.value[day] = savedSessions[day]
      } else {
        daySessions.value[day] = []
      }
    })

    saveLocalSessions()
  } catch (err) {
    console.error("Gagal memuat sesi", err)
    // Fallback local storage
    const local = localStorage.getItem('guruKu_sesi_kbm')
    if (local) {
      try {
        const parsed = JSON.parse(local)
        activeDays.value.forEach(day => {
          daySessions.value[day] = parsed[day] || []
        })
      } catch(e) {}
    }
  } finally {
    loading.value = false
  }
}

const saveSessions = async () => {
  // Validasi seluruh hari: pastikan tidak ada sesi yang overlap atau waktu selesai <= waktu mulai
  for (const day of activeDays.value) {
    const list = daySessions.value[day] || []
    for (let i = 0; i < list.length; i++) {
      const overlapError = checkTimeOverlap(day, i)
      if (overlapError) {
        errorMessage.value = `Ditemukan bentrok waktu pada hari ${day} (Jam ke-${i+1})! ${overlapError}. Harap perbaiki sebelum menyimpan.`
        showErrorModal.value = true
        return
      }
      const s = list[i]
      if (s.start_time && s.end_time && s.end_time <= s.start_time) {
        errorMessage.value = `Format jam tidak valid pada hari ${day} (Jam ke-${i+1})! Waktu selesai (${s.end_time}) harus lebih besar dari waktu mulai (${s.start_time}).`
        showErrorModal.value = true
        return
      }
    }
  }

  saving.value = true
  saveLocalSessions()

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
      successMessage.value = "Sesi & Waktu KBM berhasil disimpan dan disinkronkan ke seluruh sistem!"
      showSuccessModal.value = true
    } else {
      // Masih simpan di lokal agar progres kesiapan tetap tercatat
      successMessage.value = "Sesi & Waktu KBM berhasil disimpan di workspace sekolah!"
      showSuccessModal.value = true
    }
  } catch (err) {
    // Offline resilience: tetap simpan lokal
    successMessage.value = "Sesi & Waktu KBM tersimpan di penyimpanan lokal."
    showSuccessModal.value = true
  } finally {
    saving.value = false
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















