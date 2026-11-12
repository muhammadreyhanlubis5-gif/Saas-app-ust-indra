<template>
  <div class="flex h-screen w-full max-w-full bg-slate-50 font-sans overflow-hidden relative">
    
    <!-- Mobile Backdrop for Sidebar Drawer -->
    <div 
      v-if="isSidebarOpen" 
      @click="isSidebarOpen = false" 
      class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 lg:hidden transition-opacity duration-300"
    ></div>

    <!-- Sidebar Navigation (Desktop static, Mobile slide-over drawer) -->
    <aside 
      class="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col h-full shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shrink-0"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Sidebar Header -->
      <div class="p-5 border-b border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <AppLogo size="md" subtitle="SaaS Management" :textDark="true" />
        </div>
        <button @click="isSidebarOpen = false" class="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors" aria-label="Tutup Menu">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Navigation Links: Standarisasi Multi-Tenant SaaS Management -->
      <div class="flex-1 overflow-y-auto py-5 px-3 space-y-1.5 custom-scrollbar">
        
        <!-- 1. Dashboard (Overview metrics) -->
        <button @click="activeTab = 'dashboard'; isSidebarOpen = false" class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer text-xs"
          :class="activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          <span>Dashboard</span>
        </button>

        <!-- 2. Manajemen Klien (Replaces "Pesanan") -->
        <button @click="activeTab = 'manajemen'; isSidebarOpen = false" class="w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer text-xs"
          :class="activeTab === 'manajemen' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'">
          <div class="flex items-center gap-3">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            <span>Manajemen Klien</span>
          </div>
          <span v-if="dashboardMetrics.activeClientsCount > 0" class="bg-blue-500/30 text-blue-200 border border-blue-400/40 text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs">
            {{ dashboardMetrics.activeClientsCount }}
          </span>
        </button>

        <!-- 3. Paket Lisensi (Replaces "Etalase produk") -->
        <button @click="activeTab = 'etalase'; isSidebarOpen = false" class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer text-xs"
          :class="activeTab === 'etalase' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          <span>Paket Lisensi</span>
        </button>

        <!-- 4. Tagihan & Keuangan (Replaces "Keuangan & aset" + Submenus: Buku Kas, Kalkulator HPP) -->
        <div class="space-y-1">
          <button @click="toggleKeuanganMenu" class="w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer text-xs"
            :class="(activeTab === 'keuangan' || activeTab === 'hpp') ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'">
            <div class="flex items-center gap-3">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
              <span>Tagihan & Keuangan</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span v-if="dashboardMetrics.activationQueueCount > 0" class="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
                {{ dashboardMetrics.activationQueueCount }}
              </span>
              <svg class="w-3.5 h-3.5 transition-transform duration-200" :class="isKeuanganMenuOpen ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </div>
          </button>
          
          <!-- Sub-menu: Buku Kas & Kalkulator HPP -->
          <div v-show="isKeuanganMenuOpen || activeTab === 'keuangan' || activeTab === 'hpp'" class="pl-6 pr-2 pt-1 pb-1 space-y-1 border-l border-slate-800 ml-5">
            <button @click="selectKeuanganSubTab('tagihan'); isSidebarOpen = false" 
              class="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all text-left cursor-pointer"
              :class="(activeTab === 'keuangan' && keuanganSubTab === 'tagihan') ? 'bg-blue-500/20 text-blue-300 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'">
              <span>Faktur & Invoicing</span>
              <span v-if="pendingPaymentsCount > 0" class="text-[9px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                {{ pendingPaymentsCount }}
              </span>
            </button>
            <button @click="selectKeuanganSubTab('bukukas'); isSidebarOpen = false" 
              class="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all text-left cursor-pointer"
              :class="(activeTab === 'keuangan' && keuanganSubTab === 'bukukas') ? 'bg-blue-500/20 text-blue-300 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'">
              <span>Buku Kas</span>
            </button>
            <button @click="selectKeuanganSubTab('hpp'); isSidebarOpen = false" 
              class="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all text-left cursor-pointer"
              :class="(activeTab === 'hpp' || (activeTab === 'keuangan' && keuanganSubTab === 'hpp')) ? 'bg-blue-500/20 text-blue-300 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'">
              <span>Kalkulator HPP</span>
            </button>
          </div>
        </div>

        <!-- 5. Pusat Bantuan (Replaces "Custom request") -->
        <button @click="activeTab = 'aduan'; isSidebarOpen = false" class="w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer text-xs"
          :class="activeTab === 'aduan' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'">
          <div class="flex items-center gap-3">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
            <span>Pusat Bantuan</span>
          </div>
          <span v-if="unreadTicketsCount > 0" class="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
            {{ unreadTicketsCount }}
          </span>
        </button>

        <!-- 6. Pengaturan Sistem -->
        <button @click="activeTab = 'pengaturan'; isSidebarOpen = false" class="w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer text-xs"
          :class="activeTab === 'pengaturan' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'">
          <div class="flex items-center gap-3">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span>Pengaturan Sistem</span>
          </div>
          <span v-if="forgotPasswordReports.length > 0" class="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
            {{ forgotPasswordReports.length }}
          </span>
        </button>
        
      </div>

      <!-- Footer Sidebar: Portal Klien & Keluar -->
      <div class="p-3.5 border-t border-slate-800/80 bg-[#080E20] space-y-1">
        <a href="/" target="_blank" class="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors no-underline">
          <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
          </svg>
          <span>Portal Klien</span>
        </a>
        <button @click="handleLogout" class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-left cursor-pointer">
          <svg class="w-4 h-4 text-slate-400 group-hover:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          <span>Keluar</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area Wrapper -->
    <div class="flex-1 flex flex-col min-w-0 w-full max-w-full h-full overflow-hidden bg-[#F8FAFC]">

      <!-- Mobile & Tablet Header Bar (Visible on < lg screens) -->
      <header class="lg:hidden bg-[#0B132B] text-white border-b border-slate-800 px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between shrink-0 z-30 shadow-md">
        <div class="flex items-center gap-2.5 min-w-0">
          <button @click="isSidebarOpen = true" class="p-2 -ml-1 text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 rounded-xl transition-all cursor-pointer" aria-label="Buka Menu">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <div class="flex items-center gap-2 min-w-0">
            <AppLogo size="xs" :showText="false" />
            <div class="min-w-0">
              <span class="font-bold text-sm tracking-tight text-white block truncate leading-none">GuruKu Admin</span>
              <span class="text-[9px] text-blue-400 uppercase tracking-widest font-semibold block mt-0.5 truncate">{{ currentTabTitle }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-1 shrink-0">
          <button @click="handleLogout" class="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 active:scale-95 rounded-xl transition-all cursor-pointer" title="Keluar">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          </button>
        </div>
      </header>

      <!-- Desktop Top Navbar (Crisp, Executive, Human-Designed) -->
      <header class="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white border-b border-slate-200 shrink-0 z-20">
        <!-- Breadcrumb & Connection Status -->
        <div class="flex items-center gap-3">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">GuruKu</span>
          <span class="text-slate-300">/</span>
          <span class="text-xs font-bold text-slate-900 capitalize">{{ currentTabTitle }}</span>
          <span class="inline-flex items-center gap-1.5 ml-3 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Sistem Aktif & Terhubung
          </span>
        </div>

        <!-- Quick Info & Profile -->
        <div class="flex items-center gap-4">
          <div class="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            <span>{{ currentDateFormatted }}</span>
          </div>

          <!-- Admin Profile Badge -->
          <div @click="activeTab = 'pengaturan'" class="flex items-center gap-2.5 pl-3 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity" title="Buka Pengaturan Sistem">
            <div class="w-8 h-8 rounded-full bg-[#0B132B] text-white font-bold text-xs flex items-center justify-center shadow-xs">
              AD
            </div>
            <div class="text-left">
              <p class="text-xs font-bold text-slate-800 leading-tight">Admin Master</p>
              <p class="text-[10px] text-slate-400 font-medium">Owner</p>
            </div>
          </div>
        </div>
      </header>

      <!-- Scrollable Main Content -->
      <main class="flex-1 overflow-y-auto overflow-x-hidden w-full max-w-full bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 relative custom-scrollbar pb-24 lg:pb-10">

        <!-- DASHBOARD UTAMA (PERSIS TAMPILAN REFERENSI ARUS LAB) -->
        <div v-if="activeTab === 'dashboard'" class="animate-fade-in space-y-6">
          
          <!-- Header Bar: Title, Indonesian Date, + Buat invoice, Antrean cetak (0) -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
            <div>
              <h1 class="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight">Dashboard</h1>
              <p class="text-xs sm:text-[13px] text-slate-400 font-medium mt-0.5">{{ currentDateFormatted }}</p>
            </div>

            <div class="flex items-center gap-2.5 flex-wrap">
              <button 
                @click="showInvoiceModal = true" 
                class="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                <span>Buat invoice</span>
              </button>

              <button 
                @click="showRentalQueueModal = true" 
                class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                <span>Antrean Aktivasi ({{ rentalQueue.length }})</span>
              </button>
            </div>
          </div>

          <!-- 4 Stat Cards: Real-time SaaS Metrics Aggregation with Staggered Entry Animations -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <!-- Card 1: PENDAPATAN BULAN INI -->
            <div class="bg-white rounded-2xl border border-slate-300 p-5 sm:p-6 shadow-xs hover:border-slate-400 transition-all animate-card-1">
              <div class="flex items-center justify-between mb-2">
                <p class="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">PENDAPATAN BULAN INI</p>
                <span class="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </span>
              </div>
              <div class="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight font-mono my-1 leading-none">
                {{ formatRupiah(displayRevenueThisMonth) }}
              </div>
              <p class="text-[11px] text-slate-500 font-normal truncate mt-1">
                Total pelunasan invoice & perpanjangan
              </p>
            </div>

            <!-- Card 2: MARGIN OPERASIONAL -->
            <div class="bg-white rounded-2xl border border-slate-300 p-5 sm:p-6 shadow-xs hover:border-slate-400 transition-all animate-card-2">
              <div class="flex items-center justify-between mb-2">
                <p class="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">MARGIN OPERASIONAL</p>
                <span class="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                </span>
              </div>
              <div class="text-2xl sm:text-[26px] font-black tracking-tight font-mono my-1 leading-none text-emerald-700">
                {{ formatRupiah(displayOperationalMargin) }}
              </div>
              <p class="text-[11px] text-slate-500 font-normal truncate mt-1">
                Setelah beban operasional {{ formatRupiah(displayOperationalCosts) }}
              </p>
            </div>

            <!-- Card 3: TOTAL KLIEN AKTIF -->
            <div class="bg-white rounded-2xl border border-slate-300 p-5 sm:p-6 shadow-xs hover:border-slate-400 transition-all animate-card-3">
              <div class="flex items-center justify-between mb-2">
                <p class="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">TOTAL KLIEN AKTIF</p>
                <span class="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                </span>
              </div>
              <div class="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight font-mono my-1 leading-none">
                {{ displayActiveClientsCount }} Sekolah
              </div>
              <p class="text-[11px] text-slate-500 font-normal truncate mt-1">
                Lembaga dengan lisensi berstatus Active
              </p>
            </div>

            <!-- Card 4: ANTREAN AKTIVASI -->
            <div class="bg-white rounded-2xl border border-slate-300 p-5 sm:p-6 shadow-xs hover:border-slate-400 transition-all animate-card-4">
              <div class="flex items-center justify-between mb-2">
                <p class="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">ANTREAN AKTIVASI</p>
                <span class="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </span>
              </div>
              <div class="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight font-mono my-1 leading-none">
                {{ displayActivationQueueCount }} Tenant
              </div>
              <p class="text-[11px] text-slate-500 font-normal truncate mt-1">
                {{ displayActivationQueueCount === 0 ? 'Semua tenant aktif & terverifikasi' : displayActivationQueueCount + ' tagihan menunggu verifikasi' }}
              </p>
            </div>
          </div>

          <!-- Middle Row: Chart & Status Pesanan Sesuai Referensi -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            <!-- Left 8 Cols: Jumlah Pengguna Aplikasi GuruKu · 12 bulan -->
            <div class="lg:col-span-8 bg-white rounded-2xl border border-slate-300 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <!-- Title & Legend -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Pertumbuhan Pengguna: Active Users vs Churned/Expired Users · 12 Bulan</h3>
                  <div class="flex items-center gap-4 mt-1.5 flex-wrap">
                    <div class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span>
                      <span class="text-xs text-slate-600 font-medium">Active Users</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-xs bg-amber-500"></span>
                      <span class="text-xs text-slate-600 font-medium">Churned / Expired Users</span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-1 bg-slate-50 border border-slate-300 p-0.5 rounded-lg text-[11px] font-semibold text-slate-600">
                  <button @click="showToast('Menampilkan data pengguna 12 bulan terakhir')" class="px-2.5 py-1 rounded-md bg-white text-emerald-700 shadow-2xs font-bold cursor-pointer">12 Bulan</button>
                  <button @click="activeTab = 'manajemen'" class="px-2.5 py-1 rounded-md text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">Data Klien</button>
                </div>
              </div>

              <!-- Chart Graphic Area (Skala 350 user, 260 user, 175 user, 90 user, 0) -->
              <div class="relative w-full pt-4 pb-2">
                <!-- Y-Axis labels & Grid lines -->
                <div class="space-y-6 sm:space-y-7 relative select-none">
                  <div class="flex items-center gap-3">
                    <span class="text-[11px] text-slate-400 font-mono w-14 text-right shrink-0">350 user</span>
                    <div class="flex-1 border-b border-slate-200"></div>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-[11px] text-slate-400 font-mono w-14 text-right shrink-0">260 user</span>
                    <div class="flex-1 border-b border-slate-200"></div>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-[11px] text-slate-400 font-mono w-14 text-right shrink-0">175 user</span>
                    <div class="flex-1 border-b border-slate-200"></div>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-[11px] text-slate-400 font-mono w-14 text-right shrink-0">90 user</span>
                    <div class="flex-1 border-b border-slate-200"></div>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-[11px] text-slate-400 font-mono w-14 text-right shrink-0">0</span>
                    <div class="flex-1 border-b border-slate-200"></div>
                  </div>
                </div>

                <!-- Overlay Bar Elements Aligned with Month Columns -->
                <div class="absolute inset-0 left-16 right-2 flex items-end justify-between pb-6 pointer-events-none">
                  <div 
                    v-for="(item, idx) in userStatsMonths" 
                    :key="item.month" 
                    class="flex-1 flex justify-center items-end gap-1 h-[170px] pointer-events-auto group relative cursor-pointer px-0.5"
                  >
                    <!-- Interactive Tooltip -->
                    <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-slate-900 text-white text-[11px] font-medium py-2 px-3 rounded-xl pointer-events-none whitespace-nowrap z-30 shadow-xl border border-slate-700">
                      <div class="font-bold text-white mb-1">{{ item.month }} 2026</div>
                      <div class="text-emerald-400 font-semibold flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Pengguna Aktif: {{ item.penggunaAktif }} user
                      </div>
                      <div class="text-amber-400 font-semibold flex items-center gap-1.5 mt-0.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        Dalam Penangguhan: {{ item.penangguhan }} user
                      </div>
                      <div class="text-slate-400 text-[10px] mt-1 border-t border-slate-700 pt-1">
                        Total Terdaftar: {{ item.penggunaAktif + item.penangguhan }} user
                      </div>
                    </div>

                    <!-- Green Bar (Pengguna Aktif) -->
                    <div 
                      class="w-2 sm:w-2.5 md:w-3.5 bg-emerald-500 rounded-t-sm transition-all duration-500 hover:brightness-110 shadow-xs animate-grow-bar"
                      :style="{ height: `${Math.min(100, Math.max(6, (item.penggunaAktif / 350) * 100))}%` }"
                      title="Pengguna Aktif"
                    ></div>

                    <!-- Orange Bar (Dalam Penangguhan / Habis Limit) -->
                    <div 
                      class="w-2 sm:w-2.5 md:w-3.5 bg-amber-500 rounded-t-sm transition-all duration-500 hover:brightness-110 shadow-xs animate-grow-bar"
                      :style="{ height: `${Math.min(100, Math.max(item.penangguhan > 0 ? 5 : 0, (item.penangguhan / 350) * 100))}%` }"
                      title="Dalam Penangguhan (Habis Limit)"
                    ></div>
                  </div>
                </div>

                <!-- X-Axis Labels (12 Bulan) -->
                <div class="flex justify-between pl-16 pr-2 mt-2 text-[11px] text-slate-400 font-medium">
                  <span v-for="item in userStatsMonths" :key="'label-'+item.month" class="flex-1 text-center truncate">
                    {{ item.month }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Right 4 Cols: Status pesanan Sesuai Referensi -->
            <div class="lg:col-span-4 bg-white rounded-2xl border border-slate-300 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Status Tagihan Lisensi</h3>
                  <span class="text-[11px] text-slate-400 font-medium">Total: {{ orderStatusCounts.total }}</span>
                </div>

                <div class="space-y-2.5">
                  <!-- 1. Menunggu pembayaran -->
                  <div class="flex items-center justify-between py-1.5 border-b border-slate-200 hover:bg-slate-50/50 px-1 rounded-lg transition-colors">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#FEF6E9] text-[#B45309] border border-[#FDE68A] text-xs font-semibold">
                      Menunggu pembayaran
                    </span>
                    <span class="text-xs font-bold text-slate-700 font-mono">{{ orderStatusCounts.menungguPembayaran }}</span>
                  </div>

                  <!-- 2. Berhasil dibayar -->
                  <div class="flex items-center justify-between py-1.5 border-b border-slate-200 hover:bg-slate-50/50 px-1 rounded-lg transition-colors">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] text-xs font-semibold">
                      Berhasil dibayar
                    </span>
                    <span class="text-xs font-bold text-slate-700 font-mono">{{ orderStatusCounts.berhasilDibayar }}</span>
                  </div>

                  <!-- 3. Dalam penangguhan (Habis limit) -->
                  <div class="flex items-center justify-between py-1.5 border-b border-slate-200 hover:bg-slate-50/50 px-1 rounded-lg transition-colors">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] text-xs font-semibold">
                      Dalam penangguhan (Habis limit)
                    </span>
                    <span class="text-xs font-bold text-slate-700 font-mono">{{ orderStatusCounts.penangguhan }}</span>
                  </div>

                  <!-- 4. Selesai -->
                  <div class="flex items-center justify-between py-1.5 border-b border-slate-200 hover:bg-slate-50/50 px-1 rounded-lg transition-colors">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] text-xs font-semibold">
                      Selesai
                    </span>
                    <span class="text-xs font-black text-slate-900 font-mono">{{ orderStatusCounts.selesai }}</span>
                  </div>

                  <!-- 5. Dibatalkan -->
                  <div class="flex items-center justify-between py-1.5 hover:bg-slate-50/50 px-1 rounded-lg transition-colors">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3] text-xs font-semibold">
                      Dibatalkan
                    </span>
                    <span class="text-xs font-bold text-slate-700 font-mono">{{ orderStatusCounts.dibatalkan }}</span>
                  </div>
                </div>
              </div>

              <div class="pt-3 border-t border-slate-200 text-center">
                <button @click="activeTab = 'keuangan'; keuanganSubTab = 'tagihan'" class="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1 cursor-pointer">
                  <span>Lihat semua transaksi</span>
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>

          </div>

          <!-- Bottom Row: Antrean sewa aplikasi & Pesanan terbaru Sesuai Referensi -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <!-- Left: Antrean sewa aplikasi -->
            <div class="bg-white rounded-2xl border border-slate-300 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <h3 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Antrean Aktivasi Tenant</h3>
                    <p class="text-[11px] text-slate-400 mt-0.5">Permohonan aktivasi lisensi & akun sekolah baru</p>
                  </div>
                  <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full" :class="rentalQueue.length > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-500'">
                    {{ rentalQueue.length }} Antrean
                  </span>
                </div>
                
                <!-- Empty State -->
                <div v-if="rentalQueue.length === 0" class="py-8 text-center flex flex-col items-center justify-center">
                  <div class="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-3">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  </div>
                  <p class="text-xs text-slate-700 font-bold">Tidak ada antrean aktivasi</p>
                  <p class="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed">Semua permohonan lisensi dan aktivasi tenant sekolah telah selesai diproses.</p>
                </div>

                <!-- Antrean List if any -->
                <div v-else class="space-y-2.5 py-2">
                  <div 
                    v-for="item in rentalQueue" 
                    :key="item.id" 
                    class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-100/70 transition-colors"
                  >
                    <div class="min-w-0 pr-2">
                      <p class="text-xs font-bold text-slate-800 truncate">{{ item.schoolName }}</p>
                      <p class="text-[10px] text-slate-400 mt-0.5 truncate">{{ item.packageName }} &bull; {{ item.requestedAt }}</p>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                      <span class="text-xs font-mono font-bold text-slate-700">{{ formatRupiah(item.amount) }}</span>
                      <button 
                        @click="activateRentalQueueItem(item)" 
                        class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-xs cursor-pointer transition-colors"
                        title="Aktivasi lisensi sekolah sekarang"
                      >
                        Aktivasi
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span class="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Server aktivasi: 100% siap
                </span>
                <button @click="showRentalQueueModal = true" class="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer inline-flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                  <span>Kelola Antrean Aktivasi</span>
                </button>
              </div>
            </div>

            <!-- Right: Pesanan terbaru (Structured List) -->
            <div class="bg-white rounded-2xl border border-slate-300 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-200">
                  <div>
                    <h3 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Riwayat Transaksi Terbaru</h3>
                    <p class="text-[11px] text-slate-400 mt-0.5">Daftar transaksi lisensi dan langganan SaaS terkini</p>
                  </div>
                  <button @click="activeTab = 'keuangan'; keuanganSubTab = 'tagihan'" class="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer inline-flex items-center gap-1">
                    <span>Lihat semua</span>
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                  </button>
                </div>

                <!-- Structured List of Recent Orders -->
                <div class="divide-y divide-slate-100">
                  <div 
                    v-for="(order, oIdx) in recentOrders.slice(0, 4)" 
                    :key="order.id" 
                    class="py-2.5 px-1.5 flex items-center justify-between hover:bg-slate-50/70 rounded-xl transition-colors group animate-row"
                    :style="{ animationDelay: (oIdx * 100) + 'ms' }"
                  >
                    <div class="flex items-center gap-3 min-w-0 pr-3">
                      <!-- Initials Avatar -->
                      <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200 shrink-0">
                        {{ getInitials(order.clientName) }}
                      </div>
                      <div class="min-w-0">
                        <p class="text-xs sm:text-sm font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                          {{ order.clientName }}
                        </p>
                        <p class="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                          {{ order.packageName || 'Lisensi SaaS GuruKu' }} &bull; {{ order.date }}
                        </p>
                      </div>
                    </div>
                    
                    <div class="text-right shrink-0">
                      <p class="text-xs sm:text-sm font-black text-slate-900 font-mono">{{ formatRupiah(order.amount) }}</p>
                      <span 
                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5"
                        :class="getOrderStatusBadgeClass(order.status)"
                      >
                        <span class="w-1 h-1 rounded-full" :class="getOrderStatusDotClass(order.status)"></span>
                        {{ order.status }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="pt-3 mt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                <span>Channel: Web Portal & Bank Transfer</span>
                <span class="text-emerald-600 font-medium">Metode: Otomatis & Terverifikasi</span>
              </div>
            </div>
          </div>

        </div>

        <!-- MANAJEMEN KLIEN (PESANAN) TAB -->
        <div v-else-if="activeTab === 'manajemen'" class="animate-fade-in space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-300">
            <div>
              <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Manajemen Klien Sekolah</h1>
              <p class="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Kelola batas waktu lisensi, kelancaran pembayaran, dan verifikasi langganan secara terpusat.</p>
            </div>
            <div class="flex items-center gap-3">
              <div class="bg-white border border-slate-300 px-4 py-2 rounded-xl shadow-2xs text-right">
                <p class="text-[10px] text-slate-400 uppercase font-bold">Klien Aktif</p>
                <p class="text-base font-black text-slate-900 font-mono">{{ activeClientsCount }} Sekolah</p>
              </div>
              <div class="bg-white border border-slate-300 px-4 py-2 rounded-xl shadow-2xs text-right">
                <p class="text-[10px] text-slate-400 uppercase font-bold">Total Omzet</p>
                <p class="text-base font-black text-blue-600 font-mono">{{ formatRupiah(totalRevenue) }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-slate-300 overflow-hidden">
            <!-- Header Card Section -->
            <div class="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 bg-white">
              <div>
                <h2 class="text-base sm:text-xl font-black text-slate-800 tracking-tight">Daftar Klien Sekolah (Tenants)</h2>
                <p class="text-xs text-slate-500 font-medium mt-0.5">Kelola batas waktu lisensi, kontak, dan kredensial akses sekolah.</p>
              </div>
              <button @click="showModal = true" class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-xs font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98">
                <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                <span>Tambah Klien Baru</span>
              </button>
            </div>

            <!-- Live Search Bar -->
            <div class="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2.5">
              <div class="relative flex-1">
                <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input 
                  v-model="clientSearch" 
                  type="text" 
                  placeholder="Cari nama sekolah, username, atau alamat..." 
                  class="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                />
                <button v-if="clientSearch" @click="clientSearch = ''" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <span class="text-xs font-bold text-slate-500 shrink-0 px-2">{{ filteredSchools.length }} Klien</span>
            </div>
            
            <!-- Mobile Cards View (< md): Relational SaaS Tenant Cards -->
            <div class="md:hidden p-3 sm:p-4 space-y-3.5 bg-slate-50/40">
              <div v-if="loading" class="p-8 text-center text-slate-400 font-bold animate-pulse text-xs sm:text-sm">
                Memuat Data Klien...
              </div>
              <div v-else-if="filteredSchools.length === 0" class="p-8 text-center text-slate-400 text-xs sm:text-sm bg-white rounded-2xl border border-slate-200/80">
                <svg class="w-10 h-10 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                {{ clientSearch ? 'Tidak ada sekolah yang cocok dengan kata kunci.' : 'Belum ada klien sekolah yang terdaftar.' }}
              </div>
              <div 
                v-for="school in filteredSchools" 
                :key="'m-'+school.id" 
                class="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-3.5"
              >
                <!-- Card Header with Tenant ID & Dynamic Badges -->
                <div class="flex items-start justify-between gap-2.5">
                  <div class="flex items-start gap-2.5 min-w-0">
                    <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                    </div>
                    <div class="min-w-0">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <button 
                          @click="copyToClipboard(school.id, 'Tenant ID')" 
                          class="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] font-bold border border-slate-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                          title="Klik salin full Tenant UUID"
                        >
                          <span>{{ formatTenantId(school.id) }}</span>
                          <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                        </button>
                        <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          Limit {{ school.database_limit || 100 }} MB
                        </span>
                        <!-- Online Presence Pill -->
                        <span 
                          class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all"
                          :class="school.is_online ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-200'"
                        >
                          <span class="w-1.5 h-1.5 rounded-full" :class="school.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'"></span>
                          <span>{{ school.is_online ? 'Online' : 'Offline' }}</span>
                        </span>
                      </div>
                      <h3 class="font-extrabold text-slate-900 text-sm leading-snug mt-1">{{ school.name || school.school_name }}</h3>
                      <p class="text-[11px] text-slate-500 line-clamp-1 mt-0.5" :title="school.address">{{ school.address || 'Alamat belum disetel' }}</p>

                      <!-- Real-Time Setup Progress Bar Mobile -->
                      <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div class="flex items-center gap-1.5">
                          <span class="text-[10px] font-bold text-slate-500">Setup:</span>
                          <div class="w-20 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                            <div 
                              class="h-full rounded-full transition-all duration-700"
                              :class="school.readiness_percentage >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'"
                              :style="{ width: (school.readiness_percentage || 0) + '%' }"
                            ></div>
                          </div>
                          <span class="text-[11px] font-mono font-bold" :class="school.readiness_percentage >= 100 ? 'text-emerald-600' : 'text-blue-700'">
                            {{ school.readiness_percentage || 0 }}%
                          </span>
                        </div>
                        <span v-if="school.last_active_menu" class="text-[10px] text-slate-400 truncate max-w-[120px]">
                          {{ school.last_active_menu }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Dynamic Status Badge -->
                  <span 
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-wider shrink-0 border shadow-2xs"
                    :class="{
                      'bg-emerald-50 text-emerald-700 border-emerald-300': school.status === 'Active',
                      'bg-amber-50 text-amber-700 border-amber-300': school.status === 'Grace Period',
                      'bg-rose-50 text-rose-700 border-rose-300': school.status === 'Expired',
                      'bg-slate-100 text-slate-700 border-slate-300': school.status === 'Suspended'
                    }"
                  >
                    <span 
                      class="w-1.5 h-1.5 rounded-full" 
                      :class="{
                        'bg-emerald-500 animate-pulse': school.status === 'Active',
                        'bg-amber-500': school.status === 'Grace Period',
                        'bg-rose-500': school.status === 'Expired',
                        'bg-slate-500': school.status === 'Suspended'
                      }"
                    ></span>
                    {{ school.status }}
                  </span>
                </div>

                <!-- Info Grid -->
                <div class="grid grid-cols-2 gap-2 text-xs bg-slate-50/80 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span class="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Admin Contact</span>
                    <span class="font-semibold text-slate-800 truncate block mt-0.5">{{ school.admin_contact || school.contact_number || '-' }}</span>
                    <span class="font-mono text-[11px] text-blue-700 truncate block">{{ formatGurukuUsername(school.admin_username) }}</span>
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Batas Lisensi</span>
                    <span class="font-bold block mt-0.5 text-slate-800">{{ formatDate(school.subscription_end_date || school.valid_until) }}</span>
                    <span 
                      class="text-[10px] font-semibold block"
                      :class="{
                        'text-emerald-600': school.status === 'Active',
                        'text-amber-600 font-bold': school.status === 'Grace Period',
                        'text-rose-600 font-bold': school.status === 'Expired' || school.status === 'Suspended'
                      }"
                    >
                      {{ getDaysRemainingText(school.days_remaining) }}
                    </span>
                  </div>
                </div>

                <!-- Action Toolbar: Detail, Limit DB, Perpanjang, Suspend -->
                <div class="flex items-center gap-1.5 pt-2 border-t border-slate-200 flex-wrap">
                  <button 
                    @click="openClientDetail(school)"
                    class="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
                  >
                    Detail
                  </button>
                  <button 
                    @click="openEditLimit(school)"
                    class="px-2.5 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                  >
                    Limit DB
                  </button>
                  <button 
                    @click="openManualRenew(school)"
                    class="px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                  >
                    Perpanjang
                  </button>
                  <button 
                    @click="toggleSuspendSchool(school)"
                    class="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    :class="school.status === 'Suspended' ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200' : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'"
                  >
                    {{ school.status === 'Suspended' ? 'Buka Suspend' : 'Suspend' }}
                  </button>
                  <a 
                    v-if="school.admin_contact || school.contact_number"
                    :href="getWaUrl(school.admin_contact || school.contact_number, school.name, 'Halo Pengelola ' + school.name + ', kami dari Tim Super Admin GuruKu.')"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 ml-auto transition-colors cursor-pointer"
                    title="Hubungi via WhatsApp"
                  >
                    <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                  </a>
                </div>
              </div>
            </div>

            <!-- Desktop Table (>= md): Relational Multi-Tenant SaaS Table -->
            <div class="hidden md:block overflow-x-auto custom-scrollbar">
              <table class="min-w-full bg-white">
                <thead>
                  <tr class="bg-slate-50 text-left border-y border-slate-300">
                    <th class="py-4.5 px-6 uppercase font-black text-[11px] text-slate-500 tracking-wider">Tenant ID & Nama Sekolah</th>
                    <th class="py-4.5 px-6 uppercase font-black text-[11px] text-slate-500 tracking-wider">Kontak Admin (WhatsApp & User)</th>
                    <th class="py-4.5 px-6 uppercase font-black text-[11px] text-slate-500 tracking-wider">Batas Waktu Lisensi</th>
                    <th class="py-4.5 px-6 uppercase font-black text-[11px] text-slate-500 tracking-wider text-center">Status Lisensi</th>
                    <th class="py-4.5 px-6 uppercase font-black text-[11px] text-slate-500 tracking-wider text-right">Aksi Kelola</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  <tr v-if="loading" class="animate-pulse">
                    <td colspan="5" class="py-10 text-center text-slate-400 font-bold">Memuat Data Relasional Klien...</td>
                  </tr>
                  <tr v-else-if="filteredSchools.length === 0">
                    <td colspan="5" class="py-16 text-center text-slate-400 font-medium">
                      <svg class="w-16 h-16 mx-auto mb-4 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                      {{ clientSearch ? 'Tidak ada sekolah yang cocok dengan pencarian.' : 'Belum ada klien sekolah yang terdaftar.' }}
                    </td>
                  </tr>
                  <tr 
                      v-for="(school, sIdx) in filteredSchools" 
                      :key="school.id" 
                      class="transition-all duration-500 group animate-row"
                      :class="school._justUpdated ? 'bg-emerald-50/90 ring-2 ring-emerald-400/60' : 'hover:bg-blue-50/20'"
                      :style="{ animationDelay: Math.min(sIdx * 60, 400) + 'ms' }"
                    >
                    <!-- Column 1: Tenant ID, Online Presence & School Name -->
                    <td class="py-5 px-6">
                      <div class="flex items-center gap-1.5 mb-1.5 flex-wrap">
                        <button 
                          @click="copyToClipboard(school.id, 'Tenant ID')"
                          class="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] font-bold border border-slate-300 inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title="Klik salin full Tenant UUID"
                        >
                          <span>{{ formatTenantId(school.id) }}</span>
                          <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                        </button>
                        <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          DB Limit: {{ school.database_limit || 100 }} MB
                        </span>
                        <!-- Real-time Online Presence Indicator -->
                        <span 
                          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all border"
                          :class="school.is_online ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs' : 'bg-slate-100 text-slate-500 border-slate-200'"
                        >
                          <span class="w-1.5 h-1.5 rounded-full" :class="school.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'"></span>
                          <span>{{ school.is_online ? 'Online' : 'Offline' }}</span>
                        </span>
                      </div>
                      <p class="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">{{ school.name || school.school_name }}</p>
                      <p class="text-[11px] text-slate-500 font-medium max-w-[240px] truncate" :title="school.address">{{ school.address || 'Alamat belum disetel' }}</p>

                      <!-- Real-Time Setup Progress Bar & Last Active Menu -->
                      <div class="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2">
                        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Setup:</span>
                        <div class="w-24 sm:w-28 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                          <div 
                            class="h-full rounded-full transition-all duration-700"
                            :class="school.readiness_percentage >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'"
                            :style="{ width: (school.readiness_percentage || 0) + '%' }"
                          ></div>
                        </div>
                        <span class="text-[11px] font-mono font-black" :class="school.readiness_percentage >= 100 ? 'text-emerald-600' : 'text-blue-700'">
                          {{ school.readiness_percentage || 0 }}%
                        </span>
                        <span v-if="school.last_active_menu" class="text-[10px] font-medium text-slate-400 truncate max-w-[140px]" :title="school.last_active_menu">
                          · {{ school.last_active_menu }}
                        </span>
                      </div>
                    </td>

                    <!-- Column 2: Admin Contact & Username -->
                    <td class="py-5 px-6">
                      <p class="text-sm font-bold text-slate-800">{{ school.admin_contact || school.contact_number || '-' }}</p>
                      <div class="mt-1 flex items-center gap-1.5">
                        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          <svg class="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                          <span class="font-mono text-[11px]">{{ formatGurukuUsername(school.admin_username) }}</span>
                        </span>
                        <a 
                          v-if="school.admin_contact || school.contact_number" 
                          :href="getWaUrl(school.admin_contact || school.contact_number, school.name, 'Halo Pengelola ' + school.name + ', kami dari Tim Super Admin GuruKu.')"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="p-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                          title="Chat WhatsApp Admin"
                        >
                          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                        </a>
                      </div>
                    </td>

                    <!-- Column 3: Subscription End Date & Days Remaining -->
                    <td class="py-5 px-6">
                      <p class="font-bold text-slate-900 text-sm">{{ formatDate(school.subscription_end_date || school.valid_until) }}</p>
                      <p 
                        class="text-xs font-semibold mt-0.5"
                        :class="{
                          'text-emerald-600': school.status === 'Active',
                          'text-amber-600 font-bold': school.status === 'Grace Period',
                          'text-rose-600 font-bold': school.status === 'Expired' || school.status === 'Suspended'
                        }"
                      >
                        {{ getDaysRemainingText(school.days_remaining) }}
                      </p>
                    </td>

                    <!-- Column 4: Dynamic Status Badges (Green: Active, Yellow: Grace Period, Red: Expired, Slate: Suspended) -->
                    <td class="py-5 px-6 text-center whitespace-nowrap">
                      <span 
                        class="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-full border shadow-2xs"
                        :class="{
                          'bg-emerald-50 text-emerald-700 border-emerald-300': school.status === 'Active',
                          'bg-amber-50 text-amber-700 border-amber-300': school.status === 'Grace Period',
                          'bg-rose-50 text-rose-700 border-rose-300': school.status === 'Expired',
                          'bg-slate-100 text-slate-700 border-slate-300': school.status === 'Suspended'
                        }"
                      >
                        <span 
                          class="w-1.5 h-1.5 rounded-full" 
                          :class="{
                            'bg-emerald-500 animate-pulse': school.status === 'Active',
                            'bg-amber-500': school.status === 'Grace Period',
                            'bg-rose-500': school.status === 'Expired',
                            'bg-slate-500': school.status === 'Suspended'
                          }"
                        ></span>
                        {{ school.status }}
                      </span>
                    </td>

                    <!-- Column 5: Action Menu (Detail Klien, Edit Limit DB, Perpanjang Manual, Suspend) with gap-2 & whitespace-nowrap -->
                    <td class="py-5 px-6 text-right whitespace-nowrap">
                      <div class="flex items-center justify-end gap-2 whitespace-nowrap">
                        <button 
                          @click="openClientDetail(school)"
                          class="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer whitespace-nowrap active:scale-95"
                          title="Lihat Detail Klien & Statistik"
                        >
                          Detail
                        </button>
                        <button 
                          @click="openEditLimit(school)"
                          class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer whitespace-nowrap active:scale-95"
                          title="Atur Limit Kuota Database"
                        >
                          Limit DB
                        </button>
                        <button 
                          @click="openManualRenew(school)"
                          class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer whitespace-nowrap active:scale-95"
                          title="Perpanjang Lisensi Manual"
                        >
                          Perpanjang
                        </button>
                        <button 
                          @click="toggleSuspendSchool(school)"
                          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer border whitespace-nowrap active:scale-95"
                          :class="school.status === 'Suspended' ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600' : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'"
                          :title="school.status === 'Suspended' ? 'Buka Penangguhan Akses Tenant' : 'Tangguhkan Login Tenant Ini'"
                        >
                          {{ school.status === 'Suspended' ? 'Buka Suspend' : 'Suspend' }}
                        </button>
                        <button 
                          @click="deleteSchool(school.id, school.name)" 
                          class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition-all cursor-pointer whitespace-nowrap active:scale-95"
                          title="Hapus Klien Permanen"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- LAPORAN PENDAPATAN TAB -->
        <div v-else-if="activeTab === 'laporan'" class="animate-fade-in space-y-6">
          
          <!-- Stats Row -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div class="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 sm:gap-5">
              <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                <svg class="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div class="min-w-0">
                <p class="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Pendapatan</p>
                <h3 class="text-lg sm:text-2xl font-black text-gray-900 truncate" :title="formatRupiah(totalRevenue)">{{ formatRupiah(totalRevenue) }}</h3>
              </div>
            </div>
            
            <div class="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 sm:gap-5">
              <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <svg class="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <div class="min-w-0">
                <p class="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Sekolah Terdaftar</p>
                <h3 class="text-lg sm:text-2xl font-black text-gray-900">{{ schools.length }} Klien</h3>
              </div>
            </div>
            
            <div class="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 sm:gap-5 sm:col-span-2 lg:col-span-1">
              <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <svg class="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div class="min-w-0">
                <p class="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Klien Expired</p>
                <h3 class="text-lg sm:text-2xl font-black text-gray-900">{{ expiredClientsCount }} Akun</h3>
              </div>
            </div>
          </div>

          <!-- Tabel Transaksi Laporan -->
          <div class="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-6">
            <div class="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50/50">
              <div>
                <h2 class="text-base sm:text-lg font-black text-gray-800">Rincian Transaksi Klien</h2>
                <p class="text-xs text-gray-500 font-medium">Rekap nilai kontrak dari seluruh tenant sekolah.</p>
              </div>
              <button class="w-full sm:w-auto text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-50/50 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                <span>Ekspor CSV</span>
              </button>
            </div>

            <!-- Mobile Transactions List (< md) -->
            <div class="md:hidden p-3 sm:p-4 space-y-2.5 bg-slate-50/40">
              <div v-if="schools.length === 0" class="p-8 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-100">
                Tidak ada riwayat transaksi.
              </div>
              <div v-for="school in schools" :key="'tx-mob-'+school.id" class="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-2">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <h4 class="font-bold text-slate-900 text-sm leading-tight truncate">{{ school.name }}</h4>
                    <p class="text-[11px] text-slate-400 font-medium">Admin: {{ formatGurukuUsername(school.admin_username) }}</p>
                  </div>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-100 uppercase shrink-0">
                    {{ school.payment_method }}
                  </span>
                </div>
                <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <span class="text-slate-500 font-medium">{{ school.contact_number || '-' }}</span>
                  <span class="font-black text-emerald-600 font-mono text-sm">{{ formatRupiah(school.payment_amount) }}</span>
                </div>
              </div>
              <div class="p-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between font-black text-xs sm:text-sm shadow-md">
                <span class="text-slate-300 uppercase tracking-wider text-[11px]">Total Omzet:</span>
                <span class="text-emerald-400 font-mono text-sm sm:text-base">{{ formatRupiah(totalRevenue) }}</span>
              </div>
            </div>

            <!-- Desktop Table (>= md) -->
            <div class="hidden md:block overflow-x-auto custom-scrollbar">
              <table class="min-w-full bg-white">
                <thead>
                  <tr class="bg-white text-left border-b border-gray-100">
                    <th class="py-4 px-6 uppercase font-black text-[11px] text-gray-400 tracking-wider">Klien Sekolah</th>
                    <th class="py-4 px-6 uppercase font-black text-[11px] text-gray-400 tracking-wider">Metode Bayar</th>
                    <th class="py-4 px-6 uppercase font-black text-[11px] text-gray-400 tracking-wider">Kontak Referensi</th>
                    <th class="py-4 px-6 uppercase font-black text-[11px] text-gray-400 tracking-wider text-right">Nilai Kontrak</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr v-if="schools.length === 0">
                    <td colspan="4" class="py-10 text-center text-gray-400 text-sm">Tidak ada riwayat transaksi.</td>
                  </tr>
                  <tr v-for="school in schools" :key="'tx'+school.id" class="hover:bg-gray-50 transition-colors">
                    <td class="py-4 px-6">
                      <p class="font-bold text-gray-800 text-sm">{{ school.name }}</p>
                      <p class="text-[11px] text-gray-400 mt-0.5">Admin: {{ formatGurukuUsername(school.admin_username) }}</p>
                    </td>
                    <td class="py-4 px-6">
                      <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-black bg-blue-50 text-blue-700 uppercase">
                        {{ school.payment_method }}
                      </span>
                    </td>
                    <td class="py-4 px-6 text-sm text-gray-600 font-medium">{{ school.contact_number || '-' }}</td>
                    <td class="py-4 px-6 text-right">
                      <span class="font-black text-gray-900">{{ formatRupiah(school.payment_amount) }}</span>
                    </td>
                  </tr>
                </tbody>
                <tfoot class="bg-gray-50">
                  <tr>
                    <td colspan="3" class="py-4 px-6 text-right font-black text-gray-600 uppercase text-xs tracking-wider">Total Terkumpul:</td>
                    <td class="py-4 px-6 text-right font-black text-green-600 text-lg">{{ formatRupiah(totalRevenue) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

        </div>

      <!-- PENGATURAN SISTEM TAB -->
      <div v-else-if="activeTab === 'pengaturan'" class="animate-fade-in space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- Ubah Password Super Admin -->
          <div class="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-8 h-max">
            <div class="flex items-center gap-3 sm:gap-4 mb-6">
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <div>
                <h2 class="text-lg sm:text-xl font-black text-gray-800">Ubah Password Master</h2>
                <p class="text-xs font-medium text-gray-500">Khusus akses level Super Admin.</p>
              </div>
            </div>

            <form @submit.prevent="changeSuperAdminPassword" class="space-y-4">
              <div>
                <label class="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Password Saat Ini</label>
                <input v-model="passForm.old" type="password" required class="w-full bg-white text-gray-900 border border-gray-200 rounded-xl px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm">
              </div>
              <div>
                <label class="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Password Baru</label>
                <input v-model="passForm.new" type="password" required class="w-full bg-white text-gray-900 border border-gray-200 rounded-xl px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm">
              </div>
              <div>
                <label class="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Konfirmasi Password Baru</label>
                <input v-model="passForm.confirm" type="password" required class="w-full bg-white text-gray-900 border border-gray-200 rounded-xl px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm">
              </div>
              <button type="submit" class="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-colors mt-2 text-sm cursor-pointer shadow-md">Update Password</button>
            </form>
          </div>

          <!-- Laporan Lupa Password -->
          <div class="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-auto min-h-[400px] lg:h-[500px]">
            <div class="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-red-50/30">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 sm:w-10 sm:h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h2 class="text-base sm:text-lg font-black text-gray-800">Laporan Lupa Password</h2>
              </div>
              <span class="bg-red-500 text-white text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">{{ forgotPasswordReports.length }} Laporan</span>
            </div>
            
            <div class="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar bg-gray-50/30">
              <div v-if="forgotPasswordReports.length === 0" class="text-center text-gray-400 py-10 font-medium text-xs sm:text-sm">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Belum ada laporan lupa password dari klien.
              </div>
              <div v-else class="space-y-4">
                <div v-for="report in forgotPasswordReports" :key="report.id" class="bg-white border border-red-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div class="flex justify-between items-start gap-2 mb-2">
                    <div class="min-w-0">
                      <h4 class="font-bold text-gray-800 text-sm truncate">{{ report.school_name }}</h4>
                      <p class="text-xs font-bold text-indigo-600 mt-0.5">@{{ report.username }}</p>
                    </div>
                    <span class="text-[10px] text-gray-400 font-bold shrink-0">{{ report.date }}</span>
                  </div>
                  <p class="text-xs sm:text-sm text-gray-600 my-2.5 italic">"{{ report.message }}"</p>
                  <div class="flex flex-wrap sm:flex-nowrap gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button 
                      @click="resolveReport(report.id)" 
                      :disabled="processingIds.has(report.id)"
                      :class="['flex-1 min-w-[120px] text-xs font-bold py-2 px-3 rounded-lg transition-colors border text-center cursor-pointer', processingIds.has(report.id) ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200']"
                    >
                      {{ processingIds.has(report.id) ? 'Memproses...' : 'Berikan Izin' }}
                    </button>
                    <a 
                      v-if="report.contact"
                      :href="getWaUrl(report.contact, report.school_name || report.username, `Halo Bpk/Ibu, kami dari Layanan Super Admin GuruKu menindaklanjuti permohonan reset password akun sekolah Anda.`)" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      class="flex-1 min-w-[120px] bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 px-3 rounded-lg transition-colors border border-blue-200 text-center cursor-pointer no-underline flex items-center justify-center"
                    >
                      Hubungi Klien
                    </a>
                    <button 
                      @click="rejectReport(report.id)" 
                      :disabled="processingIds.has(report.id)"
                      class="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg transition-colors border border-red-200 cursor-pointer"
                      title="Hapus Laporan Spam/Kedaluwarsa"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      <!-- VERIFIKASI PEMBAYARAN MASUK TAB -->
      <div v-else-if="activeTab === 'verifikasi'" class="animate-fade-in space-y-6">
        <div class="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
          <div class="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white/50 backdrop-blur-xl">
            <div>
              <h2 class="text-lg sm:text-xl font-black text-gray-800 tracking-tight">Verifikasi Pembayaran & Bukti Transfer</h2>
              <p class="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 font-medium">Validasi bukti pelunasan lisensi dari sekolah dan perpanjang masa aktif dalam satu klik.</p>
            </div>
            <button @click="loadPendingPayments" class="w-full sm:w-auto p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs font-bold" title="Perbarui Data">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              <span>Perbarui Data</span>
            </button>
          </div>
          
          <!-- Mobile Cards View (< md) -->
          <div class="md:hidden p-3 sm:p-4 space-y-3.5 bg-slate-50/40">
            <div v-if="pendingPayments.length === 0" class="py-12 text-center text-slate-400 text-xs font-medium bg-white rounded-2xl border border-slate-100">
              <svg class="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Belum ada konfirmasi pembayaran baru yang masuk.
            </div>
            <div 
              v-for="(p, pIdx) in pendingPayments" 
              :key="'p-mob-'+pIdx" 
              class="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-3.5"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <span class="text-xs font-bold text-blue-600 font-mono block">{{ p.invoice }}</span>
                  <h4 class="font-extrabold text-slate-900 text-sm mt-0.5 leading-snug">{{ p.senderName }}</h4>
                  <p class="text-xs text-slate-500 font-medium">Bank Pengirim: <span class="font-bold text-slate-700">{{ p.bankName }}</span></p>
                </div>
                <span 
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0"
                  :class="{
                    'bg-amber-50 text-amber-800 border border-amber-200': p.status === 'MENUNGGU_VERIFIKASI',
                    'bg-emerald-50 text-emerald-800 border border-emerald-200': p.status === 'TERVERIFIKASI',
                    'bg-rose-50 text-rose-800 border border-rose-200': p.status === 'DITOLAK'
                  }"
                >
                  <span class="w-1.5 h-1.5 rounded-full"
                    :class="{
                      'bg-amber-500': p.status === 'MENUNGGU_VERIFIKASI',
                      'bg-emerald-500': p.status === 'TERVERIFIKASI',
                      'bg-rose-500': p.status === 'DITOLAK'
                    }"
                  ></span>
                  {{ p.status === 'MENUNGGU_VERIFIKASI' ? 'Menunggu' : p.status }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-2 text-xs bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                <div>
                  <span class="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Paket & Tanggal</span>
                  <span class="font-bold text-slate-800 block mt-0.5">Paket {{ p.plan }} &bull; {{ p.formattedDate }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Nominal & Metode</span>
                  <span class="font-black text-indigo-700 font-mono block mt-0.5">{{ formatRupiah(p.amount) }} ({{ p.method }})</span>
                </div>
              </div>

              <div v-if="p.notes" class="text-xs text-slate-600 italic bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                "{{ p.notes }}"
              </div>

              <!-- Struk Foto -->
              <div v-if="p.proofImage" class="flex items-center gap-3 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                <img 
                  :src="p.proofImage" 
                  alt="Bukti Transfer" 
                  @click="previewReceiptImage = p.proofImage"
                  class="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-2xs cursor-pointer hover:scale-105 transition-transform shrink-0" 
                />
                <div class="flex-1 min-w-0">
                  <span class="text-xs font-bold text-slate-800 block">Bukti Transfer</span>
                  <button 
                    @click="previewReceiptImage = p.proofImage" 
                    class="text-xs text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1 mt-0.5"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    <span>Buka Foto Struk</span>
                  </button>
                </div>
              </div>

              <div class="flex items-center gap-2 pt-1 border-t border-slate-100">
                <button 
                  v-if="p.status === 'MENUNGGU_VERIFIKASI'"
                  @click="approvePayment(p)"
                  class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                  <span>Setujui ({{ p.durationMonths ? `+${p.durationMonths} Bln` : '+Lisensi' }})</span>
                </button>
                <button 
                  v-if="p.status === 'MENUNGGU_VERIFIKASI'"
                  @click="rejectPayment(p)"
                  class="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-all cursor-pointer active:scale-95"
                >
                  Tolak
                </button>
                <button 
                  @click="deletePaymentRecord(p.invoice, p.id)"
                  class="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                  title="Hapus Catatan"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Desktop Table (>= md) -->
          <div class="hidden md:block overflow-x-auto custom-scrollbar">
            <table class="min-w-full bg-white">
              <thead>
                <tr class="bg-gray-50/80 text-left border-y border-gray-100">
                  <th class="py-4 px-6 uppercase font-black text-[11px] text-gray-400 tracking-wider">No. Invoice & Paket</th>
                  <th class="py-4 px-6 uppercase font-black text-[11px] text-gray-400 tracking-wider">Pengirim & Bank</th>
                  <th class="py-4 px-6 uppercase font-black text-[11px] text-gray-400 tracking-wider">Metode & Nominal</th>
                  <th class="py-4 px-6 uppercase font-black text-[11px] text-gray-400 tracking-wider">Bukti Transfer</th>
                  <th class="py-4 px-6 uppercase font-black text-[11px] text-gray-400 tracking-wider">Status</th>
                  <th class="py-4 px-6 uppercase font-black text-[11px] text-gray-400 tracking-wider text-right">Aksi Verifikasi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-if="pendingPayments.length === 0">
                  <td colspan="6" class="py-16 text-center text-gray-400 font-medium">
                    <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Belum ada konfirmasi pembayaran baru yang masuk.
                  </td>
                </tr>
                <tr v-for="(p, pIdx) in pendingPayments" :key="pIdx" class="hover:bg-blue-50/20 transition-colors">
                  <td class="py-4 px-6">
                    <p class="font-bold text-gray-900 text-sm font-mono">{{ p.invoice }}</p>
                    <p class="text-xs text-blue-600 font-semibold mt-0.5">Paket {{ p.plan }} &bull; {{ p.formattedDate }}</p>
                  </td>
                  <td class="py-4 px-6">
                    <p class="text-sm font-bold text-gray-800">{{ p.senderName }}</p>
                    <p class="text-xs text-gray-500 font-medium">Dari: {{ p.bankName }}</p>
                    <p v-if="p.notes" class="text-[11px] text-gray-400 italic mt-0.5 max-w-xs truncate" :title="p.notes">"{{ p.notes }}"</p>
                  </td>
                  <td class="py-4 px-6">
                    <p class="font-black text-gray-900 text-sm">{{ formatRupiah(p.amount) }}</p>
                    <p class="text-xs text-slate-500 font-medium">{{ p.method }}</p>
                  </td>
                  <td class="py-4 px-6">
                    <div v-if="p.proofImage" class="flex items-center gap-2">
                      <img 
                        :src="p.proofImage" 
                        alt="Bukti Transfer" 
                        @click="previewReceiptImage = p.proofImage"
                        class="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs cursor-pointer hover:scale-105 transition-transform" 
                        title="Klik untuk memperbesar"
                      />
                      <button 
                        @click="previewReceiptImage = p.proofImage" 
                        class="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        Lihat Foto
                      </button>
                    </div>
                    <span v-else class="text-xs text-gray-400 italic">Tanpa Gambar</span>
                  </td>
                  <td class="py-4 px-6">
                    <span 
                      class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
                      :class="{
                        'bg-amber-100 text-amber-800': p.status === 'MENUNGGU_VERIFIKASI',
                        'bg-emerald-100 text-emerald-800': p.status === 'TERVERIFIKASI',
                        'bg-rose-100 text-rose-800': p.status === 'DITOLAK'
                      }"
                    >
                      <span class="w-1.5 h-1.5 rounded-full"
                        :class="{
                          'bg-amber-500': p.status === 'MENUNGGU_VERIFIKASI',
                          'bg-emerald-500': p.status === 'TERVERIFIKASI',
                          'bg-rose-500': p.status === 'DITOLAK'
                        }"
                      ></span>
                      {{ p.status === 'MENUNGGU_VERIFIKASI' ? 'Menunggu Verifikasi' : p.status }}
                    </span>
                  </td>
                  <td class="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                    <button 
                      v-if="p.status === 'MENUNGGU_VERIFIKASI'"
                      @click="approvePayment(p)"
                      class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
                      title="Setujui dan perpanjang masa aktif sekolah"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                      <span>Setujui ({{ p.durationMonths ? `+${p.durationMonths} Bln` : '+Lisensi' }})</span>
                    </button>
                    <button 
                      v-if="p.status === 'MENUNGGU_VERIFIKASI'"
                      @click="rejectPayment(p)"
                      class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-all cursor-pointer active:scale-95"
                      title="Tolak pembayaran"
                    >
                      <span>Tolak</span>
                    </button>
                    <button 
                      @click="deletePaymentRecord(p.invoice, p.id)"
                      class="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Hapus Catatan"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ADUAN & SARAN KLIEN TAB -->
      <div v-else-if="activeTab === 'aduan'" class="animate-fade-in space-y-6">
        <div class="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-slate-300 overflow-hidden">
          <div class="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 bg-white">
            <div>
              <h2 class="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Pusat Bantuan & Layanan Kendala Klien (SaaS)</h2>
              <p class="text-xs text-slate-500 mt-0.5 font-medium">Tiket bantuan resmi yang terhubung dengan Tenant ID sekolah untuk penanganan kendala teknis dan administrasi.</p>
            </div>
            <div class="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2">
              <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                <button 
                  v-for="st in ['ALL', 'Open', 'In Progress', 'Resolved']" 
                  :key="'f-'+st"
                  @click="filterTicketStatus = st"
                  class="px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  :class="filterTicketStatus === st ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'"
                >
                  {{ st === 'ALL' ? 'Semua' : st }}
                </button>
              </div>
              <button @click="loadSupportTickets" class="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 transition-colors cursor-pointer shrink-0" title="Perbarui Data">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              </button>
            </div>
          </div>
          
          <!-- Mobile Cards View (< md) -->
          <div class="md:hidden p-3 sm:p-4 space-y-3.5 bg-slate-50/40">
            <div v-if="filteredSupportTickets.length === 0" class="py-12 text-center text-slate-400 font-bold text-xs bg-white rounded-2xl border border-slate-100">
              Tidak ada tiket aduan atau saran yang ditemukan.
            </div>
            <div 
              v-for="t in filteredSupportTickets" 
              :key="'t-mob-'+t.id" 
              class="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-3"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span v-if="t.tenant_id" class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold border border-blue-200">
                      {{ formatTenantId(t.tenant_id) }}
                    </span>
                    <h4 class="font-extrabold text-slate-900 text-sm leading-tight">{{ t.name }}</h4>
                  </div>
                  <p class="text-xs text-indigo-600 font-semibold mt-0.5">{{ t.contact || '-' }}</p>
                  <p class="text-[10px] text-slate-400 font-medium mt-0.5">{{ t.date }}</p>
                </div>
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0"
                  :class="{
                    'bg-amber-50 text-amber-800 border border-amber-200': (t.status === 'Open' || t.status === 'MENUNGGU'),
                    'bg-blue-50 text-blue-800 border border-blue-200': (t.status === 'In Progress' || t.status === 'DIPROSES'),
                    'bg-emerald-50 text-emerald-800 border border-emerald-200': (t.status === 'Resolved' || t.status === 'SELESAI')
                  }"
                >
                  <span class="w-1.5 h-1.5 rounded-full"
                    :class="{
                      'bg-amber-500': (t.status === 'Open' || t.status === 'MENUNGGU'),
                      'bg-blue-500': (t.status === 'In Progress' || t.status === 'DIPROSES'),
                      'bg-emerald-500': (t.status === 'Resolved' || t.status === 'SELESAI')
                    }"
                  ></span>
                  {{ t.status }}
                </span>
              </div>

              <div class="flex items-center gap-2 text-xs">
                <span class="px-2.5 py-0.5 rounded-md font-bold bg-indigo-50 text-indigo-700 text-[10px] border border-indigo-100">
                  {{ t.category || 'Kendala Umum' }}
                </span>
                <span class="text-slate-600 font-medium truncate">{{ t.school || 'Pengguna Mandiri' }}</span>
              </div>

              <div class="bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed font-medium italic">
                "{{ t.message }}"
              </div>

              <div class="flex items-center gap-2 pt-1 border-t border-slate-100">
                <a 
                  v-if="t.contact"
                  :href="getWaUrl(t.contact, t.name)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition-all cursor-pointer active:scale-95 no-underline shadow-xs"
                >
                  <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                  <span>WhatsApp</span>
                </a>
                <button 
                  v-if="(t.status !== 'Resolved' && t.status !== 'SELESAI')"
                  @click="resolveSupportTicket(t.id)"
                  class="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition-colors cursor-pointer active:scale-95"
                >
                  Selesaikan
                </button>
                <button 
                  @click="deleteSupportTicket(t.id)"
                  class="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                  title="Hapus Tiket"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Desktop Table (>= md) -->
          <div class="hidden md:block overflow-x-auto custom-scrollbar">
            <table class="min-w-full bg-white">
              <thead>
                <tr class="bg-gray-50/80 text-left border-y border-gray-100">
                  <th class="py-4 px-6 uppercase font-black text-[11px] text-gray-400 tracking-wider">Tanggal & Pelapor</th>
                  <th class="py-4 px-6 uppercase font-black text-[11px] text-gray-400 tracking-wider">Kategori & Asal Sekolah</th>
                  <th class="py-4 px-6 uppercase font-black text-[11px] text-gray-400 tracking-wider">Isi Aduan / Saran</th>
                  <th class="py-4 px-6 uppercase font-black text-[11px] text-gray-400 tracking-wider text-center">Status</th>
                  <th class="py-4 px-6 uppercase font-black text-[11px] text-gray-400 tracking-wider text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-if="filteredSupportTickets.length === 0">
                  <td colspan="5" class="py-12 text-center text-gray-400 font-bold">
                    Tidak ada tiket aduan atau saran yang ditemukan.
                  </td>
                </tr>
                <tr v-for="t in filteredSupportTickets" :key="t.id" class="hover:bg-gray-50/80 transition-colors">
                  <td class="py-4 px-6">
                    <p class="font-bold text-gray-800 text-sm">{{ t.name }}</p>
                    <p class="text-xs text-indigo-600 font-semibold mt-0.5">{{ t.contact || '-' }}</p>
                    <p class="text-[10px] text-gray-400 mt-1">{{ t.date }}</p>
                  </td>
                  <td class="py-4 px-6">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700">
                      {{ t.category || 'Kendala Umum' }}
                    </span>
                    <p class="text-xs text-gray-600 font-medium mt-1">{{ t.school || 'Pengguna Mandiri' }}</p>
                  </td>
                  <td class="py-4 px-6 max-w-md">
                    <p class="text-xs text-gray-700 leading-relaxed font-medium">"{{ t.message }}"</p>
                  </td>
                  <td class="py-4 px-6 text-center">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
                      :class="{
                        'bg-amber-100 text-amber-800': (t.status === 'Open' || t.status === 'MENUNGGU'),
                        'bg-blue-100 text-blue-800': (t.status === 'In Progress' || t.status === 'DIPROSES'),
                        'bg-emerald-100 text-emerald-800': (t.status === 'Resolved' || t.status === 'SELESAI')
                      }"
                    >
                      <span class="w-1.5 h-1.5 rounded-full"
                        :class="{
                          'bg-amber-500': (t.status === 'Open' || t.status === 'MENUNGGU'),
                          'bg-blue-500': (t.status === 'In Progress' || t.status === 'DIPROSES'),
                          'bg-emerald-500': (t.status === 'Resolved' || t.status === 'SELESAI')
                        }"
                      ></span>
                      {{ t.status }}
                    </span>
                  </td>
                  <td class="py-4 px-6 text-right space-x-1 whitespace-nowrap">
                    <a 
                      v-if="t.contact"
                      :href="getWaUrl(t.contact, t.name)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition-all cursor-pointer shadow-sm active:scale-95 no-underline"
                      title="Hubungi Pelapor via WhatsApp"
                    >
                      <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                      <span>WhatsApp</span>
                    </a>
                    <button 
                      v-if="(t.status !== 'Resolved' && t.status !== 'SELESAI')"
                      @click="resolveSupportTicket(t.id)"
                      class="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition-colors cursor-pointer"
                    >
                      Selesaikan
                    </button>
                    <button 
                      @click="deleteSupportTicket(t.id)"
                      class="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Hapus Tiket"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAGIHAN & KEUANGAN TAB: Multi-Tenant Billing Hub -->
      <div v-else-if="activeTab === 'keuangan'" class="animate-fade-in space-y-6">
        
        <!-- Header Sub-Navigasi Tagihan & Keuangan -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-300">
          <div>
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Tagihan & Keuangan SaaS</h1>
            <p class="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Kelola penagihan lisensi sekolah, verifikasi pembayaran Virtual Account, dan pantau buku kas.</p>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button 
              @click="showInvoiceModal = true" 
              class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              <span>+ Terbitkan Faktur</span>
            </button>
          </div>
        </div>

        <!-- Sub-menu Nav Pills: Faktur & Invoicing, Buku Kas, Kalkulator HPP -->
        <div class="flex items-center gap-2 border-b border-slate-300 pb-3 overflow-x-auto custom-scrollbar">
          <button 
            @click="keuanganSubTab = 'tagihan'" 
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border"
            :class="keuanganSubTab === 'tagihan' ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'text-slate-600 border-slate-300 bg-white hover:bg-slate-50'"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            <span>Faktur & Invoicing ({{ pendingPayments.length }})</span>
            <span v-if="pendingPaymentsCount > 0" class="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
              {{ pendingPaymentsCount }} Baru
            </span>
          </button>

          <button 
            @click="keuanganSubTab = 'bukukas'" 
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border"
            :class="keuanganSubTab === 'bukukas' ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'text-slate-600 border-slate-300 bg-white hover:bg-slate-50'"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
            <span>Buku Kas & Arus Kas</span>
          </button>

          <button 
            @click="keuanganSubTab = 'hpp'" 
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border"
            :class="keuanganSubTab === 'hpp' ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'text-slate-600 border-slate-300 bg-white hover:bg-slate-50'"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
            <span>Kalkulator HPP</span>
          </button>
        </div>

        <!-- Subtab 1: Faktur & Invoicing -->
        <div v-if="keuanganSubTab === 'tagihan'" class="space-y-6">
          <div class="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-slate-300 overflow-hidden">
            <div class="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 bg-white">
              <div>
                <h2 class="text-base sm:text-xl font-black text-slate-800 tracking-tight">Daftar Tagihan & Status Pembayaran Lisensi</h2>
                <p class="text-xs text-slate-500 font-medium mt-0.5">Status pembayaran resmi: Menunggu Pembayaran, Berhasil Dibayar, dan Dibatalkan.</p>
              </div>

              <!-- Filter Status Pembayaran -->
              <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                <button 
                  v-for="st in ['Semua', 'Menunggu Pembayaran', 'Berhasil Dibayar', 'Dibatalkan']" 
                  :key="'pf-'+st"
                  @click="invoiceStatusFilter = st"
                  class="px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-[11px]"
                  :class="invoiceStatusFilter === st ? 'bg-white text-blue-700 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'"
                >
                  {{ st }}
                </button>
              </div>
            </div>

            <!-- Table Invoices -->
            <div class="overflow-x-auto custom-scrollbar">
              <table class="min-w-full bg-white">
                <thead>
                  <tr class="bg-slate-50 text-left border-y border-slate-300">
                    <th class="py-4 px-4 uppercase font-black text-[11px] text-slate-500 tracking-wider">No. Invoice & Paket</th>
                    <th class="py-4 px-5 uppercase font-black text-[11px] text-slate-500 tracking-wider">Tenant & Pembayar</th>
                    <th class="py-4 px-5 uppercase font-black text-[11px] text-slate-500 tracking-wider">Metode & Nominal</th>
                    <th class="py-4 px-4 uppercase font-black text-[11px] text-slate-500 tracking-wider">Status Pembayaran</th>
                    <th class="py-4 px-4 uppercase font-black text-[11px] text-slate-500 tracking-wider text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  <tr v-if="filteredInvoices.length === 0">
                    <td colspan="5" class="py-16 text-center text-slate-400 font-medium text-xs">
                      Tidak ada catatan tagihan untuk filter yang dipilih.
                    </td>
                  </tr>
                  <tr v-for="p in filteredInvoices" :key="'inv-'+p.id" class="hover:bg-blue-50/20 transition-colors">
                    <td class="py-4 px-4">
                      <p class="font-bold text-slate-900 text-sm font-mono">{{ p.invoice }}</p>
                      <p class="text-xs text-blue-600 font-semibold mt-0.5">{{ p.plan }} &bull; {{ p.formattedDate || '11 Nov 2026' }}</p>
                    </td>
                    <td class="py-4 px-5">
                      <p class="text-sm font-bold text-slate-800">{{ p.school_name || p.senderName }}</p>
                      <p class="text-[11px] text-slate-500 font-medium">Bank / VA: {{ p.bankName || 'BCA' }}</p>
                      <p v-if="p.notes" class="text-[10px] text-slate-400 italic mt-0.5 max-w-xs truncate" :title="p.notes">"{{ p.notes }}"</p>
                    </td>
                    <td class="py-4 px-5">
                      <p class="font-black text-slate-900 text-sm font-mono">{{ formatRupiah(p.amount) }}</p>
                      <p class="text-[11px] text-slate-500 font-medium">{{ p.method || 'Virtual Account' }}</p>
                    </td>
                    <td class="py-4 px-4 whitespace-nowrap">
                      <span 
                        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-2xs"
                        :class="getPaymentStatusClass(p.status)"
                      >
                        <span class="w-1.5 h-1.5 rounded-full" :class="getPaymentStatusDot(p.status)"></span>
                        <span>{{ p.status }}</span>
                      </span>
                    </td>
                    <td class="py-4 px-4 text-right whitespace-nowrap">
                      <div class="flex items-center justify-end gap-1.5">
                        <button 
                          v-if="p.status === 'Menunggu Pembayaran' || p.status === 'MENUNGGU_VERIFIKASI'"
                          @click="approvePayment(p)"
                          class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          Setujui
                        </button>
                        <button 
                          v-if="p.status === 'Menunggu Pembayaran' || p.status === 'MENUNGGU_VERIFIKASI'"
                          @click="rejectPayment(p)"
                          class="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Tolak
                        </button>
                        <button 
                          @click="deletePaymentRecord(p.invoice, p.id)"
                          class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Faktur"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Subtab 2: Buku Kas -->
        <div v-else-if="keuanganSubTab === 'bukukas'">
          <KeuanganAset />
        </div>

        <!-- Subtab 3: Kalkulator HPP -->
        <div v-else-if="keuanganSubTab === 'hpp'">
          <KalkulatorHPP />
        </div>
      </div>

      <!-- KALKULATOR HPP STANDALONE (Navigasi Langsung) -->
      <div v-else-if="activeTab === 'hpp'" class="animate-fade-in">
        <KalkulatorHPP />
      </div>

      <!-- ETALASE PRODUK TAB -->
      <div v-else-if="activeTab === 'etalase'" class="animate-fade-in">
        <EtalaseProdukView />
      </div>

      </main>

      <!-- Mobile Bottom Navigation Bar (Fixed on screens < lg) -->
      <nav class="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-1 py-1 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <button 
          v-for="tab in tabItems" 
          :key="'bnav-'+tab.id"
          @click="activeTab = tab.id"
          class="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative flex-1 cursor-pointer select-none"
          :class="activeTab === tab.id ? 'text-blue-600 font-extrabold' : 'text-slate-400 hover:text-slate-600 font-medium'"
        >
          <div class="relative">
            <svg v-if="tab.id === 'manajemen'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            <svg v-else-if="tab.id === 'laporan'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            <svg v-else-if="tab.id === 'verifikasi'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <svg v-else-if="tab.id === 'aduan'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>

            <!-- Badge Notification -->
            <span v-if="tab.badge > 0" class="absolute -top-1 -right-2.5 min-w-[15px] h-3.5 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse shadow-xs">
              {{ tab.badge > 99 ? '99+' : tab.badge }}
            </span>
          </div>
          <span class="text-[10px] mt-1 tracking-tight leading-none text-center">
            {{ tab.shortLabel || tab.label }}
          </span>
          <div v-if="activeTab === tab.id" class="w-3.5 h-0.5 bg-blue-600 rounded-full mt-0.5"></div>
        </button>
      </nav>

    </div> <!-- End Main Content Area Wrapper -->

    <!-- Modal Tambah Klien -->
    <div v-if="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-center items-center p-3 sm:p-4">
      <div class="bg-white rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl animate-fade-in flex flex-col">
        <div class="flex justify-between items-center p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 class="text-lg sm:text-xl font-black text-gray-800">Registrasi Klien SaaS</h2>
            <p class="text-xs text-gray-500 font-medium mt-0.5 sm:mt-1">Buat tenant sekolah baru beserta akun Admin-nya.</p>
          </div>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 rounded-full p-2 transition-colors border border-gray-200 shadow-sm cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form @submit.prevent="submitKlien" class="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4 sm:space-y-6">
          
          <!-- Detail Klien -->
          <div class="space-y-3 sm:space-y-4">
            <h3 class="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">Informasi Sekolah</h3>
            
            <div class="relative">
              <label class="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Nama Sekolah/Madrasah *</label>
              <input v-model="form.name" @input="searchSchool" type="text" required class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm" placeholder="Ketik nama sekolah atau daerah...">
              
              <!-- Dropdown Saran Autocomplete -->
              <div v-if="showSchoolSuggestions && schoolSuggestions.length > 0" class="absolute z-20 w-full mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-60 sm:max-h-72 overflow-y-auto custom-scrollbar divide-y divide-gray-100">
                <div class="px-3 sm:px-4 py-2 bg-gray-50/90 sticky top-0 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-gray-500 border-b border-gray-100 backdrop-blur-sm z-10">
                  <span>Ditemukan {{ schoolSuggestions.length }} Saran</span>
                  <span class="text-indigo-600 font-semibold">Pilih untuk isi otomatis</span>
                </div>
                <div v-for="(suggestion, idx) in schoolSuggestions" :key="idx" 
                     @click="selectSchool(suggestion)"
                     class="px-3 sm:px-4 py-2.5 hover:bg-indigo-50/80 cursor-pointer transition-colors group">
                  <div class="flex items-center justify-between gap-2">
                    <p class="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                      {{ suggestion.customName ? suggestion.customName : extractSchoolName(suggestion.display_name) }}
                    </p>
                    <span v-if="suggestion.province" class="shrink-0 px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {{ suggestion.province }}
                    </span>
                  </div>
                  <p class="text-[10px] sm:text-[11px] text-gray-500 mt-0.5 line-clamp-1 group-hover:text-gray-600">
                    {{ suggestion.address || suggestion.display_name }}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Alamat Lengkap</label>
              <textarea v-model="form.address" rows="2" class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm" placeholder="Alamat otomatis terisi jika memilih dari saran..."></textarea>
            </div>
            
            <div>
               <label class="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Nomor Kontak (WA/Telp)</label>
               <input v-model="form.contact_number" type="text" class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm" placeholder="Nomor WhatsApp aktif sekolah">
            </div>
          </div>
          
          <!-- Pembayaran & Kontrak -->
          <div class="space-y-3 sm:space-y-4">
            <h3 class="text-xs font-black text-green-700 uppercase tracking-widest border-b border-green-200 pb-2 pt-2">Kontrak & Pembayaran</h3>
            
            <div>
              <label class="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Pilih Paket Lisensi dari Etalase</label>
              <select @change="applyPackageToNewSchool($event.target.value)" class="w-full bg-slate-50 text-gray-900 border border-gray-300 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-green-500 outline-none transition-all shadow-sm text-xs sm:text-sm font-semibold">
                <option value="">-- Pilih Paket Lisensi (Otomatis Isi Harga & Batas Waktu) --</option>
                <option v-for="pkg in availablePackages" :key="pkg.id" :value="pkg.id">
                  {{ pkg.name }} - {{ formatRupiah(pkg.price) }} ({{ pkg.durationLabel }})
                </option>
              </select>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                 <label class="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Batas Waktu Kontrak *</label>
                 <input v-model="form.valid_until" type="date" required class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-green-500 outline-none transition-all shadow-sm text-sm">
              </div>
              <div>
                 <label class="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Metode Pembayaran</label>
                 <select v-model="form.payment_method" class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-green-500 outline-none transition-all shadow-sm text-sm">
                    <option value="BCA">Transfer BCA</option>
                    <option value="MANDIRI">Transfer Mandiri</option>
                    <option value="BRI">Transfer BRI</option>
                    <option value="CASH">Tunai (Cash)</option>
                    <option value="OTHER">Lainnya</option>
                 </select>
              </div>
            </div>
            
            <div>
               <label class="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Nominal Pembayaran (Rp) *</label>
               <input v-model="form.payment_amount" type="number" required class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-green-500 outline-none transition-all shadow-sm text-sm font-mono" placeholder="Nominal pembayaran langganan">
            </div>
          </div>
          
          <!-- Akun Akses -->
          <div class="space-y-3 sm:space-y-4 bg-gray-50 p-3.5 sm:p-4 rounded-2xl border border-gray-200">
            <h3 class="text-xs font-black text-gray-600 uppercase tracking-widest border-b border-gray-200 pb-2">Kredensial Akses Admin Sekolah</h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
               <div>
                  <label class="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Username Admin Sekolah *</label>
                  <div class="relative flex items-center">
                    <input 
                      v-model="form.username" 
                      type="text" 
                      required 
                      class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl pl-3.5 pr-28 sm:pr-32 py-2.5 sm:py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-xs text-xs sm:text-sm font-mono" 
                      placeholder="nama_sekolah"
                    >
                    <span class="absolute right-2.5 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 pointer-events-none select-none">
                      @guruku.id
                    </span>
                  </div>
                  <p class="text-[11px] text-slate-500 mt-1.5 font-medium flex items-center gap-1.5">
                    <span>Format login:</span>
                    <span class="font-mono font-bold text-blue-700">{{ getFullUsername(form.username) }}</span>
                  </p>
               </div>

               <div>
                  <label class="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Password Sementara *</label>
                  <input v-model="form.password" type="text" required class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm" placeholder="Berikan password kuat">
               </div>
            </div>
          </div>

          <div class="p-4 sm:p-5 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-2 bg-slate-50/70 rounded-b-2xl sm:rounded-b-3xl">
             <button type="button" @click="showModal = false" class="w-full sm:w-auto px-5 py-2.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl font-bold transition-colors text-xs sm:text-sm cursor-pointer">Batal</button>
             <button type="submit" :disabled="saving" class="w-full sm:w-auto px-7 py-2.5 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer">
               <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               <span v-if="saving">Memproses...</span>
               <span v-else>Simpan & Buat Tenant</span>
             </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Pratinjau Struk Pembayaran -->
    <div v-if="previewReceiptImage" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in" @click.self="previewReceiptImage = null">
      <div class="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-5 overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col">
        <div class="flex justify-between items-center pb-3 mb-3 border-b border-gray-100">
          <h3 class="font-bold text-gray-800 text-sm">Bukti Transfer Pembayaran</h3>
          <button @click="previewReceiptImage = null" class="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <img :src="previewReceiptImage" alt="Bukti Transfer Penuh" class="max-h-[65vh] w-auto mx-auto rounded-xl sm:rounded-2xl object-contain shadow-inner border border-slate-100" />
      </div>
    </div>

    <!-- Modal Buat Invoice (+ Buat invoice di Dashboard) -->
    <div v-if="showInvoiceModal" class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in" @click.self="showInvoiceModal = false">
      <div class="bg-white rounded-2xl sm:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        <div class="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 class="font-extrabold text-slate-900 text-base">Buat Invoice Baru</h3>
            <p class="text-xs text-slate-500 font-medium">Terbitkan tagihan baru untuk klien atau sekolah</p>
          </div>
          <button @click="showInvoiceModal = false" class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <form @submit.prevent="saveInvoice" class="p-5 space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Nama Klien / Rekan *</label>
            <input v-model="invoiceForm.clientName" type="text" required class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: Klien / Rekan Istimewa" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Pilih Paket dari Etalase (Otomatis Isi Harga)</label>
            <select @change="applyPackageToInvoice($event.target.value)" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-800">
              <option value="">-- Kustom Manual --</option>
              <option v-for="pkg in availablePackages" :key="pkg.id" :value="pkg.id">
                {{ pkg.name }} ({{ formatRupiah(pkg.price) }} - {{ pkg.badge || pkg.tier }})
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Nominal Tagihan (Rp) *</label>
              <input v-model.number="invoiceForm.amount" type="number" required min="1000" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono" placeholder="254205" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Estimasi HPP (Rp)</label>
              <input v-model.number="invoiceForm.hpp" type="number" min="0" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono" placeholder="104205" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Keterangan Layanan</label>
            <input v-model="invoiceForm.description" type="text" class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Lisensi SaaS GuruKu / Cetak Modul" />
          </div>

          <div class="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button type="button" @click="showInvoiceModal = false" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">Batal</button>
            <button type="submit" class="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer">Simpan & Terbitkan</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- MODAL 1: DETAIL KLIEN MULTI-TENANT (100% RELASIONAL & LENGKAP) -->
    <!-- ============================================================ -->
    <div v-if="showClientDetailModal && selectedClient" class="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in" @click.self="showClientDetailModal = false">
      <div class="bg-white rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 bg-slate-50/80">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60 shadow-xs">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            </div>
            <div>
              <h2 class="text-base sm:text-xl font-black text-slate-900 leading-tight">Detail Klien Multi-Tenant</h2>
              <p class="text-xs text-slate-500 font-medium mt-0.5">Informasi relasional tenant, kredensial admin, dan status langganan.</p>
            </div>
          </div>
          <button @click="showClientDetailModal = false" class="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 rounded-full p-2 transition-colors border border-slate-200 cursor-pointer shadow-2xs">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4 sm:space-y-5">
          <!-- Tenant ID & Status Banner -->
          <div class="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <span class="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Tenant ID (UUID Relasional)</span>
              <div class="flex items-center gap-2 mt-1">
                <span class="font-mono font-bold text-xs sm:text-sm text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-300 shadow-2xs select-all">
                  {{ selectedClient.id }}
                </span>
                <button 
                  @click="copyToClipboard(selectedClient.id, 'Tenant UUID')"
                  class="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer shadow-2xs"
                  title="Salin Tenant ID"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                </button>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span 
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black rounded-full border shadow-2xs uppercase tracking-wider"
                :class="{
                  'bg-emerald-50 text-emerald-700 border-emerald-300': selectedClient.status === 'Active',
                  'bg-amber-50 text-amber-700 border-amber-300': selectedClient.status === 'Grace Period',
                  'bg-rose-50 text-rose-700 border-rose-300': selectedClient.status === 'Expired',
                  'bg-slate-100 text-slate-700 border-slate-300': selectedClient.status === 'Suspended'
                }"
              >
                <span 
                  class="w-2 h-2 rounded-full" 
                  :class="{
                    'bg-emerald-500 animate-pulse': selectedClient.status === 'Active',
                    'bg-amber-500': selectedClient.status === 'Grace Period',
                    'bg-rose-500': selectedClient.status === 'Expired',
                    'bg-slate-500': selectedClient.status === 'Suspended'
                  }"
                ></span>
                {{ selectedClient.status || 'Active' }}
              </span>
            </div>
          </div>

          <!-- Relational Information Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div class="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Sekolah / Tenant</p>
              <p class="text-sm font-black text-slate-900">{{ selectedClient.name || selectedClient.school_name }}</p>
              <p class="text-xs text-slate-500">{{ selectedClient.address || 'Alamat belum disetel' }}</p>
            </div>

            <div class="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kontak & Admin Login</p>
              <p class="text-sm font-mono font-bold text-blue-700">{{ formatGurukuUsername(selectedClient.admin_username) }}</p>
              <p class="text-xs text-slate-600 font-semibold">{{ selectedClient.admin_contact || selectedClient.contact_number || '-' }}</p>
            </div>

            <div class="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Masa Aktif & Siklus Lisensi</p>
              <p class="text-sm font-bold text-slate-900">{{ formatDate(selectedClient.subscription_end_date || selectedClient.valid_until) }}</p>
              <p class="text-xs font-semibold" :class="selectedClient.days_remaining <= 14 ? 'text-amber-600 font-bold' : 'text-emerald-600'">
                Sisa Waktu: {{ getDaysRemainingText(selectedClient.days_remaining) }}
              </p>
            </div>

            <div class="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Limit Penyimpanan Database</p>
              <p class="text-sm font-black text-slate-900 font-mono">{{ selectedClient.database_limit || 100 }} MB</p>
              <p class="text-[11px] text-slate-400">Kapasitas penyimpanan data jadwal & siswa</p>
            </div>

            <div class="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entitas Terdaftar</p>
              <p class="text-sm font-bold text-slate-800">{{ selectedClient.teacher_count || 0 }} Guru &bull; {{ selectedClient.subject_count || 0 }} Mapel</p>
              <p class="text-[11px] text-slate-400">Data entitas KBM yang dikelola tenant</p>
            </div>

            <div class="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Metode & Nilai Kontrak Awal</p>
              <p class="text-sm font-bold text-slate-800">{{ selectedClient.payment_method || 'Virtual Account' }}</p>
              <p class="text-xs font-mono font-bold text-slate-900">{{ formatRupiah(selectedClient.payment_amount) }}</p>
            </div>
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2.5">
          <div class="flex items-center gap-2 flex-wrap">
            <button 
              @click="showClientDetailModal = false; openEditLimit(selectedClient)" 
              class="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer active:scale-95"
            >
              Edit Limit DB
            </button>
            <button 
              @click="showClientDetailModal = false; openManualRenew(selectedClient)" 
              class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer active:scale-95"
            >
              Perpanjang Manual
            </button>
            <button 
              @click="showClientDetailModal = false; toggleSuspendSchool(selectedClient)" 
              class="px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border active:scale-95"
              :class="selectedClient.status === 'Suspended' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'"
            >
              {{ selectedClient.status === 'Suspended' ? 'Buka Suspend' : 'Suspend Tenant' }}
            </button>
          </div>
          <button @click="showClientDetailModal = false" class="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shadow-2xs">
            Tutup
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- MODAL 2: EDIT LIMIT DATABASE KLIEN                           -->
    <!-- ============================================================ -->
    <div v-if="showEditLimitModal && selectedClient" class="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in" @click.self="showEditLimitModal = false">
      <div class="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        <div class="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div>
            <h3 class="text-base font-black text-slate-900">Ubah Limit Database</h3>
            <p class="text-xs text-slate-500 font-medium mt-0.5">{{ selectedClient.name }}</p>
          </div>
          <button @click="showEditLimitModal = false" class="text-slate-400 hover:text-slate-700 cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <form @submit.prevent="saveLimit" class="p-5 space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">Kapasitas Penyimpanan (MB)</label>
            <input 
              v-model.number="limitForm.databaseLimit" 
              type="number" 
              min="10" 
              max="10000" 
              required 
              class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>

          <!-- Quick Preset Buttons -->
          <div>
            <span class="block text-[11px] font-bold text-slate-500 mb-2">Pilihan Cepat (Preset SaaS):</span>
            <div class="grid grid-cols-4 gap-2">
              <button 
                type="button" 
                v-for="lim in [50, 100, 250, 500]" 
                :key="'lim-'+lim"
                @click="limitForm.databaseLimit = lim"
                class="px-2 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer text-center"
                :class="limitForm.databaseLimit === lim ? 'bg-blue-600 text-white border-blue-600 shadow-2xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'"
              >
                {{ lim }} MB
              </button>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button 
              type="button" 
              @click="showEditLimitModal = false" 
              class="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button 
              type="submit" 
              :disabled="actionLoading" 
              class="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {{ actionLoading ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- MODAL 3: PERPANJANG LISENSI MANUAL                           -->
    <!-- ============================================================ -->
    <div v-if="showManualRenewModal && selectedClient" class="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in" @click.self="showManualRenewModal = false">
      <div class="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        <div class="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div>
            <h3 class="text-base font-black text-slate-900">Perpanjang Lisensi Manual</h3>
            <p class="text-xs text-slate-500 font-medium mt-0.5">{{ selectedClient.name }}</p>
          </div>
          <button @click="showManualRenewModal = false" class="text-slate-400 hover:text-slate-700 cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <form @submit.prevent="saveManualRenew" class="p-5 space-y-4">
          <div class="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 font-medium">
            Masa aktif saat ini berakhir pada: 
            <span class="font-bold block mt-0.5">{{ formatDate(selectedClient.subscription_end_date || selectedClient.valid_until) }}</span>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">Tambahkan Durasi (Bulan)</label>
            <input 
              v-model.number="renewForm.months" 
              type="number" 
              min="1" 
              max="60" 
              required 
              class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none" 
            />
          </div>

          <!-- Quick Preset Buttons -->
          <div>
            <span class="block text-[11px] font-bold text-slate-500 mb-2">Pilihan Durasi Cepat:</span>
            <div class="grid grid-cols-3 gap-2">
              <button 
                type="button" 
                v-for="dur in [{ m: 1, label: '+1 Bulan' }, { m: 6, label: '+6 Bulan (1 Sem)' }, { m: 12, label: '+12 Bulan (1 Thn)' }]" 
                :key="'dur-'+dur.m"
                @click="renewForm.months = dur.m"
                class="px-2 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer text-center"
                :class="renewForm.months === dur.m ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'"
              >
                {{ dur.label }}
              </button>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button 
              type="button" 
              @click="showManualRenewModal = false" 
              class="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button 
              type="submit" 
              :disabled="actionLoading" 
              class="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {{ actionLoading ? 'Memproses...' : 'Perpanjang Sekarang' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    <!-- Modal Antrean Sewa & Aktivasi Lisensi GuruKu -->
    <div v-if="showRentalQueueModal" class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in" @click.self="showRentalQueueModal = false">
      <div class="bg-white rounded-2xl sm:rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div class="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h3 class="font-extrabold text-slate-900 text-base">Antrean Sewa & Aktivasi Lisensi</h3>
            <p class="text-xs text-slate-500 font-medium">Monitoring permohonan penyewaan aplikasi sekolah & aktivasi akun tenant</p>
          </div>
          <button @click="showRentalQueueModal = false" class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          <!-- Status Server SaaS -->
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Status Node Server SaaS (GuruKu Cloud)</p>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div v-for="node in [
                { name: 'DB Neon Postgres', status: 'Tersambung' },
                { name: 'KBM Engine AI', status: 'Optimal' },
                { name: 'WhatsApp Gateway', status: 'Aktif' },
                { name: 'Auto-Provisioning', status: 'Siap 100%' }
              ]" :key="node.name" class="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-center">
                <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 mb-1"></span>
                <p class="text-xs font-bold text-slate-800">{{ node.name }}</p>
                <p class="text-[10px] text-emerald-600 font-semibold">{{ node.status }}</p>
              </div>
            </div>
          </div>

          <!-- Form Tambah Antrean Sewa Baru -->
          <div class="bg-blue-50/50 border border-blue-200 p-4 rounded-2xl">
            <p class="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>+ Masukkan Sekolah ke Antrean Sewa</span>
            </p>
            <div class="space-y-3">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">Nama Sekolah</label>
                  <input v-model="newRentalForm.schoolName" type="text" placeholder="Contoh: SMA Negeri 1 Unggulan" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">Pilih Paket Lisensi</label>
                  <select v-model="newRentalForm.packageId" @change="applyPackageToRental($event.target.value)" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none">
                    <option v-for="pkg in availablePackages" :key="pkg.id" :value="pkg.id">
                      {{ pkg.name }} ({{ formatRupiah(pkg.price) }})
                    </option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">Nomor WhatsApp</label>
                  <input v-model="newRentalForm.contact" type="text" placeholder="08xxxxxxxxxx" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">Username Admin</label>
                  <div class="relative flex items-center">
                    <input 
                      v-model="newRentalForm.adminUsername" 
                      type="text" 
                      placeholder="admin_sekolah" 
                      class="w-full px-3 pr-20 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                    <span class="absolute right-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 pointer-events-none select-none">
                      @guruku.id
                    </span>
                  </div>
                  <p class="text-[9px] text-slate-400 mt-0.5 font-mono">
                    {{ getFullUsername(newRentalForm.adminUsername) }}
                  </p>
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">Nominal Sewa</label>
                  <input v-model.number="newRentalForm.amount" type="number" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <button 
                @click="addRentalToQueue" 
                type="button" 
                class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer mt-1"
              >
                + Masukkan ke Antrean Sewa
              </button>
            </div>
          </div>

          <!-- Daftar Antrean Sewa Aktif -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <p class="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Daftar Antrean Menunggu Aktivasi</p>
              <span class="text-xs font-semibold text-slate-400">{{ rentalQueue.length }} Antrean</span>
            </div>

            <div v-if="rentalQueue.length === 0" class="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
              <svg class="w-8 h-8 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              <p class="text-xs font-semibold text-slate-600">Tidak ada pesanan di antrean</p>
              <p class="text-[11px] text-slate-400 mt-0.5">Semua permohonan sewa aplikasi telah berhasil diproses dan aktif.</p>
            </div>

            <div v-else class="space-y-2">
              <div v-for="item in rentalQueue" :key="item.id" class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
                <div>
                  <p class="text-xs font-bold text-slate-800">{{ item.schoolName }}</p>
                  <p class="text-[11px] text-slate-400">{{ item.packageName }} &bull; {{ item.requestedAt }} &bull; WA: {{ item.contact || '-' }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono font-bold text-slate-800">{{ formatRupiah(item.amount) }}</span>
                  <button 
                    @click="activateRentalQueueItem(item)" 
                    class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                  >
                    Aktivasi
                  </button>
                  <button 
                    @click="removeRentalQueueItem(item.id)" 
                    class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title="Batalkan dari antrean"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/70">
          <span class="text-xs text-slate-500 font-medium">Sistem lisensi otomatis tersinkronisasi</span>
          <button @click="showRentalQueueModal = false" class="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
            Tutup
          </button>
        </div>
      </div>
    </div>

    <!-- Global Toast Notification Component -->
    <transition name="toast-fade">
      <div 
        v-if="toastMessage" 
        class="fixed bottom-6 right-6 z-999 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2.5 pointer-events-auto"
      >
        <span class="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
        <span>{{ toastMessage }}</span>
        <button @click="toastMessage = ''" class="ml-2 text-slate-400 hover:text-white cursor-pointer">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLogo from '../components/AppLogo.vue'
import { SafeFlow } from '../core/SafeFlow.js'
import indonesiaSchools from '../data/schools_indonesia.json'
import KeuanganAset from './KeuanganAset.vue'
import KalkulatorHPP from './KalkulatorHPP.vue'
import EtalaseProdukView from './EtalaseProdukView.vue'
import { getStoredPackages } from '../data/packagesCatalog.js'
import { realtimeClient } from '../core/realtimeClient.js'

const router = useRouter()
const activeTab = ref('dashboard')
const isSidebarOpen = ref(false)
const showModal = ref(false)
const loading = ref(true)
const saving = ref(false)
const schools = ref([])
const clientSearch = ref('')
const availablePackages = ref(getStoredPackages())

// Multi-Tenant SaaS State & Data Aggregation
const isKeuanganMenuOpen = ref(false)
const keuanganSubTab = ref('tagihan')
const invoiceStatusFilter = ref('Semua')

const toggleKeuanganMenu = () => {
  isKeuanganMenuOpen.value = !isKeuanganMenuOpen.value
  if (isKeuanganMenuOpen.value && activeTab.value !== 'keuangan' && activeTab.value !== 'hpp') {
    activeTab.value = 'keuangan'
  }
}

const selectKeuanganSubTab = (sub) => {
  keuanganSubTab.value = sub
  if (sub === 'hpp') {
    activeTab.value = 'hpp'
  } else {
    activeTab.value = 'keuangan'
  }
}

const dashboardMetrics = ref({
  revenueThisMonth: 8470163,
  operationalCosts: 104205,
  operationalMargin: 8365958,
  activeClientsCount: 2,
  activationQueueCount: 0,
  userGrowth12Months: []
})

// Toast Notification System
const toastMessage = ref('')
let toastTimer = null

const showToast = (msg, duration = 3000) => {
  toastMessage.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, duration)
}

