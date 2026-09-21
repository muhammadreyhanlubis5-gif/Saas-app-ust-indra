<template>
  <div class="h-full w-full flex flex-col items-center justify-center p-8 bg-gray-50/50">
    <div class="bg-white p-10 rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 max-w-lg w-full text-center relative overflow-hidden">
      <!-- Dekorasi -->
      <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 pointer-events-none"></div>
      <div class="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -ml-10 -mb-10 pointer-events-none"></div>

      <div class="relative z-10">
        <div class="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
        </div>
        
        <h2 class="text-3xl font-black text-gray-800 mb-3 tracking-tight">Masih Dalam Tahap Pengembangan</h2>
        <p class="text-gray-500 mb-8 font-medium">Halaman ini sedang diracik oleh tim ahli kami untuk memberikan pengalaman SaaS terbaik untuk Anda. Silakan nantikan pembaruannya!</p>
        
        <button @click="$router.push('/admin-sekolah')" class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-3 justify-center w-full transform hover:-translate-y-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Kembali ke Dashboard Utama
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>
