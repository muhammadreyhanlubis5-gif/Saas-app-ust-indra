<template>
  <div class="animate-fade-in-up p-4 md:p-8 max-w-[1400px] mx-auto">
    <!-- Header modern -->
    <div class="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-3xl p-6 md:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-10 w-40 h-40 bg-blue-400 opacity-20 rounded-full blur-2xl"></div>
      
      <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 class="text-2xl md:text-3xl font-black mb-2 flex items-center gap-3">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Alokasi & Jam Kelas
          </h1>
          <p class="text-indigo-100 max-w-2xl text-sm md:text-base">
            Distribusi jam pelajaran per mata pelajaran untuk masing-masing kelas. 
            Perubahan di sini akan otomatis tersinkronisasi dengan form Input Jadwal.
          </p>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3">
          <button @click="saveAllocation" :disabled="saving" class="bg-white text-indigo-700 hover:bg-gray-50 px-6 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2">
            <svg v-if="!saving" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <svg v-else class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ saving ? 'Menyimpan...' : 'Simpan Alokasi' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toggle View Mode -->
    <div class="flex justify-center mb-8">
      <div class="bg-white p-1 rounded-xl shadow-sm border border-gray-100 inline-flex relative">
        <button @click="viewMode = 'byClass'" :class="viewMode === 'byClass' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-500 hover:text-gray-700'" class="px-6 py-2 rounded-lg text-sm transition-all relative z-10 w-40 text-center">
          Berdasarkan Kelas
        </button>
        <button @click="viewMode = 'bySubject'" :class="viewMode === 'bySubject' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-500 hover:text-gray-700'" class="px-6 py-2 rounded-lg text-sm transition-all relative z-10 w-40 text-center">
          Berdasarkan Mapel
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <!-- VIEW MODE: BY CLASS -->
    <div v-else-if="viewMode === 'byClass'" class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      <!-- Sidebar Classes -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-1 flex flex-col h-[600px]">
        <div class="bg-gray-50 px-4 py-3 border-b border-gray-100">
          <h3 class="font-bold text-gray-700 text-sm">Pilih Kelas</h3>
        </div>
        <div class="overflow-y-auto flex-1 p-2">
          <button v-for="cls in classes" :key="cls.id" @click="selectedClass = cls" 
            :class="selectedClass?.id === cls.id ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-indigo-50 text-gray-700 border border-transparent hover:border-indigo-100'"
            class="w-full text-left px-4 py-3 rounded-xl mb-2 transition-all font-semibold text-sm flex justify-between items-center">
            <span>{{ cls.name }}</span>
            <span v-if="getClassTotalHours(cls.id) > 0" :class="selectedClass?.id === cls.id ? 'bg-white text-indigo-700' : 'bg-gray-100 text-gray-500'" class="text-[10px] px-2 py-0.5 rounded-full font-black">
              {{ getClassTotalHours(cls.id) }} JP
            </span>
          </button>
          
          <div v-if="classes.length === 0" class="text-center py-10 text-gray-400 text-sm italic">
            Belum ada data kelas.
          </div>
        </div>
      </div>
      
      <!-- Content Subjects -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-3 h-[600px] flex flex-col">
        <div class="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="font-bold text-gray-800 text-lg">
            Alokasi Mapel: <span class="text-indigo-600">{{ selectedClass?.name || 'Pilih Kelas' }}</span>
          </h3>
          <div class="bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
            <span class="text-xs text-indigo-700 font-bold uppercase tracking-wider">Total Jam: {{ selectedClass ? getClassTotalHours(selectedClass.id) : 0 }}</span>
          </div>
        </div>
        
        <div class="overflow-y-auto flex-1 p-6 bg-gray-50/50">
          <div v-if="!selectedClass" class="h-full flex flex-col items-center justify-center text-gray-400">
            <svg class="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
            <p>Silakan pilih kelas di panel kiri untuk mengatur alokasi jam.</p>
          </div>
          
          <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div v-for="sub in subjects" :key="sub.id" class="bg-white rounded-xl border p-4 shadow-sm transition-all"
                 :class="getAllocation(selectedClass.id, sub.id) > 0 ? 'border-indigo-300 ring-1 ring-indigo-50' : 'border-gray-200 hover:border-gray-300'">
              
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h4 class="font-bold text-gray-800 text-sm line-clamp-1" :title="sub.name">{{ sub.name }}</h4>
                  <p class="text-xs text-gray-400 mt-0.5">{{ sub.code }}</p>
                </div>
              </div>
              
              <div class="flex items-center justify-between mt-auto">
                <span class="text-xs font-semibold text-gray-500 uppercase">Jam per Pekan</span>
                <div class="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-0.5">
                  <button @click="updateAllocation(selectedClass.id, sub.id, -1)" class="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-white hover:text-red-500 hover:shadow-sm transition-all disabled:opacity-30" :disabled="getAllocation(selectedClass.id, sub.id) <= 0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M20 12H4"></path></svg>
                  </button>
                  <span class="w-10 text-center font-black text-gray-700 text-sm">{{ getAllocation(selectedClass.id, sub.id) }}</span>
                  <button @click="updateAllocation(selectedClass.id, sub.id, 1)" class="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-white hover:text-green-500 hover:shadow-sm transition-all">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- VIEW MODE: BY SUBJECT -->
    <div v-else-if="viewMode === 'bySubject'" class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Sidebar Subjects -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-1 flex flex-col h-[600px]">
        <div class="bg-gray-50 px-4 py-3 border-b border-gray-100">
          <h3 class="font-bold text-gray-700 text-sm">Pilih Mata Pelajaran</h3>
        </div>
        <div class="overflow-y-auto flex-1 p-2">
          <button v-for="sub in subjects" :key="sub.id" @click="selectedSubject = sub" 
            :class="selectedSubject?.id === sub.id ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-indigo-50 text-gray-700 border border-transparent hover:border-indigo-100'"
            class="w-full text-left px-4 py-3 rounded-xl mb-2 transition-all font-semibold text-sm flex justify-between items-center">
            <span class="line-clamp-1">{{ sub.name }}</span>
            <span v-if="getSubjectTotalHours(sub.id) > 0" :class="selectedSubject?.id === sub.id ? 'bg-white text-indigo-700' : 'bg-gray-100 text-gray-500'" class="text-[10px] px-2 py-0.5 rounded-full font-black flex-shrink-0 ml-2">
              {{ getSubjectTotalHours(sub.id) }} JP
            </span>
          </button>
          
          <div v-if="subjects.length === 0" class="text-center py-10 text-gray-400 text-sm italic">
            Belum ada data mapel.
          </div>
        </div>
      </div>
      
      <!-- Content Classes -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-3 h-[600px] flex flex-col">
        <div class="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="font-bold text-gray-800 text-lg">
            Alokasi Kelas: <span class="text-indigo-600">{{ selectedSubject?.name || 'Pilih Mapel' }}</span>
          </h3>
          <div class="bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
            <span class="text-xs text-indigo-700 font-bold uppercase tracking-wider">Total Jam: {{ selectedSubject ? getSubjectTotalHours(selectedSubject.id) : 0 }}</span>
          </div>
        </div>
        
        <div class="overflow-y-auto flex-1 p-6 bg-gray-50/50">
          <div v-if="!selectedSubject" class="h-full flex flex-col items-center justify-center text-gray-400">
            <svg class="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            <p>Silakan pilih mata pelajaran di panel kiri untuk mengatur alokasi jam kelas.</p>
          </div>
          
          <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div v-for="cls in classes" :key="cls.id" class="bg-white rounded-xl border p-4 shadow-sm transition-all flex flex-col justify-between"
                 :class="getAllocation(cls.id, selectedSubject.id) > 0 ? 'border-indigo-300 ring-1 ring-indigo-50' : 'border-gray-200 hover:border-gray-300'">
              
              <h4 class="font-bold text-gray-800 text-sm mb-4">{{ cls.name }}</h4>
              
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-gray-500 uppercase">Jam per Pekan</span>
                <div class="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-0.5">
                  <button @click="updateAllocation(cls.id, selectedSubject.id, -1)" class="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-white hover:text-red-500 hover:shadow-sm transition-all disabled:opacity-30" :disabled="getAllocation(cls.id, selectedSubject.id) <= 0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M20 12H4"></path></svg>
                  </button>
                  <span class="w-10 text-center font-black text-gray-700 text-sm">{{ getAllocation(cls.id, selectedSubject.id) }}</span>
                  <button @click="updateAllocation(cls.id, selectedSubject.id, 1)" class="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-white hover:text-green-500 hover:shadow-sm transition-all">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"></path></svg>
                  </button>
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
import { ref, onMounted, computed, watch } from 'vue'
import { SafeFlow } from '../core/SafeFlow.js'