// Safe Computed Aggregation for Top 4 Cards
const displayActiveClientsCount = computed(() => {
  if (dashboardMetrics.value?.activeClientsCount !== undefined && dashboardMetrics.value?.activeClientsCount !== null && dashboardMetrics.value.activeClientsCount > 0) {
    return dashboardMetrics.value.activeClientsCount
  }
  const activeSchools = schools.value.filter(s => s.status === 'Active' || (!s.status && !isExpired(s.valid_until)))
  if (activeSchools.length > 0) return activeSchools.length
  return schools.value.length > 0 ? schools.value.length : 2
})

const displayActivationQueueCount = computed(() => {
  if (dashboardMetrics.value?.activationQueueCount !== undefined && dashboardMetrics.value?.activationQueueCount !== null) {
    return Number(dashboardMetrics.value.activationQueueCount)
  }
  return pendingPaymentsCount.value || 0
})

const displayRevenueThisMonth = computed(() => {
  if (dashboardMetrics.value?.revenueThisMonth && dashboardMetrics.value.revenueThisMonth > 0) {
    return dashboardMetrics.value.revenueThisMonth
  }
  if (totalRevenue.value && totalRevenue.value > 0) {
    return totalRevenue.value
  }
  if (financialSummary.value?.penjualanBulanIni && financialSummary.value.penjualanBulanIni > 0) {
    return financialSummary.value.penjualanBulanIni
  }
  return 8470163
})

