<template>
  <div class="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans relative text-slate-800">
    
    <!-- Mobile Overlay Backdrop -->
    <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 bg-slate-950/60 z-30 md:hidden backdrop-blur-xs transition-opacity"></div>

    <!-- Sidebar Kiri (Dark Navy Sesuai Referensi Desain ARUS LAB / GuruKu) -->
    <aside 
      :class="[isSidebarOpen ? 'translate-x-0' : '-translate-x-full', 'md:translate-x-0']"
      class="w-64 bg-[#0B132B] text-slate-300 flex flex-col h-full shadow-2xl md:shadow-none z-40 flex-shrink-0 fixed md:relative transition-transform duration-300 ease-in-out border-r border-slate-800/80 select-none">
      
      <!-- Logo Header -->
      <div class="p-5 border-b border-slate-800/80 bg-[#0B132B] flex justify-between items-center">
        <AppLogo size="sm" :textDark="true" subtitle="ADMIN SEKOLAH" />
        <!-- Close button mobile -->
        <button @click="isSidebarOpen = false" class="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- Navigasi Menu Sesuai Referensi -->
      <nav class="flex-1 overflow-y-auto px-3.5 py-4 custom-scrollbar-dark space-y-4">
        <!-- Dashboard Utama Link (Active indicator pill) -->
        <router-link :to="ROUTES.SCHOOL_ADMIN" 
          @click="isSidebarOpen = false"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-semibold"
          :class="[$route.path === ROUTES.SCHOOL_ADMIN || $route.path === '/admin-sekolah' 
            ? 'bg-blue-600 text-white shadow-sm' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800/60']">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          <span>Dashboard</span>
        </router-link>

        <div v-for="group in menuGroups" :key="group.title" class="space-y-1">
          <p class="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{{ group.title }}</p>
          <router-link v-for="item in group.items" :key="item.path" :to="item.path"
            @click="isSidebarOpen = false"
            class="flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-medium"
            :class="[$route.path === item.path 
              ? 'bg-blue-600 text-white font-semibold shadow-sm' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60']">
            <svg class="w-4 h-4 flex-shrink-0" :class="[$route.path === item.path ? 'text-white' : 'text-slate-400']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon"></path>
            </svg>
            <span class="truncate">{{ item.title }}</span>
          </router-link>
        </div>
      </nav>

      <!-- Footer Sidebar: Lihat Jadwal & Keluar (Persis Referensi) -->
      <div class="p-3.5 border-t border-slate-800/80 bg-[#080E20] space-y-1">
        <router-link :to="ROUTES.JADWAL_KELAS" 
          @click="isSidebarOpen = false"
          class="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors">
          <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
          </svg>
          <span>Lihat Jadwal</span>
        </router-link>
        <button @click="handleLogout" 
          class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-left">
          <svg class="w-4 h-4 text-slate-400 group-hover:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          <span>Keluar</span>
        </button>
      </div>
    </aside>

    <!-- Konten Utama -->
    <main class="flex-1 overflow-y-auto bg-[#F8FAFC] relative custom-scrollbar">
      
      <!-- Mobile Header Bar -->
      <div class="md:hidden flex items-center justify-between p-4 bg-[#0B132B] border-b border-slate-800 sticky top-0 z-20">
        <AppLogo size="xs" :textDark="true" :showText="true" subtitle="ADMIN" />
        <button @click="isSidebarOpen = true" class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </div>

      <!-- Halaman Root Dashboard Sesuai Gambar Referensi Pengguna -->
      <div v-if="$route.path === ROUTES.SCHOOL_ADMIN || $route.path === '/admin-sekolah'" class="p-4 md:p-8 max-w-[1440px] mx-auto space-y-6">
        
        <!-- Header Bar: Judul Dashboard, Tanggal & Tombol Aksi (Persis Gambar 1) -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
            <p class="text-xs md:text-sm text-slate-400 font-medium mt-0.5 capitalize">{{ currentDateFormatted }}</p>
          </div>
          
          <div class="flex items-center gap-2.5 flex-wrap">
            <button @click="showInvoiceModal = true" 
              class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer">
              <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              <span>+ Buat invoice</span>
            </button>
            <router-link :to="ROUTES.KEUANGAN_ASET"
              class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              <span>Antrean cetak (0)</span>
            </router-link>
            <button @click="showWizard = true" 
              class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              <span>Susun Jadwal</span>
            </button>
          </div>
        </div>

        <!-- Mode View Switcher: Finansial & Bisnis (Default) vs Operasional KBM -->
        <div class="flex items-center gap-2">
          <button @click="activeDashboardMode = 'business'" 
            class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
            :class="activeDashboardMode === 'business' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200'">
            Finansial & Bisnis
          </button>
          <button @click="activeDashboardMode = 'academic'" 
            class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
            :class="activeDashboardMode === 'academic' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200'">
            Operasional Sekolah ({{ animatedStats.totalGuru }} Guru, {{ animatedStats.totalKelas }} Rombel)
          </button>
        </div>

        <!-- 4 KARTU STATISTIK: MODE BISNIS & KEUANGAN (PERSIS GAMBAR 1) -->
        <div v-if="activeDashboardMode === 'business'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          
          <!-- Card 1: PENJUALAN BULAN INI -->
          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Penjualan Bulan Ini</p>
            <div class="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {{ formatRupiah(financialSummary.penjualanBulanIni) }}
            </div>
            <p class="text-[11px] text-slate-400 font-medium mt-1 truncate">
              semua channel • 1 pesanan web
            </p>
          </div>

          <!-- Card 2: LABA KOTOR BULAN INI -->
          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Laba Kotor Bulan Ini</p>
            <div class="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {{ formatRupiah(financialSummary.labaKotorBulanIni) }}
            </div>
            <p class="text-[11px] text-slate-400 font-medium mt-1 truncate">
              setelah HPP {{ formatRupiah(financialSummary.pengeluaranBulanIni) }} & potongan Rp 0
            </p>
          </div>

          <!-- Card 3: SALDO KAS -->
          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Saldo Kas</p>
            <div class="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {{ formatRupiah(financialSummary.saldoKas) }}
            </div>
            <p class="text-[11px] text-slate-400 font-medium mt-1 truncate">
              belanja bulan ini Rp 0
            </p>
          </div>

          <!-- Card 4: PENGELUARAN BULAN INI / ANTREAN MESIN -->
          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pengeluaran Bulan Ini</p>
            <div class="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {{ formatRupiah(financialSummary.pengeluaranBulanIni) }}
            </div>
            <p class="text-[11px] text-slate-400 font-medium mt-1 truncate">
              0 pesanan menunggu / operasional HPP
            </p>
          </div>

        </div>

        <!-- 4 KARTU STATISTIK: MODE OPERASIONAL SEKOLAH -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Guru Terdaftar</p>
            <div class="text-2xl font-black text-slate-900 tracking-tight">
              {{ animatedStats.totalGuru }} <span class="text-base font-semibold text-slate-500">Guru</span>
            </div>
            <p class="text-[11px] text-slate-400 font-medium mt-1 truncate">{{ rawStats.totalGuru }} staf aktif terdata</p>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Rombel Kelas</p>
            <div class="text-2xl font-black text-slate-900 tracking-tight">
              {{ animatedStats.totalKelas }} <span class="text-base font-semibold text-slate-500">Rombel</span>
            </div>
            <p class="text-[11px] text-slate-400 font-medium mt-1 truncate">{{ rawStats.totalKelas }} rombongan belajar aktif</p>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Mata Pelajaran</p>
            <div class="text-2xl font-black text-slate-900 tracking-tight">
              {{ animatedStats.totalMapel }} <span class="text-base font-semibold text-slate-500">Mapel</span>
            </div>
            <p class="text-[11px] text-slate-400 font-medium mt-1 truncate">{{ rawStats.totalMapel }} kurikulum terdaftar</p>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Jam Mengajar</p>
            <div class="text-2xl font-black text-slate-900 tracking-tight">
              {{ animatedStats.jamMengajar }} <span class="text-base font-semibold text-slate-500">JP</span>
            </div>
            <p class="text-[11px] text-slate-400 font-medium mt-1 truncate">{{ rawStats.jamMengajar }} jam teralokasi / minggu</p>
          </div>
        </div>

        <!-- Bagian Tengah: Chart Omzet Penjualan (Kiri) & Status Pesanan (Kanan) - PERSIS GAMBAR 2 -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          <!-- Chart Penjualan vs Belanja • 12 bulan (Kiri 65% ~ 8 cols) -->
          <div class="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-xs flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-bold text-slate-900">
                  {{ activeDashboardMode === 'business' ? 'Penjualan vs belanja · 12 bulan' : 'Distribusi Jam Mengajar · 12 bulan' }}
                </h3>
                <!-- Legend dots persis referensi Gambar 2 -->
                <div class="flex items-center gap-4 mt-2 text-[11px] font-medium text-slate-500">
                  <span class="flex items-center gap-1.5">
                    <span class="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                    {{ activeDashboardMode === 'business' ? 'Penjualan' : 'Jam Terjadwal' }}
                  </span>
                  <span class="flex items-center gap-1.5">
                    <span class="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span>
                    {{ activeDashboardMode === 'business' ? 'Belanja' : 'Kapasitas Normal' }}
                  </span>
                </div>
              </div>

              <!-- Quick Link to Keuangan / Kalkulator HPP -->
              <router-link :to="ROUTES.KALKULATOR_HPP" class="text-xs font-semibold text-blue-600 hover:text-blue-700 hidden sm:flex items-center gap-1">
                <span>Kalkulator HPP</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
              </router-link>
            </div>

            <!-- Chart Area dengan Grid Lines & 12 Bar Bulan Persis Gambar 2 -->
            <div class="mt-6">
              <div class="relative h-56 flex">
                <!-- Y-Axis Ticks (300rb, 225rb, 150rb, 75rb, 0) -->
                <div class="w-14 h-full flex flex-col justify-between text-[11px] font-medium text-slate-400 pr-2 text-right select-none">
                  <span>{{ activeDashboardMode === 'business' ? '300rb' : '300 JP' }}</span>
                  <span>{{ activeDashboardMode === 'business' ? '225rb' : '225 JP' }}</span>
                  <span>{{ activeDashboardMode === 'business' ? '150rb' : '150 JP' }}</span>
                  <span>{{ activeDashboardMode === 'business' ? '75rb' : '75 JP' }}</span>
                  <span>0</span>
                </div>

                <!-- Grid & Bars Container -->
                <div class="flex-1 h-full relative flex flex-col justify-between">
                  <!-- 5 Horizontal Grid Lines -->
                  <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div class="border-b border-slate-100 w-full h-0"></div>
                    <div class="border-b border-slate-100 w-full h-0"></div>
                    <div class="border-b border-slate-100 w-full h-0"></div>
                    <div class="border-b border-slate-100 w-full h-0"></div>
                    <div class="border-b border-slate-200 w-full h-0"></div>
                  </div>

                  <!-- 12 Columns (Des - Nov) -->
                  <div class="absolute inset-0 flex items-end justify-between px-2 sm:px-4 z-10">
                    <div v-for="(m, idx) in chartMonths" :key="m" 
                      class="flex-1 flex flex-col items-center justify-end h-full group relative">
                      
                      <!-- Tooltip saat hover -->
                      <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md pointer-events-none whitespace-nowrap z-20">
                        <span v-if="activeDashboardMode === 'business'">
                          {{ m }}: {{ idx === 11 ? 'Penjualan Rp 254.205 (Laba Bersih Rp 150.000)' : 'Tidak ada transaksi' }}
                        </span>
                        <span v-else>
                          {{ m }}: {{ idx === 11 ? (rawStats.jamMengajar > 0 ? rawStats.jamMengajar + ' JP' : '180 JP Terjadwal') : 'Kapasitas Normal' }}
                        </span>
                      </div>

                      <!-- The Bar: Bulan Nov memiliki bar biru tegak menonjol PERSIS Gambar 2 -->
                      <div v-if="idx === 11" 
                        class="w-3.5 sm:w-5 md:w-6 bg-blue-600 rounded-t-sm transition-all duration-700 ease-out shadow-xs"
                        :style="`height: ${activeDashboardMode === 'business' ? omzetBarHeight : novBarHeight}%`">
                      </div>
                      <div v-else class="w-1.5 h-1 rounded-full bg-slate-200 mb-0.5 opacity-60"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- X-Axis Labels (12 Bulan) -->
              <div class="flex pl-14 pr-2 sm:pr-4 pt-3 justify-between text-[11px] font-medium text-slate-400 select-none">
                <span v-for="m in chartMonths" :key="m" class="flex-1 text-center truncate">
                  {{ m }}
                </span>
              </div>
            </div>
          </div>

          <!-- Status Pesanan (Kanan ~ 4 cols, Sesuai Referensi Gambar) -->
          <div class="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-xs flex flex-col justify-between">
            <h3 class="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">Status pesanan</h3>
            
            <div class="space-y-3 py-2 text-xs">
              
              <!-- 1. Menunggu pembayaran -->
              <div class="flex items-center justify-between text-slate-600">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"></span>
                  <span>Menunggu pembayaran</span>
                </div>
                <span class="font-bold text-slate-700 font-mono">0</span>
              </div>

              <!-- 2. Dibayar - antre produksi -->
              <div class="flex items-center justify-between text-slate-600">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-sky-400 flex-shrink-0"></span>
                  <span>Dibayar - antre produksi</span>
                </div>
                <span class="font-bold text-slate-700 font-mono">0</span>
              </div>

              <!-- 3. Sedang dicetak (Dark Rounded Pill Highlight Persis Referensi Gambar) -->
              <div class="bg-slate-900 text-white rounded-xl px-3 py-2 flex items-center justify-between shadow-xs">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0"></span>
                  <span class="font-semibold text-xs">Sedang dicetak</span>
                </div>
                <span class="font-bold text-white font-mono text-xs">0</span>
              </div>

              <!-- 4. Quality control -->
              <div class="flex items-center justify-between text-slate-600">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0"></span>
                  <span>Quality control</span>
                </div>
                <span class="font-bold text-slate-700 font-mono">0</span>
              </div>

              <!-- 5. Dikirim -->
              <div class="flex items-center justify-between text-slate-600">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                  <span>Dikirim</span>
                </div>
                <span class="font-bold text-slate-700 font-mono">0</span>
              </div>

              <!-- 6. Selesai (Angka 1 Sesuai Referensi Gambar) -->
              <div class="flex items-center justify-between text-slate-600">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                  <span>Selesai</span>
                </div>
                <span class="font-bold text-emerald-600 font-mono">1</span>
              </div>

              <!-- 7. Dibatalkan -->
              <div class="flex items-center justify-between text-slate-600">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0"></span>
                  <span>Dibatalkan</span>
                </div>
                <span class="font-bold text-slate-700 font-mono">0</span>
              </div>

            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Keuangan Terverifikasi</span>
              <router-link :to="ROUTES.KEUANGAN_ASET" class="font-bold text-blue-600 hover:underline">Buka Kas & Aset</router-link>
            </div>
          </div>

        </div>

        <!-- Bagian Bawah: Antrean Produksi (Kiri) & Pesanan Terbaru (Kanan) - PERSIS GAMBAR REFERENSI -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          <!-- Panel Kiri: Antrean produksi (Persis Gambar) -->
          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-xs flex flex-col justify-between min-h-[140px]">
            <div>
              <h3 class="text-sm font-bold text-slate-900 mb-2">Antrean produksi</h3>
              <p class="text-xs text-slate-400 font-medium">Tidak ada pesanan di antrean</p>
            </div>
            <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Status Jalur Cetak KBM</span>
              <span class="text-emerald-600 font-bold">Siap Beroperasi</span>
            </div>
          </div>

          <!-- Panel Kanan: Pesanan terbaru (Persis Gambar: Klien / Rekan Istimewa, Rp 254.205, • Selesai) -->
          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-xs flex flex-col justify-between min-h-[140px]">
            <div>
              <h3 class="text-sm font-bold text-slate-900 mb-3">Pesanan terbaru</h3>
              <div class="space-y-3 text-xs">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-semibold text-slate-800">Klien / Rekan Istimewa</p>
                    <p class="text-[11px] text-slate-400 mt-0.5">2 Nov, 12.00</p>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-slate-800 font-mono">{{ formatRupiah(financialSummary.penjualanBulanIni) }}</p>
                    <span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5 border border-emerald-100">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Selesai
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Transaksi Terverifikasi</span>
              <span class="text-slate-500 font-medium">1 Transaksi Selesai</span>
            </div>
          </div>

        </div>

      </div>
      
      <!-- Halaman dinamis child router akan dimuat di sini -->
      <router-view v-else></router-view>
      
      <!-- MODAL BUAT INVOICE CEPAT -->
      <div v-if="showInvoiceModal" class="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-slate-900">Buat Invoice Baru</h3>
            <button @click="showInvoiceModal = false" class="text-slate-400 hover:text-slate-700">✕</button>
          </div>
          
          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Nama Klien / Rekan</label>
              <input v-model="invoiceForm.customerName" type="text" 
                class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Deskripsi Layanan / Item</label>
              <input v-model="invoiceForm.itemDescription" type="text" 
                class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Total Tagihan (Rp)</label>
              <input v-model.number="invoiceForm.amount" type="number" 
                class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Status Pembayaran</label>
              <select v-model="invoiceForm.status" 
                class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="Lunas">Lunas (Selesai)</option>
                <option value="Menunggu">Menunggu Pembayaran</option>
              </select>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
            <button @click="showInvoiceModal = false" class="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800">Batal</button>
            <button @click="saveInvoice" class="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs">Terbitkan Invoice</button>
          </div>
        </div>
      </div>

      <MagicWizard :show="showWizard" @close="showWizard = false" />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppLogo from '../components/AppLogo.vue'
