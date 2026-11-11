<template>
  <div class="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans relative text-slate-800">
    
    <!-- Mobile Overlay Backdrop -->
    <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 bg-slate-950/60 z-30 md:hidden backdrop-blur-xs transition-opacity"></div>

    <!-- Sidebar Kiri (Dark Navy Sesuai Gambar Referensi) -->
    <aside 
      :class="[isSidebarOpen ? 'translate-x-0' : '-translate-x-full', 'md:translate-x-0']"
      class="w-60 bg-[#0B132B] text-slate-300 flex flex-col h-full shadow-2xl md:shadow-none z-40 flex-shrink-0 fixed md:relative transition-transform duration-300 ease-in-out border-r border-slate-800/80 select-none">
      
      <!-- Logo Header -->
      <div class="px-5 py-5 border-b border-slate-800/80 bg-[#0B132B] flex justify-between items-center">
        <AppLogo size="sm" :textDark="true" subtitle="ADMIN" />
        <!-- Close button mobile -->
        <button @click="isSidebarOpen = false" class="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- Navigasi Menu Persis Gambar Referensi -->
      <nav class="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar-dark space-y-1">
        
        <!-- 1. Dashboard (Active Pill) -->
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

        <!-- 2. Pesanan -->
        <router-link :to="ROUTES.PESANAN" 
          @click="isSidebarOpen = false"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-medium"
          :class="[$route.path === ROUTES.PESANAN 
            ? 'bg-blue-600 text-white shadow-sm' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800/60']">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <span>Pesanan</span>
        </router-link>

        <!-- 3. Custom request -->
        <router-link :to="ROUTES.CUSTOM_REQUEST" 
          @click="isSidebarOpen = false"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-medium"
          :class="[$route.path === ROUTES.CUSTOM_REQUEST 
            ? 'bg-blue-600 text-white shadow-sm' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800/60']">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
          </svg>
          <span>Custom request</span>
        </router-link>

        <!-- 4. Etalase produk -->
        <router-link :to="ROUTES.ETALASE_PRODUK" 
          @click="isSidebarOpen = false"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-medium"
          :class="[$route.path === ROUTES.ETALASE_PRODUK 
            ? 'bg-blue-600 text-white shadow-sm' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800/60']">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
          </svg>
          <span>Etalase produk</span>
        </router-link>

        <!-- 5. Filamen -->
        <router-link :to="ROUTES.FILAMEN" 
          @click="isSidebarOpen = false"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-medium"
          :class="[$route.path === ROUTES.FILAMEN 
            ? 'bg-blue-600 text-white shadow-sm' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800/60']">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
          <span>Filamen</span>
        </router-link>

        <!-- 6. Keuangan & aset -->
        <router-link :to="ROUTES.KEUANGAN_ASET" 
          @click="isSidebarOpen = false"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-medium"
          :class="[$route.path === ROUTES.KEUANGAN_ASET 
            ? 'bg-blue-600 text-white shadow-sm' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800/60']">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
          </svg>
          <span>Keuangan & aset</span>
        </router-link>

        <!-- 7. Kalkulator HPP -->
        <router-link :to="ROUTES.KALKULATOR_HPP" 
          @click="isSidebarOpen = false"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-medium"
          :class="[$route.path === ROUTES.KALKULATOR_HPP 
            ? 'bg-blue-600 text-white shadow-sm' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800/60']">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
          <span>Kalkulator HPP</span>
        </router-link>

        <!-- 8. Laporan investor -->
        <router-link :to="ROUTES.LAPORAN_INVESTOR" 
          @click="isSidebarOpen = false"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-medium"
          :class="[$route.path === ROUTES.LAPORAN_INVESTOR 
            ? 'bg-blue-600 text-white shadow-sm' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800/60']">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          <span>Laporan investor</span>
        </router-link>

        <!-- 9. Pengaturan -->
        <router-link :to="ROUTES.PENGATURAN" 
          @click="isSidebarOpen = false"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-medium"
          :class="[$route.path === ROUTES.PENGATURAN 
            ? 'bg-blue-600 text-white shadow-sm' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800/60']">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <span>Pengaturan</span>
        </router-link>

      </nav>

      <!-- Footer Sidebar: Lihat toko & Keluar (Persis Gambar Referensi) -->
      <div class="p-3.5 border-t border-slate-800/80 bg-[#080E20] space-y-1">
        <router-link :to="ROUTES.ETALASE_PRODUK" 
          @click="isSidebarOpen = false"
          class="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors">
          <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
          </svg>
          <span>Lihat toko</span>
        </router-link>
        <button @click="handleLogout" 
          class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-left cursor-pointer">
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

      <!-- Root Dashboard: PERSIS SUSUNAN GAMBAR REFERENSI -->
      <div v-if="$route.path === ROUTES.SCHOOL_ADMIN || $route.path === '/admin-sekolah'" class="p-4 md:p-8 max-w-[1440px] mx-auto space-y-6">
        
        <!-- Header Bar: Dashboard + Tanggal + Tombol Aksi (Persis Gambar) -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
            <p class="text-xs md:text-sm text-slate-400 font-medium mt-0.5 capitalize">{{ currentDateFormatted }}</p>
          </div>
          
          <div class="flex items-center gap-2.5">
            <button @click="showInvoiceModal = true" 
              class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer">
              <span>+ Buat invoice</span>
            </button>
            <button class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              <span>Antrean cetak (0)</span>
            </button>
          </div>
        </div>

        <!-- 4 KARTU STATISTIK (PERSIS SUSUNAN GAMBAR REFERENSI) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          
          <!-- Card 1: PENJUALAN BULAN INI -->
          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">PENJUALAN BULAN INI</p>
            <div class="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {{ formatRupiah(financialSummary.penjualanBulanIni) }}
            </div>
            <p class="text-[11px] text-slate-400 font-medium mt-1 truncate">
              semua channel · 1 pesanan web
            </p>
          </div>

          <!-- Card 2: LABA KOTOR BULAN INI -->
          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">LABA KOTOR BULAN INI</p>
            <div class="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {{ formatRupiah(financialSummary.labaKotorBulanIni) }}
            </div>
            <p class="text-[11px] text-slate-400 font-medium mt-1 truncate">
              setelah HPP {{ formatRupiah(financialSummary.pengeluaranBulanIni) }} & potongan Rp 0
            </p>
          </div>

          <!-- Card 3: SALDO KAS -->
          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">SALDO KAS</p>
            <div class="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {{ formatRupiah(financialSummary.saldoKas) }}
            </div>
            <p class="text-[11px] text-slate-400 font-medium mt-1 truncate">
              belanja bulan ini Rp 0
            </p>
          </div>

          <!-- Card 4: ANTREAN MESIN -->
          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">ANTREAN MESIN</p>
            <div class="text-2xl font-black text-slate-900 tracking-tight font-mono">
              0 jam
            </div>
            <p class="text-[11px] text-slate-400 font-medium mt-1 truncate">
              0 pesanan menunggu/dicetak
            </p>
          </div>

        </div>

        <!-- BAGIAN TENGAH: Chart Penjualan vs Belanja (Kiri) & Status Pesanan (Kanan) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          <!-- Chart: Penjualan vs belanja · 12 bulan (8 cols) -->
          <div class="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 class="text-sm font-bold text-slate-900">Penjualan vs belanja · 12 bulan</h3>
              <!-- Legend dots persis gambar -->
              <div class="flex items-center gap-4 mt-2 text-[11px] font-medium text-slate-500">
                <span class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block"></span>
                  Penjualan
                </span>
                <span class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-sm bg-amber-600 inline-block"></span>
                  Belanja
                </span>
              </div>
            </div>

            <!-- Chart Area dengan Grid Lines & 12 Bar Bulan Persis Gambar -->
            <div class="mt-6">
              <div class="relative h-56 flex">
                <!-- Y-Axis Ticks (300rb, 225rb, 150rb, 75rb, 0) -->
                <div class="w-14 h-full flex flex-col justify-between text-[11px] font-medium text-slate-400 pr-2 text-right select-none">
                  <span>300rb</span>
                  <span>225rb</span>
                  <span>150rb</span>
                  <span>75rb</span>
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
                        {{ m }}: {{ idx === 11 ? 'Penjualan Rp 254.205' : 'Rp 0' }}
                      </div>

                      <!-- The Bar: Bulan Nov memiliki bar biru tegak menonjol persis gambar -->
                      <div v-if="idx === 11" 
                        class="w-3.5 sm:w-5 md:w-6 bg-blue-600 rounded-t-sm transition-all duration-700 ease-out shadow-xs h-[85%]">
                      </div>
                      <div v-else class="w-1.5 h-0.5 rounded-full bg-transparent mb-0.5"></div>
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

          <!-- Status Pesanan (Kanan ~ 4 cols, Persis Gambar Referensi) -->
          <div class="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-xs flex flex-col justify-between">
            <h3 class="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">Status pesanan</h3>
            
            <div class="space-y-3 py-2 text-xs">
              
              <!-- 1. Menunggu pembayaran -->
              <div class="flex items-center justify-between text-slate-600">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"></span>
                  <span class="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md text-[11px] font-medium">Menunggu pembayaran</span>
                </div>
                <span class="font-bold text-slate-700 font-mono">0</span>
              </div>

              <!-- 2. Dibayar · antre produksi -->
              <div class="flex items-center justify-between text-slate-600">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-sky-400 flex-shrink-0"></span>
                  <span class="text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md text-[11px] font-medium">Dibayar · antre produksi</span>
                </div>
                <span class="font-bold text-slate-700 font-mono">0</span>
              </div>

              <!-- 3. Sedang dicetak (Dark Rounded Pill Highlight Persis Gambar) -->
              <div class="bg-slate-900 text-white rounded-xl px-3 py-2 flex items-center justify-between shadow-xs">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 animate-pulse"></span>
                  <span class="font-semibold text-xs">Sedang dicetak</span>
                </div>
                <span class="font-bold text-white font-mono text-xs">0</span>
              </div>

              <!-- 4. Quality control -->
              <div class="flex items-center justify-between text-slate-600">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0"></span>
                  <span class="text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md text-[11px] font-medium">Quality control</span>
                </div>
                <span class="font-bold text-slate-700 font-mono">0</span>
              </div>

              <!-- 5. Dikirim -->
              <div class="flex items-center justify-between text-slate-600">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                  <span class="text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md text-[11px] font-medium">Dikirim</span>
                </div>
                <span class="font-bold text-slate-700 font-mono">0</span>
              </div>

              <!-- 6. Selesai (Angka 1 Sesuai Gambar) -->
              <div class="flex items-center justify-between text-slate-600">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                  <span class="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px] font-medium">Selesai</span>
                </div>
                <span class="font-bold text-emerald-600 font-mono">1</span>
              </div>

              <!-- 7. Dibatalkan -->
              <div class="flex items-center justify-between text-slate-600">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0"></span>
                  <span class="text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md text-[11px] font-medium">Dibatalkan</span>
                </div>
                <span class="font-bold text-slate-700 font-mono">0</span>
              </div>

            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Status Operasional</span>
              <span class="font-bold text-slate-700">1 Transaksi Selesai</span>
            </div>
          </div>

        </div>

        <!-- BAGIAN BAWAH: Antrean Produksi (Kiri) & Pesanan Terbaru (Kanan) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          <!-- Panel Kiri: Antrean produksi (Persis Gambar) -->
          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-xs flex flex-col justify-between min-h-[140px]">
            <div>
              <h3 class="text-sm font-bold text-slate-900 mb-2">Antrean produksi</h3>
              <p class="text-xs text-slate-400 font-medium">Tidak ada pesanan di antrean</p>
            </div>
          </div>

          <!-- Panel Kanan: Pesanan terbaru (Klien / Rekan Istimewa, Rp 254.205, • Selesai) -->
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
          </div>

          <div class="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
            <button @click="showInvoiceModal = false" class="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800">Batal</button>
            <button @click="saveInvoice" class="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs">Terbitkan Invoice</button>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppLogo from '../components/AppLogo.vue'
import { ROUTES } from '../config/routePaths.js'

const router = useRouter()
const route = useRoute()
const showInvoiceModal = ref(false)
const isSidebarOpen = ref(false)

// Form Invoice State
const invoiceForm = ref({
  customerName: 'Klien / Rekan Istimewa',
  itemDescription: 'Pesanan Layanan Sistem GuruKu',
  amount: 254205
})

// Data Finansial (Persis Angka Referensi)
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
  showInvoiceModal.value = false
}

// 12 Bulan (Persis Referensi Gambar)
const chartMonths = ['Des', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov']

// Format Tanggal
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

onMounted(() => {
  loadFinancialSummary()
})

watch(() => route.path, () => {
  loadFinancialSummary()
})

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
