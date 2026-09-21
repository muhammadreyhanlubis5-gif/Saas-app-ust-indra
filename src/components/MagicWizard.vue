<template>
  <div v-if="show" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8 font-sans overflow-y-auto">
    
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100">
      
      <!-- HEADER -->
      <div class="bg-gradient-to-r from-blue-900 to-indigo-900 p-6 flex justify-between items-center flex-shrink-0 text-white">
        <div>
          <h2 class="text-2xl font-black tracking-tight">Setup Cerdas (1-Click Auto Generate)</h2>
          <p class="text-blue-200 text-sm mt-1">Sistem akan menyusun seluruh jadwal sekolah Anda secara ajaib.</p>
        </div>
        <button @click="$emit('close')" class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- PROGRESS BAR -->
      <div class="flex border-b border-gray-100 bg-gray-50 flex-shrink-0">
        <button @click="step = 1" class="flex-1 py-4 text-center text-sm font-bold border-b-4 transition-colors" :class="step >= 1 ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400'">
          1. Profil Pimpinan
        </button>
        <button @click="step >= 2 ? step = 2 : null" class="flex-1 py-4 text-center text-sm font-bold border-b-4 transition-colors" :class="step >= 2 ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400'">
          2. Algoritma Waktu
        </button>
        <button @click="step >= 3 ? step = 3 : null" class="flex-1 py-4 text-center text-sm font-bold border-b-4 transition-colors" :class="step >= 3 ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400'">
          3. Beban Mengajar
        </button>
      </div>

      <!-- BODY -->
      <div class="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
        
        <!-- STEP 1: PROFIL -->
        <div v-show="step === 1" class="space-y-6 max-w-2xl mx-auto animate-fade-in">
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800">Penandatangan Jadwal</h3>
            <p class="text-sm text-gray-500">Data ini akan tercetak otomatis di bagian bawah lembar jadwal.</p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Kepala Sekolah</label>
              <input v-model="profile.headmaster_name" type="text" class="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: Bapak Budi Santoso, S.Pd.">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Wakil Kepala Sekolah Bid. Kurikulum</label>
              <input v-model="profile.vice_headmaster_name" type="text" class="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: Ibu Siti Aminah, M.Pd.">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Sekretaris Panitia (Opsional)</label>
              <input v-model="profile.secretary_name" type="text" class="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: Andi Wijaya, S.Kom.">
            </div>
          </div>
        </div>

        <!-- STEP 2: WAKTU -->
        <div v-show="step === 2" class="space-y-8 max-w-3xl mx-auto animate-fade-in">
          <div class="text-center mb-6">
            <h3 class="text-xl font-bold text-gray-800">Auto-Generate Matriks Waktu</h3>
            <p class="text-sm text-gray-500">Sistem akan menyusun jam ke-1 sampai ke-X secara otomatis. Anda tidak perlu membuat sesi manual satu per satu.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Hari Aktif Sekolah</label>
                <div class="flex flex-wrap gap-2">
                  <label v-for="day in ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu']" :key="day" class="cursor-pointer">
                    <input type="checkbox" :value="day" v-model="timeConfig.activeDays" class="hidden peer">
                    <div class="px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 border-gray-200 text-gray-500 hover:border-blue-300">
                      {{ day }}
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Total Jam/Les Per Hari</label>
                <input v-model.number="timeConfig.totalLes" type="number" class="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: 8">
              </div>
            </div>

            <div class="space-y-4 bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <div>
                <label class="block text-sm font-bold text-blue-900 mb-1">Pukul Berapa Bel Masuk?</label>
                <input v-model="timeConfig.jamMasuk" type="time" class="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-mono">
              </div>
              <div class="flex gap-4">
                <div class="flex-1">
                  <label class="block text-sm font-bold text-blue-900 mb-1">Durasi 1 Les (Menit)</label>
                  <input v-model.number="timeConfig.durasiMenit" type="number" class="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
                </div>
                <div class="flex-1">
                  <label class="block text-sm font-bold text-blue-900 mb-1">Istirahat di Les Ke-</label>
                  <input v-model.number="timeConfig.istirahatDiLes" type="number" class="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: 4">
                </div>
                <div class="flex-1">
                  <label class="block text-sm font-bold text-blue-900 mb-1">Durasi Istirahat</label>
                  <input v-model.number="timeConfig.istirahatMenit" type="number" class="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Menit">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 3: GURU & BEBAN -->
        <div v-show="step === 3" class="space-y-6 animate-fade-in">
          
          <div class="flex flex-col md:flex-row md:items-end gap-4 bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
            <div class="flex-1">
              <label class="block text-sm font-bold text-indigo-900 mb-1">Daftar Kelas (Pisahkan dengan Koma)</label>
              <input v-model="classesInput" type="text" class="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Cth: 4 TM, 4 MAPK, 5 IPA, 6 IPS">
            </div>
            <button @click="parseClasses" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all h-[50px]">
              Terapkan Kelas
            </button>
          </div>

          <div v-if="classes.length > 0">
            <div class="flex justify-between items-end mb-2">
              <h3 class="font-bold text-gray-800">Distribusi Guru & Mapel</h3>
              <button @click="addTeacher" class="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-1.5 px-4 rounded-lg transition-colors flex items-center gap-1">
                + Tambah Baris Guru
              </button>
            </div>
            
            <div class="overflow-x-auto border border-gray-200 rounded-2xl custom-scrollbar pb-2">
              <table class="w-full text-sm text-left">
                <thead class="bg-gray-100 text-gray-600 text-xs uppercase font-bold sticky top-0">
                  <tr>
                    <th class="px-4 py-3 w-40 min-w-[160px]">Kode Guru</th>
                    <th class="px-4 py-3 w-64 min-w-[200px]">Nama Guru</th>
                    <th class="px-4 py-3 w-40 min-w-[160px]">Kode Mapel</th>
                    <th v-for="cls in classes" :key="cls" class="px-3 py-3 w-20 text-center border-l border-gray-200">
                      {{ cls }} <span class="block text-[10px] text-gray-400 font-normal">JP</span>
                    </th>
                    <th class="px-4 py-3 w-16 text-center border-l border-gray-200">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="(t, idx) in teachers" :key="idx" class="hover:bg-gray-50 group">
                    <td class="p-2"><input v-model="t.teacher_code" class="w-full bg-white border border-gray-300 rounded px-2 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none uppercase font-bold" placeholder="Cth: SB"></td>
                    <td class="p-2"><input v-model="t.teacher_name" class="w-full bg-white border border-gray-300 rounded px-2 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Cth: Saiful Bahri"></td>
                    <td class="p-2"><input v-model="t.subject_code" class="w-full bg-white border border-gray-300 rounded px-2 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none uppercase font-bold" placeholder="Cth: NAH"></td>
                    
                    <!-- Hours -->
                    <td v-for="(cls, cIdx) in classes" :key="cIdx" class="p-2 text-center border-l border-gray-100">
                      <input v-model.number="t.hours[cIdx]" type="number" min="0" class="w-12 bg-white border border-gray-300 rounded px-2 py-1.5 text-center focus:ring-1 focus:ring-blue-500 outline-none font-bold" :class="{'bg-blue-50 text-blue-700 border-blue-300': t.hours[cIdx] > 0}">
                    </td>

                    <td class="p-2 text-center border-l border-gray-100">
                      <button @click="teachers.splice(idx,1)" class="text-red-400 hover:text-red-600 bg-red-50 p-1.5 rounded transition-colors opacity-0 group-hover:opacity-100">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div v-if="teachers.length === 0" class="text-center py-10 bg-gray-50 border border-dashed border-gray-300 rounded-xl mt-4">
              <p class="text-gray-400 font-medium">Belum ada baris data guru.</p>
            </div>
          </div>
        </div>

      </div>

      <!-- FOOTER ACTIONS -->
      <div class="bg-white border-t border-gray-100 p-6 flex justify-between items-center flex-shrink-0">
        <button v-if="step > 1" @click="step--" class="text-gray-500 hover:text-gray-800 font-bold py-2 px-4 rounded-xl transition-colors">
          &larr; Kembali
        </button>
        <div v-else></div>

        <button v-if="step < 3" @click="step++" class="bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all">
          Lanjut ke Tahap {{ step + 1 }} &rarr;
        </button>
        <button v-if="step === 3" @click="generateMagic" :disabled="isGenerating" class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black py-3 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2 transform hover:scale-105" :class="{'opacity-75 cursor-not-allowed': isGenerating}">
          <svg v-if="isGenerating" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span v-if="!isGenerating">🪄 Susun Jadwal Sekarang!</span>
          <span v-else>Memproses Mahakarya...</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  show: Boolean
})
const emit = defineEmits(['close'])

