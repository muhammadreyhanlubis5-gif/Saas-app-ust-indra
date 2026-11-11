<template>
  <div class="animate-fade-in-up p-4 md:p-8 max-w-[1440px] mx-auto space-y-6 font-sans">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <router-link :to="ROUTES.SCHOOL_ADMIN" class="text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
            Dashboard
          </router-link>
          <span class="text-xs text-slate-300">/</span>
          <span class="text-xs font-bold text-slate-600">Pengaturan</span>
        </div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Pengaturan Sistem & Sekolah</h1>
        <p class="text-xs md:text-sm text-slate-400 font-medium mt-1">Konfigurasi profil sekolah, preferensi aplikasi, dan akses cepat data master akademik.</p>
      </div>
    </div>

    <!-- Quick Access Master Data Akademik -->
    <div class="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-xs">
      <h3 class="text-sm font-bold text-slate-900 mb-3">Pintasan Data Sekolah & KBM</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <router-link :to="ROUTES.DAFTAR_GURU" class="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-colors flex flex-col items-start">
          <span class="font-bold text-slate-800">Daftar Guru</span>
          <span class="text-[10px] text-slate-400 mt-0.5">Kelola staf guru</span>
        </router-link>
        <router-link :to="ROUTES.DAFTAR_KELAS" class="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-colors flex flex-col items-start">
          <span class="font-bold text-slate-800">Daftar Kelas</span>
          <span class="text-[10px] text-slate-400 mt-0.5">Rombongan belajar</span>
        </router-link>
        <router-link :to="ROUTES.MATA_PELAJARAN" class="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-colors flex flex-col items-start">
          <span class="font-bold text-slate-800">Mata Pelajaran</span>
          <span class="text-[10px] text-slate-400 mt-0.5">Kurikulum KBM</span>
        </router-link>
        <router-link :to="ROUTES.JADWAL_KELAS" class="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-colors flex flex-col items-start">
          <span class="font-bold text-slate-800">Jadwal Kelas</span>
          <span class="text-[10px] text-slate-400 mt-0.5">Matriks & cetak</span>
        </router-link>
      </div>
    </div>

    <!-- General Settings Form -->
    <div class="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-xs max-w-2xl">
      <h3 class="text-sm font-bold text-slate-900 mb-4">Profil Lembaga / Sekolah</h3>
      <div class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Nama Lembaga / Sekolah</label>
          <input v-model="schoolName" type="text" class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Semester Aktif</label>
          <select v-model="activeSemester" class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
            <option>Semester Ganjil 2026/2027</option>
            <option>Semester Genap 2026/2027</option>
          </select>
        </div>
        <button @click="saveSettings" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs">
          Simpan Pengaturan
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ROUTES } from '../config/routePaths.js'

const schoolName = ref(localStorage.getItem('school_name') || 'GuruKu Smart School')
const activeSemester = ref('Semester Ganjil 2026/2027')

const saveSettings = () => {
  localStorage.setItem('school_name', schoolName.value)
  alert('Pengaturan berhasil disimpan!')
}
</script>
