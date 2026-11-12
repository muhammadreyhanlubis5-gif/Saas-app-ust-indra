<template>
  <div 
    class="teacher-card-wrapper group relative transition-all duration-300"
    :class="[
      cardState === 'error' ? 'border-error' : '',
      cardState === 'success' ? 'border-success' : '',
      cardState === 'default' ? 'border-default' : ''
    ]"
  >
    <!-- Tooltip on Hover (When Conflict Detected) -->
    <div 
      v-if="hasError" 
      class="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50 w-72 sm:w-84 max-w-[90vw] pb-2 drop-shadow-xl"
    >
      <div class="bg-gray-900 text-white rounded-2xl p-3.5 text-xs shadow-2xl border border-red-500/30 relative">
        <!-- Tooltip Header -->
        <div class="flex items-center gap-2 text-red-400 font-black mb-1.5 uppercase tracking-wider text-[11px]">
          <svg class="w-4 h-4 text-red-400 flex-shrink-0 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <span>Konflik Terdeteksi (Validation Engine)</span>
        </div>

        <!-- Tooltip Messages -->
        <div class="space-y-1.5 text-gray-200">
          <div 
            v-for="(c, cIdx) in conflicts" 
            :key="cIdx"
            class="flex items-start gap-1.5 bg-red-950/40 p-2 rounded-xl border border-red-900/50"
          >
            <span class="text-red-400 font-bold">•</span>
            <div class="flex-1 font-medium leading-relaxed">
              <span class="font-bold text-white">{{ c.title }}:</span>
              <p class="text-red-200 mt-0.5">{{ c.message }}</p>
            </div>
          </div>
        </div>

        <div class="mt-2 text-[10px] text-gray-400 italic text-right">
          Ubah guru atau sesuaikan jam kelas untuk mengatasi bentrok.
        </div>

        <!-- Tooltip Down Arrow -->
        <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 border-b border-r border-red-500/30 rotate-45"></div>
      </div>
    </div>

    <!-- Inner Card (Masks the Center Background Color) -->
    <div class="teacher-card-inner p-5 flex flex-col justify-between">
      
      <!-- Top Action Bar & Delete Button -->
      <div>
        <div class="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <!-- State Status Badge -->
          <div class="flex items-center gap-2">
            <!-- Error Badge -->
            <div 
              v-if="cardState === 'error'"
              class="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-black border border-red-200 animate-pulse"
            >
              <span class="w-2 h-2 rounded-full bg-red-500"></span>
              <span>Bentrok ({{ conflicts.length }})</span>
            </div>

            <!-- Success Badge -->
            <div 
              v-else-if="cardState === 'success'"
              class="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-black border border-emerald-200"
            >
              <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Tervalidasi & Sinkron</span>
            </div>

            <!-- Default Clean Badge -->
            <div 
              v-else
              class="inline-flex items-center gap-1.5 bg-gray-50 text-gray-500 px-3 py-1 rounded-full text-xs font-bold border border-gray-100"
            >
              <span class="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Terdistribusi</span>
            </div>
          </div>

          <!-- Delete Row Button -->
          <button 
            type="button"
            @click="$emit('remove')" 
            class="w-8 h-8 rounded-full bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-400 hover:text-red-600 flex items-center justify-center transition-all shadow-sm"
            title="Hapus Penugasan Ini"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>

        <!-- Teacher Header Info -->
        <div class="flex gap-4 items-start mb-4">
          <div 
            class="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner flex-shrink-0 transition-colors"
            :class="cardState === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'"
          >
            {{ row.teacher_code || '?' }}
          </div>

          <div class="flex-1 min-w-0">
            <select 
              :value="row.teacher_code" 
              @change="onTeacherChange($event.target.value)" 
              class="w-full bg-transparent border-none p-0 text-lg font-black text-gray-900 focus:ring-0 placeholder-gray-300 truncate cursor-pointer outline-none hover:text-blue-600 transition-colors"
            >
              <option value="" disabled>-- Pilih Guru --</option>
              <option v-for="t in teachers" :key="t.code" :value="t.code">
                {{ t.name }} ({{ t.code }})
              </option>
            </select>
            <div class="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wide flex items-center gap-1.5">
              <span>KODE: {{ row.teacher_code || '-' }}</span>
              <span class="text-gray-300">•</span>
              <span class="truncate">{{ row.teacher_name || 'Belum dipilih' }}</span>
            </div>
          </div>
        </div>

        <!-- Subject Code & Linear Select -->
        <div class="flex items-center gap-2 mb-4">
          <div class="flex-1 bg-gray-50 border border-gray-200 rounded-xl flex items-center px-3 py-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <svg class="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
            <input 
              v-model="row.subject_code" 
              @input="onSubjectInput"
              class="w-full bg-transparent border-none p-0 text-sm font-black text-gray-800 focus:ring-0 placeholder-gray-400 uppercase tracking-wider" 
              placeholder="KODE MAPEL (CTH: MAT)"
            />
          </div>

          <select 
            v-model="row.is_linear" 
            @change="emitChange"
            class="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
          >
            <option value="true">Linier</option>
            <option value="false">Non</option>
          </select>
        </div>

        <!-- Workload Summary & Limit Tracker (Max 40 JP) -->
        <div class="flex items-center justify-between mb-3 bg-gray-50/70 p-2.5 rounded-2xl border border-gray-100">
          <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Beban</span>
          <div class="flex items-center gap-1.5">
            <span 
              class="text-xs font-black px-2.5 py-1 rounded-xl border transition-all"
              :class="totalHours > 40 
                ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' 
                : 'bg-blue-50 text-blue-700 border-blue-100'"
            >
              {{ totalHours }} / 40 JP
            </span>
          </div>
        </div>

        <!-- Per-Class Assigned Hours List -->
        <div class="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
          <div 
            v-if="assignedClassIndices.length === 0" 
            class="text-center py-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50"
          >
            <p class="text-xs text-gray-400 font-bold">Belum ada kelas yang ditugaskan</p>
            <p class="text-[11px] text-gray-400 mt-0.5">Pilih kelas di bawah untuk membagikan jam</p>
          </div>

          <div 
            v-for="cIdx in assignedClassIndices" 
            :key="cIdx"
            class="flex items-center justify-between p-2.5 rounded-xl border transition-all"
            :class="isClassConflicted(cIdx) 
              ? 'bg-red-50/70 border-red-200 text-red-900' 
              : 'bg-gray-50 border-gray-100 text-gray-800 hover:bg-white'"
          >
            <div class="flex items-center gap-2">
              <span 
                class="w-2 h-2 rounded-full"
                :class="isClassConflicted(cIdx) ? 'bg-red-500 animate-ping' : 'bg-indigo-500'"
              ></span>
              <span class="font-black text-sm">{{ classes[cIdx] }}</span>
              <span v-if="isClassConflicted(cIdx)" class="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                Bentrok
              </span>
            </div>

            <div class="flex items-center gap-2">
              <input 
                type="number" 
                min="0" 
                max="40"
                v-model.number="row.hours[cIdx]" 
                @input="onHoursInput"
                class="w-14 bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm font-black text-center text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <span class="text-xs font-bold text-gray-400">JP</span>
              <button 
                type="button"
                @click="removeClassHour(cIdx)" 
                class="ml-1 text-gray-300 hover:text-red-500 transition-colors"
                title="Hapus jam untuk kelas ini"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Quick Assign Dropdown -->
      <div class="pt-3 border-t border-gray-100">
        <div class="relative">
          <select 
            @change="assignClass($event)" 
            class="w-full appearance-none bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer transition-colors"
          >
            <option value="" disabled selected>+ Tugaskan ke Kelas Lain...</option>
            <template v-for="(cls, cIdx) in classes" :key="cIdx">
              <option v-if="!row.hours || !row.hours[cIdx]" :value="cIdx">
                Kelas {{ cls }}
              </option>
            </template>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  row: {
    type: Object,
    required: true
  },
  classes: {
    type: Array,
    default: () => []
  },
  teachers: {
    type: Array,
    default: () => []
  },
  subjects: {
    type: Array,
    default: () => []
  },
  cardState: {
    type: String,
    default: 'default' // 'default' | 'error' | 'success'
  },
  conflicts: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:row', 'remove', 'change'])

