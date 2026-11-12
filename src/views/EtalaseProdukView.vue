<template>
  <div class="animate-fade-in-up p-4 md:p-8 max-w-[1440px] mx-auto space-y-6 font-sans">
    
    <!-- Header Halaman -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-300">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <router-link :to="ROUTES.SUPER_ADMIN" class="text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
            Dashboard
          </router-link>
          <span class="text-slate-300">/</span>
          <span class="text-xs font-bold text-slate-700">Etalase Produk & Paket Layanan</span>
        </div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          Etalase Produk & Paket Layanan
        </h1>
        <p class="text-xs md:text-sm text-slate-500 font-medium mt-1">
          Kelola katalog lisensi GuruKu, custom paket (nama, deskripsi, harga), tandai paket Populer / Premium / Standar, dan tersambung langsung dengan perpanjangan langganan klien sekolah.
        </p>
      </div>

      <div class="flex items-center gap-2.5 flex-wrap">
        <button 
          @click="openAddModal" 
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          <span>Tambah Paket Baru</span>
        </button>

        <button 
          @click="resetToDefaultPackages" 
          class="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          title="Kembalikan paket ke setelan standar bawaan"
        >
          <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          <span>Reset Standar</span>
        </button>
      </div>
    </div>

    <!-- Alert Notifikasi Sukses -->
    <div v-if="notificationMsg" class="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-2xs animate-fade-in">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>{{ notificationMsg }}</span>
      </div>
      <button @click="notificationMsg = ''" class="text-emerald-700 hover:text-emerald-900 cursor-pointer p-0.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>

    <!-- 4 Ringkasan Statistik Paket (Border Tipis Rapi) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-300 shadow-xs">
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">TOTAL PAKET AKTIF</p>
        <div class="text-2xl font-black text-slate-900 font-mono">{{ packages.length }} Paket</div>
        <p class="text-[11px] text-slate-500 font-medium mt-1">Siap dipilih klien saat perpanjangan</p>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-300 shadow-xs">
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">PAKET PALING POPULER</p>
        <div class="text-base font-black text-blue-600 truncate mt-1">{{ popularPackage?.name || 'Belum diatur' }}</div>
        <p class="text-[11px] text-slate-500 font-medium mt-1">{{ popularPackage ? formatRupiah(popularPackage.price) : '-' }} &bull; Rekomendasi Utama</p>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-300 shadow-xs">
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">PAKET TERTINGGI (PREMIUM)</p>
        <div class="text-base font-black text-purple-700 truncate mt-1">{{ premiumPackage?.name || 'Belum diatur' }}</div>
        <p class="text-[11px] text-slate-500 font-medium mt-1">{{ premiumPackage ? formatRupiah(premiumPackage.price) : '-' }} &bull; Fitur Lengkap VIP</p>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-300 shadow-xs">
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">RENTANG HARGA LISENSI</p>
        <div class="text-base font-black text-slate-900 font-mono mt-1">{{ priceRangeText }}</div>
        <p class="text-[11px] text-slate-500 font-medium mt-1">Fleksibel untuk semua ukuran sekolah</p>
      </div>
    </div>

    <!-- Filter Tab: Semua, Populer, Premium, Standar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-300 shadow-xs">
      <div class="flex items-center gap-1.5 flex-wrap">
        <button 
          @click="activeFilter = 'all'" 
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border"
          :class="activeFilter === 'all' ? 'bg-slate-900 text-white border-slate-900 shadow-2xs' : 'text-slate-600 border-slate-300 bg-white hover:bg-slate-50'"
        >
          Semua Paket ({{ packages.length }})
        </button>

        <button 
          @click="activeFilter = 'populer'" 
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border"
          :class="activeFilter === 'populer' ? 'bg-blue-600 text-white border-blue-600 shadow-2xs' : 'text-slate-600 border-slate-300 bg-white hover:bg-slate-50'"
        >
          Paket Populer ({{ popularCount }})
        </button>

        <button 
          @click="activeFilter = 'premium'" 
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border"
          :class="activeFilter === 'premium' ? 'bg-purple-700 text-white border-purple-700 shadow-2xs' : 'text-slate-600 border-slate-300 bg-white hover:bg-slate-50'"
        >
          Paket Premium ({{ premiumCount }})
        </button>

        <button 
          @click="activeFilter = 'standar'" 
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border"
          :class="activeFilter === 'standar' ? 'bg-slate-700 text-white border-slate-700 shadow-2xs' : 'text-slate-600 border-slate-300 bg-white hover:bg-slate-50'"
        >
          Paket Standar ({{ standardCount }})
        </button>
      </div>

      <!-- Quick Info Sync -->
      <div class="text-[11px] text-slate-500 flex items-center gap-2 self-start sm:self-center">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Tersambung Real-time ke Gerbang Perpanjangan Klien</span>
      </div>
    </div>

    <!-- Grid Kartu Paket Layanan (Custom Admin) -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      <div 
        v-for="pkg in filteredPackages" 
        :key="pkg.id" 
        class="bg-white rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative border"
        :class="getCardBorderClass(pkg)"
      >
        <!-- Badge Populer / Premium / Standar Floating -->
        <div v-if="pkg.isPopular || pkg.tier === 'populer'" class="absolute -top-3.5 right-6 z-10">
          <span class="inline-flex items-center bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider py-1 px-3.5 rounded-full shadow-md border border-blue-400">
            POPULER
          </span>
        </div>

        <div v-else-if="pkg.isPremium || pkg.tier === 'premium'" class="absolute -top-3.5 right-6 z-10">
          <span class="inline-flex items-center bg-purple-700 text-white text-[11px] font-black uppercase tracking-wider py-1 px-3.5 rounded-full shadow-md border border-purple-400">
            PREMIUM VIP
          </span>
        </div>

        <div>
          <!-- Header Card & Category Tag -->
          <div class="flex items-center justify-between gap-2 mb-3">
            <span 
              class="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border"
              :class="getBadgeClass(pkg)"
            >
              {{ pkg.badge || pkg.tier }}
            </span>
            <span class="text-xs font-semibold text-slate-500 font-mono">
              {{ pkg.durationLabel || `${pkg.durationMonths} Bulan` }}
            </span>
          </div>

          <!-- Nama Paket -->
          <h3 class="font-black text-slate-900 text-xl tracking-tight leading-snug">
            {{ pkg.name }}
          </h3>

          <!-- Deskripsi Paket -->
          <p class="text-xs text-slate-500 mt-2 leading-relaxed min-h-[38px]">
            {{ pkg.description }}
          </p>

          <!-- Harga Paket -->
          <div class="my-5 pt-4 border-t border-slate-200">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Harga Langganan Resmi</span>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span class="text-3xl font-black text-slate-900 font-mono tracking-tight">{{ formatRupiah(pkg.price) }}</span>
              <span class="text-xs text-slate-500 font-medium">/ {{ pkg.durationMonths >= 12 ? 'tahun' : 'semester' }}</span>
            </div>
          </div>

          <!-- Daftar Fitur / Benefit -->
          <div class="space-y-2.5 my-5">
            <p class="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Fitur & Cakupan Layanan:</p>
            <ul class="space-y-2 text-xs">
              <li 
                v-for="(feat, fIdx) in pkg.features" 
                :key="fIdx" 
                class="flex items-start gap-2.5 text-slate-700"
              >
                <svg class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <span class="leading-tight">{{ feat }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Tombol Aksi Admin & Manajemen Tingkatan -->
        <div class="pt-5 border-t border-slate-200 space-y-3">
          
          <!-- Baris Cepat Ubah Tingkatan (Populer / Premium / Standar) -->
          <div>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Atur Tingkatan Paket:</span>
            <div class="grid grid-cols-3 gap-1.5 text-[10px]">
              <button 
                @click="setPackageTier(pkg.id, 'standar')"
                class="py-1 px-1.5 rounded-lg font-bold border transition-colors cursor-pointer text-center"
                :class="pkg.tier === 'standar' ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'"
              >
                Standar
              </button>

              <button 
                @click="setPackageTier(pkg.id, 'populer')"
                class="py-1 px-1.5 rounded-lg font-bold border transition-colors cursor-pointer text-center"
                :class="pkg.tier === 'populer' ? 'bg-blue-600 text-white border-blue-600 shadow-2xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'"
              >
                Populer
              </button>

              <button 
                @click="setPackageTier(pkg.id, 'premium')"
                class="py-1 px-1.5 rounded-lg font-bold border transition-colors cursor-pointer text-center"
                :class="pkg.tier === 'premium' ? 'bg-purple-700 text-white border-purple-700 shadow-2xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'"
              >
                Premium
              </button>
            </div>
          </div>

          <!-- Action Buttons: Edit, Hapus, & Pratinjau Klien -->
          <div class="flex items-center gap-2 pt-1">
            <button 
              @click="openEditModal(pkg)" 
              class="flex-1 py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              <span>Edit Paket</span>
            </button>

            <button 
              @click="confirmDeletePackage(pkg)" 
              class="p-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer"
              title="Hapus Paket"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>

          <!-- Tombol Simulasi Perpanjangan Klien -->
          <button 
            @click="testClientRenewal(pkg)"
            class="w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border"
            :class="pkg.tier === 'populer' ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-xs' : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'"
          >
            <span>Terapkan / Uji Perpanjangan Klien</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </button>
        </div>

      </div>

    </div>

    <!-- MODAL TAMBAH / EDIT PAKET (CUSTOM ADMIN LENGKAP) -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-fade-in">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-300 max-h-[90vh] flex flex-col overflow-hidden">
        
        <!-- Header Modal -->
        <div class="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h3 class="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {{ isEditing ? 'Edit Paket Layanan' : 'Tambah Paket Layanan Baru' }}
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">Konfigurasi nama, durasi, harga, tingkatan, dan benefit paket.</p>
          </div>
          <button @click="showModal = false" class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Body Form Modal (Scrollable) -->
        <form @submit.prevent="savePackage" class="p-5 overflow-y-auto custom-scrollbar space-y-4 text-xs">
          
          <!-- Nama Paket -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nama Paket Layanan *</label>
            <input 
              v-model="pkgForm.name" 
              type="text" 
              required 
              placeholder="Contoh: Lisensi Semester Genap 2026/2027" 
              class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 text-xs sm:text-sm"
            />
          </div>

          <!-- Tingkatan & Badge -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Tingkatan / Kategori *</label>
              <select 
                v-model="pkgForm.tier" 
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900"
              >
                <option value="standar">Standar (Reguler)</option>
                <option value="populer">Populer (Paling Diminati)</option>
                <option value="premium">Premium (VIP / Yayasan)</option>
                <option value="enterprise">Enterprise (Kustom)</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Label Badge</label>
              <input 
                v-model="pkgForm.badge" 
                type="text" 
                placeholder="Contoh: Populer / VIP" 
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 font-semibold"
              />
            </div>
          </div>

          <!-- Harga & Durasi -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Harga Langganan (Rp) *</label>
              <input 
                v-model.number="pkgForm.price" 
                type="number" 
                min="10000" 
                required 
                placeholder="Contoh: 480000" 
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Masa Aktif (Bulan) *</label>
              <select 
                v-model.number="pkgForm.durationMonths" 
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900"
              >
                <option :value="1">1 Bulan</option>
                <option :value="3">3 Bulan</option>
                <option :value="6">6 Bulan (1 Semester)</option>
                <option :value="12">12 Bulan (1 Tahun Penuh)</option>
                <option :value="24">24 Bulan (2 Tahun)</option>
              </select>
            </div>
          </div>

          <!-- Deskripsi Paket -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">Deskripsi Singkat Paket</label>
            <textarea 
              v-model="pkgForm.description" 
              rows="2" 
              placeholder="Jelaskan secara ringkas siapa target sekolah dan keunggulan paket ini..." 
              class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
            ></textarea>
          </div>

          <!-- Fitur & Benefit (Bisa ditambah / dihapus secara dinamis) -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="font-bold text-slate-700">Daftar Fitur / Benefit Layanan:</label>
              <button 
                type="button" 
                @click="addFeatureInput" 
                class="text-blue-600 hover:text-blue-800 font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                + Tambah Poin Fitur
              </button>
            </div>

            <div class="space-y-2">
              <div 
                v-for="(feat, idx) in pkgForm.features" 
                :key="idx" 
                class="flex items-center gap-2"
              >
                <input 
                  v-model="pkgForm.features[idx]" 
                  type="text" 
                  placeholder="Cth: Akses Generator Jadwal KBM Otomatis" 
                  class="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                />
                <button 
                  type="button" 
                  @click="removeFeatureInput(idx)" 
                  class="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                  title="Hapus baris fitur"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Footer Actions Modal -->
          <div class="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button 
              type="button" 
              @click="showModal = false" 
              class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button 
              type="submit" 
              class="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {{ isEditing ? 'Simpan Perubahan' : 'Buat Paket Sekarang' }}
            </button>
          </div>

        </form>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTES } from '../config/routePaths.js'
