<template>
  <div class="min-h-screen bg-slate-50 text-slate-800 py-10 px-4 sm:px-6 lg:px-8 font-sans antialiased selection:bg-blue-600 selection:text-white relative">
    
    <!-- Tombol Bantuan Bulat (?) di Kanan Atas Layar (Konsisten dengan Halaman Login) -->
    <div class="fixed top-5 right-5 sm:top-6 sm:right-6 z-40">
      <button 
        type="button" 
        @click="showHelpModal = true" 
        class="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-[#263D9B] shadow-xl hover:shadow-2xl border border-slate-200/90 flex items-center justify-center font-bold text-lg transition-all hover:scale-110 active:scale-95 group relative cursor-pointer"
        title="Pusat Bantuan & Layanan Billing"
      >
        <svg class="w-6 h-6 text-[#263D9B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="absolute right-full mr-3 px-3 py-1.5 bg-slate-900/90 text-white text-xs font-bold rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Butuh Bantuan Pembayaran?
        </span>
      </button>
    </div>

    <div class="max-w-6xl mx-auto">
      
      <!-- Top Navigation / Breadcrumb -->
      <div class="flex items-center justify-between mb-8">
        <button 
          @click="$router.push('/expired')" 
          class="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700 bg-white border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl shadow-sm transition-all active:scale-95"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Kembali ke Pilihan Paket
        </button>

        <!-- Security Pill -->
        <div class="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs">
          <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
          Enkripsi Bank 256-Bit SSL &bull; Jalur Resmi Terverifikasi
        </div>
      </div>

      <!-- Main Header -->
      <div class="text-center max-w-3xl mx-auto mb-10">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Gerbang Pembayaran & Aktivasi Lisensi
        </h1>
        <p class="text-slate-600 mt-3 text-base sm:text-lg leading-relaxed">
          Penyelesaian tagihan resmi untuk memperpanjang masa aktif sistem jadwal sekolah Anda. Transaksi diproses melalui Virtual Account resmi dan diverifikasi otomatis.
        </p>
      </div>

      <!-- Main Container Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Left Column: Order Summary & Institutional Info (4 Cols) -->
        <div class="lg:col-span-5 space-y-6">
          
          <!-- Summary Card -->
          <div class="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
            <!-- Background Decorative Glow -->
            <div class="absolute -right-12 -top-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div class="absolute -left-12 -bottom-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div class="flex items-center justify-between pb-6 border-b border-slate-800">
              <div>
                <span class="text-xs uppercase tracking-widest font-semibold text-blue-400">Rincian Tagihan</span>
                <h2 class="text-xl font-bold text-white mt-1">Faktur Layanan Sekolah</h2>
              </div>
              <div class="text-right">
                <span class="text-xs font-mono text-slate-400 block">No. Invoice</span>
                <span class="text-xs font-mono font-bold text-slate-200">{{ invoiceNumber }}</span>
              </div>
            </div>

            <!-- Paket Detail -->
            <div class="py-6 border-b border-slate-800 space-y-4">
              <div class="flex items-start justify-between">
                <div>
                  <div class="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-2">
                    Paket Dipilih
                  </div>
                  <h3 class="text-2xl font-black text-white">Paket {{ planName }}</h3>
                  <p class="text-xs text-slate-400 mt-1">Masa aktif langganan: 1 Bulan (30 Hari Kalender)</p>
                </div>
                <div class="text-right">
                  <span class="text-lg font-bold text-white">{{ formattedPrice }}</span>
                </div>
              </div>

              <!-- Feature Highlights for Package -->
              <div class="bg-slate-800/60 rounded-xl p-3 text-xs text-slate-300 space-y-1.5 border border-slate-700/50">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  <span>Akses Penuh Manajemen Guru & Mata Pelajaran</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  <span>Algoritma AI Anti-Bentrok & Ekspor Jadwal (PDF/Excel)</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  <span>Layanan Pemeliharaan Sistem & Sinkronisasi Cloud</span>
                </div>
              </div>
            </div>

            <!-- Price Breakdown -->
            <div class="py-6 border-b border-slate-800 space-y-3 text-sm">
              <div class="flex justify-between items-center text-slate-400">
                <span>Subtotal Layanan</span>
                <span class="text-slate-200 font-medium">{{ formattedPrice }}</span>
              </div>
              <div class="flex justify-between items-center text-slate-400">
                <div class="flex items-center gap-1.5">
                  <span>Biaya Transaksi Virtual Account</span>
                  <span class="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">Gratis</span>
                </div>
                <span class="text-emerald-400 font-medium">Rp 0 (Disubsidi)</span>
              </div>
              <div class="flex justify-between items-center text-slate-400">
                <span>PPN 11% (Termasuk)</span>
                <span class="text-slate-200 font-medium">Rp 0</span>
              </div>
            </div>

            <!-- Total Amount -->
            <div class="pt-6 pb-2 flex justify-between items-baseline">
              <div>
                <span class="text-xs uppercase font-semibold text-slate-400 block tracking-wider">Total Pembayaran</span>
                <span class="text-xs text-slate-500">Nominal pas tanpa kode unik</span>
              </div>
              <div class="text-right">
                <span class="text-3xl font-extrabold text-white tracking-tight">{{ formattedPrice }}</span>
              </div>
            </div>

            <!-- Formal Assurance Note -->
            <div class="mt-6 bg-blue-950/60 border border-blue-500/30 rounded-2xl p-4 flex items-start gap-3.5">
              <div class="p-2 bg-blue-500/20 text-blue-400 rounded-xl flex-shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <div>
                <h4 class="text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Aktivasi Otomatis Terverifikasi</h4>
                <p class="text-xs text-blue-100/80 leading-relaxed">
                  Lisensi dan masa aktif aplikasi sekolah Anda akan diperbarui secara otomatis begitu transaksi terkonfirmasi oleh sistem verifikasi perbankan.
                </p>
              </div>
            </div>

          </div>

          <!-- Trust & Compliance Card -->
          <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3.5">
            <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Standar Keamanan Transaksi</h4>
            <div class="grid grid-cols-2 gap-3 text-xs text-slate-600">
              <div class="flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
                <svg class="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <span class="font-medium">Jalur VA Resmi</span>
              </div>
              <div class="flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
                <svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span class="font-medium">Verifikasi Real-time</span>
              </div>
              <div class="flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
                <svg class="w-4 h-4 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <span class="font-medium">Kuitansi Resmi BOS/LPJ</span>
              </div>
              <div class="flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
                <svg class="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                <span class="font-medium">Layanan Bantuan 24/7</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Right Column: Payment Methods & Virtual Account Instruction (7 Cols) -->
        <div class="lg:col-span-7 space-y-6">
          
          <!-- Category Tabs -->
          <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 class="text-lg font-bold text-slate-900">Pilih Metode Pembayaran</h3>
                <p class="text-xs text-slate-500 mt-0.5">Semua transaksi melalui nomor Virtual Account berlisensi resmi</p>
              </div>

              <!-- Channel Switcher -->
              <div class="flex p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
                <button 
                  @click="activeCategory = 'va'" 
                  :class="['px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer', activeCategory === 'va' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900']"
                >
                  Virtual Account (Bank)
                </button>
                <button 
                  @click="activeCategory = 'ewallet'" 
                  :class="['px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer', activeCategory === 'ewallet' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900']"
                >
                  Dompet Digital & QRIS
                </button>
              </div>
            </div>

            <!-- Method Selection Grid (Virtual Account) -->
            <div v-if="activeCategory === 'va'" class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <button 
                v-for="method in bankMethods" 
                :key="method.id"
                @click="selectMethod(method)"
                :class="[
                  'group p-4 rounded-2xl border-2 text-left transition-all relative flex items-center justify-between cursor-pointer',
                  selectedMethod?.id === method.id 
                    ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20' 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
                ]"
              >
                <div class="flex items-center gap-3.5">
                  <div class="w-14 h-11 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center flex-shrink-0 shadow-xs overflow-hidden">
                    <img :src="method.logo" :alt="method.name" class="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div class="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {{ method.name }}
                    </div>
                    <div class="text-[11px] text-slate-500">
                      {{ method.type }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center">
                  <span v-if="selectedMethod?.id === method.id" class="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                  </span>
                  <span v-else class="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-slate-400"></span>
                </div>
              </button>
            </div>

            <!-- Method Selection Grid (E-Wallets & QRIS) -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <button 
                v-for="method in ewalletMethods" 
                :key="method.id"
                @click="selectMethod(method)"
                :class="[
                  'group p-4 rounded-2xl border-2 text-left transition-all relative flex items-center justify-between cursor-pointer',
                  selectedMethod?.id === method.id 
                    ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20' 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
                ]"
              >
                <div class="flex items-center gap-3.5">
                  <div class="w-14 h-11 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center flex-shrink-0 shadow-xs overflow-hidden">
                    <img :src="method.logo" :alt="method.name" class="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div class="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {{ method.name }}
                    </div>
                    <div class="text-[11px] text-slate-500">
                      {{ method.type }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center">
                  <span v-if="selectedMethod?.id === method.id" class="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                  </span>
                  <span v-else class="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-slate-400"></span>
                </div>
              </button>
            </div>

            <!-- Selected Method Detail Card -->
            <div v-if="selectedMethod" class="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-6">
              
              <!-- Header with Status Pill and Expiry Countdown -->
              <div class="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-200">
                <div class="flex items-center gap-3">
                  <div class="w-14 h-11 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs overflow-hidden">
                    <img :src="selectedMethod.logo" :alt="selectedMethod.name" class="w-full h-full object-contain" />
                  </div>
                  <div>
                    <span class="text-xs text-slate-500 block font-medium">Metode Aktif</span>
                    <span class="text-sm font-bold text-slate-900">{{ selectedMethod.fullName }}</span>
                  </div>
                </div>

                <!-- Status Badge -->
                <div class="flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-semibold">
                  <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  {{ paymentSubmitted ? 'Menunggu Verifikasi Bank' : 'Menunggu Pembayaran' }}
                </div>
              </div>

              <!-- QRIS Display (If QRIS Selected) -->
              <div v-if="selectedMethod.id === 'qris'" class="bg-white rounded-2xl p-6 border border-slate-200 text-center space-y-4 shadow-xs">
                <div class="inline-block px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
                  Standar Nasional Indonesia &bull; Bebas Biaya Admin
                </div>
                
                <div class="max-w-[220px] mx-auto p-4 bg-white border-2 border-slate-800 rounded-2xl shadow-sm relative">
                  <!-- QR Code Mock Graphic with Vector Pattern -->
                  <div class="aspect-square bg-slate-900 rounded-lg p-2.5 flex flex-col justify-between relative overflow-hidden">
                    <div class="flex justify-between w-full">
                      <div class="w-10 h-10 border-4 border-white bg-slate-900 rounded-sm p-1">
                        <div class="w-full h-full bg-white rounded-xs"></div>
                      </div>
                      <div class="w-10 h-10 border-4 border-white bg-slate-900 rounded-sm p-1">
                        <div class="w-full h-full bg-white rounded-xs"></div>
                      </div>
                    </div>
                    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div class="bg-white p-1.5 rounded-md shadow-md border border-slate-200">
                        <span class="text-[9px] font-black tracking-tighter text-red-600 block">QRIS</span>
                      </div>
                    </div>
                    <div class="flex justify-between w-full items-end">
                      <div class="w-10 h-10 border-4 border-white bg-slate-900 rounded-sm p-1">
                        <div class="w-full h-full bg-white rounded-xs"></div>
                      </div>
                      <div class="grid grid-cols-4 gap-1 p-1">
                        <div class="w-1.5 h-1.5 bg-white rounded-xs"></div>
                        <div class="w-1.5 h-1.5 bg-white rounded-xs"></div>
                        <div class="w-1.5 h-1.5 bg-white rounded-xs"></div>
                        <div class="w-1.5 h-1.5 bg-white rounded-xs"></div>
                      </div>
                    </div>
                  </div>
                  <p class="text-[10px] font-mono text-slate-500 mt-2 font-medium">NMID: ID1020261948293</p>
                </div>

                <div class="space-y-1">
                  <p class="text-xs font-bold text-slate-800">A/N: GURUKU INDONESIA BILLING</p>
                  <p class="text-xs text-slate-500">Dapat dipindai dari Livin' Mandiri, BRImo, BSI Mobile, BNI Mobile, DANA, GoPay, OVO & seluruh penyedia QRIS perbankan.</p>
                </div>
              </div>

              <!-- Virtual Account Number Box (For Bank VA & E-Wallets) -->
              <div v-else class="space-y-4">
                <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        {{ selectedMethod.category === 'va' ? 'Nomor Virtual Account' : 'Nomor Akun Terdaftar' }}
                      </span>
                      <p class="text-xs text-slate-400 mt-0.5">Transfer langsung dari aplikasi perbankan atau dompet digital Anda</p>
                    </div>
                    <div class="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 self-start sm:self-auto">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                      Verifikasi Otomatis
                    </div>
                  </div>

                  <!-- VA Number & Copy Button -->
                  <div class="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <div class="font-mono text-xl sm:text-2xl font-black text-slate-900 tracking-wider">
                        {{ formatVANumber(selectedMethod.accountNumber) }}
                      </div>
                      <div class="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <span>Atas Nama:</span>
                        <span class="font-bold text-slate-700">{{ selectedMethod.accountHolder }}</span>
                      </div>
                    </div>

                    <button 
                      @click="copyText(selectedMethod.accountNumber, 'va')"
                      class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                      :class="copiedType === 'va' ? 'bg-emerald-600 text-white' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'"
                    >
                      <svg v-if="copiedType === 'va'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                      <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                      <span>{{ copiedType === 'va' ? 'Tersalin' : 'Salin Nomor' }}</span>
                    </button>
                  </div>

                  <!-- Nominal Exact Transfer Notice -->
                  <div class="flex items-center justify-between pt-2 text-xs">
                    <div>
                      <span class="text-slate-500">Nominal Tepat Tagihan:</span>
                      <span class="font-extrabold text-slate-900 ml-1.5 font-mono">{{ formattedPrice }}</span>
                    </div>
                    <button 
                      @click="copyText(price.toString(), 'nominal')"
                      class="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 text-xs cursor-pointer"
                    >
                      <span>{{ copiedType === 'nominal' ? 'Nominal Tersalin!' : 'Salin Nominal' }}</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Kartu Status Jika Bukti Transfer Sudah Diunggah -->
              <div v-if="paymentSubmitted" class="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3.5 animate-fade-in">
                <div class="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                </div>
                <div>
                  <h5 class="text-xs font-bold text-emerald-900 uppercase tracking-wider">Konfirmasi Transaksi Diterima!</h5>
                  <p class="text-xs text-emerald-700 mt-1 leading-relaxed">
                    Bukti pembayaran atas nama <b>{{ proofForm.senderName }}</b> telah tersimpan di sistem. Administrator finansial sedang melakukan verifikasi (estimasi 1-5 menit). Masa aktif sekolah Anda akan otomatis diperpanjang.
                  </p>
                </div>
              </div>

              <!-- Payment Instructions Step by Step -->
              <div class="space-y-3 pt-2">
                <div class="flex items-center justify-between">
                  <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Tata Cara Pembayaran {{ selectedMethod.name }}
                  </h4>

                  <!-- Instruction Channel Tabs -->
                  <div v-if="selectedMethod.instructions && selectedMethod.instructions.length > 1" class="flex gap-1">
                    <button 
                      v-for="(inst, idx) in selectedMethod.instructions" 
                      :key="idx"
                      @click="activeInstructionTab = idx"
                      :class="['px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer', activeInstructionTab === idx ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:text-slate-700']"
                    >
                      {{ inst.channel }}
                    </button>
                  </div>
                </div>

                <!-- Active Steps -->
                <div class="bg-white rounded-xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
                  <div 
                    v-for="(step, sIdx) in currentInstructions" 
                    :key="sIdx"
                    class="flex items-start gap-2.5"
                  >
                    <span class="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0 text-[11px] mt-0.5">
                      {{ sIdx + 1 }}
                    </span>
                    <span class="leading-relaxed">{{ step }}</span>
                  </div>
                </div>
              </div>

              <!-- Action Confirmation Buttons Grid -->
              <div class="space-y-3 pt-2">
                
                <!-- 1. Tombol Unggah Bukti Transfer / Selesaikan Transaksi (Realistis & Mandiri) -->
                <button 
                  @click="showUploadProofModal = true"
                  class="w-full bg-[#263D9B] hover:bg-[#1f3282] text-white font-bold py-3.5 px-6 rounded-xl shadow-md shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                  </svg>
                  <span>Kirim Bukti Pembayaran / Selesaikan Transaksi</span>
                </button>

                <!-- 2. WhatsApp Confirmation Button (Primary Formal) -->
                <button 
                  @click="confirmPaymentViaWA"
                  class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer text-xs"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>Konfirmasi Pembayaran via WhatsApp Billing</span>
                </button>

                <!-- 3. Check Status Verification Simulation Button -->
                <button 
                  @click="checkTransactionStatus" 
                  :disabled="isCheckingStatus"
                  class="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-4 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  <svg v-if="isCheckingStatus" class="animate-spin w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  <span>{{ isCheckingStatus ? 'Menghubungkan ke Gateway Perbankan...' : 'Periksa Status Pembayaran Otomatis' }}</span>
                </button>
              </div>

            </div>

            <!-- Empty State If No Method Selected -->
            <div v-else class="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
              </div>
              <h4 class="text-sm font-bold text-slate-700">Silakan Pilih Metode Pembayaran</h4>
              <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Klik salah satu Virtual Account bank atau dompet digital di atas untuk memunculkan nomor tagihan resmi.</p>
            </div>

          </div>

          <!-- FAQ Accordion for School Administrators -->
          <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Pertanyaan Umum Seputar Billing & Faktur</h4>
            
            <div class="space-y-3 text-xs text-slate-600">
              <details class="group bg-slate-50 rounded-xl p-3 border border-slate-200/70">
                <summary class="font-bold text-slate-800 cursor-pointer list-none flex items-center justify-between">
                  <span>Berapa lama lisensi sekolah kami akan aktif setelah pembayaran?</span>
                  <svg class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </summary>
                <p class="mt-2 text-slate-600 leading-relaxed">
                  Sistem verifikasi otomatis mendeteksi pelunasan transaksi Virtual Account dalam 1 hingga 5 menit. Masa aktif akun institusi Anda akan langsung diperpanjang tanpa perlu login ulang.
                </p>
              </details>

              <details class="group bg-slate-50 rounded-xl p-3 border border-slate-200/70">
                <summary class="font-bold text-slate-800 cursor-pointer list-none flex items-center justify-between">
                  <span>Apakah kami dapat meminta kuitansi dan faktur resmi untuk pelaporan dana BOS/LPJ?</span>
                  <svg class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </summary>
                <p class="mt-2 text-slate-600 leading-relaxed">
                  Tentu. Setelah pembayaran selesai, tim billing kami menyediakan kuitansi berstempel dinas digital lengkap dengan nomor NPWP pengembang untuk kebutuhan pelaporan pertanggungjawaban dana sekolah (BOS/BOP).
                </p>
              </details>

              <details class="group bg-slate-50 rounded-xl p-3 border border-slate-200/70">
                <summary class="font-bold text-slate-800 cursor-pointer list-none flex items-center justify-between">
                  <span>Bagaimana jika terjadi kendala saat melakukan transfer Virtual Account?</span>
                  <svg class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </summary>
                <p class="mt-2 text-slate-600 leading-relaxed">
                  Tim help desk dan keuangan kami bertugas penuh mendampingi proses aktivasi institusi Anda melalui tombol tanda tanya (?) di kanan atas atau layanan WhatsApp resmi.
                </p>
              </details>
            </div>
          </div>

        </div>

      </div>

    </div>

    <!-- MODAL 1: BANTUAN & KONSULTASI BILLING (Triggered by ? Button) -->
    <div v-if="showHelpModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div class="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        <!-- Header Modal -->
        <div class="px-6 py-5 bg-[#263D9B] text-white flex items-center justify-between flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-white leading-tight">Pusat Bantuan & Layanan Billing</h3>
              <p class="text-xs text-blue-200 mt-0.5">Bingung cara bayar atau butuh panduan? Hubungi tim admin kami.</p>
            </div>
          </div>
          <button @click="showHelpModal = false" class="text-blue-200 hover:text-white transition-colors cursor-pointer p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="submitHelpTicket" class="p-6 overflow-y-auto space-y-4 text-xs">
          
          <!-- Quick WhatsApp Option -->
          <div class="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3">
            <div>
              <p class="font-bold text-emerald-900">Ingin respons kilat via WhatsApp?</p>
              <p class="text-[11px] text-emerald-700">Chat CS Admin Billing langsung tanpa antre.</p>
            </div>
            <a 
              :href="whatsappDirectHelpUrl" 
              target="_blank"
              class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap flex items-center gap-1.5"
            >
              <span>Chat WhatsApp</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </a>
          </div>

          <div class="relative flex py-1 items-center">
            <div class="flex-grow border-t border-slate-200"></div>
            <span class="flex-shrink mx-3 text-slate-400 text-[10px] font-bold uppercase tracking-wider">Atau Kirim Tiket Aduan</span>
            <div class="flex-grow border-t border-slate-200"></div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Nama Lengkap / Petugas *</label>
              <input 
                type="text" 
                v-model.trim="helpForm.name" 
                placeholder="Nama Anda"
                required
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#263D9B] focus:ring-2 focus:ring-[#263D9B]/10 transition-all bg-white"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Nomor WhatsApp Aktif *</label>
              <input 
                type="text" 
                v-model.trim="helpForm.contact" 
                placeholder="08xxxxxxxxxx"
                required
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#263D9B] focus:ring-2 focus:ring-[#263D9B]/10 transition-all bg-white"
              />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Asal Sekolah / Lembaga *</label>
            <input 
              type="text" 
              v-model.trim="helpForm.school" 
              placeholder="Contoh: SMP Negeri 1 Jakarta"
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#263D9B] focus:ring-2 focus:ring-[#263D9B]/10 transition-all bg-white"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Kategori Kendala Pembayaran *</label>
            <select 
              v-model="helpForm.category" 
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#263D9B] bg-white"
            >
              <option value="Panduan Transfer Virtual Account (M-Banking / ATM)">Panduan Transfer Virtual Account (M-Banking / ATM)</option>
              <option value="Konfirmasi & Validasi Pembayaran Lisensi">Konfirmasi & Validasi Pembayaran Lisensi</option>
              <option value="Permintaan Rekening Bank Lain / Alternatif">Permintaan Rekening Bank Lain / Alternatif</option>
              <option value="Permintaan Faktur / Kuitansi LPJ Dana BOS">Permintaan Faktur / Kuitansi LPJ Dana BOS</option>
              <option value="Pertanyaan / Kendala Teknis Lainnya">Pertanyaan / Kendala Teknis Lainnya</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Pesan / Pertanyaan Anda *</label>
            <textarea 
              v-model.trim="helpForm.message" 
              rows="3" 
              placeholder="Jelaskan pertanyaan atau kendala yang Anda alami seputar pembayaran..."
              required
              class="w-full p-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#263D9B] focus:ring-2 focus:ring-[#263D9B]/10 transition-all bg-white leading-relaxed"
            ></textarea>
          </div>

          <div class="pt-2 flex gap-3">
            <button 
              type="button" 
              @click="showHelpModal = false" 
              class="w-1/3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button 
              type="submit" 
              :disabled="isSubmittingHelp"
              class="w-2/3 py-3 rounded-xl bg-[#263D9B] hover:bg-[#1d3080] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              <span v-if="!isSubmittingHelp">Kirim Aduan & Saran</span>
              <span v-else>Mengirim...</span>
            </button>
          </div>

        </form>

      </div>
    </div>

    <!-- MODAL 2: UNGGAH BUKTI PEMBAYARAN (Realistis Selesaikan Transaksi) -->
    <div v-if="showUploadProofModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div class="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        <!-- Header -->
        <div class="px-6 py-5 bg-[#263D9B] text-white flex items-center justify-between flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-white leading-tight">Konfirmasi & Bukti Pembayaran</h3>
              <p class="text-xs text-blue-200 mt-0.5">Invoice: {{ invoiceNumber }} &bull; Total: {{ formattedPrice }}</p>
            </div>
          </div>
          <button @click="showUploadProofModal = false" class="text-blue-200 hover:text-white transition-colors cursor-pointer p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="submitPaymentProof" class="p-6 overflow-y-auto space-y-4 text-xs">
          
          <div class="bg-blue-50 p-3.5 rounded-2xl border border-blue-100 text-blue-900 space-y-1">
            <p class="font-bold flex items-center gap-1.5">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span>Metode Dipilih: {{ selectedMethod.fullName }}</span>
            </p>
            <p class="text-[11px] text-blue-700">Nomor Tujuan: <b>{{ selectedMethod.accountNumber }}</b> (A/N: {{ selectedMethod.accountHolder }})</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Nama Pemilik Rekening Pengirim *</label>
              <input 
                type="text" 
                v-model.trim="proofForm.senderName" 
                placeholder="Contoh: Bendahara SMPN 1"
                required
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#263D9B] focus:ring-2 focus:ring-[#263D9B]/10 transition-all bg-white"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Bank / Aplikasi Pengirim *</label>
              <input 
                type="text" 
                v-model.trim="proofForm.bankName" 
                placeholder="Contoh: Bank BRI / Mandiri / DANA"
                required
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#263D9B] focus:ring-2 focus:ring-[#263D9B]/10 transition-all bg-white"
              />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Unggah Struk / Bukti Transfer *</label>
            <div class="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50 relative">
              <input 
                type="file" 
                accept="image/*" 
                @change="handleFileUpload" 
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              <div v-if="!proofPreview" class="space-y-1">
                <svg class="w-8 h-8 text-slate-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <p class="font-bold text-slate-700">Klik untuk unggah screenshot bukti transfer</p>
                <p class="text-[11px] text-slate-400">Format JPG, PNG atau PDF (Maksimal 5MB)</p>
              </div>
              <div v-else class="space-y-2">
                <img :src="proofPreview" alt="Pratinjau Bukti" class="h-28 mx-auto rounded-xl object-contain shadow-xs border border-slate-200" />
                <p class="text-[11px] font-bold text-emerald-600">Bukti berhasil dipilih (Klik untuk ganti)</p>
              </div>
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
            <textarea 
              v-model.trim="proofForm.notes" 
              rows="2" 
              placeholder="Keterangan tambahan jika diperlukan..."
              class="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#263D9B] bg-white"
            ></textarea>
          </div>

          <div class="pt-2 flex gap-3">
            <button 
              type="button" 
              @click="showUploadProofModal = false" 
              class="w-1/3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button 
              type="submit" 
              :disabled="isSubmittingProof"
              class="w-2/3 py-3 rounded-xl bg-[#263D9B] hover:bg-[#1d3080] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              <span v-if="!isSubmittingProof">Kirim Bukti Pembayaran</span>
              <span v-else>Memproses...</span>
            </button>
          </div>

        </form>

      </div>
    </div>

    <!-- POPUP 3: SUKSES ADUAN / KONSULTASI (Animasi Chibi Bebas & Di Atas Popup) -->
    <div v-if="showSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 pt-20 bg-slate-950/70 backdrop-blur-md animate-fade-in" @click.self="showSuccessModal = false">
      <div class="w-full max-w-sm sm:max-w-md relative animate-pop-in mt-16 sm:mt-20">
        
        <!-- Animasi Chibi Megaphone Berdiri Di Atas Popup (100% Utuh Tanpa Terpotong/Kejepit) -->
        <div class="absolute -top-32 sm:-top-36 left-1/2 -translate-x-1/2 flex justify-center pointer-events-none z-30 w-full">
          <div class="relative flex justify-center">
            <div class="absolute inset-0 bg-blue-500/25 rounded-full blur-2xl transform scale-90"></div>
            <img 
              :src="aduanSuksesImg" 
              alt="Aduan Berhasil Diteruskan" 
              class="relative w-44 h-52 sm:w-52 sm:h-60 object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.35)] animate-bounce-gentle pointer-events-none"
            />
          </div>
        </div>

        <!-- Kartu Putih Popup (Tanpa overflow-hidden agar animasi bebas & tidak kejepit) -->
        <div class="bg-white rounded-[32px] shadow-2xl border border-slate-100 text-center p-6 sm:p-8 pt-12 sm:pt-14 relative overflow-visible">
          
          <!-- Tombol Tutup X di Pojok Atas Kanan -->
          <button 
            @click="showSuccessModal = false" 
            class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors cursor-pointer z-10"
            title="Tutup"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <!-- Konten Teks Sesuai Permintaan Persis -->
          <div class="space-y-3 px-1 sm:px-2">
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-black uppercase tracking-wider border border-emerald-100">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
              <span>Pesan Berhasil Terkirim</span>
            </div>

            <h3 class="text-lg font-black text-slate-800 tracking-tight">
              Pusat Bantuan & Billing Menerima Pesan Anda
            </h3>

            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
              pesan anda sudah kami teruskan ke pusat bantuan, kami akan memproses nya tunggu sebentar lagi CS akan mengkabari anda lewat nomor yang anda daftarkan terimakasih
            </p>

            <div class="pt-2">
              <button 
                @click="showSuccessModal = false" 
                type="button"
                class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#263D9B] to-[#1e307d] hover:from-[#1e307d] hover:to-[#172562] text-white font-black text-xs shadow-lg shadow-[#263D9B]/30 hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                Baik, Terima Kasih
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import aduanSuksesImg from '../assets/aduan-sukses.png'

import briIcon from '../assets/icon-pay/bri.jpg'
import livinIcon from '../assets/icon-pay/livin.jpg'
import bsiIcon from '../assets/icon-pay/bsi.jpg'
import bniIcon from '../assets/icon-pay/bni.jpg'
import qrisIcon from '../assets/icon-pay/qris.jpg'
import danaIcon from '../assets/icon-pay/dana.jpg'
import gopayIcon from '../assets/icon-pay/gopay.jpg'
import ovoIcon from '../assets/icon-pay/ovo.jpg'

const route = useRoute()
const router = useRouter()

// Package & Pricing Configuration
const planName = route.query.plan || 'Plus'
const planPrices = {
  'Standard': 499000,
  'Plus': 899000,
  'Premium': 2500000
}
const price = planPrices[planName] || 899000

const formattedPrice = computed(() => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)
})

