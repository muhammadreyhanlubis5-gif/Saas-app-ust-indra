<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-opacity">
    <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-100">
      
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900 leading-tight">Impor Master Jadwal XLSB / Excel</h3>
            <p class="text-xs text-gray-500">Pratinjau, klasifikasi lembar kerja, dan validasi data sebelum commit ke database</p>
          </div>
        </div>
        <button 
          @click="closeModal" 
          class="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 rounded-full p-2 transition-colors cursor-pointer border border-gray-200"
          title="Tutup Modal"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        
        <!-- STEP 1: Upload File Area (jika belum ada file) -->
        <div v-if="!fileBuffer" class="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors bg-gray-50/50">
          <input 
            type="file" 
            ref="fileInputRef" 
            @change="handleFileSelect" 
            accept=".xlsb,.xlsx,.xls" 
            class="hidden" 
          />
          <div class="mx-auto w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
            </svg>
          </div>
          <h4 class="text-base font-semibold text-gray-800">Pilih File Master Jadwal (.xlsb / .xlsx)</h4>
          <p class="text-xs text-gray-500 max-w-md mx-auto mt-1 mb-5">
            Dukung format resmi binary .xlsb (maksimal 25 MB). Macro VBA dinonaktifkan secara aman saat parsing.
          </p>
          <button 
            @click="triggerFileInput" 
            :disabled="isLoadingFile"
            class="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <svg v-if="isLoadingFile" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isLoadingFile ? 'Membaca Workbook...' : 'Pilih File dari Komputer' }}</span>
          </button>
        </div>

        <!-- STEP 2: Workbook Overview & Worksheet Selector -->
        <div v-else class="space-y-4">
          <!-- File info card -->
          <div class="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div class="flex items-center space-x-3">
              <div class="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                XLSB
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-900">{{ currentFileName }}</p>
                <p class="text-xs text-gray-500">{{ (fileSize / 1024 / 1024).toFixed(2) }} MB &bull; {{ sheetList.length }} Worksheet Terdeteksi</p>
              </div>
            </div>
            <button 
              @click="resetFile" 
              class="text-xs text-rose-600 hover:text-rose-800 font-medium px-3 py-1.5 rounded-lg hover:bg-rose-50 border border-rose-200 cursor-pointer"
            >
              Ganti File
            </button>
          </div>

          <!-- Entity Type & Sheet Select -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Entitas Master Data</label>
              <select 
                v-model="selectedEntityType" 
                @change="handleEntityChange"
                class="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="classes">Daftar Kelas (Classes)</option>
                <option value="teachers">Daftar Guru (Teachers)</option>
                <option value="subjects">Mata Pelajaran (Subjects)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Lembar Kerja (Worksheet)</label>
              <select 
                v-model="selectedSheetName" 
                @change="handleSheetChange"
                class="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option v-for="s in sheetList" :key="s.name" :value="s.name">
                  {{ s.name }} ({{ s.role }}) - {{ s.rowCount }} baris
                </option>
              </select>
            </div>
          </div>

          <!-- School Profile detected banner -->
          <div v-if="schoolProfile" class="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
            <div>
              <span class="font-bold">{{ schoolProfile.schoolName }}</span> &bull; 
              TA: {{ schoolProfile.academicYear }} ({{ schoolProfile.semester }}) &bull; 
              Kepsek: {{ schoolProfile.headmasterName }}
            </div>
            <span class="px-2 py-0.5 rounded-md bg-blue-200 text-blue-800 font-semibold uppercase tracking-wider text-[10px]">
              Profile Terdeteksi
            </span>
          </div>

          <!-- Summary Badges & Controls -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div class="flex items-center space-x-2 text-xs">
              <span class="px-2.5 py-1 rounded-lg font-bold bg-gray-100 text-gray-700 border border-gray-200">
                Total: {{ previewTotal }} Baris
              </span>
              <span class="px-2.5 py-1 rounded-lg font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Valid: {{ previewValidCount }}
              </span>
              <span v-if="previewInvalidCount > 0" class="px-2.5 py-1 rounded-lg font-bold bg-rose-100 text-rose-800 border border-rose-200">
                Error: {{ previewInvalidCount }}
              </span>
            </div>

            <div class="flex items-center space-x-3 text-xs">
              <label class="flex items-center space-x-1.5 cursor-pointer text-gray-700 font-medium">
                <input type="checkbox" v-model="filterOnlyErrors" class="rounded text-rose-600 focus:ring-rose-500" />
                <span>Hanya Baris Bermasalah</span>
              </label>

              <button 
                v-if="validationErrors.length > 0"
                @click="exportErrorReport" 
                class="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                title="Unduh laporan error sebagai JSON"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                <span>Export Error ({{ validationErrors.length }})</span>
              </button>
            </div>
          </div>

          <!-- Pratinjau Table (Paginated Max 20 Rows) -->
          <div class="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
            <div class="overflow-x-auto max-h-72">
              <table class="w-full text-xs text-left">
                <thead class="bg-gray-100 text-gray-700 uppercase font-bold sticky top-0 z-10 border-b border-gray-200">
                  <tr>
                    <th class="px-3 py-2.5 text-center w-12">No</th>
                    <th v-if="selectedEntityType !== 'classes'" class="px-3 py-2.5 w-24">Kode</th>
                    <th class="px-3 py-2.5">Nama</th>
                    <th v-if="selectedEntityType === 'classes'" class="px-3 py-2.5 w-24">Tingkat</th>
                    <th v-if="selectedEntityType === 'classes'" class="px-3 py-2.5">Wali Kelas</th>
                    <th class="px-3 py-2.5 text-center w-28">Status Baris</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white">
                  <tr v-if="displayedRows.length === 0">
                    <td colspan="6" class="px-4 py-6 text-center text-gray-500 italic">
                      Tidak ada data yang sesuai dengan filter.
                    </td>
                  </tr>
                  <tr 
                    v-for="(row, idx) in displayedRows" 
                    :key="idx" 
                    :class="{'bg-rose-50/50': !row.isValid, 'hover:bg-slate-50': row.isValid}"
                  >
                    <td class="px-3 py-2 text-center text-gray-500 font-mono">
                      {{ (currentPage - 1) * pageSize + idx + 1 }}
                    </td>
                    <td v-if="selectedEntityType !== 'classes'" class="px-3 py-2 font-mono font-semibold text-gray-800">
                      {{ row.code || '-' }}
                    </td>
                    <td class="px-3 py-2 font-medium text-gray-900">
                      {{ row.name }}
                      <div v-if="!row.isValid" class="text-[11px] text-rose-600 mt-0.5">
                        {{ row.errors?.[0]?.message }}
                      </div>
                    </td>
                    <td v-if="selectedEntityType === 'classes'" class="px-3 py-2 font-mono text-gray-600">
                      {{ row.gradeLevel || '-' }}
                    </td>
                    <td v-if="selectedEntityType === 'classes'" class="px-3 py-2 text-gray-600">
                      {{ row.homeroomTeacherName || '-' }}
                    </td>
                    <td class="px-3 py-2 text-center">
                      <span 
                        v-if="row.isValid" 
                        class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold"
                        :class="row.isExisting ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'"
                      >
                        {{ row.isExisting ? 'Update' : 'Baru' }}
                      </span>
                      <span v-else class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                        Error
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Table Pagination Controls -->
            <div v-if="totalPages > 1" class="px-4 py-2 bg-slate-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
              <span>Halaman {{ currentPage }} dari {{ totalPages }}</span>
              <div class="flex items-center space-x-1">
                <button 
                  @click="currentPage = Math.max(1, currentPage - 1)" 
                  :disabled="currentPage === 1" 
                  class="px-2 py-1 rounded border border-gray-300 disabled:opacity-40 cursor-pointer"
                >
                  Prev
                </button>
                <button 
                  @click="currentPage = Math.min(totalPages, currentPage + 1)" 
                  :disabled="currentPage === totalPages" 
                  class="px-2 py-1 rounded border border-gray-300 disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <!-- STEP 3: Import Mode Selector -->
          <div class="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <span class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Mode Impor Data</span>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label class="flex items-center space-x-2 p-2 rounded-lg border cursor-pointer text-xs" :class="importMode === 'VALIDATE_ONLY' ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-semibold' : 'border-gray-200 bg-white text-gray-700'">
                <input type="radio" value="VALIDATE_ONLY" v-model="importMode" class="text-blue-600" />
                <span>Validasi Saja (Tanpa Simpan)</span>
              </label>
              <label class="flex items-center space-x-2 p-2 rounded-lg border cursor-pointer text-xs" :class="importMode === 'UPSERT' ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-semibold' : 'border-gray-200 bg-white text-gray-700'">
                <input type="radio" value="UPSERT" v-model="importMode" class="text-blue-600" />
                <span>Upsert (Update & Tambah)</span>
              </label>
              <label class="flex items-center space-x-2 p-2 rounded-lg border cursor-pointer text-xs" :class="importMode === 'INSERT_ONLY' ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-semibold' : 'border-gray-200 bg-white text-gray-700'">
                <input type="radio" value="INSERT_ONLY" v-model="importMode" class="text-blue-600" />
                <span>Insert Only (Tolak jika Duplikat)</span>
              </label>
            </div>
          </div>
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-4 border-t border-gray-100 bg-slate-50 flex items-center justify-between">
        <button 
          @click="closeModal" 
          class="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Batal
        </button>

        <button 
          v-if="fileBuffer"
          @click="executeImport" 
          :disabled="isSubmitting || (importMode === 'INSERT_ONLY' && previewInvalidCount > 0)"
          class="inline-flex items-center space-x-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          <svg v-if="isSubmitting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ submitButtonLabel }}</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  inspectWorkbook,
  extractRombelData,
  validateClasses,
  validateTeachers,
  validateSubjects,
  executeImportPipeline
} from '../core/xlsbParser.js'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  defaultEntityType: { type: String, default: 'classes' },
  existingRecords: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'import-success', 'error'])

