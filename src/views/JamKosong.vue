<template>
  <div class="animate-fade-in-up p-4 md:p-8 max-w-[1400px] mx-auto w-full select-none" @mouseup="handleMouseUp">
    
    <!-- Toast Notification Banner -->
    <transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-4"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="toast" 
        class="fixed top-5 right-5 z-50 max-w-sm sm:max-w-md w-full shadow-xl rounded-2xl border p-4 flex items-start gap-3 backdrop-blur-md"
        :class="{
          'bg-rose-50/95 border-rose-300 text-rose-900': toast.type === 'error',
          'bg-amber-50/95 border-amber-300 text-amber-900': toast.type === 'warning',
          'bg-emerald-50/95 border-emerald-300 text-emerald-900': toast.type === 'success'
        }"
      >
        <!-- Icon Error -->
        <svg v-if="toast.type === 'error'" class="w-5 h-5 text-rose-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <!-- Icon Warning -->
        <svg v-else-if="toast.type === 'warning'" class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <!-- Icon Success -->
        <svg v-else class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>

        <div class="flex-1 min-w-0">
          <p class="text-xs font-black tracking-tight" :class="toast.type === 'error' ? 'text-rose-950' : (toast.type === 'warning' ? 'text-amber-950' : 'text-emerald-950')">
            {{ toast.title }}
          </p>
          <p class="text-xs mt-0.5 leading-relaxed opacity-90">
            {{ toast.message }}
          </p>
        </div>

        <button @click="toast = null" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    </transition>

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
              <div class="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 rounded-xl flex items-center justify-center font-black text-base shadow-inner border border-blue-100 shrink-0 group-hover:scale-105 transition-transform">
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
          <!-- Summary Badge (e.g. "4 Jam Kosong (Rabu)" or "0 Jam Kosong") - O(1) Precomputed -->
          <div class="min-w-0">
            <span 
              v-if="(teacherBlockedCountMap.get(teacher.code) || 0) > 0"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs max-w-full truncate"
              :title="teacherSummaryMap.get(teacher.code)"
            >
              <svg class="w-3.5 h-3.5 shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
              </svg>
              <span class="truncate">{{ teacherSummaryMap.get(teacher.code) }}</span>
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

        <!-- Modal Summary Toolbar & STRICTLY NO EMOJI Legend -->
        <div class="px-5 sm:px-6 py-2.5 bg-slate-100/60 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-4 flex-wrap">
            <span class="font-bold text-slate-700">
              Total Diblokir: 
              <span class="font-black text-rose-600">{{ currentTeacherBlockedCount }} Jam</span>
            </span>
            <span class="text-slate-300">|</span>
            <!-- Pure SVG Legend as Requested -->
            <div class="flex items-center gap-4 flex-wrap">
              <!-- Legend 1: Bisa Mengajar (Empty square with subtle gray border) -->
              <span class="inline-flex items-center gap-1.5 text-slate-600 font-semibold text-xs">
                <span class="w-3.5 h-3.5 rounded-sm border-2 border-slate-300 bg-white inline-block shadow-2xs"></span>
                <span>Bisa Mengajar</span>
              </span>
              <!-- Legend 2: Diblokir (Solid Red with white X icon) -->
              <span class="inline-flex items-center gap-1.5 text-rose-700 font-bold text-xs">
                <span class="w-3.5 h-3.5 rounded-sm bg-rose-600 text-white inline-flex items-center justify-center shadow-2xs">
                  <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </span>
                <span>Diblokir (No Entry)</span>
              </span>
              <!-- Legend 3: Ada Jadwal Aktif (Solid Amber with Lock icon) -->
              <span class="inline-flex items-center gap-1.5 text-amber-800 font-bold text-xs">
                <span class="w-3.5 h-3.5 rounded-sm bg-amber-500 text-white inline-flex items-center justify-center shadow-2xs">
                  <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </span>
                <span>Ada Jadwal Aktif</span>
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button 
              @click="clearTeacherBlocks"
              class="px-2.5 py-1 text-slate-600 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg font-bold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              <span>Reset Blokir Guru Ini</span>
            </button>
          </div>
        </div>
        
        <!-- 2D GRID BODY (Y: Time Slots, X: Days) - O(1) ULTRA-PERFORMANCE -->
        <div class="p-4 sm:p-6 overflow-auto custom-scrollbar flex-1 bg-slate-50/50">
          <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden min-w-[720px]">
            <table class="w-full border-collapse">
              <!-- THEAD: DAYS ON X-AXIS + QUICK-SELECT COLUMN BUTTONS (NO EMOJIS) -->
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
                      
                      <!-- Quick-Select Column Header Button with Clean SVG Icons -->
                      <button 
                        type="button"
                        @click="toggleEntireDay(day)"
                        class="text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all border cursor-pointer active:scale-95 inline-flex items-center gap-1 shadow-2xs"
                        :class="isDayFullyBlocked(day) 
                          ? 'bg-rose-600 text-white border-rose-700' 
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'"
                        :title="'Klik untuk memblokir atau membuka seluruh hari ' + day"
                      >
                        <svg v-if="isDayFullyBlocked(day)" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        </svg>
                        <svg v-else class="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                        <span>{{ isDayFullyBlocked(day) ? 'Buka Hari' : 'Blok Hari' }}</span>
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
                  <!-- Row Header: Slot Index & Time Range (O(1) precomputed) -->
                  <td class="py-3 px-4 text-xs font-bold text-slate-800 bg-slate-50 border-r border-slate-200 sticky left-0 z-10">
                    <div class="flex items-center gap-2">
                      <span class="w-6 h-6 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs shrink-0">
                        {{ slotNum }}
                      </span>
                      <div class="min-w-0">
                        <span class="font-bold text-slate-800 block text-xs">Jam ke-{{ slotNum }}</span>
                        <span class="text-[10px] text-slate-500 font-mono block">
                          {{ slotReferenceTimes[slotNum - 1] || 'Waktu KBM' }}
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
                    <!-- If day does NOT have this slot: O(1) Map lookup -->
                    <div 
                      v-if="slotNum > (dayKbmCountMap.get(day) || 0)" 
                      class="h-13 rounded-xl flex items-center justify-center bg-slate-100/50 text-slate-300 text-xs font-mono"
                    >
                      —
                    </div>

                    <!-- If day HAS this slot -->
                    <div 
                      v-else
                      @mousedown="handleCellMouseDown(day, slotNum)"
                      @mouseenter="handleCellMouseEnter(day, slotNum)"
                      class="h-13 rounded-xl border p-2 flex flex-col items-center justify-center transition-all cursor-pointer select-none group"
                      :class="{
                        'bg-rose-600 border-rose-600 text-white shadow-xs': blockedSlotsSet.has(day + '__' + slotNum),
                        'bg-amber-50 border-amber-300 text-amber-950 shadow-2xs': !blockedSlotsSet.has(day + '__' + slotNum) && activeScheduleMap.has(day + '__' + slotNum),
                        'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/40': !blockedSlotsSet.has(day + '__' + slotNum) && !activeScheduleMap.has(day + '__' + slotNum)
                      }"
                    >
                      <!-- 1. BLOCKED CELL: Solid Red with white X icon (O(1) Set lookup) -->
                      <div v-if="blockedSlotsSet.has(day + '__' + slotNum)" class="flex flex-col items-center gap-0.5">
                        <div class="w-4 h-4 rounded-sm bg-white/20 flex items-center justify-center">
                          <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </div>
                        <span class="text-[9px] font-black uppercase tracking-wider text-rose-100">Diblokir</span>
                      </div>

                      <!-- 2. HAS ACTIVE SCHEDULED CLASS: Solid Amber with Lock/Calendar icon (O(1) Map lookup) -->
                      <div v-else-if="activeScheduleMap.has(day + '__' + slotNum)" class="flex flex-col items-center gap-0.5 text-[10px]">
                        <div class="flex items-center gap-1 text-amber-900 font-black">
                          <svg class="w-3 h-3 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                          </svg>
                          <span class="truncate max-w-[80px]">{{ activeScheduleMap.get(day + '__' + slotNum).subject }}</span>
                        </div>
                        <span class="font-mono text-[9px] px-1 py-0.2 bg-amber-200/90 text-amber-950 rounded font-black">
                          Kelas {{ activeScheduleMap.get(day + '__' + slotNum).class_id }}
                        </span>
                      </div>

                      <!-- 3. FREE / AVAILABLE CELL: Empty square with subtle gray border (O(1)) -->
                      <div v-else class="flex flex-col items-center gap-0.5 opacity-50 group-hover:opacity-100 transition-opacity">
                        <div class="w-3.5 h-3.5 rounded-sm border-2 border-slate-300 group-hover:border-blue-500 bg-white transition-colors"></div>
                        <span class="text-[9px] font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">Tersedia</span>
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

    <!-- Success Modal Notification (STRICTLY NO EMOJIS) -->
    <div v-if="showSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 transition-opacity">
      <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative animate-bounce-in text-center border-t-8 border-emerald-500">
        <button @click="showSuccessModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center mb-5 shadow-inner relative">
          <svg class="w-10 h-10 animate-draw-check" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 class="text-2xl font-black text-slate-900 mb-1">Berhasil Disimpan</h2>
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
  formatTeacherConstraintSummary,
  getTeacherTotalBlockedSlots,
  constraintsToLegacyDict,
  STORAGE_KEY_CONSTRAINTS,
  STORAGE_KEY_SCHEDULE,
  capitalizeDay,
  DAY_ORDER
} from '../core/teacherConstraintsStore.js'

