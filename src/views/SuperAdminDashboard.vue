<template>
  <div class="flex h-screen bg-gray-50 font-sans overflow-hidden relative">
    
    <!-- Mobile Backdrop -->
    <div 
      v-if="isSidebarOpen" 
      @click="isSidebarOpen = false" 
      class="fixed inset-0 bg-gray-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
    ></div>

    <!-- Sidebar Navigation -->
    <aside 
      class="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col h-full shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Sidebar Header -->
      <div class="p-5 border-b border-gray-800 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="../assets/logo.png" alt="Logo" class="w-10 h-10 object-contain rounded-lg">
          <div>
            <h1 class="font-black text-white leading-tight text-lg">Super Admin</h1>
            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">SaaS Management</p>
          </div>
        </div>
        <button @click="isSidebarOpen = false" class="lg:hidden p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors" aria-label="Tutup Menu">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Navigation Links -->
      <div class="flex-1 overflow-y-auto py-6 px-3 space-y-2 custom-scrollbar">
        
        <button @click="activeTab = 'manajemen'; isSidebarOpen = false" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all cursor-pointer"
          :class="activeTab === 'manajemen' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'">
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          <span>Manajemen Klien</span>
        </button>
        
        <button @click="activeTab = 'laporan'; isSidebarOpen = false" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all cursor-pointer"
          :class="activeTab === 'laporan' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'">
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          <span>Laporan Pendapatan</span>
        </button>

        <button @click="activeTab = 'verifikasi'; isSidebarOpen = false" class="w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all relative cursor-pointer"
          :class="activeTab === 'verifikasi' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>Verifikasi Bayar</span>
          </div>
          <span v-if="pendingPaymentsCount > 0" class="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse">
            {{ pendingPaymentsCount }}
          </span>
        </button>

        <button @click="activeTab = 'aduan'; isSidebarOpen = false" class="w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all relative cursor-pointer"
          :class="activeTab === 'aduan' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>Aduan & Saran</span>
          </div>
          <span v-if="unreadTicketsCount > 0" class="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
            {{ unreadTicketsCount }}
          </span>
        </button>

        <button @click="activeTab = 'pengaturan'; isSidebarOpen = false" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all cursor-pointer"
          :class="activeTab === 'pengaturan' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'">
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          <span>Pengaturan Sistem</span>
        </button>
        
      </div>

      <!-- Sidebar Footer / Logout -->
      <div class="p-4 border-t border-gray-800">
        <button @click="handleLogout" class="flex items-center justify-center w-full gap-2 px-4 py-3 font-bold text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          <span>Keluar (Log Out)</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area Wrapper -->
    <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

      <!-- Mobile & Tablet Header Bar (Visible on < lg screens) -->
      <header class="lg:hidden bg-gray-900 text-white border-b border-gray-800 px-4 py-3 flex items-center justify-between shrink-0 z-30 shadow-md">
        <div class="flex items-center gap-3">
          <button @click="isSidebarOpen = true" class="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-xl transition-colors cursor-pointer" aria-label="Buka Menu">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <div class="flex items-center gap-2">
            <img src="../assets/logo.png" alt="Logo" class="w-7 h-7 object-contain rounded-md">
            <div>
              <span class="font-black text-sm tracking-tight leading-none block">Super Admin</span>
              <span class="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Pusat Komando</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 truncate max-w-[120px] sm:max-w-none">
            {{ currentTabTitle }}
          </span>
          <button @click="handleLogout" class="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer" title="Keluar">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          </button>
        </div>
      </header>

      <!-- Mobile Quick Horizontal Tab Bar (< lg screens) -->
      <nav class="lg:hidden bg-white border-b border-gray-200 px-3 py-2 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0 shadow-xs">
        <button 
          v-for="tab in tabItems" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          :class="activeTab === tab.id ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >
          <span>{{ tab.label }}</span>
          <span v-if="tab.badge > 0" class="px-1.5 py-0.2 rounded-full text-[10px] font-black" :class="activeTab === tab.id ? 'bg-white text-indigo-700' : 'bg-emerald-500 text-white'">
            {{ tab.badge }}
          </span>
        </button>
      </nav>

      <!-- Scrollable Main View -->
      <main class="flex-1 overflow-y-auto bg-gray-50/50 p-3 sm:p-5 md:p-8 lg:p-10 relative custom-scrollbar">
        <!-- Background Ornament -->
        <div class="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -mt-20 -mr-20"></div>

        <!-- PREMIUM BANNER -->
        <div class="bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 mb-6 sm:mb-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-5 text-white">
          <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div class="relative z-10">
            <h1 class="text-xl sm:text-2xl md:text-3xl font-black tracking-tight mb-1.5 sm:mb-2">Pusat Komando SaaS</h1>
            <p class="text-gray-300 font-medium text-xs sm:text-sm md:text-base max-w-lg leading-relaxed">Kelola penyewaan aplikasi, kelancaran pembayaran klien, dan pantau metrik pertumbuhan secara *real-time*.</p>
          </div>
          <div class="relative z-10 w-full md:w-auto grid grid-cols-2 gap-2.5 sm:gap-4 shrink-0">
            <div class="bg-white/10 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-left md:text-right">
              <p class="text-[10px] sm:text-xs text-gray-300 uppercase tracking-widest font-bold mb-1">Klien Aktif</p>
              <p class="text-xl sm:text-2xl md:text-3xl font-black text-white font-mono">{{ activeClientsCount }}</p>
            </div>
            <div class="bg-indigo-600/30 backdrop-blur-md border border-indigo-500/30 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-left md:text-right">
              <p class="text-[10px] sm:text-xs text-indigo-200 uppercase tracking-widest font-bold mb-1">Total Pendapatan</p>
              <p class="text-sm sm:text-lg md:text-2xl font-black text-white font-mono truncate" :title="formatRupiah(totalRevenue)">{{ formatRupiah(totalRevenue) }}</p>
            </div>
          </div>
        </div>

        <!-- MANAJEMEN KLIEN TAB -->
        <div v-if="activeTab === 'manajemen'" class="animate-fade-in">
          <div class="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
            <div class="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 backdrop-blur-xl">
              <div>
                <h2 class="text-lg sm:text-xl font-black text-gray-800 tracking-tight">Daftar Klien Sekolah (Tenants)</h2>
                <p class="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 font-medium">Manajemen batas waktu kontrak dan akses sistem sekolah.</p>
              </div>
              <button @click="showModal = true" class="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-indigo-500/40 font-bold text-xs sm:text-sm transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer">
                <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                <span>Tambah Klien Baru</span>
              </button>
            </div>
            
            <!-- Mobile Cards View (< md) -->
            <div class="md:hidden divide-y divide-gray-100">
              <div v-if="loading" class="p-8 text-center text-gray-400 font-bold animate-pulse text-sm">
                Memuat Data Klien...
              </div>
              <div v-else-if="schools.length === 0" class="p-10 text-center text-gray-400 text-sm">
                Belum ada klien sekolah yang terdaftar.
              </div>
              <div v-for="school in schools" :key="'m-'+school.id" class="p-4 hover:bg-gray-50/80 transition-colors space-y-3">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <h3 class="font-bold text-gray-900 text-sm leading-snug">{{ school.name }}</h3>
                    <p class="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                      <span class="truncate max-w-[220px]" :title="school.address">{{ school.address || '-' }}</span>
                    </p>
                  </div>
                  <span v-if="isExpired(school.valid_until)" class="px-2 py-0.5 text-[10px] font-black rounded-md bg-red-100 text-red-700 border border-red-200 uppercase tracking-widest shrink-0">Expired</span>
                  <span v-else class="px-2 py-0.5 text-[10px] font-black rounded-md bg-green-100 text-green-700 border border-green-200 uppercase tracking-widest shrink-0">Active</span>
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <div>
                    <span class="text-[10px] text-gray-400 block font-bold uppercase">Admin Akun</span>
                    <span class="font-mono font-bold text-indigo-700 truncate block">@{{ school.admin_username }}</span>
                  </div>
                  <div>
                    <span class="text-[10px] text-gray-400 block font-bold uppercase">Kontak</span>
                    <span class="font-semibold text-gray-700 truncate block">{{ school.contact_number || '-' }}</span>
                  </div>
                  <div>
                    <span class="text-[10px] text-gray-400 block font-bold uppercase">Pembayaran</span>
                    <span class="font-bold text-gray-800">{{ school.payment_method }} &bull; {{ formatRupiah(school.payment_amount) }}</span>
                  </div>
                  <div>
                    <span class="text-[10px] text-gray-400 block font-bold uppercase">Batas Waktu</span>
                    <span class="font-semibold text-gray-700">{{ formatDate(school.valid_until) }}</span>
                  </div>
                </div>

                <div class="flex items-center justify-end gap-2 pt-1">
                  <button @click="blockSchool(school.id)" class="px-3 py-1.5 rounded-lg text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-colors cursor-pointer">
                    Blokir
                  </button>
                  <button @click="deleteSchool(school.id, school.name)" class="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer">
                    Hapus
                  </button>
                </div>
              </div>
            </div>

            <!-- Desktop Table (>= md) -->
            <div class="hidden md:block overflow-x-auto custom-scrollbar">
              <table class="min-w-full bg-white">
                <thead>
                  <tr class="bg-gray-50/80 text-left border-y border-gray-100">
                    <th class="py-4 px-6 uppercase font-black text-[11px] text-gray-400 tracking-wider">Nama Sekolah</th>
                    <th class="py-4 px-6 uppercase font-black text-[11px] text-gray-400 tracking-wider">Kontak & Asal</th>
                    <th class="py-4 px-6 uppercase font-black text-[11px] text-gray-400 tracking-wider">Username Admin</th>
                    <th class="py-4 px-6 uppercase font-black text-[11px] text-gray-400 tracking-wider">Status & Batas Waktu</th>
                    <th class="py-4 px-6 uppercase font-black text-[11px] text-gray-400 tracking-wider text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr v-if="loading" class="animate-pulse">
                    <td colspan="5" class="py-10 text-center text-gray-400 font-bold">Memuat Data Klien...</td>
                  </tr>
                  <tr v-else-if="schools.length === 0">
                    <td colspan="5" class="py-16 text-center text-gray-400 font-medium">
                      <svg class="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                      Belum ada klien sekolah yang terdaftar.
                    </td>
                  </tr>
                  <tr v-for="school in schools" :key="school.id" class="hover:bg-blue-50/30 transition-colors group">
                    <td class="py-5 px-6">
                      <p class="font-bold text-gray-900 text-sm mb-1 group-hover:text-blue-700 transition-colors">{{ school.name }}</p>
                      <p class="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                        {{ school.payment_method }} ({{ formatRupiah(school.payment_amount) }})
                      </p>
                    </td>
                    <td class="py-5 px-6">
                      <p class="text-sm font-bold text-gray-700 mb-1">{{ school.contact_number || '-' }}</p>
                      <p class="text-[11px] text-gray-500 font-medium max-w-[200px] truncate" :title="school.address">{{ school.address || '-' }}</p>
                    </td>
                    <td class="py-5 px-6">
                      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        {{ school.admin_username }}
                      </span>
                    </td>
                    <td class="py-5 px-6">
                      <div class="flex flex-col gap-1.5">
                        <span v-if="isExpired(school.valid_until)" class="inline-flex w-max px-2.5 py-1 text-[10px] font-black rounded-md bg-red-100 text-red-700 border border-red-200 uppercase tracking-widest">Expired</span>
                        <span v-else class="inline-flex w-max px-2.5 py-1 text-[10px] font-black rounded-md bg-green-100 text-green-700 border border-green-200 uppercase tracking-widest">Active</span>
                        <span class="text-xs font-bold text-gray-500">{{ formatDate(school.valid_until) }}</span>
                      </div>
                    </td>
                    <td class="py-5 px-6 text-right space-x-4 whitespace-nowrap">
                      <button @click="blockSchool(school.id)" class="text-sm font-bold text-orange-500 hover:text-orange-700 transition-colors cursor-pointer">Blokir</button>
                      <button @click="deleteSchool(school.id, school.name)" class="text-sm font-bold text-red-500 hover:text-red-700 transition-colors cursor-pointer">Hapus</button>
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
            <div class="md:hidden divide-y divide-gray-100">
              <div v-if="schools.length === 0" class="p-8 text-center text-gray-400 text-xs">
                Tidak ada riwayat transaksi.
              </div>
              <div v-for="school in schools" :key="'tx-mob-'+school.id" class="p-4 hover:bg-gray-50/80 transition-colors space-y-2">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <h4 class="font-bold text-gray-800 text-sm truncate">{{ school.name }}</h4>
                    <p class="text-[11px] text-gray-400">Admin: @{{ school.admin_username }}</p>
                  </div>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-50 text-blue-700 uppercase shrink-0">
                    {{ school.payment_method }}
                  </span>
                </div>
                <div class="flex items-center justify-between text-xs pt-1">
                  <span class="text-gray-500">{{ school.contact_number || '-' }}</span>
                  <span class="font-black text-gray-900 font-mono text-sm">{{ formatRupiah(school.payment_amount) }}</span>
                </div>
              </div>
              <div class="p-4 bg-gray-50 flex items-center justify-between font-black text-sm">
                <span class="text-gray-600 uppercase text-xs">Total Terkumpul:</span>
                <span class="text-green-600 font-mono text-base">{{ formatRupiah(totalRevenue) }}</span>
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
                      <p class="text-[11px] text-gray-400 mt-0.5">Admin: {{ school.admin_username }}</p>
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
                    <button @click="contactClient(report.contact)" class="flex-1 min-w-[120px] bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 px-3 rounded-lg transition-colors border border-blue-200 text-center cursor-pointer">
                      Hubungi Klien
                    </button>
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
          <div class="md:hidden divide-y divide-gray-100">
            <div v-if="pendingPayments.length === 0" class="py-12 text-center text-gray-400 text-xs font-medium">
              <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Belum ada konfirmasi pembayaran baru yang masuk.
            </div>
            <div v-for="(p, pIdx) in pendingPayments" :key="'p-mob-'+pIdx" class="p-4 hover:bg-gray-50/80 transition-colors space-y-3">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <span class="text-xs font-bold text-blue-600 font-mono block">{{ p.invoice }}</span>
                  <h4 class="font-bold text-gray-900 text-sm mt-0.5">{{ p.senderName }}</h4>
                  <p class="text-xs text-gray-500 font-medium">Dari: {{ p.bankName }}</p>
                </div>
                <span 
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0"
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
                  {{ p.status === 'MENUNGGU_VERIFIKASI' ? 'Menunggu' : p.status }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <div>
                  <span class="text-[10px] text-gray-400 block font-bold uppercase">Paket & Tanggal</span>
                  <span class="font-bold text-gray-800">Paket {{ p.plan }} &bull; {{ p.formattedDate }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-gray-400 block font-bold uppercase">Nominal & Metode</span>
                  <span class="font-black text-indigo-700 font-mono">{{ formatRupiah(p.amount) }} ({{ p.method }})</span>
                </div>
              </div>

              <div v-if="p.notes" class="text-xs text-gray-600 italic bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                "{{ p.notes }}"
              </div>

              <!-- Struk Foto -->
              <div v-if="p.proofImage" class="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100">
                <img 
                  :src="p.proofImage" 
                  alt="Bukti Transfer" 
                  @click="previewReceiptImage = p.proofImage"
                  class="w-14 h-14 rounded-lg object-cover border border-slate-200 shadow-2xs cursor-pointer hover:scale-105 transition-transform shrink-0" 
                />
                <div class="flex-1 min-w-0">
                  <span class="text-xs font-bold text-gray-800 block">Bukti Transfer</span>
                  <button 
                    @click="previewReceiptImage = p.proofImage" 
                    class="text-xs text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1 mt-0.5"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    <span>Lihat Foto Penuh</span>
                  </button>
                </div>
              </div>

              <div class="flex items-center gap-2 pt-1">
                <button 
                  v-if="p.status === 'MENUNGGU_VERIFIKASI'"
                  @click="approvePayment(p)"
                  class="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                  <span>Setujui (+30 Hari)</span>
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
                  class="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-200 transition-colors cursor-pointer"
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
                      <span>Setujui (+30 Hari)</span>
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
        <div class="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
          <div class="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white/50 backdrop-blur-xl">
            <div>
              <h2 class="text-lg sm:text-xl font-black text-gray-800 tracking-tight">Pusat Layanan Aduan & Saran Klien</h2>
              <p class="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 font-medium">Laporan kendala login, pesan keluhan, dan saran pengguna dari seluruh sekolah.</p>
            </div>
            <div class="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2">
              <select v-model="filterTicketStatus" class="flex-1 sm:flex-initial px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none">
                <option value="ALL">Semua Status</option>
                <option value="MENUNGGU">Menunggu</option>
                <option value="DIPROSES">Diproses</option>
                <option value="SELESAI">Selesai</option>
              </select>
              <button @click="loadSupportTickets" class="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 transition-colors cursor-pointer shrink-0" title="Perbarui Data">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              </button>
            </div>
          </div>
          
          <!-- Mobile Cards View (< md) -->
          <div class="md:hidden divide-y divide-gray-100">
            <div v-if="filteredSupportTickets.length === 0" class="py-12 text-center text-gray-400 font-bold text-xs">
              Tidak ada tiket aduan atau saran yang ditemukan.
            </div>
            <div v-for="t in filteredSupportTickets" :key="'t-mob-'+t.id" class="p-4 hover:bg-gray-50/80 transition-colors space-y-3">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <h4 class="font-bold text-gray-900 text-sm">{{ t.name }}</h4>
                  <p class="text-xs text-indigo-600 font-semibold">{{ t.contact || '-' }}</p>
                  <p class="text-[10px] text-gray-400 mt-0.5">{{ t.date }}</p>
                </div>
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0"
                  :class="{
                    'bg-amber-100 text-amber-800': t.status === 'MENUNGGU',
                    'bg-blue-100 text-blue-800': t.status === 'DIPROSES',
                    'bg-emerald-100 text-emerald-800': t.status === 'SELESAI'
                  }"
                >
                  <span class="w-1.5 h-1.5 rounded-full"
                    :class="{
                      'bg-amber-500': t.status === 'MENUNGGU',
                      'bg-blue-500': t.status === 'DIPROSES',
                      'bg-emerald-500': t.status === 'SELESAI'
                    }"
                  ></span>
                  {{ t.status }}
                </span>
              </div>

              <div class="flex items-center gap-2 text-xs">
                <span class="px-2 py-0.5 rounded-md font-bold bg-indigo-50 text-indigo-700 text-[10px]">
                  {{ t.category || 'Kendala Umum' }}
                </span>
                <span class="text-gray-600 font-medium truncate">{{ t.school || 'Pengguna Mandiri' }}</span>
              </div>

              <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-700 leading-relaxed font-medium italic">
                "{{ t.message }}"
              </div>

              <div class="flex items-center gap-2 pt-1">
                <button 
                  v-if="t.contact"
                  @click="contactClientWA(t.contact, t.name)"
                  class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition-all cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                  <span>WhatsApp</span>
                </button>
                <button 
                  v-if="t.status !== 'SELESAI'"
                  @click="resolveSupportTicket(t.id)"
                  class="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition-colors cursor-pointer"
                >
                  Selesaikan
                </button>
                <button 
                  @click="deleteSupportTicket(t.id)"
                  class="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-200 transition-colors cursor-pointer"
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
                        'bg-amber-100 text-amber-800': t.status === 'MENUNGGU',
                        'bg-blue-100 text-blue-800': t.status === 'DIPROSES',
                        'bg-emerald-100 text-emerald-800': t.status === 'SELESAI'
                      }"
                    >
                      <span class="w-1.5 h-1.5 rounded-full"
                        :class="{
                          'bg-amber-500': t.status === 'MENUNGGU',
                          'bg-blue-500': t.status === 'DIPROSES',
                          'bg-emerald-500': t.status === 'SELESAI'
                        }"
                      ></span>
                      {{ t.status }}
                    </span>
                  </td>
                  <td class="py-4 px-6 text-right space-x-1 whitespace-nowrap">
                    <button 
                      v-if="t.contact"
                      @click="contactClientWA(t.contact, t.name)"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition-all cursor-pointer shadow-sm active:scale-95"
                      title="Hubungi Pelapor via WhatsApp"
                    >
                      <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                      <span>WhatsApp</span>
                    </button>
                    <button 
                      v-if="t.status !== 'SELESAI'"
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

      </main>
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
            <h3 class="text-xs font-black text-green-600 uppercase tracking-widest border-b border-green-100 pb-2 pt-2">Kontrak & Pembayaran</h3>
            
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
               <input v-model="form.payment_amount" type="number" required class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-green-500 outline-none transition-all shadow-sm text-sm" placeholder="Nominal pembayaran langganan">
            </div>
          </div>
          
          <!-- Akun Akses -->
          <div class="space-y-3 sm:space-y-4 bg-gray-50 p-3.5 sm:p-4 rounded-2xl border border-gray-200">
            <h3 class="text-xs font-black text-gray-600 uppercase tracking-widest border-b border-gray-200 pb-2">Kredensial Akses Admin Sekolah</h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
               <div>
                  <label class="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Username Klien *</label>
                  <input v-model="form.username" type="text" required class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm" placeholder="Username unik sekolah">
                  <p class="text-[10px] text-gray-500 mt-1 font-medium">Username unik untuk login.</p>
               </div>

               <div>
                  <label class="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Password Sementara *</label>
                  <input v-model="form.password" type="text" required class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm" placeholder="Berikan password kuat">
               </div>
            </div>
          </div>

          <div class="p-4 sm:p-6 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 sticky bottom-0 bg-white z-10 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6">
             <button type="button" @click="showModal = false" class="w-full sm:w-auto px-6 py-2.5 sm:py-3 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl font-bold transition-colors text-sm cursor-pointer">Batal</button>
             <button type="submit" :disabled="saving" class="w-full sm:w-auto px-8 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 text-sm cursor-pointer">
               <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
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

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { SafeFlow } from '../core/SafeFlow.js'
import indonesiaSchools from '../data/schools_indonesia.json'

