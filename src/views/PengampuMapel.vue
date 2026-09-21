<template>
  <div class="max-w-[1400px] mx-auto p-4">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight">Distribusi Pengampu</h1>
        <p class="text-gray-500 text-sm mt-1">Kelola rombongan belajar dan petakan guru ke mata pelajaran.</p>
      </div>
      <button @click="saveData" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        <span>Simpan Distribusi</span>
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600"></div>
    </div>

    <div v-else class="space-y-8">
      
      <!-- KELOLA KELAS (ROMBEL) -->
      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-black text-gray-900 flex items-center gap-2">
            <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            Daftar Kelas (Rombel)
          </h2>
          <button @click="addClass" class="text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-xl transition-colors">
            + Tambah Kelas
          </button>
        </div>
        
        <div class="flex flex-wrap gap-3">
          <div v-if="classes.length === 0" class="text-sm text-gray-400 italic py-2">Belum ada kelas terdaftar.</div>
          <div v-for="(cls, idx) in classes" :key="idx" class="group bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-1 py-1.5 flex items-center gap-3 hover:border-indigo-300 transition-colors">
            <span class="font-black text-gray-700">{{ cls }}</span>
            <button @click="removeClass(idx)" class="w-7 h-7 rounded-lg text-gray-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- KELOLA PENGAMPU -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-black text-gray-900 flex items-center gap-2">
            <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            Penugasan Guru & Mapel
          </h2>
          <button @click="addTeacherRow" class="text-sm font-bold text-white bg-gray-900 hover:bg-black shadow-md px-5 py-2.5 rounded-xl transition-all flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Tambah Penugasan
          </button>
        </div>

        <div v-if="rows.length === 0" class="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
          <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          </div>
          <h3 class="text-xl font-bold text-gray-700">Belum Ada Penugasan</h3>
          <p class="text-gray-400 mt-2 text-sm">Klik tombol tambah penugasan untuk mulai mendistribusikan jam mengajar.</p>
        </div>

        <!-- Cards Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div v-for="(row, rIdx) in rows" :key="rIdx" class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
            
            <!-- Card Header (Guru & Mapel Info) -->
            <div class="p-5 border-b border-gray-50 bg-gradient-to-b from-gray-50/50 to-white relative">
              <button @click="removeRow(rIdx)" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>

              <div class="flex gap-4 items-start">
                <div class="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner flex-shrink-0">
                  {{ row.teacher_code || '?' }}
                </div>
                <div class="flex-1 min-w-0 pr-8">
                  <input v-model="row.teacher_name" class="w-full bg-transparent border-none p-0 text-lg font-black text-gray-900 focus:ring-0 placeholder-gray-300 truncate" placeholder="Nama Guru Lengkap">
                  <input v-model="row.teacher_code" class="w-full bg-transparent border-none p-0 text-xs font-bold text-gray-400 focus:ring-0 placeholder-gray-300 uppercase mt-1" placeholder="KODE GURU (Cth: MF)">
                </div>
              </div>

              <div class="mt-4 flex items-center gap-3">
                <div class="flex-1 bg-gray-50 border border-gray-200 rounded-xl flex items-center px-3 py-1.5 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
                  <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                  <input v-model="row.subject_code" class="w-full bg-transparent border-none p-0 text-sm font-bold text-gray-700 focus:ring-0 placeholder-gray-300 uppercase" placeholder="KODE MAPEL">
                </div>
                <select v-model="row.is_linear" class="bg-gray-50 border border-gray-200 text-gray-600 text-xs font-bold rounded-xl px-3 py-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none">
                  <option value="true">Linier</option>
                  <option value="false">Non</option>
                </select>
              </div>
            </div>

            <!-- Card Body (Distribusi Kelas) -->
            <div class="p-5 flex-1 flex flex-col bg-white">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Jam Mengajar</span>
                <span class="text-sm font-black text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">Total: {{ calculateRowTotal(row) }} JP</span>
              </div>
              
              <div class="flex-1">
                <!-- List Kelas yang diassign -->
                <div v-if="getAssignedClasses(row).length === 0" class="text-center py-6 border-2 border-dashed border-gray-100 rounded-2xl">
                  <p class="text-xs text-gray-400 font-medium">Belum ada kelas yang ditugaskan</p>
                </div>
                <div v-else class="space-y-2">
                  <div v-for="cIdx in getAssignedClasses(row)" :key="cIdx" class="flex items-center justify-between bg-gray-50 border border-gray-100 p-2.5 rounded-xl hover:bg-white transition-colors">
                    <span class="font-bold text-gray-700 text-sm flex items-center gap-2">
                      <div class="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                      {{ classes[cIdx] }}
                    </span>
                    <div class="flex items-center gap-2">
                      <input type="number" min="0" v-model.number="row.hours[cIdx]" class="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm font-bold text-center text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none">
                      <span class="text-xs font-bold text-gray-400">JP</span>
                      <button @click="row.hours[cIdx] = 0" class="ml-1 text-gray-300 hover:text-red-500 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tombol Assign -->
              <div class="mt-4 pt-4 border-t border-gray-50">
                <div class="relative">
                  <select @change="assignClass(row, $event)" class="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-600 text-sm font-bold rounded-xl px-4 py-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer hover:bg-gray-100 transition-colors">
                    <option value="" disabled selected>+ Tugaskan ke Kelas Baru...</option>
                    <template v-for="(cls, cIdx) in classes" :key="cIdx">
                      <option v-if="!row.hours[cIdx]" :value="cIdx">{{ cls }}</option>
                    </template>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const loading = ref(true)
