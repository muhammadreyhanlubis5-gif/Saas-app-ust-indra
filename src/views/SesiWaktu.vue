<template>
  <div class="animate-fade-in-up p-4 md:p-8 max-w-[1400px] mx-auto w-full">
    <!-- Header & Breadcrumbs -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div class="flex items-center gap-4">
        <router-link
          :to="ROUTES.VALIDASI_LEMBAGA"
          class="p-2.5 bg-white rounded-xl shadow-xs hover:bg-gray-50 border border-gray-200 transition-colors text-gray-600 hover:text-gray-900"
          title="Kembali ke Validasi Lembaga"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </router-link>
        <div>
          <nav class="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
            <router-link :to="ROUTES.SCHOOL_ADMIN" class="hover:text-blue-600 transition-colors">Admin Sekolah</router-link>
            <span>/</span>
            <router-link :to="ROUTES.VALIDASI_LEMBAGA" class="hover:text-blue-600 transition-colors">Langkah 1</router-link>
            <span>/</span>
            <span class="text-blue-600">Sesi & Waktu KBM</span>
          </nav>
          <h1 class="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Sesi & Waktu KBM</h1>
          <p class="text-gray-500 text-xs md:text-sm mt-0.5">Langkah 2: Konfigurasi urutan jam pelajaran dan durasi waktu KBM harian sekolah.</p>
        </div>
      </div>

      <!-- Action Buttons Top -->
      <div class="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          @click="openResetConfirm"
          class="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl border border-gray-300 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Reset Konfigurasi Awal</span>
        </button>

        <button
          type="button"
          @click="openAddModal('BREAK')"
          class="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-200 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>+ Istirahat</span>
        </button>

        <button
          type="button"
          @click="openAddModal('KBM')"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>+ Jam KBM</span>
        </button>
      </div>
    </div>

    <!-- Peringatan Hari Belum Diatur -->
    <div
      v-if="setupStore.activeOperatingDays.length === 0"
      class="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-6 text-center mb-8 shadow-xs"
    >
      <div class="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-3">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 class="font-bold text-base mb-1">Hari Pelaksanaan KBM Belum Diatur</h3>
      <p class="text-xs text-amber-700 mb-4 max-w-md mx-auto">
        Anda belum mengaktifkan hari KBM pada Langkah 1. Silakan atur hari aktif terlebih dahulu agar struktur jam KBM dapat disinkronkan.
      </p>
      <router-link
        :to="ROUTES.VALIDASI_LEMBAGA"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
      >
        <span>Ke Validasi Lembaga</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
      </router-link>
    </div>

    <!-- Summary Box & Overlap Warning Banner -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Jam Pelajaran Aktif</p>
          <p class="text-xl font-black text-gray-900 font-mono">{{ setupStore.kbmOnlySessions.length }} Jam / Hari</p>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Hari KBM Aktif</p>
          <p class="text-xl font-black text-gray-900 font-mono">{{ setupStore.activeOperatingDays.length }} Hari</p>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Kapasitas Mingguan</p>
          <p class="text-xl font-black text-emerald-700 font-mono">{{ setupStore.totalWeeklyTeachingHours }} Sesi KBM</p>
        </div>
      </div>
    </div>

    <!-- Alert Overlap Global (Jika Ada Jam Bentrok) -->
    <div
      v-if="overlapError"
      class="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start gap-3 shadow-xs animate-shake"
    >
      <div class="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <h4 class="text-xs font-black uppercase tracking-wider text-rose-800">Peringatan Bentrok Waktu (Overlap)</h4>
        <p class="text-xs text-rose-700 mt-0.5 font-medium leading-relaxed">{{ overlapError }}</p>
      </div>
    </div>

    <!-- Main Table Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden mb-8">
      <div class="bg-gray-50/80 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <h2 class="font-bold text-gray-800 text-sm md:text-base">Daftar Urutan Sesi Waktu Pembelajaran</h2>
          <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono">
            {{ setupStore.kbmSessions.length }} Sesi Terdaftar
          </span>
        </div>
        <p class="text-xs text-gray-500 font-medium">Gunakan tombol panah untuk menyesuaikan urutan sesi.</p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-gray-50 text-gray-600 text-xs font-black uppercase tracking-wider border-b border-gray-200">
            <tr>
              <th class="py-3.5 px-4 text-center w-16">Urutan</th>
              <th class="py-3.5 px-4 w-32">Nomor / Jam</th>
              <th class="py-3.5 px-4">Nama / Label Sesi</th>
              <th class="py-3.5 px-4 w-36">Tipe Sesi</th>
              <th class="py-3.5 px-4 w-44">Rentang Waktu (HH:mm)</th>
              <th class="py-3.5 px-4 text-center w-28">Status</th>
              <th class="py-3.5 px-4 text-right w-36">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="(session, index) in setupStore.kbmSessions"
              :key="session.id"
              class="hover:bg-blue-50/30 transition-colors"
              :class="[
                session.sessionType === 'BREAK' ? 'bg-amber-50/30' : '',
                !session.isActive ? 'opacity-50 bg-gray-50/50' : ''
              ]"
            >
              <!-- Urutan (Sort Order) + Tombol Up/Down -->
              <td class="py-3 px-4 text-center">
                <div class="flex items-center justify-center gap-1">
                  <span class="font-mono font-bold text-xs text-gray-500 w-5">{{ index + 1 }}</span>
                  <div class="flex flex-col gap-0.5">
                    <button
                      type="button"
                      @click="setupStore.reorderSession(session.id, 'up')"
                      :disabled="index === 0"
                      class="p-0.5 hover:bg-gray-200 rounded text-gray-500 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      title="Geser ke Atas"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
                    </button>
                    <button
                      type="button"
                      @click="setupStore.reorderSession(session.id, 'down')"
                      :disabled="index === setupStore.kbmSessions.length - 1"
                      class="p-0.5 hover:bg-gray-200 rounded text-gray-500 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      title="Geser ke Bawah"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                    </button>
                  </div>
                </div>
              </td>

              <!-- Nomor Jam Sesi -->
              <td class="py-3 px-4 font-mono font-black text-gray-800">
                <span v-if="session.sessionType === 'KBM'" class="text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 text-xs">
                  Jam Ke-{{ session.sessionNumber }}
                </span>
                <span v-else class="text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-xs">
                  Sela
                </span>
              </td>

              <!-- Label Sesi -->
              <td class="py-3 px-4">
                <p class="font-bold text-gray-800 text-sm">{{ session.label }}</p>
              </td>

              <!-- Tipe Sesi -->
              <td class="py-3 px-4">
                <span
                  class="text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5"
                  :class="session.sessionType === 'KBM'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="session.sessionType === 'KBM' ? 'bg-blue-600' : 'bg-amber-600'"></span>
                  <span>{{ session.sessionType === 'KBM' ? 'KBM Pelajaran' : 'Istirahat' }}</span>
                </span>
              </td>

              <!-- Rentang Waktu (HH:mm) -->
              <td class="py-3 px-4">
                <div class="flex items-center gap-1.5 font-mono text-xs font-bold text-gray-800">
                  <span class="bg-gray-100 px-2 py-1 rounded border border-gray-200">{{ session.startTime }}</span>
                  <span class="text-gray-400">-</span>
                  <span class="bg-gray-100 px-2 py-1 rounded border border-gray-200">{{ session.endTime }}</span>
                </div>
              </td>

              <!-- Status Aktif / Nonaktif Toggle -->
              <td class="py-3 px-4 text-center">
                <button
                  type="button"
                  @click="setupStore.toggleSessionActive(session.id)"
                  class="text-[11px] font-bold px-3 py-1 rounded-full transition-colors cursor-pointer"
                  :class="session.isActive
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'"
                >
                  {{ session.isActive ? 'Aktif' : 'Nonaktif' }}
                </button>
              </td>

              <!-- Aksi (Edit & Hapus) -->
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    @click="openEditModal(session)"
                    class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Sesi"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    @click="confirmDeleteSession(session)"
                    class="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Sesi"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Action Bar Bawah -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 pb-12">
      <div class="text-xs text-gray-500 flex items-center gap-2">
        <span v-if="setupStore.isDirty" class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
        <span v-if="setupStore.isDirty" class="text-amber-700 font-bold">Ada perubahan sesi yang belum disimpan</span>
        <span v-else class="text-emerald-700 font-semibold flex items-center gap-1">
          <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          Seluruh konfigurasi sesi tersimpan
        </span>
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto">
        <button
          type="button"
          @click="handleSaveSessions"
          :disabled="setupStore.isSaving || Boolean(overlapError)"
          class="flex-1 sm:flex-none px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs md:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <svg v-if="!setupStore.isSaving" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span v-if="setupStore.isSaving">Menyimpan...</span>
          <span v-else>Simpan Sesi KBM</span>
        </button>
      </div>
    </div>

    <!-- Modal Tambah / Edit Sesi -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-gray-100">
        <button
          @click="showEditModal = false"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>

        <h3 class="text-xl font-black text-gray-900 mb-1">
          {{ modalMode === 'edit' ? 'Edit Sesi Waktu' : 'Tambah Sesi Baru' }}
        </h3>
        <p class="text-xs text-gray-500 mb-6 font-medium">Sesuaikan label, tipe sesi, dan interval jam mulai-selesai.</p>

        <form @submit.prevent="saveModalSession" class="space-y-4">
          <!-- Tipe Sesi -->
          <div>
            <label class="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1">Tipe Sesi</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="editingForm.sessionType = 'KBM'"
                class="py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2"
                :class="editingForm.sessionType === 'KBM' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-2xs' : 'bg-gray-50 border-gray-200 text-gray-600'"
              >
                <span>KBM Pelajaran</span>
              </button>
              <button
                type="button"
                @click="editingForm.sessionType = 'BREAK'"
                class="py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2"
                :class="editingForm.sessionType === 'BREAK' ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-2xs' : 'bg-gray-50 border-gray-200 text-gray-600'"
              >
                <span>Istirahat</span>
              </button>
            </div>
          </div>

          <!-- Label Sesi -->
          <div>
            <label class="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1">Nama / Label Sesi</label>
            <input
              v-model="editingForm.label"
              type="text"
              class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              placeholder="Contoh: Jam Ke-1 atau Istirahat Sholat"
              required
            />
          </div>

          <!-- Rentang Waktu: Mulai - Selesai -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1">Jam Mulai (HH:mm)</label>
              <input
                v-model="editingForm.startTime"
                type="time"
                class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                required
              />
            </div>
            <div>
              <label class="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1">Jam Selesai (HH:mm)</label>
              <input
                v-model="editingForm.endTime"
                type="time"
                class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                required
              />
            </div>
          </div>

          <p v-if="modalError" class="text-xs text-rose-600 font-semibold flex items-center gap-1">
            <svg class="w-3.5 h-3.5 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <span>{{ modalError }}</span>
          </p>

          <div class="flex items-center gap-3 pt-4">
            <button
              type="button"
              @click="showEditModal = false"
              class="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Konfirmasi Reset Awal -->
    <div v-if="showResetModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border-t-8 border-amber-500">
        <div class="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center mb-4 shadow-inner">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <h3 class="text-xl font-black text-gray-900 text-center mb-2">Reset ke Konfigurasi Awal?</h3>
        <p class="text-xs sm:text-sm text-gray-600 text-center leading-relaxed mb-6 font-medium">
          Tindakan ini akan mengembalikan susunan sesi KBM ke jadwal default standar (8 jam pelajaran + 2 waktu istirahat). Perubahan kustom Anda saat ini akan ditimpa.
        </p>
        <div class="flex items-center gap-3">
          <button
            @click="showResetModal = false"
            class="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
          >
            Batal
          </button>
          <button
            @click="executeReset"
            class="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
          >
            Ya, Reset Sekarang
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus Sesi -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative border-t-8 border-rose-500 text-center">
        <div class="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-4 shadow-inner">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </div>
        <h3 class="text-xl font-black text-gray-900 mb-2">Hapus Sesi Ini?</h3>
        <p class="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6 font-medium">
          Hapus sesi "<strong>{{ deletingSessionTarget?.label }}</strong>" ({{ deletingSessionTarget?.startTime }}-{{ deletingSessionTarget?.endTime }})?
        </p>
        <div class="flex items-center gap-3">
          <button
            @click="showDeleteModal = false"
            class="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
          >
            Batal
          </button>
          <button
            @click="executeDelete"
            class="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
          >
            Hapus
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
            :to="ROUTES.DAFTAR_KELAS"
            class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Lanjut ke Master Data (Kelas)</span>
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
            v-if="canRetrySessions"
            @click="retrySaveSessions"
            class="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            <span>Coba Simpan Ulang</span>
          </button>
          <button
            @click="showErrorModal = false"
            class="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Tutup & Periksa Sesi
          </button>
        </div>
      </div>
    </div>

    <!-- Unsaved Changes Modal -->
    <div v-if="showUnsavedModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border-t-8 border-rose-500">
        <div class="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-4 shadow-inner">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <h3 class="text-xl font-black text-gray-900 text-center mb-2">Tinggalkan Halaman?</h3>
        <p class="text-xs sm:text-sm text-gray-600 text-center leading-relaxed mb-6 font-medium">
          Ada perubahan konfigurasi sesi KBM yang belum disimpan. Perubahan tersebut akan hilang jika Anda berpindah halaman.
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

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useSchoolSetupStore } from '../stores/schoolSetup.js'
import { ROUTES } from '../config/routePaths.js'
import { validateSessions, validateTimeOverlap } from '../types/schoolSetup.js'