const router = useRouter()
const step = ref(1)
const schoolId = localStorage.getItem('school_id')
const isGenerating = ref(false)

// Step 1
const profile = ref({
  headmaster_name: '',
  vice_headmaster_name: '',
  secretary_name: ''
})

// Step 2
const timeConfig = ref({
  activeDays: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
  jamMasuk: '07:30',
  durasiMenit: 40,
  istirahatDiLes: 4,
  istirahatMenit: 30,
  totalLes: 8
})

// Step 3
const classesInput = ref('')
const classes = ref([])
const teachers = ref([])

const parseClasses = () => {
  if (!classesInput.value.trim()) return
  classes.value = classesInput.value.split(',').map(s => s.trim()).filter(s => s.length > 0)
  
  // Reset existing teacher hours array length to match new classes
  teachers.value.forEach(t => {
    const newHours = new Array(classes.value.length).fill(0)
    for(let i=0; i<Math.min(t.hours.length, classes.value.length); i++){
      newHours[i] = t.hours[i]
    }
    t.hours = newHours
  })
}

const addTeacher = () => {
  teachers.value.push({
    teacher_code: '',
    teacher_name: '',
    subject_code: '',
    is_linear: true,
    hours: new Array(classes.value.length).fill(0)
  })
}

// Helpers for Step 2 Math
const timeToMins = (timeStr) => {
  if(!timeStr) return 0
  const [h, m] = timeStr.split(':')
  return parseInt(h) * 60 + parseInt(m)
}
const minsToTime = (mins) => {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

const generateSessionsMatrix = () => {
  const result = {}
  timeConfig.value.activeDays.forEach(day => {
    let currentMins = timeToMins(timeConfig.value.jamMasuk)
    const dayArr = []
    
    for(let i = 1; i <= timeConfig.value.totalLes; i++) {
      // Jika nyentuh index istirahat, insert istirahat dulu SEBELUM les ini
      if(i === timeConfig.value.istirahatDiLes + 1) { // Setelah les ke-istirahatDiLes selesai
        const endIst = currentMins + timeConfig.value.istirahatMenit
        dayArr.push({
          type: 'ISTIRAHAT',
          start_time: minsToTime(currentMins),
          end_time: minsToTime(endIst)
        })
        currentMins = endIst
      }
      
      const endLes = currentMins + timeConfig.value.durasiMenit
      dayArr.push({
        type: 'KBM',
        start_time: minsToTime(currentMins),
        end_time: minsToTime(endLes)
      })
      currentMins = endLes
    }
    result[day] = dayArr
  })
  return result
}

// THE ALGORITHM (Reused from InputJadwal)
const runAutoGenerate = (generatedSessions, generatedClasses, generatedPengampu) => {
  const currentSchedule = {} // { "SENIN-1-4 TM": { guru: "SB", mapel: "NAH" } }
  
  // Transform daySessions into flat available slots
  const allSlots = []
  for (const day in generatedSessions) {
    let kbmCount = 0
    generatedSessions[day].forEach(s => {
      if (s.type === 'KBM') {
        kbmCount++
        allSlots.push({ day, session: kbmCount.toString() })
      }
    })
  }

  // Parse Requirements
  const requirements = []
  generatedPengampu.forEach(row => {
    row.hours.forEach((hrs, classIdx) => {
      const cls = generatedClasses[classIdx]
      if (hrs > 0 && row.teacher_code && row.subject_code) {
        requirements.push({
          cls: cls,
          guru: row.teacher_code.toUpperCase(),
          mapel: row.subject_code.toUpperCase(),
          remaining: hrs
        })
      }
    })
  })

  // Heuristics Checkers
  const isClashing = (day, session, guru) => {
    const dayCap = day.toUpperCase()
    for (const cls of generatedClasses) {
      const key = `${dayCap}-${session}-${cls}`
      if (currentSchedule[key] && currentSchedule[key].guru === guru) {
        return true
      }
    }
    return false
  }

  const countTeacherHoursOnDay = (guru, day) => {
    let count = 0
    const dayCap = day.toUpperCase()
    for (const cls of generatedClasses) {
      for (const slot of allSlots) {
        if (slot.day.toUpperCase() === dayCap) {
          const key = `${dayCap}-${slot.session}-${cls}`
          if (currentSchedule[key] && currentSchedule[key].guru === guru) {
            count++
          }
        }
      }
    }
    return count
  }

  // Build
  requirements.sort(() => Math.random() - 0.5) // Acak awal
  
  requirements.forEach(r => {
    let unassigned = 0
    while (r.remaining > 0) {
      let validCells = []
      allSlots.forEach(slot => {
        const key = `${slot.day.toUpperCase()}-${slot.session}-${r.cls}`
        if (!currentSchedule[key]) {
          if (!isClashing(slot.day, slot.session, r.guru)) {
            validCells.push({ ...slot, cls: r.cls })
          }
        }
      })

      if (validCells.length === 0) {
        unassigned += r.remaining
        break // Deadlock
      }

      // Prioritaskan hari dengan jam terbang guru paling sedikit (Fatigue reduction)
      validCells.sort((a, b) => {
        const hA = countTeacherHoursOnDay(r.guru, a.day)
        const hB = countTeacherHoursOnDay(r.guru, b.day)
        if (hA !== hB) return hA - hB
        return Math.random() - 0.5 
      })

      let chosen = validCells[0]
      let key = `${chosen.day.toUpperCase()}-${chosen.session}-${chosen.cls}`
      currentSchedule[key] = { guru: r.guru, mapel: r.mapel }
      r.remaining--
    }
  })

  return currentSchedule
}

const generateMagic = async () => {
  if(teachers.value.length === 0) {
    alert("Mohon masukkan minimal 1 guru dan jam pelajarannya.")
    return
  }
  
  isGenerating.value = true
  try {
    const headers = { 'Content-Type': 'application/json', 'X-School-ID': schoolId || '' }
    
    // 1. UPDATE PROFILE
    await fetch('/api/v1/school/profile', {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        headmaster_name: profile.value.headmaster_name,
        vice_headmaster_name: profile.value.vice_headmaster_name,
        secretary_name: profile.value.secretary_name
      })
    })

    // 2. GENERATE & UPDATE SESSIONS
    const finalSessions = generateSessionsMatrix()
    await fetch('/api/v1/school/sessions', {
      method: 'PUT',
      headers,
      body: JSON.stringify({ sessions: finalSessions })
    })

    // 3. UPDATE PENGAMPU
    const pengampuPayload = {
      classes: classes.value,
      rows: teachers.value.map(t => ({
        teacher_code: t.teacher_code,
        teacher_name: t.teacher_name,
        subject_code: t.subject_code,
        is_linear: t.is_linear,
        hours: t.hours.map(h => Number(h) || 0)
      }))
    }
    await fetch('/api/v1/school/pengampu', {
      method: 'PUT',
      headers,
      body: JSON.stringify(pengampuPayload)
    })

    // 4. RUN AI AUTO-GENERATE
    const bestJadwal = runAutoGenerate(finalSessions, classes.value, pengampuPayload.rows)
    
    // 5. SAVE JADWAL
    const saveRes = await fetch('/api/v1/school/jadwal', {
      method: 'PUT',
      headers,
      body: JSON.stringify(bestJadwal)
    })
    
    if (saveRes.ok) {
      alert("🎉 Jadwal Berhasil Disusun Secara Ajaib!")
      emit('close')
      router.push('/admin-sekolah/jadwal-guru')
    } else {
      throw new Error("Gagal menyimpan jadwal ke database")
    }

  } catch (err) {
    console.error(err)
    alert("Terjadi kesalahan saat menyusun jadwal: " + err.message)
  } finally {
    isGenerating.value = false
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