import MagicWizard from '../components/MagicWizard.vue'
import { ROUTES } from '../config/routePaths.js'

const router = useRouter()
const route = useRoute()
const profileName = ref('')
const showWizard = ref(false)
const showInvoiceModal = ref(false)
const isSidebarOpen = ref(false)
const activeDashboardMode = ref('business') // 'business' (persis gambar referensi) atau 'academic'

// Invoice Form State
const invoiceForm = ref({
  customerName: 'Klien / Rekan Istimewa',
  itemDescription: 'Paket Layanan Penjadwalan & Lisensi GuruKu',
  amount: 254205,
  status: 'Lunas'
})

// Data Finansial & Bisnis (Nilai default persis gambar referensi)
const financialSummary = ref({
  penjualanBulanIni: 254205,
  pengeluaranBulanIni: 104205,
  labaKotorBulanIni: 150000,
  saldoKas: 8365958
})

const loadFinancialSummary = () => {
  const saved = localStorage.getItem('guruKu_financial_summary')
  if (saved) {
    try {
      financialSummary.value = { ...financialSummary.value, ...JSON.parse(saved) }
    } catch (e) {}
  }
}

const saveInvoice = () => {
  const amt = Number(invoiceForm.value.amount) || 254205
  financialSummary.value.penjualanBulanIni = amt
  financialSummary.value.labaKotorBulanIni = Math.max(amt - financialSummary.value.pengeluaranBulanIni, 0)
  localStorage.setItem('guruKu_financial_summary', JSON.stringify(financialSummary.value))

  // Catat transaksi di buku kas
  const tx = {
    id: Date.now(),
    date: '11 Nov 2026',
    ref: `INV-202611-${Math.floor(Math.random() * 900) + 100}`,
    category: 'Penjualan Invoice',
    description: `${invoiceForm.value.customerName} - ${invoiceForm.value.itemDescription}`,
    type: 'in',
    amount: amt
  }
  let existing = []
  try {
    existing = JSON.parse(localStorage.getItem('guruKu_finance_transactions') || '[]')
  } catch (e) {}
  existing.unshift(tx)
  localStorage.setItem('guruKu_finance_transactions', JSON.stringify(existing))

  showInvoiceModal.value = false
}

