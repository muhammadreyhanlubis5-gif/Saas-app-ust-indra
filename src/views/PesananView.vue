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
          <span class="text-xs font-bold text-slate-600">Pesanan</span>
        </div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Manajemen Pesanan</h1>
        <p class="text-xs md:text-sm text-slate-400 font-medium mt-1">Daftar transaksi, pesanan layanan penjadwalan, lisensi, dan status produksi.</p>
      </div>

      <div class="flex items-center gap-2.5">
        <button class="inline-flex items-center gap-2 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors">
          <span>+ Tambah Pesanan</span>
        </button>
      </div>
    </div>

    <!-- Table Pesanan -->
    <div class="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-xs">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th class="py-3 px-3">No. Invoice</th>
              <th class="py-3 px-3">Klien / Rekan</th>
              <th class="py-3 px-3">Tanggal</th>
              <th class="py-3 px-3">Item Layanan</th>
              <th class="py-3 px-3 text-right">Total</th>
              <th class="py-3 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr class="hover:bg-slate-50/60">
              <td class="py-3 px-3 font-mono font-semibold text-slate-700">INV-202611-001</td>
              <td class="py-3 px-3 font-bold text-slate-900">Klien / Rekan Istimewa</td>
              <td class="py-3 px-3 text-slate-500">2 Nov 2026, 12.00</td>
              <td class="py-3 px-3 text-slate-600">Paket Lisensi Sistem Penjadwalan Terpadu</td>
              <td class="py-3 px-3 text-right font-bold font-mono text-slate-900">Rp 254.205</td>
              <td class="py-3 px-3 text-center">
                <span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Selesai
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ROUTES } from '../config/routePaths.js'
</script>
