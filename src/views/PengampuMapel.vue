<template>
  <div class="max-w-full mx-auto">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <router-link to="/admin-sekolah/sesi-kbm" class="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 border border-gray-100 transition-colors">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </router-link>
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Tahap 3: Distribusi Pengampu Mapel</h1>
          <p class="text-gray-500 text-sm">Alokasi jam pelajaran untuk setiap guru, mata pelajaran, dan kelas.</p>
        </div>
      </div>
      <div class="flex gap-2">
        <button @click="addClassColumn" class="bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 font-bold py-2 px-4 rounded-lg text-sm transition-colors flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          Tambah Kelas
        </button>
        <button @click="addTeacherRow" class="bg-blue-600 text-white hover:bg-blue-700 font-bold py-2 px-4 rounded-lg text-sm transition-colors flex items-center gap-2 shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          Tambah Baris Guru
        </button>
      </div>
    </div>

    <!-- Alert Instruksi -->
    <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-bold text-blue-800">Tips Pengisian Cepat</h3>
          <p class="text-sm text-blue-700 mt-1">
            Tekan <b>"Tambah Kelas"</b> untuk membuat kolom kelas baru (misal: 4 TM, 4 MAPK). Kemudian isi beban mengajar pada baris guru yang sesuai. Sel kosong bernilai 0 jam.
          </p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
      <div class="overflow-x-auto relative custom-scrollbar">
        <table class="w-full text-sm text-left whitespace-nowrap min-w-max">
          <thead class="bg-gray-800 text-gray-100 text-xs uppercase sticky top-0 z-10">
            <tr>
              <th rowspan="2" class="px-3 py-3 border-r border-gray-700 font-bold text-center w-12 sticky left-0 bg-gray-800 z-20">No</th>
              <th rowspan="2" class="px-4 py-3 border-r border-gray-700 font-bold sticky left-[48px] bg-gray-800 z-20 w-32">Kode Guru</th>
              <th rowspan="2" class="px-4 py-3 border-r border-gray-700 font-bold sticky left-[176px] bg-gray-800 z-20 w-48">Nama Guru</th>
              <th rowspan="2" class="px-4 py-3 border-r border-gray-700 font-bold w-48 text-center">Kriteria Sertifikasi</th>
              <th rowspan="2" class="px-4 py-3 border-r border-gray-700 font-bold w-32 text-center">Kode Mapel</th>
              
              <th v-if="classes.length > 0" :colspan="classes.length" class="px-4 py-2 border-r border-gray-700 font-bold text-center bg-gray-700">
                Alokasi Jam Per Kelas
              </th>
              
              <th rowspan="2" class="px-4 py-3 border-r border-gray-700 font-bold text-center w-24">Jml / Mapel</th>
              <th rowspan="2" class="px-4 py-3 border-r border-gray-700 font-bold text-center w-24">Total Jam</th>
              <th rowspan="2" class="px-4 py-3 font-bold text-center w-16">Aksi</th>
            </tr>
            <tr v-if="classes.length > 0" class="bg-gray-700">
              <th v-for="(cls, cIdx) in classes" :key="cIdx" class="px-2 py-2 border-r border-gray-600 font-bold text-center w-20 min-w-[80px]">
                <div class="flex flex-col items-center gap-1">
                  <input v-model="classes[cIdx]" class="w-full bg-gray-600 text-white border border-gray-500 rounded px-1 py-0.5 text-xs text-center focus:ring-1 focus:ring-blue-400 outline-none" placeholder="Kelas">
                  <button @click="removeClassColumn(cIdx)" class="text-red-400 hover:text-red-300 text-[10px]">Hapus</button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="rows.length === 0">
              <td :colspan="6 + classes.length" class="px-6 py-8 text-center text-gray-400 italic">
                Belum ada data pengampu. Tekan "Tambah Baris Guru" untuk memulai.
              </td>
            </tr>
            <tr v-for="(row, rIdx) in rows" :key="rIdx" class="hover:bg-blue-50/50 transition-colors group">
              <td class="px-3 py-2 border-r border-gray-100 text-center font-medium text-gray-500 sticky left-0 bg-white group-hover:bg-blue-50/50 z-10">
                {{ rIdx + 1 }}
              </td>
              <td class="px-2 py-2 border-r border-gray-100 sticky left-[48px] bg-white group-hover:bg-blue-50/50 z-10">
                <input v-model="row.teacher_code" class="w-full bg-transparent border-none rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700" placeholder="Kode">
              </td>
              <td class="px-2 py-2 border-r border-gray-100 sticky left-[176px] bg-white group-hover:bg-blue-50/50 z-10">
                <input v-model="row.teacher_name" class="w-full bg-transparent border-none rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium" placeholder="Nama Guru">
              </td>
              <td class="px-2 py-2 border-r border-gray-100">
                <select v-model="row.is_linear" class="w-full bg-transparent border-none rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 outline-none text-gray-600">
                  <option value="true">Mapel Linier</option>
                  <option value="false">Tidak Linier</option>
                </select>
              </td>
              <td class="px-2 py-2 border-r border-gray-100">
                <input v-model="row.subject_code" class="w-full bg-transparent border-none rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-700 text-center uppercase" placeholder="Mapel">
              </td>
              
              <!-- Kelas Hours Inputs -->
              <td v-for="(cls, cIdx) in classes" :key="cIdx" class="px-1 py-1 border-r border-gray-100 text-center bg-gray-50/50">
                <input 
                  type="number" 
                  min="0"
                  v-model.number="row.hours[cIdx]" 
                  class="w-full bg-white border border-gray-200 rounded px-1 py-1 text-sm text-center focus:ring-2 focus:ring-blue-500 outline-none font-mono" 
                  placeholder="-"
                >
              </td>
              
              <!-- Jml / Mapel -->
              <td class="px-3 py-2 border-r border-gray-100 text-center font-bold text-indigo-700 bg-indigo-50/30">
                {{ calculateRowTotal(row) }}
              </td>
              
              <!-- Total Jam (Semua mapel guru tsb) -->
              <td class="px-3 py-2 border-r border-gray-100 text-center font-black text-gray-800 bg-gray-50/80">
                {{ calculateTeacherTotal(row.teacher_code) }}
              </td>
              
              <td class="px-3 py-2 text-center">
                <button @click="removeRow(rIdx)" class="text-red-400 hover:text-red-600 bg-red-50 p-1.5 rounded transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot v-if="classes.length > 0" class="bg-gray-800 text-white font-bold sticky bottom-0 z-10">
            <tr>
              <td colspan="5" class="px-4 py-3 text-right">TOTAL DISTRIBUSI JAM</td>
              <td v-for="(cls, cIdx) in classes" :key="cIdx" class="px-2 py-3 text-center border-l border-gray-700 text-blue-300">
                {{ calculateClassTotal(cIdx) }}
              </td>
              <td class="px-4 py-3 text-center border-l border-gray-700 text-yellow-300">{{ grandTotal }}</td>
              <td colspan="2" class="px-4 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    
    <div class="flex justify-end pt-2 pb-12">
      <button class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all flex items-center gap-2">
        <span>Simpan & Verifikasi Distribusi</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      </button>
    </div>
    
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const classes = ref(['Kelas Contoh'])
const rows = ref([
  {
    teacher_code: '',
    teacher_name: '',
    is_linear: 'true',
    subject_code: '',
    hours: [0] 
  }
])

