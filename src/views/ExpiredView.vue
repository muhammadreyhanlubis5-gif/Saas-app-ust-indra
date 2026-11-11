<template>
  <div class="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
    
    <!-- Tampilan Blokir (Default Saat Masa Aktif Habis) -->
    <div v-if="!showPricing" class="bg-white p-8 rounded-3xl shadow-xl max-w-md text-center border border-slate-300 animate-fade-in">
      <div class="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-rose-200">
        <svg class="w-10 h-10 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
      </div>
      <h1 class="text-2xl font-black text-slate-900 mb-2 tracking-tight">Masa Aktif Lisensi Berakhir</h1>
      <p class="text-xs sm:text-sm text-slate-500 mb-8 leading-relaxed font-medium">
        Masa aktif kontrak sekolah Anda telah selesai. Jangan biarkan proses belajar mengajar dan jadwal sekolah terhenti, perpanjang lisensi Anda sekarang melalui paket resmi.
      </p>
      <div class="flex flex-col gap-3">
        <button @click="showPricing = true" class="w-full bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer text-xs sm:text-sm">
          Lihat Paket Perpanjangan Lisensi
        </button>
        <button @click="backToLogin" class="w-full bg-white text-slate-700 px-6 py-3.5 rounded-xl font-bold hover:bg-slate-50 border border-slate-300 transition-colors cursor-pointer text-xs sm:text-sm">
          Kembali ke Halaman Login
        </button>
      </div>
    </div>

    <!-- Tampilan Pilihan Paket (Dinamis Sesuai Etalase Produk Super Admin) -->
    <div v-else class="w-full max-w-6xl animate-fade-in py-8">
      <div class="text-center mb-10">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-3">
          Perpanjangan Lisensi GuruKu
        </span>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight">Pilih Paket Perpanjangan Sekolah Anda</h2>
        <p class="text-sm text-slate-500 max-w-2xl mx-auto font-medium">
          Paket resmi yang telah disesuaikan oleh administrator sistem. Pilih paket yang sesuai dengan kebutuhan jumlah dewan guru dan kelas institusi Anda.
        </p>
      </div>

      <!-- Grid Paket Dinamis Dari Etalase Admin -->
      <div class="grid md:grid-cols-3 gap-6 items-stretch">
        <div 
          v-for="pkg in availablePackages" 
          :key="pkg.id" 
          class="bg-white rounded-3xl p-7 shadow-xs hover:shadow-lg transition-all relative flex flex-col justify-between border"
          :class="getCardClass(pkg)"
        >
          <!-- Badge Ribbon -->
          <div v-if="pkg.isPopular || pkg.tier === 'populer'" class="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span class="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black uppercase tracking-wider py-1 px-4 rounded-full shadow-md border border-blue-400">
              ★ PALING POPULER
            </span>
          </div>

          <div v-else-if="pkg.isPremium || pkg.tier === 'premium'" class="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span class="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-700 to-indigo-800 text-white text-[11px] font-black uppercase tracking-wider py-1 px-4 rounded-full shadow-md border border-purple-400">
              👑 REKOMENDASI YAYASAN
            </span>
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
                :class="pkg.tier === 'populer' ? 'bg-blue-50 text-blue-700 border-blue-200' : (pkg.tier === 'premium' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-700 border-slate-300')">
                {{ pkg.badge || pkg.tier }}
              </span>
              <span class="text-xs font-semibold text-slate-400 font-mono">{{ pkg.durationLabel }}</span>
            </div>

            <h3 class="text-xl font-black text-slate-900 tracking-tight mt-1">{{ pkg.name }}</h3>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed min-h-[36px]">{{ pkg.description }}</p>

            <div class="my-5 pt-4 border-t border-slate-200">
              <span class="text-3xl font-black text-slate-900 font-mono tracking-tight">{{ formatRupiah(pkg.price) }}</span>
              <span class="text-xs text-slate-500 font-medium"> / {{ pkg.durationMonths >= 12 ? 'tahun' : 'semester' }}</span>
            </div>

            <ul class="space-y-2.5 mb-8 text-xs">
              <li v-for="(feat, idx) in pkg.features" :key="idx" class="flex items-start gap-2.5 text-slate-700">
                <svg class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                <span>{{ feat }}</span>
              </li>
            </ul>
          </div>

          <button 
            @click="pilihPaket(pkg)" 
            class="w-full py-3.5 px-4 font-black rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer text-xs sm:text-sm border"
            :class="pkg.tier === 'populer' ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-md shadow-blue-500/20' : (pkg.tier === 'premium' ? 'bg-purple-700 hover:bg-purple-800 text-white border-purple-700' : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900')"
          >
            Pilih {{ pkg.name }}
          </button>
        </div>
      </div>
      
      <div class="mt-10 text-center">
        <button @click="showPricing = false" class="text-slate-500 hover:text-slate-900 font-bold text-xs sm:text-sm transition-colors cursor-pointer inline-flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          <span>Kembali ke Halaman Status</span>
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTES } from '../config/routePaths.js'
import { getStoredPackages } from '../data/packagesCatalog.js'

const router = useRouter()
const showPricing = ref(false)
const availablePackages = ref([])

onMounted(() => {
  availablePackages.value = getStoredPackages()
})

const backToLogin = () => {
  localStorage.clear()
  router.push('/')
}

const pilihPaket = (pkg) => {
  router.push({
    path: ROUTES.CHECKOUT,
    query: {
      plan: pkg.name,
      price: pkg.price,
      duration: pkg.durationMonths
    }
  })
}

const formatRupiah = (val) => {
  return 'Rp ' + Number(val || 0).toLocaleString('id-ID')
}

const getCardClass = (pkg) => {
  if (pkg.tier === 'populer' || pkg.isPopular) {
    return 'border-2 border-blue-600 ring-4 ring-blue-50 md:-translate-y-2'
  }
  if (pkg.tier === 'premium' || pkg.isPremium) {
    return 'border-2 border-purple-600 ring-4 ring-purple-50'
  }
  return 'border border-slate-300'
}
</script>
