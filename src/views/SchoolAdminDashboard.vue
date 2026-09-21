<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden font-sans">
    
    <!-- Sidebar Kiri -->
    <aside class="w-72 bg-white border-r border-gray-100 flex flex-col h-full shadow-sm z-20 flex-shrink-0">
      
      <!-- Logo & Profile -->
      <div class="p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div class="flex items-center gap-4">
          <img src="../assets/logo.png" alt="Logo" class="w-12 h-12 object-contain rounded-xl shadow-sm">
          <div>
            <h1 class="font-black text-gray-900 leading-tight">Admin Sekolah</h1>
            <p class="text-xs text-blue-600 font-bold tracking-wide">Workspace Penjadwalan</p>
          </div>
        </div>
      </div>

      <!-- Navigasi Menu -->
      <nav class="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
        
        <router-link to="/admin-sekolah" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm"
          :class="[$route.path === '/admin-sekolah' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900']">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          Dashboard Utama
        </router-link>

        <div v-for="group in menuGroups" :key="group.title">
          <p class="px-4 text-xs font-black text-gray-400 uppercase tracking-widest mb-3">{{ group.title }}</p>
          <div class="space-y-1">
            <router-link v-for="item in group.items" :key="item.path" :to="item.path" 
              class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium"
              :class="[$route.path === item.path ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent']">
              <svg class="w-5 h-5" :class="[$route.path === item.path ? 'text-blue-600' : 'text-gray-400']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon"></path>
              </svg>
              {{ item.title }}
            </router-link>
          </div>
        </div>
      </nav>

      <!-- Footer Sidebar -->
      <div class="p-4 border-t border-gray-100 bg-white">
        <button @click="handleLogout" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-colors border border-red-100">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Keluar Sistem
        </button>
      </div>
    </aside>

    <!-- Konten Utama -->
    <main class="flex-1 overflow-y-auto bg-[#F8FAFC]">
      
      <!-- Hanya tampil jika di root dashboard -->
      <div v-if="$route.path === '/admin-sekolah'" class="p-8 max-w-[1400px] mx-auto">
        
        <!-- Banner Modern Premium -->
        <div class="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-8 mb-8 shadow-xl shadow-blue-900/20 relative overflow-hidden text-white flex justify-between items-center">
          <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div class="absolute -right-20 -top-20 w-64 h-64 bg-white/10 blur-3xl rounded-full pointer-events-none"></div>
          
          <div class="relative z-10">
            <h2 class="text-3xl font-black mb-2">Selamat Datang di Workspace Anda, <span class="text-blue-200">{{ profileName || 'Admin' }}</span></h2>
            <p class="text-blue-100 text-sm font-medium mb-6">Sistem Penjadwalan Cerdas. Lengkapi master data untuk memulai.</p>
            <button @click="showWizard = true" class="bg-white text-blue-900 hover:bg-blue-50 font-black py-3 px-6 rounded-2xl shadow-lg transition-all flex items-center gap-2 transform hover:-translate-y-1">
              <svg class="w-6 h-6 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              <span>1-Click Auto-Generate Jadwal</span>
            </button>
          </div>
          
          <div class="hidden md:flex relative z-10">
            <div class="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col items-end">
              <span class="text-xs font-bold text-blue-200 tracking-wider uppercase mb-1">Status Lisensi</span>
              <p class="text-lg font-black text-white flex items-center gap-2">
                <span class="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span>
                Aktif & Resmi
              </p>
            </div>
          </div>
        </div>

        <!-- Statistik Utama yang Fungsional -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 group">
            <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 group-hover:text-blue-500 transition-colors">Total Guru</p>
            <div class="flex items-end gap-2">
              <h3 class="text-5xl font-black text-gray-900">{{ stats.totalGuru }}</h3>
              <span class="text-sm font-bold text-gray-400 mb-1.5">Orang</span>
            </div>
          </div>
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 group">
            <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 group-hover:text-indigo-500 transition-colors">Total Kelas</p>
            <div class="flex items-end gap-2">
              <h3 class="text-5xl font-black text-gray-900">{{ stats.totalKelas }}</h3>
              <span class="text-sm font-bold text-gray-400 mb-1.5">Rombel</span>
            </div>
          </div>
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 group">
            <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 group-hover:text-emerald-500 transition-colors">Mata Pelajaran</p>
            <div class="flex items-end gap-2">
              <h3 class="text-5xl font-black text-gray-900">{{ stats.totalMapel }}</h3>
              <span class="text-sm font-bold text-gray-400 mb-1.5">Mapel</span>
            </div>
          </div>
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-3xl shadow-sm border border-blue-100 hover:shadow-lg transition-all hover:-translate-y-1 group relative overflow-hidden">
            <div class="absolute -right-4 -bottom-4 opacity-5 text-blue-900">
              <svg class="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <p class="text-xs font-black text-blue-600 uppercase tracking-widest mb-3">Jam Mengajar</p>
            <div class="flex items-end gap-2 relative z-10">
              <h3 class="text-5xl font-black text-blue-800">{{ stats.jamMengajar }}</h3>
              <span class="text-sm font-bold text-blue-400 mb-1.5">JP</span>
            </div>
          </div>
        </div>

        <!-- Alur Penjadwalan Fungsional -->
        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
          <div class="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h2 class="text-2xl font-black text-gray-900 tracking-tight">Alur Penyusunan Jadwal</h2>
              <p class="text-sm text-gray-500 mt-1 font-medium">Ikuti panduan berikut untuk menghasilkan jadwal yang optimal dan bebas bentrok.</p>
            </div>
            <div class="mt-4 md:mt-0 flex items-center gap-3 bg-gray-50 py-2 px-4 rounded-full border border-gray-100">
              <span class="text-xs font-bold text-gray-500 uppercase">Progres:</span>
              <div class="w-32 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-blue-600 rounded-full transition-all duration-1000" :style="`width: ${stats.progress}%`"></div>
              </div>
              <span class="text-sm font-black text-blue-700">{{ stats.progress }}%</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <!-- Tahap 1 -->
            <div class="border border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all bg-gradient-to-b from-blue-50/50 to-white group cursor-pointer" @click="$router.push('/admin-sekolah/validasi-lembaga')">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                </div>
                <span class="bg-blue-100 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Langkah 1</span>
              </div>
              <h3 class="font-black text-gray-900 text-lg mb-2">Persiapan Data</h3>
              <p class="text-sm text-gray-500 mb-6 leading-relaxed font-medium">Validasi identitas sekolah, tentukan sesi mengajar, dan atur alokasi jam kelas.</p>
              <button class="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 transition-colors">
                Kelola Master Data
              </button>
            </div>

            <!-- Tahap 2 -->
            <div class="border border-indigo-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all bg-gradient-to-b from-indigo-50/50 to-white group cursor-pointer" @click="$router.push('/admin-sekolah/pengampu')">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
                <span class="bg-indigo-100 text-indigo-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Langkah 2</span>
              </div>
              <h3 class="font-black text-gray-900 text-lg mb-2">Distribusi Beban</h3>
              <p class="text-sm text-gray-500 mb-6 leading-relaxed font-medium">Pemetaan guru ke mata pelajaran, input cuti/jam kosong, & tugas tambahan.</p>
              <button class="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors">
                Atur Distribusi
              </button>
            </div>

            <!-- Tahap 3 -->
            <div class="border border-emerald-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all bg-gradient-to-b from-emerald-50/50 to-white group cursor-pointer" @click="$router.push('/admin-sekolah/input-jadwal')">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <span class="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Langkah 3</span>
              </div>
              <h3 class="font-black text-gray-900 text-lg mb-2">Hasil Jadwal</h3>
              <p class="text-sm text-gray-500 mb-6 leading-relaxed font-medium">Sistem akan menyusun jadwal otomatis, menganalisis bentrok, & mencetak laporan.</p>
              <button class="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-emerald-700 transition-colors">
                Lihat Jadwal
              </button>
            </div>

          </div>
        </div>

      </div>
      
      <!-- Halaman dinamis child router akan dimuat di sini -->
      <router-view v-else></router-view>
      
      <MagicWizard :show="showWizard" @close="showWizard = false" />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MagicWizard from '../components/MagicWizard.vue'