import { 
  getStoredPackages, 
  saveStoredPackages, 
  DEFAULT_PACKAGES 
} from '../data/packagesCatalog.js'

const router = useRouter()
const packages = ref([])
const activeFilter = ref('all')
const notificationMsg = ref('')

// Modal State
const showModal = ref(false)
const isEditing = ref(false)
const currentEditId = ref(null)

const pkgForm = ref({
  name: '',
  tier: 'standar',
  badge: 'Standar',
  price: 254205,
  durationMonths: 6,
  description: '',
  features: []
})

// Load data saat mount
onMounted(() => {
  packages.value = getStoredPackages()
})

// Filtered packages
const filteredPackages = computed(() => {
  if (activeFilter.value === 'all') return packages.value
  return packages.value.filter(p => p.tier === activeFilter.value)
})

// Count by tier
const popularCount = computed(() => packages.value.filter(p => p.tier === 'populer' || p.isPopular).length)
const premiumCount = computed(() => packages.value.filter(p => p.tier === 'premium' || p.isPremium).length)
const standardCount = computed(() => packages.value.filter(p => p.tier === 'standar').length)

// Summary highlight packages
const popularPackage = computed(() => packages.value.find(p => p.tier === 'populer' || p.isPopular) || packages.value[0])
const premiumPackage = computed(() => packages.value.find(p => p.tier === 'premium' || p.isPremium) || packages.value[packages.value.length - 1])

