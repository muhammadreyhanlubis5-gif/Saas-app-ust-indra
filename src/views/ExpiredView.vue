<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
    
    <!-- Tampilan Blokir (Default) -->
    <div v-if="!showPricing" class="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center border border-gray-100">
      <div class="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
        <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
      </div>
      <h1 class="text-2xl font-extrabold text-gray-900 mb-2">Akses Diblokir</h1>
      <p class="text-gray-600 mb-8 leading-relaxed">
        Masa aktif kontrak institusi Anda telah berakhir. Jangan biarkan operasional sekolah terhenti, perbarui kontrak Anda sekarang.
      </p>
      <div class="flex flex-col gap-3">
        <button @click="showPricing = true" class="w-full bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">
          Lihat Paket Perpanjangan
        </button>
        <button @click="backToLogin" class="w-full bg-white text-gray-700 px-6 py-3.5 rounded-xl font-bold hover:bg-gray-50 border-2 border-gray-200 transition-colors">
          Kembali ke Login
        </button>
      </div>
    </div>

    <!-- Tampilan Pricing -->
    <div v-else class="w-full max-w-6xl animate-fade-in py-8">
      <div class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Pilih Paket Eksekutif Anda</h2>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">Kami merancang paket terbaik untuk memastikan sistem penyusunan jadwal sekolah Anda berjalan mulus, cerdas, dan efisien.</p>
      </div>

      <div class="grid md:grid-cols-3 gap-8 items-center">
        <!-- Paket Standar -->
        <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-200 relative">
          <h3 class="text-xl font-bold text-gray-900 mb-2">Standard</h3>
          <p class="text-gray-500 text-sm mb-6">Cocok untuk sekolah skala kecil yang butuh dasar otomasi.</p>
          <div class="mb-6">
            <span class="text-4xl font-extrabold text-gray-900">Rp 499rb</span>
            <span class="text-gray-500 font-medium">/ bulan</span>
          </div>
          <ul class="space-y-4 mb-8">
            <li class="flex items-center gap-3 text-gray-700"><svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> <span>Akses Generate Jadwal Dasar</span></li>
            <li class="flex items-center gap-3 text-gray-700"><svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> <span>Maksimal 30 Guru Aktif</span></li>
            <li class="flex items-center gap-3 text-gray-700"><svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> <span>Cetak Laporan PDF / Excel</span></li>
            <li class="flex items-center gap-3 text-gray-400"><svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg> <span class="line-through">AI Anti-Bentrok Cerdas</span></li>
          </ul>
          <button @click="pilihPaket('Standard')" class="w-full py-3.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold rounded-xl border border-gray-200 transition-colors">Pilih Standard</button>
        </div>

        <!-- Paket Plus -->
        <div class="bg-blue-600 rounded-3xl p-8 shadow-2xl border border-blue-500 relative transform md:-translate-y-4">
          <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full text-center">
            <span class="inline-block bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-md">Paling Populer</span>
          </div>
          <h3 class="text-xl font-bold text-white mb-2">Plus</h3>
          <p class="text-blue-100 text-sm mb-6">Otomatisasi penuh dengan AI pintar tanpa repot.</p>
          <div class="mb-6">
            <span class="text-4xl font-extrabold text-white">Rp 899rb</span>
            <span class="text-blue-200 font-medium">/ bulan</span>
          </div>
          <ul class="space-y-4 mb-8">
            <li class="flex items-center gap-3 text-white"><svg class="w-5 h-5 text-blue-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> <span>Semua fitur Standard</span></li>
            <li class="flex items-center gap-3 text-white"><svg class="w-5 h-5 text-blue-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> <span>Guru & Mapel <b>Unlimited</b></span></li>
            <li class="flex items-center gap-3 text-white"><svg class="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> <span><b>Sistem AI Anti-Bentrok</b></span></li>
            <li class="flex items-center gap-3 text-white"><svg class="w-5 h-5 text-blue-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> <span>Modul Tugas Tambahan</span></li>
          </ul>
          <button @click="pilihPaket('Plus')" class="w-full py-3.5 px-4 bg-white hover:bg-gray-50 text-blue-700 font-extrabold rounded-xl shadow-lg transition-transform active:scale-95">Pilih Plus</button>
        </div>

        <!-- Paket Premium -->
        <div class="bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-800 relative">
          <h3 class="text-xl font-bold text-white mb-2">Premium</h3>
          <p class="text-gray-400 text-sm mb-6">Skala besar, yayasan, privilese dan prioritas.</p>
          <div class="mb-6">
            <span class="text-4xl font-extrabold text-white">Rp 2,5jt</span>
            <span class="text-gray-500 font-medium">/ bulan</span>
          </div>
          <ul class="space-y-4 mb-8">
            <li class="flex items-center gap-3 text-gray-300"><svg class="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> <span>Semua fitur Plus</span></li>
            <li class="flex items-center gap-3 text-gray-300"><svg class="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> <span><i>Custom Branding</i> Logo Sekolah</span></li>
            <li class="flex items-center gap-3 text-gray-300"><svg class="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> <span>Pelatihan Admin Khusus</span></li>
            <li class="flex items-center gap-3 text-gray-300"><svg class="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> <span>Support Prioritas 24/7 VIP</span></li>
          </ul>
          <button @click="pilihPaket('Premium')" class="w-full py-3.5 px-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl border border-gray-700 transition-colors">Pilih Premium</button>
        </div>
      </div>
      
      <div class="mt-12 text-center">
        <button @click="showPricing = false" class="text-gray-500 hover:text-gray-800 font-medium transition-colors">
          &larr; Kembali
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showPricing = ref(false)

const backToLogin = () => {
  localStorage.clear()
  router.push('/')
}

const pilihPaket = (paket) => {
  router.push(`/checkout?plan=${paket}`)
}
</script>