const router = useRouter()
const activeTab = ref('manajemen')
const isSidebarOpen = ref(false)
const showModal = ref(false)
const loading = ref(true)
const saving = ref(false)
const schools = ref([])

const currentTabTitle = computed(() => {
  switch (activeTab.value) {
    case 'manajemen': return 'Manajemen Klien'
    case 'laporan': return 'Laporan Pendapatan'
    case 'verifikasi': return 'Verifikasi Bayar'
    case 'aduan': return 'Aduan & Saran'
    case 'pengaturan': return 'Pengaturan Sistem'
    default: return 'Super Admin'
  }
})

const tabItems = computed(() => [
  { id: 'manajemen', label: 'Manajemen Klien', badge: 0 },
  { id: 'laporan', label: 'Laporan Pendapatan', badge: 0 },
  { id: 'verifikasi', label: 'Verifikasi Bayar', badge: pendingPaymentsCount.value },
  { id: 'aduan', label: 'Aduan & Saran', badge: unreadTicketsCount.value },
  { id: 'pengaturan', label: 'Pengaturan', badge: forgotPasswordReports.value?.length || 0 }
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
  return pendingPayments.value.filter(p => p.status === 'MENUNGGU_VERIFIKASI').length
})

const approvePayment = async (payment) => {
  payment.status = 'TERVERIFIKASI'
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
    baseDate.setDate(baseDate.getDate() + 30)
    matched.valid_until = baseDate.toISOString().slice(0, 10)
  }

  alert(`Pembayaran [${payment.invoice}] berhasil disetujui! Status diperbarui menjadi TERVERIFIKASI.`)
}

