<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden font-sans">
    
    <!-- Sidebar: Daftar Kelas -->
    <aside class="w-80 bg-white border-r border-gray-100 flex flex-col h-full shadow-sm z-20 flex-shrink-0">
      <div class="p-5 border-b border-gray-100 bg-white">
        <h2 class="text-xl font-black text-gray-900 tracking-tight">Jadwal Kelas</h2>
        <p class="text-xs text-gray-500 mt-1 font-medium">Pilih kelas untuk mencetak jadwal ruangannya.</p>
        
        <div class="mt-4 relative">
          <svg class="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input v-model="searchQuery" type="text" class="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Cari kelas...">
        </div>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        <div v-if="filteredClasses.length === 0" class="text-center py-10 text-gray-400 text-sm italic">
          Kelas tidak ditemukan.
        </div>
        <button v-for="cls in filteredClasses" :key="cls" 
          @click="selectedClass = cls"
          class="w-full text-left p-3 rounded-xl transition-all border flex items-center gap-3"
          :class="[selectedClass === cls ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-100 hover:border-blue-100 hover:bg-gray-50']">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center font-black flex-shrink-0"
            :class="[selectedClass === cls ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700']">
            {{ cls.substring(0,2).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-gray-900 text-sm truncate" :class="[selectedClass === cls ? 'text-blue-900' : '']">Kelas {{ cls }}</h3>
          </div>
        </button>
      </div>
    </aside>

    <!-- Main Content: Lembar Jadwal -->
    <main class="flex-1 flex flex-col relative overflow-hidden bg-gray-100">
      
      <div v-if="!selectedClass" class="flex-1 flex flex-col items-center justify-center text-gray-400">
        <svg class="w-20 h-20 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
        <h2 class="text-xl font-bold text-gray-500">Pilih Kelas</h2>
        <p class="text-sm mt-1">Pilih kelas dari daftar di samping untuk melihat jadwal.</p>
      </div>

      <div v-else class="flex-1 overflow-y-auto flex flex-col p-6">
        
        <!-- Header Actions -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-black text-gray-800">Pratinjau Cetak Kelas</h2>
          <button @click="printSchedule" class="bg-gray-900 hover:bg-black text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            <span>Cetak Jadwal (PDF)</span>
          </button>
        </div>

        <!-- Printable Area (A4 Landscape Simulation) -->
        <div class="flex-1 flex justify-center pb-20">
          <div id="printableArea" class="bg-black text-white p-10 shadow-2xl overflow-hidden font-sans border-4 border-gray-800 rounded-lg relative print-container" style="width: 297mm; min-height: 210mm;">
            
            <div class="flex justify-between items-center mb-8 text-sm font-bold tracking-wide">
              <div class="flex items-center">
                <span class="w-24 text-white">Kelas</span><span class="mr-2">:</span>
                <span class="text-black bg-[#00ffcc] px-4 py-1 font-black text-lg">{{ selectedClass }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-white mr-2">Wali Kelas</span><span class="mr-2">:</span>
                <select v-model="selectedWaliKelas[selectedClass]" class="bg-black text-white border border-gray-700 rounded px-2 py-1 outline-none focus:border-[#00ffcc] print:appearance-none print:border-none">
                  <option value="">-- Pilih Wali Kelas --</option>
                  <option v-for="t in teachersList" :key="t.code" :value="t.name">{{ t.name }}</option>
                </select>
              </div>
            </div>

            <table class="w-full border-collapse border border-gray-600 text-sm mb-16">
              <thead>
                <tr class="bg-gray-800 text-gray-300">
                  <th rowspan="2" class="border border-gray-600 p-2 w-16 align-middle">Les</th>
                  <th rowspan="2" class="border border-gray-600 p-2 w-32 align-middle">JAM</th>
                  <th v-for="day in activeDays" :key="day" colspan="2" class="border border-gray-600 p-2 uppercase tracking-wider text-center">{{ day }}</th>
                </tr>
                <tr class="bg-gray-800 text-gray-300">
                  <template v-for="day in activeDays" :key="'sub'+day">
                    <th class="border border-gray-600 p-2 text-center text-[11px]">MAPEL</th>
                    <th class="border border-gray-600 p-2 text-center text-[11px]">KODE GURU</th>
                  </template>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in maxSessions" :key="s.id" class="hover:bg-gray-900/50 transition-colors">
                  <!-- Jika Istirahat -->
                  <template v-if="s.type === 'ISTIRAHAT'">
                    <td class="border border-gray-600 p-2 text-center font-bold text-gray-300">ISTIRAHAT</td>
                    <td class="border border-gray-600 p-2 text-center text-gray-400 font-mono">{{ s.waktu }}</td>
                    <td :colspan="activeDays.length * 2" class="border border-gray-600 p-2 bg-gray-900/80"></td>
                  </template>

                  <!-- Jika KBM -->
                  <template v-else>
                    <td class="border border-gray-600 p-2 text-center font-bold text-gray-300">{{ s.label }}</td>
                    <td class="border border-gray-600 p-2 text-center text-gray-400 font-mono">{{ s.waktu }}</td>
                    
                    <template v-for="day in activeDays" :key="day">
                      <td class="border border-gray-600 p-2 text-center h-12">
                        <span class="text-white">{{ getSchedule(day, s.label)?.mapel || '' }}</span>
                      </td>
                      <td class="border border-gray-600 p-2 text-center">
                        <span class="text-gray-400">{{ getSchedule(day, s.label)?.guru || '' }}</span>
                      </td>
                    </template>
                  </template>
                </tr>
              </tbody>
            </table>

            <div class="flex justify-between text-sm font-bold text-gray-300 mt-16 px-8">
              <div class="text-center">
                <p class="mb-24">Kepala Sekolah</p>
                <p class="font-black text-white text-base">{{ profile.headmaster_name || '...........................................' }}</p>
              </div>
              <div class="text-center">
                <p class="mb-1 text-gray-400">{{ getCityName() }}, ........................................</p>
                <p class="mb-24">Wakil Kepala Sekolah Bid. Kurikulum</p>
                <p class="font-black text-white text-base">{{ profile.vice_headmaster_name || '...........................................' }}</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const schoolId = localStorage.getItem('school_id')
const profile = ref({})
const activeDays = ref([])
const daySessions = ref({})
const teachersList = ref([])
const jadwalData = ref({})
const classes = ref([])

const searchQuery = ref('')
const selectedClass = ref(null)
const selectedWaliKelas = ref({})

const loadAllData = async () => {
  try {
    const headers = { 'X-School-ID': schoolId || '' }
    
    // 1. Profile
    const resProfile = await fetch('/api/v1/school/profile', { headers })
    if (resProfile.ok) {
      profile.value = await resProfile.json()
    }

    // 2. Sesi Waktu
    const resSesi = await fetch('/api/v1/school/sessions', { headers })
    if (resSesi.ok) {
      const data = await resSesi.json()
      const dayOrder = { 'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6, 'Minggu': 7 }
      const days = Object.keys(data).filter(d => data[d] && data[d].length > 0)
      activeDays.value = days.sort((a, b) => dayOrder[a] - dayOrder[b])
      
      activeDays.value.forEach(day => {
        let kbmCount = 0
        daySessions.value[day] = data[day].map(s => {
          if (s.type === 'KBM') {
            kbmCount++
            return { ...s, label: kbmCount.toString(), waktu: `${s.start_time || ''} - ${s.end_time || ''}` }
          } else {
            return { ...s, label: 'ISTIRAHAT', waktu: `${s.start_time || ''} - ${s.end_time || ''}` }
          }
        })
      })
    }

    // 3. Pengampu (Untuk list guru unik & classes)
    const resPengampu = await fetch('/api/v1/school/pengampu', { headers })
    if (resPengampu.ok) {
      const dataPengampu = await resPengampu.json()
      if (dataPengampu.classes) classes.value = dataPengampu.classes
      if (dataPengampu.rows) {
        const map = new Map()
        dataPengampu.rows.forEach(r => {
          if (r.teacher_code && r.teacher_name) {
            map.set(r.teacher_code.toUpperCase(), r.teacher_name)
          }
        })
        teachersList.value = Array.from(map.entries()).map(([code, name]) => ({ code, name }))
      }
    }

    // 4. Jadwal Data
    const resJadwal = await fetch('/api/v1/school/jadwal', { headers })
    if (resJadwal.ok) {
      jadwalData.value = await resJadwal.json()
    }

  } catch (err) {
    console.error("Gagal memuat data Jadwal Kelas", err)
  }
}

onMounted(() => {
  loadAllData()
})

const filteredClasses = computed(() => {
  if (!searchQuery.value) return classes.value
  const q = searchQuery.value.toLowerCase()
  return classes.value.filter(c => c.toLowerCase().includes(q))
})

const maxSessions = computed(() => {
  if (activeDays.value.length === 0) return []
  let maxDay = activeDays.value[0]
  for (let d of activeDays.value) {
    if (daySessions.value[d] && daySessions.value[maxDay]) {
      if (daySessions.value[d].length > daySessions.value[maxDay].length) {
        maxDay = d
      }
    }
  }
  return daySessions.value[maxDay] || []
})

const getSchedule = (day, sessionLabel) => {
  if (!selectedClass.value) return null
  const dayCap = day.toUpperCase()
  const key = `${dayCap}-${sessionLabel}-${selectedClass.value}`
  if (jadwalData.value[key]) {
    return {
      mapel: jadwalData.value[key].mapel,
      guru: jadwalData.value[key].guru
    }
  }
  return null
}

const getCityName = () => {
  if (!profile.value.address) return 'Kota'
  return profile.value.address.split(',')[0].trim() || 'Kota'
}

const printSchedule = () => {
  const printContents = document.getElementById('printableArea').innerHTML;
  const originalContents = document.body.innerHTML;

  document.body.innerHTML = `
    <div style="background: black; padding: 40px; color: white; min-height: 100vh; font-family: sans-serif;">
      ${printContents}
    </div>
  `;
  
  window.print();
  document.body.innerHTML = originalContents;
  window.location.reload(); 
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }

@media print {
  @page { size: A4 landscape; margin: 10mm; }
  body { background: black !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  select {
    appearance: none;
    border: none;
    background: transparent;
    color: white;
  }
}
</style>