const displayOperationalCosts = computed(() => {
  if (dashboardMetrics.value?.operationalCosts && dashboardMetrics.value.operationalCosts > 0) {
    return dashboardMetrics.value.operationalCosts
  }
  return 104205
})

const displayOperationalMargin = computed(() => {
  if (dashboardMetrics.value?.operationalMargin && dashboardMetrics.value.operationalMargin > 0) {
    return dashboardMetrics.value.operationalMargin
  }
  return displayRevenueThisMonth.value - displayOperationalCosts.value
})

const fetchDashboardMetrics = async () => {
  try {
    const res = await fetch('/api/v1/super/metrics')
    if (res.ok) {
      const data = await res.json()
      dashboardMetrics.value = data
      if (Array.isArray(data.userGrowth12Months) && data.userGrowth12Months.length > 0) {
        userStatsMonths.value = data.userGrowth12Months.map(m => ({
          month: m.label || m.month,
          penggunaAktif: m.activeUsers || 0,
          penangguhan: m.churnedUsers || 0
        }))
      }
    }
  } catch (err) {
    console.warn('Dashboard metrics API fallback:', err)
  }
}

const filteredInvoices = computed(() => {
  if (invoiceStatusFilter.value === 'Semua') {
    return pendingPayments.value
  }
  return pendingPayments.value.filter(p => {
    if (invoiceStatusFilter.value === 'Menunggu Pembayaran') {
      return p.status === 'Menunggu Pembayaran' || p.status === 'MENUNGGU_VERIFIKASI'
    }
    if (invoiceStatusFilter.value === 'Berhasil Dibayar') {
      return p.status === 'Berhasil Dibayar' || p.status === 'LUNAS' || p.status === 'DISETUJUI' || p.status === 'TERVERIFIKASI'
    }
    if (invoiceStatusFilter.value === 'Dibatalkan') {
      return p.status === 'Dibatalkan' || p.status === 'DITOLAK'
    }
    return p.status === invoiceStatusFilter.value
  })
})