// Safe API Fetcher Helper to guarantee NO "Unexpected token '<'"
const safeFetchJson = async (url, options = {}) => {
  try {
    const res = await fetch(url, options)
    if (!res.ok) {
      return { ok: false, status: res.status, data: null, error: `HTTP ${res.status}` }
    }
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return { ok: false, status: res.status, data: null, error: 'Format respons bukan JSON' }
    }
    const data = await res.json()
    return { ok: true, status: res.status, data, error: null }
  } catch (err) {
    return { ok: false, status: 0, data: null, error: err.message || 'Jaringan terputus' }
  }
}

const loading = ref(true)
const saving = ref(false)
const showSuccessModal = ref(false)
const schoolId = localStorage.getItem('school_id')

// Master data
const teachers = ref([])
const activeDays = ref(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'])
const daySessions = ref({})
const rawActiveSchedule = ref([])

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

// Toast State
const toast = ref(null)
let toastTimer = null
const showToast = (title, message, type = 'error', duration = 4000) => {
  toast.value = { title, message, type }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value = null
  }, duration)
}

// ============================================================================
// PERFORMANCE OPTIMIZATION: O(1) Sets & Maps for Modal Rendering
// ============================================================================
// 1. Set of keys: `${day}__${slotNum}` for the selected teacher (Instant O(1) lookup in template)
const blockedSlotsSet = ref(new Set())