const priceRangeText = computed(() => {
  if (!packages.value.length) return 'Rp 0'
  const prices = packages.value.map(p => Number(p.price) || 0)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return `${formatRupiah(min)} - ${formatRupiah(max)}`
})

// Open Add Modal
const openAddModal = () => {
  isEditing.value = false
  currentEditId.value = null
  pkgForm.value = {
    name: '',
    tier: 'standar',
    badge: 'Standar',
    price: 250000,
    durationMonths: 6,
    description: '',
    features: [
      'Akses Generator Jadwal KBM Otomatis',
      'Validasi Jam Bentrok Guru & Ruang',
      'Ekspor Cetak PDF F4 / B4 & Excel'
    ]
  }
  showModal.value = true
}

// Open Edit Modal
const openEditModal = (pkg) => {
  isEditing.value = true
  currentEditId.value = pkg.id
  pkgForm.value = {
    name: pkg.name,
    tier: pkg.tier || 'standar',
    badge: pkg.badge || pkg.tier,
    price: pkg.price,
    durationMonths: pkg.durationMonths || 6,
    description: pkg.description || '',
    features: [...(pkg.features || [])]
  }
  showModal.value = true
}

// Tambah/Hapus Poin Fitur di Form
const addFeatureInput = () => {
  pkgForm.value.features.push('')
}