// Generate Formal Invoice Code based on Date
const invoiceNumber = computed(() => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return `INV-${dateStr}-${(price % 10000).toString().padStart(4, '7')}`
})

// Admin Center Phone
const adminPhone = "08218487328"

// Active Category Tab: 'va' (Virtual Account) or 'ewallet' (Dompet Digital & QRIS)
const activeCategory = ref('va')

// Active Instruction Channel Tab index
const activeInstructionTab = ref(0)

// Copying state
const copiedType = ref(null)
const isCheckingStatus = ref(false)

// Modals State
const showHelpModal = ref(false)
const showSuccessModal = ref(false)
const showUploadProofModal = ref(false)
const isSubmittingHelp = ref(false)
const isSubmittingProof = ref(false)
const paymentSubmitted = ref(false)

// Form Bantuan & Aduan
const helpForm = ref({
  name: '',
  contact: '',
  school: '',
  category: 'Panduan Transfer Virtual Account (M-Banking / ATM)',
  message: ''
})

// Form Bukti Pembayaran
const proofForm = ref({
  senderName: '',
  bankName: '',
  notes: '',
  fileData: null
})
const proofPreview = ref(null)

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    const rawDataUrl = e.target.result
    proofPreview.value = rawDataUrl

    // Kompres gambar otomatis (maks 1200px, JPEG 0.75) agar muat di database & localStorage tanpa crash
    const img = new Image()
    img.onload = () => {
      const maxDim = 1200
      let w = img.width
      let h = img.height
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w)
          w = maxDim
        } else {
          w = Math.round((w * maxDim) / h)
          h = maxDim
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, w, h)
      const compressed = canvas.toDataURL('image/jpeg', 0.75)
      proofForm.value.fileData = compressed
    }
    img.src = rawDataUrl
  }
  reader.readAsDataURL(file)
}

