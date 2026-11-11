<template>
  <div class="animate-fade-in-up p-4 md:p-8 max-w-[1440px] mx-auto space-y-6 font-sans">
    
    <!-- Header Halaman -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <router-link :to="ROUTES.SCHOOL_ADMIN" class="text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
            Dashboard
          </router-link>
          <span class="text-xs text-slate-300">/</span>
          <span class="text-xs font-bold text-slate-600">Kalkulator HPP</span>
        </div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          Kalkulator HPP & Margin Laba
        </h1>
        <p class="text-xs md:text-sm text-slate-400 font-medium mt-1">
          Simulasi penentuan Harga Pokok Penjualan (HPP), biaya bahan baku/server, biaya tenaga kerja, dan proyeksi laba kotor.
        </p>
      </div>

      <div class="flex items-center gap-2.5 flex-wrap">
        <button @click="applyToDashboard" class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          <span>Terapkan ke Dashboard</span>
        </button>
        <button @click="resetDefault" class="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer">
          <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          <span>Reset Standar</span>
        </button>
      </div>
    </div>

    <!-- Alert Notifikasi Saat Diterapkan -->
    <div v-if="appliedNotification" class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        <span>Hasil kalkulasi HPP (Rp {{ Number(totalHPP).toLocaleString('id-ID') }}) dan Harga Jual (Rp {{ Number(hargaJual).toLocaleString('id-ID') }}) berhasil disinkronkan ke Dashboard Utama!</span>
      </div>
      <button @click="appliedNotification = false" class="text-emerald-600 hover:text-emerald-900">✕</button>
    </div>

    <!-- Grid 2 Kolom: Form Parameter (Kiri) & Hasil Analisis (Kanan) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- KOLOM KIRI: PARAMETER BIAYA HPP (7 COLS) -->
      <div class="lg:col-span-7 space-y-5">
        
        <!-- Section 1: Informasi Layanan / Produk -->
        <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 class="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-blue-600"></span>
            1. Informasi Layanan & Volume
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Nama Layanan / Paket</label>
              <input v-model="form.productName" type="text" 
                class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Target Volume (Paket / Sekolah)</label>
              <input v-model.number="form.volume" type="number" min="1" 
                class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono">
            </div>
          </div>
        </div>

        <!-- Section 2: Biaya Bahan Baku Langsung (BBL) / Server & Cloud -->
        <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-indigo-600"></span>
              2. Biaya Bahan Baku / Infrastruktur Server (BBL)
            </h3>
            <span class="text-xs font-bold text-indigo-700 font-mono">Subtotal: {{ formatRupiah(subtotalBBL) }}</span>
          </div>

          <div class="space-y-2 text-xs">
            <div class="flex items-center gap-3">
              <span class="w-1/2 text-slate-600">Cloud Database & Storage GuruKu</span>
              <div class="w-1/2 relative">
                <span class="absolute left-3 top-2 text-slate-400 font-mono text-[11px]">Rp</span>
                <input v-model.number="form.bbl_server" type="number" 
                  class="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono text-right">
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span class="w-1/2 text-slate-600">Alokasi Domain, SSL, & API Service</span>
              <div class="w-1/2 relative">
                <span class="absolute left-3 top-2 text-slate-400 font-mono text-[11px]">Rp</span>
                <input v-model.number="form.bbl_domain" type="number" 
                  class="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono text-right">
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span class="w-1/2 text-slate-600">Bahan Habis Pakai & Cetak Matriks Jadwal</span>
              <div class="w-1/2 relative">
                <span class="absolute left-3 top-2 text-slate-400 font-mono text-[11px]">Rp</span>
                <input v-model.number="form.bbl_cetak" type="number" 
                  class="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono text-right">
              </div>
            </div>
          </div>
        </div>

        <!-- Section 3: Biaya Tenaga Kerja Langsung (BTKL) -->
        <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
              3. Biaya Tenaga Kerja Langsung (BTKL)
            </h3>
            <span class="text-xs font-bold text-emerald-700 font-mono">Subtotal: {{ formatRupiah(subtotalBTKL) }}</span>
          </div>

          <div class="space-y-2 text-xs">
            <div class="flex items-center gap-3">
              <span class="w-1/2 text-slate-600">Honor Operator Entri & Validasi Data KBM</span>
              <div class="w-1/2 relative">
                <span class="absolute left-3 top-2 text-slate-400 font-mono text-[11px]">Rp</span>
                <input v-model.number="form.btkl_operator" type="number" 
                  class="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono text-right">
              </div>
            </div>
          </div>
        </div>

        <!-- Section 4: Biaya Overhead Operasional (BOP) -->
        <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-amber-600"></span>
              4. Biaya Overhead Operasional (BOP)
            </h3>
            <span class="text-xs font-bold text-amber-700 font-mono">Subtotal: {{ formatRupiah(subtotalBOP) }}</span>
          </div>

          <div class="space-y-2 text-xs">
            <div class="flex items-center gap-3">
              <span class="w-1/2 text-slate-600">Listrik, Kuota Internet & Pemeliharaan Alat</span>
              <div class="w-1/2 relative">
                <span class="absolute left-3 top-2 text-slate-400 font-mono text-[11px]">Rp</span>
                <input v-model.number="form.bop_operasional" type="number" 
                  class="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono text-right">
              </div>
            </div>
          </div>
        </div>

        <!-- Section 5: Target Laba Kotor / Margin Markup -->
        <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 class="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-rose-600"></span>
            5. Target Margin Keuntungan
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Target Nominal Laba Kotor (Rp)</label>
              <div class="relative">
                <span class="absolute left-3 top-2 text-slate-400 font-mono text-[11px]">Rp</span>
                <input v-model.number="form.targetLaba" type="number" 
                  class="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono font-bold text-blue-700">
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Margin Persentase Laba</label>
              <div class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 text-sm">
                {{ marginPercent }}%
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- KOLOM KANAN: HASIL ANALISIS HPP & REKOMENDASI (5 COLS) -->
      <div class="lg:col-span-5 space-y-5">
        
        <!-- Summary Box Utama -->
        <div class="bg-[#0B132B] text-white rounded-2xl p-6 shadow-xl space-y-6">
          <div class="border-b border-slate-800 pb-4">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hasil Perhitungan HPP</p>
            <h2 class="text-3xl font-black font-mono text-emerald-400">
              {{ formatRupiah(totalHPP) }}
            </h2>
            <p class="text-xs text-slate-400 mt-1">Biaya Pokok per unit layanan sekolah</p>
          </div>

          <!-- Breakdown Komposisi HPP -->
          <div class="space-y-3 text-xs">
            <div class="flex items-center justify-between text-slate-300">
              <span class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
                Infrastruktur & Cloud (BBL)
              </span>
              <span class="font-mono font-bold">{{ formatRupiah(subtotalBBL) }}</span>
            </div>
            <div class="flex items-center justify-between text-slate-300">
              <span class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                Tenaga Kerja Operator (BTKL)
              </span>
              <span class="font-mono font-bold">{{ formatRupiah(subtotalBTKL) }}</span>
            </div>
            <div class="flex items-center justify-between text-slate-300">
              <span class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                Overhead & Listrik (BOP)
              </span>
              <span class="font-mono font-bold">{{ formatRupiah(subtotalBOP) }}</span>
            </div>
          </div>

          <!-- Visual Bar Proporsi -->
          <div>
            <div class="w-full h-2.5 bg-slate-800 rounded-full flex overflow-hidden">
              <div class="bg-indigo-500 h-full" :style="`width: ${(subtotalBBL / totalHPP) * 100}%`"></div>
              <div class="bg-emerald-500 h-full" :style="`width: ${(subtotalBTKL / totalHPP) * 100}%`"></div>
              <div class="bg-amber-500 h-full" :style="`width: ${(subtotalBOP / totalHPP) * 100}%`"></div>
            </div>
          </div>

          <!-- Rekomendasi Harga Jual & Laba Bersih -->
          <div class="pt-4 border-t border-slate-800 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Harga Jual Rekomendasi</p>
                <p class="text-2xl font-black font-mono text-white mt-0.5">{{ formatRupiah(hargaJual) }}</p>
              </div>
              <div class="text-right">
                <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Laba Kotor Unit</p>
                <p class="text-xl font-black font-mono text-blue-400 mt-0.5">{{ formatRupiah(form.targetLaba) }}</p>
              </div>
            </div>
          </div>

          <button @click="applyToDashboard" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md text-center block cursor-pointer">
            Terapkan ke Dashboard Finansial
          </button>
        </div>

        <!-- Analisis Break Even Point (BEP) -->
        <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <h3 class="text-sm font-bold text-slate-900">Analisis Break-Even Point (BEP)</h3>
          <p class="text-xs text-slate-500 leading-relaxed">
            Dengan HPP sebesar <strong>{{ formatRupiah(totalHPP) }}</strong> dan harga jual <strong>{{ formatRupiah(hargaJual) }}</strong>, Anda mencapai titik impas pada volume 1 paket dan menghasilkan keuntungan langsung pada setiap penambahan unit berikutnya.
          </p>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
            <span class="text-slate-600 font-medium">Estimasi Omzet {{ form.volume }} Unit:</span>
            <span class="font-bold text-slate-900 font-mono">{{ formatRupiah(hargaJual * form.volume) }}</span>
          </div>
        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ROUTES } from '../config/routePaths.js'