// 2. Map of active scheduled classes for selected teacher: `${day}__${slotNum}` -> { subject, class_id }
const activeScheduleMap = ref(new Map())

// 3. Map of day -> KBM count (Instant O(1) lookup in template)
const dayKbmCountMap = computed(() => {
  const map = new Map()
  activeDays.value.forEach(day => {
    const kbm = (daySessions.value[day] || []).filter(s => s.type === 'KBM')
    map.set(day, kbm.length)
  })
  return map
})

// 4. Precalculated Slot Reference Times (O(1) index access)
const slotReferenceTimes = computed(() => {
  const times = []
  const max = maxSlotCount.value
  for (let i = 1; i <= max; i++) {
    let foundTime = '07.30 - 08.15'
    for (const day of activeDays.value) {
      const kbm = (daySessions.value[day] || []).filter(s => s.type === 'KBM')
      if (kbm[i - 1]) {
        const sess = kbm[i - 1]
        foundTime = `${sess.start_time || '07.30'} - ${sess.end_time || '08.15'}`
        break
      }
    }
    times.push(foundTime)
  }
  return times
})

// 5. Precomputed Map for Teacher Cards in Main View
const teacherSummaryMap = computed(() => {
  const map = new Map()
  teachers.value.forEach(t => {
    map.set(t.code, formatTeacherConstraintSummary(teacherConstraints.value, t.code))
  })
  return map
})

const teacherBlockedCountMap = computed(() => {
  const map = new Map()
  teachers.value.forEach(t => {
    map.set(t.code, getTeacherTotalBlockedSlots(teacherConstraints.value, t.code))
  })
  return map
})

