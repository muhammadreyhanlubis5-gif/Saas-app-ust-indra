<template>
  <div class="flex h-screen bg-gray-50 font-sans overflow-hidden">
    
    <!-- Sidebar Navigation -->
    <aside class="w-72 bg-white shadow-lg flex flex-col h-full border-r border-gray-200 z-10">
      <!-- Sidebar Header -->
      <div class="p-5 border-b border-gray-100 flex items-center gap-3 sticky top-0 bg-white z-20">
        <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-inner">
          S
        </div>
        <div>
          <h2 class="font-bold text-gray-800 text-lg leading-tight">Admin Sekolah</h2>
          <p class="text-xs text-gray-500">Workspace Penjadwalan</p>
        </div>
      </div>

      <!-- Navigation Links -->
      <div class="flex-1 overflow-y-auto py-4 px-4 space-y-6 custom-scrollbar">
        
        <div>
          <router-link to="/admin-sekolah" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors" exact-active-class="bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600">
            <svg class="w-5 h-5 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            Dashboard Utama
          </router-link>
        </div>

        <div v-for="group in menuGroups" :key="group.title">
          <p class="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2 px-3">{{ group.title }}</p>
          <div class="space-y-1">
            <template v-for="menu in group.items" :key="menu.title">
              <a href="#" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="menu.icon"></path></svg>
                <span class="truncate">{{ menu.title }}</span>
              </a>
            </template>
          </div>
        </div>
        
      </div>

      <!-- Sidebar Footer / Logout -->
      <div class="p-4 border-t border-gray-100 bg-gray-50">
        <button @click="handleLogout" class="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-bold text-red-600 bg-white border border-red-100 rounded-lg hover:bg-red-50 hover:border-red-200 transition-all shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Keluar Sistem
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 overflow-y-auto bg-gray-50 p-8">
      <!-- Dashboard Welcome (Professional UI) -->
      <div v-if="$route.path === '/admin-sekolah'" class="max-w-6xl mx-auto">
        
        <!-- Header Section -->
        <div class="mb-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div>
            <h1 class="text-3xl font-extrabold tracking-tight mb-2">Selamat Datang di Workspace Anda</h1>
            <p class="text-blue-100 font-medium">Sistem Penjadwalan Cerdas. Silakan lengkapi master data untuk memulai.</p>
          </div>
          <div class="hidden md:block bg-white/20 px-6 py-3 rounded-xl backdrop-blur-sm border border-white/30 text-center shadow-inner">
            <p class="text-xs text-blue-100 font-bold uppercase tracking-wider mb-1">Status Lisensi</p>
            <p class="text-xl font-bold">Aktif & Resmi</p>
          </div>
        </div>

        <!-- Statistik Utama -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <p class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Guru</p>
            <h3 class="text-4xl font-black text-gray-800">0<span class="text-lg font-medium text-gray-400 ml-1">Orang</span></h3>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <p class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Kelas</p>
            <h3 class="text-4xl font-black text-gray-800">0<span class="text-lg font-medium text-gray-400 ml-1">Rombel</span></h3>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <p class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Mata Pelajaran</p>
            <h3 class="text-4xl font-black text-gray-800">0<span class="text-lg font-medium text-gray-400 ml-1">Mapel</span></h3>
          </div>
          <div class="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
            <p class="text-sm font-bold text-blue-600/80 uppercase tracking-wider mb-2">Jam Mengajar</p>
            <h3 class="text-4xl font-black text-blue-700">0<span class="text-lg font-medium text-blue-400 ml-1">JP</span></h3>
          </div>
        </div>

        <!-- Alur Penjadwalan (Modern Wizard View) -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold text-gray-800">Tahapan Penyusunan Jadwal</h2>
              <p class="text-sm text-gray-500 mt-1">Ikuti panduan berikut untuk menghasilkan jadwal yang optimal dan bebas bentrok.</p>
            </div>
            <span class="bg-blue-100 text-blue-800 text-xs font-bold px-4 py-1.5 rounded-full border border-blue-200">
              Progres: 0%
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <!-- Tahap 1 -->
            <div class="border border-blue-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all bg-blue-50/30 group">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                </div>
                <h3 class="font-bold text-gray-800 text-lg">Persiapan Data</h3>
              </div>
              <p class="text-sm text-gray-600 mb-5 leading-relaxed">Validasi identitas sekolah, tentukan sesi mengajar, dan atur alokasi jam kelas.</p>
              <button class="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors group-hover:shadow-md">
                Kelola Master Data
              </button>
            </div>

            <!-- Tahap 2 -->
            <div class="border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all bg-white group">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
                <h3 class="font-bold text-gray-800 text-lg">Distribusi Beban</h3>
              </div>
              <p class="text-sm text-gray-600 mb-5 leading-relaxed">Pemetaan guru ke mata pelajaran, input cuti/jam kosong, & tugas tambahan.</p>
              <button class="w-full py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors group-hover:border-indigo-300">
                Atur Distribusi
              </button>
            </div>

            <!-- Tahap 3 -->
            <div class="border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all bg-white group">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <h3 class="font-bold text-gray-800 text-lg">Hasil Jadwal</h3>
              </div>
              <p class="text-sm text-gray-600 mb-5 leading-relaxed">Sistem akan menyusun jadwal otomatis, menganalisis bentrok, & mencetak laporan.</p>
              <button class="w-full py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors group-hover:border-emerald-300">
                Lihat Jadwal
              </button>
            </div>

          </div>
        </div>

        <!-- Validasi Sistem (Cek Mapel & Guru) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white border-l-4 border-red-500 p-6 rounded-r-2xl shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
            <div>
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Guru Belum Terjadwal</p>
              <h4 class="text-2xl font-black text-gray-800">0 Guru</h4>
            </div>
            <button class="bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-lg font-bold text-sm transition-colors border border-red-100">
              Cek Validasi
            </button>
          </div>
          <div class="bg-white border-l-4 border-red-500 p-6 rounded-r-2xl shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
            <div>
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Mapel Belum Terjadwal</p>
              <h4 class="text-2xl font-black text-gray-800">0 Mapel</h4>
            </div>
            <button class="bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-lg font-bold text-sm transition-colors border border-red-100">
              Cek Validasi
            </button>
          </div>
        </div>

      </div>
      
      <!-- Halaman dinamis child router akan dimuat di sini -->
      <router-view v-else></router-view>
      
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const iconDb = "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
const iconClock = "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
const iconUsers = "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
const iconBook = "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
const iconCalendar = "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
const iconChart = "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
const iconReport = "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
const iconBadge = "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"

