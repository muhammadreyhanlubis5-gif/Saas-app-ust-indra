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
          <span class="text-xs font-bold text-slate-600">Laporan Investor</span>
        </div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Laporan Investor & Eksekutif</h1>
        <p class="text-xs md:text-sm text-slate-400 font-medium mt-1">Laporan kinerja finansial, pertumbuhan pendapatan, dan return on investment (ROI).</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Gross Profit Margin</p>
        <p class="text-3xl font-black text-slate-900 font-mono">59.0%</p>
        <p class="text-[11px] text-emerald-600 font-semibold mt-1">Kesehatan margin stabil</p>
      </div>
      <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pertumbuhan Kas Kuartalan</p>
        <p class="text-3xl font-black text-slate-900 font-mono">+18.4%</p>
        <p class="text-[11px] text-emerald-600 font-semibold mt-1">Arus kas operasional positif</p>
      </div>
      <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Rasio Beban HPP</p>
        <p class="text-3xl font-black text-slate-900 font-mono">41.0%</p>
        <p class="text-[11px] text-slate-400 font-medium mt-1">Efisiensi infrastruktur optimal</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ROUTES } from '../config/routePaths.js'
</script>
