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
      <!-- Jika tidak ada child route, tampilkan Dashboard Welcome -->
      <div v-if="$route.path === '/admin-sekolah'">
        <div class="mb-8">
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Selamat Datang di Workspace Anda!</h1>
          <p class="text-gray-500 mt-2 font-medium">Silakan ikuti alur pengisian jadwal dari urutan 1 sampai 16 di menu sebelah kiri.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div class="bg-blue-600 text-white p-6 rounded-2xl shadow-lg shadow-blue-200 relative overflow-hidden">
            <div class="relative z-10">
              <h3 class="text-sm font-semibold opacity-80 uppercase tracking-wider mb-1">Status Lisensi SaaS</h3>
              <p class="text-3xl font-bold">Aktif s/d 31 Des 2026</p>
            </div>
            <div class="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
              <svg class="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
            </div>
          </div>
          <div class="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm text-gray-800">
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Progres Penyusunan Jadwal</h3>
            <div class="flex items-end gap-3 mt-2">
              <p class="text-4xl font-extrabold text-blue-600">0<span class="text-lg text-gray-400 font-normal">%</span></p>
              <p class="text-sm text-gray-500 mb-1 pb-1">Belum ada data diinput</p>
            </div>
          </div>
        </div>

        <div class="bg-yellow-50 border border-yellow-200 p-5 rounded-xl flex gap-4 text-yellow-800 shadow-sm">
          <svg class="w-8 h-8 shrink-0 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <h4 class="font-bold text-lg mb-1">Panduan Memulai</h4>
            <p class="text-sm">Klik menu <strong>1. Validasi Nama Lembaga</strong> di sidebar untuk memulai sinkronisasi data sekolah Anda dengan sistem pusat penjadwalan.</p>
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