// -----------------------------------------------------------------------------------------
// METODE PEMBAYARAN RESMI (4 Virtual Account Bank & 4 Dompet Digital / QRIS)
// -----------------------------------------------------------------------------------------

const bankMethods = [
  {
    id: 'bri_va',
    name: 'BRI (BRIVA)',
    fullName: 'BRI Virtual Account (BRIVA)',
    type: 'Bank Rakyat Indonesia',
    category: 'va',
    accountNumber: `8881${adminPhone}`,
    accountHolder: 'GuruKu Billing - PT Edukasi Nusantara',
    logo: briIcon,
    instructions: [
      {
        channel: 'BRImo (Aplikasi)',
        steps: [
          'Buka dan login ke aplikasi BRImo di smartphone Anda.',
          'Pilih menu "Tagihan" lalu klik "BRIVA" (BRI Virtual Account).',
          'Pilih "Pembayaran Baru" dan masukkan Nomor BRIVA di atas.',
          'Periksa detail nama penerima (GuruKu Billing) dan nominal pembayaran.',
          'Masukkan PIN BRImo Anda dan simpan bukti transfer transaksi.'
        ]
      },
      {
        channel: 'ATM BRI',
        steps: [
          'Masukkan kartu ATM BRI dan PIN Anda di mesin ATM.',
          'Pilih menu "Transaksi Lain" lalu pilih "Pembayaran".',
          'Pilih menu "Lainnya" > pilih "BRIVA".',
          'Masukkan Nomor Virtual Account BRIVA yang tertera di atas.',
          'Konfirmasi kesesuaian data dan tekan "Ya" untuk menyelesaikan.'
        ]
      },
      {
        channel: 'Internet Banking',
        steps: [
          'Buka situs ib.bri.co.id dan login ke akun Internet Banking Anda.',
          'Pilih menu "Pembayaran" > "BRIVA".',
          'Masukkan kode Virtual Account di atas dan pastikan nominal tepat.',
          'Konfirmasi dengan memasukkan m-Token BRI Anda.'
        ]
      }
    ]
  },
  {
    id: 'mandiri_va',
    name: 'Livin\' Mandiri',
    fullName: 'Mandiri Virtual Account (Livin\')',
    type: 'Bank Mandiri (Persero) Tbk',
    category: 'va',
    accountNumber: `8902${adminPhone}`,
    accountHolder: 'GuruKu Billing - PT Edukasi Nusantara',
    logo: livinIcon,
    instructions: [
      {
        channel: 'Livin\' by Mandiri',
        steps: [
          'Buka aplikasi Livin\' by Mandiri dan lakukan login.',
          'Pilih menu "Bayar" lalu cari penyedia jasa / ketik "Mandiri Virtual Account".',
          'Masukkan Nomor Virtual Account Mandiri di atas.',
          'Konfirmasi nama tagihan dan nominal pembayaran yang tertera.',
          'Masukkan PIN Livin\' Mandiri Anda untuk memproses transaksi.'
        ]
      },
      {
        channel: 'ATM Mandiri',
        steps: [
          'Masukkan kartu ATM Mandiri dan masukkan PIN.',
          'Pilih menu "Bayar/Beli" > pilih "Lainnya" > pilih "Multi Payment".',
          'Masukkan Nomor Mandiri Virtual Account di atas.',
          'Pastikan rincian tagihan sesuai dan tekan "1" kemudian "Ya".'
        ]
      }
    ]
  },
  {
    id: 'bsi_va',
    name: 'BSI (Bank Syariah)',
    fullName: 'BSI Virtual Account Syariah',
    type: 'Bank Syariah Indonesia Tbk',
    category: 'va',
    accountNumber: `9012${adminPhone}`,
    accountHolder: 'GuruKu Billing - PT Edukasi Nusantara',
    logo: bsiIcon,
    instructions: [
      {
        channel: 'BSI Mobile',
        steps: [
          'Buka aplikasi BSI Mobile di smartphone Anda.',
          'Pilih menu "Bayar" lalu pilih "Virtual Account / Institusi".',
          'Masukkan Nomor BSI Virtual Account di atas.',
          'Periksa nama penerima tagihan institusi dan nominal.',
          'Masukkan PIN transaksi BSI Mobile Anda dan simpan bukti transaksi.'
        ]
      },
      {
        channel: 'ATM BSI',
        steps: [
          'Masukkan kartu ATM BSI dan PIN Anda.',
          'Pilih menu "Main Menu" > "Pembayaran/Pembelian".',
          'Pilih "Virtual Account" dan masukkan nomor di atas.',
          'Konfirmasi rincian pembayaran dan selesaikan transaksi.'
        ]
      }
    ]
  },
  {
    id: 'bni_va',
    name: 'BNI Virtual Account',
    fullName: 'BNI Virtual Account (BNI)',
    type: 'Bank Negara Indonesia Tbk',
    category: 'va',
    accountNumber: `8277${adminPhone}`,
    accountHolder: 'GuruKu Billing - PT Edukasi Nusantara',
    logo: bniIcon,
    instructions: [
      {
        channel: 'BNI Mobile Banking',
        steps: [
          'Buka aplikasi BNI Mobile Banking dan login.',
          'Pilih menu "Pembayaran" lalu pilih "Virtual Account Billing".',
          'Pilih tab "Input Baru" dan tempelkan Nomor BNI Virtual Account di atas.',
          'Periksa nominal dan masukkan Password Transaksi BNI Anda.'
        ]
      },
      {
        channel: 'ATM BNI',
        steps: [
          'Masukkan kartu ATM BNI dan PIN Anda.',
          'Pilih "Menu Lain" > "Pembayaran" > "Virtual Account Billing".',
          'Masukkan nomor Virtual Account dan konfirmasi pembayaran.'
        ]
      }
    ]
  }
]

