<template>
  <div class="animate-fade-in-up p-4 md:p-8 max-w-[1400px] mx-auto w-full select-none" @mouseup="handleMouseUp">
    
    <!-- Header SaaS Modern -->
    <div class="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 rounded-3xl p-6 md:p-8 text-white shadow-xl mb-8 relative overflow-hidden border border-blue-800/40">
      <div class="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -left-10 -top-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div class="w-full md:w-2/3">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-bold mb-3">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Constraint Scheduling Engine - Rule D
          </div>
          <h1 class="text-2xl md:text-3xl font-black mb-2 flex items-center gap-3 tracking-tight">
            <svg class="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Permintaan Jam Kosong Guru
          </h1>
          <p class="text-blue-100/90 max-w-2xl text-xs md:text-sm leading-relaxed">
            Tentukan hari dan jam pelajaran di mana guru <b class="text-white">berhalangan hadir</b>. Algoritma otomatis GuruKu akan menjamin penempatan jam KBM terhindar 100% dari waktu yang telah diblokir.
          </p>
        </div>
        
        <div class="flex items-center gap-3">
          <button 
            @click="saveData" 
            :disabled="saving" 
            class="bg-white text-blue-900 hover:bg-blue-50 px-6 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <svg v-if="saving" class="animate-spin w-5 h-5 text-blue-700" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <svg v-else class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
            <span>{{ saving ? 'Menyimpan...' : 'Simpan Batasan' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Search & Filter Controls -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
      <div class="relative flex-1 max-w-md">
        <svg class="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Cari nama guru, gelar, atau kode (misal: SB)..." 
          class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
        />
        <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Filter Buttons -->
      <div class="flex items-center gap-2">
        <button 
          @click="filterType = 'all'" 
          class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
          :class="filterType === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'"
        >
          Semua Guru ({{ teachers.length }})
        </button>
        <button 
          @click="filterType = 'blocked'" 
          class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          :class="filterType === 'blocked' ? 'bg-rose-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'"
        >
          <span>Ada Jam Kosong</span>
          <span class="px-1.5 py-0.2 rounded-full text-[10px]" :class="filterType === 'blocked' ? 'bg-white/20' : 'bg-rose-100 text-rose-700'">
            {{ teachersWithConstraintsCount }}
          </span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-16 bg-white rounded-3xl border border-slate-200">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-slate-500 font-bold text-sm">Memuat data guru, sesi KBM, dan batasan jadwal...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredTeachers.length === 0" class="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6">
      <svg class="w-16 h-16 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
      <h3 class="text-base font-bold text-slate-700">Tidak ada guru yang cocok</h3>
      <p class="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter.</p>
    </div>

    <!-- Teacher Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 mb-8">
      <div 
        v-for="teacher in filteredTeachers" 
        :key="teacher.code" 
        class="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between group"
      >
        <div>
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 rounded-xl flex items-center justify-center font-black text-base shadow-inner border border-blue-100 flex-shrink-0 group-hover:scale-105 transition-transform">
                {{ teacher.code }}
              </div>
              <div class="min-w-0">
                <h3 class="font-bold text-slate-900 text-sm leading-snug truncate" :title="teacher.name">{{ teacher.name }}</h3>
                <p class="text-xs font-semibold text-slate-500 mt-0.5 truncate uppercase">
                  {{ teacher.subject || teacher.specialization || 'Mapel Belum Diatur' }}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex items-center justify-between mt-4 pt-3.5 border-t border-slate-100 gap-2">
          <!-- Summary Badge (e.g. "4 Jam Kosong (Rabu)" or "0 Jam Kosong") -->
          <div class="min-w-0">
            <span 
              v-if="hasTeacherConstraint(teacher.code)"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs max-w-full truncate"
              :title="getSummaryText(teacher.code)"
            >
              <svg class="w-3.5 h-3.5 shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
              </svg>
              <span class="truncate">{{ getSummaryText(teacher.code) }}</span>
            </span>
            <span 
              v-else 
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200"
            >
              0 Jam Kosong
            </span>
          </div>

          <button 
            @click="openModal(teacher)" 
            class="bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold py-1.5 px-3.5 rounded-xl text-xs transition-all flex items-center gap-1.5 border border-blue-200 hover:border-blue-600 cursor-pointer shadow-2xs active:scale-95 shrink-0"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <span>Atur Waktu</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL: 2D CONSTRAINT MATRIX (X: Days, Y: Time Slots)            -->
    <!-- ============================================================== -->
    <div 
      v-if="selectedTeacher" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-2 sm:p-4 transition-opacity animate-fade-in"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] border border-slate-200 animate-fade-in-up">
        
        <!-- Modal Header -->
        <div class="px-5 sm:px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/90 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
              {{ selectedTeacher.code }}
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="font-black text-slate-900 text-base sm:text-lg leading-tight">
                  Atur Jam Kosong: {{ selectedTeacher.name }}
                </h3>
                <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {{ selectedTeacher.code }}
                </span>
              </div>
              <p class="text-xs text-slate-500 font-medium mt-0.5">
                Matrix Jadwal KBM: Klik atau seret (drag) sel untuk memblokir jam. Klik header hari untuk blok seluruh hari.
              </p>
            </div>
          </div>

          <button 
            @click="closeModal" 
            class="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 rounded-full p-2 transition-colors shadow-2xs border border-slate-200 cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Conflict Alert Banner (Real-Time Validation) -->
        <div v-if="conflictWarning" class="bg-rose-50 border-b border-rose-200 px-5 py-3 flex items-center justify-between gap-3 text-rose-800 animate-fade-in">
          <div class="flex items-center gap-2 text-xs font-bold">
            <svg class="w-5 h-5 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <span>{{ conflictWarning }}</span>
          </div>
          <button @click="conflictWarning = null" class="text-rose-500 hover:text-rose-700 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Modal Summary Toolbar -->
        <div class="px-5 sm:px-6 py-2.5 bg-slate-100/60 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-4 flex-wrap">
            <span class="font-bold text-slate-700">
              Total Diblokir: 
              <span class="font-black text-rose-600">{{ getTeacherBlockedHours(selectedTeacher.code) }} Jam</span>
            </span>
            <span class="text-slate-400">|</span>
            <div class="flex items-center gap-3">
              <span class="inline-flex items-center gap-1.5 text-slate-600 font-medium">
                <span class="w-3 h-3 rounded bg-white border border-slate-300 inline-block"></span> Bisa Mengajar
              </span>
              <span class="inline-flex items-center gap-1.5 text-rose-700 font-bold">
                <span class="w-3 h-3 rounded bg-rose-500 inline-block"></span> Diblokir (No Entry)
              </span>
              <span class="inline-flex items-center gap-1.5 text-amber-700 font-bold">
                <span class="w-3 h-3 rounded bg-amber-100 border border-amber-300 inline-block"></span> Ada Jadwal Aktif
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button 
              @click="clearTeacherBlocks(selectedTeacher.code)"
              class="px-2.5 py-1 text-slate-600 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
            >
              Reset Semua Blok
            </button>
          </div>
        </div>
        
        <!-- 2D GRID BODY (Y: Time Slots, X: Days) -->
        <div class="p-4 sm:p-6 overflow-auto custom-scrollbar flex-1 bg-slate-50/50">
          <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden min-w-[720px]">
            <table class="w-full border-collapse">
              <!-- THEAD: DAYS ON X-AXIS + QUICK-SELECT COLUMN BUTTONS -->
              <thead>
                <tr class="bg-slate-100 text-slate-700 text-xs border-b border-slate-200">
                  <th class="py-3 px-4 font-black uppercase text-slate-500 w-36 text-left border-r border-slate-200 bg-slate-100/90 sticky left-0 z-20">
                    Jam / Sesi
                  </th>
                  <th 
                    v-for="day in activeDays" 
                    :key="'col-'+day"
                    class="py-3 px-3 text-center border-r last:border-r-0 border-slate-200 font-black"
                  >
                    <div class="flex flex-col items-center gap-1">
                      <span class="text-sm font-black text-slate-900 tracking-tight">{{ day }}</span>
                      <!-- Quick-Select Column Header Button: Block / Unblock Entire Day -->
                      <button 
                        type="button"
                        @click="toggleEntireDay(day)"
                        class="text-[10px] px-2 py-0.5 rounded-full font-bold transition-all border cursor-pointer active:scale-95"
                        :class="isEntireDayBlocked(day, selectedTeacher.code) 
                          ? 'bg-rose-500 text-white border-rose-600 shadow-2xs' 
                          : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-300'"
                        :title="'Klik untuk memblokir atau membuka seluruh hari ' + day"
                      >
                        {{ isEntireDayBlocked(day, selectedTeacher.code) ? '✕ Buka Hari' : '⚡ Blok Hari' }}
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>

              <!-- TBODY: TIME SLOTS ON Y-AXIS -->
              <tbody class="divide-y divide-slate-200">
                <tr 
                  v-for="slotNum in maxSlotCount" 
                  :key="'slot-row-'+slotNum"
                  class="hover:bg-slate-50/70 transition-colors"
                >
                  <!-- Row Header: Slot Index & Time Range -->
                  <td class="py-3 px-4 text-xs font-bold text-slate-800 bg-slate-50 border-r border-slate-200 sticky left-0 z-10">
                    <div class="flex items-center gap-2">
                      <span class="w-6 h-6 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs shrink-0">
                        {{ slotNum }}
                      </span>
                      <div class="min-w-0">
                        <span class="font-bold text-slate-800 block text-xs">Jam ke-{{ slotNum }}</span>
                        <span class="text-[10px] text-slate-500 font-mono block">
                          {{ getSlotReferenceTime(slotNum) }}
                        </span>
                      </div>
                    </div>
                  </td>

                  <!-- Day Cells on X-Axis -->
                  <td 
                    v-for="day in activeDays" 
                    :key="'cell-'+day+'-'+slotNum"
                    class="p-1.5 text-center border-r last:border-r-0 border-slate-200 align-middle relative"
                  >
                    <!-- If day does NOT have this slot -->
                    <div 
                      v-if="!hasDaySlot(day, slotNum)" 
                      class="h-14 rounded-xl flex items-center justify-center bg-slate-100/50 text-slate-300 text-xs font-mono"
                    >
                      —
                    </div>

                    <!-- If day HAS this slot -->
                    <div 
                      v-else
                      @mousedown="handleCellMouseDown(day, slotNum)"
                      @mouseenter="handleCellMouseEnter(day, slotNum)"
                      class="h-14 rounded-xl border p-2 flex flex-col items-center justify-center transition-all cursor-pointer select-none group"
                      :class="getCellClasses(day, slotNum, selectedTeacher.code)"
                    >
                      <!-- 1. BLOCKED CELL: Red background with 'No Entry' icon -->
                      <div v-if="isSlotBlockedCheck(day, slotNum, selectedTeacher.code)" class="flex flex-col items-center gap-0.5">
                        <svg class="w-4 h-4 text-rose-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                        </svg>
                        <span class="text-[10px] font-black uppercase tracking-wider text-rose-700">TIDAK BISA</span>
                      </div>

                      <!-- 2. HAS ACTIVE SCHEDULED CLASS: Show Warning badge -->
                      <div v-else-if="getActiveClass(day, slotNum, selectedTeacher.code)" class="flex flex-col items-center gap-0.5 text-[10px]">
                        <span class="font-bold text-amber-900 truncate max-w-[90px]">
                          {{ getActiveClass(day, slotNum, selectedTeacher.code).subject }}
                        </span>
                        <span class="font-mono text-[9px] px-1 bg-amber-200 text-amber-900 rounded font-black">
                          Kelas {{ getActiveClass(day, slotNum, selectedTeacher.code).class_id }}
                        </span>
                      </div>

                      <!-- 3. FREE / AVAILABLE CELL -->
                      <div v-else class="flex flex-col items-center gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                        <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        <span class="text-[9px] font-bold text-slate-500">Tersedia</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-5 sm:px-6 py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p class="text-xs text-slate-500 font-medium">
            Perubahan otomatis tersimpan ke draft lokal. Klik <b>"Selesai & Simpan"</b> untuk menyinkronkan ke server.
          </p>
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <button 
              @click="closeModal" 
              class="flex-1 sm:flex-none px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button 
              @click="closeModalAndSave" 
              class="flex-1 sm:flex-none px-6 py-2.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
            >
              Selesai & Simpan
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- Success Modal Notification -->
    <div v-if="showSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 transition-opacity">
      <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative animate-bounce-in text-center border-t-8 border-emerald-500">
        <button @click="showSuccessModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center mb-5 shadow-inner relative">
          <svg class="w-10 h-10 animate-draw-check" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 class="text-2xl font-black text-slate-900 mb-1">Berhasil Disimpan!</h2>
        <p class="text-xs text-slate-500 mb-6 font-medium leading-relaxed">
          Permintaan Jam Kosong guru telah disinkronkan ke Database & Mesin Penjadwalan GuruKu.
        </p>
        <button 
          @click="showSuccessModal = false" 
          class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
        >
          Selesai
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  normalizeTeacherConstraints,
  isTeacherBlocked,
  findActiveScheduleConflict,
  toggleSlotConstraint,
  toggleDayConstraint,
  formatTeacherConstraintSummary,
  getTeacherTotalBlockedSlots,
  constraintsToLegacyDict,
  STORAGE_KEY_CONSTRAINTS,
  STORAGE_KEY_SCHEDULE,
  capitalizeDay,
  DAY_ORDER
} from '../core/teacherConstraintsStore.js'

const loading = ref(true)
const saving = ref(false)
const showSuccessModal = ref(false)
const schoolId = localStorage.getItem('school_id')

// Master data
const teachers = ref([])
const activeDays = ref([])
const daySessions = ref({})
const activeSchedule = ref([])

// Search & Filter
const searchQuery = ref('')
const filterType = ref('all') // 'all' | 'blocked'

// Core Reactive State: teacherConstraints array
// Structure: [{ teacher_code: "BS", day: "Rabu", blocked_slots: [1, 2, 3, 4] }]
const teacherConstraints = ref([])

// Modal & Selection State
const selectedTeacher = ref(null)
const conflictWarning = ref(null)
let conflictTimer = null

// Mouse Drag-To-Select State
const isMouseDown = ref(false)
const dragMode = ref(null) // 'block' | 'unblock'

const handleMouseUp = () => {
  isMouseDown.value = false
  dragMode.value = null
}

const triggerConflictAlert = (message) => {
  conflictWarning.value = message
  if (conflictTimer) clearTimeout(conflictTimer)
  conflictTimer = setTimeout(() => {
    conflictWarning.value = null
  }, 4500)
}

// Open / Close Modal
const openModal = (teacher) => {
  selectedTeacher.value = teacher
  conflictWarning.value = null
}

const closeModal = () => {
  selectedTeacher.value = null
  conflictWarning.value = null
}

const closeModalAndSave = () => {
  closeModal()
  saveData()
}

// Max Slot Count for Rows
const maxSlotCount = computed(() => {
  let max = 0
  activeDays.value.forEach(day => {
    const kbm = (daySessions.value[day] || []).filter(s => s.type === 'KBM')
    if (kbm.length > max) max = kbm.length
  })
  return Math.max(max, 6) // Minimal 6 slot
})

const hasDaySlot = (day, slotNum) => {
  const kbm = (daySessions.value[day] || []).filter(s => s.type === 'KBM')
  return slotNum <= kbm.length
}

const getSlotReferenceTime = (slotNum) => {
  for (const day of activeDays.value) {
    const kbm = (daySessions.value[day] || []).filter(s => s.type === 'KBM')
    if (kbm[slotNum - 1]) {
      const sess = kbm[slotNum - 1]
      return `${sess.start_time || '07.30'} - ${sess.end_time || '08.15'}`
    }
  }
  return 'Waktu KBM'
}

// Checkers
const isSlotBlockedCheck = (day, slotNum, teacherCode) => {
  return isTeacherBlocked(teacherConstraints.value, teacherCode, day, slotNum)
}

const getActiveClass = (day, slotNum, teacherCode) => {
  return findActiveScheduleConflict(activeSchedule.value, teacherCode, day, slotNum)
}

const isEntireDayBlocked = (day, teacherCode) => {
  const kbm = (daySessions.value[day] || []).filter(s => s.type === 'KBM')
  if (kbm.length === 0) return false
  return kbm.every((_, idx) => isTeacherBlocked(teacherConstraints.value, teacherCode, day, idx + 1))
}

const getCellClasses = (day, slotNum, teacherCode) => {
  const blocked = isSlotBlockedCheck(day, slotNum, teacherCode)
  if (blocked) {
    return 'bg-rose-50 border-rose-300 hover:bg-rose-100 shadow-2xs'
  }
  const activeClass = getActiveClass(day, slotNum, teacherCode)
  if (activeClass) {
    return 'bg-amber-50/80 border-amber-300 hover:bg-amber-100'
  }
  return 'bg-white border-slate-200 hover:bg-blue-50/50 hover:border-blue-300'
}

// Mouse Drag & Click Handlers
const handleCellMouseDown = (day, slotNum) => {
  if (!selectedTeacher.value) return
  isMouseDown.value = true

  const currentlyBlocked = isSlotBlockedCheck(day, slotNum, selectedTeacher.value.code)
  dragMode.value = currentlyBlocked ? 'unblock' : 'block'
  applyCellAction(day, slotNum, dragMode.value)
}

const handleCellMouseEnter = (day, slotNum) => {
  if (!isMouseDown.value || !dragMode.value || !selectedTeacher.value) return
  applyCellAction(day, slotNum, dragMode.value)
}

const applyCellAction = (day, slotNum, mode) => {
  const tCode = selectedTeacher.value.code
  const isBlocked = isSlotBlockedCheck(day, slotNum, tCode)

  if (mode === 'block' && !isBlocked) {
    // REAL-TIME VALIDATION: Check active schedule
    const conflict = getActiveClass(day, slotNum, tCode)
    if (conflict) {
      triggerConflictAlert("Gagal: Guru sudah memiliki jadwal aktif pada waktu ini. Hapus jadwal terlebih dahulu.")
      return
    }
    toggleSlotConstraint(teacherConstraints.value, tCode, day, slotNum, activeSchedule.value)
    persistLocal()
  } else if (mode === 'unblock' && isBlocked) {
    toggleSlotConstraint(teacherConstraints.value, tCode, day, slotNum, activeSchedule.value)
    persistLocal()
  }
}

// Quick-Select Column Header: Toggle Entire Day
const toggleEntireDay = (day) => {
  if (!selectedTeacher.value) return
  const tCode = selectedTeacher.value.code
  const kbm = (daySessions.value[day] || []).filter(s => s.type === 'KBM')
  const allSlotNumbers = kbm.map((_, idx) => idx + 1)

  const res = toggleDayConstraint(
    teacherConstraints.value,
    tCode,
    day,
    allSlotNumbers,
    activeSchedule.value
  )

  if (!res.success && res.conflict) {
    triggerConflictAlert("Gagal: Guru sudah memiliki jadwal aktif pada waktu ini. Hapus jadwal terlebih dahulu.")
  } else {
    persistLocal()
  }
}

// Reset Blocks for single teacher
const clearTeacherBlocks = (teacherCode) => {
  const normCode = teacherCode.trim().toUpperCase()
  teacherConstraints.value = teacherConstraints.value.filter(c => c.teacher_code.trim().toUpperCase() !== normCode)
  persistLocal()
}

// Teacher Card Helpers
const hasTeacherConstraint = (teacherCode) => {
  return getTeacherTotalBlockedSlots(teacherConstraints.value, teacherCode) > 0
}

const getSummaryText = (teacherCode) => {
  return formatTeacherConstraintSummary(teacherConstraints.value, teacherCode)
}

const getTeacherBlockedHours = (teacherCode) => {
  return getTeacherTotalBlockedSlots(teacherConstraints.value, teacherCode)
}

const teachersWithConstraintsCount = computed(() => {
  return teachers.value.filter(t => hasTeacherConstraint(t.code)).length
})

// Filtered Teachers
const filteredTeachers = computed(() => {
  let list = teachers.value

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.code.toLowerCase().includes(q) ||
      (t.subject && t.subject.toLowerCase().includes(q))
    )
  }

  if (filterType.value === 'blocked') {
    list = list.filter(t => hasTeacherConstraint(t.code))
  }

  return list
})

