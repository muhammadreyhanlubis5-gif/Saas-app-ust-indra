<template>
  <div class="animate-fade-in-up p-4 md:p-8 max-w-[1440px] mx-auto space-y-6 font-sans">
    
    <!-- Header Halaman -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-300">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <router-link :to="ROUTES.SUPER_ADMIN" class="text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
            Dashboard
          </router-link>
          <span class="text-slate-300">/</span>
          <span class="text-xs font-bold text-slate-700">Keuangan, Aset & Analisis Grafik</span>
        </div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          Keuangan & Aset
        </h1>
        <p class="text-xs md:text-sm text-slate-500 font-medium mt-1">
          Buku kas operasional, pemantauan omzet penjualan, analisis grafik arus kas & profit multi-siklus, serta analitik trafik pengguna aktif sekolah.
        </p>
      </div>

      <div class="flex items-center gap-2.5 flex-wrap">
        <button 
          @click="showAddTxModal = true" 
          class="inline-flex items-center gap-2 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          <span>Catat Transaksi</span>
        </button>

        <button 
          @click="showAddAssetModal = true" 
          class="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
          <span>Tambah Aset</span>
        </button>

        <button 
          @click="exportFinancialReport" 
          class="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          title="Unduh laporan keuangan format CSV/Excel"
        >
          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          <span>Ekspor Laporan</span>
        </button>
      </div>
    </div>

    <!-- 4 Kartu Statistik Keuangan (Dengan Border Tipis Rapi Sesuai Dashboard Utama) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      
      <!-- Card 1: Penjualan Bulan Ini -->
      <div class="bg-white rounded-2xl border border-slate-300 p-5 shadow-xs hover:border-slate-400 transition-all">
        <div class="flex items-center justify-between mb-2">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Penjualan Bulan Ini</p>
          <span class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          </span>
        </div>
        <div class="text-2xl font-black text-slate-900 tracking-tight font-mono">
          {{ formatRupiah(financialData.penjualanBulanIni) }}
        </div>
        <p class="text-[11px] text-slate-400 font-medium mt-1 truncate">
          semua channel &bull; {{ totalTransactionsCount }} pesanan / lisensi
        </p>
      </div>

      <!-- Card 2: Pengeluaran Bulan Ini -->
      <div class="bg-white rounded-2xl border border-slate-300 p-5 shadow-xs hover:border-slate-400 transition-all">
        <div class="flex items-center justify-between mb-2">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pengeluaran Bulan Ini</p>
          <span class="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
          </span>
        </div>
        <div class="text-2xl font-black text-rose-600 tracking-tight font-mono">
          {{ formatRupiah(financialData.pengeluaranBulanIni) }}
        </div>
        <p class="text-[11px] text-slate-400 font-medium mt-1 truncate">
          belanja cloud server & operasional
        </p>
      </div>

      <!-- Card 3: Laba Kotor Bulan Ini -->
      <div class="bg-white rounded-2xl border border-slate-300 p-5 shadow-xs hover:border-slate-400 transition-all">
        <div class="flex items-center justify-between mb-2">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Laba Kotor Bulan Ini</p>
          <span class="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </span>
        </div>
        <div class="text-2xl font-black text-slate-900 tracking-tight font-mono">
          {{ formatRupiah(financialData.labaKotorBulanIni) }}
        </div>
        <p class="text-[11px] text-slate-400 font-medium mt-1 truncate">
          setelah HPP {{ formatRupiah(financialData.pengeluaranBulanIni) }} & potongan Rp 0
        </p>
      </div>

      <!-- Card 4: Saldo Kas Aktif -->
      <div class="bg-white rounded-2xl border border-slate-300 p-5 shadow-xs hover:border-slate-400 transition-all">
        <div class="flex items-center justify-between mb-2">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Saldo Kas</p>
          <span class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
          </span>
        </div>
        <div class="text-2xl font-black text-slate-900 tracking-tight font-mono">
          {{ formatRupiah(financialData.saldoKas) }}
        </div>
        <p class="text-[11px] text-slate-400 font-medium mt-1 truncate">
          belanja bulan ini {{ formatRupiah(financialData.pengeluaranBulanIni) }}
        </p>
      </div>

    </div>

    <!-- Navigasi Tab Internal (Dengan Border Tipis Rapi) -->
    <div class="flex items-center gap-2 border-b border-slate-300 pb-3 overflow-x-auto custom-scrollbar">
      <button 
        @click="activeTab = 'charts'" 
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border"
        :class="activeTab === 'charts' ? 'bg-[#0B132B] text-white border-[#0B132B] shadow-xs' : 'text-slate-600 border-slate-300 bg-white hover:bg-slate-50'"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>
        <span>Analisis Grafik Finansial</span>
      </button>

      <button 
        @click="activeTab = 'traffic'" 
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border"
        :class="activeTab === 'traffic' ? 'bg-[#0B132B] text-white border-[#0B132B] shadow-xs' : 'text-slate-600 border-slate-300 bg-white hover:bg-slate-50'"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        <span>Trafik & Pengguna Aktif</span>
      </button>

      <button 
        @click="activeTab = 'ledger'" 
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border"
        :class="activeTab === 'ledger' ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'text-slate-600 border-slate-300 bg-white hover:bg-slate-50'"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        <span>Buku Kas & Transaksi ({{ transactions.length }})</span>
      </button>

      <button 
        @click="activeTab = 'assets'" 
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border"
        :class="activeTab === 'assets' ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'text-slate-600 border-slate-300 bg-white hover:bg-slate-50'"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
        <span>Inventaris Aset ({{ assetsList.length }})</span>
      </button>

      <button 
        @click="activeTab = 'summary'" 
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border"
        :class="activeTab === 'summary' ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'text-slate-600 border-slate-300 bg-white hover:bg-slate-50'"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
        <span>Ringkasan HPP Terhubung</span>
      </button>
    </div>

    <!-- ======================================================== -->
    <!-- TAB 1: ANALISIS GRAFIK FINANSIAL (SESUAI GAMBAR REFERENSI) -->
    <!-- ======================================================== -->
    <div v-if="activeTab === 'charts'" class="space-y-6 animate-fade-in">
      
      <!-- Top banner info -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-300 shadow-xs">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-[#0B132B] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            GK
          </div>
          <div>
            <h2 class="text-sm font-bold text-slate-900">Analisis Performa Finansial & Operasional</h2>
            <p class="text-xs text-slate-500 font-medium">Visualisasi tren pendapatan, arus kas multi-bulan, profit per siklus lisensi sekolah, dan rincian biaya.</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Data Finansial Tersinkronisasi
          </span>
        </div>
      </div>

      <!-- 2x2 Grid Kartu Grafik Light Executive Theme dengan Tempat Grafik Putih Agak Abu-abu -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        <!-- CHART 1: Pendapatan, biaya, dan laba -->
        <div class="bg-white rounded-2xl border border-slate-300 p-5 sm:p-6 shadow-xs hover:border-slate-400 transition-all flex flex-col justify-between">
          <div>
            <!-- Header Chart -->
            <div class="flex items-start justify-between gap-2 mb-3">
              <div>
                <h3 class="text-base sm:text-lg font-black tracking-tight text-slate-900">Pendapatan, biaya, dan laba</h3>
                <p class="text-xs text-slate-500 font-medium">Tren perolehan omzet, belanja operasional, dan margin laba bersih</p>
                <!-- Legend Row -->
                <div class="flex items-center gap-4 mt-2.5 text-xs">
                  <div class="flex items-center gap-1.5">
                    <span class="w-3 h-3 rounded-xs bg-[#10B981] shadow-2xs"></span>
                    <span class="text-slate-700 font-bold">Pendapatan</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="w-3 h-3 rounded-xs bg-[#F97316] shadow-2xs"></span>
                    <span class="text-slate-700 font-bold">Biaya</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="w-3 h-0.5 bg-[#0284C7]"></span>
                    <span class="w-2 h-2 rounded-full bg-[#0284C7]"></span>
                    <span class="text-slate-700 font-bold">Laba/rugi</span>
                  </div>
                </div>
              </div>

              <button @click="downloadChartData('pendapatan-biaya')" class="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer" title="Unduh data">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              </button>
            </div>

            <!-- Tempat Grafik: Putih Agak Abu-Abu Sedikit (bg-[#F8FAFC]) dengan Border Halus -->
            <div class="relative w-full pt-3 pb-2 px-2 bg-[#F8FAFC] border border-slate-200 rounded-xl my-2 overflow-hidden shadow-2xs">
              <svg viewBox="0 0 540 220" class="w-full h-auto overflow-visible select-none">
                <!-- Horizontal Grid lines & Y-Axis Labels: 3M, 2M, 1M, 0, -1M, -2M -->
                <g class="text-[10px] font-mono fill-slate-600 font-bold" stroke-dasharray="3 3">
                  <!-- 3M -->
                  <text x="32" y="24" text-anchor="end" class="fill-slate-600 font-bold">3 M</text>
                  <line x1="40" y1="20" x2="530" y2="20" stroke="#CBD5E1" stroke-width="1" />
                  
                  <!-- 2M -->
                  <text x="32" y="60" text-anchor="end" class="fill-slate-600 font-bold">2 M</text>
                  <line x1="40" y1="56" x2="530" y2="56" stroke="#CBD5E1" stroke-width="1" />
                  
                  <!-- 1M -->
                  <text x="32" y="96" text-anchor="end" class="fill-slate-600 font-bold">1 M</text>
                  <line x1="40" y1="92" x2="530" y2="92" stroke="#CBD5E1" stroke-width="1" />
                  
                  <!-- 0 Line (Solid baseline) -->
                  <text x="32" y="132" text-anchor="end" class="fill-slate-800 font-black">0</text>
                  <line x1="40" y1="128" x2="530" y2="128" stroke="#64748B" stroke-width="1.5" stroke-dasharray="0" />
                  
                  <!-- -1M -->
                  <text x="32" y="168" text-anchor="end" class="fill-slate-600 font-bold">-1 M</text>
                  <line x1="40" y1="164" x2="530" y2="164" stroke="#CBD5E1" stroke-width="1" />
                  
                  <!-- -2M -->
                  <text x="32" y="204" text-anchor="end" class="fill-slate-600 font-bold">-2 M</text>
                  <line x1="40" y1="200" x2="530" y2="200" stroke="#CBD5E1" stroke-width="1" />
                </g>

                <!-- Bars (Pendapatan Green & Biaya Orange) -->
                <!-- Jul 25 (x: 65) -->
                <rect x="58" y="124" width="7" height="4" rx="1.5" fill="#10B981" stroke="#059669" stroke-width="0.5" />
                <rect x="67" y="122" width="7" height="6" rx="1.5" fill="#F97316" stroke="#EA580C" stroke-width="0.5" />

                <!-- Sep 25 (x: 115) -->
                <rect x="108" y="125" width="7" height="3" rx="1.5" fill="#10B981" stroke="#059669" stroke-width="0.5" />
                <rect x="117" y="122" width="7" height="6" rx="1.5" fill="#F97316" stroke="#EA580C" stroke-width="0.5" />

                <!-- Nov 25 (x: 165) -->
                <rect x="158" y="120" width="7" height="8" rx="1.5" fill="#10B981" stroke="#059669" stroke-width="0.5" />
                <rect x="167" y="118" width="7" height="10" rx="1.5" fill="#F97316" stroke="#EA580C" stroke-width="0.5" />

                <!-- Jan 26 (x: 215) -->
                <rect x="208" y="123" width="7" height="5" rx="1.5" fill="#10B981" stroke="#059669" stroke-width="0.5" />
                <rect x="217" y="120" width="7" height="8" rx="1.5" fill="#F97316" stroke="#EA580C" stroke-width="0.5" />

                <!-- Mar 26 (Peak 1 - Awal Semester Genap) (x: 265) -->
                <rect x="258" y="25" width="8" height="103" rx="2" fill="#10B981" stroke="#059669" stroke-width="0.5" />
                <rect x="268" y="80" width="8" height="48" rx="2" fill="#F97316" stroke="#EA580C" stroke-width="0.5" />

                <!-- Mei 26 (x: 315) -->
                <rect x="308" y="123" width="7" height="5" rx="1.5" fill="#10B981" stroke="#059669" stroke-width="0.5" />
                <rect x="317" y="121" width="7" height="7" rx="1.5" fill="#F97316" stroke="#EA580C" stroke-width="0.5" />

                <!-- Jul 26 (Peak 2 - Tahun Ajaran Baru) (x: 365) -->
                <rect x="358" y="28" width="8" height="100" rx="2" fill="#10B981" stroke="#059669" stroke-width="0.5" />
                <rect x="368" y="92" width="8" height="36" rx="2" fill="#F97316" stroke="#EA580C" stroke-width="0.5" />

                <!-- Sep 26 (x: 415) -->
                <rect x="408" y="124" width="7" height="4" rx="1.5" fill="#10B981" stroke="#059669" stroke-width="0.5" />
                <rect x="417" y="105" width="7" height="23" rx="1.5" fill="#F97316" stroke="#EA580C" stroke-width="0.5" />

                <!-- Nov 26 (Sekarang - Smt Ganjil Stabil) (x: 465) -->
                <rect x="458" y="125" width="7" height="3" rx="1.5" fill="#10B981" stroke="#059669" stroke-width="0.5" />
                <rect x="467" y="75" width="7" height="53" rx="1.5" fill="#F97316" stroke="#EA580C" stroke-width="0.5" />

                <!-- Spline Line Laba/Rugi (Blue with circular nodes) -->
                <polyline 
                  fill="none" 
                  stroke="#0284C7" 
                  stroke-width="2.5" 
                  points="
                    68,128 
                    118,127 
                    168,128 
                    218,131 
                    268,48 
                    318,129 
                    368,36 
                    418,140 
                    468,155
                  "
                />

                <!-- Data point nodes -->
                <circle cx="68" cy="128" r="3.5" fill="#0284C7" stroke="#FFFFFF" stroke-width="2" />
                <circle cx="118" cy="127" r="3.5" fill="#0284C7" stroke="#FFFFFF" stroke-width="2" />
                <circle cx="168" cy="128" r="3.5" fill="#0284C7" stroke="#FFFFFF" stroke-width="2" />
                <circle cx="218" cy="131" r="3.5" fill="#0284C7" stroke="#FFFFFF" stroke-width="2" />
                <circle cx="268" cy="48" r="5" fill="#0284C7" stroke="#FFFFFF" stroke-width="2" />
                <circle cx="318" cy="129" r="3.5" fill="#0284C7" stroke="#FFFFFF" stroke-width="2" />
                <circle cx="368" cy="36" r="5" fill="#0284C7" stroke="#FFFFFF" stroke-width="2" />
                <circle cx="418" cy="140" r="3.5" fill="#0284C7" stroke="#FFFFFF" stroke-width="2" />
                <circle cx="468" cy="155" r="3.5" fill="#0284C7" stroke="#FFFFFF" stroke-width="2" />

                <!-- X-Axis Labels -->
                <g class="text-[9.5px] fill-slate-600 font-sans font-bold" text-anchor="middle">
                  <text x="68" y="215">Jul 25</text>
                  <text x="118" y="215">Sep 25</text>
                  <text x="168" y="215">Nov 25</text>
                  <text x="218" y="215">Jan 26</text>
                  <text x="268" y="215">Mar 26</text>
                  <text x="318" y="215">Mei 26</text>
                  <text x="368" y="215">Jul 26</text>
                  <text x="418" y="215">Sep 26</text>
                  <text x="468" y="215">Nov 26</text>
                </g>
              </svg>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Puncak Omzet: Semester Ganjil & Genap</span>
            <span class="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 font-bold font-mono">Net Profit Maks: +Rp 2.450.000</span>
          </div>
        </div>

        <!-- CHART 2: Arus kas -->
        <div class="bg-white rounded-2xl border border-slate-300 p-5 sm:p-6 shadow-xs hover:border-slate-400 transition-all flex flex-col justify-between">
          <div>
            <!-- Header Chart -->
            <div class="flex items-start justify-between gap-2 mb-3">
              <div>
                <h3 class="text-base sm:text-lg font-black tracking-tight text-slate-900">Arus kas</h3>
                <p class="text-xs text-slate-500 font-medium">Likuiditas kas masuk, kas keluar, dan cadangan kas berjalan</p>
                <!-- Legend Row -->
                <div class="flex items-center gap-4 mt-2.5 text-xs">
                  <div class="flex items-center gap-1.5">
                    <span class="w-3 h-3 rounded-xs bg-[#10B981] shadow-2xs"></span>
                    <span class="text-slate-700 font-bold">Kas masuk</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="w-3 h-3 rounded-xs bg-[#F97316] shadow-2xs"></span>
                    <span class="text-slate-700 font-bold">Kas keluar</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="w-3 h-0.5 bg-[#0284C7]"></span>
                    <span class="w-2 h-2 rounded-full bg-[#0284C7]"></span>
                    <span class="text-slate-700 font-bold">Saldo</span>
                  </div>
                </div>
              </div>

              <button @click="downloadChartData('arus-kas')" class="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer" title="Unduh data">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              </button>
            </div>

            <!-- Tempat Grafik: Putih Agak Abu-Abu Sedikit (bg-[#F8FAFC]) -->
            <div class="relative w-full pt-3 pb-2 px-2 bg-[#F8FAFC] border border-slate-200 rounded-xl my-2 overflow-hidden shadow-2xs">
              <svg viewBox="0 0 540 220" class="w-full h-auto overflow-visible select-none">
                <!-- Grid Lines: 4M, 3M, 2M, 1M, 0, -1M, -2M -->
                <g class="text-[10px] font-mono fill-slate-600 font-bold" stroke-dasharray="3 3">
                  <text x="32" y="24" text-anchor="end" class="fill-slate-600 font-bold">4 M</text>
                  <line x1="40" y1="20" x2="530" y2="20" stroke="#CBD5E1" stroke-width="1" />
                  
                  <text x="32" y="55" text-anchor="end" class="fill-slate-600 font-bold">3 M</text>
                  <line x1="40" y1="51" x2="530" y2="51" stroke="#CBD5E1" stroke-width="1" />
                  
                  <text x="32" y="86" text-anchor="end" class="fill-slate-600 font-bold">2 M</text>
                  <line x1="40" y1="82" x2="530" y2="82" stroke="#CBD5E1" stroke-width="1" />
                  
                  <text x="32" y="117" text-anchor="end" class="fill-slate-600 font-bold">1 M</text>
                  <line x1="40" y1="113" x2="530" y2="113" stroke="#CBD5E1" stroke-width="1" />
                  
                  <!-- 0 Line -->
                  <text x="32" y="148" text-anchor="end" class="fill-slate-800 font-black">0</text>
                  <line x1="40" y1="144" x2="530" y2="144" stroke="#64748B" stroke-width="1.5" stroke-dasharray="0" />
                  
                  <text x="32" y="179" text-anchor="end" class="fill-slate-600 font-bold">-1 M</text>
                  <line x1="40" y1="175" x2="530" y2="175" stroke="#CBD5E1" stroke-width="1" />
                  
                  <text x="32" y="210" text-anchor="end" class="fill-slate-600 font-bold">-2 M</text>
                  <line x1="40" y1="206" x2="530" y2="206" stroke="#CBD5E1" stroke-width="1" />
                </g>

                <!-- Bars (Kas Masuk vs Kas Keluar) -->
                <!-- Jul 25: investasi server awal -->
                <rect x="67" y="132" width="7" height="12" rx="1.5" fill="#F97316" stroke="#EA580C" stroke-width="0.5" />

                <!-- Sep 25 -->
                <rect x="117" y="135" width="7" height="9" rx="1.5" fill="#F97316" stroke="#EA580C" stroke-width="0.5" />

                <!-- Nov 25 -->
                <rect x="167" y="138" width="7" height="6" rx="1.5" fill="#F97316" stroke="#EA580C" stroke-width="0.5" />

                <!-- Jan 26: Lisensi semester ganjil bertambah -->
                <rect x="208" y="72" width="8" height="72" rx="2" fill="#10B981" stroke="#059669" stroke-width="0.5" />
                <rect x="218" y="136" width="8" height="8" rx="1.5" fill="#F97316" stroke="#EA580C" stroke-width="0.5" />

                <!-- Mar 26: Puncak Masuk -->
                <rect x="258" y="32" width="8" height="112" rx="2" fill="#10B981" stroke="#059669" stroke-width="0.5" />
                <rect x="268" y="52" width="8" height="92" rx="2" fill="#F97316" stroke="#EA580C" stroke-width="0.5" />

                <!-- Mei 26 -->
                <rect x="317" y="138" width="7" height="6" rx="1.5" fill="#F97316" stroke="#EA580C" stroke-width="0.5" />

                <!-- Jul 26: Lisensi Tahun Ajaran Baru -->
                <rect x="358" y="44" width="8" height="100" rx="2" fill="#10B981" stroke="#059669" stroke-width="0.5" />
                <rect x="368" y="132" width="8" height="12" rx="1.5" fill="#F97316" stroke="#EA580C" stroke-width="0.5" />

                <!-- Sep 26 -->
                <rect x="408" y="135" width="7" height="9" rx="1.5" fill="#10B981" stroke="#059669" stroke-width="0.5" />
                <rect x="417" y="125" width="7" height="19" rx="1.5" fill="#F97316" stroke="#EA580C" stroke-width="0.5" />

                <!-- Nov 26 (Bulan Berjalan) -->
                <rect x="458" y="126" width="7" height="18" rx="1.5" fill="#10B981" stroke="#059669" stroke-width="0.5" />
                <rect x="467" y="60" width="7" height="84" rx="2" fill="#F97316" stroke="#EA580C" stroke-width="0.5" />

                <!-- Saldo Kas Line (Blue with circular points) -->
                <polyline 
                  fill="none" 
                  stroke="#0284C7" 
                  stroke-width="2.5" 
                  points="
                    68,160 
                    118,172 
                    168,185 
                    218,142 
                    268,135 
                    318,147 
                    368,52 
                    418,68 
                    468,110
                  "
                />

                <circle cx="68" cy="160" r="3.5" fill="#0284C7" stroke="#FFFFFF" stroke-width="2" />
                <circle cx="118" cy="172" r="3.5" fill="#0284C7" stroke="#FFFFFF" stroke-width="2" />
                <circle cx="168" cy="185" r="3.5" fill="#0284C7" stroke="#FFFFFF" stroke-width="2" />
                <circle cx="218" cy="142" r="3.5" fill="#0284C7" stroke="#FFFFFF" stroke-width="2" />
                <circle cx="268" cy="135" r="3.5" fill="#0284C7" stroke="#FFFFFF" stroke-width="2" />
                <circle cx="318" cy="147" r="3.5" fill="#0284C7" stroke="#FFFFFF" stroke-width="2" />
                <circle cx="368" cy="52" r="5" fill="#0284C7" stroke="#FFFFFF" stroke-width="2" />
                <circle cx="418" cy="68" r="3.5" fill="#0284C7" stroke="#FFFFFF" stroke-width="2" />
                <circle cx="468" cy="110" r="3.5" fill="#0284C7" stroke="#FFFFFF" stroke-width="2" />

                <!-- X-Axis Labels -->
                <g class="text-[9.5px] fill-slate-600 font-sans font-bold" text-anchor="middle">
                  <text x="68" y="215">Jul 25</text>
                  <text x="118" y="215">Sep 25</text>
                  <text x="168" y="215">Nov 25</text>
                  <text x="218" y="215">Jan 26</text>
                  <text x="268" y="215">Mar 26</text>
                  <text x="318" y="215">Mei 26</text>
                  <text x="368" y="215">Jul 26</text>
                  <text x="418" y="215">Sep 26</text>
                  <text x="468" y="215">Nov 26</text>
                </g>
              </svg>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Saldo Kas Lancar Tersimpan:</span>
            <span class="text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200 font-bold font-mono">{{ formatRupiah(financialData.saldoKas) }}</span>
          </div>
        </div>

        <!-- CHART 3: Profit per siklus / Paket Lisensi -->
        <div class="bg-white rounded-2xl border border-slate-300 p-5 sm:p-6 shadow-xs hover:border-slate-400 transition-all flex flex-col justify-between">
          <div>
            <!-- Header Chart -->
            <div class="flex items-start justify-between gap-2 mb-3">
              <div>
                <h3 class="text-base sm:text-lg font-black tracking-tight text-slate-900">Profit per siklus</h3>
                <p class="text-xs text-slate-500 font-medium">Margin pendapatan vs beban pada setiap siklus lisensi sekolah</p>
                <!-- Legend Row -->
                <div class="flex items-center gap-4 mt-2.5 text-xs">
                  <div class="flex items-center gap-1.5">
                    <span class="w-3 h-3 rounded-xs bg-[#10B981] shadow-2xs"></span>
                    <span class="text-slate-700 font-bold">Pendapatan</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="w-3 h-3 rounded-xs bg-[#F97316] shadow-2xs"></span>
                    <span class="text-slate-700 font-bold">Biaya</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="w-3 h-3 rounded-xs bg-[#0284C7] shadow-2xs"></span>
                    <span class="text-slate-700 font-bold">Laba/rugi</span>
                  </div>
                </div>
              </div>

              <button @click="downloadChartData('profit-siklus')" class="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer" title="Unduh data">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              </button>
            </div>

            <!-- Tempat Grafik: Putih Agak Abu-Abu Sedikit (bg-[#F8FAFC]) -->
            <div class="relative w-full pt-3 pb-2 px-2 bg-[#F8FAFC] border border-slate-200 rounded-xl my-2 overflow-hidden shadow-2xs">
              <svg viewBox="0 0 540 220" class="w-full h-auto overflow-visible select-none">
                <!-- Y-Axis Grid: 3M, 2M, 1M, 0, -1M -->
                <g class="text-[10px] font-mono fill-slate-600 font-bold" stroke-dasharray="3 3">
                  <text x="32" y="32" text-anchor="end" class="fill-slate-600 font-bold">3 M</text>
                  <line x1="40" y1="28" x2="530" y2="28" stroke="#CBD5E1" stroke-width="1" />
                  
                  <text x="32" y="74" text-anchor="end" class="fill-slate-600 font-bold">2 M</text>
                  <line x1="40" y1="70" x2="530" y2="70" stroke="#CBD5E1" stroke-width="1" />
                  
                  <text x="32" y="116" text-anchor="end" class="fill-slate-600 font-bold">1 M</text>
                  <line x1="40" y1="112" x2="530" y2="112" stroke="#CBD5E1" stroke-width="1" />
                  
                  <!-- 0 Line -->
                  <text x="32" y="158" text-anchor="end" class="fill-slate-800 font-black">0</text>
                  <line x1="40" y1="154" x2="530" y2="154" stroke="#64748B" stroke-width="1.5" stroke-dasharray="0" />
                  
                  <text x="32" y="200" text-anchor="end" class="fill-slate-600 font-bold">-1 M</text>
                  <line x1="40" y1="196" x2="530" y2="196" stroke="#CBD5E1" stroke-width="1" />
                </g>

                <!-- Group 1: Siklus 1 - Semester Ganjil (High Margin) (x center: 105) -->
                <rect x="85" y="32" width="12" height="122" rx="2" fill="#10B981" stroke="#059669" stroke-width="0.5" />
                <rect x="99" y="82" width="12" height="72" rx="2" fill="#F97316" stroke="#EA580C" stroke-width="0.5" />
                <rect x="113" y="104" width="12" height="50" rx="2" fill="#0284C7" stroke="#0369A1" stroke-width="0.5" />

                <!-- Group 2: Siklus 2 - Semester Genap (x center: 185) -->
                <rect x="165" y="42" width="12" height="112" rx="2" fill="#10B981" stroke="#059669" stroke-width="0.5" />
                <rect x="179" y="88" width="12" height="66" rx="2" fill="#F97316" stroke="#EA580C" stroke-width="0.5" />
                <rect x="193" y="108" width="12" height="46" rx="2" fill="#0284C7" stroke="#0369A1" stroke-width="0.5" />

                <!-- Group 3: Siklus 3 - Add-On Modul Cetak (R&D Cost higher) (x center: 265) -->
                <rect x="245" y="148" width="12" height="6" rx="1.5" fill="#10B981" stroke="#059669" stroke-width="0.5" />
                <rect x="259" y="122" width="12" height="32" rx="2" fill="#F97316" stroke="#EA580C" stroke-width="0.5" />
                <rect x="273" y="154" width="12" height="26" rx="2" fill="#0284C7" stroke="#0369A1" stroke-width="0.5" />

                <!-- Group 4: Siklus 4 - Lisensi Multi-Kampus (x center: 345) -->
                <rect x="325" y="150" width="12" height="4" rx="1.5" fill="#10B981" stroke="#059669" stroke-width="0.5" />
                <rect x="339" y="130" width="12" height="24" rx="2" fill="#F97316" stroke="#EA580C" stroke-width="0.5" />
                <rect x="353" y="154" width="12" height="20" rx="2" fill="#0284C7" stroke="#0369A1" stroke-width="0.5" />

                <!-- Group 5: Siklus 5 - Proyeksi 2026/2027 (x center: 425) -->
                <rect x="405" y="60" width="12" height="94" rx="2" fill="#10B981" stroke="#059669" stroke-width="0.5" />
                <rect x="419" y="112" width="12" height="42" rx="2" fill="#F97316" stroke="#EA580C" stroke-width="0.5" />
                <rect x="433" y="102" width="12" height="52" rx="2" fill="#0284C7" stroke="#0369A1" stroke-width="0.5" />

                <!-- X-Axis Labels -->
                <g class="text-[9px] fill-slate-700 font-sans font-bold">
                  <text x="105" y="174" text-anchor="middle">Smt Ganjil 25/26</text>
                  <text x="185" y="174" text-anchor="middle">Smt Genap 25/26</text>
                  <text x="265" y="174" text-anchor="middle">Modul Cetak & QR</text>
                  <text x="345" y="174" text-anchor="middle">Custom Multi-Kampus</text>
                  <text x="425" y="174" text-anchor="middle">Proyeksi 26/27</text>
                </g>
              </svg>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Siklus Paling Menguntungkan:</span>
            <span class="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 font-bold">Semester Ganjil 2025/2026</span>
          </div>
        </div>

        <!-- CHART 4: Komposisi biaya operasional -->
        <div class="bg-white rounded-2xl border border-slate-300 p-5 sm:p-6 shadow-xs hover:border-slate-400 transition-all flex flex-col justify-between">
          <div>
            <!-- Header Chart -->
            <div class="flex items-start justify-between gap-2 mb-3">
              <div>
                <h3 class="text-base sm:text-lg font-black tracking-tight text-slate-900">Komposisi biaya operasional</h3>
                <p class="text-xs text-slate-500 mt-0.5 font-medium">Distribusi pengeluaran cloud server & pemeliharaan GuruKu</p>
              </div>

              <button @click="downloadChartData('biaya-operasional')" class="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer" title="Unduh data">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              </button>
            </div>

            <!-- Tempat Grafik: Putih Agak Abu-Abu Sedikit (bg-[#F8FAFC]) -->
            <div class="bg-[#F8FAFC] border border-slate-200 rounded-xl p-3.5 sm:p-4 my-2 shadow-2xs">
              <div class="space-y-2.5">
                <div v-for="item in operationalCosts" :key="item.name" class="flex items-center gap-3 text-xs">
                  <!-- Label Pos Biaya (Teks Jelas Tebal) -->
                  <div class="w-36 sm:w-44 text-right text-slate-700 font-bold truncate shrink-0 text-[11px]">
                    {{ item.name }}
                  </div>
                  
                  <!-- Bar Container -->
                  <div class="flex-1 bg-slate-200/90 rounded-full h-4 relative overflow-hidden border border-slate-200">
                    <div 
                      class="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-700 shadow-xs"
                      :style="{ width: `${item.percentage}%` }"
                    ></div>
                  </div>

                  <!-- Nominal Value Label (Teks Gelap Terbaca) -->
                  <div class="w-20 text-right text-slate-900 font-mono text-[11px] shrink-0 font-extrabold">
                    {{ item.formatted }}
                  </div>
                </div>
              </div>

              <!-- X-Axis Scale Indicator: 0, 500 rb, 1 M, 1,5 M, 2 M, 2,5 M -->
              <div class="flex justify-between pl-36 sm:pl-44 pr-20 pt-4 text-[9.5px] text-slate-600 font-mono font-bold border-t border-slate-300 mt-3">
                <span>0</span>
                <span>500 rb</span>
                <span>1 M</span>
                <span>1,5 M</span>
                <span>2 M</span>
                <span>2,5 M</span>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Komponen Terbesar: Cloud Server Neon</span>
            <span class="text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200 font-bold font-mono">Rp 2.450.000 / bln</span>
          </div>
        </div>

      </div>

    </div>

    <!-- ======================================================== -->
    <!-- TAB 2: TRAFIK & PENGGUNA AKTIF (SESUAI PERMINTAAN USER)   -->
    <!-- ======================================================== -->
    <div v-else-if="activeTab === 'traffic'" class="space-y-6 animate-fade-in">
      
      <!-- Timeframe Toggle Filter & Overview -->
      <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-base sm:text-lg font-black text-slate-900 tracking-tight">Trafik Penggunaan Aplikasi & Retensi Klien</h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Analisis beban engine penjadwalan, guru aktif, frekuensi generate KBM, dan adopsi modul sekolah.
          </p>
        </div>

        <!-- Rentang Waktu Buttons: 1 Minggu, 1 Bulan, 1 Tahun -->
        <div class="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-300 gap-1 self-start sm:self-center">
          <button 
            @click="trafficTimeframe = 'week'"
            class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
            :class="trafficTimeframe === 'week' ? 'bg-white text-blue-700 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'"
          >
            1 Minggu (7 Hari)
          </button>
          <button 
            @click="trafficTimeframe = 'month'"
            class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
            :class="trafficTimeframe === 'month' ? 'bg-white text-blue-700 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'"
          >
            1 Bulan (30 Hari)
          </button>
          <button 
            @click="trafficTimeframe = 'year'"
            class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
            :class="trafficTimeframe === 'year' ? 'bg-white text-blue-700 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'"
          >
            1 Tahun (12 Bulan)
          </button>
        </div>
      </div>

      <!-- 4 Quick Metric Badges -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-xl border border-slate-300 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pengguna Aktif Guru & Admin</span>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="text-2xl font-black text-slate-900 font-mono">{{ currentTrafficData.activeUsers }}</span>
            <span class="text-xs font-bold text-emerald-600">{{ currentTrafficData.activeUsersGrowth }}</span>
          </div>
          <span class="text-[11px] text-slate-400 mt-1 block">akses harian terdaftar</span>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-300 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sesi Generate KBM Selesai</span>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="text-2xl font-black text-blue-600 font-mono">{{ currentTrafficData.schedulesGenerated }}</span>
            <span class="text-xs font-semibold text-slate-400">99.8% tanpa bentrok</span>
          </div>
          <span class="text-[11px] text-slate-400 mt-1 block">jadwal terbit ke kelas & guru</span>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-300 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Akuisisi Klien & Perpanjangan</span>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="text-2xl font-black text-slate-900 font-mono">{{ currentTrafficData.clientRenewals }}</span>
            <span class="text-xs font-bold text-emerald-600">Retensi {{ currentTrafficData.retentionRate }}</span>
          </div>
          <span class="text-[11px] text-slate-400 mt-1 block">sekolah aktif berlangganan</span>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-300 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kecepatan Engine Algoritma</span>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="text-2xl font-black text-indigo-700 font-mono">{{ currentTrafficData.avgEngineSpeed }}</span>
            <span class="text-xs font-bold text-emerald-600">Optimal</span>
          </div>
          <span class="text-[11px] text-slate-400 mt-1 block">per 100 jam pelajaran</span>
        </div>
      </div>

      <!-- Grid 2 Kolom Grafik Trafik -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        <!-- Chart A: Tren Pengguna Aktif (Guru vs Admin Sekolah) -->
        <div class="bg-white rounded-2xl border border-slate-300 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-sm font-bold text-slate-900">Tren Pengguna Aktif (Guru & Admin Sekolah)</h3>
                <p class="text-xs text-slate-400">Aktivitas login harian, penyesuaian jadwal, dan cek jam mengajar</p>
              </div>
              <div class="flex items-center gap-3 text-xs">
                <div class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <span class="text-slate-600 font-medium">Guru Aktif</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span class="text-slate-600 font-medium">Admin Sekolah</span>
                </div>
              </div>
            </div>

            <!-- SVG Line & Area Chart for Users -->
            <div class="relative w-full pt-4 pb-2">
              <svg viewBox="0 0 500 200" class="w-full h-auto overflow-visible select-none">
                <!-- Grid Lines -->
                <line x1="30" y1="20" x2="490" y2="20" stroke="#E2E8F0" stroke-width="1" />
                <line x1="30" y1="65" x2="490" y2="65" stroke="#E2E8F0" stroke-width="1" />
                <line x1="30" y1="110" x2="490" y2="110" stroke="#E2E8F0" stroke-width="1" />
                <line x1="30" y1="155" x2="490" y2="155" stroke="#94A3B8" stroke-width="1.2" />

                <!-- Y Labels -->
                <text x="24" y="24" text-anchor="end" class="text-[9px] fill-slate-400 font-mono">500</text>
                <text x="24" y="69" text-anchor="end" class="text-[9px] fill-slate-400 font-mono">350</text>
                <text x="24" y="114" text-anchor="end" class="text-[9px] fill-slate-400 font-mono">150</text>
                <text x="24" y="159" text-anchor="end" class="text-[9px] fill-slate-400 font-mono">0</text>

                <!-- Blue Area Gradient Guru -->
                <defs>
                  <linearGradient id="guruGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.25"/>
                    <stop offset="100%" stop-color="#3B82F6" stop-opacity="0.0"/>
                  </linearGradient>
                </defs>

                <!-- Area Fill -->
                <polygon 
                  fill="url(#guruGrad)"
                  :points="currentTrafficData.guruAreaPoints"
                />

                <!-- Line Guru (Blue) -->
                <polyline 
                  fill="none" 
                  stroke="#2563EB" 
                  stroke-width="2.5" 
                  :points="currentTrafficData.guruLinePoints"
                />

                <!-- Line Admin (Emerald) -->
                <polyline 
                  fill="none" 
                  stroke="#10B981" 
                  stroke-width="2" 
                  stroke-dasharray="4 2"
                  :points="currentTrafficData.adminLinePoints"
                />

                <!-- X Axis Labels -->
                <g class="text-[9px] fill-slate-400 font-sans" text-anchor="middle">
                  <text v-for="(lbl, idx) in currentTrafficData.xLabels" :key="idx" :x="lbl.x" y="180">{{ lbl.text }}</text>
                </g>
              </svg>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Rata-rata interaksi harian guru:</span>
            <span class="font-bold text-slate-800 font-mono">{{ currentTrafficData.dailyInteractions }} sesi / hari</span>
          </div>
        </div>

        <!-- Chart B: Beban Engine Penjadwalan & Resolusi Bentrok -->
        <div class="bg-white rounded-2xl border border-slate-300 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-sm font-bold text-slate-900">Beban Engine Penjadwalan & Ekspor PDF</h3>
                <p class="text-xs text-slate-400">Jam KBM yang diproses dan konflik guru yang dicegah otomatis</p>
              </div>
              <div class="flex items-center gap-3 text-xs">
                <div class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-xs bg-indigo-600"></span>
                  <span class="text-slate-600 font-medium">Jam KBM</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span>
                  <span class="text-slate-600 font-medium">Konflik Dicegah</span>
                </div>
              </div>
            </div>

            <!-- SVG Bar Comparison Chart -->
            <div class="relative w-full pt-4 pb-2">
              <svg viewBox="0 0 500 200" class="w-full h-auto overflow-visible select-none">
                <line x1="30" y1="20" x2="490" y2="20" stroke="#E2E8F0" stroke-width="1" />
                <line x1="30" y1="65" x2="490" y2="65" stroke="#E2E8F0" stroke-width="1" />
                <line x1="30" y1="110" x2="490" y2="110" stroke="#E2E8F0" stroke-width="1" />
                <line x1="30" y1="155" x2="490" y2="155" stroke="#94A3B8" stroke-width="1.2" />

                <g v-for="(b, idx) in currentTrafficData.workloadBars" :key="idx">
                  <!-- Jam KBM Bar (Indigo) -->
                  <rect :x="b.x1" :y="b.y1" width="12" :height="155 - b.y1" rx="2" fill="#4F46E5" />
                  <!-- Konflik Bar (Emerald) -->
                  <rect :x="b.x2" :y="b.y2" width="12" :height="155 - b.y2" rx="2" fill="#10B981" />
                </g>

                <g class="text-[9px] fill-slate-400 font-sans" text-anchor="middle">
                  <text v-for="(lbl, idx) in currentTrafficData.xLabels" :key="idx" :x="lbl.x" y="180">{{ lbl.text }}</text>
                </g>
              </svg>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Tingkat keberhasilan validasi bentrok:</span>
            <span class="font-bold text-emerald-600 font-mono">100% Zero-Conflict Guarantee</span>
          </div>
        </div>

        <!-- Chart C: Pertumbuhan Lisensi & Pembelian Klien Sekolah -->
        <div class="bg-white rounded-2xl border border-slate-300 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-sm font-bold text-slate-900">Pembelian Lisensi & Perpanjangan Sekolah</h3>
                <p class="text-xs text-slate-400">Distribusi aktivasi sekolah baru vs pembaruan langganan berkala</p>
              </div>
              <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                LTV Stabil
              </span>
            </div>

            <div class="space-y-3 pt-2">
              <div v-for="lic in licenseBreakdown" :key="lic.tier" class="border border-slate-200 p-3 rounded-xl bg-slate-50/60">
                <div class="flex items-center justify-between text-xs mb-1.5">
                  <span class="font-bold text-slate-800">{{ lic.tier }}</span>
                  <span class="font-mono font-bold text-slate-900">{{ lic.schoolsCount }} Sekolah ({{ lic.revenue }})</span>
                </div>
                <div class="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div class="h-full bg-blue-600 rounded-full" :style="{ width: `${lic.percent}%` }"></div>
                </div>
                <div class="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>Masa Aktif: {{ lic.duration }}</span>
                  <span>Retensi: {{ lic.retention }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Perpanjangan Otomatis Bulan Ini:</span>
            <span class="font-bold text-blue-600 font-mono">100% Terverifikasi</span>
          </div>
        </div>

        <!-- Chart D: Sebaran Utilisasi Fitur GuruKu -->
        <div class="bg-white rounded-2xl border border-slate-300 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-sm font-bold text-slate-900">Sebaran Utilisasi Fitur GuruKu</h3>
                <p class="text-xs text-slate-400">Persentase sekolah yang aktif memakai modul-modul utama</p>
              </div>
              <span class="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-300">
                8 Modul Utama
              </span>
            </div>

            <div class="space-y-3 pt-1">
              <div v-for="feat in featureAdoption" :key="feat.name" class="space-y-1">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-semibold text-slate-700">{{ feat.name }}</span>
                  <span class="font-mono font-bold text-slate-900">{{ feat.usage }}%</span>
                </div>
                <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    class="h-full rounded-full transition-all duration-500" 
                    :class="feat.color"
                    :style="{ width: `${feat.usage}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Fitur terfavorit:</span>
            <span class="font-bold text-indigo-700">Auto Generator KBM & Ekspor Cetak B4</span>
          </div>
        </div>

      </div>

    </div>

    <!-- ======================================================== -->
    <!-- TAB 3: BUKU KAS & TRANSAKSI RIIL                         -->
    <!-- ======================================================== -->
    <div v-else-if="activeTab === 'ledger'" class="space-y-4 animate-fade-in">
      <div class="bg-white rounded-2xl border border-slate-300 p-5 md:p-6 shadow-xs">
        
        <!-- Filter & Pencarian -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div class="flex items-center gap-2">
            <button 
              @click="filterType = 'all'" 
              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border"
              :class="filterType === 'all' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'text-slate-600 border-slate-300 hover:bg-slate-50'"
            >
              Semua ({{ transactions.length }})
            </button>
            <button 
              @click="filterType = 'in'" 
              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border"
              :class="filterType === 'in' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'text-slate-600 border-slate-300 hover:bg-slate-50'"
            >
              Pemasukan
            </button>
            <button 
              @click="filterType = 'out'" 
              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border"
              :class="filterType === 'out' ? 'bg-rose-50 text-rose-700 border-rose-300' : 'text-slate-600 border-slate-300 hover:bg-slate-50'"
            >
              Pengeluaran
            </button>
          </div>

          <div class="relative w-full sm:w-64">
            <input 
              v-model="searchKeyword" 
              type="text" 
              placeholder="Cari transaksi..." 
              class="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
            />
            <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>

        <!-- Tabel Transaksi dengan Border Tipis Tegas -->
        <div class="overflow-x-auto border border-slate-300 rounded-xl">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-300 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th class="py-3 px-3.5">Tanggal</th>
                <th class="py-3 px-3.5">No. Referensi</th>
                <th class="py-3 px-3.5">Kategori</th>
                <th class="py-3 px-3.5">Keterangan</th>
                <th class="py-3 px-3.5">Jenis</th>
                <th class="py-3 px-3.5 text-right">Nominal</th>
                <th class="py-3 px-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr v-for="item in filteredTransactions" :key="item.id" class="hover:bg-slate-50/70 transition-colors">
                <td class="py-3 px-3.5 text-slate-500 font-medium whitespace-nowrap">{{ item.date }}</td>
                <td class="py-3 px-3.5 font-mono text-slate-700 font-semibold">{{ item.ref }}</td>
                <td class="py-3 px-3.5 font-medium text-slate-800">{{ item.category }}</td>
                <td class="py-3 px-3.5 text-slate-500 max-w-xs truncate">{{ item.description }}</td>
                <td class="py-3 px-3.5">
                  <span 
                    class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                    :class="item.type === 'in' ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' : 'bg-rose-50 text-rose-700 border border-rose-300'"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="item.type === 'in' ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                    {{ item.type === 'in' ? 'Masuk' : 'Keluar' }}
                  </span>
                </td>
                <td 
                  class="py-3 px-3.5 text-right font-bold font-mono"
                  :class="item.type === 'in' ? 'text-emerald-600' : 'text-rose-600'"
                >
                  {{ item.type === 'in' ? '+' : '-' }} {{ formatRupiah(item.amount) }}
                </td>
                <td class="py-3 px-3.5 text-center">
                  <button @click="deleteTransaction(item.id)" class="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer" title="Hapus Transaksi">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </td>
              </tr>
              <tr v-if="filteredTransactions.length === 0">
                <td colspan="7" class="py-8 text-center text-slate-400">Tidak ada transaksi yang sesuai.</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>

    <!-- ======================================================== -->
    <!-- TAB 4: INVENTARIS ASET                                   -->
    <!-- ======================================================== -->
    <div v-else-if="activeTab === 'assets'" class="space-y-4 animate-fade-in">
      <div class="bg-white rounded-2xl border border-slate-300 p-5 md:p-6 shadow-xs">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
          <div>
            <h3 class="text-sm font-bold text-slate-900">Daftar Aset & Infrastruktur GuruKu</h3>
            <p class="text-xs text-slate-400 mt-0.5">Seluruh server cloud, perangkat keras pendukung cetak modul, dan fasilitas operasional.</p>
          </div>
          <div class="text-right">
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Valuasi Aset:</span>
            <p class="text-lg font-black text-slate-900 font-mono">{{ formatRupiah(totalAssetValuation) }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="asset in assetsList" 
            :key="asset.id" 
            class="border border-slate-300 rounded-xl p-4 hover:border-blue-400 transition-colors flex flex-col justify-between bg-slate-50/40 shadow-2xs"
          >
            <div>
              <div class="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 class="font-bold text-slate-900 text-sm">{{ asset.name }}</h4>
                  <span class="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md mt-1 inline-block">
                    {{ asset.category }}
                  </span>
                </div>
                <span class="text-xs font-black text-slate-800 font-mono">{{ formatRupiah(asset.value) }}</span>
              </div>
              <p class="text-xs text-slate-500 mt-1">{{ asset.spec }}</p>
            </div>
            
            <div class="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px]">
              <span class="text-slate-400 font-medium">Pengadaan: {{ asset.acquisitionDate }}</span>
              <span class="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {{ asset.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- TAB 5: RINGKASAN & KALKULATOR HPP TERHUBUNG               -->
    <!-- ======================================================== -->
    <div v-else-if="activeTab === 'summary'" class="space-y-4 animate-fade-in">
      <div class="bg-white rounded-2xl border border-slate-300 p-5 md:p-6 shadow-xs">
        <h3 class="text-sm font-bold text-slate-900 mb-1">Sinkronisasi Keuangan & Kalkulator HPP</h3>
        <p class="text-xs text-slate-500 mb-6">
          Setiap penentuan Harga Pokok Penjualan (HPP) dan estimasi margin laba tersambung secara otomatis dengan pembukuan laba kotor.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-300">
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">HPP Standar Terhitung</span>
            <p class="text-xl font-black text-slate-900 mt-1 font-mono">Rp 104.205</p>
            <p class="text-[10px] text-slate-400 mt-0.5">Biaya cloud server & operasional/paket</p>
          </div>
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-300">
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Harga Jual Rekomendasi</span>
            <p class="text-xl font-black text-slate-900 mt-1 font-mono">Rp 254.205</p>
            <p class="text-[10px] text-slate-400 mt-0.5">Tercermin di Penjualan Bulan Ini</p>
          </div>
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-300">
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Margin Laba Bersih</span>
            <p class="text-xl font-black text-emerald-600 mt-1 font-mono">Rp 150.000 (59%)</p>
            <p class="text-[10px] text-slate-400 mt-0.5">Laba kotor bersih per unit layanan</p>
          </div>
        </div>

        <router-link :to="ROUTES.KALKULATOR_HPP" class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors">
          <span>Buka Kalkulator HPP Lengkap</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </router-link>
      </div>
    </div>

    <!-- MODAL CATAT TRANSAKSI BARU -->
    <div v-if="showAddTxModal" class="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-300">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <h3 class="text-base font-bold text-slate-900">Catat Transaksi Baru</h3>
          <button @click="showAddTxModal = false" class="text-slate-400 hover:text-slate-600 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div class="space-y-3.5 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Jenis Transaksi</label>
            <div class="grid grid-cols-2 gap-2">
              <button 
                @click="newTx.type = 'in'" 
                type="button" 
                class="py-2.5 rounded-xl font-bold border transition-colors cursor-pointer"
                :class="newTx.type === 'in' ? 'bg-emerald-50 text-emerald-700 border-emerald-400' : 'border-slate-300 text-slate-600'"
              >
                + Pemasukan (Omzet)
              </button>
              <button 
                @click="newTx.type = 'out'" 
                type="button" 
                class="py-2.5 rounded-xl font-bold border transition-colors cursor-pointer"
                :class="newTx.type === 'out' ? 'bg-rose-50 text-rose-700 border-rose-400' : 'border-slate-300 text-slate-600'"
              >
                - Pengeluaran (Belanja)
              </button>
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Kategori</label>
            <input 
              v-model="newTx.category" 
              type="text" 
              placeholder="Cth: Penjualan Lisensi Sekolah / Biaya Cloud Server" 
              class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nominal (Rp)</label>
            <input 
              v-model.number="newTx.amount" 
              type="number" 
              placeholder="Cth: 150000" 
              class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Keterangan Transaksi</label>
            <textarea 
              v-model="newTx.description" 
              rows="2" 
              placeholder="Catatan transaksi..." 
              class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-200">
          <button @click="showAddTxModal = false" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer">Batal</button>
          <button @click="saveNewTransaction" class="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer">Simpan Transaksi</button>
        </div>
      </div>
    </div>

    <!-- MODAL TAMBAH ASET BARU -->
    <div v-if="showAddAssetModal" class="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-300">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <h3 class="text-base font-bold text-slate-900">Tambah Aset Baru</h3>
          <button @click="showAddAssetModal = false" class="text-slate-400 hover:text-slate-600 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div class="space-y-3.5 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nama Aset</label>
            <input 
              v-model="newAsset.name" 
              type="text" 
              placeholder="Cth: Komputer Server Jadwal KBM" 
              class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Kategori</label>
            <input 
              v-model="newAsset.category" 
              type="text" 
              placeholder="Cth: Infrastruktur Server / Perangkat Keras" 
              class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nilai Valuasi (Rp)</label>
            <input 
              v-model.number="newAsset.value" 
              type="number" 
              placeholder="Cth: 15000000" 
              class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Spesifikasi / Keterangan</label>
            <input 
              v-model="newAsset.spec" 
              type="text" 
              placeholder="Cth: Intel i7 Gen-13, RAM 32GB, 1TB NVMe" 
              class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-200">
          <button @click="showAddAssetModal = false" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer">Batal</button>
          <button @click="saveNewAsset" class="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer">Simpan Aset</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ROUTES } from '../config/routePaths.js'

// Tab aktif default: Analisis Grafik Finansial sesuai gambar referensi
const activeTab = ref('charts')
const filterType = ref('all')
const searchKeyword = ref('')
const trafficTimeframe = ref('month')
const showAddTxModal = ref(false)
const showAddAssetModal = ref(false)

const newTx = ref({
  type: 'in',
  category: '',
  amount: null,
  description: ''
})

const newAsset = ref({
  name: '',
  category: '',
  value: null,
  spec: ''
})

// Data Finansial default (persis angka referensi)
const financialData = ref({
  penjualanBulanIni: 254205,
  pengeluaranBulanIni: 104205,
  labaKotorBulanIni: 150000,
  saldoKas: 8365958
})

// Komposisi Biaya Operasional (Sesuai Referensi Gambar 3 Chart 4)
const operationalCosts = [
  { name: 'Server Cloud & DB Neon', percentage: 92, formatted: '2,45 M' },
  { name: 'Jaringan CDN Cloudflare', percentage: 34, formatted: '850 rb' },
  { name: 'Gaji Maintenance Engine', percentage: 18, formatted: '450 rb' },
  { name: 'WhatsApp Gateway API', percentage: 16, formatted: '420 rb' },
  { name: 'Disaster Recovery S3', percentage: 14, formatted: '380 rb' },
  { name: 'CS Support & Operator', percentage: 13, formatted: '350 rb' },
  { name: 'Lisensi Domain & SSL', percentage: 12, formatted: '310 rb' },
  { name: 'Pajak & Legalitas SaaS', percentage: 9, formatted: '220 rb' },
  { name: 'Demo Onsite Sekolah', percentage: 7, formatted: '180 rb' }
]

// Data Trafik & Pengguna Aktif Reaktif Berdasarkan Rentang Waktu (1 Minggu, 1 Bulan, 1 Tahun)
const trafficDataset = {
  week: {
    activeUsers: '482',
    activeUsersGrowth: '+12.4%',
    schedulesGenerated: '142',
    clientRenewals: '4 Klien',
    retentionRate: '99.1%',
    avgEngineSpeed: '1.4 dtk',
    dailyInteractions: '320',
    guruLinePoints: '35,140 105,120 175,100 245,60 315,50 385,85 455,40',
    guruAreaPoints: '35,155 35,140 105,120 175,100 245,60 315,50 385,85 455,40 455,155',
    adminLinePoints: '35,148 105,142 175,138 245,125 315,120 385,130 455,115',
    xLabels: [
      { text: 'Sen', x: 35 },
      { text: 'Sel', x: 105 },
      { text: 'Rab', x: 175 },
      { text: 'Kam', x: 245 },
      { text: 'Jum', x: 315 },
      { text: 'Sab', x: 385 },
      { text: 'Min', x: 455 }
    ],
    workloadBars: [
      { x1: 27, y1: 75, x2: 41, y2: 120 },
      { x1: 97, y1: 65, x2: 111, y2: 110 },
      { x1: 167, y1: 50, x2: 181, y2: 95 },
      { x1: 237, y1: 30, x2: 251, y2: 80 },
      { x1: 307, y1: 45, x2: 321, y2: 90 },
      { x1: 377, y1: 90, x2: 391, y2: 135 },
      { x1: 447, y1: 25, x2: 461, y2: 70 }
    ]
  },
  month: {
    activeUsers: '1.840',
    activeUsersGrowth: '+24.6%',
    schedulesGenerated: '584',
    clientRenewals: '12 Sekolah',
    retentionRate: '98.5%',
    avgEngineSpeed: '1.8 dtk',
    dailyInteractions: '1.240',
    guruLinePoints: '35,145 105,110 175,80 245,45 315,70 385,35 455,25',
    guruAreaPoints: '35,155 35,145 105,110 175,80 245,45 315,70 385,35 455,25 455,155',
    adminLinePoints: '35,150 105,138 175,128 245,110 315,120 385,105 455,95',
    xLabels: [
      { text: 'Mgg 1', x: 35 },
      { text: 'Mgg 2', x: 140 },
      { text: 'Mgg 3', x: 245 },
      { text: 'Mgg 4', x: 350 },
      { text: 'Sekarang', x: 455 }
    ],
    workloadBars: [
      { x1: 27, y1: 85, x2: 41, y2: 125 },
      { x1: 132, y1: 55, x2: 146, y2: 95 },
      { x1: 237, y1: 35, x2: 251, y2: 75 },
      { x1: 342, y1: 45, x2: 356, y2: 85 },
      { x1: 447, y1: 20, x2: 461, y2: 60 }
    ]
  },
  year: {
    activeUsers: '6.450',
    activeUsersGrowth: '+88.2%',
    schedulesGenerated: '3.420',
    clientRenewals: '48 Sekolah',
    retentionRate: '98.8%',
    avgEngineSpeed: '1.6 dtk',
    dailyInteractions: '4.890',
    guruLinePoints: '35,150 75,145 115,140 155,135 195,120 235,40 275,130 315,30 355,135 395,120 435,90 475,35',
    guruAreaPoints: '35,155 35,150 75,145 115,140 155,135 195,120 235,40 275,130 315,30 355,135 395,120 435,90 475,35 475,155',
    adminLinePoints: '35,152 75,150 115,148 155,145 195,140 235,110 275,142 315,100 355,145 395,138 435,125 475,95',
    xLabels: [
      { text: 'Jul 25', x: 35 },
      { text: 'Sep 25', x: 115 },
      { text: 'Nov 25', x: 195 },
      { text: 'Jan 26', x: 275 },
      { text: 'Mar 26', x: 355 },
      { text: 'Mei 26', x: 415 },
      { text: 'Nov 26', x: 475 }
    ],
    workloadBars: [
      { x1: 28, y1: 135, x2: 42, y2: 148 },
      { x1: 108, y1: 130, x2: 122, y2: 145 },
      { x1: 188, y1: 115, x2: 202, y2: 138 },
      { x1: 268, y1: 35, x2: 282, y2: 70 },
      { x1: 348, y1: 120, x2: 362, y2: 140 },
      { x1: 408, y1: 25, x2: 422, y2: 60 },
      { x1: 468, y1: 40, x2: 482, y2: 80 }
    ]
  }
}

const currentTrafficData = computed(() => {
  return trafficDataset[trafficTimeframe.value] || trafficDataset.month
})

// Data Distribusi Paket Lisensi
const licenseBreakdown = [
  { tier: 'Paket Semesteran Reguler', schoolsCount: 28, revenue: 'Rp 5.599.944', duration: '6 Bulan', percent: 65, retention: '98.5%' },
  { tier: 'Paket Tahunan Pro (VIP)', schoolsCount: 14, revenue: 'Rp 3.500.000', duration: '12 Bulan', percent: 45, retention: '100%' },
  { tier: 'Lisensi Khusus Multi-Kampus', schoolsCount: 6, revenue: 'Rp 2.100.000', duration: '12 Bulan', percent: 25, retention: '100%' }
]

// Data Adopsi Fitur
const featureAdoption = [
  { name: 'Otomasi Generate Jadwal KBM', usage: 96, color: 'bg-blue-600' },
  { name: 'Deteksi Bentrok Guru & Ruang', usage: 92, color: 'bg-emerald-500' },
  { name: 'Ekspor Cetak Format F4/B4 & PDF', usage: 88, color: 'bg-indigo-600' },
  { name: 'Ekspor Master Jadwal Excel', usage: 84, color: 'bg-sky-500' },
  { name: 'Kios Guru & Scan QR Absensi', usage: 76, color: 'bg-amber-500' },
  { name: 'WhatsApp Notifikasi Otomatis', usage: 68, color: 'bg-purple-600' }
]

// Default Transaksi Riil
const defaultTransactions = [
  {
    id: 1,
    date: '11 Nov 2026',
    ref: 'INV-202611-001',
    category: 'Penjualan Lisensi Sekolah',
    description: 'Pembayaran paket lisensi jadwal GuruKu semester ganjil',
    type: 'in',
    amount: 254205
  },
  {
    id: 2,
    date: '05 Nov 2026',
    ref: 'EXP-202611-002',
    category: 'Biaya Server Cloud & Domain',
    description: 'Perpanjangan cloud server database Neon Postgres & SSL GuruKu',
    type: 'out',
    amount: 104205
  },
  {
    id: 3,
    date: '28 Okt 2026',
    ref: 'TRX-202610-098',
    category: 'Saldo Awal Kas',
    description: 'Saldo kas operasional cadangan berjalan',
    type: 'in',
    amount: 8215958
  }
]

const transactions = ref([])

// Default Aset Riil
const defaultAssets = [
  {
    id: 1,
    name: 'Server Cloud & Database Cluster GuruKu',
    category: 'Infrastruktur Cloud',
    value: 12000000,
    spec: 'Cloud Dedicated Cluster & Automated Disaster Backup',
    acquisitionDate: '15 Jan 2026',
    status: 'Aktif & Optimal'
  },
  {
    id: 2,
    name: 'Komputer Server Algoritma KBM',
    category: 'Perangkat Keras',
    value: 18500000,
    spec: 'Intel Core i7 Gen-13, 32GB RAM DDR5, 1TB NVMe',
    acquisitionDate: '02 Mar 2026',
    status: 'Aktif & Optimal'
  },
  {
    id: 3,
    name: 'Printer Matriks Cetak Modul Jadwal',
    category: 'Perangkat Kantor',
    value: 6200000,
    spec: 'Epson High-Speed Color InkTank Duplex F4/B4',
    acquisitionDate: '10 Mei 2026',
    status: 'Aktif & Terawat'
  },
  {
    id: 4,
    name: 'Layar Kios Informasi Ruang Guru',
    category: 'Fasilitas Akademik',
    value: 8500000,
    spec: 'Touchscreen Interactive Kiosk 43 Inch Full HD',
    acquisitionDate: '20 Jul 2026',
    status: 'Aktif & Terawat'
  }
]

const assetsList = ref([])

const loadData = () => {
  const savedTx = localStorage.getItem('guruKu_finance_transactions')
  if (savedTx) {
    try {
      transactions.value = JSON.parse(savedTx)
    } catch (e) {
      transactions.value = defaultTransactions
    }
  } else {
    transactions.value = defaultTransactions
    localStorage.setItem('guruKu_finance_transactions', JSON.stringify(defaultTransactions))
  }

  const savedAssets = localStorage.getItem('guruKu_finance_assets')
  if (savedAssets) {
    try {
      assetsList.value = JSON.parse(savedAssets)
    } catch (e) {
      assetsList.value = defaultAssets
    }
  } else {
    assetsList.value = defaultAssets
    localStorage.setItem('guruKu_finance_assets', JSON.stringify(defaultAssets))
  }

  recalculateFinancials()
}

const recalculateFinancials = () => {
  let totalIn = 0
  let totalOut = 0

  transactions.value.forEach(t => {
    if (t.type === 'in') totalIn += Number(t.amount) || 0
    else if (t.type === 'out') totalOut += Number(t.amount) || 0
  })

  // Sinkronkan data
  financialData.value.penjualanBulanIni = totalIn > 0 ? totalIn : 254205
  financialData.value.pengeluaranBulanIni = totalOut > 0 ? totalOut : 104205
  financialData.value.labaKotorBulanIni = Math.max(financialData.value.penjualanBulanIni - financialData.value.pengeluaranBulanIni, 0)
  financialData.value.saldoKas = 8365958 + (totalIn - 254205) - (totalOut - 104205)

  // Simpan ke localStorage agar Dashboard Utama bisa membaca
  localStorage.setItem('guruKu_financial_summary', JSON.stringify(financialData.value))
}

const totalTransactionsCount = computed(() => transactions.value.filter(t => t.type === 'in').length || 1)

const totalAssetValuation = computed(() => {
  return assetsList.value.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)
})

const filteredTransactions = computed(() => {
  return transactions.value.filter(item => {
    const matchesType = filterType.value === 'all' || item.type === filterType.value
    const matchesKeyword = !searchKeyword.value || 
      item.category.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      item.description.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      item.ref.toLowerCase().includes(searchKeyword.value.toLowerCase())
    return matchesType && matchesKeyword
  })
})

const saveNewTransaction = () => {
  if (!newTx.value.category || !newTx.value.amount) return
  const now = new Date()
  const dateStr = `${now.getDate()} Nov ${now.getFullYear()}`
  const refStr = `TRX-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`

  transactions.value.unshift({
    id: Date.now(),
    date: dateStr,
    ref: refStr,
    category: newTx.value.category,
    description: newTx.value.description || '-',
    type: newTx.value.type,
    amount: Number(newTx.value.amount)
  })

  localStorage.setItem('guruKu_finance_transactions', JSON.stringify(transactions.value))
  recalculateFinancials()

  newTx.value = { type: 'in', category: '', amount: null, description: '' }
  showAddTxModal.value = false
}

const deleteTransaction = (id) => {
  transactions.value = transactions.value.filter(t => t.id !== id)
  localStorage.setItem('guruKu_finance_transactions', JSON.stringify(transactions.value))
  recalculateFinancials()
}

const saveNewAsset = () => {
  if (!newAsset.value.name || !newAsset.value.value) return
  const now = new Date()
  const dateStr = `${now.getDate()} Nov ${now.getFullYear()}`

  assetsList.value.push({
    id: Date.now(),
    name: newAsset.value.name,
    category: newAsset.value.category || 'Perangkat KBM',
    value: Number(newAsset.value.value),
    spec: newAsset.value.spec || 'Kondisi Baik',
    acquisitionDate: dateStr,
    status: 'Aktif & Optimal'
  })

  localStorage.setItem('guruKu_finance_assets', JSON.stringify(assetsList.value))
  newAsset.value = { name: '', category: '', value: null, spec: '' }
  showAddAssetModal.value = false
}

const downloadChartData = (type) => {
  const content = `Laporan Grafik GuruKu: ${type}\nWaktu Unduh: ${new Date().toLocaleString('id-ID')}\nStatus: Terverifikasi Sistem`
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `GuruKu-${type}-${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

const exportFinancialReport = () => {
  const headers = ['Tanggal', 'Referensi', 'Kategori', 'Keterangan', 'Jenis', 'Nominal']
  const rows = transactions.value.map(t => [
    t.date,
    t.ref,
    `"${t.category}"`,
    `"${t.description}"`,
    t.type === 'in' ? 'Pemasukan' : 'Pengeluaran',
    t.amount
  ])
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `GuruKu-Laporan-Keuangan-${Date.now()}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const formatRupiah = (val) => {
  return 'Rp ' + Number(val || 0).toLocaleString('id-ID')
}

onMounted(() => {
  loadData()
})
</script>