// Nilai Riil Database / LocalStorage Akademik
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

// Daftar Bulan untuk Chart 12 Bulan (Persis Referensi)
const chartMonths = ['Des', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov']

// Tinggi Bar Omzet Bulan Nov (Skala 300rb sebagai 100%) - Persis Gambar 2 (~85% height)
const omzetBarHeight = computed(() => {
  const val = financialSummary.value.penjualanBulanIni || 254205
  const pct = Math.min(Math.round((val / 300000) * 100), 86)
  return Math.max(pct, 30)
})

// Tinggi Bar Jam Mengajar (Skala 300 JP sebagai 100%)
const novBarHeight = computed(() => {
  const hours = animatedStats.value.jamMengajar || 180
  const pct = Math.min(Math.round((hours / 300) * 100), 85)
  return Math.max(pct, 25)
})

// Format Tanggal Bahasa Indonesia untuk Header Dashboard
const currentDateFormatted = computed(() => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const now = new Date()
  const dayName = days[now.getDay()]
  const date = now.getDate()
  const monthName = months[now.getMonth()]
  const year = now.getFullYear()
  return `${dayName}, ${date} ${monthName} ${year}`
})

const formatRupiah = (val) => {
  return 'Rp ' + Number(val || 0).toLocaleString('id-ID')
}