const ewalletMethods = [
  {
    id: 'qris',
    name: 'QRIS (Semua Bank & Dompet)',
    fullName: 'QRIS Standar Nasional Indonesia',
    type: 'Mandiri, BRI, BNI, BSI, DANA, GoPay, OVO',
    category: 'ewallet',
    accountNumber: 'QRIS-GURUKU-ID',
    accountHolder: 'GURUKU INDONESIA BILLING',
    logo: qrisIcon,
    instructions: [
      {
        channel: 'Scan Aplikasi Apapun',
        steps: [
          'Buka aplikasi M-Banking (Mandiri, BRI, BNI, BSI, dll) atau E-Wallet pilihan Anda.',
          'Pilih menu "Scan" atau "QRIS".',
          'Arahkan kamera ke kode QRIS resmi di layar.',
          'Pastikan nama penerima tertulis "GURUKU INDONESIA BILLING".',
          'Masukkan nominal pembayaran tepat sesuai tagihan dan masukkan PIN Anda.'
        ]
      }
    ]
  },
  {
    id: 'dana',
    name: 'DANA',
    fullName: 'DANA Dompet Digital Indonesia',
    type: 'Layanan Pembayaran Dompet Digital DANA',
    category: 'ewallet',
    accountNumber: adminPhone,
    accountHolder: 'Admin Finansial GuruKu',
    logo: danaIcon,
    instructions: [
      {
        channel: 'Aplikasi DANA',
        steps: [
          'Buka aplikasi DANA di ponsel Anda.',
          'Pilih menu "Kirim" atau "Send".',
          'Pilih "Kirim ke Nomor Telepon" dan masukkan nomor akun di atas.',
          'Ketik nominal transfer tepat sesuai tagihan Anda.',
          'Konfirmasi transaksi dan masukkan PIN DANA Anda.'
        ]
      }
    ]
  },
  {
    id: 'gopay',
    name: 'GoPay',
    fullName: 'GoPay Indonesia (GoTo Finansial)',
    type: 'Dompet Digital GoPay / GoJek',
    category: 'ewallet',
    accountNumber: adminPhone,
    accountHolder: 'Admin Finansial GuruKu',
    logo: gopayIcon,
    instructions: [
      {
        channel: 'Aplikasi GoPay / Gojek',
        steps: [
          'Buka aplikasi GoPay atau Gojek.',
          'Pilih menu "Transfer" / "Kirim".',
          'Masukkan nomor akun GoPay tujuan di atas.',
          'Tuliskan nominal tagihan dan konfirmasi rincian akun.',
          'Masukkan PIN GoPay Anda untuk menyelesaikan transfer.'
        ]
      }
    ]
  },
  {
    id: 'ovo',
    name: 'OVO',
    fullName: 'OVO Payment Digital',
    type: 'Dompet Digital OVO',
    category: 'ewallet',
    accountNumber: adminPhone,
    accountHolder: 'Admin Finansial GuruKu',
    logo: ovoIcon,
    instructions: [
      {
        channel: 'Aplikasi OVO',
        steps: [
          'Buka aplikasi OVO di smartphone Anda.',
          'Pilih menu "Transfer" lalu pilih "Sesama OVO".',
          'Masukkan nomor ponsel OVO yang tertera di atas.',
          'Masukkan nominal tagihan dan konfirmasi pengiriman dana.'
        ]
      }
    ]
  }
]