const router = useRouter()
const setupStore = useSchoolSetupStore()

// Modals
const showEditModal = ref(false)
const showResetModal = ref(false)
const showDeleteModal = ref(false)
const showSuccessModal = ref(false)
const showErrorModal = ref(false)
const showUnsavedModal = ref(false)

const modalMode = ref('add') // 'add' | 'edit'
const modalError = ref('')
const successModalMessage = ref('')
const errorModalMessage = ref('')
const pendingLeaveAction = ref(null)
const canRetrySessions = ref(false)

function retrySaveSessions() {
  showErrorModal.value = false
  handleSaveSessions()
}

const deletingSessionTarget = ref(null)

const editingForm = ref({
  id: '',
  sessionType: 'KBM',
  label: '',
  startTime: '07:30',
  endTime: '08:10'
})

// Real-Time Overlap Detection across all active sessions
const overlapError = computed(() => {
  const check = validateTimeOverlap(setupStore.kbmSessions)
  if (!check.valid) {
    return check.message
  }
  return null
})

function openAddModal(type = 'KBM') {
  modalMode.value = 'add'
  modalError.value = ''
  
  // Hitung perkiraan jam mulai sesi baru berdasarkan sesi terakhir
  const list = setupStore.kbmSessions
  let nextStart = '07:30'
  let nextEnd = type === 'BREAK' ? '08:00' : '08:15'

  if (list.length > 0) {
    const last = list[list.length - 1]
    if (last.endTime) {
      nextStart = last.endTime
      const [h, m] = last.endTime.split(':').map(Number)
      const dur = type === 'BREAK' ? 20 : 40
      const totalMin = h * 60 + m + dur
      const endH = String(Math.floor(totalMin / 60) % 24).padStart(2, '0')
      const endM = String(totalMin % 60).padStart(2, '0')
      nextEnd = `${endH}:${endM}`
    }
  }

  const kbmCount = list.filter((s) => s.sessionType === 'KBM').length
  const nextLabel = type === 'BREAK' ? 'Istirahat' : `Jam Ke-${kbmCount + 1}`

  editingForm.value = {
    id: '',
    sessionType: type,
    label: nextLabel,
    startTime: nextStart,
    endTime: nextEnd
  }

  showEditModal.value = true
}