const router = useRouter()
const profileName = ref('')
const showWizard = ref(false)

const stats = ref({
  totalGuru: 0,
  totalKelas: 0,
  totalMapel: 0,
  jamMengajar: 0,
  progress: 0
})

const fetchProfileName = async () => {
  const schoolId = localStorage.getItem('school_id')
  if (!schoolId) return
  try {
    const res = await fetch('/api/v1/school/profile', {
      headers: { 'X-School-ID': schoolId }
    })
    if (res.ok) {
      const data = await res.json()
      profileName.value = data.name
    }
  } catch (e) {
    // ignore
  }
}

const fetchDashboardStats = async () => {
  const schoolId = localStorage.getItem('school_id')
  if (!schoolId) return
  
  try {
    const pengampuRes = await fetch('/api/v1/school/pengampu', { headers: { 'X-School-ID': schoolId } })
    let totalJam = 0
    if (pengampuRes.ok) {
      const data = await pengampuRes.json()
      if (data.classes) stats.value.totalKelas = data.classes.length
      if (data.rows) {
        stats.value.totalGuru = data.rows.length
        let mapelSet = new Set()
        data.rows.forEach(r => {
          if (r.hours) r.hours.forEach(h => totalJam += h)
          if (r.subjects) r.subjects.forEach(m => { if (m) mapelSet.add(m) })
        })
        stats.value.totalMapel = mapelSet.size
        stats.value.jamMengajar = totalJam
      }
    }

    const jadwalRes = await fetch('/api/v1/school/jadwal', { headers: { 'X-School-ID': schoolId } })
    if (jadwalRes.ok) {
      const data = await jadwalRes.json()
      const filledSlots = Object.keys(data).length
      if (totalJam > 0) {
        let p = Math.round((filledSlots / totalJam) * 100)
        stats.value.progress = p > 100 ? 100 : p
      }
    }
  } catch (e) {
    // ignore
  }
}

