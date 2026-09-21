<template>
  <div class="max-w-[1400px] mx-auto p-4">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight">Input & Susun Jadwal</h1>
        <p class="text-gray-500 text-sm mt-1">Smart Scheduling Engine dengan deteksi bentrok real-time.</p>
      </div>
      <div class="flex items-center gap-3">
        <button @click="autoGenerate" class="bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2.5 px-6 rounded-xl shadow-sm transition-all flex items-center gap-2">
          <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
          <span>Auto-Generate</span>
        </button>
        <button @click="saveData" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          <span>Simpan Jadwal</span>
        </button>
      </div>
    </div>

    <!-- Status Alerts -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div class="bg-white border border-red-100 p-4 rounded-2xl shadow-sm flex items-start gap-4">
        <div class="bg-red-50 p-2 rounded-lg">
          <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <div>
          <h3 class="text-sm font-bold text-gray-900">Deteksi Bentrok Guru</h3>
          <p class="text-xs text-gray-500 mt-1">Kartu jadwal akan berdenyut merah (Bentrok) jika guru mengajar di lebih dari satu kelas pada jam yang sama.</p>
        </div>
      </div>
      <div class="bg-white border border-orange-100 p-4 rounded-2xl shadow-sm flex items-start gap-4">
        <div class="bg-orange-50 p-2 rounded-lg">
          <svg class="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div>
          <h3 class="text-sm font-bold text-gray-900">Peringatan Jam Kosong</h3>
          <p class="text-xs text-gray-500 mt-1">Kartu jadwal akan berwarna oranye jika guru ditempatkan pada hari dan jam yang mereka minta untuk dikosongkan.</p>
        </div>
      </div>
    </div>

    <!-- Class Selector (Pills) -->
    <div class="mb-8 relative">
      <div class="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none"></div>
      <div class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none"></div>
      
      <div class="flex gap-2 overflow-x-auto pb-4 custom-scrollbar px-2 snap-x">
        <button v-for="cls in classes" :key="cls" 
                @click="activeClass = cls"
                :class="activeClass === cls ? 'bg-gray-900 text-white shadow-lg scale-105' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'"
                class="px-6 py-3 rounded-2xl font-black text-sm whitespace-nowrap transition-all snap-center flex-shrink-0">
          KELAS {{ cls }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-4 border-gray-900"></div>
    </div>
    
    <!-- Modern Kanban/Card Layout -->
    <div v-else-if="activeClass" class="space-y-8">
      <div v-for="day in activeDays" :key="day" class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        <!-- Day Header -->
        <div class="bg-gray-900 px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-2 h-8 bg-blue-500 rounded-full"></div>
            <h2 class="text-xl font-black text-white uppercase tracking-widest">{{ day }}</h2>
          </div>
          <span class="text-xs font-medium text-gray-400">{{ daySessions[day].filter(s => s.type === 'KBM').length }} Sesi Aktif</span>
        </div>
        
        <!-- Day Sessions Grid -->
        <div class="p-6">
          <div class="flex flex-wrap gap-4">
            
            <template v-for="session in daySessions[day]" :key="session.label">
              
              <!-- Istirahat Block -->
              <div v-if="session.type === 'ISTIRAHAT'" 
                   class="w-full md:w-32 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiAvPgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iI2YxZjVmOSIgc3Ryb2tlLXdpZHRoPSIxIiAvPgo8L3N2Zz4=')] border border-gray-100 rounded-2xl flex flex-col items-center justify-center opacity-60 h-28">
                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ session.start_time }} - {{ session.end_time }}</span>
                <span class="text-sm font-bold text-gray-500 mt-2">ISTIRAHAT</span>
              </div>
              
              <!-- KBM Block -->
              <div v-else @click="openModal(day, session.label, activeClass)"
                   :class="getCardClass(day, session.label, activeClass)"
                   class="w-full sm:w-40 md:w-48 h-28 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative group flex flex-col overflow-hidden">
                
                <!-- Time Ribbon -->
                <div class="bg-gray-50/80 px-3 py-1.5 border-b border-gray-100 flex justify-between items-center">
                  <span class="text-[10px] font-black text-gray-500">SESI {{ session.label }}</span>
                  <span class="text-[10px] font-bold text-gray-400">{{ session.start_time }} - {{ session.end_time }}</span>
                </div>
                
                <!-- Content Area -->
                <div class="flex-1 flex flex-col items-center justify-center p-3 relative bg-white">
                  
                  <!-- Empty State -->
                  <template v-if="!hasJadwal(day, session.label, activeClass)">
                    <div class="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-300 group-hover:border-blue-400 group-hover:text-blue-500 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    </div>
                    <span class="text-[10px] font-bold text-gray-400 mt-2 group-hover:text-blue-500 transition-colors">Isi Jadwal</span>
                  </template>
                  
                  <!-- Filled State -->
                  <template v-else>
                    
                    <!-- Alert Badges (Absolute) -->
                    <div v-if="getValidationType(day, session.label, activeClass) === 'clash'" class="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </div>
                    <div v-else-if="getValidationType(day, session.label, activeClass) === 'kosong'" class="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full animate-ping"></div>

                    <!-- Mapel -->
                    <h4 class="text-sm font-black text-gray-900 truncate w-full text-center">{{ getJadwal(day, session.label, activeClass).mapel }}</h4>
                    
                    <!-- Guru Pill -->
                    <div class="mt-2 bg-gray-900 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                      <div class="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      {{ getJadwal(day, session.label, activeClass).guru }}
                    </div>
                    
                  </template>
                  
                </div>
              </div>
              
            </template>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-20">
      <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
      </div>
      <h3 class="text-xl font-bold text-gray-800">Pilih Kelas</h3>
      <p class="text-sm text-gray-500 mt-2">Silakan pilih kelas pada menu di atas untuk mulai menyusun jadwal.</p>
    </div>

    <!-- Edit Modal (Sleek Drawer/Modal) -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-opacity">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 opacity-100">
        
        <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 class="text-lg font-black text-gray-900">Assign Jadwal</h3>
            <p class="text-xs text-gray-500 font-medium mt-1">{{ editing.day }} • Sesi {{ editing.session }} • KELAS {{ activeClass }}</p>
          </div>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 p-2 rounded-full transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div class="p-6 space-y-5">
          <!-- Guru Input -->
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pilih Kode Guru</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </div>
              <input type="text" v-model="tempEdit.guru" :list="`modal-guru-${activeClass}`" 
                     class="pl-11 w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 font-bold uppercase transition-colors" placeholder="Ketik/Pilih Kode Guru">
            </div>
          </div>
          
          <!-- Mapel Input -->
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pilih Kode Mapel</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              </div>
              <input type="text" v-model="tempEdit.mapel" :list="`modal-mapel-${activeClass}`" 
                     class="pl-11 w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 font-bold uppercase transition-colors" placeholder="Ketik/Pilih Kode Mapel">
            </div>
          </div>
        </div>
        
        <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button @click="clearCell" class="px-5 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
            Kosongkan
          </button>
          <button @click="applyEdit" class="px-6 py-2.5 text-sm font-bold text-white bg-gray-900 hover:bg-black rounded-xl shadow-md transition-all">
            Simpan Slot
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal Datalists -->
    <div class="hidden" v-if="activeClass">
      <datalist :id="`modal-guru-${activeClass}`">
        <option v-for="guru in getTeachersForClass(activeClass)" :key="guru" :value="guru"></option>
      </datalist>
      <datalist :id="`modal-mapel-${activeClass}`">
        <option v-for="mapel in getSubjectsForClass(activeClass)" :key="mapel" :value="mapel"></option>
      </datalist>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const loading = ref(true)
