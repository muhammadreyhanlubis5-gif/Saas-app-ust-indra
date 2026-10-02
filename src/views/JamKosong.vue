<template>
  <div class="animate-fade-in-up p-4 md:p-8 max-w-[1400px] mx-auto w-full">
    
    <!-- Header modern -->
    <div class="bg-blue-900 rounded-3xl p-6 md:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
      <div class="absolute inset-0 bg-[url('../assets/banner-bg.png')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-transparent"></div>
      
      <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div class="w-full md:w-2/3">
          <h1 class="text-2xl md:text-3xl font-black mb-2 flex items-center gap-3 drop-shadow-md">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Permintaan Jam Kosong
          </h1>
          <p class="text-blue-100 max-w-2xl text-sm md:text-base drop-shadow">
            Atur waktu (hari & jam) dimana guru <b>tidak dapat mengajar</b>. Sistem penjadwalan otomatis akan menghindari penempatan jadwal pada waktu tersebut.
          </p>
        </div>
        
        <div class="flex gap-3">
          <button @click="saveData" :disabled="saving" class="bg-white text-blue-700 hover:bg-gray-50 px-6 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2">
            <svg v-if="saving" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span>{{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-500 font-medium">Memuat data guru dan sesi KBM...</p>
    </div>

    <!-- Teacher List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <div v-for="teacher in teachers" :key="teacher.code" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:border-blue-200 transition-colors flex flex-col justify-between">
        <div class="flex items-start gap-4 mb-4">
          <div class="w-12 h-12 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center font-black text-lg shadow-inner flex-shrink-0">
            {{ teacher.code }}
          </div>
          <div>
            <h3 class="font-bold text-gray-900 text-lg leading-tight">{{ teacher.name }}</h3>
            <p class="text-xs font-medium text-gray-500 mt-1 uppercase">{{ teacher.subject || 'Mapel Belum Diatur' }}</p>
          </div>
        </div>
        
        <div class="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
          <div class="text-sm font-bold" :class="getKosongCount(teacher.code) > 0 ? 'text-red-500' : 'text-gray-400'">
            {{ getKosongCount(teacher.code) }} Jam Kosong
          </div>
          <button @click="openModal(teacher)" class="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold py-1.5 px-4 rounded-lg text-sm transition-colors flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Atur Waktu
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Atur Waktu Kosong -->
    <div v-if="selectedTeacher" class="fixed inset-0 z-40 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm p-4 transition-opacity">
      <div class="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
        
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
          <div>
            <h3 class="font-black text-gray-900 text-xl">Atur Jam Kosong: {{ selectedTeacher.name }}</h3>
            <p class="text-sm text-gray-500 font-medium">Tandai (klik) sesi dimana guru ini tidak bisa mengajar.</p>
          </div>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 rounded-full p-2 transition-colors shadow-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="day in activeDays" :key="day" class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <h4 class="font-black text-gray-800 mb-3 border-b border-gray-100 pb-2 flex justify-between items-center">
                {{ day }}
                <span class="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">{{ daySessions[day].length }} Sesi</span>
              </h4>
              
              <div class="space-y-2">
                <div v-for="(session, sIdx) in daySessions[day]" :key="sIdx" class="flex items-center justify-between p-2 rounded-xl border transition-colors cursor-pointer" :class="isKosong(day, session.label, selectedTeacher.code) ? 'bg-red-50 border-red-200' : (session.type === 'ISTIRAHAT' ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed' : 'bg-white border-gray-100 hover:border-blue-300')" @click="toggleKosong(day, session.label, selectedTeacher.code, session.type)">
                  
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" :class="isKosong(day, session.label, selectedTeacher.code) ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'">
                      {{ session.label }}
                    </div>
                    <span class="text-sm font-bold" :class="isKosong(day, session.label, selectedTeacher.code) ? 'text-red-700' : 'text-gray-700'">
                      {{ session.type === 'ISTIRAHAT' ? 'ISTIRAHAT' : 'Les ' + session.label }}
                    </span>
                  </div>
                  
                  <div v-if="session.type !== 'ISTIRAHAT'">
                    <div class="w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors" :class="isKosong(day, session.label, selectedTeacher.code) ? 'bg-red-500 border-red-500' : 'border-gray-300'">
                      <svg v-if="isKosong(day, session.label, selectedTeacher.code)" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-100 bg-white shrink-0">
          <button @click="closeModal" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-transform transform hover:-translate-y-0.5">
            Selesai Mengatur
          </button>
        </div>

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
const saving = ref(false)
const showSuccessModal = ref(false)

const teachers = ref([])
const activeDays = ref([])
const daySessions = ref({})
const schoolId = localStorage.getItem('school_id')

// Modal State
const selectedTeacher = ref(null)

// Menyimpan data jam kosong: { 'Senin-1-MH': true, 'Senin-2-IS': true }
const jamKosongData = ref({})

const openModal = (teacher) => {
  selectedTeacher.value = teacher
}

const closeModal = () => {
  selectedTeacher.value = null
}

const isKosong = (day, sessionLabel, teacherCode) => {
  return !!jamKosongData.value[`${day}-${sessionLabel}-${teacherCode}`]
}

const toggleKosong = (day, sessionLabel, teacherCode, type) => {
  if (type === 'ISTIRAHAT') return // Istirahat is always free
  const key = `${day}-${sessionLabel}-${teacherCode}`
  if (jamKosongData.value[key]) {
    delete jamKosongData.value[key]
  } else {
    jamKosongData.value[key] = true
  }
}

const getKosongCount = (teacherCode) => {
  let count = 0;
  for (const key in jamKosongData.value) {
    if (key.endsWith(`-${teacherCode}`)) {
      count++;
    }
  }
  return count;
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
      teachers.value = [];
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
  saving.value = true
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
      showSuccessModal.value = true
    } else {
      alert("Gagal menyimpan jadwal kosong")
    }
  } catch (err) {
    alert("Terjadi kesalahan jaringan saat menyimpan")
  } finally {
    saving.value = false
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
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent; 
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1; 
  border-radius: 10px;
}
</style>
