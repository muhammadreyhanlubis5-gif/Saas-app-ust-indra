<template>
  <div class="flex h-screen bg-gray-50 font-sans overflow-hidden">
    
    <!-- Sidebar Navigation -->
    <aside class="w-64 bg-gray-900 text-white flex flex-col h-full z-10 shadow-xl">
      <!-- Sidebar Header -->
      <div class="p-5 border-b border-gray-800 flex items-center gap-3">
        <div class="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl">
          SA
        </div>
        <div>
          <h2 class="font-bold text-white text-lg">Super Admin</h2>
          <p class="text-xs text-gray-400">SaaS Management</p>
        </div>
      </div>

      <!-- Navigation Links -->
      <div class="flex-1 overflow-y-auto py-6 px-3 space-y-2 custom-scrollbar">
        
        <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-600 text-white font-medium transition-colors">
          <svg class="w-5 h-5 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          Manajemen Klien
        </a>
        
        <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
          <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          Laporan Pendapatan
        </a>

        <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
          <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          Pengaturan Sistem
        </a>
        
      </div>

      <!-- Sidebar Footer / Logout -->
      <div class="p-4 border-t border-gray-800">
        <button @click="handleLogout" class="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Keluar (Log Out)
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 overflow-y-auto bg-gray-50 p-8">
      
      <div class="flex justify-between items-end mb-8">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Super Admin Dashboard</h1>
          <p class="text-gray-500 mt-1 font-medium">Manajemen Lisensi & Klien SaaS Multi-Tenant</p>
        </div>
      </div>

      <!-- Table of Tenants (Schools) -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-800">Daftar Klien Sekolah (Tenants)</h2>
          <button @click="showModal = true" class="bg-indigo-600 text-white px-5 py-2.5 rounded-lg shadow-sm hover:bg-indigo-700 font-semibold transition-colors flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Tambah Klien Baru
          </button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border-b border-gray-200">
            <thead>
              <tr class="bg-gray-50 text-left border-y border-gray-200">
                <th class="py-4 px-5 uppercase font-bold text-xs text-gray-500 tracking-wider">Nama Sekolah</th>
                <th class="py-4 px-5 uppercase font-bold text-xs text-gray-500 tracking-wider">Kontak & Asal</th>
                <th class="py-4 px-5 uppercase font-bold text-xs text-gray-500 tracking-wider">Username Admin</th>
                <th class="py-4 px-5 uppercase font-bold text-xs text-gray-500 tracking-wider">Status & Batas Waktu</th>
                <th class="py-4 px-5 uppercase font-bold text-xs text-gray-500 tracking-wider">Jumlah Guru / Mapel</th>
                <th class="py-4 px-5 uppercase font-bold text-xs text-gray-500 tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="text-gray-700 divide-y divide-gray-100">
              <tr v-if="loading"><td colspan="6" class="text-center py-4">Memuat data...</td></tr>
              <tr v-else-if="schools.length === 0"><td colspan="6" class="text-center py-4">Belum ada klien sekolah terdaftar.</td></tr>
              <tr v-for="school in schools" :key="school.id" :class="{'bg-red-50/30': isExpired(school.valid_until)}" class="hover:bg-gray-50 transition-colors">
                <td class="py-4 px-5">
                  <div class="font-bold text-gray-800">{{ school.name }}</div>
                  <div class="text-xs text-gray-500 font-semibold mt-1">Metode: {{ school.payment_method || '-' }} (Rp {{ school.payment_amount || 0 }})</div>
                </td>
                <td class="py-4 px-5">
                  <div class="font-medium text-gray-800 text-sm">{{ school.contact_number || '-' }}</div>
                  <div class="text-xs text-gray-500 mt-1">{{ school.address || '-' }}</div>
                </td>
                <td class="py-4 px-5 font-bold text-indigo-600 text-sm">{{ school.admin_username }}</td>
                <td class="py-4 px-5">
                  <span v-if="!isExpired(school.valid_until)" class="bg-green-100 text-green-700 border border-green-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase mb-1 inline-block">Aktif</span>
                  <span v-else class="bg-red-100 text-red-700 border border-red-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase mb-1 inline-block">Expired</span>
                  <div class="font-medium text-gray-600 text-xs">{{ formatDate(school.valid_until) }}</div>
                </td>
                <td class="py-4 px-5 text-sm">
                  <div class="font-bold text-gray-700">{{ school.teacher_count }} Guru</div>
                  <div class="font-medium text-gray-500 text-xs">{{ school.subject_count }} Bidang Studi</div>
                </td>
                <td class="py-4 px-5 text-right whitespace-nowrap">
                  <button class="text-indigo-600 hover:text-indigo-800 font-bold text-sm mr-3 transition-colors">Edit</button>
                  <button @click="blockSchool(school.id)" class="text-yellow-600 hover:text-yellow-800 font-bold text-sm mr-3 transition-colors">Blokir</button>
                  <button @click="deleteSchool(school.id, school.name)" class="text-red-600 hover:text-red-800 font-bold text-sm transition-colors">Hapus</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Modal Tambah Klien -->
    <div v-if="showModal" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
          <h2 class="text-xl font-bold text-gray-800">Tambah Klien Sekolah Baru</h2>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form @submit.prevent="submitKlien" class="p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Info Sekolah -->
            <div class="space-y-4">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Informasi Instansi</h3>
              
              <div class="relative">
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lembaga / Sekolah *</label>
                <input 
                  v-model="form.name" 
                  @input="searchSchool"
                  @focus="showSchoolSuggestions = true"
                  type="text" 
                  required 
                  class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="Ketik nama sekolah untuk mencari otomatis..."
                >
                <!-- Dropdown Sugesti -->
                <ul v-if="showSchoolSuggestions && schoolSuggestions.length > 0" class="absolute z-50 w-full mt-1 bg-white border border-gray-200 shadow-xl rounded-lg max-h-60 overflow-y-auto divide-y divide-gray-100">
                  <li 
                    v-for="(sug, index) in schoolSuggestions" 
                    :key="index"
                    @click="selectSchool(sug)"
                    class="px-4 py-3 hover:bg-indigo-50 cursor-pointer transition-colors"
                  >
                    <p class="text-sm font-bold text-gray-800">{{ extractSchoolName(sug.display_name) }}</p>
                    <p class="text-xs text-gray-500 mt-0.5">{{ sug.display_name }}</p>
                  </li>
                </ul>
                <div v-if="isSearchingSchool" class="absolute right-3 top-9">
                  <svg class="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Asal Sekolah (Alamat)</label>
                <input v-model="form.address" type="text" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Masukkan alamat lengkap sekolah">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nomor Aktif Klien (Kontak)</label>
                <input v-model="form.contact_number" type="text" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Masukkan nomor yang bisa dihubungi">
              </div>
            </div>

            <!-- Detail Kontrak & Akun -->
            <div class="space-y-4">
               <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Detail Kontrak & Kredensial</h3>
               
               <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Masa Aktif Kontrak *</label>
                <input v-model="form.valid_until" type="date" required class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
               </div>

               <div class="flex gap-2">
                 <div class="w-1/2">
                   <label class="block text-sm font-medium text-gray-700 mb-1">Metode Bayar</label>
                   <select v-model="form.payment_method" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                     <option value="BCA">Transfer BCA</option>
                     <option value="Mandiri">Transfer Mandiri</option>
                     <option value="Tunai">Tunai</option>
                     <option value="Lainnya">Lainnya</option>
                   </select>
                 </div>
                 <div class="w-1/2">
                   <label class="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
                   <input v-model="form.payment_amount" type="number" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="1000000">
                 </div>
               </div>

               <div class="pt-2 border-t border-gray-100">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Username Klien (Isolasi Data) *</label>
                  <input v-model="form.username" type="text" required class="w-full bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none font-mono" placeholder="username_unik">
                  <p class="text-[10px] text-gray-500 mt-1">Username ini tidak boleh sama dengan klien lain.</p>
               </div>

               <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Password Klien *</label>
                  <input v-model="form.password" type="text" required class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Masukkan password kuat">
               </div>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
             <button type="button" @click="showModal = false" class="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Batal</button>
             <button type="submit" :disabled="saving" class="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-sm transition-colors flex items-center gap-2">
               <span v-if="saving">Menyimpan...</span>
               <span v-else>Simpan Klien & Buat Akun</span>
             </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showModal = ref(false)