const removeFeatureInput = (index) => {
  pkgForm.value.features.splice(index, 1)
}

// Simpan Paket (Tambah atau Update)
const savePackage = () => {
  if (!pkgForm.value.name || !pkgForm.value.price) return

  const cleanFeatures = pkgForm.value.features.filter(f => f.trim().length > 0)
  const durationText = pkgForm.value.durationMonths >= 12 
    ? `${pkgForm.value.durationMonths} Bulan (${Math.floor(pkgForm.value.durationMonths / 12)} Tahun)` 
    : `${pkgForm.value.durationMonths} Bulan (${pkgForm.value.durationMonths === 6 ? '1 Semester' : 'Periode Khusus'})`

  if (isEditing.value && currentEditId.value) {
    const idx = packages.value.findIndex(p => p.id === currentEditId.value)
    if (idx !== -1) {
      packages.value[idx] = {
        ...packages.value[idx],
        name: pkgForm.value.name,
        tier: pkgForm.value.tier,
        badge: pkgForm.value.badge || pkgForm.value.tier.toUpperCase(),
        price: Number(pkgForm.value.price),
        durationMonths: Number(pkgForm.value.durationMonths),
        durationLabel: durationText,
        description: pkgForm.value.description,
        features: cleanFeatures,
        isPopular: pkgForm.value.tier === 'populer',
        isPremium: pkgForm.value.tier === 'premium'
      }
      showToastNotification(`Paket "${pkgForm.value.name}" berhasil diperbarui & otomatis tersambung ke sistem klien!`)
    }
  } else {
    const newPkg = {
      id: `pkg-${Date.now()}`,
      name: pkgForm.value.name,
      tier: pkgForm.value.tier,
      badge: pkgForm.value.badge || pkgForm.value.tier.toUpperCase(),
      price: Number(pkgForm.value.price),
      durationMonths: Number(pkgForm.value.durationMonths),
      durationLabel: durationText,
      description: pkgForm.value.description,
      features: cleanFeatures,
      isActive: true,
      isPopular: pkgForm.value.tier === 'populer',
      isPremium: pkgForm.value.tier === 'premium'
    }
    packages.value.push(newPkg)
    showToastNotification(`Paket baru "${newPkg.name}" berhasil diterbitkan ke etalase & terhubung ke sistem langganan!`)
  }

  saveStoredPackages(packages.value)
  showModal.value = false
}

