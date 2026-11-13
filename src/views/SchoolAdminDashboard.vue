<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden font-sans relative">
    
    <!-- Mobile Overlay Backdrop -->
    <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 bg-gray-900/50 z-20 md:hidden backdrop-blur-sm transition-opacity"></div>

    <!-- Sidebar Kiri -->
    <aside 
      :class="[isSidebarOpen ? 'translate-x-0' : '-translate-x-full', 'md:translate-x-0']"
      class="w-72 bg-white border-r border-gray-100 flex flex-col h-full shadow-xl md:shadow-sm z-30 flex-shrink-0 fixed md:relative transition-transform duration-300 ease-in-out">
      
      <!-- Logo & Profile -->
      <div class="p-6 border-b border-gray-100 bg-white sticky top-0 z-10 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <AppLogo size="md" subtitle="Admin Sekolah" />
        </div>
        <!-- Close button for mobile -->
        <button @click="isSidebarOpen = false" class="md:hidden p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- Navigasi Menu -->
      <nav class="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
        
        <router-link :to="ROUTES.SCHOOL_ADMIN" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm"
          :class="[$route.path === ROUTES.SCHOOL_ADMIN || $route.path === '/admin-sekolah' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900']">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          Dashboard Utama
        </router-link>

        <div v-for="group in menuGroups" :key="group.title">
          <p class="px-4 text-xs font-black text-gray-400 uppercase tracking-widest mb-3">{{ group.title }}</p>
          <div class="space-y-1">
            <router-link v-for="item in group.items" :key="item.path" :to="item.path" 
              class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium"
              :class="[$route.path === item.path ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent']">
              <svg class="w-5 h-5" :class="[$route.path === item.path ? 'text-blue-600' : 'text-gray-400']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon"></path>
              </svg>
              {{ item.title }}
            </router-link>
          </div>
        </div>
      </nav>

      <!-- Footer Sidebar -->
      <div class="p-4 border-t border-gray-100 bg-white">
        <button @click="handleLogout" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-colors border border-red-100">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Keluar Sistem
        </button>
      </div>
    </aside>

    <!-- Konten Utama -->
    <main class="flex-1 overflow-y-auto bg-[#F8FAFC] relative">
      
      <!-- Mobile Header -->
      <div class="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div class="flex items-center gap-3">
          <AppLogo size="xs" :showText="true" />
        </div>
        <button @click="isSidebarOpen = true" class="p-2 text-gray-600 rounded-lg hover:bg-gray-100 border border-gray-200">
           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </div>

      <!-- Hanya tampil jika di root dashboard -->
      <div v-if="$route.path === ROUTES.SCHOOL_ADMIN || $route.path === '/admin-sekolah'" class="p-4 md:p-8 max-w-[1400px] mx-auto animate-fade-in-up">
        
        <!-- Notifikasi Indikator Realtime Fallback (Non-blocking) -->
        <div v-if="realtimeStatus.state === 'failed' || (!realtimeStatus.isRealtimeAvailable && realtimeStatus.state !== 'connected')" 
          class="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-between shadow-xs">
          <div class="flex items-center gap-3">
            <span class="w-3 h-3 rounded-full bg-amber-400"></span>
            <div>
              <p class="text-xs font-bold">Mode Sinkronisasi Berkala Aktif</p>
              <p class="text-[11px] text-amber-700">Koneksi websocket dialihkan ke polling periodik (30s). Aplikasi tetap dapat digunakan sepenuhnya tanpa gangguan.</p>
            </div>
          </div>
          <button @click="realtimeClient.manualReconnect()" class="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 rounded-xl text-xs font-bold text-amber-900 transition-colors cursor-pointer shrink-0 ml-4">
            Sambungkan Ulang
          </button>
        </div>

        <!-- Indikator Loading Dashboard (Non-blank saat API memuat data) -->
        <div v-if="dashboardState === 'loading'" 
          class="mb-6 p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-blue-800 flex items-center justify-between shadow-xs animate-pulse">
          <div class="flex items-center gap-3">
            <svg class="animate-spin w-5 h-5 text-blue-600 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <div>
              <p class="text-xs font-bold text-blue-900">Memuat Data Dashboard & Status Fondasi Sekolah...</p>
              <p class="text-[11px] text-blue-700">Sinkronisasi data sekolah dari server dan status lisensi.</p>
            </div>
          </div>
        </div>

        <!-- Safe Empty State Banner (Jika Data Sekolah Belum Tersedia) -->
        <div v-if="dashboardState === 'empty'" 
          class="mb-6 p-5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div>
              <p class="text-xs font-bold text-sky-900">Selamat Datang! Ruang Kerja Sekolah Baru Siap Dikonfigurasi</p>
              <p class="text-[11px] text-sky-700 mt-0.5">Data jadwal dan master data belum diisi. Mulai dengan melengkapi validasi lembaga dan sesi KBM.</p>
            </div>
          </div>
          <router-link :to="ROUTES.VALIDASI_LEMBAGA" class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0">
            Mulai Pengaturan Fondasi
          </router-link>
        </div>

        <!-- Alert Error Server Dashboard (Jika Terjadi Kegagalan HTTP) -->
        <div v-if="dashboardState === 'error'" 
          class="mb-6 p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <div>
              <p class="text-xs font-bold text-rose-900">{{ errorMessage || 'Gagal memuat data dashboard' }}</p>
              <p v-if="errorRequestId" class="text-[11px] font-mono text-rose-700 mt-0.5">ID Permintaan: {{ errorRequestId }}</p>
              <p class="text-[11px] text-rose-700 mt-0.5">Data lokal yang tersimpan tetap dapat diakses di menu navigasi.</p>
            </div>
          </div>
          <div class="flex items-center gap-2 self-end sm:self-center">
            <button @click="loadDashboard" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95">
              Coba Lagi
            </button>
            <button @click="dashboardState = 'success'" class="px-3 py-2 bg-white border border-rose-300 text-rose-800 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer">
              Gunakan Cache
            </button>
          </div>
        </div>

        <!-- Banner Modern Premium dengan Sapaan Dinamis -->
        <div class="bg-blue-900 rounded-3xl p-6 md:p-8 mb-8 shadow-xl shadow-blue-900/20 relative overflow-hidden text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div class="absolute inset-0 bg-[url('../assets/banner-bg.png')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-transparent"></div>
          
          <div class="relative z-10 w-full md:w-3/4">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 border backdrop-blur-md"
              :class="isMasterDataReady ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40' : 'bg-amber-500/20 text-amber-200 border-amber-400/40'">
              <span class="w-2 h-2 rounded-full animate-ping" :class="isMasterDataReady ? 'bg-emerald-400' : 'bg-amber-400'"></span>
              <span>{{ isMasterDataReady ? 'Master Data Siap' : 'Master Data Belum Lengkap' }}</span>
            </div>

            <h2 class="text-2xl md:text-3xl font-black mb-2 drop-shadow-md">
              Selamat Datang di Workspace Anda, <span class="text-blue-200">{{ setupStore.schoolProfile.schoolName || 'Sekolah Terdaftar' }}</span>
            </h2>
            <p class="text-blue-100 text-sm md:text-base font-medium leading-relaxed drop-shadow max-w-2xl">
              {{ dynamicGreeting }}
            </p>
          </div>
          
          <div class="hidden lg:flex relative z-10 flex-shrink-0">
            <div class="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col items-end shadow-inner">
              <span class="text-[11px] font-bold text-blue-200 tracking-wider uppercase mb-1">Status Lisensi</span>
              <p class="text-base font-black text-white flex items-center gap-2">
                <span class="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
                Aktif & Resmi
              </p>
              <button 
                @click="openClientRenewModal" 
                class="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                <span>Perpanjang Lisensi</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Ringkasan Status Kesiapan Fondasi Sekolah (Tahap 1) -->
        <div class="bg-white rounded-3xl p-6 mb-8 shadow-sm border border-gray-100">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-gray-100">
            <div class="flex items-center gap-3.5">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-lg font-black text-gray-900 tracking-tight">{{ setupStore.schoolProfile.schoolName || 'Sekolah Terdaftar' }}</h3>
                  <span
                    class="text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
                    :class="setupStore.isProfileComplete ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'"
                  >
                    {{ setupStore.isProfileComplete ? 'Terverifikasi' : 'Menunggu Validasi' }}
                  </span>
                </div>
                <p class="text-xs text-gray-500 mt-0.5 font-medium">
                  Tahun Pelajaran: <span class="font-bold text-gray-700 font-mono">{{ setupStore.schoolProfile.academicYear }}</span> (Semester {{ setupStore.schoolProfile.semester }}) &bull; Kepsek: <span class="font-bold text-gray-700">{{ setupStore.schoolProfile.principalName || 'Belum diisi' }}</span>
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 self-start lg:self-center">
              <router-link
                :to="ROUTES.VALIDASI_LEMBAGA"
                class="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors border border-blue-200 flex items-center gap-1.5 shadow-2xs"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                <span>Edit Identitas & Hari KBM</span>
              </router-link>
              <router-link
                :to="ROUTES.SESI_WAKTU"
                class="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors border border-indigo-200 flex items-center gap-1.5 shadow-2xs"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span>Atur Sesi & Waktu</span>
              </router-link>
            </div>
          </div>

          <!-- Mini Metrics Fondasi -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
            <div class="p-3 bg-gray-50/70 rounded-2xl border border-gray-100">
              <span class="text-[10px] font-black uppercase text-gray-400 tracking-wider">Validasi Lembaga</span>
              <p class="text-sm font-black mt-1" :class="setupStore.isProfileComplete ? 'text-emerald-600' : 'text-amber-600'">
                {{ setupStore.isProfileComplete ? 'Sudah Tervalidasi' : 'Belum Lengkap' }}
              </p>
            </div>
            <div class="p-3 bg-gray-50/70 rounded-2xl border border-gray-100">
              <span class="text-[10px] font-black uppercase text-gray-400 tracking-wider">Hari Pelaksanaan KBM</span>
              <p class="text-sm font-black text-gray-800 mt-1 font-mono">
                {{ setupStore.activeOperatingDays.length }} Hari Aktif
              </p>
              <p class="text-[11px] text-gray-500 font-medium truncate mt-0.5" :title="setupStore.activeDaysSummary">
                {{ setupStore.activeDaysSummary }}
              </p>
            </div>
            <div class="p-3 bg-gray-50/70 rounded-2xl border border-gray-100">
              <span class="text-[10px] font-black uppercase text-gray-400 tracking-wider">Sesi KBM Harian</span>
              <p class="text-sm font-black text-gray-800 mt-1 font-mono">
                {{ setupStore.kbmOnlySessions.length }} Jam / Hari
              </p>
            </div>
            <div class="p-3 bg-gray-50/70 rounded-2xl border border-gray-100">
              <span class="text-[10px] font-black uppercase text-gray-400 tracking-wider">Kesiapan Fondasi</span>
              <p class="text-sm font-black mt-1 font-mono" :class="setupStore.isSchedulingReady ? 'text-emerald-600' : 'text-blue-600'">
                {{ setupStore.foundationCompletionPercentage }}% Selesai
              </p>
            </div>
          </div>
        </div>

        <!-- Statistik Utama dengan Animasi Count-Up Perlahan -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <!-- Card Total Guru -->
          <router-link :to="ROUTES.DAFTAR_GURU" class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:scale-105 hover:shadow-md transition-all duration-300 group block cursor-pointer">
            <div class="flex items-center justify-between mb-3">
              <p class="text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Total Guru</p>
              <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
            </div>
            <div class="flex items-end gap-2">
              <h3 class="text-5xl font-black text-gray-900 tracking-tight font-mono">{{ animatedStats.totalGuru }}</h3>
              <span class="text-sm font-bold text-gray-400 mb-1.5">Orang</span>
            </div>
            <p class="text-[11px] text-gray-400 font-medium mt-2 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full" :class="animatedStats.totalGuru > 0 ? 'bg-emerald-500' : 'bg-gray-300'"></span>
              {{ animatedStats.totalGuru > 0 ? 'Staf pengajar terdaftar' : 'Belum ada guru' }}
            </p>
          </router-link>

          <!-- Card Total Kelas -->
          <router-link :to="ROUTES.DAFTAR_KELAS" class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:scale-105 hover:shadow-md transition-all duration-300 group block cursor-pointer">
            <div class="flex items-center justify-between mb-3">
              <p class="text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Total Kelas</p>
              <div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
            </div>
            <div class="flex items-end gap-2">
              <h3 class="text-5xl font-black text-gray-900 tracking-tight font-mono">{{ animatedStats.totalKelas }}</h3>
              <span class="text-sm font-bold text-gray-400 mb-1.5">Rombel</span>
            </div>
            <p class="text-[11px] text-gray-400 font-medium mt-2 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full" :class="animatedStats.totalKelas > 0 ? 'bg-emerald-500' : 'bg-gray-300'"></span>
              {{ animatedStats.totalKelas > 0 ? 'Rombongan belajar aktif' : 'Belum ada kelas' }}
            </p>
          </router-link>

          <!-- Card Mata Pelajaran -->
          <router-link :to="ROUTES.MATA_PELAJARAN" class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:scale-105 hover:shadow-md transition-all duration-300 group block cursor-pointer">
            <div class="flex items-center justify-between mb-3">
              <p class="text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">Mata Pelajaran</p>
              <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              </div>
            </div>
            <div class="flex items-end gap-2">
              <h3 class="text-5xl font-black text-gray-900 tracking-tight font-mono">{{ animatedStats.totalMapel }}</h3>
              <span class="text-sm font-bold text-gray-400 mb-1.5">Mapel</span>
            </div>
            <p class="text-[11px] text-gray-400 font-medium mt-2 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full" :class="animatedStats.totalMapel > 0 ? 'bg-emerald-500' : 'bg-gray-300'"></span>
              {{ animatedStats.totalMapel > 0 ? 'Kurikulum terdaftar' : 'Belum ada mapel' }}
            </p>
          </router-link>

          <!-- Card Jam Mengajar -->
          <router-link :to="ROUTES.PENGAMPU" class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-3xl shadow-sm border border-blue-100 hover:scale-105 hover:shadow-md transition-all duration-300 group relative overflow-hidden block cursor-pointer">
            <div class="absolute -right-4 -bottom-4 opacity-5 text-blue-900 pointer-events-none">
              <svg class="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div class="flex items-center justify-between mb-3 relative z-10">
              <p class="text-xs font-black text-blue-600 uppercase tracking-widest">Jam Mengajar</p>
              <div class="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
            </div>
            <div class="flex items-end gap-2 relative z-10">
              <h3 class="text-5xl font-black text-blue-800 tracking-tight font-mono">{{ animatedStats.jamMengajar }}</h3>
              <span class="text-sm font-bold text-blue-400 mb-1.5">JP</span>
            </div>
            <p class="text-[11px] text-blue-600 font-medium mt-2 flex items-center gap-1 relative z-10">
              <span class="w-1.5 h-1.5 rounded-full" :class="animatedStats.jamMengajar > 0 ? 'bg-emerald-500' : 'bg-amber-400'"></span>
              {{ animatedStats.jamMengajar > 0 ? 'Total alokasi mingguan' : 'Belum didistribusikan' }}
            </p>
          </router-link>
        </div>

        <!-- Alur Penyusunan Jadwal Tersinkronisasi Penuh -->
        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-100 gap-4">
            <div>
              <h2 class="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <span>Alur Penyusunan Jadwal</span>
                <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">3 Tahap Otomatis</span>
              </h2>
              <p class="text-sm text-gray-500 mt-1 font-medium">Ikuti urutan alur terstruktur ini untuk menghasilkan jadwal mengajar yang presisi dan bebas bentrok.</p>
            </div>
            
            <div class="flex items-center gap-3 bg-gray-50 py-2.5 px-4 rounded-2xl border border-gray-100">
              <span class="text-xs font-black text-gray-500 uppercase tracking-wider">Kesiapan:</span>
              <div class="w-28 sm:w-36 h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div class="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-700" :style="`width: ${animatedStats.progress}%`"></div>
              </div>
              <span class="text-sm font-black text-blue-700 font-mono">{{ animatedStats.progress }}%</span>
            </div>
          </div>

          <!-- 3 Langkah Alur -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <!-- Tahap 1: Persiapan Data -->
            <div class="border rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all bg-gradient-to-b from-blue-50/40 to-white flex flex-col justify-between"
              :class="isMasterDataComplete ? 'border-emerald-200' : 'border-blue-100'">
              <div>
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner"
                    :class="isMasterDataComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                  </div>
                  <span class="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1"
                    :class="isMasterDataComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'">
                    <svg v-if="isMasterDataComplete" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                    <span>{{ isMasterDataComplete ? 'Selesai (Lengkap)' : 'Langkah 1' }}</span>
                  </span>
                </div>
                <h3 class="font-black text-gray-900 text-lg mb-1">Persiapan Master Data</h3>
                <p class="text-xs text-gray-500 mb-4 leading-relaxed font-medium">Input atau upload template Excel untuk data Rombel, Dewan Guru, dan Mata Pelajaran.</p>
                
                <!-- Status Mini List -->
                <div class="space-y-1.5 mb-6 text-xs font-semibold">
                  <div class="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100">
                    <span class="text-gray-600">Daftar Kelas</span>
                    <span :class="rawStats.totalKelas > 0 ? 'text-emerald-600 font-bold' : 'text-gray-400'">{{ rawStats.totalKelas > 0 ? rawStats.totalKelas + ' Rombel' : 'Belum diisi' }}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100">
                    <span class="text-gray-600">Daftar Guru</span>
                    <span :class="rawStats.totalGuru > 0 ? 'text-emerald-600 font-bold' : 'text-gray-400'">{{ rawStats.totalGuru > 0 ? rawStats.totalGuru + ' Guru' : 'Belum diisi' }}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100">
                    <span class="text-gray-600">Mata Pelajaran</span>
                    <span :class="rawStats.totalMapel > 0 ? 'text-emerald-600 font-bold' : 'text-gray-400'">{{ rawStats.totalMapel > 0 ? rawStats.totalMapel + ' Mapel' : 'Belum diisi' }}</span>
                  </div>
                </div>
              </div>

              <router-link :to="ROUTES.DAFTAR_KELAS" class="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-700 transition-colors text-center block">
                Kelola Master Data
              </router-link>
            </div>

            <!-- Tahap 2: Distribusi Beban -->
            <div class="border rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all bg-gradient-to-b from-indigo-50/40 to-white flex flex-col justify-between"
              :class="rawStats.jamMengajar > 0 ? 'border-emerald-200' : 'border-indigo-100'">
              <div>
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner"
                    :class="rawStats.jamMengajar > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  </div>
                  <span class="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1"
                    :class="rawStats.jamMengajar > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'">
                    <svg v-if="rawStats.jamMengajar > 0" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                    <span>{{ rawStats.jamMengajar > 0 ? 'Terdistribusi' : 'Langkah 2' }}</span>
                  </span>
                </div>
                <h3 class="font-black text-gray-900 text-lg mb-1">Distribusi Beban</h3>
                <p class="text-xs text-gray-500 mb-4 leading-relaxed font-medium">Petakan guru ke kelas dengan sistem dropdown otomatis, atur jam kosong, & tugas tambahan.</p>
                
                <!-- Status Mini List -->
                <div class="space-y-1.5 mb-6 text-xs font-semibold">
                  <div class="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100">
                    <span class="text-gray-600">Pengampu Mapel</span>
                    <span :class="rawStats.jamMengajar > 0 ? 'text-emerald-600 font-bold' : 'text-gray-400'">{{ rawStats.jamMengajar > 0 ? rawStats.jamMengajar + ' JP Terisi' : 'Siap Ditugaskan' }}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100">
                    <span class="text-gray-600">Permintaan Jam Kosong</span>
                    <span class="text-blue-600 font-bold">Kartu Guru Aktif</span>
                  </div>
                  <div class="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100">
                    <span class="text-gray-600">Tugas Tambahan</span>
                    <span class="text-indigo-600 font-bold">Tersinkronisasi</span>
                  </div>
                </div>
              </div>

              <router-link :to="ROUTES.PENGAMPU" class="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-indigo-700 transition-colors text-center block">
                Atur Distribusi Pengampu
              </router-link>
            </div>

            <!-- Tahap 3: Hasil Jadwal -->
            <div class="border border-emerald-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all bg-gradient-to-b from-emerald-50/40 to-white flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </div>
                  <span class="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Langkah 3</span>
                </div>
                <h3 class="font-black text-gray-900 text-lg mb-1">Hasil & Cetak Jadwal</h3>
                <p class="text-xs text-gray-500 mb-4 leading-relaxed font-medium">Jalankan Smart Scheduling Engine dengan deteksi bentrok otomatis dan cetak jadwal resmi sekolah.</p>
                
                <!-- Status Mini List -->
                <div class="space-y-1.5 mb-6 text-xs font-semibold">
                  <div class="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100">
                    <span class="text-gray-600">Engine Penjadwalan</span>
                    <span class="text-emerald-600 font-bold">Deteksi Bentrok</span>
                  </div>
                  <div class="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100">
                    <span class="text-gray-600">Jadwal Guru</span>
                    <span class="text-gray-500">Matriks & PDF</span>
                  </div>
                  <div class="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100">
                    <span class="text-gray-600">Jadwal Kelas</span>
                    <span class="text-gray-500">Tampilan Mingguan</span>
                  </div>
                </div>
              </div>

              <router-link
                v-if="isSchedulingAllowed"
                :to="ROUTES.JADWAL_KELAS"
                class="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 transition-colors text-center block cursor-pointer"
              >
                Lihat Jadwal Kelas
              </router-link>
              <button
                v-else
                type="button"
                @click="showSchedulingLockWarning = true"
                class="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-xl text-xs font-bold transition-colors text-center flex items-center justify-center gap-1.5 border border-gray-200 cursor-pointer"
              >
                <svg class="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <span>Terkunci (Lengkapi Fondasi)</span>
              </button>
            </div>

          </div>
        </div>

        <!-- FITUR TAMBAHAN KEREN (Tidak Buang-Buang Tempat): Smart Assistant & Quick Actions -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Widget 1: Asisten Kesiapan Jadwal (Smart Assistant) -->
          <div class="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                  </div>
                  <div>
                    <h3 class="font-black text-gray-900 text-lg">Asisten Kesiapan Jadwal</h3>
                    <p class="text-xs text-gray-400">Analisis otomatis kelengkapan data sebelum generate jadwal</p>
                  </div>
                </div>
                <span class="text-xs font-bold px-3 py-1 rounded-full"
                  :class="isMasterDataComplete ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'">
                  {{ isMasterDataComplete ? 'Siap Lanjut' : 'Lengkapi Data' }}
                </span>
              </div>

              <!-- Recommendation Banner -->
              <div class="p-4 rounded-2xl mb-5 text-sm"
                :class="isMasterDataComplete ? (rawStats.jamMengajar > 0 ? 'bg-emerald-50/80 border border-emerald-100 text-emerald-900' : 'bg-blue-50/80 border border-blue-100 text-blue-900') : 'bg-amber-50/80 border border-amber-100 text-amber-900'">
                <p class="font-bold flex items-center gap-2 mb-1">
                  <span>{{ smartRecommendation.title }}</span>
                </p>
                <p class="text-xs opacity-90 leading-relaxed font-medium">
                  {{ smartRecommendation.desc }}
                </p>
              </div>

              <!-- Checklist Status 6 Langkah Fondasi & Master Data -->
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-semibold">
                <!-- 1. Validasi Lembaga -->
                <router-link
                  :to="ROUTES.VALIDASI_LEMBAGA"
                  class="flex items-center gap-2 p-2.5 rounded-xl border transition-all hover:shadow-2xs"
                  :class="setupStore.isProfileComplete ? 'bg-emerald-50/40 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-blue-300'"
                >
                  <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    :class="setupStore.isProfileComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'">
                    <svg v-if="setupStore.isProfileComplete" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                    <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <div class="truncate">
                    <p class="text-[10px] text-gray-400 uppercase leading-none mb-0.5">Langkah 1</p>
                    <span class="truncate block">{{ setupStore.isProfileComplete ? 'Lembaga Valid' : 'Validasi Lembaga' }}</span>
                  </div>
                </router-link>

                <!-- 2. Hari Pelaksanaan KBM -->
                <router-link
                  :to="ROUTES.VALIDASI_LEMBAGA"
                  class="flex items-center gap-2 p-2.5 rounded-xl border transition-all hover:shadow-2xs"
                  :class="setupStore.isOperatingDaysComplete ? 'bg-emerald-50/40 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-blue-300'"
                >
                  <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    :class="setupStore.isOperatingDaysComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'">
                    <svg v-if="setupStore.isOperatingDaysComplete" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                    <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <div class="truncate">
                    <p class="text-[10px] text-gray-400 uppercase leading-none mb-0.5">Langkah 1</p>
                    <span class="truncate block">{{ setupStore.activeOperatingDays.length > 0 ? setupStore.activeOperatingDays.length + ' Hari KBM' : 'Hari KBM' }}</span>
                  </div>
                </router-link>

                <!-- 3. Sesi & Waktu KBM -->
                <router-link
                  :to="ROUTES.SESI_WAKTU"
                  class="flex items-center gap-2 p-2.5 rounded-xl border transition-all hover:shadow-2xs"
                  :class="setupStore.isKbmSessionsComplete ? 'bg-emerald-50/40 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-blue-300'"
                >
                  <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    :class="setupStore.isKbmSessionsComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'">
                    <svg v-if="setupStore.isKbmSessionsComplete" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                    <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <div class="truncate">
                    <p class="text-[10px] text-gray-400 uppercase leading-none mb-0.5">Langkah 2</p>
                    <span class="truncate block">{{ setupStore.kbmOnlySessions.length > 0 ? setupStore.kbmOnlySessions.length + ' Sesi KBM' : 'Sesi Waktu' }}</span>
                  </div>
                </router-link>

                <!-- 4. Rombel Kelas -->
                <router-link
                  :to="ROUTES.DAFTAR_KELAS"
                  class="flex items-center gap-2 p-2.5 rounded-xl border transition-all hover:shadow-2xs"
                  :class="rawStats.totalKelas > 0 ? 'bg-emerald-50/40 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-blue-300'"
                >
                  <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    :class="rawStats.totalKelas > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'">
                    <svg v-if="rawStats.totalKelas > 0" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                    <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <div class="truncate">
                    <p class="text-[10px] text-gray-400 uppercase leading-none mb-0.5">Master Data</p>
                    <span class="truncate block">{{ rawStats.totalKelas > 0 ? rawStats.totalKelas + ' Kelas' : 'Daftar Kelas' }}</span>
                  </div>
                </router-link>

                <!-- 5. Staf Guru -->
                <router-link
                  :to="ROUTES.DAFTAR_GURU"
                  class="flex items-center gap-2 p-2.5 rounded-xl border transition-all hover:shadow-2xs"
                  :class="rawStats.totalGuru > 0 ? 'bg-emerald-50/40 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-blue-300'"
                >
                  <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    :class="rawStats.totalGuru > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'">
                    <svg v-if="rawStats.totalGuru > 0" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                    <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <div class="truncate">
                    <p class="text-[10px] text-gray-400 uppercase leading-none mb-0.5">Master Data</p>
                    <span class="truncate block">{{ rawStats.totalGuru > 0 ? rawStats.totalGuru + ' Guru' : 'Daftar Guru' }}</span>
                  </div>
                </router-link>

                <!-- 6. Mata Pelajaran -->
                <router-link
                  :to="ROUTES.MATA_PELAJARAN"
                  class="flex items-center gap-2 p-2.5 rounded-xl border transition-all hover:shadow-2xs"
                  :class="rawStats.totalMapel > 0 ? 'bg-emerald-50/40 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-blue-300'"
                >
                  <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    :class="rawStats.totalMapel > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'">
                    <svg v-if="rawStats.totalMapel > 0" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                    <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <div class="truncate">
                    <p class="text-[10px] text-gray-400 uppercase leading-none mb-0.5">Master Data</p>
                    <span class="truncate block">{{ rawStats.totalMapel > 0 ? rawStats.totalMapel + ' Mapel' : 'Mata Pelajaran' }}</span>
                  </div>
                </router-link>
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <router-link :to="smartRecommendation.actionRoute" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2">
                <span>{{ smartRecommendation.actionLabel }}</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </router-link>
            </div>
          </div>

          <!-- Widget 2: Pintasan Aksi Cepat (Quick Action Tools) -->
          <div class="lg:col-span-5 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                  </div>
                  <div>
                    <h3 class="font-black text-gray-900 text-lg">Pintasan Aksi Cepat</h3>
                    <p class="text-xs text-gray-400">Akses instan ke alat bantu yang sering digunakan</p>
                  </div>
                </div>
              </div>

              <!-- 4 Shortcut Buttons dengan Clean Vector SVG -->
              <div class="grid grid-cols-2 gap-3 mb-2">
                <router-link :to="ROUTES.DAFTAR_GURU" class="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/60 hover:bg-blue-50/60 hover:border-blue-200 transition-all flex flex-col items-start group">
                  <span class="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </span>
                  <span class="text-xs font-bold text-gray-800 group-hover:text-blue-700">Daftar Guru</span>
                  <span class="text-[10px] text-gray-400 mt-0.5">Tambah / Excel</span>
                </router-link>

                <router-link :to="ROUTES.DAFTAR_KELAS" class="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/60 hover:bg-indigo-50/60 hover:border-indigo-200 transition-all flex flex-col items-start group">
                  <span class="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  </span>
                  <span class="text-xs font-bold text-gray-800 group-hover:text-indigo-700">Daftar Kelas</span>
                  <span class="text-[10px] text-gray-400 mt-0.5">Tambah / Excel</span>
                </router-link>

                <router-link :to="ROUTES.JAM_KOSONG" class="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/60 hover:bg-amber-50/60 hover:border-amber-200 transition-all flex flex-col items-start group">
                  <span class="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </span>
                  <span class="text-xs font-bold text-gray-800 group-hover:text-amber-700">Jam Kosong</span>
                  <span class="text-[10px] text-gray-400 mt-0.5">Atur Jadwal Cuti</span>
                </router-link>

                <router-link :to="ROUTES.JADWAL_KELAS" class="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/60 hover:bg-emerald-50/60 hover:border-emerald-200 transition-all flex flex-col items-start group">
                  <span class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  </span>
                  <span class="text-xs font-bold text-gray-800 group-hover:text-emerald-700">Jadwal Kelas</span>
                  <span class="text-[10px] text-gray-400 mt-0.5">Matriks & Ekspor</span>
                </router-link>
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-gray-100 text-center">
              <span class="text-[11px] text-gray-400 font-medium">Semua data otomatis tersinkronisasi antar menu</span>
            </div>
          </div>

        </div>

      </div>
      
      <!-- Halaman dinamis child router akan dimuat di sini -->
      <router-view v-else></router-view>
      
      <MagicWizard :show="showWizard" @close="showWizard = false" />

    <!-- Modal Perpanjangan Lisensi Mandiri Klien -->
    <div v-if="showClientRenewModal" class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in" @click.self="showClientRenewModal = false">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 class="text-xl font-black text-slate-900">Perpanjangan Lisensi GuruKu</h3>
            <p class="text-xs text-slate-500 mt-0.5">Pilih paket lisensi untuk memperpanjang akses sistem manajemen sekolah.</p>
          </div>
          <button @click="showClientRenewModal = false" class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">Lembaga Sekolah</label>
            <div class="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800">
              {{ profileName || 'Sekolah Terdaftar' }}
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">Pilih Paket Lisensi</label>
            <div class="space-y-2">
              <div 
                v-for="pkg in clientPackages" 
                :key="pkg.id" 
                @click="selectedClientPackage = pkg"
                class="p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between"
                :class="selectedClientPackage?.id === pkg.id ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300 bg-white'"
              >
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-900 text-sm">{{ pkg.name }}</span>
                    <span v-if="pkg.isPopular" class="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white uppercase">Populer</span>
                  </div>
                  <p class="text-[11px] text-slate-500 mt-0.5">{{ pkg.description }}</p>
                </div>
                <div class="text-right shrink-0 pl-3">
                  <span class="text-sm font-black text-slate-900 font-mono">{{ formatRupiah(pkg.price) }}</span>
                  <span class="text-[10px] text-slate-400 block">{{ pkg.durationLabel }}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
            <textarea v-model="clientRenewNotes" rows="2" placeholder="Catatan untuk bagian penagihan Super Admin..." class="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button @click="showClientRenewModal = false" class="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">Batal</button>
          <button @click="submitClientRenewal" :disabled="isSubmittingRenewal" class="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50">
            {{ isSubmittingRenewal ? 'Menerbitkan Tagihan...' : 'Ajukan Perpanjangan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Peringatan Penjadwalan Terkunci -->
    <div v-if="showSchedulingLockWarning" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 animate-fade-in" @click.self="showSchedulingLockWarning = false">
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border-t-8 border-amber-500 text-center">
        <button @click="showSchedulingLockWarning = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        <div class="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center mb-4 shadow-inner">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
        </div>
        <h3 class="text-xl font-black text-gray-900 mb-2">Penjadwalan Belum Siap</h3>
        <p class="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6 font-medium">
          Untuk mencegah tabrakan jam guru & kelas, Anda wajib melengkapi data fondasi sekolah (Validasi Lembaga, Hari KBM, Sesi KBM) dan master data (Kelas, Guru, Mapel, Pengampu) terlebih dahulu.
        </p>
        <div class="space-y-2">
          <router-link :to="smartRecommendation.actionRoute" @click="showSchedulingLockWarning = false" class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors block shadow-xs">
            Lengkapi: {{ smartRecommendation.actionLabel }}
          </router-link>
          <button @click="showSchedulingLockWarning = false" class="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer">
            Tutup
          </button>
        </div>
      </div>
    </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppLogo from '../components/AppLogo.vue'
import { realtimeClient } from '../core/realtimeClient.js'
import { useAuthStore } from '../stores/auth.js'
import { useSchoolSetupStore } from '../stores/schoolSetup.js'
import MagicWizard from '../components/MagicWizard.vue'
import { ROUTES } from '../config/routePaths.js'
import { getStoredPackages } from '../data/packagesCatalog.js'

const authStore = useAuthStore()
const setupStore = useSchoolSetupStore()
const router = useRouter()
const route = useRoute()
const profileName = ref('')
const showWizard = ref(false)
const isSidebarOpen = ref(false)
const showSchedulingLockWarning = ref(false)

// State Mesin Dashboard: 'loading' | 'success' | 'empty' | 'error' | 'offline'
const dashboardState = ref('loading')
const errorMessage = ref('')
const errorRequestId = ref('')
const realtimeStatus = ref({
  state: realtimeClient.getState(),
  isRealtimeAvailable: true,
  mode: realtimeClient.getMode()
})

// Nilai Riil Database / LocalStorage
const rawStats = ref({
  totalGuru: 0,
  totalKelas: 0,
  totalMapel: 0,
  jamMengajar: 0,
  progress: 0
})

// Nilai yang Ditampilkan dengan Animasi Count-Up Naik Perlahan
const animatedStats = ref({
  totalGuru: 0,
  totalKelas: 0,
  totalMapel: 0,
  jamMengajar: 0,
  progress: 0
})

// Fungsi Animasi Count-Up Halus (0 -> Nilai Sebenarnya)
const animateCountUp = (target, durationMs = 1200) => {
  const startTimestamp = performance.now()
  const start = {
    totalGuru: 0,
    totalKelas: 0,
    totalMapel: 0,
    jamMengajar: 0,
    progress: 0
  }

  const step = (now) => {
    const elapsed = now - startTimestamp
    const progressRatio = Math.min(elapsed / durationMs, 1)
    // Easing Out Cubic: t => 1 - (1 - t)^3
    const ease = 1 - Math.pow(1 - progressRatio, 3)

    animatedStats.value.totalGuru = Math.round(start.totalGuru + (target.totalGuru - start.totalGuru) * ease)
    animatedStats.value.totalKelas = Math.round(start.totalKelas + (target.totalKelas - start.totalKelas) * ease)
    animatedStats.value.totalMapel = Math.round(start.totalMapel + (target.totalMapel - start.totalMapel) * ease)
    animatedStats.value.jamMengajar = Math.round(start.jamMengajar + (target.jamMengajar - start.jamMengajar) * ease)
    animatedStats.value.progress = Math.round(start.progress + (target.progress - start.progress) * ease)

    if (progressRatio < 1) {
      requestAnimationFrame(step)
    } else {
      animatedStats.value.totalGuru = target.totalGuru
      animatedStats.value.totalKelas = target.totalKelas
      animatedStats.value.totalMapel = target.totalMapel
      animatedStats.value.jamMengajar = target.jamMengajar
      animatedStats.value.progress = target.progress
    }
  }

  requestAnimationFrame(step)
}

// Cek apakah Master Data Lengkap (Guru, Kelas, Mapel semuanya > 0)
const isMasterDataReady = computed(() => (rawStats.value.progress || 0) >= 100)

const isMasterDataComplete = computed(() => {
  return rawStats.value.totalGuru > 0 && rawStats.value.totalKelas > 0 && rawStats.value.totalMapel > 0
})

// Izin menuju penjadwalan (Fondasi harus lengkap + Master Data lengkap)
const isSchedulingAllowed = computed(() => {
  return setupStore.isSchedulingReady && isMasterDataComplete.value
})

// Sapaan Ramah & Dinamis di Banner
const dynamicGreeting = computed(() => {
  const currentSchool = setupStore.schoolProfile.schoolName || profileName.value || 'Admin Sekolah'
  if (!setupStore.isSchedulingReady) {
    return `Selamat datang di ruang kerja ${currentSchool}. Mari mulai dengan memvalidasi identitas lembaga dan menentukan sesi jam KBM harian.`
  }
  if (!isMasterDataComplete.value) {
    return `Fondasi KBM ${currentSchool} telah siap! Lengkapi master data (Kelas, Guru, & Mapel) untuk memulai penyusunan jadwal sekolah.`
  }

  const hour = new Date().getHours()
  let greetingTime = 'Semangat pagi'
  if (hour >= 11 && hour < 15) greetingTime = 'Semangat siang'
  else if (hour >= 15 && hour < 18) greetingTime = 'Semangat sore'
  else if (hour >= 18 || hour < 5) greetingTime = 'Semangat malam'

  return `${greetingTime} untuk memulai kerja kita! Seluruh master data telah siap dan tersinkronisasi untuk penyusunan jadwal sekolah yang optimal.`
})

// Rekomendasi Terstruktur untuk Asisten Kesiapan (Mengutamakan Fondasi)
const smartRecommendation = computed(() => {
  // 1. Fondasi: Validasi Lembaga
  if (!setupStore.isProfileComplete) {
    return {
      title: 'Langkah 1: Lengkapi Validasi Identitas Lembaga',
      desc: 'Legalitas kepala sekolah, tahun pelajaran, dan semester belum diverifikasi. Selesaikan pada form Validasi Lembaga.',
      actionLabel: 'Validasi Lembaga',
      actionRoute: ROUTES.VALIDASI_LEMBAGA
    }
  }
  // 2. Fondasi: Hari Pelaksanaan KBM
  if (!setupStore.isOperatingDaysComplete) {
    return {
      title: 'Langkah 1: Tentukan Hari Pelaksanaan KBM',
      desc: 'Pilih minimal 1 hari aktif pembelajaran di sekolah Anda pada halaman Validasi Lembaga.',
      actionLabel: 'Atur Hari KBM',
      actionRoute: ROUTES.VALIDASI_LEMBAGA
    }
  }
  // 3. Fondasi: Sesi & Waktu KBM
  if (!setupStore.isKbmSessionsComplete) {
    return {
      title: 'Langkah 2: Konfigurasi Sesi & Waktu KBM',
      desc: 'Tentukan jam mulai, jam selesai, dan urutan sesi KBM harian sebelum menginput data jadwal.',
      actionLabel: 'Atur Sesi KBM',
      actionRoute: ROUTES.SESI_WAKTU
    }
  }
  // 4. Master Data: Kelas
  if (rawStats.value.totalKelas === 0) {
    return {
      title: 'Langkah Master Data: Daftarkan Rombongan Belajar',
      desc: 'Sekolah belum memiliki data kelas. Silakan tambahkan nama kelas atau unduh template Excel di menu Daftar Kelas.',
      actionLabel: 'Isi Daftar Kelas',
      actionRoute: ROUTES.DAFTAR_KELAS
    }
  }
  // 5. Master Data: Guru
  if (rawStats.value.totalGuru === 0) {
    return {
      title: 'Langkah Master Data: Daftarkan Dewan Guru',
      desc: 'Belum ada guru yang terdaftar. Masukkan data guru pengajar beserta kode uniknya di menu Daftar Guru.',
      actionLabel: 'Isi Daftar Guru',
      actionRoute: ROUTES.DAFTAR_GURU
    }
  }
  // 6. Master Data: Mapel
  if (rawStats.value.totalMapel === 0) {
    return {
      title: 'Langkah Master Data: Lengkapi Mata Pelajaran',
      desc: 'Masukkan daftar mata pelajaran kurikulum sekolah Anda di menu Mata Pelajaran.',
      actionLabel: 'Isi Mata Pelajaran',
      actionRoute: ROUTES.MATA_PELAJARAN
    }
  }
  // 7. Distribusi Pengampu
  if (rawStats.value.jamMengajar === 0) {
    return {
      title: 'Master Data Lengkap! Distribusikan Jam Guru',
      desc: 'Semua kelas, guru, dan mapel sudah siap. Sekarang hubungkan guru ke mata pelajaran dan kelasnya di menu Distribusi Pengampu.',
      actionLabel: 'Atur Pengampu Mapel',
      actionRoute: ROUTES.PENGAMPU
    }
  }
  return {
    title: 'Semua Fondasi & Data Siap! Terbitkan Jadwal',
    desc: 'Seluruh konfigurasi lengkap dan tervalidasi. Anda dapat langsung melihat matriks jadwal kelas dan jadwal guru.',
    actionLabel: 'Lihat Jadwal Kelas',
    actionRoute: ROUTES.JADWAL_KELAS
  }
})

const fetchProfileName = async () => {
  const localSchoolName = localStorage.getItem('school_name') || localStorage.getItem('user_name')
  if (localSchoolName) {
    profileName.value = localSchoolName
  }
  const schoolId = localStorage.getItem('school_id')
  if (!schoolId) return

  try {
    const res = await fetch('/api/v1/school/profile', {
      headers: { 'X-School-ID': schoolId },
      credentials: 'include'
    })
    if (res.ok) {
      const data = await res.json()
      if (data.name) profileName.value = data.name
    } else if (res.status >= 500) {
      const errData = await res.json().catch(() => ({}))
      const reqId = res.headers.get('X-Request-ID') || errData?.error?.requestId || ''
      const customErr = new Error(errData?.error?.message || 'Data profil lembaga tidak dapat dimuat dari server.')
      customErr.requestId = reqId
      throw customErr
    }
  } catch (e) {
    if (e.requestId) throw e
    // Abaikan jika network offline, profil nama tetap diambil dari cache lokal
  }
}

// Sinkronisasi Statistik Nyata dari Seluruh Sumber (LocalStorage & Backend)
const fetchDashboardStats = async () => {
  let teacherCount = 0
  let classCount = 0
  let mapelCount = 0
  let totalJam = 0

  // 1. Sinkron Guru dari guruKu_teachers
  const savedTeachers = localStorage.getItem('guruKu_teachers')
  if (savedTeachers) {
    try {
      const parsed = JSON.parse(savedTeachers)
      if (Array.isArray(parsed)) teacherCount = parsed.length
    } catch (e) {}
  }

  // 2. Sinkron Kelas dari guruKu_classes
  const savedClasses = localStorage.getItem('guruKu_classes')
  if (savedClasses) {
    try {
      const parsed = JSON.parse(savedClasses)
      if (Array.isArray(parsed)) classCount = parsed.length
    } catch (e) {}
  }

  // 3. Sinkron Mapel dari guruKu_mapel
  const savedMapel = localStorage.getItem('guruKu_mapel')
  if (savedMapel) {
    try {
      const parsed = JSON.parse(savedMapel)
      if (Array.isArray(parsed)) mapelCount = parsed.length
    } catch (e) {}
  }

  // 4. Sinkron Jam Mengajar dari guruKu_pengampu
  const savedPengampu = localStorage.getItem('guruKu_pengampu')
  if (savedPengampu) {
    try {
      const parsed = JSON.parse(savedPengampu)
      if (parsed.rows && Array.isArray(parsed.rows)) {
        parsed.rows.forEach(r => {
          if (r.hours && Array.isArray(r.hours)) {
            r.hours.forEach(h => {
              totalJam += Number(h) || 0
            })
          }
        })
      }
    } catch (e) {}
  }

  // Coba ambil dari Endpoint Terpadu Backend /api/v1/school/dashboard
  const schoolId = localStorage.getItem('school_id')
  if (schoolId) {
    try {
      const res = await fetch('/api/v1/school/dashboard', { 
        headers: { 'X-School-ID': schoolId },
        credentials: 'include'
      })
      if (res.ok) {
        const payload = await res.json()
        const d = payload.data
        if (d) {
          if (classCount === 0 && d.totalClasses > 0) classCount = d.totalClasses
          if (teacherCount === 0 && d.totalTeachers > 0) teacherCount = d.totalTeachers
          if (mapelCount === 0 && d.totalSubjects > 0) mapelCount = d.totalSubjects
          if (totalJam === 0 && d.totalTeachingHours > 0) totalJam = d.totalTeachingHours
          if (d.schoolName && !profileName.value) profileName.value = d.schoolName
        }
      } else if (res.status >= 500) {
        const errData = await res.json().catch(() => ({}))
        const reqId = res.headers.get('X-Request-ID') || errData?.error?.requestId || ''
        const customErr = new Error(errData?.error?.message || 'Data dashboard tidak dapat dimuat dari server.')
        customErr.requestId = reqId
        throw customErr
      }
    } catch (e) {
      if (e.requestId) throw e
      // Fallback lokal jika backend tidak terjangkau
    }
  }

  // Hitung Progres Keseluruhan secara Dinamis & Terstruktur (0 - 100%)
  let p = 0

  // 1. Validasi Lembaga (Bobot: 15%)
  const isLembagaValid = setupStore.isProfileComplete || Boolean(localStorage.getItem('guruKu_lembaga_valid') === 'true')
  if (isLembagaValid) p += 15

  // 2. Hari Pelaksanaan KBM (Bobot: 15%)
  const hasOperatingDays = setupStore.isOperatingDaysComplete || setupStore.activeOperatingDays.length > 0
  if (hasOperatingDays) p += 15

  // 3. Sesi & Waktu KBM (Bobot: 15%)
  const hasSesi = setupStore.isKbmSessionsComplete || setupStore.kbmOnlySessions.length > 0
  if (hasSesi) p += 15

  // 4. Daftar Kelas (Bobot: 15%)
  if (classCount > 0) p += 15

  // 5. Daftar Guru (Bobot: 15%)
  if (teacherCount > 0) p += 15

  // 6. Mata Pelajaran (Bobot: 15%)
  if (mapelCount > 0) p += 15

  // 7. Pengampu / Jam Mengajar (Bobot: 10%)
  if (totalJam > 0) p += 10

  rawStats.value = {
    totalGuru: teacherCount,
    totalKelas: classCount,
    totalMapel: mapelCount,
    jamMengajar: totalJam,
    progress: Math.min(p, 100)
  }

  // Mulai animasi naik perlahan dari 0 ke nilai target
  animateCountUp(rawStats.value, 1200)
  realtimeClient.syncProgress('Dashboard Overview')
}

// Pola State Management Dashboard: loading -> success/empty/error/offline
const loadDashboard = async () => {
  dashboardState.value = 'loading'
  errorMessage.value = ''
  errorRequestId.value = ''

  try {
    await setupStore.loadSchoolSetup()
    await fetchProfileName()
    if (setupStore.schoolProfile.schoolName) {
      profileName.value = setupStore.schoolProfile.schoolName
    }
    await fetchDashboardStats()

    if (rawStats.value.totalGuru === 0 && rawStats.value.totalKelas === 0 && rawStats.value.totalMapel === 0) {
      dashboardState.value = 'empty'
    } else {
      dashboardState.value = 'success'
    }
  } catch (err) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      dashboardState.value = 'offline'
      errorMessage.value = 'Mode offline aktif: memuat data lokal tersimpan.'
    } else {
      dashboardState.value = 'error'
      errorMessage.value = err?.message || 'Data dashboard tidak dapat dimuat.'
      errorRequestId.value = err?.requestId || ''
    }
  }
}

const activeUnsubs = []

onMounted(() => {
  loadDashboard()
  realtimeClient.connect('school_admin')

  // Listeners realtime lifecycle non-blocking
  const unsubStatus = realtimeClient.on('realtime:status', (st) => {
    if (st) {
      realtimeStatus.value = {
        state: st.state || 'disconnected',
        isRealtimeAvailable: st.isRealtimeAvailable !== false,
        mode: st.mode || 'none'
      }
    }
  })

  const unsubDashboard = realtimeClient.on('dashboard_update', (d) => {
    if (d?.data) {
      const s = d.data
      if (s.totalTeachers !== undefined) rawStats.value.totalGuru = s.totalTeachers
      if (s.totalClasses !== undefined) rawStats.value.totalKelas = s.totalClasses
      if (s.totalSubjects !== undefined) rawStats.value.totalMapel = s.totalSubjects
      if (s.totalTeachingHours !== undefined) rawStats.value.jamMengajar = s.totalTeachingHours
      animateCountUp(rawStats.value, 600)
    }
  })

  activeUnsubs.push(unsubStatus, unsubDashboard)
})

onUnmounted(() => {
  activeUnsubs.forEach(unsub => {
    if (typeof unsub === 'function') unsub()
  })
  activeUnsubs.length = 0
})

// Refresh stats saat user kembali ke Dashboard Utama dari menu lain
watch(() => route.path, (newPath) => {
  if (newPath === ROUTES.SCHOOL_ADMIN || newPath === '/admin-sekolah') {
    loadDashboard()
  }
})

const iconDb = "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
const iconClock = "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
const iconUsers = "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
const iconBook = "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
const iconCalendar = "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
const iconChart = "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
const iconBadge = "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"

const menuGroups = [
  {
    title: 'Master Data',
    items: [
      { title: 'Validasi Lembaga', icon: iconDb, path: ROUTES.VALIDASI_LEMBAGA },
      { title: 'Daftar Kelas', icon: iconUsers, path: ROUTES.DAFTAR_KELAS },
      { title: 'Daftar Guru', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', path: ROUTES.DAFTAR_GURU },
      { title: 'Sesi & Waktu KBM', icon: iconClock, path: ROUTES.SESI_KBM },
      { title: 'Mata Pelajaran', icon: iconBook, path: ROUTES.MATA_PELAJARAN },
    ]
  },
  {
    title: 'Distribusi Beban',
    items: [
      { title: 'Pengampu Mapel', icon: iconUsers, path: ROUTES.PENGAMPU },
      { title: 'Permintaan Jam Kosong', icon: iconCalendar, path: ROUTES.JAM_KOSONG },
      { title: 'Tugas Tambahan', icon: iconBadge, path: ROUTES.TUGAS_TAMBAHAN },
    ]
  },
  {
    title: 'Penjadwalan',
    items: [
      { title: 'Jadwal Guru', path: ROUTES.JADWAL_GURU, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
      { title: 'Jadwal Kelas', path: ROUTES.JADWAL_KELAS, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' }
    ]
  },
  {
    title: 'Analisis & Laporan',
    items: [
      { title: 'Analisis Sebaran Guru', icon: iconChart, path: ROUTES.ANALISIS_GURU },
      { title: 'Tunjangan Sertifikasi', icon: iconBadge, path: ROUTES.TUNJANGAN_SERTIFIKASI },
    ]
  },
  {
    title: 'Layanan & Bantuan',
    items: [
      { title: 'Pusat Bantuan & Aduan', path: ROUTES.PUSAT_BANTUAN, icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
    ]
  }
]

const showClientRenewModal = ref(false)
const clientPackages = ref(getStoredPackages())
const selectedClientPackage = ref(clientPackages.value.find(p => p.isPopular) || clientPackages.value[0])
const clientRenewNotes = ref('')
const isSubmittingRenewal = ref(false)

const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(angka || 0)
}

const openClientRenewModal = () => {
  clientPackages.value = getStoredPackages()
  selectedClientPackage.value = clientPackages.value.find(p => p.isPopular) || clientPackages.value[0]
  showClientRenewModal.value = true
}

const submitClientRenewal = async () => {
  if (!selectedClientPackage.value) return
  isSubmittingRenewal.value = true
  const schoolId = localStorage.getItem('school_id') || 'school-client-001'
  const schoolName = profileName.value || localStorage.getItem('school_name') || 'Admin Sekolah'

  try {
    const res = await fetch('/api/v1/billing/renew', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenant_id: schoolId,
        plan_id: selectedClientPackage.value.id,
        notes: clientRenewNotes.value || `Permintaan perpanjangan oleh ${schoolName}`
      })
    })

    // Simpan juga ke pending payments lokal
    const pendingList = JSON.parse(localStorage.getItem('guruKu_pending_payments') || '[]')
    const invNum = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-4)}`
    pendingList.unshift({
      id: Date.now(),
      tenant_id: schoolId,
      invoice: invNum,
      plan: selectedClientPackage.value.name,
      amount: selectedClientPackage.value.price,
      method: 'Virtual Account Otomatis',
      senderName: schoolName,
      bankName: 'BCA Virtual Account',
      notes: clientRenewNotes.value || 'Pengajuan perpanjangan klien',
      status: 'Menunggu Pembayaran',
      formattedDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    })
    localStorage.setItem('guruKu_pending_payments', JSON.stringify(pendingList))

    alert(`Faktur perpanjangan untuk "${selectedClientPackage.value.name}" telah berhasil diajukan dengan status 'Menunggu Pembayaran'! Data telah diteruskan ke halaman Tagihan & Keuangan Super Admin.`)
    showClientRenewModal.value = false
    clientRenewNotes.value = ''
  } catch (err) {
    alert('Pengajuan perpanjangan berhasil dicatat secara lokal!')
    showClientRenewModal.value = false
  } finally {
    isSubmittingRenewal.value = false
  }
}

const handleLogout = async () => {
  try {
    // 1. Putus koneksi WebSocket/SSE secara permanen dan cegah auto-reconnect
    realtimeClient.disconnect(true)
    // 2. Bersihkan session HttpOnly di backend & store pinia
    await authStore.logout()
  } catch (_) {}
  router.push('/')
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}
</style>