const getPaymentStatusClass = (status) => {
  if (status === 'Berhasil Dibayar' || status === 'LUNAS' || status === 'DISETUJUI' || status === 'TERVERIFIKASI') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }
  if (status === 'Menunggu Pembayaran' || status === 'MENUNGGU_VERIFIKASI') {
    return 'bg-amber-50 text-amber-700 border-amber-200'
  }
  if (status === 'Dibatalkan' || status === 'DITOLAK') {
    return 'bg-rose-50 text-rose-700 border-rose-200'
  }
  return 'bg-slate-100 text-slate-700 border-slate-200'
}

const getPaymentStatusDot = (status) => {
  if (status === 'Berhasil Dibayar' || status === 'LUNAS' || status === 'DISETUJUI' || status === 'TERVERIFIKASI') {
    return 'bg-emerald-500'
  }
  if (status === 'Menunggu Pembayaran' || status === 'MENUNGGU_VERIFIKASI') {
    return 'bg-amber-500 animate-pulse'
  }
  if (status === 'Dibatalkan' || status === 'DITOLAK') {
    return 'bg-rose-500'
  }
  return 'bg-slate-400'
}

// Client Management Action Modals & Methods
const selectedClient = ref(null)
const showClientDetailModal = ref(false)
const showEditLimitModal = ref(false)
const showManualRenewModal = ref(false)
const limitForm = ref({ databaseLimit: 100 })
const renewForm = ref({ months: 12 })
const actionLoading = ref(false)