const fileInputRef = ref(null)
const isLoadingFile = ref(false)
const isSubmitting = ref(false)

const fileBuffer = ref(null)
const currentFileName = ref('')
const fileSize = ref(0)
const sheetList = ref([])
const workbookInstance = ref(null)

const selectedEntityType = ref(props.defaultEntityType)
const selectedSheetName = ref('Rombel')
const schoolProfile = ref(null)

const rawExtractedItems = ref([])
const validationErrors = ref([])
const filterOnlyErrors = ref(false)
const importMode = ref('UPSERT') // 'VALIDATE_ONLY' | 'UPSERT' | 'INSERT_ONLY'

// Pagination state
const currentPage = ref(1)
const pageSize = 20

function triggerFileInput() {
  if (fileInputRef.value) fileInputRef.value.click()
}

async function handleFileSelect(e) {
  const file = e.target.files?.[0]
  if (!file) return

  isLoadingFile.value = true
  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from ? Buffer.from(arrayBuffer) : new Uint8Array(arrayBuffer)

    const inspection = inspectWorkbook(buffer, file.name)
    fileBuffer.value = buffer
    currentFileName.value = file.name
    fileSize.value = file.size
    sheetList.value = inspection.sheets
    workbookInstance.value = inspection.workbook

    // Default ke Rombel jika tersedia
    if (inspection.workbook.Sheets['Rombel']) {
      selectedSheetName.value = 'Rombel'
    } else if (inspection.sheets.length > 0) {
      selectedSheetName.value = inspection.sheets[0].name
    }

    parseSelectedSheet()
  } catch (err) {
    emit('error', err.message || 'Gagal membaca file Excel.')
  } finally {
    isLoadingFile.value = false
    if (e.target) e.target.value = ''
  }
}