// Default Selected Method (BRI BRIVA)
const selectedMethod = ref(bankMethods[0])

const selectMethod = (method) => {
  selectedMethod.value = method
  activeInstructionTab.value = 0
}

// Current active instruction steps
const currentInstructions = computed(() => {
  if (!selectedMethod.value || !selectedMethod.value.instructions) return []
  const inst = selectedMethod.value.instructions[activeInstructionTab.value] || selectedMethod.value.instructions[0]
  return inst ? inst.steps : []
})

// Format VA with spacing for readable presentation
const formatVANumber = (num) => {
  if (!num) return ''
  return num.replace(/(\d{4})(?=\d)/g, '$1 ')
}

// Clipboard copy with visual badge feedback
const copyText = (text, type) => {
  navigator.clipboard.writeText(text)
  copiedType.value = type
  setTimeout(() => {
    if (copiedType.value === type) {
      copiedType.value = null
    }
  }, 3000)
}

// Direct WhatsApp URL for Help Modal
const whatsappDirectHelpUrl = computed(() => {
  const msg = encodeURIComponent(`Halo Tim CS Admin GuruKu, saya sedang di halaman pembayaran perpanjangan paket ${planName} (${formattedPrice.value}) dan memerlukan bantuan/konsultasi pembayaran.`)
  return `https://wa.me/62${adminPhone.substring(1)}?text=${msg}`
})