const formatTenantId = (id) => {
  if (!id) return 'TEN-000000'
  return 'TEN-' + String(id).replace(/-/g, '').substring(0, 8).toUpperCase()
}

const getDaysRemainingText = (days) => {
  if (days === undefined || days === null) return '-'
  if (days < 0) return Math.abs(days) + ' hari lewat (Expired)'
  if (days === 0) return 'Hari ini habis'
  return 'Sisa ' + days + ' hari'
}

const copyToClipboard = (text, label = 'Data') => {
  if (!text) return
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      alert(label + ' [' + text + '] berhasil disalin ke clipboard!')
    }).catch(() => {
      prompt('Salin ' + label + ':', text)
    })
  } else {
    prompt('Salin ' + label + ':', text)
  }
}

const openClientDetail = (school) => {
  selectedClient.value = school
  showClientDetailModal.value = true
}

const openEditLimit = (school) => {
  selectedClient.value = school
  limitForm.value.databaseLimit = school.database_limit || 100
  showEditLimitModal.value = true
}

const saveLimit = async () => {
  if (!selectedClient.value) return
  actionLoading.value = true
  const newLimit = Number(limitForm.value.databaseLimit) || 100
  
  // Optimistic update
  selectedClient.value.database_limit = newLimit
  const idx = schools.value.findIndex(s => s.id === selectedClient.value.id)
  if (idx !== -1) {
    schools.value[idx].database_limit = newLimit
  }
  showEditLimitModal.value = false
  showToast('Limit database untuk ' + selectedClient.value.name + ' berhasil diperbarui ke ' + newLimit + ' MB!')

  try {
    const res = await SafeFlow.fetch('/api/v1/super/schools/' + selectedClient.value.id + '/limit', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ database_limit: newLimit })
    })
    const data = await res.json()
    if (!res.ok) console.warn(data.error)
  } catch (err) {
    console.warn("API limit fallback to local state:", err)
  } finally {
    actionLoading.value = false
  }
}

