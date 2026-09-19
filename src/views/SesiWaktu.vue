<template>
  <div class="max-w-6xl mx-auto">
    <div class="flex items-center gap-4 mb-8">
      <router-link to="/admin-sekolah/validasi-lembaga" class="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 border border-gray-100 transition-colors">
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      </router-link>
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Tahap 2: Sesi & Waktu KBM</h1>
        <p class="text-gray-500 text-sm">Atur jam pelajaran dan waktu istirahat untuk setiap hari aktif KBM.</p>
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

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Loop for each active day -->
        <div v-for="day in activeDays" :key="day" class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="bg-gray-800 px-4 py-3 flex justify-between items-center gap-2">
            <h3 class="font-bold text-white uppercase tracking-wider">{{ day }}</h3>
            <div class="flex gap-2">
              <button @click="addSession(day, 'KBM')" class="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"></path></svg>
                Jam
              </button>
              <button @click="addSession(day, 'ISTIRAHAT')" class="text-xs font-bold bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1.5 rounded transition-colors flex items-center gap-1">
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
                      <input v-model="session.start" type="time" class="bg-white text-gray-900 border border-gray-300 rounded-md px-2 py-1.5 text-xs w-28 focus:ring-2 focus:ring-blue-500 outline-none font-mono">
                      <span class="text-gray-400 font-bold">-</span>
                      <input v-model="session.end" type="time" class="bg-white text-gray-900 border border-gray-300 rounded-md px-2 py-1.5 text-xs w-28 focus:ring-2 focus:ring-blue-500 outline-none font-mono">
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
        <button @click="saveSessions" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all flex items-center gap-2">
          <span>Simpan & Lanjut (Tahap 3)</span>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const loading = ref(true)
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
    start: '',
    end: ''
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
    const res = await fetch('/api/v1/school/profile', {
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
    const res = await fetch('/api/v1/school/sessions', {
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
  try {
    const res = await fetch('/api/v1/school/sessions', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-School-ID': schoolId || ''
      },
      body: JSON.stringify({ sessions: daySessions.value })
    })
    
    if (res.ok) {
      alert("Sesi KBM berhasil disimpan!")
      // Lanjut ke tahap 3: Alokasi Jam & Kelas
      // Nanti akan redirect ke '/admin-sekolah/alokasi-jam'
    } else {
      alert("Gagal menyimpan Sesi KBM")
    }
  } catch (err) {
    alert("Terjadi kesalahan jaringan")
  }
}

onMounted(() => {
  fetchProfile()
})
</script>