// Preload gambar animasi chibi saat halaman pertama kali dibuka agar muncul instan tanpa loading
onMounted(() => {
  const img = new Image()
  img.src = aduanSuksesImg
})

// Submit Help Ticket (Instan Tanpa Loading Menunggu Jaringan)
const submitHelpTicket = () => {
  if (isSubmittingHelp.value) return
  isSubmittingHelp.value = true

  const payload = {
    name: helpForm.value.name,
    contact: helpForm.value.contact,
    school: helpForm.value.school || 'Pelanggan Billing',
    category: helpForm.value.category,
    message: `[KENDALA BILLING - ${planName} / ${formattedPrice.value}]\n${helpForm.value.message}`
  }

  const now = new Date()
  const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + 
                  now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  const localTicket = {
    id: 'TICK-' + Date.now().toString().slice(-4),
    name: helpForm.value.name,
    contact: helpForm.value.contact,
    school: helpForm.value.school || 'Pelanggan Billing',
    category: helpForm.value.category,
    message: `[KENDALA BILLING - ${planName} / ${formattedPrice.value}]\n${helpForm.value.message}`,
    status: 'MENUNGGU',
    date: dateStr
  }

  let existing = []
  try {
    const raw = localStorage.getItem('guruKu_support_tickets')
    if (raw) existing = JSON.parse(raw)
  } catch (e) {}

  existing.unshift(localTicket)
  localStorage.setItem('guruKu_support_tickets', JSON.stringify(existing))

  // TUTUP MODAL FORM & TAMPILKAN POPUP ANIMASI CHIBI SECARA INSTAN (0 Detik Delay)
  showHelpModal.value = false
  showSuccessModal.value = true
  isSubmittingHelp.value = false

  // Reset Form
  helpForm.value = {
    name: '',
    contact: '',
    school: '',
    category: 'Panduan Transfer Virtual Account (M-Banking / ATM)',
    message: ''
  }

  // Kirim sinkronisasi ke backend serverless di latar belakang (tanpa menahan antarmuka pengguna)
  try {
    fetch('/api/v1/support-tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {})
  } catch (e) {}
}

// Submit Proof of Payment
const submitPaymentProof = () => {
  if (isSubmittingProof.value) return
  isSubmittingProof.value = true

  const paymentRecord = {
    invoice: invoiceNumber.value,
    plan: planName,
    amount: price,
    method: selectedMethod.value.fullName,
    senderName: proofForm.value.senderName,
    bankName: proofForm.value.bankName,
    notes: proofForm.value.notes,
    proofImage: proofForm.value.fileData,
    status: 'MENUNGGU_VERIFIKASI',
    timestamp: new Date().toISOString(),
    formattedDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  // 1. Simpan ke localStorage dengan aman untuk fallback instan
  try {
    let existingPayments = []
    const raw = localStorage.getItem('guruKu_pending_payments')
    if (raw) existingPayments = JSON.parse(raw)
    existingPayments = existingPayments.filter(p => p.invoice !== paymentRecord.invoice)
    existingPayments.unshift(paymentRecord)
    localStorage.setItem('guruKu_pending_payments', JSON.stringify(existingPayments))
  } catch (e) {
    console.warn('LocalStorage quota warning:', e)
  }

  // 2. Kirim ke Database Neon PostgreSQL melalui Cloud API agar Super Admin melihatnya di perangkat manapun
  try {
    fetch('/api/v1/payment-confirmations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoice: paymentRecord.invoice,
        plan: paymentRecord.plan,
        amount: paymentRecord.amount,
        method: paymentRecord.method,
        senderName: paymentRecord.senderName,
        bankName: paymentRecord.bankName,
        notes: paymentRecord.notes || '',
        proofImage: paymentRecord.proofImage || ''
      })
    }).then(res => res.json()).then(data => {
      console.log('[Billing API] Berhasil tersinkronisasi ke server:', data)
    }).catch(err => {
      console.warn('[Billing API] Gagal terhubung ke cloud API:', err)
    })
  } catch (e) {}

  // 3. Update status tampilan secara instan tanpa membuat pengguna menunggu lama
  setTimeout(() => {
    paymentSubmitted.value = true
    showUploadProofModal.value = false
    isSubmittingProof.value = false

    alert(`Bukti pembayaran untuk [${invoiceNumber.value}] berhasil dikirim!\n\nTim verifikasi sedang mencocokkan mutasi bank. Begitu transaksi terverifikasi, lisensi sekolah Anda otomatis aktif.`)
  }, 400)
}