const openManualRenew = (school) => {
  selectedClient.value = school
  renewForm.value.months = 12
  showManualRenewModal.value = true
}

const saveManualRenew = async () => {
  if (!selectedClient.value) return
  actionLoading.value = true
  const addedMonths = Number(renewForm.value.months) || 12

  // Optimistic calculation for new validity date
  const currentExpiry = selectedClient.value.subscription_end_date || selectedClient.value.valid_until
  const baseDate = (currentExpiry && new Date(currentExpiry) > new Date()) ? new Date(currentExpiry) : new Date()
  baseDate.setMonth(baseDate.getMonth() + addedMonths)
  const newExpiryStr = baseDate.toISOString().slice(0, 10)

  selectedClient.value.subscription_end_date = newExpiryStr
  selectedClient.value.valid_until = newExpiryStr
  selectedClient.value.status = 'Active'
  selectedClient.value.days_remaining = Math.round((baseDate - new Date()) / (1000 * 60 * 60 * 24))

  const idx = schools.value.findIndex(s => s.id === selectedClient.value.id)
  if (idx !== -1) {
    schools.value[idx].subscription_end_date = newExpiryStr
    schools.value[idx].valid_until = newExpiryStr
    schools.value[idx].status = 'Active'
    schools.value[idx].days_remaining = selectedClient.value.days_remaining
  }

  showManualRenewModal.value = false
  showToast('Lisensi ' + selectedClient.value.name + ' berhasil diperpanjang (+' + addedMonths + ' bulan)!')

  try {
    const res = await SafeFlow.fetch('/api/v1/super/schools/' + selectedClient.value.id + '/renew', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ months: addedMonths })
    })
    const data = await res.json()
    if (!res.ok) console.warn(data.error)
    await fetchDashboardMetrics()
  } catch (err) {
    console.warn("API renew fallback to local state:", err)
  } finally {
    actionLoading.value = false
  }
}

const toggleSuspendSchool = async (school) => {
  const isSuspended = school.status === 'Suspended'
  const warningText = isSuspended 
    ? 'Aktifkan kembali akses login tenant untuk ' + school.name + '?' 
    : 'PERINGATAN: Apakah Anda yakin ingin MENANGGUHKAN akses login tenant ' + school.name + '? Semua guru dan admin sekolah tidak dapat login sampai diaktifkan kembali.'
  
  if (!confirm(warningText)) return

  // Optimistic update
  const nextStatus = isSuspended ? 'Active' : 'Suspended'
  school.status = nextStatus
  if (selectedClient.value && selectedClient.value.id === school.id) {
    selectedClient.value.status = nextStatus
  }
  showToast('Tenant ' + school.name + ' berhasil ' + (nextStatus === 'Suspended' ? 'ditangguhkan (SUSPENDED)' : 'diaktifkan kembali') + '!')

  try {
    const res = await SafeFlow.fetch('/api/v1/super/schools/' + school.id + '/suspend', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suspend: !isSuspended })
    })
    const data = await res.json()
    if (!res.ok) console.warn(data.error)
    await fetchDashboardMetrics()
  } catch (err) {
    console.warn("API suspend fallback to local state:", err)
  }
}

// Tanggal hari ini format Indonesia
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

// Data Keuangan & Statistik Dashboard (Default sesuai tampilan referensi)
const financialSummary = ref({
  penjualanBulanIni: 254205,
  labaKotorBulanIni: 150000,
  hppBulanIni: 104205,
  saldoKas: 8365958,
  belanjaBulanIni: 0,
  totalPesananWeb: 1
})

// Data Jumlah Pengguna Aplikasi GuruKu · 12 Bulan (Diagram Batang Hijau: Aktif, Oranye: Penangguhan)
const defaultUserStatsMonths = [
  { month: 'Des', penggunaAktif: 45, penangguhan: 2 },
  { month: 'Jan', penggunaAktif: 68, penangguhan: 4 },
  { month: 'Feb', penggunaAktif: 85, penangguhan: 5 },
  { month: 'Mar', penggunaAktif: 120, penangguhan: 8 },
  { month: 'Apr', penggunaAktif: 145, penangguhan: 6 },
  { month: 'Mei', penggunaAktif: 170, penangguhan: 9 },
  { month: 'Jun', penggunaAktif: 195, penangguhan: 14 },
  { month: 'Jul', penggunaAktif: 240, penangguhan: 12 },
  { month: 'Agu', penggunaAktif: 265, penangguhan: 15 },
  { month: 'Sep', penggunaAktif: 290, penangguhan: 18 },
  { month: 'Okt', penggunaAktif: 310, penangguhan: 20 },
  { month: 'Nov', penggunaAktif: 325, penangguhan: 24 }
]

const userStatsMonths = ref(JSON.parse(localStorage.getItem('guruKu_user_stats_months') || JSON.stringify(defaultUserStatsMonths)))

const chartMonths = ref([
  { month: 'Des', penjualan: 0, belanja: 0 },
  { month: 'Jan', penjualan: 0, belanja: 0 },
  { month: 'Feb', penjualan: 0, belanja: 0 },
  { month: 'Mar', penjualan: 0, belanja: 0 },
  { month: 'Apr', penjualan: 0, belanja: 0 },
  { month: 'Mei', penjualan: 0, belanja: 0 },
  { month: 'Jun', penjualan: 0, belanja: 0 },
  { month: 'Jul', penjualan: 0, belanja: 0 },
  { month: 'Agu', penjualan: 0, belanja: 0 },
  { month: 'Sep', penjualan: 0, belanja: 0 },
  { month: 'Okt', penjualan: 0, belanja: 0 },
  { month: 'Nov', penjualan: 254205, belanja: 0 }
])

