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
          <span class="text-xs font-bold text-slate-600">Filamen & Bahan</span>
        </div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Filamen & Bahan Cetak</h1>
        <p class="text-xs md:text-sm text-slate-400 font-medium mt-1">Stok media cetak, kertas tebal laminasi, kartu jadwal saku, dan bahan operasional.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kertas Karton Jadwal A3</span>
        <p class="text-2xl font-black text-slate-900 font-mono mt-1">480 Lembar</p>
        <span class="text-xs text-emerald-600 font-semibold">Stok Aman</span>
      </div>
      <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tinta Pigment Cetak Matriks</span>
        <p class="text-2xl font-black text-slate-900 font-mono mt-1">8 Botol</p>
        <span class="text-xs text-emerald-600 font-semibold">Stok Aman</span>
      </div>
      <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Laminating Roll Doff/Glossy</span>
        <p class="text-2xl font-black text-slate-900 font-mono mt-1">4 Roll</p>
        <span class="text-xs text-emerald-600 font-semibold">Stok Aman</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ROUTES } from '../config/routePaths.js'
</script>