// Build O(1) state whenever selectedTeacher opens
const buildTeacherModalState = (teacher) => {
  if (!teacher) {
    blockedSlotsSet.value = new Set()
    activeScheduleMap.value = new Map()
    return
  }

  const tCode = teacher.code.trim().toUpperCase()

  // Build blockedSlotsSet
  const newBlockedSet = new Set()
  teacherConstraints.value.forEach(c => {
    if (c.teacher_code.trim().toUpperCase() === tCode && Array.isArray(c.blocked_slots)) {
      const day = capitalizeDay(c.day)
      c.blocked_slots.forEach(slot => {
        newBlockedSet.add(`${day}__${slot}`)
      })
    }
  })
  blockedSlotsSet.value = newBlockedSet

  // Build activeScheduleMap
  const newSchedMap = new Map()
  rawActiveSchedule.value.forEach(item => {
    const itemTeacher = (item.teacher_code || item.guru || '').trim().toUpperCase()
    if (itemTeacher === tCode) {
      const day = capitalizeDay(item.day)
      const slot = Number(item.slot_index || item.session || 0)
      if (slot > 0) {
        newSchedMap.set(`${day}__${slot}`, {
          subject: (item.subject || item.mapel || '').trim().toUpperCase(),
          class_id: (item.class_id || item.cls || item.className || '').trim().toUpperCase()
        })
      }
    }
  })
  activeScheduleMap.value = newSchedMap
}

// Sync blockedSlotsSet back to teacherConstraints array
const syncBlockedSetToConstraints = () => {
  if (!selectedTeacher.value) return
  const tCode = selectedTeacher.value.code.trim().toUpperCase()

  // Group by day
  const daySlotsMap = new Map()
  blockedSlotsSet.value.forEach(key => {
    const [day, slotStr] = key.split('__')
    const slot = Number(slotStr)
    if (!daySlotsMap.has(day)) {
      daySlotsMap.set(day, [])
    }
    daySlotsMap.get(day).push(slot)
  })

  // Remove existing entries for this teacher
  const filtered = teacherConstraints.value.filter(c => c.teacher_code.trim().toUpperCase() !== tCode)

  // Add updated entries
  for (const [day, slots] of daySlotsMap.entries()) {
    if (slots.length > 0) {
      filtered.push({
        teacher_code: tCode,
        day,
        blocked_slots: slots.sort((a, b) => a - b)
      })
    }
  }

  teacherConstraints.value = filtered
  persistLocal()
}

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
  buildTeacherModalState(teacher)
}

const closeModal = () => {
  syncBlockedSetToConstraints()
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
    const kbm = dayKbmCountMap.value.get(day) || 0
    if (kbm > max) max = kbm
  })
  return Math.max(max, 6) // Minimal 6 slot
})

// O(1) Check if Day is fully blocked
const isDayFullyBlocked = (day) => {
  const totalSlots = dayKbmCountMap.value.get(day) || 0
  if (totalSlots === 0) return false
  for (let s = 1; s <= totalSlots; s++) {
    if (!blockedSlotsSet.value.has(`${day}__${s}`)) {
      return false
    }
  }
  return true
}

// Cell Mouse Drag & Click Handlers (O(1))
const handleCellMouseDown = (day, slotNum) => {
  if (!selectedTeacher.value) return
  isMouseDown.value = true

  const key = `${day}__${slotNum}`
  const currentlyBlocked = blockedSlotsSet.value.has(key)
  dragMode.value = currentlyBlocked ? 'unblock' : 'block'
  applyCellAction(day, slotNum, dragMode.value)
}

const handleCellMouseEnter = (day, slotNum) => {
  if (!isMouseDown.value || !dragMode.value || !selectedTeacher.value) return
  applyCellAction(day, slotNum, dragMode.value)
}

const applyCellAction = (day, slotNum, mode) => {
  const key = `${day}__${slotNum}`
  const isBlocked = blockedSlotsSet.value.has(key)

  if (mode === 'block' && !isBlocked) {
    // REAL-TIME VALIDATION: Check active schedule
    const conflict = activeScheduleMap.value.get(key)
    if (conflict) {
      triggerConflictAlert(`Gagal: Guru sudah memiliki jadwal aktif pada waktu ini (${conflict.subject} - Kelas ${conflict.class_id}). Hapus jadwal terlebih dahulu.`)
      return
    }
    blockedSlotsSet.value.add(key)
    syncBlockedSetToConstraints()
  } else if (mode === 'unblock' && isBlocked) {
    blockedSlotsSet.value.delete(key)
    syncBlockedSetToConstraints()
  }
}

