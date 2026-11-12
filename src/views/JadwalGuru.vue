<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden font-sans">
    
    <!-- Sidebar: Filter & Daftar Guru (Hidden on Print) -->
    <aside class="no-print w-80 bg-white border-r border-gray-100 flex flex-col h-full shadow-sm z-20 flex-shrink-0">
      <div class="p-5 border-b border-gray-100 bg-white">
        <div class="flex items-center justify-between mb-1">
          <h2 class="text-xl font-black text-gray-900 tracking-tight">Jadwal Guru</h2>
          <span class="text-[11px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-100">
            {{ filteredTeachers.length }} Guru
          </span>
        </div>
        <p class="text-xs text-gray-500 font-medium">Pilih guru untuk melihat dan mencetak jadwal mengajar.</p>
        
        <!-- Search Input -->
        <div class="mt-4 relative">
          <svg class="w-4 h-4 absolute left-3.5 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            v-model="searchQuery" 
            type="text" 
            class="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
            placeholder="Cari nama atau kode guru..."
          />
        </div>
      </div>

      <!-- List Guru -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        <div v-if="filteredTeachers.length === 0" class="text-center py-10 text-gray-400 text-sm italic">
          Guru tidak ditemukan.
        </div>
        <button 
          v-for="teacher in filteredTeachers" 
          :key="teacher.code"  
          @click="selectTeacher(teacher)"
          class="w-full text-left p-3 rounded-2xl transition-all border flex items-center gap-3 cursor-pointer"
          :class="[selectedTeacher?.code === teacher.code ? 'bg-blue-50/80 border-blue-300 shadow-sm' : 'bg-white border-gray-100 hover:border-blue-100 hover:bg-gray-50']"
        >
          <div 
            class="w-10 h-10 rounded-xl flex items-center justify-center font-black flex-shrink-0 transition-colors"
            :class="[selectedTeacher?.code === teacher.code ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-blue-100 text-blue-700']"
          >
            {{ teacher.code }}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-gray-900 text-sm truncate" :class="[selectedTeacher?.code === teacher.code ? 'text-blue-900' : '']">
              {{ teacher.name }}
            </h3>
            <div class="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
              <span>Beban: <b class="text-blue-700">{{ getTeacherTotalJP(teacher.code) }} JP</b></span>
              <span class="text-gray-300">•</span>
              <span class="truncate">{{ teacher.subject || 'Mapel' }}</span>
            </div>
          </div>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col relative overflow-hidden bg-gray-100">
      
      <!-- Empty State (No Teacher Selected) -->
      <div v-if="!selectedTeacher" class="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
        <div class="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-4 border border-gray-200">
          <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </div>
        <h2 class="text-xl font-black text-gray-700">Pilih Guru untuk Membuka Jadwal</h2>
        <p class="text-sm text-gray-500 mt-1 max-w-sm">
          Pilih salah satu guru dari panel di samping untuk melihat jadwal mengajar mingguan, mencetak format PDF resmi, atau mengunduh Excel.
        </p>
      </div>

      <!-- Selected Teacher Schedule View -->
      <div v-else class="flex-1 overflow-y-auto flex flex-col p-4 sm:p-6 lg:p-8">
        
        <!-- Header Actions (Hidden on Print) -->
        <div class="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">Pratinjau Jadwal Mengajar</h2>
            <p class="text-xs text-gray-500 mt-0.5">Tampilan jadwal resmi berbasis relasi data tunggal terpusat.</p>
          </div>

          <div class="flex items-center gap-3">
            <!-- Download Excel Button -->
            <button 
              @click="handleExportExcel" 
              class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2 text-sm transform active:scale-95 cursor-pointer"
              title="Unduh jadwal dalam format Excel (.xlsx)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span>Download Excel</span>
            </button>

            <!-- Print / PDF Button -->
            <button 
              @click="handlePrintPDF" 
              class="bg-gray-900 hover:bg-black text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all flex items-center gap-2 text-sm transform active:scale-95 cursor-pointer"
              title="Cetak lembar jadwal atau simpan sebagai PDF"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
              </svg>
              <span>Cetak Jadwal (PDF)</span>
            </button>
          </div>
        </div>

        <!-- Printable Schedule Container (Traditional Indonesian School Layout) -->
        <div class="flex-1 flex justify-center pb-20">
          <div 
            id="printableArea" 
            class="print-sheet bg-white text-gray-900 p-8 sm:p-12 shadow-xl border border-gray-200 rounded-2xl font-sans relative w-full max-w-[1150px]"
          >
            
            <!-- School Formal Kop Surat / Header -->
            <div class="text-center border-b-2 border-gray-900 pb-5 mb-6">
              <h1 class="text-xl sm:text-2xl font-black uppercase tracking-wider text-gray-900">
                {{ profile.name || 'GURUKU SAAS MANAGEMENT SEKOLAH' }}
              </h1>
              <p class="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                {{ profile.address || 'Komp. Pendidikan Terpadu Nasional' }}
              </p>
              <div class="mt-2 inline-block bg-gray-100 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest text-gray-800 border border-gray-300">
                Jadwal Mengajar Guru • Semester {{ (profile.semester || 'Ganjil').toUpperCase() }}
              </div>
              <div class="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">
                Tahun Pelajaran {{ profile.academic_year || '2026/2027' }}
              </div>
            </div>
            
            <!-- Metadata & Summary Stats Block -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <!-- Left: Teacher Info -->
              <div class="space-y-1.5">
                <div class="flex items-center">
                  <span class="w-32 text-gray-500 uppercase">KODE GURU</span>
                  <span class="mr-2 text-gray-400">:</span>
                  <span class="bg-blue-600 text-white px-2 py-0.5 rounded font-black text-xs">{{ selectedTeacher.code }}</span>
                </div>
                <div class="flex items-center">
                  <span class="w-32 text-gray-500 uppercase">NAMA GURU</span>
                  <span class="mr-2 text-gray-400">:</span>
                  <span class="text-gray-900 font-black text-sm">{{ selectedTeacher.name }}</span>
                </div>
                <div class="flex items-center">
                  <span class="w-32 text-gray-500 uppercase">SPESIALISASI</span>
                  <span class="mr-2 text-gray-400">:</span>
                  <span class="text-gray-700 font-bold">{{ selectedTeacher.subject || 'Guru Mata Pelajaran' }}</span>
                </div>
              </div>

              <!-- Right: Workload Stats -->
              <div class="space-y-1.5 sm:text-right">
                <div class="flex sm:justify-end items-center">
                  <span class="w-48 text-gray-500 uppercase">JUMLAH JAM KBM</span>
                  <span class="mr-2 text-gray-400">:</span>
                  <span class="text-gray-900 font-black">{{ teacherStats.kbmJP }} JP</span>
                </div>
                <div class="flex sm:justify-end items-center">
                  <span class="w-48 text-gray-500 uppercase">JAM TUGAS TAMBAHAN</span>
                  <span class="mr-2 text-gray-400">:</span>
                  <span class="text-gray-900 font-black">{{ teacherStats.tugasTambahanJP }} JP</span>
                </div>
                <div class="flex sm:justify-end items-center text-blue-700">
                  <span class="w-48 uppercase">TOTAL BEBAN KERJA</span>
                  <span class="mr-2 text-blue-400">:</span>
                  <span class="bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-black text-sm">{{ teacherStats.totalJP }} JP / Minggu</span>
                </div>
              </div>
            </div>

            <!-- 2D Traditional Schedule Table -->
            <div class="overflow-x-auto">
              <table class="w-full border-collapse border border-gray-900 text-xs text-center mb-10">
                <thead>
                  <tr class="bg-gray-100 text-gray-900 font-black border-b border-gray-900">
                    <th class="border border-gray-900 p-2.5 w-16 uppercase">JAM</th>
                    <th class="border border-gray-900 p-2.5 w-28 uppercase">WAKTU</th>
                    <th 
                      v-for="day in activeDays" 
                      :key="day" 
                      class="border border-gray-900 p-2.5 uppercase tracking-wider"
                    >
                      {{ day }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="s in maxSessions" 
                    :key="s.id || s.label" 
                    class="hover:bg-gray-50 transition-colors"
                  >
                    <!-- Column 1: Jam Ke -->
                    <td class="border border-gray-900 p-2 font-black text-gray-900">
                      {{ s.type === 'ISTIRAHAT' ? '-' : s.label }}
                    </td>

                    <!-- Column 2: Waktu (Start - End) -->
                    <td class="border border-gray-900 p-2 text-gray-600 font-mono text-[11px]">
                      {{ s.waktu }}
                    </td>
                    
                    <!-- IF ISTIRAHAT: Row Spanning All Day Columns -->
                    <template v-if="s.type === 'ISTIRAHAT'">
                      <td 
                        :colspan="activeDays.length" 
                        class="border border-gray-900 p-2.5 text-center font-black tracking-widest text-gray-600 bg-gray-100"
                      >
                        ISTIRAHAT
                      </td>
                    </template>

                    <!-- IF KBM Sesi: Show Subject and Class ID -->
                    <template v-else>
                      <td 
                        v-for="day in activeDays" 
                        :key="day" 
                        class="border border-gray-900 p-2 h-14 align-middle"
                      >
                        <div v-if="getCellContent(day, s.label)" class="flex flex-col items-center justify-center">
                          <span class="font-black text-gray-900 text-[13px]">
                            {{ getCellContent(day, s.label).subject }}
                          </span>
                          <span class="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded mt-0.5 border border-blue-200">
                            Kelas {{ getCellContent(day, s.label).class_id }}
                          </span>
                        </div>
                        <span v-else class="text-gray-300">-</span>
                      </td>
                    </template>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Formal Signature Footer Blocks -->
            <div class="flex justify-between items-start text-xs font-bold text-gray-800 mt-12 px-6">
              <!-- Left: Kepala Sekolah -->
              <div class="text-center w-64">
                <p class="text-gray-500 mb-1">Mengetahui,</p>
                <p class="font-black text-gray-900 mb-20">Kepala Sekolah</p>
                <p class="font-black text-gray-900 text-sm underline">
                  {{ profile.headmaster_name || 'Budi Santoso, S.Pd., M.M.' }}
                </p>
                <p class="text-[10px] text-gray-400 mt-0.5">NIP. ...................................................</p>
              </div>

              <!-- Right: Wakasek Kurikulum -->
              <div class="text-center w-64">
                <p class="text-gray-500 mb-1">
                  {{ getCityName() }}, {{ getCurrentDateFormatted() }}
                </p>
                <p class="font-black text-gray-900 mb-20">Wakasek Bid. Kurikulum</p>
                <p class="font-black text-gray-900 text-sm underline">
                  {{ profile.vice_headmaster_name || 'Siti Aminah, M.Pd.' }}
                </p>
                <p class="text-[10px] text-gray-400 mt-0.5">NIP. ...................................................</p>
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
import { 
  fetchSchedulePayload, 
  filterScheduleByTeacher, 
  calculateTeacherStats, 
  DAY_ORDER 
} from '../core/scheduleStore.js'
import { exportScheduleToExcel, printScheduleElement } from '../core/exportSchedule.js'

const schoolId = localStorage.getItem('school_id')
const profile = ref({})
const activeDays = ref(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'])
const daySessions = ref({})
const teachersList = ref([])
const schedulePayload = ref([])
const tugasTambahanMap = ref({})

const searchQuery = ref('')
const selectedTeacher = ref(null)

/**
 * Load all upstream data & unified schedule payload
 */
const loadAllData = async () => {
  try {
    const headers = { 'X-School-ID': schoolId || '' }
    
    // 1. Profile / Validasi Lembaga
    const resProfile = await fetch('/api/v1/school/profile', { headers }).catch(() => null)
    if (resProfile && resProfile.ok) {
      profile.value = await resProfile.json()
    } else {
      const savedProfile = localStorage.getItem('guruKu_school_profile') || localStorage.getItem('guruKu_profile')
      if (savedProfile) {
        try { profile.value = JSON.parse(savedProfile) } catch (e) {}
      }
    }

    // 2. Sesi Waktu KBM
    const resSesi = await fetch('/api/v1/school/sessions', { headers }).catch(() => null)
    if (resSesi && resSesi.ok) {
      const data = await resSesi.json()
      const days = Object.keys(data).filter(d => data[d] && data[d].length > 0)
      if (days.length > 0) {
        activeDays.value = days.sort((a, b) => (DAY_ORDER[a] || 99) - (DAY_ORDER[b] || 99))
        activeDays.value.forEach(day => {
          let kbmCount = 0
          daySessions.value[day] = data[day].map(s => {
            if (s.type === 'KBM') {
              kbmCount++
              return { 
                ...s, 
                label: kbmCount.toString(), 
                waktu: `${(s.start_time || '07:30').replace(':', '.')} - ${(s.end_time || '08:10').replace(':', '.')}` 
              }
            } else {
              return { 
                ...s, 
                label: 'ISTIRAHAT', 
                waktu: `${(s.start_time || '09:30').replace(':', '.')} - ${(s.end_time || '10:00').replace(':', '.')}` 
              }
            }
          })
        })
      }
    }

    // Fallback default sessions if empty
    if (Object.keys(daySessions.value).length === 0) {
      generateDefaultSessions()
    }

    // 3. Teachers List (from guruKu_teachers or pengampu)
    const savedTeachers = localStorage.getItem('guruKu_teachers')
    if (savedTeachers) {
      try {
        teachersList.value = JSON.parse(savedTeachers)
      } catch (e) {}
    }

    // If still empty, load from pengampu
    if (teachersList.value.length === 0) {
      const resPengampu = await fetch('/api/v1/school/pengampu', { headers }).catch(() => null)
      if (resPengampu && resPengampu.ok) {
        const dataP = await resPengampu.json()
        if (dataP && dataP.rows) {
          const map = new Map()
          dataP.rows.forEach(r => {
            if (r.teacher_code && r.teacher_name) {
              map.set(r.teacher_code.toUpperCase(), {
                code: r.teacher_code.toUpperCase(),
                name: r.teacher_name,
                subject: r.subject_name || r.subject_code
              })
            }
          })
          teachersList.value = Array.from(map.values())
        }
      }
    }

    // Seed realistic fallback teachers if none exist
    if (teachersList.value.length === 0) {
      teachersList.value = [
        { code: 'SB', name: 'T. Saiful Bahri, Lc', subject: 'Nahwu' },
        { code: 'BS', name: 'Budi Santoso, S.Pd', subject: 'Matematika' },
        { code: 'SA', name: 'Siti Aminah, M.Pd', subject: 'Bahasa Indonesia' },
        { code: 'AF', name: 'Ahmad Fauzi, S.Si', subject: 'Ilmu Pengetahuan Alam' },
        { code: 'DL', name: 'Dewi Lestari, S.Pd', subject: 'Bahasa Inggris' }
      ]
    }

    // 4. Tugas Tambahan
    const savedTugas = localStorage.getItem('guruKu_tugas_tambahan')
    if (savedTugas) {
      try {
        const parsedTugas = JSON.parse(savedTugas)
        parsedTugas.forEach(t => {
          if (t.code) tugasTambahanMap.value[t.code.toUpperCase()] = Number(t.bobot || t.hours || 0)
        })
      } catch (e) {}
    }

    // 5. UNIFIED DATA STORE: Fetch Normalized SchedulePayload
    const payload = await fetchSchedulePayload(schoolId, daySessions.value)
    if (payload && payload.length > 0) {
      schedulePayload.value = payload
    } else {
      // Seed initial realistic schedule payload
      seedSampleSchedule()
    }

    // Auto-select first teacher
    if (teachersList.value.length > 0 && !selectedTeacher.value) {
      selectedTeacher.value = teachersList.value[0]
    }

  } catch (err) {
    console.error('Gagal memuat data Jadwal Guru:', err)
  }
}

/**
 * Fallback sessions builder
 */
const generateDefaultSessions = () => {
  activeDays.value.forEach(day => {
    daySessions.value[day] = [
      { id: 1, label: '1', waktu: '07.30 - 08.10', type: 'KBM' },
      { id: 2, label: '2', waktu: '08.10 - 08.50', type: 'KBM' },
      { id: 3, label: '3', waktu: '08.50 - 09.30', type: 'KBM' },
      { id: 4, label: '4', waktu: '09.30 - 10.10', type: 'KBM' },
      { id: 5, label: 'ISTIRAHAT', waktu: '10.10 - 10.40', type: 'ISTIRAHAT' },
      { id: 6, label: '5', waktu: '10.40 - 11.20', type: 'KBM' },
      { id: 7, label: '6', waktu: '11.20 - 12.00', type: 'KBM' },
      { id: 8, label: '7', waktu: '12.30 - 13.10', type: 'KBM' },
      { id: 9, label: '8', waktu: '13.10 - 13.50', type: 'KBM' }
    ]
  })
}

/**
 * Seed realistic schedule payload if fresh installation
 */
const seedSampleSchedule = () => {
  schedulePayload.value = [
    { day: 'Senin', slot_index: 1, start: '07.30', end: '08.10', class_id: '5 MAPK', teacher_code: 'SB', subject: 'NAH' },
    { day: 'Senin', slot_index: 2, start: '08.10', end: '08.50', class_id: '5 MAPK', teacher_code: 'SB', subject: 'NAH' },
    { day: 'Senin', slot_index: 3, start: '08.50', end: '09.30', class_id: '1A', teacher_code: 'BS', subject: 'MAT' },
    { day: 'Senin', slot_index: 4, start: '09.30', end: '10.10', class_id: '1A', teacher_code: 'BS', subject: 'MAT' },
    { day: 'Selasa', slot_index: 1, start: '07.30', end: '08.10', class_id: '4A', teacher_code: 'SB', subject: 'NAH' },
    { day: 'Selasa', slot_index: 2, start: '08.10', end: '08.50', class_id: '4A', teacher_code: 'SB', subject: 'NAH' },
    { day: 'Rabu', slot_index: 1, start: '07.30', end: '08.10', class_id: '1B', teacher_code: 'BS', subject: 'MAT' },
    { day: 'Rabu', slot_index: 2, start: '08.10', end: '08.50', class_id: '1B', teacher_code: 'BS', subject: 'MAT' },
    { day: 'Kamis', slot_index: 3, start: '08.50', end: '09.30', class_id: '5 MAPK', teacher_code: 'SB', subject: 'NAH' }
  ]
  localStorage.setItem('guruKu_schedule_payload', JSON.stringify(schedulePayload.value))
}

const selectTeacher = (teacher) => {
  selectedTeacher.value = teacher
}

const filteredTeachers = computed(() => {
  if (!searchQuery.value) return teachersList.value
  const q = searchQuery.value.toLowerCase()
  return teachersList.value.filter(t => 
    (t.name || '').toLowerCase().includes(q) || 
    (t.code || '').toLowerCase().includes(q)
  )
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

/**
 * Filter schedule for current selected teacher from single unified payload
 */
const teacherScheduleItems = computed(() => {
  if (!selectedTeacher.value) return []
  return filterScheduleByTeacher(schedulePayload.value, selectedTeacher.value.code)
})

/**
 * Retrieve cell content for (Day, Session)
 */
const getCellContent = (day, sessionLabel) => {
  if (!selectedTeacher.value) return null
  const slotIdx = parseInt(sessionLabel, 10)
  if (isNaN(slotIdx)) return null

  const match = teacherScheduleItems.value.find(item => 
    item.day.toLowerCase() === day.toLowerCase() && item.slot_index === slotIdx
  )
  return match || null
}

const getTeacherTotalJP = (teacherCode) => {
  const items = filterScheduleByTeacher(schedulePayload.value, teacherCode)
  const tugas = tugasTambahanMap.value[teacherCode.toUpperCase()] || 0
  return items.length + tugas
}

const teacherStats = computed(() => {
  if (!selectedTeacher.value) return { kbmJP: 0, tugasTambahanJP: 0, totalJP: 0 }
  const tugas = tugasTambahanMap.value[selectedTeacher.value.code.toUpperCase()] || 0
  return calculateTeacherStats(schedulePayload.value, selectedTeacher.value.code, tugas)
})

const getCityName = () => {
  if (profile.value.city) return profile.value.city
  if (profile.value.address) {
    const parts = profile.value.address.split(',')
    return parts[parts.length - 1].trim()
  }
  return 'Medan'
}

const getCurrentDateFormatted = () => {
  return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

/**
 * Print & Export Handlers
 */
const handlePrintPDF = () => {
  printScheduleElement()
}

const handleExportExcel = () => {
  if (!selectedTeacher.value) return

  exportScheduleToExcel({
    type: 'guru',
    targetName: selectedTeacher.value.name,
    targetCode: selectedTeacher.value.code,
    activeDays: activeDays.value,
    sessions: maxSessions.value,
    getCellData: (day, sessionLabel) => {
      const cell = getCellContent(day, sessionLabel)
      if (!cell) return null
      return {
        text: cell.subject,
        subtext: cell.class_id
      }
    },
    profile: profile.value,
    summaryStats: {
      kbmJP: teacherStats.value.kbmJP,
      tugasJP: teacherStats.value.tugasTambahanJP,
      totalJP: teacherStats.value.totalJP
    }
  })
}

onMounted(() => {
  loadAllData()
})
</script>

<style scoped>
/* ==========================================================================
   OFFICIAL SCHOOL SCHEDULE PRINT STYLING (@media print)
   ========================================================================== */

@media print {
  @page {
    size: A4 landscape;
    margin: 8mm;
  }

  body {
    background-color: #ffffff !important;
    color: #000000 !important;
  }

  /* Hide sidebar, buttons, and system headers */
  .no-print,
  aside,
  header,
  nav,
  button {
    display: none !important;
  }

  /* Expand print sheet to full paper */
  main {
    background-color: transparent !important;
    padding: 0 !important;
    margin: 0 !important;
    overflow: visible !important;
  }

  .print-sheet {
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  table {
    border-color: #000000 !important;
    page-break-inside: avoid;
  }

  th, td {
    border-color: #000000 !important;
  }
}
</style>