const appliedNotification = ref(false)

// Default Parameter HPP (menghasilkan HPP 104.205 dan Laba 150.000 persis referensi user)
const defaultForm = {
  productName: 'Paket Lisensi Sistem GuruKu Terpadu',
  volume: 1,
  bbl_server: 45000,
  bbl_domain: 20000,
  bbl_cetak: 10000,
  btkl_operator: 15000,
  bop_operasional: 14205,
  targetLaba: 150000
}

const form = ref({ ...defaultForm })

const subtotalBBL = computed(() => {
  return (Number(form.value.bbl_server) || 0) + 
         (Number(form.value.bbl_domain) || 0) + 
         (Number(form.value.bbl_cetak) || 0)
})

const subtotalBTKL = computed(() => {
  return Number(form.value.btkl_operator) || 0
})

const subtotalBOP = computed(() => {
  return Number(form.value.bop_operasional) || 0
})

const totalHPP = computed(() => {
  return subtotalBBL.value + subtotalBTKL.value + subtotalBOP.value
})

const hargaJual = computed(() => {
  return totalHPP.value + (Number(form.value.targetLaba) || 0)
})

const marginPercent = computed(() => {
  if (hargaJual.value === 0) return 0
  return Math.round((form.value.targetLaba / hargaJual.value) * 100)
})

const formatRupiah = (val) => {
  return 'Rp ' + Number(val || 0).toLocaleString('id-ID')
}

const resetDefault = () => {
  form.value = { ...defaultForm }
  localStorage.setItem('guruKu_hpp_params', JSON.stringify(form.value))
}

const applyToDashboard = () => {
  // Simpan parameter HPP
  localStorage.setItem('guruKu_hpp_params', JSON.stringify(form.value))

  // Update ringkasan finansial yang dipakai oleh Dashboard Utama
  const summary = {
    penjualanBulanIni: hargaJual.value,
    pengeluaranBulanIni: totalHPP.value,
    labaKotorBulanIni: form.value.targetLaba,
    saldoKas: 8365958
  }
  localStorage.setItem('guruKu_financial_summary', JSON.stringify(summary))

  appliedNotification.value = true
  setTimeout(() => {
    appliedNotification.value = false
  }, 4000)
}

onMounted(() => {
  const saved = localStorage.getItem('guruKu_hpp_params')
  if (saved) {
    try {
      form.value = { ...defaultForm, ...JSON.parse(saved) }
    } catch (e) {}
  }
})
</script>