const loading = ref(true)
const saving = ref(false)
const schools = ref([])

const form = ref({
  name: '',
  valid_until: '',
  payment_method: 'BCA',
  payment_amount: '',
  address: '',
  contact_number: '',
  username: '',
  password: ''
})

// Autocomplete Logic
const showSchoolSuggestions = ref(false)
const schoolSuggestions = ref([])
const isSearchingSchool = ref(false)
let searchTimeout = null

// Custom hardcoded database for client-specific schools
const customSchools = [
  { name: 'SMP Swasta Galih Agung', display_name: 'SMP Swasta Galih Agung, Jl. Berdikari No.1A, Desa Lau Bakeri, Kec. Kutalimbaru, Kab. Deli Serdang, Sumatera Utara 20354' },
  { name: 'SMA SWASTA GALIH AGUNG', display_name: 'SMA SWASTA GALIH AGUNG, Jl. Berdikari No.1A, Desa Lau Bakeri, Kec. Kutalimbaru, Kab. Deli Serdang, Sumatera Utara 20354' },
  { name: 'MTS Darularafah', display_name: 'MTS Darularafah, Jl. Berdikari No.1A, Desa Lau Bakeri, Kec. Kutalimbaru, Kab. Deli Serdang, Sumatera Utara 20354' },
  { name: 'MAS Darularafah', display_name: 'MAS Darularafah, Jl. Berdikari No.1A, Desa Lau Bakeri, Kec. Kutalimbaru, Kab. Deli Serdang, Sumatera Utara 20354' }
]