function parseSelectedSheet() {
  if (!workbookInstance.value) return
  const sheet = workbookInstance.value.Sheets[selectedSheetName.value]
  if (!sheet) return

  if (selectedSheetName.value === 'Rombel') {
    const extracted = extractRombelData(sheet, workbookInstance.value)
    schoolProfile.value = extracted.schoolProfile

    let res
    if (selectedEntityType.value === 'classes') {
      res = validateClasses(extracted.classes, props.existingRecords)
    } else if (selectedEntityType.value === 'teachers') {
      res = validateTeachers(extracted.teachers, props.existingRecords)
    } else {
      res = validateSubjects(extracted.subjects, props.existingRecords)
    }

    rawExtractedItems.value = res.items
    validationErrors.value = res.errors
  } else {
    // Tabular generic fallback
    schoolProfile.value = null
    rawExtractedItems.value = []
    validationErrors.value = []
  }
  currentPage.value = 1
}

function handleEntityChange() {
  parseSelectedSheet()
}

function handleSheetChange() {
  parseSelectedSheet()
}

function resetFile() {
  fileBuffer.value = null
  currentFileName.value = ''
  fileSize.value = 0
  sheetList.value = []
  workbookInstance.value = null
  rawExtractedItems.value = []
  validationErrors.value = []
  schoolProfile.value = null
}

const previewTotal = computed(() => rawExtractedItems.value.length)
const previewValidCount = computed(() => rawExtractedItems.value.filter((r) => r.isValid).length)
const previewInvalidCount = computed(() => rawExtractedItems.value.filter((r) => !r.isValid).length)

const filteredItems = computed(() => {
  if (filterOnlyErrors.value) {
    return rawExtractedItems.value.filter((r) => !r.isValid)
  }
  return rawExtractedItems.value
})

const totalPages = computed(() => Math.ceil(filteredItems.value.length / pageSize) || 1)

const displayedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredItems.value.slice(start, start + pageSize)
})

const submitButtonLabel = computed(() => {
  if (isSubmitting.value) return 'Memproses...'
  if (importMode.value === 'VALIDATE_ONLY') return 'Cek Validasi Saja'
  return `Proses Impor (${previewValidCount.value} Record)`
})

function exportErrorReport() {
  if (validationErrors.value.length === 0) return
  const jsonStr = JSON.stringify(validationErrors.value, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `error_report_${currentFileName.value}_${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function executeImport() {
  if (!fileBuffer.value || isSubmitting.value) return
  isSubmitting.value = true

  try {
    const result = await executeImportPipeline({
      buffer: fileBuffer.value,
      entityType: selectedEntityType.value,
      mode: importMode.value,
      existingRecords: props.existingRecords,
      saveCallback: async (items, mode) => {
        emit('import-success', {
          entityType: selectedEntityType.value,
          mode,
          items
        })
        return { success: true }
      }
    })

    if (importMode.value === 'VALIDATE_ONLY') {
      emit('import-success', {
        entityType: selectedEntityType.value,
        mode: 'VALIDATE_ONLY',
        result
      })
    }
    closeModal()
  } catch (err) {
    emit('error', err.message || 'Terjadi kesalahan saat memproses impor.')
  } finally {
    isSubmitting.value = false
  }
}

function closeModal() {
  resetFile()
  emit('close')
}
</script>