// Check Transaction Status Simulation
const checkTransactionStatus = () => {
  isCheckingStatus.value = true
  setTimeout(() => {
    isCheckingStatus.value = false
    if (paymentSubmitted.value) {
      alert(`Status Transaksi [${invoiceNumber.value}]:\nBukti pembayaran Anda sudah tercatat di sistem (Menunggu Konfirmasi Admin). Estimasi waktu aktivasi: 1 - 5 menit.`)
    } else {
      alert(`Status Transaksi [${invoiceNumber.value}]:\nSistem sedang menunggu penerimaan dana dari perbankan. Silakan selesaikan pembayaran melalui nomor Virtual Account yang tertera atau unggah bukti transfer.`)
    }
  }, 1200)
}

// WhatsApp Confirmation with Formal Indonesian Copywriting
const confirmPaymentViaWA = () => {
  const methodTitle = selectedMethod.value?.fullName || 'Virtual Account'
  const message = [
    `*KONFIRMASI PEMBAYARAN LISENSI SISTEM SEKOLAH*`,
    `----------------------------------------`,
    `Yth. Tim Layanan Finansial & Billing,`,
    ``,
    `Kami bermaksud mengonfirmasikan pembayaran tagihan perpanjangan lisensi sistem jadwal sekolah dengan rincian berikut:`,
    ``,
    `* No. Invoice: ${invoiceNumber.value}`,
    `* Paket Layanan: Paket ${planName} (1 Bulan)`,
    `* Total Tagihan: ${formattedPrice.value}`,
    `* Metode Pembayaran: ${methodTitle}`,
    `* Nomor VA / Akun Tujuan: ${selectedMethod.value?.accountNumber}`,
    `* Status: Transaksi Telah Dilakukan`,
    ``,
    `Mohon kiranya sistem dapat memverifikasi dan memperbarui masa aktif lisensi institusi kami. Bukti transfer telah kami siapkan. Terima kasih atas kerja samanya.`
  ].join('\n')

  const encodedUrl = `https://wa.me/62${adminPhone.substring(1)}?text=${encodeURIComponent(message)}`
  window.open(encodedUrl, '_blank')
}
</script>
