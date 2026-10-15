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
          <img src="../assets/logo.png" alt="Logo" class="w-12 h-12 object-contain rounded-xl shadow-sm">
          <div>
            <h1 class="text-gray-900 leading-tight" style="font-family: 'Permanent Marker', cursive; font-size: 1.6rem; margin-bottom: -4px;">GuruKu</h1>
            <p class="text-xs text-blue-600 font-bold tracking-wide uppercase">Admin Sekolah</p>
          </div>
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
           <img src="../assets/logo.png" alt="Logo" class="w-8 h-8 object-contain">
           <span class="text-gray-900" style="font-family: 'Permanent Marker', cursive; font-size: 1.3rem;">GuruKu</span>
        </div>
        <button @click="isSidebarOpen = true" class="p-2 text-gray-600 rounded-lg hover:bg-gray-100 border border-gray-200">
           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </div>

      <!-- Hanya tampil jika di root dashboard -->
      <div v-if="$route.path === ROUTES.SCHOOL_ADMIN || $route.path === '/admin-sekolah'" class="p-4 md:p-8 max-w-[1400px] mx-auto animate-fade-in-up">
        
        <!-- Banner Modern Premium dengan Sapaan Dinamis -->
        <div class="bg-blue-900 rounded-3xl p-6 md:p-8 mb-8 shadow-xl shadow-blue-900/20 relative overflow-hidden text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div class="absolute inset-0 bg-[url('../assets/banner-bg.png')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-transparent"></div>
          
          <div class="relative z-10 w-full md:w-3/4">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 border backdrop-blur-md"
              :class="isMasterDataComplete ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40' : 'bg-amber-500/20 text-amber-200 border-amber-400/40'">
              <span class="w-2 h-2 rounded-full animate-ping" :class="isMasterDataComplete ? 'bg-emerald-400' : 'bg-amber-400'"></span>
              <span>{{ isMasterDataComplete ? 'Master Data Lengkap' : 'Master Data Belum Lengkap' }}</span>
            </div>

            <h2 class="text-2xl md:text-3xl font-black mb-2 drop-shadow-md">
              Selamat Datang di Workspace Anda, <span class="text-blue-200">{{ profileName || 'Admin Sekolah' }}</span>
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
            </div>
          </div>
        </div>

        <!-- Statistik Utama dengan Animasi Count-Up Perlahan -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <!-- Card Total Guru -->
          <router-link :to="ROUTES.DAFTAR_GURU" class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 group block cursor-pointer">
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
          <router-link :to="ROUTES.DAFTAR_KELAS" class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 group block cursor-pointer">
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
          <router-link :to="ROUTES.MATA_PELAJARAN" class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 group block cursor-pointer">
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
          <router-link :to="ROUTES.PENGAMPU" class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-3xl shadow-sm border border-blue-100 hover:shadow-lg transition-all hover:-translate-y-1 group relative overflow-hidden block cursor-pointer">
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
              <p class="text-sm text-gray-500 mt-1 font-medium">Ikuti urutan alur cerdas ini untuk menghasilkan jadwal mengajar yang presisi dan bebas bentrok.</p>
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

              <router-link :to="ROUTES.JADWAL_KELAS" class="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 transition-colors text-center block">
                Lihat Jadwal Kelas
              </router-link>
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

              <!-- Checklist Status -->
              <div class="grid grid-cols-2 gap-3 text-xs font-semibold">
                <div class="flex items-center gap-2.5 p-2.5 rounded-xl border transition-colors"
                  :class="rawStats.totalKelas > 0 ? 'bg-emerald-50/40 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-500'">
                  <div class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    :class="rawStats.totalKelas > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'">
                    <svg v-if="rawStats.totalKelas > 0" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                    <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <span>Rombel Kelas ({{ rawStats.totalKelas }})</span>
                </div>

                <div class="flex items-center gap-2.5 p-2.5 rounded-xl border transition-colors"
                  :class="rawStats.totalGuru > 0 ? 'bg-emerald-50/40 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-500'">
                  <div class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    :class="rawStats.totalGuru > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'">
                    <svg v-if="rawStats.totalGuru > 0" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                    <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <span>Staf Guru ({{ rawStats.totalGuru }})</span>
                </div>

                <div class="flex items-center gap-2.5 p-2.5 rounded-xl border transition-colors"
                  :class="rawStats.totalMapel > 0 ? 'bg-emerald-50/40 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-500'">
                  <div class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    :class="rawStats.totalMapel > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'">
                    <svg v-if="rawStats.totalMapel > 0" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                    <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <span>Mata Pelajaran ({{ rawStats.totalMapel }})</span>
                </div>

                <div class="flex items-center gap-2.5 p-2.5 rounded-xl border transition-colors"
                  :class="rawStats.jamMengajar > 0 ? 'bg-emerald-50/40 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-500'">
                  <div class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    :class="rawStats.jamMengajar > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'">
                    <svg v-if="rawStats.jamMengajar > 0" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                    <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <span>Jam Pengampu ({{ rawStats.jamMengajar }} JP)</span>
                </div>
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
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
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
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MagicWizard from '../components/MagicWizard.vue'
import { ROUTES } from '../config/routePaths.js'

const router = useRouter()
const route = useRoute()
const profileName = ref('')
const showWizard = ref(false)
const isSidebarOpen = ref(false)

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
const isMasterDataComplete = computed(() => {
  return rawStats.value.totalGuru > 0 && rawStats.value.totalKelas > 0 && rawStats.value.totalMapel > 0
})

// Sapaan Ramah & Dinamis di Banner
const dynamicGreeting = computed(() => {
  if (!isMasterDataComplete.value) {
    return 'Sistem Penjadwalan Cerdas. Lengkapi master data (Kelas, Guru, & Mapel) untuk memulai penyusunan jadwal sekolah.'
  }

  const hour = new Date().getHours()
  let greetingTime = 'Semangat pagi'
  if (hour >= 11 && hour < 15) greetingTime = 'Semangat siang'
  else if (hour >= 15 && hour < 18) greetingTime = 'Semangat sore'
  else if (hour >= 18 || hour < 5) greetingTime = 'Semangat malam'

  return `${greetingTime} untuk memulai kerja kita! Seluruh master data telah siap dan tersinkronisasi untuk penyusunan jadwal sekolah yang optimal.`
})

// Rekomendasi Cerdas untuk Asisten Kesiapan
const smartRecommendation = computed(() => {
  if (rawStats.value.totalKelas === 0) {
    return {
      title: 'Langkah Pertama: Daftarkan Rombongan Belajar',
      desc: 'Sekolah belum memiliki data kelas. Silakan tambahkan nama kelas atau unduh template Excel di menu Daftar Kelas.',
      actionLabel: 'Isi Daftar Kelas',
      actionRoute: ROUTES.DAFTAR_KELAS
    }
  }
  if (rawStats.value.totalGuru === 0) {
    return {
      title: 'Langkah Kedua: Daftarkan Dewan Guru',
      desc: 'Belum ada guru yang terdaftar. Masukkan data guru pengajar beserta kode uniknya di menu Daftar Guru.',
      actionLabel: 'Isi Daftar Guru',
      actionRoute: ROUTES.DAFTAR_GURU
    }
  }
  if (rawStats.value.totalMapel === 0) {
    return {
      title: 'Langkah Ketiga: Lengkapi Mata Pelajaran',
      desc: 'Masukkan daftar mata pelajaran kurikulum sekolah Anda di menu Mata Pelajaran.',
      actionLabel: 'Isi Mata Pelajaran',
      actionRoute: ROUTES.MATA_PELAJARAN
    }
  }
  if (rawStats.value.jamMengajar === 0) {
    return {
      title: 'Master Data Lengkap! Distribusikan Jam Guru',
      desc: 'Semua kelas, guru, dan mapel sudah siap. Sekarang hubungkan guru ke mata pelajaran dan kelasnya di menu Distribusi Pengampu.',
      actionLabel: 'Atur Pengampu Mapel',
      actionRoute: ROUTES.PENGAMPU
    }
  }
  return {
    title: 'Semua Data Siap! Terbitkan Jadwal',
    desc: 'Distribusi jam telah terpetakan. Anda dapat langsung melihat matriks jadwal kelas dan jadwal guru.',
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
      headers: { 'X-School-ID': schoolId }
    })
    if (res.ok) {
      const data = await res.json()
      if (data.name) profileName.value = data.name
    }
  } catch (e) {
    // ignore
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

  // Fallback API jika ada data dari backend
  const schoolId = localStorage.getItem('school_id')
  if (schoolId) {
    try {
      const pengampuRes = await fetch('/api/v1/school/pengampu', { headers: { 'X-School-ID': schoolId } })
      if (pengampuRes.ok) {
        const data = await pengampuRes.json()
        if (data.classes && classCount === 0) classCount = data.classes.length
        if (data.rows) {
          if (teacherCount === 0) teacherCount = data.rows.length
          if (totalJam === 0) {
            data.rows.forEach(r => {
              if (r.hours) r.hours.forEach(h => totalJam += Number(h) || 0)
            })
          }
        }
      }
    } catch (e) {}
  }

  // Hitung Progres Keseluruhan secara Cerdas (0 - 100%)
  let p = 0
  // Master data: bobot 35%
  if (classCount > 0) p += 12
  if (teacherCount > 0) p += 12
  if (mapelCount > 0) p += 11

  // Distribusi beban: bobot 35%
  if (totalJam > 0) p += 25
  const savedJamKosong = localStorage.getItem('guruKu_jam_kosong') || localStorage.getItem('jamKosongData')
  if (savedJamKosong) p += 10

  // Penjadwalan: bobot 30%
  const savedJadwal = localStorage.getItem('guruKu_jadwal')
  if (savedJadwal) p += 30

  rawStats.value = {
    totalGuru: teacherCount,
    totalKelas: classCount,
    totalMapel: mapelCount,
    jamMengajar: totalJam,
    progress: Math.min(p, 100)
  }

  // Mulai animasi naik perlahan dari 0 ke nilai target
  animateCountUp(rawStats.value, 1200)
}

onMounted(() => {
  fetchProfileName()
  fetchDashboardStats()
})

// Refresh stats saat user kembali ke Dashboard Utama dari menu lain
watch(() => route.path, (newPath) => {
  if (newPath === ROUTES.SCHOOL_ADMIN || newPath === '/admin-sekolah') {
    fetchProfileName()
    fetchDashboardStats()
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

const handleLogout = () => {
  localStorage.clear()
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