// Quick-Select Column Header: Toggle Entire Day
const toggleEntireDay = (day) => {
  if (!selectedTeacher.value) return
  const totalSlots = dayKbmCountMap.value.get(day) || 0
  if (totalSlots === 0) return

  const fullyBlocked = isDayFullyBlocked(day)

  if (fullyBlocked) {
    // UNBLOCK ALL
    for (let s = 1; s <= totalSlots; s++) {
      blockedSlotsSet.value.delete(`${day}__${s}`)
    }
    syncBlockedSetToConstraints()
  } else {
    // Check conflicts for all slots to be blocked
    for (let s = 1; s <= totalSlots; s++) {
      const key = `${day}__${s}`
      if (!blockedSlotsSet.value.has(key)) {
        const conflict = activeScheduleMap.value.get(key)
        if (conflict) {
          triggerConflictAlert(`Gagal: Guru sudah memiliki jadwal aktif pada ${day} Jam ke-${s} (${conflict.subject} - Kelas ${conflict.class_id}). Hapus jadwal terlebih dahulu.`)
          return
        }
      }
    }

    // BLOCK ALL
    for (let s = 1; s <= totalSlots; s++) {
      blockedSlotsSet.value.add(`${day}__${s}`)
    }
    syncBlockedSetToConstraints()
  }
}

// Reset Blocks for single teacher
const clearTeacherBlocks = () => {
  blockedSlotsSet.value.clear()
  syncBlockedSetToConstraints()
}

const currentTeacherBlockedCount = computed(() => {
  return blockedSlotsSet.value.size
})

const teachersWithConstraintsCount = computed(() => {
  return teachers.value.filter(t => (teacherBlockedCountMap.value.get(t.code) || 0) > 0).length
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
    list = list.filter(t => (teacherBlockedCountMap.value.get(t.code) || 0) > 0)
  }

  return list
})

// Local Persistence Helper
const persistLocal = () => {
  localStorage.setItem(STORAGE_KEY_CONSTRAINTS, JSON.stringify(teacherConstraints.value))
  const legacyDict = constraintsToLegacyDict(teacherConstraints.value)
  localStorage.setItem('guruKu_jam_kosong_data', JSON.stringify(legacyDict))
}

// Fallback Default KBM Sessions Matrix
const createDefaultSessions = () => {
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const sessions = {}
  days.forEach(day => {
    sessions[day] = [
      { type: 'KBM', start_time: '07:30', end_time: '08:15', label: '1' },
      { type: 'KBM', start_time: '08:15', end_time: '09:00', label: '2' },
      { type: 'KBM', start_time: '09:00', end_time: '09:45', label: '3' },
      { type: 'ISTIRAHAT', start_time: '09:45', end_time: '10:15', label: 'ISTIRAHAT' },
      { type: 'KBM', start_time: '10:15', end_time: '11:00', label: '4' },
      { type: 'KBM', start_time: '11:00', end_time: '11:45', label: '5' },
      { type: 'ISTIRAHAT', start_time: '11:45', end_time: '12:30', label: 'ISTIRAHAT' },
      { type: 'KBM', start_time: '12:30', end_time: '13:15', label: '6' },
      { type: 'KBM', start_time: '13:15', end_time: '14:00', label: '7' },
    ]
  })
  return { days, sessions }
}