function openEditModal(session) {
  modalMode.value = 'edit'
  modalError.value = ''
  editingForm.value = {
    id: session.id,
    sessionType: session.sessionType,
    label: session.label,
    startTime: session.startTime,
    endTime: session.endTime
  }
  showEditModal.value = true
}

function saveModalSession() {
  modalError.value = ''

  if (!editingForm.value.label.trim()) {
    modalError.value = 'Label sesi wajib diisi.'
    return
  }

  if (editingForm.value.endTime <= editingForm.value.startTime) {
    modalError.value = `Jam selesai (${editingForm.value.endTime}) harus lebih besar dari jam mulai (${editingForm.value.startTime}).`
    return
  }

  if (modalMode.value === 'add') {
    const newSession = setupStore.addSession(editingForm.value.sessionType)
    setupStore.updateSession(newSession.id, {
      label: editingForm.value.label.trim(),
      startTime: editingForm.value.startTime,
      endTime: editingForm.value.endTime
    })
  } else {
    setupStore.updateSession(editingForm.value.id, {
      sessionType: editingForm.value.sessionType,
      label: editingForm.value.label.trim(),
      startTime: editingForm.value.startTime,
      endTime: editingForm.value.endTime
    })
  }

  showEditModal.value = false
}

function confirmDeleteSession(session) {
  deletingSessionTarget.value = session
  showDeleteModal.value = true
}

function executeDelete() {
  if (deletingSessionTarget.value) {
    setupStore.removeSession(deletingSessionTarget.value.id)
    deletingSessionTarget.value = null
  }
  showDeleteModal.value = false
}

function openResetConfirm() {
  showResetModal.value = true
}

function executeReset() {
  setupStore.resetToDefaultSessions()
  showResetModal.value = false
}

async function handleSaveSessions() {
  canRetrySessions.value = false
  const validation = validateSessions(setupStore.kbmSessions)
  if (!validation.valid) {
    errorModalMessage.value = validation.error || 'Konfigurasi sesi KBM belum valid.'
    showErrorModal.value = true
    return
  }

  const res = await setupStore.saveKbmSessions()
  if (res.success) {
    successModalMessage.value = 'Konfigurasi Sesi & Waktu KBM berhasil disimpan dan disinkronkan ke seluruh sistem.'
    showSuccessModal.value = true
  } else {
    canRetrySessions.value = true
    errorModalMessage.value = res.message || 'Gagal menyimpan konfigurasi sesi. Periksa koneksi Anda dan coba lagi.'
    showErrorModal.value = true
  }
}

// Navigation Guard Unsaved Changes
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
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>