const searchSchool = () => {
  const queryText = form.value.name.toLowerCase()
  if (queryText.length < 2) {
    schoolSuggestions.value = []
    showSchoolSuggestions.value = false
    return
  }
  
  isSearchingSchool.value = true
  showSchoolSuggestions.value = true
  
  if (searchTimeout) clearTimeout(searchTimeout)
  
  searchTimeout = setTimeout(async () => {
    try {
      // 1. Cek dari Custom Database lokal terlebih dahulu
      const localMatches = customSchools.filter(s => 
        s.name.toLowerCase().includes(queryText) || 
        s.display_name.toLowerCase().includes(queryText)
      ).map(s => ({
        display_name: s.display_name,
        customName: s.name // Penanda custom name
      }))

      // 2. Fetch dari Nominatim OpenStreetMap
      const query = encodeURIComponent(form.value.name)
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&countrycodes=id&limit=5`, {
        headers: { 'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7' }
      })
      
      let apiResults = []
      if (res.ok) {
        apiResults = await res.json()
      }

      // Gabungkan hasil lokal dan API
      schoolSuggestions.value = [...localMatches, ...apiResults].slice(0, 7)
      
    } catch (e) {
      console.error("Gagal mencari sekolah", e)
    } finally {
      isSearchingSchool.value = false
    }
  }, 500)
}

const selectSchool = (suggestion) => {
  if (suggestion.customName) {
    form.value.name = suggestion.customName
  } else {
    form.value.name = extractSchoolName(suggestion.display_name)
  }
  form.value.address = suggestion.display_name
  showSchoolSuggestions.value = false
}

const extractSchoolName = (displayName) => {
  const parts = displayName.split(',')
  return parts[0]
}

const handleClickOutside = (e) => {
  if (showSchoolSuggestions.value && !e.target.closest('.relative')) {
    showSchoolSuggestions.value = false
  }
}

const fetchSchools = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/v1/super/schools')
    if (res.ok) {
      schools.value = await res.json() || []
    }
  } catch (error) {
    console.error("Gagal memuat data sekolah", error)
  } finally {
    loading.value = false
  }
}

const submitKlien = async () => {
  saving.value = true
  try {
    const res = await fetch('/api/v1/super/schools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.value.name,
        valid_until: new Date(form.value.valid_until).toISOString(),
        payment_method: form.value.payment_method,
        payment_amount: parseFloat(form.value.payment_amount) || 0,
        address: form.value.address,
        contact_number: form.value.contact_number,
        username: form.value.username,
        password: form.value.password
      })
    })

    if (res.ok) {
      alert("Klien baru berhasil ditambahkan!")
      showModal.value = false
      // Reset form
      form.value = { name: '', valid_until: '', payment_method: 'BCA', payment_amount: '', address: '', contact_number: '', username: '', password: '' }
      fetchSchools() // Refresh data realtime
    } else {
      const data = await res.json()
      alert("Gagal: " + (data.error || "Terjadi kesalahan"))
    }
  } catch (err) {
    alert("Terjadi kesalahan jaringan")
  } finally {
    saving.value = false
  }
}

const blockSchool = async (id) => {
  if (confirm("Yakin ingin memblokir klien ini? (Status akan menjadi Expired)")) {
    try {
      const res = await fetch(`/api/v1/super/schools/${id}/block`, { method: 'PUT' })
      if (res.ok) {
        fetchSchools()
      } else {
        alert("Gagal memblokir klien.")
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.")
    }
  }
}

const deleteSchool = async (id, name) => {
  if (confirm(`Peringatan Keras!\nApakah Anda benar-benar yakin ingin menghapus klien "${name}" secara PERMANEN?\n\nSemua data milik klien ini (profil, guru, mata pelajaran, jadwal, dll) akan lenyap dan tidak bisa dikembalikan.`)) {
    try {
      const res = await fetch(`/api/v1/super/schools/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchSchools()
      } else {
        alert("Gagal menghapus klien.")
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan saat menghapus klien.")
    }
  }
}

const isExpired = (dateString) => {
  if (!dateString) return true
  return new Date(dateString) < new Date()
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(() => {
  fetchSchools()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleLogout = () => {
  localStorage.clear()
  router.push('/')
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #4b5563;
  border-radius: 20px;
}
</style>