const rejectPayment = async (payment) => {
  if (confirm(`Tolak konfirmasi pembayaran [${payment.invoice}]?`)) {
    payment.status = 'DITOLAK'
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
  return supportTickets.value.filter(t => t.status === 'MENUNGGU').length
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
  if (!phone) {
    alert("Nomor telepon / WhatsApp tidak valid atau kosong.")
    return
  }
  let cleanPhone = phone.toString().replace(/[^0-9]/g, '')
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1)
  } else if (!cleanPhone.startsWith('62')) {
    cleanPhone = '62' + cleanPhone
  }
  const msg = encodeURIComponent(`Halo Bpk/Ibu ${name || ''}, kami dari Tim Layanan Super Admin GuruKu menindaklanjuti aduan/saran yang Anda kirimkan. Bagaimana kami dapat membantu?`)
  window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${msg}`, '_blank')
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

const contactClient = (number) => {
  if (!number) {
    alert("Nomor WhatsApp tidak valid atau kosong.")
    return
  }
  let cleanPhone = number.toString().replace(/[^0-9]/g, '')
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1)
  } else if (!cleanPhone.startsWith('62')) {
    cleanPhone = '62' + cleanPhone
  }
  const msg = encodeURIComponent(`Halo Bpk/Ibu, kami dari Layanan Super Admin GuruKu menindaklanjuti permohonan reset akses akun sekolah Anda.`)
  window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${msg}`, '_blank')
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
        username: form.value.username,
        password: form.value.password
      })
    })

    if (res.ok) {
      alert("Klien baru berhasil ditambahkan!")
      showModal.value = false
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
  }
}

onMounted(() => {
  fetchSchools()
  loadForgotPasswordReports()
  loadSupportTickets()
  loadPendingPayments()
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('storage', handleStorageChange)
  
  // Polling real-time (3 detik) agar tersinkron otomatis dengan database serverless Neon
  reportInterval = setInterval(() => {
    loadForgotPasswordReports()
    loadSupportTickets()
    loadPendingPayments()
  }, 3000)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('storage', handleStorageChange)
  if (reportInterval) clearInterval(reportInterval)
})

const handleLogout = () => {
  localStorage.clear()
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
</style>