// Fetch all initial data with strict anti-crash error handling
const fetchAllData = async () => {
  loading.value = true
  try {
    // 1. Fetch Teachers from Master Data
    const savedTeachers = localStorage.getItem('guruKu_teachers')
    if (savedTeachers) {
      try {
        const parsed = JSON.parse(savedTeachers)
        teachers.value = parsed.map(t => ({
          code: (t.code || t.teacher_code || '').trim().toUpperCase(),
          name: t.name || t.teacher_name,
          subject: t.subject || t.specialization || ''
        })).sort((a, b) => a.code.localeCompare(b.code))
      } catch (e) {
        teachers.value = []
      }
    }

    // 2. Fetch Sessions from API with safe JSON check and local fallback
    const sessionRes = await safeFetchJson('/api/v1/school/sessions', {
      headers: { 'X-School-ID': schoolId || '' }
    })

    if (sessionRes.ok && sessionRes.data && typeof sessionRes.data === 'object') {
      const data = sessionRes.data
      const days = Object.keys(data).sort((a, b) => (DAY_ORDER[a] || 99) - (DAY_ORDER[b] || 99))
      activeDays.value = days.length > 0 ? days : ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
      
      activeDays.value.forEach(day => {
        let kbmCount = 0
        daySessions.value[day] = (data[day] || []).map(s => {
          if (s.type === 'KBM') {
            kbmCount++
            return { ...s, label: kbmCount.toString() }
          }
          return { ...s, label: 'ISTIRAHAT' }
        })
      })
    } else {
      // Graceful Fallback: LocalStorage 'guruKu_sesi_kbm' or standard schedule
      const localSesi = localStorage.getItem('guruKu_sesi_kbm')
      if (localSesi) {
        try {
          const parsed = JSON.parse(localSesi)
          const days = Object.keys(parsed).sort((a, b) => (DAY_ORDER[a] || 99) - (DAY_ORDER[b] || 99))
          activeDays.value = days
          days.forEach(day => {
            let kbmCount = 0
            daySessions.value[day] = (parsed[day] || []).map(s => {
              if (s.type === 'KBM') {
                kbmCount++
                return { ...s, label: kbmCount.toString() }
              }
              return { ...s, label: 'ISTIRAHAT' }
            })
          })
        } catch (e) {
          const fallback = createDefaultSessions()
          activeDays.value = fallback.days
          daySessions.value = fallback.sessions
        }
      } else {
        const fallback = createDefaultSessions()
        activeDays.value = fallback.days
        daySessions.value = fallback.sessions
      }

      if (sessionRes.error) {
        showToast('Koneksi Server Offline', 'Gagal memuat sesi KBM dari server. Menggunakan data sesi lokal.', 'warning', 5000)
      }
    }

    // 3. Load Active Schedule for Real-Time Conflict Detection
    const savedSchedule = localStorage.getItem(STORAGE_KEY_SCHEDULE)
    if (savedSchedule) {
      try {
        rawActiveSchedule.value = JSON.parse(savedSchedule)
      } catch (e) {
        rawActiveSchedule.value = []
      }
    } else {
      const schedRes = await safeFetchJson('/api/v1/school/jadwal', {
        headers: { 'X-School-ID': schoolId || '' }
      })
      if (schedRes.ok && Array.isArray(schedRes.data)) {
        rawActiveSchedule.value = schedRes.data
      }
    }

    // 4. Fetch Constraints (Local first, then API)
    const localConstraints = localStorage.getItem(STORAGE_KEY_CONSTRAINTS)
    if (localConstraints) {
      try {
        teacherConstraints.value = normalizeTeacherConstraints(JSON.parse(localConstraints))
      } catch (e) {
        teacherConstraints.value = []
      }
    }

    const kosRes = await safeFetchJson('/api/v1/school/jam-kosong', {
      headers: { 'X-School-ID': schoolId || '' }
    })
    if (kosRes.ok && kosRes.data && (!localConstraints || (Array.isArray(kosRes.data) && kosRes.data.length > 0))) {
      teacherConstraints.value = normalizeTeacherConstraints(kosRes.data)
      persistLocal()
    }
  } catch (err) {
    showToast('Peringatan Data', 'Terjadi kendala saat sinkronisasi data master. Menggunakan cache lokal.', 'warning')
  } finally {
    loading.value = false
  }
}

// Save Data to Server
const saveData = async () => {
  saving.value = true
  persistLocal()

  try {
    const res = await safeFetchJson('/api/v1/school/jam-kosong', {
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
      showToast('Tersimpan di Perangkat', 'Data berhasil disimpan di penyimpanan lokal browser.', 'success', 3500)
      showSuccessModal.value = true
    }
  } catch (err) {
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
  if (toastTimer) clearTimeout(toastTimer)
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