onMounted(() => {
  fetchProfileName()
  fetchDashboardStats()
})

const iconDb = "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
const iconClock = "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
const iconUsers = "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
const iconBook = "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
const iconCalendar = "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
const iconChart = "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
const iconReport = "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
const iconBadge = "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"

const menuGroups = [
  {
    title: 'Master Data',
    items: [
      { title: 'Validasi Lembaga', icon: iconDb, path: '/admin-sekolah/validasi-lembaga' },
      { title: 'Sesi & Waktu KBM', icon: iconClock, path: '/admin-sekolah/sesi-kbm' },
      { title: 'Alokasi Jam & Kelas', icon: iconBook, path: '/admin-sekolah/alokasi-jam' },
    ]
  },
  {
    title: 'Distribusi Beban',
    items: [
      { title: 'Pengampu Mapel', icon: iconUsers, path: '/admin-sekolah/pengampu' },
      { title: 'Permintaan Jam Kosong', icon: iconCalendar, path: '/admin-sekolah/jam-kosong' },
      { title: 'Tugas Tambahan', icon: iconBadge, path: '/admin-sekolah/tugas-tambahan' },
    ]
  },
  {
    title: 'Penjadwalan',
    items: [
      { title: 'Input & Susun Jadwal', path: '/admin-sekolah/input-jadwal', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { title: 'Jadwal Guru', path: '/admin-sekolah/jadwal-guru', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
      { title: 'Jadwal Kelas', path: '/admin-sekolah/jadwal-kelas', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' }
    ]
  },
  {
    title: 'Analisis & Laporan',
    items: [
      { title: 'Analisis Sebaran Guru', icon: iconChart, path: '/admin-sekolah/analisis-guru' },
      { title: 'Analisis Mata Pelajaran', icon: iconChart, path: '/admin-sekolah/analisis-mapel' },
      { title: 'Validasi Kode Guru', icon: iconReport, path: '/admin-sekolah/validasi-kode-guru' },
      { title: 'Validasi Kode Mapel', icon: iconReport, path: '/admin-sekolah/validasi-kode-mapel' },
      { title: 'Master Jadwal', icon: iconReport, path: '/admin-sekolah/master-jadwal' },
      { title: 'Tunjangan Sertifikasi', icon: iconBadge, path: '/admin-sekolah/sertifikasi' },
    ]
  }
]

const handleLogout = () => {
  localStorage.clear()
  router.push('/')
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}
</style>