// Local Persistence Helper
const persistLocal = () => {
  localStorage.setItem(STORAGE_KEY_CONSTRAINTS, JSON.stringify(teacherConstraints.value))
  // Keep legacy dict updated for backward compatibility
  const legacyDict = constraintsToLegacyDict(teacherConstraints.value)
  localStorage.setItem('guruKu_jam_kosong_data', JSON.stringify(legacyDict))
}

// Fetch all initial data
const fetchAllData = async () => {
  loading.value = true
  try {
    // 1. Fetch Teachers from Master Data
    const savedTeachers = localStorage.getItem('guruKu_teachers')
    if (savedTeachers) {
      const parsed = JSON.parse(savedTeachers)
      teachers.value = parsed.map(t => ({
        code: (t.code || t.teacher_code || '').trim().toUpperCase(),
        name: t.name || t.teacher_name,
        subject: t.subject || t.specialization || ''
      })).sort((a, b) => a.code.localeCompare(b.code))
    }

    // 2. Fetch Sessions from API or Local
    const sessionRes = await fetch('/api/v1/school/sessions', {
      headers: { 'X-School-ID': schoolId || '' }
    })
    if (sessionRes.ok) {
      const data = await sessionRes.json()
      const days = Object.keys(data).sort((a, b) => (DAY_ORDER[a] || 99) - (DAY_ORDER[b] || 99))
      activeDays.value = days
      
      days.forEach(day => {
        let kbmCount = 0
        daySessions.value[day] = data[day].map(s => {
          if (s.type === 'KBM') {
            kbmCount++
            return { ...s, label: kbmCount.toString() }
          }
          return { ...s, label: 'ISTIRAHAT' }
        })
      })
    } else {
      activeDays.value = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    }

    // 3. Load Active Schedule for Real-Time Conflict Detection
    const savedSchedule = localStorage.getItem(STORAGE_KEY_SCHEDULE)
    if (savedSchedule) {
      try {
        activeSchedule.value = JSON.parse(savedSchedule)
      } catch (e) {
        activeSchedule.value = []
      }
    } else {
      // Try fetch from API
      try {
        const schedRes = await fetch('/api/v1/school/jadwal', {
          headers: { 'X-School-ID': schoolId || '' }
        })
        if (schedRes.ok) {
          const sData = await schedRes.json()
          activeSchedule.value = Array.isArray(sData) ? sData : []
        }
      } catch (e) {
        activeSchedule.value = []
      }
    }

    // 4. Fetch Constraints (Local first, then API)
    const localConstraints = localStorage.getItem(STORAGE_KEY_CONSTRAINTS)
    if (localConstraints) {
      teacherConstraints.value = normalizeTeacherConstraints(JSON.parse(localConstraints))
    }

    const kosRes = await fetch('/api/v1/school/jam-kosong', {
      headers: { 'X-School-ID': schoolId || '' }
    })
    if (kosRes.ok) {
      const data = await kosRes.json()
      if (data && (!localConstraints || Array.isArray(data) && data.length > 0)) {
        teacherConstraints.value = normalizeTeacherConstraints(data)
        persistLocal()
      }
    }
  } catch (err) {
    console.error("Gagal sinkronisasi data jam kosong:", err)
  } finally {
    loading.value = false
  }
}

