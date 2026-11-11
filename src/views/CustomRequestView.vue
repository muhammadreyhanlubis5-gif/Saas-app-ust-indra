<template>
  <div class="animate-fade-in-up p-4 md:p-8 max-w-[1440px] mx-auto space-y-6 font-sans">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <router-link :to="ROUTES.SCHOOL_ADMIN" class="text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
            Dashboard
          </router-link>
          <span class="text-xs text-slate-300">/</span>
          <span class="text-xs font-bold text-slate-600">Custom Request</span>
        </div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Custom Request</h1>
        <p class="text-xs md:text-sm text-slate-400 font-medium mt-1">Permintaan khusus penyusunan kurikulum spesifik, batas jam guru, atau konfigurasi KBM khusus.</p>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs text-center py-16">
      <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
      </div>
      <h3 class="text-base font-bold text-slate-800">Tidak Ada Custom Request Aktif</h3>
      <p class="text-xs text-slate-400 max-w-md mx-auto mt-1">Semua permintaan kustomisasi telah diproses dan diterapkan ke jadwal reguler.</p>
    </div>
  </div>
</template>

<script setup>
import { ROUTES } from '../config/routePaths.js'
</script>
