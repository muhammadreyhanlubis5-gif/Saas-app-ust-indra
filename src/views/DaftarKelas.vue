<template>
  <div class="animate-fade-in-up p-4 md:p-8 max-w-[1400px] mx-auto w-full">
    <!-- Header modern -->
    <div class="bg-blue-900 rounded-3xl p-6 md:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
      <div class="absolute inset-0 bg-[url('../assets/banner-bg.png')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-transparent"></div>
      
      <div class="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div class="w-full lg:w-3/5">
          <h1 class="text-2xl md:text-3xl font-black mb-2 flex items-center gap-3 drop-shadow-md">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Daftar Kelas
          </h1>
          <p class="text-blue-100 max-w-2xl text-sm md:text-base drop-shadow">
            Kelola data Rombongan Belajar (Rombel), Tingkat, Jurusan, dan Wali Kelas. Sinkronisasi data ke server backend bergaransi multi-tenant dengan validasi baris transaksi penuh.
          </p>
        </div>
        
        <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <!-- Hidden File Input for Excel -->
          <input 
            type="file" 
            ref="fileInput" 
            accept=".xlsx, .xls" 
            @change="handleFileUpload" 
            class="hidden" 
          />

          <!-- Tombol Download Template Excel -->
          <button 
            @click="downloadTemplate" 
            class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 text-sm cursor-pointer"
            title="Unduh format file Excel resmi"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            <span>Unduh Template</span>
          </button>

          <!-- Tombol Upload Excel / XLSB -->
          <button 
            @click="showXlsbModal = true" 
            :disabled="masterStore.isImporting" 
            class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 text-sm border border-blue-400/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Unggah template Excel / XLSB untuk dipratinjau & diimpor"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            <span>Upload XLSB / Excel</span>
          </button>

          <!-- Tombol Manual Tambah Kelas -->
          <button 
            @click="openAddModal" 
            class="bg-white text-blue-700 hover:bg-gray-50 px-5 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 text-sm cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            <span>Tambah Kelas</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Error Banner jika terjadi kegagalan muat server -->
    <div v-if="masterStore.error && !loading" class="mb-6 bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between gap-4 text-rose-800">
      <div class="flex items-center gap-3">
        <svg class="w-6 h-6 text-rose-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <div>
          <p class="font-bold text-sm">Terjadi Kesalahan</p>
          <p class="text-xs text-rose-600">{{ masterStore.error }}</p>
        </div>
      </div>
      <button @click="loadData" class="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors shadow-sm cursor-pointer flex-shrink-0">
        Coba Lagi
      </button>
    </div>

    <!-- Data Table Container with Toolbar -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Table Toolbar (Total Data & Right-Aligned Search Bar) -->
      <div class="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <div class="flex items-center gap-3">
          <h3 class="font-bold text-gray-800 text-base">Daftar Rombongan Belajar</h3>
          <span class="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-100">
            {{ filteredClasses.length }} Kelas
          </span>
          <span v-if="activeFilterStatus !== 'all'" class="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-600">
            Status: {{ activeFilterStatus === 'active' ? 'Aktif' : 'Nonaktif' }}
          </span>
        </div>
        
        <!-- Controls: Status Filter & Search bar -->
        <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <select 
            v-model="activeFilterStatus" 
            class="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif Saja</option>
            <option value="inactive">Nonaktif Saja</option>
          </select>

          <div class="relative w-full sm:w-64">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Cari nama kelas atau wali..." 
              class="w-full pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <button 
              v-if="searchQuery" 
              @click="searchQuery = ''"
              type="button"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-500 font-medium">Memuat data kelas dari server...</p>
      </div>

      <!-- Empty State: Data Benar-Benar Kosong -->
      <div v-else-if="masterStore.classes.length === 0" class="text-center py-20 px-4">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
          <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
        </div>
        <h3 class="text-lg font-bold text-gray-800 mb-1">Belum Ada Rombongan Belajar</h3>
        <p class="text-gray-500 mb-6 text-sm max-w-md mx-auto">
          Silakan tambah kelas secara manual atau unduh template Excel resmi untuk mengimpor seluruh kelas sekolah Anda.
        </p>
        <div class="flex flex-wrap justify-center gap-3">
          <button @click="downloadTemplate" class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors text-sm flex items-center gap-2 cursor-pointer shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Unduh Template Excel
          </button>
          <button @click="showXlsbModal = true" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors text-sm flex items-center gap-2 cursor-pointer shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            Upload File XLSB / Excel
          </button>
          <button @click="openAddModal" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold transition-colors text-sm cursor-pointer">
            + Tambah Manual
          </button>
        </div>
      </div>

      <!-- Empty State: Hasil Pencarian Nihil -->
      <div v-else-if="filteredClasses.length === 0" class="text-center py-16 px-4">
        <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <h4 class="font-bold text-gray-700 text-sm">Tidak ditemukan kelas yang cocok</h4>
        <p class="text-xs text-gray-400 mt-1">Tidak ada rombel yang sesuai dengan kata kunci "{{ searchQuery }}"</p>
        <button @click="resetFilters" class="mt-3 px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors cursor-pointer">
          Reset Filter & Pencarian
        </button>
      </div>

      <!-- Tabel Data Kelas -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase text-xs tracking-wider">
              <th class="px-6 py-4 font-bold w-16">No</th>
              <th class="px-6 py-4 font-bold">Nama Kelas</th>
              <th class="px-6 py-4 font-bold">Tingkat / Jurusan</th>
              <th class="px-6 py-4 font-bold">Tahun Ajaran</th>
              <th class="px-6 py-4 font-bold">Wali Kelas</th>
              <th class="px-6 py-4 font-bold text-center">Jumlah Siswa</th>
              <th class="px-6 py-4 font-bold text-center">Status</th>
              <th class="px-6 py-4 font-bold text-right w-32">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="(cls, index) in paginatedClasses" :key="cls.id || index" class="border-b border-gray-50 hover:bg-blue-50/20 transition-colors group">
              <td class="px-6 py-4 text-gray-500 text-xs font-mono">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
              <td class="px-6 py-4">
                <span class="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-bold text-sm border border-blue-100/60 inline-block shadow-2xs">{{ cls.name }}</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                <span v-if="cls.grade_level" class="font-medium text-gray-800">Kelas {{ cls.grade_level }}</span>
                <span v-else class="text-gray-400">-</span>
                <span v-if="cls.major && cls.major !== 'Umum'" class="ml-1 text-xs text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded font-medium">
                  {{ cls.major }}
                </span>
              </td>
              <td class="px-6 py-4 text-xs font-mono text-gray-600">
                {{ cls.academic_year || '-' }}
              </td>
              <td class="px-6 py-4 font-medium text-gray-800 text-sm">
                {{ cls.homeroom_teacher_name || cls.homeroom_teacher || '-' }}
              </td>
              <td class="px-6 py-4 text-center font-bold text-gray-600 text-sm">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                  {{ cls.student_count ?? 0 }} Siswa
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  :class="cls.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'"
                >
                  <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="cls.is_active ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                  {{ cls.is_active ? 'Aktif' : 'Nonaktif' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2 whitespace-nowrap">
                  <!-- Tombol Edit (Pencil) -->
                  <button 
                    @click="openEditModal(cls)" 
                    class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-blue-200" 
                    title="Edit Data Kelas"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  </button>
                  <!-- Tombol Delete (Trash) -->
                  <button 
                    @click="confirmDeleteClass(cls)" 
                    class="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-200" 
                    title="Hapus Kelas"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
      <div v-if="filteredClasses.length > 0" class="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600 bg-gray-50/50">
        <p class="font-medium">
          Menampilkan <span class="font-bold text-gray-900">{{ paginationStart }}</span> - <span class="font-bold text-gray-900">{{ paginationEnd }}</span> dari <span class="font-bold text-gray-900">{{ filteredClasses.length }}</span> data
        </p>
        <div class="flex items-center gap-1.5">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="px-3 py-1.5 rounded-xl border border-gray-200 bg-white font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
            <span>Sebelumnya</span>
          </button>

          <div class="flex items-center gap-1">
            <button 
              v-for="page in totalPages" 
              :key="page"
              @click="currentPage = page"
              class="w-7 h-7 rounded-xl text-xs font-bold transition-all cursor-pointer"
              :class="currentPage === page ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'"
            >
              {{ page }}
            </button>
          </div>

          <button 
            @click="currentPage++" 
            :disabled="currentPage >= totalPages"
            class="px-3 py-1.5 rounded-xl border border-gray-200 bg-white font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>Selanjutnya</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ===================================================================== -->
    <!-- MODAL: TAMBAH KELAS MANUAL -->
    <!-- ===================================================================== -->
    <div v-if="showAddModal" class="fixed inset-0 z-40 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-opacity">
      <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 class="font-bold text-gray-800 text-lg">Tambah Rombel Kelas</h3>
            <p class="text-xs text-gray-500">Isi data rombongan belajar baru untuk tahun ajaran aktif</p>
          </div>
          <button @click="showAddModal = false" class="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 rounded-full p-1.5 transition-colors shadow-sm cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form @submit.prevent="saveClass" class="p-6 space-y-4">
          <!-- Nama Kelas -->
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Nama Kelas <span class="text-rose-500">*</span>
            </label>
            <input 
              v-model="form.name" 
              type="text" 
              required 
              placeholder="Contoh: 7 A, 10 MIPA 1, XII TKJ" 
              class="w-full bg-white text-gray-900 border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none uppercase transition-all text-sm"
              :class="formErrors.name ? 'border-rose-400 bg-rose-50/20' : 'border-gray-300'"
            />
            <p v-if="formErrors.name" class="text-xs text-rose-600 mt-1 font-medium">{{ formErrors.name }}</p>
          </div>

          <!-- Tingkat & Jurusan -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Tingkat / Grade</label>
              <select v-model="form.grade_level" class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                <option :value="null">Pilih Tingkat...</option>
                <option v-for="g in 12" :key="g" :value="g">Kelas {{ g }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Jurusan / Program</label>
              <input v-model="form.major" type="text" placeholder="Contoh: Umum, MIPA, RPL" class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm">
            </div>
          </div>

          <!-- Tahun Ajaran & Jumlah Siswa -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Tahun Ajaran <span class="text-rose-500">*</span>
              </label>
              <input 
                v-model="form.academic_year" 
                type="text" 
                required 
                placeholder="2024/2025" 
                class="w-full bg-white text-gray-900 border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                :class="formErrors.academic_year ? 'border-rose-400' : 'border-gray-300'"
              />
              <p v-if="formErrors.academic_year" class="text-xs text-rose-600 mt-1 font-medium">{{ formErrors.academic_year }}</p>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Jumlah Siswa <span class="text-rose-500">*</span>
              </label>
              <input 
                v-model.number="form.student_count" 
                type="number" 
                min="0" 
                required 
                placeholder="32" 
                class="w-full bg-white text-gray-900 border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                :class="formErrors.student_count ? 'border-rose-400' : 'border-gray-300'"
              />
              <p v-if="formErrors.student_count" class="text-xs text-rose-600 mt-1 font-medium">{{ formErrors.student_count }}</p>
            </div>
          </div>

          <!-- Wali Kelas Dropdown -->
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Wali Kelas</label>
            <select v-model="form.homeroom_teacher_id" class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm cursor-pointer">
              <option :value="null">-- Belum Ditentukan / Tidak Ada --</option>
              <option v-for="teacher in masterStore.activeTeachers" :key="teacher.id" :value="teacher.id">
                {{ teacher.name }} {{ teacher.nip_nuptk ? `(NIP: ${teacher.nip_nuptk})` : '' }}
              </option>
            </select>
            <p v-if="formErrors.homeroom_teacher_id" class="text-xs text-rose-600 mt-1 font-medium">{{ formErrors.homeroom_teacher_id }}</p>
          </div>

          <!-- Status Aktif -->
          <div class="flex items-center gap-3 pt-2">
            <input type="checkbox" id="add_is_active" v-model="form.is_active" class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer">
            <label for="add_is_active" class="text-xs font-bold text-gray-700 cursor-pointer select-none">
              Status Kelas Aktif (Dapat digunakan untuk jadwal pelajaran)
            </label>
          </div>
          
          <div class="pt-4 flex gap-3 border-t border-gray-100">
            <button type="button" @click="showAddModal = false" class="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold py-2.5 px-4 rounded-xl transition-colors cursor-pointer text-sm">
              Batal
            </button>
            <button 
              type="submit" 
              :disabled="masterStore.isSaving" 
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
            >
              <svg v-if="masterStore.isSaving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>{{ masterStore.isSaving ? 'Menyimpan...' : 'Simpan Kelas' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ===================================================================== -->
    <!-- MODAL: EDIT KELAS MANUAL -->
    <!-- ===================================================================== -->
    <div v-if="showEditModal" class="fixed inset-0 z-40 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-opacity">
      <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 class="font-bold text-gray-800 text-lg">Edit Rombel Kelas</h3>
            <p class="text-xs text-gray-500">Perbarui identitas kelas dan wali kelas</p>
          </div>
          <button @click="showEditModal = false" class="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 rounded-full p-1.5 transition-colors shadow-sm cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form @submit.prevent="updateClassData" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Nama Kelas <span class="text-rose-500">*</span>
            </label>
            <input 
              v-model="editForm.name" 
              type="text" 
              required 
              placeholder="Contoh: 7 A, X IPA 1" 
              class="w-full bg-white text-gray-900 border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none uppercase transition-all text-sm"
              :class="formErrors.name ? 'border-rose-400 bg-rose-50/20' : 'border-gray-300'"
            />
            <p v-if="formErrors.name" class="text-xs text-rose-600 mt-1 font-medium">{{ formErrors.name }}</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Tingkat / Grade</label>
              <select v-model="editForm.grade_level" class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                <option :value="null">Pilih Tingkat...</option>
                <option v-for="g in 12" :key="g" :value="g">Kelas {{ g }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Jurusan / Program</label>
              <input v-model="editForm.major" type="text" placeholder="Contoh: Umum, MIPA" class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Tahun Ajaran</label>
              <input v-model="editForm.academic_year" type="text" required placeholder="2024/2025" class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Jumlah Siswa</label>
              <input v-model.number="editForm.student_count" type="number" min="0" required placeholder="32" class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Wali Kelas</label>
            <select v-model="editForm.homeroom_teacher_id" class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm cursor-pointer">
              <option :value="null">-- Belum Ditentukan / Tidak Ada --</option>
              <option v-for="teacher in masterStore.activeTeachers" :key="teacher.id" :value="teacher.id">
                {{ teacher.name }} {{ teacher.nip_nuptk ? `(NIP: ${teacher.nip_nuptk})` : '' }}
              </option>
            </select>
          </div>

          <div class="flex items-center gap-3 pt-2">
            <input type="checkbox" id="edit_is_active" v-model="editForm.is_active" class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer">
            <label for="edit_is_active" class="text-xs font-bold text-gray-700 cursor-pointer select-none">
              Status Kelas Aktif (Dapat digunakan untuk jadwal pelajaran)
            </label>
          </div>
          
          <div class="pt-4 flex gap-3 border-t border-gray-100">
            <button type="button" @click="showEditModal = false" class="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold py-2.5 px-4 rounded-xl transition-colors cursor-pointer text-sm">
              Batal
            </button>
            <button 
              type="submit" 
              :disabled="masterStore.isSaving" 
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
            >
              <svg v-if="masterStore.isSaving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>{{ masterStore.isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ===================================================================== -->
    <!-- MODAL: KONFIRMASI HAPUS (SOFT DELETE) -->
    <!-- ===================================================================== -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-opacity">
      <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 text-center animate-fade-in-up">
        <div class="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </div>
        <h3 class="text-lg font-bold text-gray-800 mb-2">Hapus Rombel Kelas?</h3>
        <p class="text-sm text-gray-500 mb-6 leading-relaxed">
          Anda akan menghapus kelas <span class="font-bold text-gray-900">"{{ classToDelete?.name }}"</span>.
          Sistem menggunakan soft delete sehingga data riwayat jadwal lama tetap terjaga secara audit aman.
        </p>
        <div class="flex gap-3">
          <button 
            type="button" 
            @click="showDeleteModal = false" 
            class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-xl transition-colors cursor-pointer text-sm"
          >
            Batal
          </button>
          <button 
            type="button" 
            @click="executeDeleteClass" 
            :disabled="masterStore.isDeleting"
            class="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
          >
            <svg v-if="masterStore.isDeleting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span>{{ masterStore.isDeleting ? 'Menghapus...' : 'Ya, Hapus Kelas' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ===================================================================== -->
    <!-- MODAL: PRATINJAU & VALIDASI EXCEL SEBELUM COMMIT IMPORT -->
    <!-- ===================================================================== -->
    <div v-if="showExcelPreviewModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-opacity">
      <div class="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
        <!-- Header Modal Preview -->
        <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50 flex-shrink-0">
          <div>
            <h3 class="font-bold text-gray-800 text-lg flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Pratinjau & Validasi Impor Excel
            </h3>
            <p class="text-xs text-gray-500">Periksa ringkasan baris data sebelum disimpan ke database</p>
          </div>
          <button @click="closeExcelPreviewModal" class="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 rounded-full p-2 transition-colors cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Summary Badges Bar -->
        <div class="px-6 py-3 bg-gray-50/50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-full font-bold bg-blue-100 text-blue-800">
              Total: {{ excelPreviewRows.length }} Baris
            </span>
            <span class="px-3 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800">
              Valid: {{ validExcelCount }} Baris
            </span>
            <span v-if="invalidExcelCount > 0" class="px-3 py-1 rounded-full font-bold bg-rose-100 text-rose-800">
              Error: {{ invalidExcelCount }} Baris
            </span>
          </div>

          <!-- Opsi Mode Impor -->
          <div class="flex items-center gap-3">
            <label class="flex items-center gap-1.5 cursor-pointer text-gray-700 font-medium">
              <input type="radio" value="upsert" v-model="importMode" class="text-blue-600 focus:ring-blue-500">
              <span>Upsert (Perbarui jika kelas sudah ada)</span>
            </label>
            <label class="flex items-center gap-1.5 cursor-pointer text-gray-700 font-medium">
              <input type="radio" value="insert" v-model="importMode" class="text-blue-600 focus:ring-blue-500">
              <span>Hanya yang baru</span>
            </label>
          </div>
        </div>

        <!-- Tabel Pratinjau Baris -->
        <div class="overflow-y-auto flex-1 p-6">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                <th class="px-3 py-3 w-12 text-center">Baris</th>
                <th class="px-3 py-3 w-28">Status</th>
                <th class="px-3 py-3">Nama Kelas</th>
                <th class="px-3 py-3">Tingkat</th>
                <th class="px-3 py-3">Jurusan</th>
                <th class="px-3 py-3">Wali Kelas</th>
                <th class="px-3 py-3 text-center">Siswa</th>
                <th class="px-3 py-3">Keterangan / Validasi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr 
                v-for="item in excelPreviewRows" 
                :key="item.row"
                class="hover:bg-gray-50 transition-colors"
                :class="!item.valid ? 'bg-rose-50/40' : item.warnings.length > 0 ? 'bg-amber-50/30' : ''"
              >
                <td class="px-3 py-2.5 font-mono text-center text-gray-500 font-semibold">{{ item.row }}</td>
                <td class="px-3 py-2.5">
                  <span 
                    v-if="item.valid" 
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold bg-emerald-100 text-emerald-800"
                  >
                    Siap Import
                  </span>
                  <span 
                    v-else 
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold bg-rose-100 text-rose-800"
                  >
                    Format Salah
                  </span>
                </td>
                <td class="px-3 py-2.5 font-bold text-gray-800">
                  {{ item.parsedData.name || '-' }}
                </td>
                <td class="px-3 py-2.5 text-gray-600">
                  {{ item.parsedData.grade_level ? `Kelas ${item.parsedData.grade_level}` : '-' }}
                </td>
                <td class="px-3 py-2.5 text-gray-600">
                  {{ item.parsedData.major || 'Umum' }}
                </td>
                <td class="px-3 py-2.5 text-gray-700">
                  {{ item.parsedData.homeroom_teacher_name || '-' }}
                </td>
                <td class="px-3 py-2.5 text-center font-semibold text-gray-700">
                  {{ item.parsedData.student_count }}
                </td>
                <td class="px-3 py-2.5">
                  <div v-if="item.errors.length > 0" class="text-rose-600 font-medium">
                    <p v-for="(err, eIdx) in item.errors" :key="eIdx">{{ err }}</p>
                  </div>
                  <div v-else-if="item.warnings.length > 0" class="text-amber-700 font-medium">
                    <p v-for="(warn, wIdx) in item.warnings" :key="wIdx">{{ warn }}</p>
                  </div>
                  <span v-else class="text-emerald-600 font-medium">Data valid</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer Actions Preview -->
        <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3 flex-shrink-0">
          <p class="text-xs text-gray-500">
            Hanya baris dengan status <strong class="text-emerald-700">Siap Import</strong> yang akan diproses ke server database.
          </p>
          <div class="flex items-center gap-3">
            <button 
              type="button" 
              @click="closeExcelPreviewModal" 
              class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-xl transition-colors cursor-pointer text-sm"
            >
              Batal
            </button>
            <button 
              type="button" 
              @click="commitExcelImport" 
              :disabled="validExcelCount === 0 || masterStore.isImporting" 
              class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
            >
              <svg v-if="masterStore.isImporting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>{{ masterStore.isImporting ? 'Menyimpan ke Server...' : `Import ${validExcelCount} Kelas` }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===================================================================== -->
    <!-- MODAL: SUKSES -->
    <!-- ===================================================================== -->
    <div v-if="showSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-opacity">
      <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative animate-bounce-in text-center border-t-8 border-emerald-500">
        <button @click="showSuccessModal = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors cursor-pointer">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <div class="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full mx-auto flex items-center justify-center mb-5 shadow-inner relative">
          <svg class="w-10 h-10 animate-draw-check" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 class="text-xl font-black text-gray-800 mb-2">Berhasil!</h2>
        <p class="text-gray-600 mb-6 font-medium leading-relaxed text-sm">{{ successMessage }}</p>
        <button @click="showSuccessModal = false" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-transform transform hover:-translate-y-0.5 cursor-pointer text-sm">
          Selesai
        </button>
      </div>
    </div>

    <!-- ===================================================================== -->
    <!-- MODAL: ERROR -->
    <!-- ===================================================================== -->
    <div v-if="showErrorModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-opacity">
      <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative animate-shake text-center border-t-8 border-rose-500">
        <button @click="showErrorModal = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors cursor-pointer">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <div class="w-20 h-20 bg-rose-100 text-rose-500 rounded-full mx-auto flex items-center justify-center mb-5 shadow-inner relative">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
        </div>
        <h2 class="text-xl font-black text-gray-800 mb-2">Terjadi Kesalahan</h2>
        <p class="text-gray-600 mb-6 font-medium leading-relaxed text-sm">{{ errorMessage }}</p>
        <button @click="showErrorModal = false" class="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-transform transform hover:-translate-y-0.5 cursor-pointer text-sm">
          Tutup & Perbaiki
        </button>
      </div>
    </div>

    <!-- MODAL: XLSB / EXCEL WORKBOOK IMPOR PIPELINE -->
    <XlsbImportModal
      :isOpen="showXlsbModal"
      defaultEntityType="classes"
      :existingRecords="masterStore.classes"
      @close="showXlsbModal = false"
      @import-success="handleXlsbImportSuccess"
      @error="handleXlsbError"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import * as XLSX from 'xlsx'
import { useMasterDataStore } from '../stores/masterData.js'
import { realtimeClient } from '../core/realtimeClient.js'
import { createDefaultClass, validateClassExcelRow } from '../types/masterData.js'
import XlsbImportModal from '../components/XlsbImportModal.vue'

const masterStore = useMasterDataStore()

const loading = ref(true)
const readingExcel = ref(false)

const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showExcelPreviewModal = ref(false)
const showXlsbModal = ref(false)
const showSuccessModal = ref(false)
const showErrorModal = ref(false)

const successMessage = ref('')
const errorMessage = ref('')
const formErrors = ref({})

const searchQuery = ref('')
const activeFilterStatus = ref('all') // 'all' | 'active' | 'inactive'
const currentPage = ref(1)
const itemsPerPage = 10

const fileInput = ref(null)
const classToDelete = ref(null)
const form = ref(createDefaultClass())
const editForm = ref(createDefaultClass())

// State Preview Excel
const excelPreviewRows = ref([])
const importMode = ref('upsert') // 'upsert' | 'insert'

// Filtered Classes
const filteredClasses = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return (masterStore.classes || []).filter((c) => {
    // Filter status aktif/nonaktif
    if (activeFilterStatus.value === 'active' && !c.is_active) return false
    if (activeFilterStatus.value === 'inactive' && c.is_active) return false

    // Filter teks pencarian
    if (!q) return true
    const nameMatch = (c.name || '').toLowerCase().includes(q)
    const hrMatch = (c.homeroom_teacher_name || c.homeroom_teacher || '').toLowerCase().includes(q)
    const majorMatch = (c.major || '').toLowerCase().includes(q)
    const countMatch = String(c.student_count || '').includes(q)
    return nameMatch || hrMatch || majorMatch || countMatch
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredClasses.value.length / itemsPerPage) || 1
})

const paginatedClasses = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredClasses.value.slice(start, start + itemsPerPage)
})