const hasError = computed(() => props.cardState === 'error' && props.conflicts.length > 0)

const totalHours = computed(() => {
  if (!props.row.hours) return 0
  return props.row.hours.reduce((sum, h) => sum + (Number(h) || 0), 0)
})

const assignedClassIndices = computed(() => {
  const result = []
  if (!props.row.hours) return result
  props.row.hours.forEach((hrs, idx) => {
    if (hrs > 0) result.push(idx)
  })
  return result
})

const isClassConflicted = (cIdx) => {
  if (!props.conflicts || props.conflicts.length === 0) return false
  const clsName = props.classes[cIdx]
  return props.conflicts.some(c => c.className === clsName || c.classIndex === cIdx)
}

const onTeacherChange = (teacherCode) => {
  const t = props.teachers.find(x => x.code === teacherCode)
  if (t) {
    props.row.teacher_code = t.code
    props.row.teacher_name = t.name
    if (!props.row.subject_code && t.subject) {
      props.row.subject_code = t.subject
    }
  } else {
    props.row.teacher_code = teacherCode
  }
  emitChange()
}

const onSubjectInput = () => {
  props.row.subject_code = (props.row.subject_code || '').toUpperCase()
  emitChange()
}

const onHoursInput = () => {
  emitChange()
}

const removeClassHour = (cIdx) => {
  if (props.row.hours) {
    props.row.hours[cIdx] = 0
    emitChange()
  }
}