const schoolId = localStorage.getItem('school_id')

const activeDays = ref([])
const daySessions = ref({})
const classes = ref([])
const activeClass = ref('')
const pengampuRows = ref([])
const jamKosongData = ref({})

// Format: { "SENIN-1-4 TM": { guru: "", mapel: "" }, ... }
const jadwalData = ref({})

// Modal State
const showModal = ref(false)
const editing = ref({ day: '', session: '' })
const tempEdit = ref({ guru: '', mapel: '' })

const getJadwal = (day, sessionLabel, cls) => {
  const key = `${day.toUpperCase()}-${sessionLabel}-${cls}`
  if (!jadwalData.value[key]) {
    jadwalData.value[key] = { guru: '', mapel: '' }
  }
  return jadwalData.value[key]
}

const hasJadwal = (day, sessionLabel, cls) => {
  const cell = getJadwal(day, sessionLabel, cls)
  return cell.guru || cell.mapel
}

// Validation Engine
const clashingTeachers = computed(() => {
  const map = {}
  for (const key in jadwalData.value) {
    const cell = jadwalData.value[key]
    const guru = cell.guru?.trim().toUpperCase()
    if (!guru) continue
    
    const parts = key.split('-')
    const day = parts[0]
    const session = parts[1]
    
    const timeKey = `${day}-${session}-${guru}`
    if (!map[timeKey]) map[timeKey] = 0
    map[timeKey]++
  }
  
  const clashes = {}
  for (const key in map) {
    if (map[key] > 1) clashes[key] = map[key]
  }
  return clashes
})

