<template>
  <div class="max-w-[1400px] mx-auto p-2">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Tahap 4: Tugas Tambahan Guru</h1>
        <p class="text-gray-500 text-sm">Alokasi tugas tambahan dan perhitungan ekuivalen jam sertifikasi.</p>
      </div>
      <button @click="saveData" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow-md transition-all flex items-center gap-2">
        <span>Simpan Data</span>
      </button>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
      
      <!-- Tabel Kiri: Input Tugas Tambahan -->
      <div class="xl:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div class="bg-gray-800 p-3 text-center border-b border-gray-700">
          <h2 class="text-sm font-bold text-white uppercase">Silahkan Diisi Data Tugas Tambahan Guru Beserta Bobotnya</h2>
        </div>
        <div class="overflow-x-auto custom-scrollbar flex-1">
          <table class="w-full text-sm text-left whitespace-nowrap">
            <thead class="bg-gray-900 text-gray-100 text-xs uppercase sticky top-0 z-20">
              <tr>
                <th class="px-3 py-3 border-r border-gray-700 font-bold text-center w-10">No</th>
                <th class="px-3 py-3 border-r border-gray-700 font-bold text-center">Kode</th>
                <th class="px-4 py-3 border-r border-gray-700 font-bold w-48">Nama</th>
                <th class="px-4 py-3 border-r border-gray-700 font-bold text-yellow-300 w-48 bg-gray-800">Tugas Tamb</th>
                <th class="px-2 py-3 border-r border-gray-700 font-bold text-yellow-300 text-center w-20 bg-gray-800">Bobot</th>
                <th class="px-3 py-3 border-r border-gray-700 font-bold text-center w-16">Linier</th>
                <th class="px-3 py-3 border-r border-gray-700 font-bold text-center w-24 text-blue-300">Jam Sertifikasi</th>
                <th class="px-3 py-3 border-r border-gray-700 font-bold text-center w-20 text-red-300">Non Linier</th>
                <th class="px-3 py-3 font-bold text-center w-20">Total JTM</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-if="teachers.length === 0">
                <td colspan="9" class="px-6 py-8 text-center text-gray-500 italic bg-gray-50">
                  Data pengampu mapel masih kosong. Silakan isi Tahap 3 terlebih dahulu.
                </td>
              </tr>
              <tr v-for="(teacher, idx) in teachers" :key="teacher.code" class="hover:bg-blue-50/30 transition-colors">
                <td class="px-3 py-2 border-r border-gray-200 text-center font-medium text-gray-500 bg-gray-50">{{ idx + 1 }}</td>
                <td class="px-3 py-2 border-r border-gray-200 text-center font-bold text-gray-700 bg-gray-50">{{ teacher.code }}</td>
                <td class="px-3 py-2 border-r border-gray-200 font-medium text-gray-800 bg-white">{{ teacher.name }}</td>
                <td class="px-1 py-1 border-r border-gray-200 bg-yellow-50">
                  <select v-model="teacher.tugas_tambahan" class="w-full bg-white border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 font-medium">
                    <option value="">- Tidak Ada -</option>
                    <option v-for="tugas in summaryTasks" :key="tugas.name" :value="tugas.name">{{ tugas.name }}</option>
                  </select>
                </td>
                <td class="px-1 py-1 border-r border-gray-200 bg-yellow-50">
                  <input type="number" min="0" v-model.number="teacher.bobot" class="w-full bg-white border border-gray-300 rounded px-1 py-1.5 text-sm text-center focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-800">
                </td>
                <td class="px-3 py-2 border-r border-gray-200 text-center font-bold text-gray-800 bg-gray-50">{{ teacher.linier }}</td>
                <td class="px-3 py-2 border-r border-gray-200 text-center font-black text-white bg-blue-600 shadow-inner">
                  {{ (teacher.linier || 0) + (teacher.bobot || 0) }}
                </td>
                <td class="px-3 py-2 border-r border-gray-200 text-center font-bold text-white bg-red-600 shadow-inner">
                  {{ teacher.non_linier }}
                </td>
                <td class="px-3 py-2 text-center font-black text-gray-800 bg-gray-100">
                  {{ (teacher.linier || 0) + (teacher.non_linier || 0) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tabel Kanan: Kesimpulan -->
      <div class="xl:col-span-4 bg-gray-900 rounded-2xl shadow-xl border border-gray-800 overflow-hidden flex flex-col text-gray-200">
        <div class="bg-black p-3 text-center border-b border-gray-700">
          <h2 class="text-sm font-bold text-white uppercase tracking-wider">Kesimpulan Tugas Tambahan</h2>
        </div>
        <div class="overflow-x-auto flex-1">
          <table class="w-full text-xs text-left">
            <thead class="bg-gray-800 text-gray-400 uppercase">
              <tr>
                <th class="px-2 py-3 border-b border-gray-700 text-center w-8">No</th>
                <th class="px-3 py-3 border-b border-gray-700">Uraian</th>
                <th class="px-2 py-3 border-b border-gray-700 text-center text-blue-400">Terdata</th>
                <th class="px-2 py-3 border-b border-gray-700 text-center text-yellow-400">Kebutuhan</th>
                <th class="px-3 py-3 border-b border-gray-700">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800">
              <tr v-for="(task, idx) in summaryTasks" :key="task.name" class="hover:bg-gray-800/50">
                <td class="px-2 py-2 text-center text-gray-500">{{ idx + 1 }}</td>
                <td class="px-3 py-2 font-bold text-gray-300">{{ task.name }}</td>
                
                <!-- Terdata -->
                <td class="px-2 py-2 text-center">
                  <div class="inline-flex items-center justify-center min-w-[32px] h-6 rounded bg-blue-900/50 text-blue-300 font-bold">
                    {{ countTask(task.name) }}
                  </div>
                </td>
                
                <!-- Kebutuhan -->
                <td class="px-2 py-2 text-center">
                  <input type="number" min="0" v-model.number="task.required" class="w-12 bg-gray-800 border border-gray-600 rounded px-1 py-1 text-center text-yellow-400 font-bold focus:outline-none focus:border-yellow-500">
                </td>
                
                <!-- Status Kesimpulan -->
                <td class="px-3 py-2 text-[10px] font-bold leading-tight">
                  <span v-if="countTask(task.name) < task.required" class="text-red-400 uppercase">
                    Silahkan Pilih Guru Sebagai {{ task.name }} (Kurang)
                  </span>
                  <span v-else-if="countTask(task.name) > task.required" class="text-orange-400 uppercase">
                    Tugas Berlebih (Kelebihan)
                  </span>
                  <span v-else class="text-emerald-400 uppercase">
                    Tugas Tambahan Sudah Sesuai Kebutuhan
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const schoolId = localStorage.getItem('school_id')
const teachers = ref([])

// Daftar Tugas Tambahan Default
const summaryTasks = ref([
  { name: 'Kepala Sekolah', required: 1 },
  { name: 'Wakil Kepala Sekolah', required: 4 },
  { name: 'Wali Kelas', required: 10 },
  { name: 'Kepala Laboratorium', required: 1 },
  { name: 'Kepala Perpustakaan', required: 1 },
  { name: 'Pembina Pramuka', required: 1 },
  { name: 'Pembina OSIS', required: 1 },
  { name: 'Guru Piket', required: 5 },
])

const countTask = (taskName) => {
  return teachers.value.filter(t => t.tugas_tambahan === taskName).length
}

const loadData = async () => {
  try {
    // 1. Ambil data Pengampu Mapel (untuk mendapatkan Linier/Non Linier asli)
    const resPengampu = await fetch('/api/v1/school/pengampu', { headers: { 'X-School-ID': schoolId || '' } })
    let rawTeachersMap = new Map() // kode -> { linier, non_linier, name }
    
    if (resPengampu.ok) {
      const dataPengampu = await resPengampu.json()
      if (dataPengampu && dataPengampu.rows) {
        dataPengampu.rows.forEach(r => {
          if (!r.teacher_code) return
          const code = r.teacher_code.toUpperCase()
          
          if (!rawTeachersMap.has(code)) {
            rawTeachersMap.set(code, {
              code,
              name: r.teacher_name || code,
              linier: 0,
              non_linier: 0
            })
          }
          
          const t = rawTeachersMap.get(code)
          const sumHours = r.hours ? r.hours.reduce((a, b) => a + (Number(b)||0), 0) : 0
          
          if (r.is_linear === 'true') {
            t.linier += sumHours
          } else {
            t.non_linier += sumHours
          }
        })
      }
    }

    // 2. Ambil data Tugas Tambahan yang pernah disimpan
    const resTugas = await fetch('/api/v1/school/tugas-tambahan', { headers: { 'X-School-ID': schoolId || '' } })
    if (resTugas.ok) {
      const dataTugas = await resTugas.json()
      
      // Jika ada data kesimpulan (kebutuhan) yang pernah disimpan
      if (dataTugas && dataTugas.summaryTasks) {
        summaryTasks.value = dataTugas.summaryTasks
      }

      // Gabungkan data bobot & tugas tambahan ke dalam map guru
      if (dataTugas && dataTugas.teachers) {
        dataTugas.teachers.forEach(savedT => {
          if (rawTeachersMap.has(savedT.code)) {
            const t = rawTeachersMap.get(savedT.code)
            t.tugas_tambahan = savedT.tugas_tambahan || ''
            t.bobot = savedT.bobot || 0
          }
        })
      }
    }

    // Finalize teachers array
    const finalTeachers = Array.from(rawTeachersMap.values())
    finalTeachers.forEach(t => {
      if (t.tugas_tambahan === undefined) t.tugas_tambahan = ''
      if (t.bobot === undefined) t.bobot = 0
    })
    
    teachers.value = finalTeachers.sort((a,b) => a.code.localeCompare(b.code))
    
  } catch (err) {
    console.error("Gagal load data:", err)
  }
}

const saveData = async () => {
  try {
    const payload = {
      summaryTasks: summaryTasks.value,
      teachers: teachers.value.map(t => ({
        code: t.code,
        tugas_tambahan: t.tugas_tambahan,
        bobot: t.bobot
      }))
    }
    
    const res = await fetch('/api/v1/school/tugas-tambahan', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-School-ID': schoolId || '' },
      body: JSON.stringify(payload)
    })
    
    if (res.ok) {
      alert("Data Tugas Tambahan berhasil disimpan!")
    } else {
      alert("Gagal menyimpan data")
    }
  } catch (err) {
    alert("Terjadi kesalahan jaringan")
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
</style>
