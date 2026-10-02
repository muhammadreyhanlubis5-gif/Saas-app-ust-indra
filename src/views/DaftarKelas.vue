<template>
  <div class="animate-fade-in-up p-4 md:p-8 max-w-[1400px] mx-auto w-full">
    <!-- Header modern -->
    <div class="bg-blue-900 rounded-3xl p-6 md:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
      <div class="absolute inset-0 bg-[url('../assets/banner-bg.png')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-transparent"></div>
      
      <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div class="w-full md:w-2/3">
          <h1 class="text-2xl md:text-3xl font-black mb-2 flex items-center gap-3 drop-shadow-md">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Master Data: Daftar Kelas
          </h1>
          <p class="text-blue-100 max-w-2xl text-sm md:text-base drop-shadow">
            Kelola data Rombongan Belajar (Rombel) beserta Wali Kelas. Data ini akan otomatis tersinkronisasi ke Distribusi Pengampu.
          </p>
        </div>
        
        <div class="flex gap-3">
          <button @click="showAddModal = true" class="bg-white text-blue-700 hover:bg-gray-50 px-6 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Tambah Kelas
          </button>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-500 font-medium">Memuat data kelas...</p>
      </div>

      <div v-else-if="classes.length === 0" class="text-center py-20 px-4">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
          <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
        </div>
        <h3 class="text-lg font-bold text-gray-800 mb-1">Belum Ada Rombongan Belajar</h3>
        <p class="text-gray-500 mb-6 text-sm">Silakan tambah kelas terlebih dahulu untuk mendistribusikan guru pengampu.</p>
        <button @click="showAddModal = true" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-colors">
          Tambah Kelas Pertama
        </button>
      </div>

      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs tracking-wider">
            <th class="px-6 py-4 font-bold">No</th>
            <th class="px-6 py-4 font-bold">Nama Kelas</th>
            <th class="px-6 py-4 font-bold">Wali Kelas</th>
            <th class="px-6 py-4 font-bold text-center">Jumlah Siswa</th>
            <th class="px-6 py-4 font-bold text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(cls, index) in classes" :key="cls.id || index" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 text-gray-500">{{ index + 1 }}</td>
            <td class="px-6 py-4">
              <span class="bg-blue-50 text-blue-700 px-3 py-1 rounded font-bold text-sm">{{ cls.name }}</span>
            </td>
            <td class="px-6 py-4 font-medium text-gray-800">{{ cls.homeroom_teacher || '-' }}</td>
            <td class="px-6 py-4 text-center font-bold text-gray-600">{{ cls.student_count }} Siswa</td>
            <td class="px-6 py-4 text-right">
              <button @click="deleteClass(index)" class="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Form Modal Tambah Kelas -->
    <div v-if="showAddModal" class="fixed inset-0 z-40 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-opacity">
      <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="font-bold text-gray-800 text-lg">Tambah Kelas</h3>
          <button @click="showAddModal = false" class="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 rounded-full p-1.5 transition-colors shadow-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form @submit.prevent="saveClass" class="p-6 space-y-5">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Nama Kelas</label>
            <input v-model="form.name" type="text" required placeholder="Contoh: 4 A, X IPA 1" class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none uppercase transition-shadow">
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Wali Kelas</label>
            <input v-model="form.homeroom_teacher" type="text" placeholder="Masukkan Nama Wali Kelas" class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow">
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Jumlah Siswa</label>
            <input v-model.number="form.student_count" type="number" min="1" required placeholder="Contoh: 32" class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow">
          </div>
          
          <div class="pt-4 flex gap-3">
            <button type="button" @click="showAddModal = false" class="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold py-3 px-4 rounded-xl transition-colors">
              Batal
            </button>
            <button type="submit" :disabled="saving" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
              <svg v-if="saving" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>{{ saving ? 'Memproses...' : 'Simpan' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-opacity">
      <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative animate-bounce-in text-center border-t-8 border-emerald-500">
        <button @click="showSuccessModal = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <div class="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full mx-auto flex items-center justify-center mb-6 shadow-inner relative">
          <div class="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
          <svg class="w-12 h-12 animate-draw-check" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 class="text-3xl font-black text-gray-800 mb-2">Berhasil!</h2>
        <p class="text-gray-500 mb-8 font-medium leading-relaxed">Data Kelas (Rombel) berhasil ditambahkan ke database.</p>
        <button @click="showSuccessModal = false" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1">Selesai</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const loading = ref(true)
const saving = ref(false)
const showAddModal = ref(false)
const showSuccessModal = ref(false)

const classes = ref([])
const form = ref({ name: '', student_count: null, homeroom_teacher: '' })

onMounted(() => {
  // Simulasi fetch data awal - Check localStorage for shared classes
  const saved = localStorage.getItem('guruKu_classes');
  if (saved) {
    classes.value = JSON.parse(saved);
    loading.value = false;
  } else {
    setTimeout(() => {
      classes.value = [
        { id: 1, name: '4 A', student_count: 32, homeroom_teacher: 'Budi Santoso, S.Pd' },
        { id: 2, name: '4 B', student_count: 30, homeroom_teacher: 'Siti Aminah, M.Pd' },
      ]
      loading.value = false
    }, 600)
  }
})

// Sync to localstorage so PengampuMapel can read it
watch(classes, (newVal) => {
  localStorage.setItem('guruKu_classes', JSON.stringify(newVal));
}, { deep: true });

const saveClass = () => {
  saving.value = true
  // Simulasi request API
  setTimeout(() => {
    classes.value.push({
      id: Date.now(),
      name: form.value.name.toUpperCase(),
      student_count: form.value.student_count,
      homeroom_teacher: form.value.homeroom_teacher
    })
    
    // Reset state
    form.value.name = ''
    form.value.student_count = null
    form.value.homeroom_teacher = ''
    saving.value = false
    showAddModal.value = false
    
    // Tampilkan popup sukses
    showSuccessModal.value = true
  }, 1000)
}

const deleteClass = (index) => {
  if (confirm('Yakin ingin menghapus kelas ini? Semua penugasan guru di kelas ini juga akan terhapus nantinya.')) {
    classes.value.splice(index, 1)
  }
}
</script>

<style scoped>
@keyframes bounce-in {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
.animate-bounce-in {
  animation: bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
@keyframes draw-check {
  0% { stroke-dasharray: 50; stroke-dashoffset: 50; }
  100% { stroke-dasharray: 50; stroke-dashoffset: 0; }
}
.animate-draw-check {
  animation: draw-check 0.5s ease-out forwards;
  animation-delay: 0.2s;
  stroke-dasharray: 50;
  stroke-dashoffset: 50;
}
</style>