const loading = ref(true)
const saving = ref(false)
const viewMode = ref('byClass') // 'byClass' or 'bySubject'

const classes = ref([])
const subjects = ref([])
const allocations = ref({}) // Format: { "classId_subjectId": hours }

const selectedClass = ref(null)
const selectedSubject = ref(null)

const schoolId = localStorage.getItem('school_id')

const fetchData = async () => {
  loading.value = true
  try {
    // 1. Fetch Classes
    const resClasses = await SafeFlow.fetch('/api/v1/school/classes', {
      headers: { 'X-School-ID': schoolId || '' }
    })
    
    // 2. Fetch Subjects
    const resSubjects = await SafeFlow.fetch('/api/v1/school/subjects', {
      headers: { 'X-School-ID': schoolId || '' }
    })
    
    // 3. Fetch current allocations
    const resAlloc = await SafeFlow.fetch('/api/v1/school/allocations', {
      headers: { 'X-School-ID': schoolId || '' }
    })
    
    if (resClasses.ok) classes.value = (await resClasses.json()) || []
    if (resSubjects.ok) subjects.value = (await resSubjects.json()) || []
    
    if (resAlloc.ok) {
      const data = await resAlloc.json()
      const allocMap = {}
      if (data && Array.isArray(data)) {
        data.forEach(item => {
          allocMap[`${item.class_id}_${item.subject_id}`] = item.allocated_hours
        })
      }
      allocations.value = allocMap
    }
    
    if (classes.value.length > 0) selectedClass.value = classes.value[0]
    if (subjects.value.length > 0) selectedSubject.value = subjects.value[0]
    
  } catch (err) {
    console.error("Error fetching allocation data", err)
  } finally {
    loading.value = false
  }
}