// Fungsi Animasi Count-Up Halus (0 -> Nilai Sebenarnya)
const animateCountUp = (target, durationMs = 1000) => {
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
  } catch (e) {}
}

// Sinkronisasi Statistik Nyata dari Seluruh Sumber
const fetchDashboardStats = async () => {
  let teacherCount = 0
  let classCount = 0
  let mapelCount = 0
  let totalJam = 0

  const savedTeachers = localStorage.getItem('guruKu_teachers')
  if (savedTeachers) {
    try {
      const parsed = JSON.parse(savedTeachers)
      if (Array.isArray(parsed)) teacherCount = parsed.length
    } catch (e) {}
  }

  const savedClasses = localStorage.getItem('guruKu_classes')
  if (savedClasses) {
    try {
      const parsed = JSON.parse(savedClasses)
      if (Array.isArray(parsed)) classCount = parsed.length
    } catch (e) {}
  }

  const savedMapel = localStorage.getItem('guruKu_mapel')
  if (savedMapel) {
    try {
      const parsed = JSON.parse(savedMapel)
      if (Array.isArray(parsed)) mapelCount = parsed.length
    } catch (e) {}
  }

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

  let p = 0
  if (classCount > 0) p += 12
  if (teacherCount > 0) p += 12
  if (mapelCount > 0) p += 11
  if (totalJam > 0) p += 25
  const savedJamKosong = localStorage.getItem('guruKu_jam_kosong') || localStorage.getItem('jamKosongData')
  if (savedJamKosong) p += 10
  const savedJadwal = localStorage.getItem('guruKu_jadwal')
  if (savedJadwal) p += 30

  rawStats.value = {
    totalGuru: teacherCount,
    totalKelas: classCount,
    totalMapel: mapelCount,
    jamMengajar: totalJam,
    progress: Math.min(p, 100)
  }

  animateCountUp(rawStats.value, 1000)
}

onMounted(() => {
  fetchProfileName()
  fetchDashboardStats()
  loadFinancialSummary()
})

watch(() => route.path, (newPath) => {
  if (newPath === ROUTES.SCHOOL_ADMIN || newPath === '/admin-sekolah') {
    fetchProfileName()
    fetchDashboardStats()
    loadFinancialSummary()
  }
})

// Definisi SVG Icons
const iconDb = "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
const iconClock = "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
const iconUsers = "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
const iconBook = "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
const iconCalendar = "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
const iconChart = "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
const iconBadge = "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z"
const iconWallet = "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
const iconCalculator = "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"

const menuGroups = [
  {
    title: 'Keuangan & Bisnis',
    items: [
      { title: 'Keuangan & Aset', icon: iconWallet, path: ROUTES.KEUANGAN_ASET },
      { title: 'Kalkulator HPP', icon: iconCalculator, path: ROUTES.KALKULATOR_HPP }
    ]
  },
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

.custom-scrollbar-dark::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar-dark::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar-dark::-webkit-scrollbar-thumb {
  background-color: #1e293b;
  border-radius: 20px;
}
.custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
  background-color: #334155;
}
</style>
