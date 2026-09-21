<template>
  <div class="max-w-[1600px] mx-auto p-2">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Input & Susun Jadwal</h1>
        <p class="text-gray-500 text-sm">Input jadwal dengan memasukkan Kode Guru (atas) dan Kode Mapel (bawah).</p>
      </div>
      <button @click="saveData" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow-md transition-all flex items-center gap-2">
        <span>Simpan Jadwal</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
      </button>
    </div>

    <!-- Alert Instruksi -->
    <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-bold text-blue-800">KODE GURU & MAPEL (Atau Non-Mapel Seperti Upacara dll)</h3>
          <p class="text-sm text-blue-700 mt-1">
            Kolom baris dan kelas telah ter-sinkronisasi. Anda dapat langsung mengetikkan kode pada kotak yang tersedia.
          </p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
    
    <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-12">
      <div class="overflow-x-auto relative custom-scrollbar max-h-[70vh]">
        <table class="w-full text-sm text-left whitespace-nowrap min-w-max border-collapse">
          <thead class="bg-white text-gray-900 text-xs font-bold sticky top-0 z-20">
            <tr>
              <th class="px-4 py-3 border border-black text-center w-24 sticky left-0 bg-white z-30 tracking-wider">HARI</th>
              <th class="px-4 py-3 border border-black text-center w-32 sticky left-[96px] bg-white z-30 tracking-wider">WAKTU</th>
              <th class="px-2 py-3 border border-black text-center w-12 sticky left-[224px] bg-white z-30">
                <div class="writing-vertical -rotate-180 flex items-center justify-center h-12 tracking-widest">JAM</div>
              </th>
              
              <!-- Kelas Kolom tersinkronisasi -->
              <th v-for="cls in classes" :key="cls" class="px-2 py-3 border border-black text-center min-w-[60px]">
                <div class="writing-vertical -rotate-180 flex items-center justify-center h-24 text-gray-900">
                  {{ cls }}
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="text-gray-900 divide-y divide-black">
            <template v-for="day in activeDays" :key="day">
              <!-- Baris Pemisah Hari -->
              <tr class="bg-gray-200">
                <td :colspan="3 + classes.length" class="h-1 border border-black"></td>
              </tr>
              
              <tr v-for="(session, sIdx) in daySessions[day]" :key="`${day}-${sIdx}`" class="hover:bg-blue-50/20 transition-colors">
                
                <!-- Day Cell (Hanya tampil di baris pertama tiap hari) -->
                <td v-if="sIdx === 0" :rowspan="daySessions[day].length" class="px-4 py-2 border border-black font-black text-center uppercase tracking-wider sticky left-0 bg-white z-10" :class="getDayColor(day)">
                  {{ day }}
                </td>
                
                <!-- Waktu Cell -->
                <td class="px-2 py-2 border border-black text-center font-bold text-gray-800 text-xs sticky left-[96px] bg-white z-10">
                  {{ session.start_time }} - {{ session.end_time }}
                </td>

                <!-- Session/Jam Cell -->
                <td class="px-2 py-2 border border-black text-center font-black sticky left-[224px] bg-white z-10" :class="session.type === 'ISTIRAHAT' ? 'text-gray-900 bg-gray-200' : 'text-gray-900'">
                  {{ session.label }}
                </td>
                
                <!-- Cells untuk Kelas -->
                <td v-for="cls in classes" :key="cls" class="border border-black p-0 text-center align-middle" :class="session.type === 'ISTIRAHAT' ? 'bg-gray-200' : 'bg-white'">
                  
                  <div v-if="session.type === 'ISTIRAHAT'" class="w-full h-full min-h-[48px]">
                    <!-- Blocked -->
                  </div>
                  <div v-else class="flex flex-col h-full min-h-[52px]">
                    <!-- Input Guru (Atas) -->
                    <input 
                      type="text" 
                      v-model="getJadwal(day, session.label, cls).guru"
                      class="w-full flex-1 bg-transparent border-b border-black px-1 py-1 text-center font-bold text-gray-900 focus:outline-none focus:bg-yellow-100 focus:border-blue-600 uppercase text-xs"
                    >
                    <!-- Input Mapel (Bawah) -->
                    <input 
                      type="text" 
                      v-model="getJadwal(day, session.label, cls).mapel"
                      class="w-full flex-1 bg-transparent px-1 py-1 text-center font-bold text-blue-900 focus:outline-none focus:bg-yellow-100 focus:border-blue-600 uppercase text-xs"
                    >
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
const schoolId = localStorage.getItem('school_id')

const activeDays = ref([])
const daySessions = ref({})
const classes = ref([])

// State penyimpanan jadwal
// Format: { "SENIN-1-4 TM": { guru: "", mapel: "" }, ... }
const jadwalData = ref({})

const getDayColor = (day) => {
  const colors = {
    'Senin': 'text-blue-600',
    'Selasa': 'text-indigo-600',
    'Rabu': 'text-cyan-600',
    'Kamis': 'text-teal-600',
    'Jumat': 'text-emerald-600',
    'Sabtu': 'text-gray-800',
    'Minggu': 'text-red-600'
  }
  return colors[day] || 'text-gray-800'
}

// Fungsi bantu agar v-model bisa membaca/membuat object secara reaktif
const getJadwal = (day, sessionLabel, cls) => {
  const key = `${day.toUpperCase()}-${sessionLabel}-${cls}`
  if (!jadwalData.value[key]) {
    jadwalData.value[key] = { guru: '', mapel: '' }
  }
  return jadwalData.value[key]
}

const fetchAllData = async () => {
  loading.value = true
  try {
    // 1. Fetch Classes dari Pengampu Mapel
    const pengampuRes = await fetch('/api/v1/school/pengampu', {
      headers: { 'X-School-ID': schoolId || '' }
    })
    if (pengampuRes.ok) {
      const data = await pengampuRes.json()
      if (data && data.classes) {
        classes.value = data.classes
      }
    }

    // 2. Fetch Sessions dari Sesi KBM
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

    // 3. Fetch Data Jadwal yang sudah tersimpan
    const jadwalRes = await fetch('/api/v1/school/jadwal', {
      headers: { 'X-School-ID': schoolId || '' }
    })
    if (jadwalRes.ok) {
      const data = await jadwalRes.json()
      if (data && Object.keys(data).length > 0) {
        jadwalData.value = data
      }
    }

  } catch (err) {
    console.error("Gagal memuat data", err)
  } finally {
    loading.value = false
  }
}

const saveData = async () => {
  try {
    // Bersihkan key yang kosong sebelum save agar DB tidak penuh
    const cleanData = {}
    for (const key in jadwalData.value) {
      const cell = jadwalData.value[key]
      if (cell.guru || cell.mapel) {
        cleanData[key] = {
          guru: cell.guru.trim().toUpperCase(),
          mapel: cell.mapel.trim().toUpperCase()
        }
      }
    }

    const res = await fetch('/api/v1/school/jadwal', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-School-ID': schoolId || ''
      },
      body: JSON.stringify(cleanData)
    })
    
    if (res.ok) {
      alert("Jadwal KBM berhasil disimpan!")
    } else {
      alert("Gagal menyimpan jadwal")
    }
  } catch (err) {
    alert("Terjadi kesalahan jaringan")
  }
}

onMounted(() => {
  fetchAllData()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { height: 10px; width: 10px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; border: 2px solid #f1f5f9; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }

.writing-vertical {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}
</style>