// Pengelompokan Menu Tanpa Angka
const menuGroups = [
  {
    title: 'Master Data',
    items: [
      { title: 'Validasi Lembaga', icon: iconDb },
      { title: 'Sesi & Waktu KBM', icon: iconClock },
      { title: 'Alokasi Jam & Kelas', icon: iconBook },
    ]
  },
  {
    title: 'Distribusi Beban',
    items: [
      { title: 'Pengampu Mapel', icon: iconUsers },
      { title: 'Permintaan Jam Kosong', icon: iconCalendar },
      { title: 'Tugas Tambahan', icon: iconBadge },
    ]
  },
  {
    title: 'Penjadwalan',
    items: [
      { title: 'Input & Susun Jadwal', icon: iconCalendar },
      { title: 'Jadwal Guru', icon: iconUsers },
      { title: 'Jadwal Kelas', icon: iconBook },
    ]
  },
  {
    title: 'Analisis & Laporan',
    items: [
      { title: 'Analisis Sebaran Guru', icon: iconChart },
      { title: 'Analisis Mata Pelajaran', icon: iconChart },
      { title: 'Validasi Kode Guru', icon: iconReport },
      { title: 'Validasi Kode Mapel', icon: iconReport },
      { title: 'Master Jadwal', icon: iconReport },
      { title: 'Tunjangan Sertifikasi', icon: iconBadge },
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
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
</style>