const paginationStart = computed(() => {
  if (filteredClasses.value.length === 0) return 0
  return (currentPage.value - 1) * itemsPerPage + 1
})

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * itemsPerPage, filteredClasses.value.length)
})

const validExcelCount = computed(() => {
  return excelPreviewRows.value.filter((r) => r.valid).length
})

const invalidExcelCount = computed(() => {
  return excelPreviewRows.value.filter((r) => !r.valid).length
})

watch(searchQuery, () => {
  currentPage.value = 1
})

watch(activeFilterStatus, () => {
  currentPage.value = 1
})

const resetFilters = () => {
  searchQuery.value = ''
  activeFilterStatus.value = 'all'
  currentPage.value = 1
}

// ============================================================================
// LIFECYCLE: LOAD DATA FROM BACKEND SERVER
// ============================================================================
async function loadData() {
  loading.value = true
  try {
    // Muat data kelas dan guru dari backend
    await Promise.allSettled([
      masterStore.loadClasses(),
      masterStore.loadTeachers()
    ])
  } catch (err) {
    console.error('Error loading master data:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  realtimeClient.connect('school_admin')
  loadData()
})

// ============================================================================
// TAMBAH KELAS
// ============================================================================
function openAddModal() {
  form.value = createDefaultClass()
  formErrors.value = {}
  showAddModal.value = true
}

async function saveClass() {
  formErrors.value = {}
  try {
    const payload = {
      name: form.value.name.trim().toUpperCase(),
      grade_level: form.value.grade_level ? Number(form.value.grade_level) : null,
      major: form.value.major.trim() || 'Umum',
      academic_year: form.value.academic_year.trim(),
      homeroom_teacher_id: form.value.homeroom_teacher_id || null,
      student_count: Number(form.value.student_count) || 0,
      is_active: Boolean(form.value.is_active)
    }

    await masterStore.addClass(payload)
    showAddModal.value = false
    successMessage.value = `Rombel "${payload.name}" berhasil ditambahkan ke server.`
    showSuccessModal.value = true
    realtimeClient.syncProgress('Daftar Kelas')
  } catch (err) {
    if (err.fields) {
      formErrors.value = err.fields
    } else {
      errorMessage.value = err.message || 'Gagal menambahkan kelas baru'
      showErrorModal.value = true
    }
  }
}

// ============================================================================
// EDIT KELAS
// ============================================================================
function openEditModal(cls) {
  editForm.value = {
    id: cls.id,
    name: cls.name,
    grade_level: cls.grade_level ?? null,
    major: cls.major || 'Umum',
    academic_year: cls.academic_year || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
    homeroom_teacher_id: cls.homeroom_teacher_id ?? null,
    student_count: cls.student_count ?? 0,
    is_active: cls.is_active ?? true
  }
  formErrors.value = {}
  showEditModal.value = true
}

async function updateClassData() {
  formErrors.value = {}
  try {
    const payload = {
      name: editForm.value.name.trim().toUpperCase(),
      grade_level: editForm.value.grade_level ? Number(editForm.value.grade_level) : null,
      major: editForm.value.major.trim() || 'Umum',
      academic_year: editForm.value.academic_year.trim(),
      homeroom_teacher_id: editForm.value.homeroom_teacher_id || null,
      student_count: Number(editForm.value.student_count) || 0,
      is_active: Boolean(editForm.value.is_active)
    }

    await masterStore.editClass(editForm.value.id, payload)
    showEditModal.value = false
    successMessage.value = `Data kelas "${payload.name}" berhasil diperbarui.`
    showSuccessModal.value = true
    realtimeClient.syncProgress('Daftar Kelas')
  } catch (err) {
    if (err.fields) {
      formErrors.value = err.fields
    } else {
      errorMessage.value = err.message || 'Gagal memperbarui kelas'
      showErrorModal.value = true
    }
  }
}

// ============================================================================
// HAPUS KELAS (SOFT DELETE)
// ============================================================================
function confirmDeleteClass(cls) {
  classToDelete.value = cls
  showDeleteModal.value = true
}

async function executeDeleteClass() {
  if (!classToDelete.value) return
  try {
    await masterStore.removeClass(classToDelete.value.id)
    showDeleteModal.value = false
    successMessage.value = `Kelas "${classToDelete.value.name}" berhasil dihapus secara aman (soft delete).`
    showSuccessModal.value = true
    classToDelete.value = null
    realtimeClient.syncProgress('Daftar Kelas')
  } catch (err) {
    errorMessage.value = err.message || 'Gagal menghapus kelas'
    showErrorModal.value = true
  }
}

// ============================================================================
// EXCEL: TEMPLATE DOWNLOAD & UPLOAD PREVIEW
// ============================================================================
function downloadTemplate() {
  const currentYear = new Date().getFullYear()
  const academicYear = `${currentYear}/${currentYear + 1}`

  const templateRows = [
    {
      'No': 1,
      'Nama Kelas': '7 A',
      'Tingkat': 7,
      'Jurusan': 'Umum',
      'Tahun Ajaran': academicYear,
      'Wali Kelas': 'Budi Santoso, S.Pd',
      'Jumlah Siswa': 32
    },
    {
      'No': 2,
      'Nama Kelas': '7 B',
      'Tingkat': 7,
      'Jurusan': 'Umum',
      'Tahun Ajaran': academicYear,
      'Wali Kelas': 'Siti Aminah, M.Pd',
      'Jumlah Siswa': 30
    },
    {
      'No': 3,
      'Nama Kelas': '8 A',
      'Tingkat': 8,
      'Jurusan': 'Umum',
      'Tahun Ajaran': academicYear,
      'Wali Kelas': 'Ahmad Fauzi, S.Pd',
      'Jumlah Siswa': 32
    },
    {
      'No': 4,
      'Nama Kelas': '10 MIPA 1',
      'Tingkat': 10,
      'Jurusan': 'MIPA',
      'Tahun Ajaran': academicYear,
      'Wali Kelas': 'Dewi Lestari, S.Pd',
      'Jumlah Siswa': 36
    }
  ]

  const ws = XLSX.utils.json_to_sheet(templateRows)
  ws['!cols'] = [
    { wch: 6 },   // No
    { wch: 18 },  // Nama Kelas
    { wch: 10 },  // Tingkat
    { wch: 14 },  // Jurusan
    { wch: 16 },  // Tahun Ajaran
    { wch: 30 },  // Wali Kelas
    { wch: 14 }   // Jumlah Siswa
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Template Daftar Kelas')
  XLSX.writeFile(wb, 'Template_Daftar_Kelas_GuruKu.xlsx')
}

function triggerUpload() {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

function handleFileUpload(event) {
  const file = event.target.files && event.target.files[0]
  if (!file) return

  readingExcel.value = true
  const reader = new FileReader()

  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('File Excel tidak memiliki lembar kerja (worksheet).')
      }

      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' })

      if (!rawRows || rawRows.length === 0) {
        throw new Error('File Excel kosong atau tidak memiliki baris data.')
      }

      const seenNames = new Set()
      const previewList = rawRows.map((row, idx) => {
        return validateClassExcelRow(row, idx + 1, seenNames)
      })

      excelPreviewRows.value = previewList
      showExcelPreviewModal.value = true
    } catch (err) {
      console.error('Error saat membaca Excel:', err)
      errorMessage.value = err.message || 'Format file Excel tidak dapat dibaca.'
      showErrorModal.value = true
    } finally {
      readingExcel.value = false
      if (fileInput.value) fileInput.value.value = ''
    }
  }

  reader.onerror = () => {
    readingExcel.value = false
    errorMessage.value = 'Gagal membaca file dari penyimpanan lokal komputer Anda.'
    showErrorModal.value = true
    if (fileInput.value) fileInput.value.value = ''
  }

  reader.readAsArrayBuffer(file)
}

