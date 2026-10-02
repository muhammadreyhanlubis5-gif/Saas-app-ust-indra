<template>
  <div class="animate-fade-in-up p-4 md:p-8 max-w-[1400px] mx-auto w-full">
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
      <button @click="saveData" :disabled="saving" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow-md transition-all flex items-center gap-2">
        <svg v-if="saving" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <span>{{ saving ? 'Menyimpan...' : 'Simpan Jadwal Kosong' }}</span>
        <svg v-if="!saving" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
      </button>
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
            Klik pada kotak untuk menandai jam kosong guru. Kolom sesi (waktu KBM) di sebelah kiri secara otomatis tersinkronisasi dengan pengaturan <b>Sesi & Waktu KBM</b>.
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
              <th v-for="teacher in teachers" :key="teacher.code" class="px-2 py-3 border border-gray-700 font-bold text-center w-12 cursor-pointer hover:bg-gray-800 transition-colors" :title="`${teacher.name} (${teacher.criteria === 'true' ? 'Linier' : 'Tidak Linier'})`">
                <div class="writing-vertical -rotate-180 flex items-center justify-center h-20">
                  {{ teacher.code }}
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
                <td v-for="teacher in teachers" :key="teacher.code" @click="toggleKosong(day, session.label, teacher.code, session.type)" class="px-1 py-1 border border-gray-700 text-center cursor-pointer select-none">
                  <!-- Don't allow marking 'X' on Istirahat, they are already free -->
                  <div v-if="session.type === 'ISTIRAHAT'" class="w-full h-full bg-gray-800/50 flex items-center justify-center">
                    <span class="text-gray-600">-</span>
                  </div>
                  <div v-else class="w-full h-full min-h-[28px] flex items-center justify-center rounded hover:bg-gray-700 transition-colors" :class="isKosong(day, session.label, teacher.code) ? 'bg-red-900/40 text-red-500' : ''">
                    <span v-if="isKosong(day, session.label, teacher.code)" class="font-black text-lg">X</span>
                  </div>
                </td>
                
              </tr>
            </template>
          </tbody>
        </table>
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
        <p class="text-gray-500 mb-8 font-medium leading-relaxed">Permintaan Jam Kosong berhasil diperbarui dan disinkronisasi.</p>
        <button @click="showSuccessModal = false" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1">Selesai</button>
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

const teachers = ref([])

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

const fetchAllData = async () => {
  loading.value = true
  try {
    // 1. Fetch Teachers from Master Data (Daftar Guru)
    const savedTeachers = localStorage.getItem('guruKu_teachers');
    if (savedTeachers) {
      const parsedTeachers = JSON.parse(savedTeachers);
      teachers.value = parsedTeachers.map(t => ({
        code: t.code.toUpperCase(),
        name: t.name,
        subject: t.subject
      })).sort((a, b) => a.code.localeCompare(b.code));
    } else {
      // Fallback
      teachers.value = [
        { code: 'G01', name: 'Guru Belum Terdaftar' }
      ];
    }

    // 2. Fetch Sessions
    const sessionRes = await fetch('/api/v1/school/sessions', {
      headers: { 'X-School-ID': schoolId || '' }
    })
    if (sessionRes.ok) {
      const data = await sessionRes.json()
      
      const dayOrder = { 'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6, 'Minggu': 7 }
      const days = Object.keys(data)
      activeDays.value = days.sort((a, b) => dayOrder[a] - dayOrder[b])
      
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
    
    // 3. Fetch Jam Kosong Data
    const kosRes = await fetch('/api/v1/school/jam-kosong', {
      headers: { 'X-School-ID': schoolId || '' }
    })
    if (kosRes.ok) {
      const data = await kosRes.json()
      if (data) {
        jamKosongData.value = data
      }
    }
  } catch (err) {
    console.error("Gagal sinkronisasi data", err)
  } finally {
    loading.value = false
  }
}

const saveData = async () => {
  try {
    const res = await fetch('/api/v1/school/jam-kosong', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-School-ID': schoolId || ''
      },
      body: JSON.stringify(jamKosongData.value)
    })
    if (res.ok) {
      alert("Jadwal kosong berhasil disimpan!")
    } else {
      alert("Gagal menyimpan jadwal kosong")
    }
  } catch (err) {
    alert("Terjadi kesalahan jaringan saat menyimpan")
  }
}

onMounted(() => {
  fetchAllData()
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