const addClassColumn = () => {
  const newClass = prompt("Masukkan Nama Kelas (Misal: 5 IPA-A)")
  if (newClass) {
    classes.value.push(newClass)
    // Initialize hours for the new class in all rows
    rows.value.forEach(row => {
      row.hours.push(0)
    })
  }
}

const removeClassColumn = (idx) => {
  if (confirm(`Hapus kelas ${classes.value[idx]}?`)) {
    classes.value.splice(idx, 1)
    rows.value.forEach(row => {
      row.hours.splice(idx, 1)
    })
  }
}

const addTeacherRow = () => {
  rows.value.push({
    teacher_code: '',
    teacher_name: '',
    is_linear: 'true',
    subject_code: '',
    hours: new Array(classes.value.length).fill(0)
  })
}

const removeRow = (idx) => {
  if (confirm("Hapus baris ini?")) {
    rows.value.splice(idx, 1)
  }
}

const calculateRowTotal = (row) => {
  return row.hours.reduce((sum, h) => sum + (Number(h) || 0), 0)
}

const calculateTeacherTotal = (teacherCode) => {
  if (!teacherCode) return 0
  return rows.value
    .filter(r => r.teacher_code === teacherCode)
    .reduce((sum, r) => sum + calculateRowTotal(r), 0)
}

const calculateClassTotal = (classIdx) => {
  return rows.value.reduce((sum, r) => sum + (Number(r.hours[classIdx]) || 0), 0)
}

const grandTotal = computed(() => {
  return rows.value.reduce((sum, r) => sum + calculateRowTotal(r), 0)
})

</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}
/* Ensure sticky left columns overlap properly */
th.sticky, td.sticky {
  clip-path: inset(0 -1px -1px 0);
}
</style>