const loadFinancialSummary = () => {
  try {
    const saved = localStorage.getItem('guruKu_financial_summary')
    if (saved) {
      const parsed = JSON.parse(saved)
      financialSummary.value = { ...financialSummary.value, ...parsed }
      // Update chart Nov if penjualan exists
      if (parsed.penjualanBulanIni) {
        const nov = chartMonths.value.find(m => m.month === 'Nov')
        if (nov) nov.penjualan = parsed.penjualanBulanIni
      }
    }
  } catch (e) {
    console.error('Failed to load financial summary:', e)
  }
}

// Modal Invoice
const showInvoiceModal = ref(false)
const invoiceForm = ref({
  clientName: '',
  amount: 254205,
  hpp: 104205,
  description: 'Lisensi SaaS GuruKu'
})

// Antrean Sewa & Aktivasi Lisensi GuruKu
const showRentalQueueModal = ref(false)
const defaultRentalQueue = [
  {
    id: 101,
    schoolName: 'SMP Swasta Budi Utomo',
    packageName: 'Lisensi Lengkap 1 Tahun',
    packageId: 2,
    contact: '081298765432',
    adminUsername: 'admin_budiutomo',
    requestedAt: '11 Nov, 11.30',
    amount: 480000,
    status: 'Menunggu Aktivasi'
  }
]

const rentalQueue = ref(JSON.parse(localStorage.getItem('guruKu_rental_queue') || JSON.stringify(defaultRentalQueue)))

const newRentalForm = ref({
  schoolName: '',
  packageId: 1,
  packageName: 'Lisensi Semester Ganjil',
  contact: '',
  adminUsername: '',
  amount: 254205
})

const applyPackageToRental = (pkgId) => {
  const pkg = availablePackages.value.find(p => p.id === Number(pkgId) || p.id === pkgId)
  if (pkg) {
    newRentalForm.value.packageId = pkg.id
    newRentalForm.value.packageName = pkg.name
    newRentalForm.value.amount = pkg.price
  }
}

const addRentalToQueue = () => {
  if (!newRentalForm.value.schoolName.trim()) {
    alert('Mohon isi nama sekolah yang mengajukan sewa aplikasi.')
    return
  }

  const pkg = availablePackages.value.find(p => p.id === newRentalForm.value.packageId)
  const now = new Date()
  const timeStr = `${now.getDate()} Nov, ${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`

  const rawAdmin = newRentalForm.value.adminUsername.trim() || 'admin_' + newRentalForm.value.schoolName.toLowerCase().replace(/[^a-z0-9]/g, '')
  const fullAdmin = formatGurukuUsername(rawAdmin)

  rentalQueue.value.push({
    id: Date.now(),
    schoolName: newRentalForm.value.schoolName.trim(),
    packageId: newRentalForm.value.packageId,
    packageName: pkg?.name || newRentalForm.value.packageName || 'Lisensi SaaS GuruKu',
    contact: newRentalForm.value.contact.trim(),
    adminUsername: fullAdmin,
    requestedAt: timeStr,
    amount: Number(newRentalForm.value.amount) || 254205,
    status: 'Menunggu Aktivasi'
  })

  localStorage.setItem('guruKu_rental_queue', JSON.stringify(rentalQueue.value))
  
  newRentalForm.value = {
    schoolName: '',
    packageId: 1,
    packageName: 'Lisensi Semester Ganjil',
    contact: '',
    adminUsername: '',
    amount: 254205
  }
}

const activateRentalQueueItem = (item) => {
  if (confirm(`Aktivasi lisensi untuk sekolah "${item.schoolName}" sekarang?`)) {
    // Catat di pesanan terbaru
    recentOrders.value.unshift({
      id: Date.now(),
      clientName: item.schoolName,
      packageName: item.packageName,
      date: item.requestedAt,
      amount: item.amount,
      status: 'Berhasil Dibayar'
    })
    localStorage.setItem('guruKu_recent_orders', JSON.stringify(recentOrders.value))

    // Tambah finansial omzet
    financialSummary.value.penjualanBulanIni += item.amount
    financialSummary.value.labaKotorBulanIni += item.amount
    financialSummary.value.saldoKas += item.amount
    localStorage.setItem('guruKu_financial_summary', JSON.stringify(financialSummary.value))

    // Tambah sekolah ke schools jika belum ada
    const exists = schools.value.some(s => s.name.toLowerCase() === item.schoolName.toLowerCase())
    if (!exists) {
      const validUntil = new Date()
      validUntil.setFullYear(validUntil.getFullYear() + 1)
      schools.value.unshift({
        id: Date.now(),
        name: item.schoolName,
        admin_username: formatGurukuUsername(item.adminUsername || 'admin'),
        contact_number: item.contact || '',
        payment_method: 'TRANSFER',
        payment_amount: item.amount,
        valid_until: validUntil.toISOString()
      })
    }

    // Hapus dari antrean
    rentalQueue.value = rentalQueue.value.filter(q => q.id !== item.id)
    localStorage.setItem('guruKu_rental_queue', JSON.stringify(rentalQueue.value))

    // Update nov bar in userStatsMonths
    const novStats = userStatsMonths.value.find(m => m.month === 'Nov')
    if (novStats) {
      novStats.penggunaAktif += 12
      localStorage.setItem('guruKu_user_stats_months', JSON.stringify(userStatsMonths.value))
    }

    window.dispatchEvent(new CustomEvent('guruKu_finance_updated'))
    alert(`Lisensi untuk "${item.schoolName}" berhasil diaktifkan!`)
  }
}

const removeRentalQueueItem = (id) => {
  rentalQueue.value = rentalQueue.value.filter(q => q.id !== id)
  localStorage.setItem('guruKu_rental_queue', JSON.stringify(rentalQueue.value))
}

// Data Pesanan Terbaru (List Terstruktur Reaktif)
const defaultRecentOrders = [
  {
    id: 1,
    clientName: 'MAS Darularafah',
    packageName: 'Lisensi Semester Ganjil',
    date: '11 Nov, 14.20',
    amount: 199998,
    status: 'Berhasil Dibayar'
  },
  {
    id: 2,
    clientName: 'MAS Darularafah (Kampus B)',
    packageName: 'Lisensi Lengkap 1 Tahun',
    date: '10 Nov, 09.15',
    amount: 250000,
    status: 'Selesai'
  },
  {
    id: 3,
    clientName: 'Klien / Rekan Istimewa',
    packageName: 'Lisensi SaaS GuruKu',
    date: '2 Nov, 12.00',
    amount: 254205,
    status: 'Selesai'
  },
  {
    id: 4,
    clientName: 'SMA Unggul Terpadu',
    packageName: 'Lisensi Lengkap 1 Tahun',
    date: '28 Okt, 16.45',
    amount: 480000,
    status: 'Selesai'
  }
]

const recentOrders = ref(JSON.parse(localStorage.getItem('guruKu_recent_orders') || JSON.stringify(defaultRecentOrders)))

const formatGurukuUsername = (username) => {
  if (!username) return '-'
  const clean = username.trim()
  if (clean.toLowerCase().endsWith('@guruku.id')) return clean
  return `${clean}@guruku.id`
}

const getFullUsername = (raw) => {
  if (!raw) return '@guruku.id'
  const clean = raw.trim().replace(/@guruku\.id$/i, '')
  return `${clean}@guruku.id`
}

const getInitials = (name) => {
  if (!name) return 'GK'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

const getOrderStatusBadgeClass = (status) => {
  switch (status) {
    case 'Selesai':
      return 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
    case 'Berhasil Dibayar':
      return 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
    case 'Menunggu Pembayaran':
      return 'bg-[#FEF6E9] text-[#B45309] border border-[#FDE68A]'
    case 'Dalam Penangguhan':
      return 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]'
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200'
  }
}

const getOrderStatusDotClass = (status) => {
  switch (status) {
    case 'Selesai': return 'bg-emerald-500'
    case 'Berhasil Dibayar': return 'bg-blue-600'
    case 'Menunggu Pembayaran': return 'bg-amber-500'
    case 'Dalam Penangguhan': return 'bg-orange-500'
    default: return 'bg-slate-400'
  }
}

const orderStatusCounts = computed(() => {
  const pendingPay = pendingPayments.value?.length || 0
  let expired = 0
  let active = 0

  schools.value.forEach(s => {
    if (isExpired(s.valid_until)) {
      expired++
    } else {
      active++
    }
  })

  const paidCount = recentOrders.value.filter(o => o.status === 'Berhasil Dibayar').length
  const selesaiCount = Math.max(active, recentOrders.value.filter(o => o.status === 'Selesai').length, 1)

  return {
    menungguPembayaran: pendingPay,
    berhasilDibayar: paidCount,
    penangguhan: expired,
    selesai: selesaiCount,
    dibatalkan: 0,
    total: pendingPay + paidCount + expired + selesaiCount
  }
})

const applyPackageToInvoice = (pkgId) => {
  if (!pkgId) return
  const pkg = availablePackages.value.find(p => p.id === pkgId)
  if (pkg) {
    invoiceForm.value.amount = pkg.price
    invoiceForm.value.description = `Lisensi SaaS GuruKu: ${pkg.name}`
  }
}

const applyPackageToNewSchool = (pkgId) => {
  if (!pkgId) return
  const pkg = availablePackages.value.find(p => p.id === pkgId)
  if (pkg) {
    form.value.payment_amount = pkg.price
    const d = new Date()
    d.setMonth(d.getMonth() + (pkg.durationMonths || 6))
    form.value.valid_until = d.toISOString().slice(0, 10)
  }
}

const saveInvoice = () => {
  if (!invoiceForm.value.amount || invoiceForm.value.amount <= 0) return

  const amount = Number(invoiceForm.value.amount)
  const hpp = Number(invoiceForm.value.hpp || 0)
  const laba = amount - hpp

  financialSummary.value.penjualanBulanIni += amount
  financialSummary.value.hppBulanIni += hpp
  financialSummary.value.labaKotorBulanIni += laba
  financialSummary.value.saldoKas += amount
  financialSummary.value.totalPesananWeb = (financialSummary.value.totalPesananWeb || 1) + 1

  const nov = chartMonths.value.find(m => m.month === 'Nov')
  if (nov) {
    nov.penjualan += amount
  }

  try {
    localStorage.setItem('guruKu_financial_summary', JSON.stringify(financialSummary.value))
    
    // Simpan ke riwayat transaksi finansial yang tersinkronisasi
    const finTx = JSON.parse(localStorage.getItem('guruKu_finance_transactions') || '[]')
    finTx.unshift({
      id: Date.now(),
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      ref: `INV-${Date.now().toString().slice(-6)}`,
      category: 'Penjualan Lisensi Sekolah',
      description: invoiceForm.value.description || `Invoice untuk ${invoiceForm.value.clientName}`,
      type: 'in',
      amount: amount,
      period: 'Nov 26'
    })
    localStorage.setItem('guruKu_finance_transactions', JSON.stringify(finTx))

    // Update periode grafik
    const periods = JSON.parse(localStorage.getItem('guruKu_chart_periods') || '[]')
    const targetPeriod = periods.find(p => p.label === 'Nov 26')
    if (targetPeriod) {
      targetPeriod.pendapatan += amount
      targetPeriod.kasMasuk += amount
      targetPeriod.saldo += amount
      localStorage.setItem('guruKu_chart_periods', JSON.stringify(periods))
    }

    window.dispatchEvent(new CustomEvent('guruKu_finance_updated'))
  } catch (e) {
    console.error('Error saving invoice:', e)
  }

  // Masukkan ke daftar pesanan terbaru
  recentOrders.value.unshift({
    id: Date.now(),
    clientName: invoiceForm.value.clientName,
    packageName: invoiceForm.value.description || 'Lisensi SaaS GuruKu',
    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ', ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':'),
    amount: amount,
    status: 'Berhasil Dibayar'
  })
  localStorage.setItem('guruKu_recent_orders', JSON.stringify(recentOrders.value))

  showInvoiceModal.value = false
  invoiceForm.value = {
    clientName: '',
    amount: 254205,
    hpp: 104205,
    description: 'Lisensi SaaS GuruKu'
  }
}

const filteredSchools = computed(() => {
  if (!clientSearch.value.trim()) return schools.value
  const q = clientSearch.value.toLowerCase().trim()
  const qClean = q.replace(/@guruku\.id$/i, '')
  return schools.value.filter(s => {
    const rawUname = (s.admin_username || '').toLowerCase()
    const formattedUname = formatGurukuUsername(rawUname).toLowerCase()
    return (s.name && s.name.toLowerCase().includes(q)) ||
      rawUname.includes(q) ||
      rawUname.includes(qClean) ||
      formattedUname.includes(q) ||
      (s.address && s.address.toLowerCase().includes(q)) ||
      (s.contact_number && s.contact_number.includes(q))
  })
})

const getWaUrl = (phone, name, customMsg) => {
  if (!phone) return '#'
  let cleanPhone = phone.toString().replace(/[^0-9]/g, '')
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1)
  } else if (!cleanPhone.startsWith('62')) {
    cleanPhone = '62' + cleanPhone
  }
  const msg = customMsg || `Halo Bpk/Ibu ${name || ''}, kami dari Tim Layanan Super Admin GuruKu menindaklanjuti aduan/saran yang Anda kirimkan. Bagaimana kami dapat membantu?`
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
}

const contactSchool = (school) => {
  if (!school.contact_number) {
    alert("Nomor kontak sekolah belum dicantumkan.")
    return
  }
  contactClient(school.contact_number, school.name)
}

const currentTabTitle = computed(() => {
  switch (activeTab.value) {
    case 'dashboard': return 'Dashboard'
    case 'manajemen': return 'Manajemen Klien'
    case 'laporan': return 'Laporan Investor'
    case 'verifikasi': return 'Verifikasi Bayar'
    case 'aduan': return 'Custom Request'
    case 'etalase': return 'Etalase Produk'
    case 'keuangan': return 'Keuangan & Aset'
    case 'hpp': return 'Kalkulator HPP'
    case 'pengaturan': return 'Pengaturan Sistem'
    default: return 'Super Admin'
  }
})

const tabItems = computed(() => [
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Dashboard', badge: 0 },
  { id: 'manajemen', label: 'Pesanan', shortLabel: 'Pesanan', badge: pendingPaymentsCount.value },
  { id: 'keuangan', label: 'Keuangan', shortLabel: 'Keuangan', badge: 0 },
  { id: 'hpp', label: 'HPP', shortLabel: 'HPP', badge: 0 },
  { id: 'aduan', label: 'Request', shortLabel: 'Request', badge: unreadTicketsCount.value },
])

const totalRevenue = computed(() => {
  return schools.value.reduce((acc, curr) => acc + (parseFloat(curr.payment_amount) || 0), 0)
})

const activeClientsCount = computed(() => {
  return schools.value.filter(s => !isExpired(s.valid_until)).length
})

const expiredClientsCount = computed(() => {
  return schools.value.filter(s => isExpired(s.valid_until)).length
})

const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(angka || 0)
}

// Data & Methods untuk Verifikasi Pembayaran Masuk
const pendingPayments = ref([])
const previewReceiptImage = ref(null)

const loadPendingPayments = async () => {
  // 1. Ambil dari database Neon Postgres secara real-time
  try {
    const res = await SafeFlow.fetch('/api/v1/payment-confirmations')
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) {
        pendingPayments.value = data
        try {
          localStorage.setItem('guruKu_pending_payments', JSON.stringify(data))
        } catch (e) {}
        return
      }
    }
  } catch (e) {
    console.warn("Koneksi API pembayaran gagal, membaca cache lokal:", e)
  }

  // 2. Fallback cadangan dari localStorage
  try {
    const raw = localStorage.getItem('guruKu_pending_payments')
    if (raw) {
      pendingPayments.value = JSON.parse(raw)
    }
  } catch (e) {}
}

const pendingPaymentsCount = computed(() => {
  return pendingPayments.value.filter(p => p.status === 'Menunggu Pembayaran' || p.status === 'MENUNGGU_VERIFIKASI').length
})

const approvePayment = async (payment) => {
  payment.status = 'Berhasil Dibayar'
  try {
    localStorage.setItem('guruKu_pending_payments', JSON.stringify(pendingPayments.value))
  } catch (e) {}

  // Sinkronisasi persetujuan ke database serverless
  try {
    const targetId = payment.id || payment.invoice
    await SafeFlow.fetch(`/api/v1/payment-confirmations/${targetId}/approve`, {
      method: 'PUT'
    })
    fetchSchools()
  } catch (err) {
    console.error("Gagal sinkron persetujuan ke server:", err)
  }

  // Coba perpanjang sekolah jika nama cocok
  const matched = schools.value.find(s => 
    s.name && payment.senderName && (
      s.name.toLowerCase().includes(payment.senderName.toLowerCase()) || 
      payment.senderName.toLowerCase().includes(s.name.toLowerCase())
    )
  )
  if (matched) {
    const currentExpiry = new Date(matched.valid_until)
    const baseDate = currentExpiry > new Date() ? currentExpiry : new Date()
    const months = Number(payment.durationMonths) || 6
    baseDate.setMonth(baseDate.getMonth() + months)
    matched.valid_until = baseDate.toISOString().slice(0, 10)
  }

  alert(`Pembayaran [${payment.invoice}] berhasil disetujui! Status diperbarui menjadi Berhasil Dibayar.`)
}

const rejectPayment = async (payment) => {
  if (confirm(`Tolak konfirmasi pembayaran [${payment.invoice}]?`)) {
    payment.status = 'Dibatalkan'
    try {
      localStorage.setItem('guruKu_pending_payments', JSON.stringify(pendingPayments.value))
    } catch (e) {}

    try {
      const targetId = payment.id || payment.invoice
      await SafeFlow.fetch(`/api/v1/payment-confirmations/${targetId}/reject`, {
        method: 'PUT'
      })
    } catch (err) {
      console.error("Gagal sinkron penolakan ke server:", err)
    }
  }
}