// Save Data to Server
const saveData = async () => {
  saving.value = true
  persistLocal()

  try {
    const res = await fetch('/api/v1/school/jam-kosong', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-School-ID': schoolId || ''
      },
      body: JSON.stringify(teacherConstraints.value)
    })
    if (res.ok) {
      showSuccessModal.value = true
    } else {
      alert("Peringatan: Berhasil disimpan secara lokal, namun server gagal merespons.")
    }
  } catch (err) {
    console.warn("Jaringan offline, tersimpan di localStorage:", err)
    showSuccessModal.value = true
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchAllData()
  window.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mouseup', handleMouseUp)
  if (conflictTimer) clearTimeout(conflictTimer)
})
</script>

<style scoped>
@keyframes bounce-in {
  0% { transform: scale(0.85); opacity: 0; }
  50% { transform: scale(1.03); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
.animate-bounce-in {
  animation: bounce-in 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
@keyframes draw-check {
  0% { stroke-dasharray: 50; stroke-dashoffset: 50; }
  100% { stroke-dasharray: 50; stroke-dashoffset: 0; }
}
.animate-draw-check {
  animation: draw-check 0.45s ease-out forwards;
  animation-delay: 0.15s;
  stroke-dasharray: 50;
  stroke-dashoffset: 50;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent; 
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1; 
  border-radius: 10px;
}
</style>
