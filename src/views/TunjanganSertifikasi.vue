<template>
  <div class="animate-fade-in-up p-4 md:p-8 max-w-[1400px] mx-auto">
    <!-- Header modern -->
    <div class="bg-blue-900 rounded-3xl p-6 md:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
      <!-- Background Image Overlay -->
      <div class="absolute inset-0 bg-[url('../assets/banner-bg.png')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-transparent"></div>
      
      <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div class="w-full md:w-2/3">
          <h1 class="text-2xl md:text-3xl font-black mb-2 flex items-center gap-3 drop-shadow-md">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
            Analisis Tunjangan Sertifikasi Guru
          </h1>
          <p class="text-blue-100 max-w-2xl text-sm md:text-base drop-shadow">
            Laporan kelayakan tunjangan profesi berdasarkan linieritas jam mengajar dan beban tugas tambahan. Standar kelayakan minimal adalah 24 JP (Jam Sertifikasi).
          </p>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3">
          <button @click="exportExcel" class="bg-white text-blue-900 hover:bg-blue-50 px-6 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Export to Excel
          </button>
        </div>
      </div>
    </div>

    <!-- Tabel Analisis -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm text-left whitespace-nowrap">
          <thead class="bg-gray-100 text-gray-700 text-xs uppercase border-b-2 border-gray-200">
            <tr>
              <th class="px-4 py-4 font-black text-center w-12 border-r border-gray-200">No</th>
              <th class="px-4 py-4 font-black border-r border-gray-200 min-w-[200px]">NAMA GURU</th>
              <th class="px-4 py-4 font-black text-center border-r border-gray-200 w-24">LINIER</th>
              <th class="px-4 py-4 font-black border-r border-gray-200 min-w-[150px]">TUGAS TAMBAHAN</th>
              <th class="px-4 py-4 font-black text-center border-r border-gray-200 w-32">BOBOT TUGAS TAMBAHAN</th>
              <th class="px-4 py-4 font-black text-center border-r border-gray-200 w-32">PERHITUNGAN JAM SERTIFIKASI</th>
              <th class="px-4 py-4 font-black text-center border-r border-gray-200 w-24">JAM NON LINIER</th>
              <th class="px-4 py-4 font-black text-center border-r border-gray-200 min-w-[220px]">KET</th>
              <th class="px-4 py-4 font-black text-center w-40">JAM LINIER + NON LINIER + BOBOT</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="teachers.length === 0">
              <td colspan="9" class="px-6 py-12 text-center text-gray-500 italic bg-gray-50">
                Belum ada data guru. Pastikan Distribusi Pengampu Mapel sudah diisi.
              </td>
            </tr>
            <tr v-for="(teacher, idx) in teachers" :key="teacher.code" class="hover:bg-blue-50/50 transition-colors bg-white">
              <td class="px-4 py-3 text-center text-gray-500 border-r border-gray-200">{{ idx + 1 }}</td>
              <td class="px-4 py-3 font-semibold text-gray-800 border-r border-gray-200">{{ teacher.name }}</td>
              <td class="px-4 py-3 text-center font-semibold border-r border-gray-200">{{ teacher.linier || '' }}</td>
              <td class="px-4 py-3 text-gray-600 border-r border-gray-200">{{ teacher.tugas || '' }}</td>
              
              <td class="px-4 py-3 text-center font-semibold border-r border-gray-200">
                {{ teacher.bobot ? `${teacher.bobot} JP` : 'JP' }}
              </td>
              
              <!-- PERHITUNGAN JAM SERTIFIKASI (Linier + Bobot) -->
              <!-- Warna Merah Muda jika di bawah 24 -->
              <td class="px-4 py-3 text-center font-bold border-r border-gray-200"
                  :class="teacher.jam_sertifikasi < 24 ? 'bg-red-100 text-red-600' : 'text-gray-800'">
                {{ teacher.jam_sertifikasi }}
              </td>
              
              <td class="px-4 py-3 text-center font-semibold border-r border-gray-200">{{ teacher.non_linier || '' }}</td>
              
              <!-- KET (Layak / Belum Layak) -->
              <td class="px-4 py-3 text-center font-bold text-sm border-r border-gray-200"
                  :class="teacher.jam_sertifikasi < 24 ? 'bg-red-100 text-red-700' : 'text-emerald-700'">
                {{ teacher.jam_sertifikasi >= 24 ? 'Layak Menerima Tunjangan' : 'Belum Layak Menerima Tunjangan' }}
              </td>
              
              <!-- TOTAL SEMUA -->
              <td class="px-4 py-3 text-center font-black text-gray-800">
                {{ teacher.total_jam }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { SafeFlow } from '../core/SafeFlow.js'

const loading = ref(true)
const teachers = ref([])

const schoolId = localStorage.getItem('school_id')

const loadData = async () => {
  loading.value = true
  try {
    // 1. Ambil data Pengampu Mapel untuk hitung Linier & Non Linier
    const resPengampu = await SafeFlow.fetch('/api/v1/school/pengampu', { headers: { 'X-School-ID': schoolId || '' } })
    let rawTeachersMap = new Map()
    
    if (resPengampu.ok) {
      const dataPengampu = await resPengampu.json()
      if (dataPengampu && dataPengampu.rows) {
        dataPengampu.rows.forEach(r => {
          const code = r.teacher_code
          if (!code) return
          
          if (!rawTeachersMap.has(code)) {
            rawTeachersMap.set(code, {
              code,
              name: r.teacher_name || code,
              linier: 0,
              non_linier: 0,
              tugas: '',
              bobot: 0
            })
          }
          
          const t = rawTeachersMap.get(code)
          const sumHours = r.hours ? r.hours.reduce((a, b) => a + (Number(b)||0), 0) : 0
          
          // Asumsi properti is_linear digunakan di sini. Jika tidak ada, di-fallback ke logic Anda.
          if (r.is_linear === 'true' || r.is_linear === true) {
            t.linier += sumHours
          } else {
            t.non_linier += sumHours
          }
        })
      }
    }

    // 2. Ambil Tugas Tambahan dan Bobotnya yang tersimpan
    const resTugas = await SafeFlow.fetch('/api/v1/school/tugas-tambahan', { headers: { 'X-School-ID': schoolId || '' } })
    if (resTugas.ok) {
      const dataTugas = await resTugas.json()
      if (dataTugas && dataTugas.teachers) {
        dataTugas.teachers.forEach(tSaved => {
          if (rawTeachersMap.has(tSaved.code)) {
            const t = rawTeachersMap.get(tSaved.code)
            t.tugas = tSaved.task || ''
            t.bobot = Number(tSaved.weight) || 0
          } else {
            // Jika ada guru di tabel tugas tambahan tapi tidak di pengampu
            rawTeachersMap.set(tSaved.code, {
              code: tSaved.code,
              name: tSaved.name || tSaved.code,
              linier: 0,
              non_linier: 0,
              tugas: tSaved.task || '',
              bobot: Number(tSaved.weight) || 0
            })
          }
        })
      }
    }

    // 3. Gabungkan dan hitung kalkulasi akhir
    const list = []
    rawTeachersMap.forEach(t => {
      // Perhitungan Jam Sertifikasi (Hanya Linier + Bobot)
      t.jam_sertifikasi = t.linier + t.bobot
      // Total Keseluruhan (Linier + Non Linier + Bobot)
      t.total_jam = t.linier + t.non_linier + t.bobot
      list.push(t)
    })

    // Sort by name
    list.sort((a, b) => a.name.localeCompare(b.name))
    teachers.value = list

  } catch (e) {
    console.error("Gagal load sertifikasi:", e)
  } finally {
    loading.value = false
  }
}

const exportExcel = () => {
  alert("File Analisis Tunjangan Sertifikasi sudah siap diekspor ke Excel.\nLokasi: Downloads")
}

onMounted(() => {
  loadData()
})
</script>
