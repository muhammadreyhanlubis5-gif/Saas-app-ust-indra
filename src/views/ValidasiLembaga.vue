<template>
  <div class="max-w-4xl mx-auto">
    
    <div class="flex items-center gap-4 mb-8">
      <router-link to="/admin-sekolah" class="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 border border-gray-100 transition-colors">
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      </router-link>
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Tahap 1: Validasi Lembaga</h1>
        <p class="text-gray-500 text-sm">Lengkapi identitas sekolah dan hari aktif Kegiatan Belajar Mengajar (KBM)</p>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">Memuat data lembaga...</p>
    </div>
    
    <form v-else @submit.prevent="saveProfile" class="space-y-8">
      
      <!-- Section Identitas -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="bg-blue-600 px-6 py-4 border-b border-blue-700">
          <h2 class="font-bold text-white flex items-center gap-2">
            <svg class="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            Data Master Identitas
          </h2>
        </div>
        
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          
          <div class="md:col-span-2">
            <label class="block text-sm font-bold text-gray-700 mb-1">NAMA SEKOLAH/MADRASAH</label>
            <input type="text" :value="profile.name" disabled class="w-full bg-gray-100 text-gray-700 border border-gray-300 rounded-lg px-4 py-2.5 outline-none font-bold cursor-not-allowed">
            <p class="text-[10px] text-gray-500 mt-1">*Nama sekolah dikunci dan telah tervalidasi oleh Super Admin.</p>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Nama Kepala Sekolah</label>
            <input v-model="profile.headmaster_name" type="text" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Masukkan Nama Lengkap beserta Gelar">
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Nama Wakasek Bid. Kurikulum</label>
            <input v-model="profile.vice_headmaster_name" type="text" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Masukkan Nama Lengkap beserta Gelar">
          </div>

          <div class="md:col-span-2 relative">
            <label class="block text-sm font-bold text-gray-700 mb-1">Lokasi Sekolah / Alamat</label>
            <input 
              v-model="profile.address" 
              @input="searchAddress"
              @focus="showAddressSuggestions = true"
              type="text" 
              class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Ketik nama sekolah atau jalan untuk mencari alamat otomatis..."
            >
            <!-- Dropdown Sugesti -->
            <ul v-if="showAddressSuggestions && addressSuggestions.length > 0" class="absolute z-50 w-full mt-1 bg-white border border-gray-200 shadow-xl rounded-lg max-h-60 overflow-y-auto divide-y divide-gray-100">
              <li 
                v-for="(sug, index) in addressSuggestions" 
                :key="index"
                @click="selectAddress(sug)"
                class="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <p class="text-sm font-bold text-gray-800">{{ extractSchoolName(sug.display_name) }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ sug.display_name }}</p>
              </li>
            </ul>
            <div v-if="isSearchingAddress" class="absolute right-3 top-9">
              <svg class="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Tahun Pelajaran</label>
            <select v-model="profile.academic_year" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Pilih Tahun Pelajaran</option>
              <option value="2024-2025">2024 - 2025</option>
              <option value="2025-2026">2025 - 2026</option>
              <option value="2026-2027">2026 - 2027</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Semester</label>
            <select v-model="profile.semester" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Pilih Semester</option>
              <option value="GANJIL">Ganjil</option>
              <option value="GENAP">Genap</option>
            </select>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-bold text-gray-700 mb-1">Tanggal Pembuatan Jadwal</label>
            <input v-model="profile.schedule_date" type="date" class="w-full md:w-1/2 bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none">
          </div>

        </div>
      </div>

      <!-- Section Hari Aktif KBM -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="bg-indigo-600 px-6 py-4 border-b border-indigo-700">
          <h2 class="font-bold text-white flex items-center gap-2">
            <svg class="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Hari Pelaksanaan KBM
          </h2>
          <p class="text-xs text-indigo-200 mt-1">Centang hari-hari dimana kegiatan belajar mengajar aktif di sekolah Anda.</p>
        </div>
        
        <div class="p-6">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <label v-for="day in availableDays" :key="day" :class="{'bg-indigo-50 border-indigo-300': profile.active_days.includes(day)}" class="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input type="checkbox" :value="day" v-model="profile.active_days" class="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500">
              <span class="font-bold text-gray-700" :class="{'text-indigo-800': profile.active_days.includes(day)}">{{ day }}</span>
            </label>
          </div>
        </div>
      </div>

      <div class="flex justify-end pt-4">
        <button type="submit" :disabled="saving" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all flex items-center gap-2">
          <svg v-if="!saving" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          <span v-if="saving">Menyimpan...</span>
          <span v-else>Simpan Validasi Lembaga</span>
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const loading = ref(true)
const saving = ref(false)

const availableDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

const profile = ref({
  name: '',
  headmaster_name: '',
  vice_headmaster_name: '',
  address: '',
  academic_year: '',
  semester: '',
  schedule_date: '',
  active_days: []
})

const schoolId = localStorage.getItem('school_id')

// Fitur Pencarian Alamat Otomatis
const showAddressSuggestions = ref(false)
const addressSuggestions = ref([])
const isSearchingAddress = ref(false)
let searchTimeout = null

const searchAddress = () => {
  if (profile.value.address.length < 3) {
    addressSuggestions.value = []
    showAddressSuggestions.value = false
    return
  }
  
  isSearchingAddress.value = true
  showAddressSuggestions.value = true
  
  if (searchTimeout) clearTimeout(searchTimeout)
  
  searchTimeout = setTimeout(async () => {
    try {
      // Menggunakan Nominatim OpenStreetMap (Gratis & Terbuka, tanpa API Key)
      // Ditambahkan keyword 'sekolah' agar lebih spesifik
      const query = encodeURIComponent(profile.value.address + ' sekolah')
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&countrycodes=id&limit=5`, {
        headers: {
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      })
      if (res.ok) {
        addressSuggestions.value = await res.json()
      }
    } catch (e) {
      console.error("Gagal mencari alamat", e)
    } finally {
      isSearchingAddress.value = false
    }
  }, 600) // 600ms debounce
}

const selectAddress = (suggestion) => {
  profile.value.address = suggestion.display_name
  showAddressSuggestions.value = false
}

// Fungsi bantu untuk memisahkan nama sekolah utama dari alamat panjang
const extractSchoolName = (displayName) => {
  const parts = displayName.split(',')
  return parts[0]
}

// Tutup dropdown jika klik di luar form
const handleClickOutside = (e) => {
  if (showAddressSuggestions.value && !e.target.closest('.md\\:col-span-2.relative')) {
    showAddressSuggestions.value = false
  }
}

const fetchProfile = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/v1/school/profile', {
      headers: {
        'X-School-ID': schoolId || ''
      }
    })
    if (res.ok) {
      const data = await res.json()
      profile.value = {
        name: data.name || '',
        headmaster_name: data.headmaster_name || '',
        vice_headmaster_name: data.vice_headmaster_name || '',
        address: data.address || '',
        academic_year: data.academic_year || '',
        semester: data.semester || '',
        schedule_date: data.schedule_date || '',
        active_days: data.active_days || []
      }
      
      // Update global store / event bus to update the welcome header if needed
    }
  } catch (err) {
    console.error("Error fetching profile", err)
  } finally {
    loading.value = false
  }
}

const saveProfile = async () => {
  saving.value = true
  try {
    const res = await fetch('/api/v1/school/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-School-ID': schoolId || ''
      },
      body: JSON.stringify({
        headmaster_name: profile.value.headmaster_name,
        vice_headmaster_name: profile.value.vice_headmaster_name,
        address: profile.value.address,
        academic_year: profile.value.academic_year,
        semester: profile.value.semester,
        schedule_date: profile.value.schedule_date,
        active_days: profile.value.active_days
      })
    })
    
    if (res.ok) {
      alert("Validasi Lembaga berhasil disimpan!")
    } else {
      alert("Gagal menyimpan data")
    }
  } catch (err) {
    alert("Terjadi kesalahan jaringan")
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchProfile()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
