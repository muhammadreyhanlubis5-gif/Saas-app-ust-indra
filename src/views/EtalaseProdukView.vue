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
          <span class="text-xs font-bold text-slate-600">Etalase Produk</span>
        </div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Etalase Produk & Paket Layanan</h1>
        <p class="text-xs md:text-sm text-slate-400 font-medium mt-1">Katalog paket lisensi GuruKu, add-on mesin penjadwal, dan modul cetak sekolah.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
        <div>
          <span class="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Paket Dasar</span>
          <h3 class="font-bold text-slate-900 text-lg mt-3">Lisensi Semester Ganjil</h3>
          <p class="text-xs text-slate-400 mt-1">Manajemen jadwal 1 semester lengkap untuk dewan guru dan rombel kelas.</p>
          <p class="text-2xl font-black text-slate-900 font-mono mt-4">Rp 254.205</p>
        </div>
        <button class="w-full mt-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors">
          Pilih Paket
        </button>
      </div>

      <div class="bg-white rounded-2xl border-2 border-blue-600 p-6 shadow-md flex flex-col justify-between relative">
        <span class="absolute -top-3 right-6 bg-blue-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">Populer</span>
        <div>
          <span class="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Paket Tahunan</span>
          <h3 class="font-bold text-slate-900 text-lg mt-3">Lisensi Lengkap 1 Tahun</h3>
          <p class="text-xs text-slate-400 mt-1">Dua semester penuh, modul cetak kartu ujian, dan garansi bebas bentrok.</p>
          <p class="text-2xl font-black text-slate-900 font-mono mt-4">Rp 480.000</p>
        </div>
        <button class="w-full mt-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors">
          Pilih Paket
        </button>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
        <div>
          <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Enterprise</span>
          <h3 class="font-bold text-slate-900 text-lg mt-3">Multi-Kampus & Yayasan</h3>
          <p class="text-xs text-slate-400 mt-1">Solusi terpusat untuk yayasan dengan multi unit sekolah (SD, SMP, SMA/SMK).</p>
          <p class="text-2xl font-black text-slate-900 font-mono mt-4">Rp 1.250.000</p>
        </div>
        <button class="w-full mt-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors">
          Hubungi Tim
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ROUTES } from '../config/routePaths.js'
</script>