const getAllocation = (classId, subjectId) => {
  return allocations.value[`${classId}_${subjectId}`] || 0
}

const updateAllocation = (classId, subjectId, change) => {
  const key = `${classId}_${subjectId}`
  const current = allocations.value[key] || 0
  const newVal = current + change
  if (newVal >= 0) {
    allocations.value[key] = newVal
  }
}

const getClassTotalHours = (classId) => {
  let total = 0
  subjects.value.forEach(sub => {
    total += getAllocation(classId, sub.id)
  })
  return total
}

const getSubjectTotalHours = (subjectId) => {
  let total = 0
  classes.value.forEach(cls => {
    total += getAllocation(cls.id, subjectId)
  })
  return total
}

const saveAllocation = async () => {
  saving.value = true
  
  // Ubah Map menjadi array untuk API
  const payload = []
  Object.keys(allocations.value).forEach(key => {
    const [classId, subjectId] = key.split('_')
    const hours = allocations.value[key]
    if (hours > 0) {
      payload.push({
        class_id: classId,
        subject_id: subjectId,
        allocated_hours: hours
      })
    }
  })
  
  try {
    const res = await SafeFlow.fetch('/api/v1/school/allocations', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-School-ID': schoolId || ''
      },
      body: JSON.stringify({ allocations: payload })
    })
    
    if (res.ok || res.safeflow_queued) {
      alert("Alokasi jam pelajaran berhasil disimpan!")
    } else {
      alert("Gagal menyimpan alokasi jam.")
    }
  } catch (err) {
    console.error(err)
    alert("Terjadi kesalahan sistem.")
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* Scrollbar modern untuk sidebar dan panel dalam */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #e2e8f0;
  border-radius: 20px;
}
</style>
