<template>
  <div class="flex h-screen bg-gray-50 font-sans overflow-hidden">
    
    <!-- Sidebar Navigation -->
    <aside class="w-64 bg-gray-900 text-white flex flex-col h-full z-10 shadow-xl">
      <!-- Sidebar Header -->
      <div class="p-5 border-b border-gray-800 flex items-center gap-3">
        <div class="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl">
          SA
        </div>
        <div>
          <h2 class="font-bold text-white text-lg">Super Admin</h2>
          <p class="text-xs text-gray-400">SaaS Management</p>
        </div>
      </div>

      <!-- Navigation Links -->
      <div class="flex-1 overflow-y-auto py-6 px-3 space-y-2 custom-scrollbar">
        
        <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-600 text-white font-medium transition-colors">
          <svg class="w-5 h-5 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          Manajemen Klien
        </a>
        
        <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
          <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          Laporan Pendapatan
        </a>

        <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
          <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          Pengaturan Sistem
        </a>
        
      </div>

      <!-- Sidebar Footer / Logout -->
      <div class="p-4 border-t border-gray-800">
        <button @click="handleLogout" class="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Keluar (Log Out)
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 overflow-y-auto bg-gray-50 p-8">
      
      <div class="flex justify-between items-end mb-8">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Super Admin Dashboard</h1>
          <p class="text-gray-500 mt-1 font-medium">Manajemen Lisensi & Klien SaaS Multi-Tenant</p>
        </div>
      </div>

      <!-- Table of Tenants (Schools) -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-800">Daftar Klien Sekolah (Tenants)</h2>
          <button class="bg-indigo-600 text-white px-5 py-2.5 rounded-lg shadow-sm hover:bg-indigo-700 font-semibold transition-colors flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Tambah Klien Baru
          </button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border-b border-gray-200">
            <thead>
              <tr class="bg-gray-50 text-left border-y border-gray-200">
                <th class="py-4 px-5 uppercase font-bold text-xs text-gray-500 tracking-wider">Nama Sekolah</th>
                <th class="py-4 px-5 uppercase font-bold text-xs text-gray-500 tracking-wider">Status Kontrak</th>
                <th class="py-4 px-5 uppercase font-bold text-xs text-gray-500 tracking-wider">Batas Waktu (Valid Until)</th>
                <th class="py-4 px-5 uppercase font-bold text-xs text-gray-500 tracking-wider">Jumlah Guru</th>
                <th class="py-4 px-5 uppercase font-bold text-xs text-gray-500 tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="text-gray-700 divide-y divide-gray-100">
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="py-4 px-5 font-bold text-gray-800">SMA Negeri 1 Jakarta</td>
                <td class="py-4 px-5"><span class="bg-green-100 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-bold uppercase">Aktif</span></td>
                <td class="py-4 px-5 font-medium text-gray-600">31 Des 2026</td>
                <td class="py-4 px-5 font-medium text-gray-600">44 Guru</td>
                <td class="py-4 px-5 text-right">
                  <button class="text-indigo-600 hover:text-indigo-800 font-bold text-sm mr-4 transition-colors">Edit</button>
                  <button class="text-red-600 hover:text-red-800 font-bold text-sm transition-colors">Blokir</button>
                </td>
              </tr>
              <tr class="hover:bg-gray-50 transition-colors bg-red-50/30">
                <td class="py-4 px-5 font-bold text-gray-800">SMP Harapan Bangsa</td>
                <td class="py-4 px-5"><span class="bg-red-100 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-bold uppercase">Expired</span></td>
                <td class="py-4 px-5 font-bold text-red-600">01 Jan 2026</td>
                <td class="py-4 px-5 font-medium text-gray-600">20 Guru</td>
                <td class="py-4 px-5 text-right">
                  <button class="text-indigo-600 hover:text-indigo-800 font-bold text-sm transition-colors">Perpanjang</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

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
  background-color: #4b5563;
  border-radius: 20px;
}
</style>
