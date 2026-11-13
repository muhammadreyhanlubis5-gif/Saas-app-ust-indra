<template>
  <div class="animate-fade-in-up p-4 md:p-8 max-w-[1400px] mx-auto w-full">
    <!-- Header & Breadcrumbs -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div class="flex items-center gap-4">
        <router-link
          :to="ROUTES.SCHOOL_ADMIN"
          class="p-2.5 bg-white rounded-xl shadow-xs hover:bg-gray-50 border border-gray-200 transition-colors text-gray-600 hover:text-gray-900"
          title="Kembali ke Dashboard"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </router-link>
        <div>
          <nav class="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
            <router-link :to="ROUTES.SCHOOL_ADMIN" class="hover:text-blue-600 transition-colors">Admin Sekolah</router-link>
            <span>/</span>
            <span class="text-blue-600">Validasi Lembaga</span>
          </nav>
          <h1 class="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Validasi Lembaga & Hari KBM</h1>
          <p class="text-gray-500 text-xs md:text-sm mt-0.5">Langkah 1: Verifikasi identitas resmi sekolah dan tentukan jadwal hari aktif pembelajaran.</p>
        </div>
      </div>

      <!-- Status Validasi Badge -->
      <div class="flex items-center gap-2 self-start sm:self-center">
        <div
          class="px-3.5 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 shadow-2xs"
          :class="setupStore.isProfileComplete
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-amber-50 text-amber-700 border-amber-200'"
        >
          <span
            class="w-2 h-2 rounded-full"
            :class="setupStore.isProfileComplete ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'"
          ></span>
          <span>{{ setupStore.isProfileComplete ? 'Status: Terverifikasi' : 'Status: Menunggu Validasi' }}</span>
        </div>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="setupStore.isLoading" class="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
      <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="text-gray-500 text-sm font-medium">Memuat data konfigurasi lembaga...</p>
    </div>

    <form v-else @submit.prevent="handleSave(false)" class="space-y-8">
      
      <!-- Section 1: Data Master Identitas -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        <div class="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-4 border-b border-blue-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center backdrop-blur-xs">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 class="font-bold text-white text-base">Data Master Identitas Sekolah</h2>
              <p class="text-xs text-blue-100">Informasi resmi yang akan tercetak pada kop dan lembar pengesahan jadwal KBM.</p>
            </div>
          </div>
          <span class="hidden sm:inline-block text-[11px] font-bold text-blue-100 bg-white/10 px-3 py-1 rounded-full border border-white/20">
            Langkah 1 dari 3
          </span>
        </div>

        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          
          <!-- Nama Sekolah (Read-Only) -->
          <div class="md:col-span-2">
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-black text-gray-700 uppercase tracking-wider">
                Nama Sekolah / Madrasah
              </label>
              <span class="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <svg class="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m11-7V7a2 2 0 00-2-2H5a2 2 0 00-2 2v4m16 0v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7m16 0H3" />
                </svg>
                Dikelola oleh Super Admin / Registrasi Resmi
              </span>
            </div>
            <div class="relative">
              <input
                type="text"
                :value="setupStore.schoolProfile.schoolName"
                disabled
                class="w-full bg-gray-50 text-gray-800 font-bold border border-gray-300 rounded-xl px-4 py-2.5 outline-none cursor-not-allowed text-sm"
              />
              <div class="absolute right-3 top-3 text-gray-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <p class="text-[11px] text-gray-500 mt-1">
              *Nama lembaga terkunci sesuai lisensi resmi. Hubungi Super Admin jika ingin mengubah nama institusi.
            </p>
          </div>

          <!-- Nama Kepala Sekolah -->
          <div>
            <label class="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1">
              Nama Kepala Sekolah <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="setupStore.schoolProfile.principalName"
              @input="onFieldInput"
              type="text"
              class="w-full bg-white text-gray-900 border rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
              :class="errors.principalName ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-2 focus:ring-rose-400' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'"
              placeholder="Contoh: Dr. H. Ahmad Dahlan, M.Pd"
            />
            <p v-if="errors.principalName" class="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
              <svg class="w-3.5 h-3.5 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              <span>{{ errors.principalName }}</span>
            </p>
          </div>

          <!-- Nama Waka Kurikulum -->
          <div>
            <label class="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1">
              Nama Wakasek Bid. Kurikulum <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="setupStore.schoolProfile.curriculumVicePrincipalName"
              @input="onFieldInput"
              type="text"
              class="w-full bg-white text-gray-900 border rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
              :class="errors.curriculumVicePrincipalName ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-2 focus:ring-rose-400' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'"
              placeholder="Contoh: Siti Rahmah, S.Pd., M.Si"
            />
            <p v-if="errors.curriculumVicePrincipalName" class="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
              <svg class="w-3.5 h-3.5 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              <span>{{ errors.curriculumVicePrincipalName }}</span>
            </p>
          </div>

          <!-- Lokasi / Alamat Sekolah (dengan pencarian otomatis) -->
          <div class="md:col-span-2 relative">
            <label class="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1">
              Lokasi / Alamat Sekolah <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <input
                v-model="setupStore.schoolProfile.address"
                @input="handleAddressInput"
                @focus="showAddressSuggestions = true"
                type="text"
                class="w-full bg-white text-gray-900 border rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                :class="errors.address ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-2 focus:ring-rose-400' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'"
                placeholder="Ketik nama jalan, nomor, kecamatan, atau kabupaten (min. 10 karakter)..."
              />
              <div v-if="isSearchingAddress" class="absolute right-3 top-2.5">
                <svg class="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>

            <!-- Dropdown Sugesti Alamat -->
            <ul
              v-if="showAddressSuggestions && addressSuggestions.length > 0"
              class="absolute z-50 w-full mt-1 bg-white border border-gray-200 shadow-xl rounded-xl max-h-60 overflow-y-auto divide-y divide-gray-100"
            >
              <li
                v-for="(sug, idx) in addressSuggestions"
                :key="idx"
                @click="selectAddress(sug)"
                class="px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <p class="text-xs font-bold text-gray-800">{{ sug.title || sug.display_name }}</p>
                <p class="text-[11px] text-gray-500 line-clamp-1">{{ sug.display_name }}</p>
              </li>
            </ul>

            <p v-if="errors.address" class="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
              <svg class="w-3.5 h-3.5 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              <span>{{ errors.address }}</span>
            </p>
          </div>

          <!-- Tahun Pelajaran (Format YYYY-YYYY) -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-black text-gray-700 uppercase tracking-wider">
                Tahun Pelajaran <span class="text-rose-500">*</span>
              </label>
              <span class="text-[10px] text-gray-400 font-mono">Format: YYYY-YYYY</span>
            </div>
            <input
              v-model="setupStore.schoolProfile.academicYear"
              @input="onFieldInput"
              list="academic-year-options"
              type="text"
              class="w-full bg-white text-gray-900 border rounded-xl px-4 py-2.5 text-sm outline-none font-mono transition-all"
              :class="errors.academicYear ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-2 focus:ring-rose-400' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'"
              placeholder="Contoh: 2026-2027"
            />
            <datalist id="academic-year-options">
              <option value="2024-2025"></option>
              <option value="2025-2026"></option>
              <option value="2026-2027"></option>
              <option value="2027-2028"></option>
            </datalist>
            <p v-if="errors.academicYear" class="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
              <svg class="w-3.5 h-3.5 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              <span>{{ errors.academicYear }}</span>
            </p>
          </div>

          <!-- Semester -->
          <div>
            <label class="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1">
              Semester <span class="text-rose-500">*</span>
            </label>
            <select
              v-model="setupStore.schoolProfile.semester"
              @change="onFieldInput"
              class="w-full bg-white text-gray-900 border rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
              :class="errors.semester ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-2 focus:ring-rose-400' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'"
            >
              <option value="">-- Pilih Semester --</option>
              <option value="Ganjil">Semester Ganjil</option>
              <option value="Genap">Semester Genap</option>
            </select>
            <p v-if="errors.semester" class="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
              <svg class="w-3.5 h-3.5 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              <span>{{ errors.semester }}</span>
            </p>
          </div>

          <!-- Tanggal Pembuatan Jadwal -->
          <div class="md:col-span-2">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
              <label class="block text-xs font-black text-gray-700 uppercase tracking-wider">
                Tanggal Pembuatan Jadwal <span class="text-rose-500">*</span>
              </label>
              <span class="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-0.5 rounded-md">
                Tercetak: {{ setupStore.formattedScheduleDate }}
              </span>
            </div>
            <input
              v-model="setupStore.schoolProfile.scheduleCreatedDate"
              @change="onFieldInput"
              type="date"
              class="w-full sm:w-80 bg-white text-gray-900 border rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
              :class="errors.scheduleCreatedDate ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-2 focus:ring-rose-400' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'"
            />
            <p v-if="errors.scheduleCreatedDate" class="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
              <svg class="w-3.5 h-3.5 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              <span>{{ errors.scheduleCreatedDate }}</span>
            </p>
          </div>

        </div>
      </div>

      <!-- Section 2: Konfigurasi Hari Pelaksanaan KBM (7 Hari) -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        <div class="bg-gradient-to-r from-indigo-700 to-blue-700 px-6 py-4 border-b border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center backdrop-blur-xs">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 class="font-bold text-white text-base">Hari Pelaksanaan KBM</h2>
              <p class="text-xs text-indigo-100">Tentukan hari aktif pembelajaran (minimal 1 hari aktif wajib dipilih).</p>
            </div>
          </div>
          <span class="text-xs font-bold text-indigo-100 bg-white/10 px-3 py-1 rounded-full border border-white/20 self-start sm:self-auto">
            Total: {{ setupStore.activeOperatingDays.length }} Hari Aktif
          </span>
        </div>

        <div class="p-6 space-y-6">
          <!-- Grid 7 Hari -->
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div
              v-for="day in setupStore.operatingDays"
              :key="day.dayOfWeek"
              @click="handleDayClick(day)"
              class="p-4 rounded-xl border-2 cursor-pointer select-none transition-all flex flex-col items-center justify-between gap-3 text-center"
              :class="day.isActive
                ? (day.dayOfWeek === 7 ? 'bg-amber-50/70 border-amber-400 text-amber-900 shadow-xs' : 'bg-blue-50/70 border-blue-500 text-blue-900 shadow-xs')
                : 'bg-gray-50/70 border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-100/50'"
            >
              <div class="w-full flex items-center justify-between">
                <span class="text-[10px] font-black uppercase tracking-wider" :class="day.isActive ? 'text-blue-700' : 'text-gray-400'">
                  Hari #{{ day.dayOfWeek }}
                </span>
                <!-- Checkbox custom -->
                <div
                  class="w-5 h-5 rounded-md flex items-center justify-center transition-colors"
                  :class="day.isActive ? (day.dayOfWeek === 7 ? 'bg-amber-600 text-white' : 'bg-blue-600 text-white') : 'border border-gray-300 bg-white'"
                >
                  <svg v-if="day.isActive" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <div>
                <p class="text-base font-black tracking-tight" :class="day.isActive ? 'text-gray-900' : 'text-gray-400'">
                  {{ day.dayName }}
                </p>
                <span
                  class="text-[11px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block"
                  :class="day.isActive ? (day.dayOfWeek === 7 ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800') : 'bg-gray-200 text-gray-500'"
                >
                  {{ day.isActive ? 'KBM Aktif' : 'Libur' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Teks Ringkasan Hari Aktif -->
          <div class="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-2 text-gray-700">
              <span class="font-bold text-gray-900">Ringkasan Hari KBM:</span>
              <span class="text-blue-700 font-semibold">{{ setupStore.activeDaysSummary }}</span>
            </div>
            <div class="text-gray-500 font-medium">
              *Jadwal per-sesi akan disusun untuk hari-hari aktif di atas pada Langkah 2.
            </div>
          </div>

          <p v-if="errors.operatingDays" class="text-xs text-rose-600 font-semibold flex items-center gap-1">
            <svg class="w-3.5 h-3.5 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <span>{{ errors.operatingDays }}</span>
          </p>
        </div>
      </div>

      <!-- Action Buttons Bar -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-12">
        <div class="text-xs text-gray-500 flex items-center gap-2">
          <span v-if="setupStore.isDirty" class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
          <span v-if="setupStore.isDirty" class="text-amber-700 font-bold">Ada perubahan yang belum disimpan</span>
          <span v-else class="text-emerald-700 font-semibold flex items-center gap-1">
            <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Semua perubahan tersimpan
          </span>
        </div>

        <div class="flex items-center gap-3 w-full sm:w-auto">
          <!-- Tombol Simpan Draft -->
          <button
            type="button"
            @click="handleSave(true)"
            :disabled="setupStore.isSaving"
            class="flex-1 sm:flex-none px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs md:text-sm rounded-xl border border-gray-300 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            <span v-if="setupStore.isSaving && isDraftAction">Menyimpan Draft...</span>
            <span v-else>Simpan Draft</span>
          </button>

          <!-- Tombol Validasi dan Simpan -->
          <button
            type="submit"
            :disabled="setupStore.isSaving"
            class="flex-1 sm:flex-none px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs md:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <svg v-if="!setupStore.isSaving" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-if="setupStore.isSaving && !isDraftAction">Memvalidasi...</span>
            <span v-else>Validasi dan Simpan</span>
          </button>
        </div>
      </div>

    </form>

    <!-- Modal Konfirmasi Hari Minggu -->
    <div v-if="showSundayConfirmModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border-t-8 border-amber-500">
        <div class="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center mb-4 shadow-inner">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-xl font-black text-gray-900 text-center mb-2">Konfirmasi KBM Hari Minggu</h3>
        <p class="text-xs sm:text-sm text-gray-600 text-center leading-relaxed mb-6 font-medium">
          Kegiatan belajar mengajar pada hari Minggu tidak lazim untuk sekolah di Indonesia. Apakah institusi Anda memang menyelenggarakan KBM resmi pada hari Minggu?
        </p>
        <div class="flex items-center gap-3">
          <button
            @click="cancelSunday"
            class="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
          >
            Batalkan
          </button>
          <button
            @click="confirmSunday"
            class="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
          >
            Ya, Aktifkan Minggu
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Peringatan Perubahan Belum Disimpan (Unsaved Changes) -->
    <div v-if="showUnsavedModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border-t-8 border-rose-500">
        <div class="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-4 shadow-inner">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-xl font-black text-gray-900 text-center mb-2">Tinggalkan Halaman?</h3>
        <p class="text-xs sm:text-sm text-gray-600 text-center leading-relaxed mb-6 font-medium">
          Anda memiliki perubahan formulir validasi lembaga yang belum disimpan. Jika Anda meninggalkan halaman ini sekarang, perubahan tersebut akan hilang.
        </p>
        <div class="flex items-center gap-3">
          <button
            @click="stayOnPage"
            class="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
          >
            Tetap di Sini
          </button>
          <button
            @click="proceedLeavePage"
            class="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
          >
            Tinggalkan Halaman
          </button>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative text-center border-t-8 border-emerald-500">
        <button
          @click="showSuccessModal = false"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center mb-4 shadow-inner">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
        </div>
        <h3 class="text-2xl font-black text-gray-900 mb-1">Berhasil!</h3>
        <p class="text-xs sm:text-sm text-gray-600 mb-6 font-medium leading-relaxed">{{ successModalMessage }}</p>
        <div class="space-y-2.5">
          <router-link
            :to="ROUTES.SESI_WAKTU"
            class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Lanjut ke Sesi & Waktu KBM</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </router-link>
          <button
            @click="showSuccessModal = false"
            class="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
          >
            Tetap di Halaman Ini
          </button>
        </div>
      </div>
    </div>

    <!-- Error Modal -->
    <div v-if="showErrorModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative text-center border-t-8 border-rose-500">
        <button
          @click="showErrorModal = false"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        <div class="w-20 h-20 bg-rose-100 text-rose-600 rounded-full mx-auto flex items-center justify-center mb-4 shadow-inner">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>
        </div>
        <h3 class="text-2xl font-black text-gray-900 mb-1">Perhatian</h3>
        <p class="text-xs sm:text-sm text-gray-600 mb-6 font-medium leading-relaxed">{{ errorModalMessage }}</p>
        <div class="space-y-2">
          <button
            v-if="canRetrySave"
            @click="retrySave"
            class="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            <span>Coba Simpan Ulang</span>
          </button>
          <button
            @click="showErrorModal = false"
            class="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Tutup & Periksa Isian
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useSchoolSetupStore } from '../stores/schoolSetup.js'
import { ROUTES } from '../config/routePaths.js'
import { validateProfile } from '../types/schoolSetup.js'

const router = useRouter()
const setupStore = useSchoolSetupStore()

// Modals
const showSuccessModal = ref(false)
const showErrorModal = ref(false)
const showSundayConfirmModal = ref(false)
const showUnsavedModal = ref(false)
const pendingLeaveAction = ref(null)

const successModalMessage = ref('')
const errorModalMessage = ref('')
const isDraftAction = ref(false)
const canRetrySave = ref(false)

function retrySave() {
  showErrorModal.value = false
  handleSave(isDraftAction.value)
}

// Local form error state
const errors = ref({})

// Fitur Pencarian Alamat Otomatis
const showAddressSuggestions = ref(false)
const addressSuggestions = ref([])
const isSearchingAddress = ref(false)
let searchTimeout = null

const customSchools = [
  { name: 'SMP Swasta Galih Agung', display_name: 'SMP Swasta Galih Agung, Jl. Berdikari No.1A, Desa Lau Bakeri, Kec. Kutalimbaru, Kab. Deli Serdang, Sumatera Utara 20354' },
  { name: 'SMA SWASTA GALIH AGUNG', display_name: 'SMA SWASTA GALIH AGUNG, Jl. Berdikari No.1A, Desa Lau Bakeri, Kec. Kutalimbaru, Kab. Deli Serdang, Sumatera Utara 20354' },
  { name: 'MTS Darularafah', display_name: 'MTS Darularafah, Jl. Berdikari No.1A, Desa Lau Bakeri, Kec. Kutalimbaru, Kab. Deli Serdang, Sumatera Utara 20354' },
  { name: 'MAS Darularafah', display_name: 'MAS Darularafah, Jl. Berdikari No.1A, Desa Lau Bakeri, Kec. Kutalimbaru, Kab. Deli Serdang, Sumatera Utara 20354' }
]

function onFieldInput() {
  setupStore.markDirty(true)
  errors.value = {}
}

function handleDayClick(day) {
  if (day.dayOfWeek === 7 && !day.isActive) {
    // Mau mengaktifkan hari Minggu -> Munculkan modal konfirmasi khusus
    showSundayConfirmModal.value = true
    return
  }

  const res = setupStore.toggleDay(day.dayOfWeek)
  if (!res.success && res.message) {
    errorModalMessage.value = res.message
    showErrorModal.value = true
  }
}

function confirmSunday() {
  const sunday = setupStore.operatingDays.find((d) => d.dayOfWeek === 7)
  if (sunday) {
    sunday.isActive = true
    setupStore.markDirty(true)
  }
  showSundayConfirmModal.value = false
}

function cancelSunday() {
  showSundayConfirmModal.value = false
}

function handleAddressInput() {
  onFieldInput()
  const q = (setupStore.schoolProfile.address || '').toLowerCase().trim()
  if (q.length < 2) {
    addressSuggestions.value = []
    showAddressSuggestions.value = false
    return
  }

  isSearchingAddress.value = true
  showAddressSuggestions.value = true

  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    try {
      const localMatches = customSchools
        .filter((s) => s.name.toLowerCase().includes(q) || s.display_name.toLowerCase().includes(q))
        .map((s) => ({ title: s.name, display_name: s.display_name }))

      const queryUrl = encodeURIComponent(`${setupStore.schoolProfile.address} sekolah`)
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${queryUrl}&format=json&countrycodes=id&limit=4`, {
        headers: { 'Accept-Language': 'id-ID,id;q=0.9,en;q=0.7' }
      }).catch(() => null)

      let apiResults = []
      if (res && res.ok) {
        const data = await res.json()
        apiResults = data.map((item) => ({
          title: item.display_name.split(',')[0],
          display_name: item.display_name
        }))
      }

      addressSuggestions.value = [...localMatches, ...apiResults].slice(0, 5)
    } catch (_) {
      addressSuggestions.value = []
    } finally {
      isSearchingAddress.value = false
    }
  }, 500)
}

function selectAddress(sug) {
  setupStore.schoolProfile.address = sug.display_name
  showAddressSuggestions.value = false
  setupStore.markDirty(true)
}

function handleClickOutside(e) {
  if (showAddressSuggestions.value && !e.target.closest('.md\\:col-span-2.relative')) {
    showAddressSuggestions.value = false
  }
}

// Handler Simpan: isDraft = true vs isDraft = false
async function handleSave(isDraft = false) {
  isDraftAction.value = isDraft
  canRetrySave.value = false

  // Jalankan validasi frontend sebelum request
  const validation = validateProfile(setupStore.schoolProfile, isDraft)
  if (!validation.valid) {
    errors.value = validation.errors
    errorModalMessage.value = Object.values(validation.errors)[0] || 'Harap periksa isian data yang belum lengkap.'
    showErrorModal.value = true
    return
  }

  // Cek minimal 1 hari aktif
  if (!isDraft && setupStore.activeOperatingDays.length === 0) {
    errors.value.operatingDays = 'Minimal 1 hari aktif KBM wajib dipilih.'
    errorModalMessage.value = 'Minimal 1 hari aktif KBM wajib dipilih.'
    showErrorModal.value = true
    return
  }

  const result = await setupStore.saveSchoolProfile(isDraft)
  if (result.success) {
    successModalMessage.value = result.message || (isDraft ? 'Draft berhasil disimpan.' : 'Data validasi lembaga berhasil disimpan.')
    showSuccessModal.value = true
  } else {
    canRetrySave.value = true
    errorModalMessage.value = result.message || 'Gagal menyimpan profil lembaga. Periksa koneksi Anda dan coba lagi.'
    showErrorModal.value = true
  }
}

// Unsaved changes navigation guard
onBeforeRouteLeave((to, from, next) => {
  if (setupStore.isDirty) {
    showUnsavedModal.value = true
    pendingLeaveAction.value = next
  } else {
    next()
  }
})

function stayOnPage() {
  showUnsavedModal.value = false
  if (pendingLeaveAction.value) {
    pendingLeaveAction.value(false)
    pendingLeaveAction.value = null
  }
}

function proceedLeavePage() {
  showUnsavedModal.value = false
  setupStore.markDirty(false)
  if (pendingLeaveAction.value) {
    const nextFn = pendingLeaveAction.value
    pendingLeaveAction.value = null
    nextFn()
  }
}

const handleBeforeUnload = (e) => {
  if (setupStore.isDirty) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(async () => {
  if (!setupStore.isInitialized) {
    await setupStore.loadSchoolSetup()
  }
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>
