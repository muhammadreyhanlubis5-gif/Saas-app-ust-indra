<template>
  <div class="dashboard-validation p-6 bg-gray-50 min-h-screen font-sans">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 border-b-4 border-red-600 pb-2 inline-block">
        Sistem Informasi Penjadwalan Sekolah
      </h1>
      <p class="text-gray-600 mt-2">Validasi & Distribusi Jadwal (Dashboard Sync Status)</p>
    </header>

    <div v-if="loading" class="text-center py-10">
      <p class="text-gray-500 text-lg">Memuat data sinkronisasi...</p>
    </div>

    <div v-else>
      <!-- Main Validation (Alokasi vs Distribusi) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Alokasi Kurikulum -->
        <div class="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500 flex flex-col justify-center items-center">
          <h2 class="text-md font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Alokasi Jam</h2>
          <p class="text-5xl font-bold text-blue-600">
            {{ validation.totalAlokasiJam }} <span class="text-2xl text-gray-400 font-medium">JP</span>
          </p>
          <p class="text-xs text-gray-400 mt-2">Berdasarkan Kurikulum & Rombel</p>
        </div>

        <!-- Indikator Balance / Sinkronisasi -->
        <div class="flex items-center justify-center p-4">
          <div class="text-center w-full">
            <div 
              class="p-6 rounded-xl shadow-inner border-2 transition-all duration-300"
              :class="isBalanced ? 'bg-green-50 border-green-400 text-green-700' : 'bg-red-50 border-red-400 text-red-700'"
            >
              <div v-if="isBalanced">
                <svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <h3 class="font-bold text-xl uppercase tracking-wider">Seimbang</h3>
                <p class="text-sm mt-2 opacity-80">Distribusi jam 100% cocok.</p>
                <button class="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow">
                  Lanjutkan Input Jadwal
                </button>
              </div>
              <div v-else>
                <svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <h3 class="font-bold text-xl uppercase tracking-wider">Belum Seimbang</h3>
                <p class="text-sm mt-2 opacity-80">Periksa kembali distribusi jam.</p>
                <p class="text-lg font-semibold mt-1">Selisih: {{ Math.abs(validation.totalAlokasiJam - validation.totalJamTerdistribusi) }} JP</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Terdistribusi ke Guru -->
        <div class="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500 flex flex-col justify-center items-center">
          <h2 class="text-md font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Terdistribusi</h2>
          <p class="text-5xl font-bold text-green-600">
            {{ validation.totalJamTerdistribusi }} <span class="text-2xl text-gray-400 font-medium">JP</span>
          </p>
          <p class="text-xs text-gray-400 mt-2">Beban Mengajar & Tugas Tambahan</p>
        </div>
      </div>

      <!-- Validasi Missing Input -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <!-- Missing Teachers -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-semibold text-gray-800">Validasi Input Guru</h3>
            <span 
              class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              :class="validation.missingTeachers.length === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
            >
              {{ validation.missingTeachers.length === 0 ? '100% Terinput' : 'Ada yang kurang' }}
            </span>
          </div>
          <p class="text-gray-500 text-sm mb-3">Kode Guru yang belum masuk jadwal:</p>
          <div v-if="validation.missingTeachers.length > 0" class="flex flex-wrap gap-2">
            <span v-for="code in validation.missingTeachers" :key="code" class="bg-red-50 text-red-600 px-3 py-1 rounded-md border border-red-200 text-sm font-medium">
              {{ code }}
            </span>
          </div>
          <div v-else class="text-3xl font-bold text-gray-300">0</div>
        </div>

        <!-- Missing Subjects -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
           <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-semibold text-gray-800">Validasi Input Mapel</h3>
            <span 
              class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              :class="validation.missingSubjects.length === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
            >
              {{ validation.missingSubjects.length === 0 ? '100% Terinput' : 'Ada yang kurang' }}
            </span>
          </div>
          <p class="text-gray-500 text-sm mb-3">Kode Mapel yang belum didistribusikan:</p>
          <div v-if="validation.missingSubjects.length > 0" class="flex flex-wrap gap-2">
            <span v-for="code in validation.missingSubjects" :key="code" class="bg-red-50 text-red-600 px-3 py-1 rounded-md border border-red-200 text-sm font-medium">
              {{ code }}
            </span>
          </div>
          <div v-else class="text-3xl font-bold text-gray-300">0</div>
        </div>
      </div>

      <!-- Master Data Summary -->
      <div class="bg-gray-800 text-white rounded-xl shadow-lg p-6">
        <h3 class="text-center text-gray-400 text-sm uppercase tracking-widest mb-4">Ringkasan Data Master Semester Genap 2026/2027</h3>
        <div class="flex flex-wrap justify-around items-center">
          <div class="text-center px-4 border-r border-gray-700 last:border-0 flex-1">
            <p class="text-4xl font-black text-red-500 mb-1">{{ summary.totalTeachers }}</p>
            <p class="text-sm text-gray-300 font-medium">Jumlah Guru</p>
          </div>
          <div class="text-center px-4 border-r border-gray-700 last:border-0 flex-1">
            <p class="text-4xl font-black text-red-500 mb-1">{{ summary.totalClasses }}</p>
            <p class="text-sm text-gray-300 font-medium">Jumlah Kelas</p>
          </div>
          <div class="text-center px-4 last:border-0 flex-1">
            <p class="text-4xl font-black text-red-500 mb-1">{{ summary.totalSubjects }}</p>
            <p class="text-sm text-gray-300 font-medium">Jumlah Mapel</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
// import axios from 'axios' // Misal kita pakai axios untuk HTTP client

const loading = ref(true)

// Reactive State untuk data dashboard
const validation = ref({
  totalAlokasiJam: 0,
  totalJamTerdistribusi: 0,
  missingTeachers: [],
  missingSubjects: [],
})

const summary = ref({
  totalTeachers: 0,
  totalClasses: 0,
  totalSubjects: 0
})

// Computed logic untuk mengecek balance
const isBalanced = computed(() => {
  return validation.value.totalAlokasiJam === validation.value.totalJamTerdistribusi && 
         validation.value.totalAlokasiJam > 0
})

// Fetch Data dari Go Backend API
const fetchDashboardData = async () => {
  loading.value = true
  try {
    // Simulasi pemanggilan API ke endpoint Go: GET /api/v1/dashboard/validation
    /* 
    const response = await axios.get('http://localhost:8080/api/v1/dashboard/validation')
    validation.value = response.data.validation
    summary.value = response.data.summary
    */

    // MOCK DATA RESPONSE (Menyesuaikan dengan contoh Excel macro di image)
    setTimeout(() => {
      validation.value = {
        totalAlokasiJam: 726,
        totalJamTerdistribusi: 726,
        missingTeachers: [],
        missingSubjects: []
      }
      summary.value = {
        totalTeachers: 44,
        totalClasses: 18,
        totalSubjects: 45
      }
      loading.value = false
    }, 800) // Delay simulasi network

  } catch (error) {
    console.error("Gagal mengambil data dashboard:", error)
    loading.value = false
  }
}

// Panggil fungsi fetch ketika komponen dimounting ke DOM
onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
/* Anda bisa menggunakan Tailwind CSS atau menambahkan style scoped di sini */
.dashboard-validation {
  /* contoh background pattern halus jika diperlukan */
}
</style>