function closeExcelPreviewModal() {
  showExcelPreviewModal.value = false
  excelPreviewRows.value = []
}

async function commitExcelImport() {
  const validRows = excelPreviewRows.value
    .filter((r) => r.valid)
    .map((r) => r.parsedData)

  if (validRows.length === 0) {
    errorMessage.value = 'Tidak ada baris data valid untuk diimpor.'
    showErrorModal.value = true
    return
  }

  try {
    const result = await masterStore.importClassesBatch(validRows, importMode.value)
    closeExcelPreviewModal()

    const summaryParts = []
    if (result.inserted > 0) summaryParts.push(`${result.inserted} kelas baru ditambahkan`)
    if (result.updated > 0) summaryParts.push(`${result.updated} kelas diperbarui`)
    if (result.skipped > 0) summaryParts.push(`${result.skipped} kelas dilewati`)
    if (result.failed > 0) summaryParts.push(`${result.failed} baris gagal`)

    successMessage.value = `Impor Excel berhasil! ${summaryParts.join(', ')}.`
    showSuccessModal.value = true
    realtimeClient.syncProgress('Daftar Kelas')
  } catch (err) {
    errorMessage.value = err.message || 'Gagal menyimpan transaksi batch ke server.'
    showErrorModal.value = true
  }
}