// Cepat ubah tingkatan (Standar / Populer / Premium)
const setPackageTier = (pkgId, newTier) => {
  const target = packages.value.find(p => p.id === pkgId)
  if (!target) return

  target.tier = newTier
  target.badge = newTier.charAt(0).toUpperCase() + newTier.slice(1)
  target.isPopular = (newTier === 'populer')
  target.isPremium = (newTier === 'premium')

  saveStoredPackages(packages.value)
  showToastNotification(`Tingkatan paket "${target.name}" diubah menjadi ${newTier.toUpperCase()}`)
}

// Hapus Paket
const confirmDeletePackage = (pkg) => {
  if (packages.value.length <= 1) {
    alert('Minimal harus ada 1 paket aktif dalam katalog layanan!')
    return
  }
  if (confirm(`Apakah Anda yakin ingin menghapus paket "${pkg.name}" dari etalase?`)) {
    packages.value = packages.value.filter(p => p.id !== pkg.id)
    saveStoredPackages(packages.value)
    showToastNotification(`Paket "${pkg.name}" berhasil dihapus dari katalog etalase.`)
  }
}

// Reset ke setelan standar bawaan
const resetToDefaultPackages = () => {
  if (confirm('Kembalikan seluruh paket lisensi ke setelan standar resmi GuruKu?')) {
    packages.value = JSON.parse(JSON.stringify(DEFAULT_PACKAGES))
    saveStoredPackages(packages.value)
    showToastNotification('Seluruh paket lisensi berhasil direset ke standar resmi!')
  }
}

// Uji Alur Perpanjangan Klien Langsung (Redirect ke Checkout)
const testClientRenewal = (pkg) => {
  showToastNotification(`Mengarahkan simulasi perpanjangan klien untuk "${pkg.name}"...`)
  setTimeout(() => {
    router.push({
      path: ROUTES.CHECKOUT,
      query: {
        plan: pkg.name,
        price: pkg.price,
        duration: pkg.durationMonths
      }
    })
  }, 400)
}

const showToastNotification = (msg) => {
  notificationMsg.value = msg
  setTimeout(() => {
    if (notificationMsg.value === msg) {
      notificationMsg.value = ''
    }
  }, 5000)
}

const formatRupiah = (val) => {
  return 'Rp ' + Number(val || 0).toLocaleString('id-ID')
}

const getCardBorderClass = (pkg) => {
  if (pkg.tier === 'populer' || pkg.isPopular) {
    return 'border-2 border-blue-600 ring-4 ring-blue-50'
  }
  if (pkg.tier === 'premium' || pkg.isPremium) {
    return 'border-2 border-purple-600 ring-4 ring-purple-50'
  }
  return 'border border-slate-300'
}

const getBadgeClass = (pkg) => {
  if (pkg.tier === 'populer' || pkg.isPopular) {
    return 'bg-blue-50 text-blue-700 border-blue-200'
  }
  if (pkg.tier === 'premium' || pkg.isPremium) {
    return 'bg-purple-50 text-purple-700 border-purple-200'
  }
  return 'bg-slate-100 text-slate-700 border-slate-300'
}
</script>
