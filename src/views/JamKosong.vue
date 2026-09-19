<template>
  <div class="max-w-full mx-auto">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <router-link to="/admin-sekolah/pengampu" class="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 border border-gray-100 transition-colors">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </router-link>
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Permintaan Jam Kosong</h1>
          <p class="text-gray-500 text-sm">Berikan tanda silang (X) pada jam dimana guru tidak dapat mengajar.</p>
        </div>
      </div>
      <div>
        <button class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-sm transition-colors flex items-center gap-2">
          <span>Simpan Jadwal Kosong</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        </button>
      </div>
    </div>

    <!-- Alert Instruksi -->
    <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-bold text-yellow-800">Catatan Sistem</h3>
          <p class="text-sm text-yellow-700 mt-1">
            Klik pada kotak untuk menandai jam kosong guru. Kolom sesi (waktu KBM) di sebelah kiri secara otomatis tersinkronisasi dengan pengaturan <b>Tahap 2: Sesi & Waktu KBM</b>.
          </p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500 font-medium">Memuat dan menyinkronkan data Sesi KBM...</p>
    </div>

    <div v-else class="bg-gray-900 rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-800">
      <div class="overflow-x-auto custom-scrollbar">
        <table class="w-full text-sm text-left border-collapse">
          <thead class="bg-black text-gray-300 text-xs uppercase sticky top-0 z-20">
            <tr>
              <th class="px-4 py-3 border border-gray-700 font-bold text-center w-24 sticky left-0 bg-black z-30">Hari</th>
              <th class="px-4 py-3 border border-gray-700 font-bold text-center w-24 sticky left-[96px] bg-black z-30">Jam/Sesi</th>
              
              <!-- Teacher Columns -->
              <th v-for="teacher in teachers" :key="teacher" class="px-2 py-3 border border-gray-700 font-bold text-center w-12 cursor-pointer hover:bg-gray-800 transition-colors" title="Kode Guru">
                <div class="writing-vertical -rotate-180 flex items-center justify-center h-20">
                  {{ teacher }}
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="text-gray-300 divide-y divide-gray-800">
            <template v-for="day in activeDays" :key="day">
              <tr v-for="(session, sIdx) in daySessions[day]" :key="`${day}-${sIdx}`" class="hover:bg-gray-800 transition-colors">
                
                <!-- Day Cell (Only on first session of the day) -->
                <td v-if="sIdx === 0" :rowspan="daySessions[day].length" class="px-4 py-2 border border-gray-700 font-black text-center uppercase tracking-wider sticky left-0 bg-gray-900 z-10" :class="getDayColor(day)">
                  {{ day }}
                </td>
                
                <!-- Session/Jam Cell -->
                <td class="px-4 py-2 border border-gray-700 text-center font-bold sticky left-[96px] bg-gray-900 z-10" :class="session.type === 'ISTIRAHAT' ? 'text-yellow-400' : 'text-gray-100'">
                  {{ session.label }}
                </td>
                
                <!-- Teacher Checkboxes (Cells) -->
                <td v-for="teacher in teachers" :key="teacher" @click="toggleKosong(day, session.label, teacher, session.type)" class="px-1 py-1 border border-gray-700 text-center cursor-pointer select-none">
                  <!-- Don't allow marking 'X' on Istirahat, they are already free -->
                  <div v-if="session.type === 'ISTIRAHAT'" class="w-full h-full bg-gray-800/50 flex items-center justify-center">
                    <span class="text-gray-600">-</span>
                  </div>
                  <div v-else class="w-full h-full min-h-[28px] flex items-center justify-center rounded hover:bg-gray-700 transition-colors" :class="isKosong(day, session.label, teacher) ? 'bg-red-900/40 text-red-500' : ''">
                    <span v-if="isKosong(day, session.label, teacher)" class="font-black text-lg">X</span>
                  </div>
                </td>
                
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const loading = ref(true)
const activeDays = ref([])
const daySessions = ref({})
const schoolId = localStorage.getItem('school_id')

// Dummy teachers mapped from Excel image headers
const teachers = ref([
  'MH', 'PHY', 'IS', 'MF', 'AGR', 'AUL', 'AR', 'AM', 'FA', 'DF', 'MM', 'RAP', 'KK', 'RS', 'SHA', 
  'SA', 'MUF', 'IB', 'SD', 'SB', 'FEB', 'PIS', 'DAF', 'AKB', 'FW', 'SU', 'FH', 'SUA', 'BUD', 'SUS', 'YUL', 'SAF', 'NN', 'WA', 'HOT', 'AF', 'FI'
])

// Menyimpan data jam kosong: { 'Senin-1-MH': true, 'Senin-2-IS': true }
const jamKosongData = ref({})

const isKosong = (day, sessionLabel, teacher) => {
  return !!jamKosongData.value[`${day}-${sessionLabel}-${teacher}`]
}

const toggleKosong = (day, sessionLabel, teacher, type) => {
  if (type === 'ISTIRAHAT') return // Istirahat is always free
  const key = `${day}-${sessionLabel}-${teacher}`
  if (jamKosongData.value[key]) {
    delete jamKosongData.value[key]
  } else {
    jamKosongData.value[key] = true
  }
}

const getDayColor = (day) => {
  const colors = {
    'Senin': 'text-cyan-400',
    'Selasa': 'text-cyan-400',
    'Rabu': 'text-cyan-400',
    'Kamis': 'text-cyan-400',
    'Jumat': 'text-emerald-400',
    'Sabtu': 'text-gray-100',
    'Minggu': 'text-cyan-400'
  }
  return colors[day] || 'text-white'
}

const fetchSessions = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/v1/school/sessions', {
      headers: { 'X-School-ID': schoolId || '' }
    })
    if (res.ok) {
      const data = await res.json()
      
      const dayOrder = { 'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6, 'Minggu': 7 }
      // Get active days from the keys of the sessions returned
      const days = Object.keys(data)
      activeDays.value = days.sort((a, b) => dayOrder[a] - dayOrder[b])
      
      // Process sessions to add proper labels
      activeDays.value.forEach(day => {
        let kbmCount = 0
        daySessions.value[day] = data[day].map(s => {
          if (s.type === 'KBM') {
            kbmCount++
            return { ...s, label: kbmCount.toString() }
          } else {
            return { ...s, label: 'ISTIRAHAT' }
          }
        })
      })
    }
  } catch (err) {
    console.error("Gagal sinkronisasi sesi KBM", err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSessions()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 10px;
  width: 10px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #111827; /* gray-900 */
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #374151; /* gray-700 */
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #4b5563; /* gray-600 */
}
.writing-vertical {
  writing-mode: vertical-rl;
}
</style>