async function handleXlsbImportSuccess({ mode, items, result }) {
  if (mode === 'VALIDATE_ONLY') {
    successMessage.value = `Validasi berhasil! ${result.validCount} dari ${result.total} data kelas valid.`
    showSuccessModal.value = true
    return
  }

  if (items && items.length > 0) {
    try {
      const payload = items.map((it) => ({
        name: it.name,
        grade_level: it.gradeLevel,
        major: it.major || '',
        academic_year: it.academicYear || '2026/2027',
        homeroom_teacher_name: it.homeroomTeacherName || '',
        is_active: true
      }))
      const res = await masterStore.importClassesBatch(payload, mode.toLowerCase())
      const summaryParts = []
      if (res.inserted > 0) summaryParts.push(`${res.inserted} kelas baru ditambahkan`)
      if (res.updated > 0) summaryParts.push(`${res.updated} kelas diperbarui`)
      if (res.skipped > 0) summaryParts.push(`${res.skipped} kelas dilewati`)
      if (res.failed > 0) summaryParts.push(`${res.failed} baris gagal`)

      successMessage.value = `Impor XLSB berhasil! ${summaryParts.join(', ')}.`
      showSuccessModal.value = true
      realtimeClient.syncProgress('Daftar Kelas')
      await masterStore.fetchClasses(1)
    } catch (err) {
      errorMessage.value = err.message || 'Gagal menyimpan hasil impor XLSB.'
      showErrorModal.value = true
    }
  }
}

function handleXlsbError(msg) {
  errorMessage.value = msg
  showErrorModal.value = true
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
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}
.animate-shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
</style>