const schoolId = localStorage.getItem('school_id')
const classes = ref([])
const rows = ref([])

const loadData = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/v1/school/pengampu', {
      headers: { 'X-School-ID': schoolId || '' }
    })
    if (res.ok) {
      const data = await res.json()
      if (data && data.classes) classes.value = data.classes
      if (data && data.rows) rows.value = data.rows
    }
  } catch (err) {
    console.error("Gagal load pengampu", err)
  } finally {
    loading.value = false
  }
}

const saveData = async () => {
  try {
    const payload = {
      classes: classes.value,
      rows: rows.value
    }
    const res = await fetch('/api/v1/school/pengampu', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-School-ID': schoolId || ''
      },
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      alert("Distribusi Pengampu berhasil disimpan!")
    } else {
      alert("Gagal menyimpan data pengampu")
    }
  } catch (err) {
    alert("Terjadi kesalahan jaringan")
  }
}

onMounted(() => {
  loadData()
})

const addClass = () => {
  const newClass = prompt("Masukkan Nama Kelas (Misal: 5 IPA-A)")
  if (newClass && newClass.trim() !== '') {
    classes.value.push(newClass.trim().toUpperCase())
    rows.value.forEach(row => {
      row.hours.push(0)
    })
  }
}

const removeClass = (idx) => {
  if (confirm(`Hapus kelas ${classes.value[idx]}? Data jam mengajar di kelas ini akan ikut terhapus.`)) {
    classes.value.splice(idx, 1)
    rows.value.forEach(row => {
      row.hours.splice(idx, 1)
    })
  }
}

const addTeacherRow = () => {
  rows.value.unshift({
    teacher_code: '',
    teacher_name: '',
    is_linear: 'true',
    subject_code: '',
    hours: new Array(classes.value.length).fill(0)
  })
}

const removeRow = (idx) => {
  if (confirm("Hapus kartu penugasan ini?")) {
    rows.value.splice(idx, 1)
  }
}

const getAssignedClasses = (row) => {
  const assigned = []
  if (!row.hours) return assigned
  row.hours.forEach((h, idx) => {
    if (h > 0) assigned.push(idx)
  })
  return assigned
}

const assignClass = (row, event) => {
  const cIdx = event.target.value
  if (cIdx !== "") {
    row.hours[cIdx] = 2 // Default 2 jam
    event.target.value = "" // Reset select
  }
}

const calculateRowTotal = (row) => {
  if (!row.hours) return 0
  return row.hours.reduce((sum, h) => sum + (Number(h) || 0), 0)
}

</script>

<style scoped>
/* Transisi mulus untuk hover kartu */
.group:hover {
  transform: translateY(-2px);
}
</style>