const assignClass = (event) => {
  const cIdx = event.target.value
  if (cIdx !== '' && props.row.hours) {
    props.row.hours[cIdx] = 2 // Default 2 JP
    event.target.value = ''
    emitChange()
  }
}

const emitChange = () => {
  emit('change', props.row)
}
</script>

<style scoped>
/* ==========================================================================
   ANIMATED GLOWING BORDER STYLING (Rotating Conic Gradient via @keyframes spin)
   ========================================================================== */

@keyframes border-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Base Wrapper: relative, overflow-hidden, rounded */
.teacher-card-wrapper {
  position: relative;
  border-radius: 1.5rem; /* 24px */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 1. DEFAULT STATE: Clean, subtle border */
.teacher-card-wrapper.border-default {
  border: 1.5px solid #f1f5f9;
  background-color: #ffffff;
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.05);
}

/* 2. ERROR STATE (Conflict Detected): Moving Red Line Tracing Border */
.teacher-card-wrapper.border-error {
  background-color: transparent;
  box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.25), 0 0 15px 0 rgba(239, 68, 68, 0.15);
}

.teacher-card-wrapper.border-error::before {
  content: '';
  position: absolute;
  top: -100%;
  left: -100%;
  width: 300%;
  height: 300%;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    transparent 200deg,
    rgba(239, 68, 68, 0.2) 280deg,
    rgba(239, 68, 68, 0.8) 330deg,
    #ef4444 360deg
  );
  animation: border-spin 3s linear infinite;
  z-index: 0;
  pointer-events: none;
}

/* 3. SUCCESS STATE (Valid / Saved): Moving Green Line Tracing Border */
.teacher-card-wrapper.border-success {
  background-color: transparent;
  box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.25), 0 0 15px 0 rgba(16, 185, 129, 0.15);
}

.teacher-card-wrapper.border-success::before {
  content: '';
  position: absolute;
  top: -100%;
  left: -100%;
  width: 300%;
  height: 300%;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    transparent 200deg,
    rgba(16, 185, 129, 0.2) 280deg,
    rgba(16, 185, 129, 0.8) 330deg,
    #10b981 360deg
  );
  animation: border-spin 2.5s linear infinite;
  z-index: 0;
  pointer-events: none;
}

/* The inner card masks the center with the card's background color (White) */
.teacher-card-inner {
  position: relative;
  z-index: 1;
  margin: 2.5px; /* Precision 2.5px gap reveals the rotating glowing laser */
  border-radius: calc(1.5rem - 2.5px);
  background-color: #ffffff;
  height: calc(100% - 5px);
}
</style>
