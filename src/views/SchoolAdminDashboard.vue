<template>
  <div class="flex h-screen bg-gray-50 font-sans overflow-hidden">
    
    <!-- Sidebar Navigation -->
    <aside class="w-72 bg-white shadow-lg flex flex-col h-full border-r border-gray-200 z-10">
      <!-- Sidebar Header -->
      <div class="p-5 border-b border-gray-100 flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
          S
        </div>
        <div>
          <h2 class="font-bold text-gray-800 text-lg">Admin Sekolah</h2>
          <p class="text-xs text-gray-500">Workspace Penjadwalan</p>
        </div>
      </div>

      <!-- Navigation Links -->
      <div class="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        
        <router-link to="/admin-sekolah" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors" exact-active-class="bg-blue-100 text-blue-700 font-bold">
          <svg class="w-5 h-5 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          Dashboard Utama
        </router-link>

        <div class="pt-4 pb-2 px-3">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Alur Pengisian Jadwal</p>
        </div>

        <!-- 16 Menu Sidebar -->
        <template v-for="menu in menus" :key="menu.id">
          <a href="#" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer border border-transparent hover:border-blue-100">
            <span class="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-bold text-gray-500 shrink-0 border border-gray-200">
              {{ menu.id }}
            </span>
            <span class="truncate leading-tight">{{ menu.title }}</span>
          </a>
        </template>
        
      </div>

      <!-- Sidebar Footer / Logout -->
      <div class="p-4 border-t border-gray-100">
        <button @click="handleLogout" class="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Keluar Sistem
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 overflow-y-auto bg-gray-50 p-8">
      <!-- Dashboard Welcome (Professional UI) -->
      <div v-if="$route.path === '/admin-sekolah'">
        
        <!-- Header Section -->
        <div class="mb-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div>
            <h1 class="text-3xl font-extrabold tracking-tight mb-2">Selamat Datang di Workspace Anda</h1>
            <p class="text-blue-100 font-medium">Sistem Penjadwalan Cerdas. Silakan lengkapi master data untuk memulai.</p>
          </div>
          <div class="hidden md:block bg-white/20 px-6 py-3 rounded-xl backdrop-blur-sm border border-white/30 text-center">
            <p class="text-xs text-blue-100 font-bold uppercase tracking-wider mb-1">Status Lisensi</p>
            <p class="text-xl font-bold">Aktif & Resmi</p>
          </div>
        </div>

        <!-- Statistik Utama -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <p class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Guru</p>
            <h3 class="text-4xl font-black text-gray-800">0<span class="text-lg font-medium text-gray-400 ml-1">Orang</span></h3>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <p class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Kelas</p>
            <h3 class="text-4xl font-black text-gray-800">0<span class="text-lg font-medium text-gray-400 ml-1">Rombel</span></h3>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <p class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Mata Pelajaran</p>
            <h3 class="text-4xl font-black text-gray-800">0<span class="text-lg font-medium text-gray-400 ml-1">Mapel</span></h3>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center bg-blue-50/50">
            <p class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Jam Mengajar</p>
            <h3 class="text-4xl font-black text-blue-600">0<span class="text-lg font-medium text-blue-400 ml-1">JP</span></h3>
          </div>
        </div>

        <!-- Alur Penjadwalan (Modern Wizard View) -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold text-gray-800">Alur Penyusunan Jadwal</h2>
              <p class="text-sm text-gray-500 mt-1">Ikuti 16 langkah berurutan di menu sebelah kiri untuk hasil yang bebas bentrok.</p>
            </div>
            <span class="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full border border-yellow-200">
              Progres: 0%
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <!-- Tahap 1 -->
            <div class="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow bg-gray-50">
              <div class="flex items-center gap-3 mb-3">
                <span class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">1</span>
                <h3 class="font-bold text-gray-800">Persiapan Master Data</h3>
              </div>
              <p class="text-sm text-gray-500 mb-4">Validasi identitas sekolah, sesi jam mengajar (KBM), dan data alokasi kelas.</p>
              <button class="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                Mulai Tahap 1 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>

            <!-- Tahap 2 -->
            <div class="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow opacity-60">
              <div class="flex items-center gap-3 mb-3">
                <span class="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm">2</span>
                <h3 class="font-bold text-gray-800">Distribusi Beban Guru</h3>
              </div>
              <p class="text-sm text-gray-500 mb-4">Pemetaan guru ke mata pelajaran, permintaan hari libur (jam kosong), & tugas tambahan.</p>
              <button class="text-sm font-bold text-gray-400 cursor-not-allowed flex items-center gap-1">
                Terkunci <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </button>
            </div>

            <!-- Tahap 3 -->
            <div class="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow opacity-60">
              <div class="flex items-center gap-3 mb-3">
                <span class="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm">3</span>
                <h3 class="font-bold text-gray-800">Generasi Jadwal</h3>
              </div>
              <p class="text-sm text-gray-500 mb-4">Input jadwal otomatis, analisis sebaran bentrok, dan cetak laporan hasil akhir.</p>
              <button class="text-sm font-bold text-gray-400 cursor-not-allowed flex items-center gap-1">
                Terkunci <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </button>
            </div>

          </div>
        </div>

        <!-- Validasi Sistem (Cek Mapel & Guru) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white border-l-4 border-red-500 p-5 rounded-r-xl shadow-sm flex justify-between items-center">
            <div>
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Guru Belum Terjadwal</p>
              <h4 class="text-xl font-bold text-gray-800">0 Guru</h4>
            </div>
            <div class="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold text-sm">Validasi (No. 12)</div>
          </div>
          <div class="bg-white border-l-4 border-red-500 p-5 rounded-r-xl shadow-sm flex justify-between items-center">
            <div>
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Mapel Belum Terjadwal</p>
              <h4 class="text-xl font-bold text-gray-800">0 Mapel</h4>
            </div>
            <div class="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold text-sm">Validasi (No. 13)</div>
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

// Daftar 16 Menu Alur Penjadwalan sesuai Excel
const menus = [
  { id: 1, title: 'Validasi Nama Lembaga' },
  { id: 2, title: 'Sesi KBM' },
  { id: 3, title: 'Alokasi Jam / Kelas' },
  { id: 4, title: 'Pengampu Mapel' },
  { id: 5, title: 'Permintaan Jam Kosong' },
  { id: 6, title: 'Tugas Tambahan' },
  { id: 7, title: 'Input Jadwal' },
  { id: 8, title: 'Analisis Sebaran Guru' },
  { id: 9, title: 'Jadwal Guru' },
  { id: 10, title: 'Jadwal Kelas' },
  { id: 11, title: 'Analisis Mata Pelajaran' },
  { id: 12, title: 'Kode Guru Belum Diinput' },
  { id: 13, title: 'Kode Mapel Belum Diinput' },
  { id: 14, title: 'Cetak Master Jadwal' },
  { id: 15, title: 'Cetak Jadwal Keseluruhan' },
  { id: 16, title: 'Cek Tunjangan Sertifikasi' },
]

const handleLogout = () => {
  localStorage.clear()
  router.push('/')
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
</style>