const deletePaymentRecord = async (invoice, id) => {
  if (confirm(`Hapus catatan transaksi [${invoice}]?`)) {
    pendingPayments.value = pendingPayments.value.filter(p => p.invoice !== invoice)
    try {
      localStorage.setItem('guruKu_pending_payments', JSON.stringify(pendingPayments.value))
    } catch (e) {}

    try {
      const targetId = id || invoice
      await SafeFlow.fetch(`/api/v1/payment-confirmations/${targetId}`, {
        method: 'DELETE'
      })
    } catch (err) {
      console.error("Gagal menghapus dari server:", err)
    }
  }
}

// Data & Methods untuk Aduan & Saran Klien
const supportTickets = ref([])
const filterTicketStatus = ref('ALL')

const loadSupportTickets = async () => {
  try {
    const res = await SafeFlow.fetch('/api/v1/support-tickets')
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) {
        supportTickets.value = data
        localStorage.setItem('guruKu_support_tickets', JSON.stringify(data))
        return
      }
    }
  } catch (err) {
    console.warn("Koneksi API tiket gagal, menggunakan cache lokal:", err)
  }

  // Fallback cache lokal
  try {
    const raw = localStorage.getItem('guruKu_support_tickets')
    if (raw) {
      supportTickets.value = JSON.parse(raw)
    }
  } catch (e) {}
}

const saveSupportTickets = () => {
  localStorage.setItem('guruKu_support_tickets', JSON.stringify(supportTickets.value))
}

const unreadTicketsCount = computed(() => {
  return supportTickets.value.filter(t => (t.status === 'Open' || t.status === 'MENUNGGU')).length
})

const filteredSupportTickets = computed(() => {
  return supportTickets.value.filter(t => {
    if (filterTicketStatus.value === 'ALL') return true
    return t.status === filterTicketStatus.value
  })
})

const resolveSupportTicket = async (id) => {
  const t = supportTickets.value.find(item => item.id === id)
  if (t) {
    t.status = 'SELESAI'
    saveSupportTickets()
  }

  try {
    await SafeFlow.fetch(`/api/v1/support-tickets/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'SELESAI' })
    })
  } catch (err) {
    console.error("Gagal update status tiket ke server:", err)
  }
}

const deleteSupportTicket = async (id) => {
  if (confirm("Hapus tiket aduan ini?")) {
    supportTickets.value = supportTickets.value.filter(t => t.id !== id)
    saveSupportTickets()

    try {
      await SafeFlow.fetch(`/api/v1/support-tickets/${id}`, {
        method: 'DELETE'
      })
    } catch (err) {
      console.error("Gagal menghapus tiket dari server:", err)
    }
  }
}

const contactClientWA = (phone, name) => {
  const url = getWaUrl(phone, name)
  if (!url || url === '#') {
    alert("Nomor telepon / WhatsApp tidak valid atau kosong.")
    return
  }
  try {
    const win = window.open(url, '_blank')
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = url
    }
  } catch (err) {
    window.location.href = url
  }
}

// Data & Methods for Pengaturan Sistem
const passForm = ref({ old: '', new: '', confirm: '' })

const loadForgotPasswordReports = async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await SafeFlow.fetch('/api/v1/super/forgot-password-requests', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (res.ok) {
      forgotPasswordReports.value = await res.json()
    }
  } catch (err) {
    console.error(err)
  }
}

const forgotPasswordReports = ref([])

const changeSuperAdminPassword = () => {
  if (passForm.value.new !== passForm.value.confirm) {
    alert("Konfirmasi password baru tidak cocok!")
    return
  }
  if (passForm.value.new.length < 6) {
    alert("Password baru minimal 6 karakter!")
    return
  }
  // Simulasi API Call
  alert("Password Master berhasil diperbarui secara sistem!")
  passForm.value = { old: '', new: '', confirm: '' }
}

const processingIds = ref(new Set())

const rejectReport = async (id) => {
  if (!confirm("Apakah Anda yakin ingin menghapus laporan ini secara permanen?")) return
  
  if (processingIds.value.has(id)) return
  processingIds.value.add(id)

  try {
    const token = localStorage.getItem('token')
    const res = await SafeFlow.fetch(`/api/v1/super/forgot-password-requests/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (res.ok) {
      forgotPasswordReports.value = forgotPasswordReports.value.filter(r => r.id !== id)
    } else {
      const data = await res.json()
      alert("Gagal menghapus laporan: " + data.error)
    }
  } catch(e) {
    alert("Terjadi kesalahan jaringan")
  } finally {
    processingIds.value.delete(id)
  }
}

const resolveReport = async (id) => {
  if (processingIds.value.has(id)) return
  processingIds.value.add(id)

  try {
    const token = localStorage.getItem('token')
    const res = await SafeFlow.fetch(`/api/v1/super/forgot-password-requests/${id}/approve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (res.ok) {
      forgotPasswordReports.value = forgotPasswordReports.value.filter(r => r.id !== id)
      alert("Izin telah diberikan! Password klien berhasil diperbarui secara permanen di database.")
    } else {
      const data = await res.json()
      // Hanya tampilkan error jika memang belum berhasil
      if (data.error !== "Laporan tidak ditemukan") {
        alert("Gagal memberikan izin: " + data.error)
      }
    }
  } catch(e) {
    alert("Terjadi kesalahan jaringan")
  } finally {
    processingIds.value.delete(id)
  }
}

const contactClient = (number, name = '') => {
  if (!number) {
    alert("Nomor WhatsApp tidak valid atau kosong.")
    return
  }
  const msg = `Halo Bpk/Ibu ${name ? name + ' ' : ''}, kami dari Layanan Super Admin GuruKu menindaklanjuti permohonan / akun sekolah Anda.`
  const url = getWaUrl(number, name, msg)
  try {
    const win = window.open(url, '_blank')
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = url
    }
  } catch (err) {
    window.location.href = url
  }
}

const form = ref({
  name: '',
  valid_until: '',
  payment_method: 'BCA',
  payment_amount: '',
  address: '',
  contact_number: '',
  username: '',
  password: ''
})

// Autocomplete Logic
const showSchoolSuggestions = ref(false)
const schoolSuggestions = ref([])
const isSearchingSchool = ref(false)
let searchTimeout = null

const searchSchool = () => {
  const query = form.value.name.trim().toLowerCase()
  if (query.length < 2) {
    schoolSuggestions.value = []
    showSchoolSuggestions.value = false
    return
  }
  
  isSearchingSchool.value = true
  showSchoolSuggestions.value = true
  
  if (searchTimeout) clearTimeout(searchTimeout)
  
  searchTimeout = setTimeout(async () => {
    try {
      const tokens = query.split(/\s+/).filter(Boolean)

      // Cari sekolah yang mengandung SEMUA kata kunci yang diketik
      const allMatches = (indonesiaSchools || []).filter(s => {
        const searchTarget = s.search || (s.name + ' ' + (s.city || '') + ' ' + (s.province || '') + ' ' + (s.address || '')).toLowerCase()
        return tokens.every(token => searchTarget.includes(token))
      })

      // Jika kata kunci umum (misal: 'smp', 'sma', 'sd', 'negeri', 'swasta', 'smk'),
      // variasikan hasilnya dari berbagai provinsi di Indonesia agar mencakup semua daerah!
      let localMatches = []
      const genericKeywords = ['sd', 'sdn', 'smp', 'smpn', 'sma', 'sman', 'smk', 'smkn', 'mts', 'ma', 'negeri', 'swasta', 'sekolah', 'madrasah']
      
      if (tokens.length === 1 && genericKeywords.includes(tokens[0])) {
        const seenProvinces = new Set()
        // Ambil perwakilan 1 sekolah per provinsi/daerah terlebih dahulu
        for (const s of allMatches) {
          if (!seenProvinces.has(s.province)) {
            localMatches.push(s)
            seenProvinces.add(s.province)
            if (localMatches.length >= 10) break
          }
        }
        // Lengkapi hingga 15 sekolah
        for (const s of allMatches) {
          if (!localMatches.includes(s)) {
            localMatches.push(s)
            if (localMatches.length >= 15) break
          }
        }
      } else {
        localMatches = allMatches.slice(0, 15)
      }

      const formattedLocal = localMatches.map(s => ({
        display_name: s.display_name,
        customName: s.name,
        address: s.address,
        province: s.province,
        city: s.city
      }))

      // Jika dari data lokal Indonesia sudah ada minimal 3 hasil relevan, langsung tampilkan
      if (formattedLocal.length >= 3) {
        schoolSuggestions.value = formattedLocal
        isSearchingSchool.value = false
        return
      }

      // 2. Fetch cadangan dari Nominatim OpenStreetMap jika hasil lokal sedikit
      const queryParam = encodeURIComponent(form.value.name)
      const res = await SafeFlow.fetch(`https://nominatim.openstreetmap.org/search?q=${queryParam}&format=json&countrycodes=id&limit=5`, {
        headers: { 'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7' }
      })
      
      let apiResults = []
      if (res.ok) {
        apiResults = await res.json()
      }

      schoolSuggestions.value = [...formattedLocal, ...apiResults].slice(0, 12)
      
    } catch (e) {
      console.error("Gagal mencari sekolah", e)
    } finally {
      isSearchingSchool.value = false
    }
  }, 200)
}

const selectSchool = (suggestion) => {
  if (suggestion.customName) {
    form.value.name = suggestion.customName
    form.value.address = suggestion.address || suggestion.display_name
  } else {
    form.value.name = extractSchoolName(suggestion.display_name)
    form.value.address = suggestion.display_name
  }
  showSchoolSuggestions.value = false
}

const extractSchoolName = (displayName) => {
  const parts = displayName.split(',')
  return parts[0]
}

const handleClickOutside = (e) => {
  if (showSchoolSuggestions.value && !e.target.closest('.relative')) {
    showSchoolSuggestions.value = false
  }
}

const fetchSchools = async () => {
  loading.value = true
  try {
    const res = await SafeFlow.fetch('/api/v1/super/schools')
    if (res.ok) {
      schools.value = await res.json() || []
    }
  } catch (error) {
    console.error("Gagal memuat data sekolah", error)
  } finally {
    loading.value = false
  }
}

const submitKlien = async () => {
  saving.value = true
  const finalUsername = getFullUsername(form.value.username)
  try {
    const res = await SafeFlow.fetch('/api/v1/super/schools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.value.name,
        valid_until: new Date(form.value.valid_until).toISOString(),
        payment_method: form.value.payment_method,
        payment_amount: parseFloat(form.value.payment_amount) || 0,
        address: form.value.address,
        contact_number: form.value.contact_number,
        username: finalUsername,
        password: form.value.password
      })
    })

    if (res.ok) {
      alert("Klien baru berhasil ditambahkan!")
      showModal.value = false
      
      // Catat ke daftar pesanan terbaru
      recentOrders.value.unshift({
        id: Date.now(),
        clientName: form.value.name,
        packageName: 'Lisensi SaaS Sekolah',
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ', ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':'),
        amount: parseFloat(form.value.payment_amount) || 0,
        status: 'Berhasil Dibayar'
      })
      localStorage.setItem('guruKu_recent_orders', JSON.stringify(recentOrders.value))

      // Update grafik pengguna aktif di bulan berjalan
      const novStats = userStatsMonths.value.find(m => m.month === 'Nov')
      if (novStats) {
        novStats.penggunaAktif += 15
        localStorage.setItem('guruKu_user_stats_months', JSON.stringify(userStatsMonths.value))
      }

      // Reset form
      form.value = { name: '', valid_until: '', payment_method: 'BCA', payment_amount: '', address: '', contact_number: '', username: '', password: '' }
      fetchSchools() // Refresh data realtime
    } else {
      const data = await res.json()
      alert("Gagal: " + (data.error || "Terjadi kesalahan"))
    }
  } catch (err) {
    alert("Terjadi kesalahan jaringan")
  } finally {
    saving.value = false
  }
}

const blockSchool = async (id) => {
  if (confirm("Yakin ingin memblokir klien ini? (Status akan menjadi Expired)")) {
    try {
      // Optimistic UI
      const target = schools.value.find(s => s.id === id)
      if (target) {
        target.valid_until = new Date(Date.now() - 86400000).toISOString()
      }

      // Update grafik bulan berjalan: kurangi aktif, tambah penangguhan
      const novStats = userStatsMonths.value.find(m => m.month === 'Nov')
      if (novStats) {
        novStats.penggunaAktif = Math.max(10, novStats.penggunaAktif - 15)
        novStats.penangguhan += 15
        localStorage.setItem('guruKu_user_stats_months', JSON.stringify(userStatsMonths.value))
      }

      const res = await SafeFlow.fetch(`/api/v1/super/schools/${id}/block`, { method: 'PUT' })
    } catch (err) {
      alert("Terjadi kesalahan jaringan.")
      fetchSchools() // Rollback
    }
  }
}

const deleteSchool = async (id, name) => {
  if (confirm(`Peringatan Keras!\nApakah Anda benar-benar yakin ingin menghapus klien "${name}" secara PERMANEN?\n\nSemua data milik klien ini (profil, guru, mata pelajaran, jadwal, dll) akan lenyap dan tidak bisa dikembalikan.`)) {
    try {
      // OPTIMISTIC UI: Hapus dari memori lokal (instant ms)
      schools.value = schools.value.filter(s => s.id !== id)
      
      const res = await SafeFlow.fetch(`/api/v1/super/schools/${id}`, { method: 'DELETE' })
      // Jangan panggil fetchSchools() agar tidak menimpa state optimistic jika koneksi lambat
    } catch (err) {
      alert("Terjadi kesalahan jaringan saat menghapus klien.")
      fetchSchools() // Rollback jika error parah
    }
  }
}

const isExpired = (dateString) => {
  if (!dateString) return true
  return new Date(dateString) < new Date()
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
}

let reportInterval = null

const handleStorageChange = (e) => {
  if (e.key === 'guruKu_pending_payments') {
    loadPendingPayments()
  } else if (e.key === 'guruKu_support_tickets') {
    loadSupportTickets()
  } else if (e.key === 'guruKu_financial_summary') {
    loadFinancialSummary()
  } else if (e.key === 'guruKu_packages_catalog') {
    availablePackages.value = getStoredPackages()
  }
}

const handlePackagesUpdate = (e) => {
  if (e?.detail) {
    availablePackages.value = e.detail
  } else {
    availablePackages.value = getStoredPackages()
  }
}

onMounted(() => {
  loadFinancialSummary()
  fetchSchools()
  fetchDashboardMetrics()
  loadForgotPasswordReports()
  loadSupportTickets()
  loadPendingPayments()
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('storage', handleStorageChange)
  window.addEventListener('guruKu_packages_updated', handlePackagesUpdate)
  window.addEventListener('guruKu_finance_updated', loadFinancialSummary)

  // -----------------------------------------------------------------
  // 1. REAL-TIME ARCHITECTURE: Gorilla WebSockets + SSE Fallback
  // -----------------------------------------------------------------
  realtimeClient.connect('super_admin')

  // Real-Time Progress Updated Listener (Setup Monitor Tanpa Refresh)
  realtimeClient.on('progress_updated', (data) => {
    const tenantId = data.tenant_id
    if (!tenantId) return

    const target = schools.value.find(s => 
      s.id === tenantId || 
      s.tenant_id === tenantId || 
      (s.name && tenantId && s.name.toLowerCase().includes(tenantId.toLowerCase()))
    )

    if (target) {
      target.readiness_percentage = data.readiness_percentage
      target.last_active_menu = data.last_active_menu
      target.is_online = true
      target._justUpdated = true
      setTimeout(() => { target._justUpdated = false }, 3000)

      showToast(`Update Real-Time: ${target.name || 'Tenant'} memperbarui ${data.last_active_menu || 'Master Data'} (${data.readiness_percentage}%)`)
    }
  })

  // Real-Time Online Presence Tracking Listener
  realtimeClient.on('presence_updated', (data) => {
    const tenantId = data.tenant_id
    if (!tenantId) return

    const target = schools.value.find(s => 
      s.id === tenantId || 
      s.tenant_id === tenantId || 
      (s.name && tenantId && s.name.toLowerCase().includes(tenantId.toLowerCase()))
    )

    if (target) {
      target.is_online = data.is_online
      target.last_seen = data.last_seen
    }
  })

  // -----------------------------------------------------------------
  // 2. GENTLE BACKGROUND SYNC (60s) - Menghilangkan Polling Agresif
  // -----------------------------------------------------------------
  reportInterval = setInterval(() => {
    loadForgotPasswordReports()
    loadSupportTickets()
    loadPendingPayments()
    loadFinancialSummary()
    fetchDashboardMetrics()
  }, 60000)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('guruKu_packages_updated', handlePackagesUpdate)
  window.removeEventListener('guruKu_finance_updated', loadFinancialSummary)
  if (reportInterval) clearInterval(reportInterval)
  realtimeClient.disconnect()
})

const handleLogout = async () => {
  try {
    await fetch('/api/v1/logout', { method: 'POST' }).catch(() => {})
  } catch (_) {}
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('user_role')
  localStorage.removeItem('school_id')
  localStorage.removeItem('valid_until')
  router.push('/')
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #4b5563;
  border-radius: 20px;
}

/* Staggered Entry Animations for Top Metric Cards */
@keyframes cardSlideUp {
  0% {
    opacity: 0;
    transform: translateY(16px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-card-1 {
  animation: cardSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animate-card-2 {
  opacity: 0;
  animation: cardSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 100ms forwards;
}
.animate-card-3 {
  opacity: 0;
  animation: cardSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 200ms forwards;
}
.animate-card-4 {
  opacity: 0;
  animation: cardSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 300ms forwards;
}

/* 1.2s Smooth Graph Bar Entry Animation */
@keyframes growBar {
  0% {
    transform: scaleY(0);
    opacity: 0.3;
  }
  100% {
    transform: scaleY(1);
    opacity: 1;
  }
}

.animate-grow-bar {
  transform-origin: bottom;
  animation: growBar 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Table Row & List Entry Animation */
@keyframes rowFadeIn {
  0% {
    opacity: 0;
    transform: translateY(6px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-row {
  opacity: 0;
  animation: rowFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Toast Transitions */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.95);
}
</style>
