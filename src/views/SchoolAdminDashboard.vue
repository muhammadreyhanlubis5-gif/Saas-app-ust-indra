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
      <!-- Jika tidak ada child route, tampilkan Dashboard Home 16 Langkah -->
      <div v-if="$route.path === '/admin-sekolah'">
        
        <!-- Header Mirip Excel -->
        <div class="bg-red-600 text-white text-center py-2 px-4 rounded-t-lg shadow-md mb-0 border-b-4 border-black">
          <h1 class="text-xl font-bold tracking-widest uppercase">IKUTI ALUR PENGISIAN JADWAL DARI URUTAN NO 1 SAMPAI NO 16</h1>
        </div>
        <div class="bg-black text-white text-center py-1 px-4 shadow-md mb-6 rounded-b-lg">
          <h2 class="text-lg font-bold tracking-widest">WORKSPACE SEKOLAH</h2>
        </div>

        <!-- 16 Tombol Navigasi (Grid) -->
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          
          <button class="bg-gray-900 hover:bg-black text-white font-bold py-4 px-2 rounded-xl shadow-md border-2 border-transparent hover:border-gray-500 transition-all flex items-center justify-center text-center text-sm">
            1. VALIDASI NAMA<br>LEMBAGA
          </button>
          <button class="bg-[#7cb342] hover:bg-[#689f38] text-white font-bold py-4 px-2 rounded-xl shadow-md border-2 border-transparent hover:border-white transition-all flex items-center justify-center text-center text-sm">
            2. SESI<br>KBM
          </button>
          <button class="bg-[#7cb342] hover:bg-[#689f38] text-white font-bold py-4 px-2 rounded-xl shadow-md border-2 border-transparent hover:border-white transition-all flex items-center justify-center text-center text-sm">
            3. ALOKASI<br>JAM/KELAS
          </button>
          <button class="bg-[#7cb342] hover:bg-[#689f38] text-white font-bold py-4 px-2 rounded-xl shadow-md border-2 border-transparent hover:border-white transition-all flex items-center justify-center text-center text-sm">
            4. PENGAMPU<br>MAPEL
          </button>
          <button class="bg-[#7cb342] hover:bg-[#689f38] text-white font-bold py-4 px-2 rounded-xl shadow-md border-2 border-transparent hover:border-white transition-all flex items-center justify-center text-center text-sm">
            5. PERMINTAAN<br>JAM KOSONG
          </button>
          <button class="bg-[#7cb342] hover:bg-[#689f38] text-white font-bold py-4 px-2 rounded-xl shadow-md border-2 border-transparent hover:border-white transition-all flex items-center justify-center text-center text-sm">
            6. TUGAS<br>TAMBAHAN
          </button>
          <button class="bg-[#7cb342] hover:bg-[#689f38] text-white font-bold py-4 px-2 rounded-xl shadow-md border-2 border-transparent hover:border-white transition-all flex items-center justify-center text-center text-sm">
            7. INPUT<br>JADWAL
          </button>
          <button class="bg-[#7cb342] hover:bg-[#689f38] text-white font-bold py-4 px-2 rounded-xl shadow-md border-2 border-transparent hover:border-white transition-all flex items-center justify-center text-center text-sm">
            8. ANALISIS<br>SEBARAN GURU
          </button>
          <button class="bg-[#7cb342] hover:bg-[#689f38] text-white font-bold py-4 px-2 rounded-xl shadow-md border-2 border-transparent hover:border-white transition-all flex items-center justify-center text-center text-sm">
            9. JADWAL<br>GURU
          </button>
          <button class="bg-[#7cb342] hover:bg-[#689f38] text-white font-bold py-4 px-2 rounded-xl shadow-md border-2 border-transparent hover:border-white transition-all flex items-center justify-center text-center text-sm">
            10. JADWAL<br>KELAS
          </button>
        </div>

        <!-- Validasi Sinkronisasi Box -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center mb-8 bg-white p-4 rounded-xl border border-yellow-400 shadow-sm">
          <div class="col-span-1 border-r border-gray-200 pr-4">
             <div class="flex justify-between items-center mb-1"><span class="text-xs font-bold text-gray-600">TOTAL ALOKASI JAM (KLIK MENU NO. 5)</span> <span class="font-bold">726 JP</span></div>
             <div class="flex justify-between items-center"><span class="text-xs font-bold text-gray-600">TOTAL JAM TERDISTRIBUSI KE GURU (MENU 7)</span> <span class="font-bold">726 JP</span></div>
          </div>
          <div class="col-span-1 text-center font-bold text-sm text-gray-700 px-4 flex flex-col items-center">
             <svg class="w-8 h-8 text-blue-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
             JUMLAH KEDUANYA HARUS SAMA
          </div>
          <div class="col-span-1 border-l border-gray-200 pl-4 text-xs font-bold text-blue-800">
             JAM GURU TELAH SESUAI DENGAN ALOKASI KURIKULUM YANG DITETAPKAN, LANJUTKAN KE INPUT JADWAL (MENU NO. 10)
          </div>
        </div>

        <!-- Bagian Bawah: Cek Kode & Sertifikasi -->
        <div class="flex flex-col md:flex-row gap-6 mb-8 justify-between">
          <div class="flex-1 bg-white border border-yellow-400 rounded-xl p-4 text-center shadow-sm">
            <p class="text-xs font-bold text-gray-600 mb-2">KODE GURU YANG BELUM DIINPUT (CEK MENU NO. 12)</p>
            <p class="text-xl font-black text-red-600 mb-2">0</p>
            <p class="text-xs font-bold text-gray-600 mb-1">KODE GURU YANG SUDAH DIINPUT KE JADWAL</p>
            <p class="text-lg font-bold text-green-600">100,00%</p>
          </div>

          <div class="flex flex-col items-center justify-center">
            <div class="bg-black text-yellow-500 text-[10px] px-4 py-1 font-bold border-b-4 border-yellow-600 -mb-2 z-10 relative">JIKA SUDAH LELAH KLIK TOMBOL INI</div>
            <button class="bg-black hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-lg shadow-xl border border-gray-700 transition-all text-sm w-48 text-center pt-4">
              16. CEK TUNJANGAN SERTIFIKASI
            </button>
          </div>

          <div class="flex-1 bg-white border border-yellow-400 rounded-xl p-4 text-center shadow-sm">
            <p class="text-xs font-bold text-gray-600 mb-2">KODE MAPEL YANG BELUM DIINPUT (CEK MENU NO. 13)</p>
            <p class="text-xl font-black text-red-600 mb-2">0</p>
            <p class="text-xs font-bold text-gray-600 mb-1">KODE MAPEL YANG SUDAH DIINPUT KE JADWAL</p>
            <p class="text-lg font-bold text-green-600">100,00%</p>
          </div>
        </div>

        <!-- Footer Statistik -->
        <div class="bg-black text-white text-center py-2 text-xs font-bold tracking-widest rounded-t-lg">
          JADWAL PELAJARAN SEMESTER GENAP TAHUN PELAJARAN 2026-2027
        </div>
        <div class="bg-red-600 text-white flex justify-between px-6 py-3 rounded-b-lg shadow-md font-bold text-sm">
          <span>JUMLAH GURU = 44</span>
          <span>JUMLAH KELAS = 18</span>
          <span>JUMLAH MAPEL = 45</span>
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