const getValidationType = (day, sessionLabel, cls) => {
  const cell = getJadwal(day, sessionLabel, cls)
  const guru = cell.guru?.trim().toUpperCase()
  if (!guru) return null
  
  // Deteksi Bentrok
  const timeKey = `${day.toUpperCase()}-${sessionLabel}-${guru}`
  if (clashingTeachers.value[timeKey]) {
    return 'clash'
  }
  
  // Deteksi Jam Kosong
  const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()
  const kosongKey = `${dayCapitalized}-${sessionLabel}-${guru}`
  if (jamKosongData.value[kosongKey]) {
    return 'kosong'
  }
  
  return null
}

const getCardClass = (day, sessionLabel, cls) => {
  const vType = getValidationType(day, sessionLabel, cls)
  if (vType === 'clash') return 'border-red-400 bg-red-50/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse'
  if (vType === 'kosong') return 'border-orange-400 bg-orange-50/50 shadow-[0_0_15px_rgba(249,115,22,0.2)]'
  if (hasJadwal(day, sessionLabel, cls)) return 'border-blue-200 bg-blue-50/30 border-2'
  return 'border-gray-200 border-dashed hover:border-solid hover:border-gray-300'
}

// Modal Actions
const openModal = (day, sessionLabel, cls) => {
  editing.value = { day, session: sessionLabel }
  const cell = getJadwal(day, sessionLabel, cls)
  tempEdit.value = { guru: cell.guru, mapel: cell.mapel }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const applyEdit = () => {
  const key = `${editing.value.day.toUpperCase()}-${editing.value.session}-${activeClass.value}`
  jadwalData.value[key] = {
    guru: tempEdit.value.guru.trim().toUpperCase(),
    mapel: tempEdit.value.mapel.trim().toUpperCase()
  }
  closeModal()
}

const clearCell = () => {
  tempEdit.value = { guru: '', mapel: '' }
  applyEdit()
}

// Data Fetching
const getTeachersForClass = (cls) => {
  const clsIdx = classes.value.indexOf(cls)
  if (clsIdx === -1) return []
  const teachers = new Set()
  pengampuRows.value.forEach(row => {
    if (row.hours && row.hours[clsIdx] > 0 && row.teacher_code) {
      teachers.add(row.teacher_code.toUpperCase())
    }
  })
  return Array.from(teachers)
}

const getSubjectsForClass = (cls) => {
  const clsIdx = classes.value.indexOf(cls)
  if (clsIdx === -1) return []
  const subjects = new Set()
  pengampuRows.value.forEach(row => {
    if (row.hours && row.hours[clsIdx] > 0 && row.subject_code) {
      subjects.add(row.subject_code.toUpperCase())
    }
  })
  return Array.from(subjects)
}

const fetchAllData = async () => {
  loading.value = true
  try {
    const pengampuRes = await fetch('/api/v1/school/pengampu', { headers: { 'X-School-ID': schoolId || '' } })
    if (pengampuRes.ok) {
      const data = await pengampuRes.json()
      if (data && data.classes) {
        classes.value = data.classes
        if (classes.value.length > 0) activeClass.value = classes.value[0]
      }
      if (data && data.rows) pengampuRows.value = data.rows
    }

    const sessionRes = await fetch('/api/v1/school/sessions', { headers: { 'X-School-ID': schoolId || '' } })
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
    
    const kosRes = await fetch('/api/v1/school/jam-kosong', { headers: { 'X-School-ID': schoolId || '' } })
    if (kosRes.ok) {
      const data = await kosRes.json()
      if (data) jamKosongData.value = data
    }

    const jadwalRes = await fetch('/api/v1/school/jadwal', { headers: { 'X-School-ID': schoolId || '' } })
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
      headers: { 'Content-Type': 'application/json', 'X-School-ID': schoolId || '' },
      body: JSON.stringify(cleanData)
    })
    
    if (res.ok) alert("Jadwal KBM berhasil disimpan!")
    else alert("Gagal menyimpan jadwal")
  } catch (err) {
    alert("Terjadi kesalahan jaringan")
  }
}

const autoGenerate = () => {
  alert("Fitur AI Auto-Generate sedang dalam tahap pengembangan khusus algoritma genetika. Stay tuned!")
}

onMounted(() => {
  fetchAllData()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
</style>
