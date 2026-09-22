<template>
  <div class="flex h-screen bg-gray-50 font-sans overflow-hidden">
    
    <!-- Sidebar Navigation -->
    <aside class="w-64 bg-gray-900 text-white flex flex-col h-full z-10 shadow-xl">
      <!-- Sidebar Header -->
      <div class="p-5 border-b border-gray-800 flex items-center gap-3">
        <img src="../assets/logo.png" alt="Logo" class="w-10 h-10 object-contain rounded-lg">
        <div>
          <h1 class="font-black text-white leading-tight text-lg">Super Admin</h1>
          <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">SaaS Management</p>
        </div>
      </div>

      <!-- Navigation Links -->
      <div class="flex-1 overflow-y-auto py-6 px-3 space-y-2 custom-scrollbar">
        
        <button @click="activeTab = 'manajemen'" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all"
          :class="activeTab === 'manajemen' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          Manajemen Klien
        </button>
        
        <button @click="activeTab = 'laporan'" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all"
          :class="activeTab === 'laporan' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          Laporan Pendapatan
        </button>

        <button @click="activeTab = 'pengaturan'" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all"
          :class="activeTab === 'pengaturan' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          Pengaturan Sistem
        </button>
        
      </div>

      <!-- Sidebar Footer / Logout -->
      <div class="p-4 border-t border-gray-800">
        <button @click="handleLogout" class="flex items-center justify-center w-full gap-2 px-4 py-3 font-bold text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Keluar (Log Out)
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 overflow-y-auto bg-gray-50/50 p-6 md:p-10 relative">
      <!-- Background Ornament -->
      <div class="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -mt-20 -mr-20"></div>

      <!-- PREMIUM BANNER -->
      <div class="bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center text-white">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div class="relative z-10">
          <h1 class="text-3xl font-black tracking-tight mb-2">Pusat Komando SaaS</h1>
          <p class="text-gray-300 font-medium text-sm md:text-base max-w-lg">Kelola penyewaan aplikasi, kelancaran pembayaran klien, dan pantau metrik pertumbuhan secara *real-time*.</p>
        </div>
        <div class="relative z-10 mt-6 md:mt-0 flex gap-4">
          <div class="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-right">
            <p class="text-xs text-gray-300 uppercase tracking-widest font-bold mb-1">Total Klien Aktif</p>
            <p class="text-3xl font-black text-white">{{ activeClientsCount }}</p>
          </div>
          <div class="bg-indigo-600/30 backdrop-blur-md border border-indigo-500/30 p-4 rounded-2xl text-right hidden sm:block">
            <p class="text-xs text-indigo-200 uppercase tracking-widest font-bold mb-1">Total Pendapatan</p>
            <p class="text-3xl font-black text-white">{{ formatRupiah(totalRevenue) }}</p>
          </div>
        </div>
      </div>

      <!-- MANAJEMEN KLIEN TAB -->
      <div v-if="activeTab === 'manajemen'" class="animate-fade-in">
        <div class="bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
          <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50 backdrop-blur-xl">
            <div>
              <h2 class="text-xl font-black text-gray-800 tracking-tight">Daftar Klien Sekolah (Tenants)</h2>
              <p class="text-sm text-gray-500 mt-1 font-medium">Manajemen batas waktu kontrak dan akses sistem sekolah.</p>
            </div>
            <button @click="showModal = true" class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-indigo-500/40 font-bold transition-all transform hover:-translate-y-1 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              Tambah Klien Baru
            </button>
          </div>
          
          <div class="overflow-x-auto">
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
                  <td class="py-5 px-6 text-right space-x-4">
                    <button @click="blockSchool(school.id)" class="text-sm font-bold text-orange-500 hover:text-orange-700 transition-colors">Blokir</button>
                    <button @click="deleteSchool(school.id, school.name)" class="text-sm font-bold text-red-500 hover:text-red-700 transition-colors">Hapus</button>
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
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
            <div class="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Pendapatan</p>
              <h3 class="text-2xl font-black text-gray-900">{{ formatRupiah(totalRevenue) }}</h3>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
            <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </div>
            <div>
              <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Sekolah Terdaftar</p>
              <h3 class="text-2xl font-black text-gray-900">{{ schools.length }} Klien</h3>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
            <div class="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Klien Expired</p>
              <h3 class="text-2xl font-black text-gray-900">{{ expiredClientsCount }} Akun</h3>
            </div>
          </div>
        </div>

        <!-- Tabel Transaksi Laporan -->
        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-6">
          <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 class="text-lg font-black text-gray-800">Rincian Transaksi Klien</h2>
            <button class="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Ekspor CSV
            </button>
          </div>
          <div class="overflow-x-auto">
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Ubah Password Super Admin -->
          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-max">
            <div class="flex items-center gap-4 mb-6">
              <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <div>
                <h2 class="text-xl font-black text-gray-800">Ubah Password Master</h2>
                <p class="text-xs font-medium text-gray-500">Khusus akses level Super Admin.</p>
              </div>
            </div>

            <form @submit.prevent="changeSuperAdminPassword" class="space-y-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Password Saat Ini</label>
                <input v-model="passForm.old" type="password" required class="w-full bg-white text-gray-900 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm">
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Password Baru</label>
                <input v-model="passForm.new" type="password" required class="w-full bg-white text-gray-900 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm">
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Konfirmasi Password Baru</label>
                <input v-model="passForm.confirm" type="password" required class="w-full bg-white text-gray-900 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm">
              </div>
              <button type="submit" class="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-colors mt-2">Update Password</button>
            </form>
          </div>

          <!-- Laporan Lupa Password -->
          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
            <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-red-50/30">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h2 class="text-lg font-black text-gray-800">Laporan Lupa Password</h2>
              </div>
              <span class="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">{{ forgotPasswordReports.length }} Laporan</span>
            </div>
            
            <div class="flex-1 p-6 overflow-y-auto custom-scrollbar bg-gray-50/30">
              <div v-if="forgotPasswordReports.length === 0" class="text-center text-gray-400 py-10 font-medium">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Belum ada laporan lupa password dari klien.
              </div>
              <div v-else class="space-y-4">
                <div v-for="report in forgotPasswordReports" :key="report.id" class="bg-white border border-red-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div class="flex justify-between items-start mb-2">
                    <div>
                      <h4 class="font-bold text-gray-800">{{ report.school_name }}</h4>
                      <p class="text-xs font-bold text-indigo-600 mt-0.5">@{{ report.username }}</p>
                    </div>
                    <span class="text-[10px] text-gray-400 font-bold">{{ report.date }}</span>
                  </div>
                  <p class="text-sm text-gray-600 my-3 italic">"{{ report.message }}"</p>
                  <div class="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button @click="resolveReport(report.id)" class="flex-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold py-2 rounded-lg transition-colors border border-green-200">Tandai Selesai</button>
                    <button @click="contactClient(report.contact)" class="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 rounded-lg transition-colors border border-blue-200">Hubungi Klien</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>

    </main>

    <!-- Modal Tambah Klien -->
    <div v-if="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-fade-in flex flex-col">
        <div class="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 class="text-xl font-black text-gray-800">Registrasi Klien SaaS</h2>
            <p class="text-xs text-gray-500 font-medium mt-1">Buat tenant sekolah baru beserta akun Admin-nya.</p>
          </div>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 rounded-full p-2 transition-colors border border-gray-200 shadow-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form @submit.prevent="submitKlien" class="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          <!-- Detail Klien -->
          <div class="space-y-4">
            <h3 class="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">Informasi Sekolah</h3>
            
            <div class="relative">
              <label class="block text-sm font-bold text-gray-700 mb-1">Nama Sekolah/Madrasah *</label>
              <input v-model="form.name" @input="searchSchool" type="text" required class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" placeholder="Ketik nama sekolah...">
              
              <!-- Dropdown Saran Autocomplete -->
              <div v-if="showSchoolSuggestions && schoolSuggestions.length > 0" class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                <div v-for="(suggestion, idx) in schoolSuggestions" :key="idx" 
                     @click="selectSchool(suggestion)"
                     class="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors">
                  <p class="text-sm font-bold text-gray-800">{{ suggestion.customName ? suggestion.customName : extractSchoolName(suggestion.display_name) }}</p>
                  <p class="text-[10px] text-gray-500 mt-1 truncate">{{ suggestion.display_name }}</p>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Alamat Lengkap</label>
              <textarea v-model="form.address" rows="2" class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" placeholder="Alamat otomatis terisi jika memilih dari saran..."></textarea>
            </div>
            
            <div>
               <label class="block text-sm font-bold text-gray-700 mb-1">Nomor Kontak (WA/Telp)</label>
               <input v-model="form.contact_number" type="text" class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" placeholder="Contoh: 08123456789">
            </div>
          </div>
          
          <!-- Pembayaran & Kontrak -->
          <div class="space-y-4">
            <h3 class="text-xs font-black text-green-600 uppercase tracking-widest border-b border-green-100 pb-2 pt-2">Kontrak & Pembayaran</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                 <label class="block text-sm font-bold text-gray-700 mb-1">Batas Waktu Kontrak *</label>
                 <input v-model="form.valid_until" type="date" required class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none transition-all shadow-sm">
              </div>
              <div>
                 <label class="block text-sm font-bold text-gray-700 mb-1">Metode Pembayaran</label>
                 <select v-model="form.payment_method" class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none transition-all shadow-sm">
                    <option value="BCA">Transfer BCA</option>
                    <option value="MANDIRI">Transfer Mandiri</option>
                    <option value="BRI">Transfer BRI</option>
                    <option value="CASH">Tunai (Cash)</option>
                    <option value="OTHER">Lainnya</option>
                 </select>
              </div>
            </div>
            
            <div>
               <label class="block text-sm font-bold text-gray-700 mb-1">Nominal Pembayaran (Rp) *</label>
               <input v-model="form.payment_amount" type="number" required class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none transition-all shadow-sm" placeholder="Contoh: 1500000">
            </div>
          </div>
          
          <!-- Akun Akses -->
          <div class="space-y-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <h3 class="text-xs font-black text-gray-600 uppercase tracking-widest border-b border-gray-200 pb-2">Kredensial Akses Admin Sekolah</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label class="block text-sm font-bold text-gray-700 mb-1">Username Klien *</label>
                  <input v-model="form.username" type="text" required class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" placeholder="Contoh: smpn1medan">
                  <p class="text-[10px] text-gray-500 mt-1 font-medium">Username unik untuk login.</p>
               </div>

               <div>
                  <label class="block text-sm font-bold text-gray-700 mb-1">Password Sementara *</label>
                  <input v-model="form.password" type="text" required class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" placeholder="Berikan password kuat">
               </div>
            </div>
          </div>

          <div class="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white">
             <button type="button" @click="showModal = false" class="px-6 py-3 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl font-bold transition-colors">Batal</button>
             <button type="submit" :disabled="saving" class="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2 transform hover:-translate-y-1">
               <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               <span v-if="saving">Memproses...</span>
               <span v-else>Simpan & Buat Tenant</span>
             </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('manajemen')
const showModal = ref(false)
const loading = ref(true)
const saving = ref(false)
const schools = ref([])

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

// Data & Methods for Pengaturan Sistem
const passForm = ref({ old: '', new: '', confirm: '' })

const forgotPasswordReports = ref([
  {
    id: 1,
    school_name: 'SMP Negeri 1 Medan',
    username: 'smpn1medan',
    contact: '081234567890',
    date: '10 Menit lalu',
    message: 'Admin kami lupa password setelah login terakhir bulan lalu. Mohon reset segera.'
  },
  {
    id: 2,
    school_name: 'SMA Swasta Galih Agung',
    username: 'smagalih',
    contact: '082199887766',
    date: '2 Jam lalu',
    message: 'Tidak bisa login, password selalu salah padahal merasa sudah benar.'
  }
])

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

const resolveReport = (id) => {
  forgotPasswordReports.value = forgotPasswordReports.value.filter(r => r.id !== id)
  alert("Laporan telah ditandai selesai dan dihapus dari daftar antrean.")
}

const contactClient = (number) => {
  window.open(`https://wa.me/62${number.substring(1)}`, '_blank')
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

// Custom hardcoded database for client-specific schools
const customSchools = [
  { name: 'SMP Swasta Galih Agung', display_name: 'SMP Swasta Galih Agung, Jl. Berdikari No.1A, Desa Lau Bakeri, Kec. Kutalimbaru, Kab. Deli Serdang, Sumatera Utara 20354' },
  { name: 'SMA SWASTA GALIH AGUNG', display_name: 'SMA SWASTA GALIH AGUNG, Jl. Berdikari No.1A, Desa Lau Bakeri, Kec. Kutalimbaru, Kab. Deli Serdang, Sumatera Utara 20354' },
  { name: 'MTS Darularafah', display_name: 'MTS Darularafah, Jl. Berdikari No.1A, Desa Lau Bakeri, Kec. Kutalimbaru, Kab. Deli Serdang, Sumatera Utara 20354' },
  { name: 'MAS Darularafah', display_name: 'MAS Darularafah, Jl. Berdikari No.1A, Desa Lau Bakeri, Kec. Kutalimbaru, Kab. Deli Serdang, Sumatera Utara 20354' }
]

const searchSchool = () => {
  const queryText = form.value.name.toLowerCase()
  if (queryText.length < 2) {
    schoolSuggestions.value = []
    showSchoolSuggestions.value = false
    return
  }
  
  isSearchingSchool.value = true
  showSchoolSuggestions.value = true
  
  if (searchTimeout) clearTimeout(searchTimeout)
  
  searchTimeout = setTimeout(async () => {
    try {
      // 1. Cek dari Custom Database lokal terlebih dahulu
      const localMatches = customSchools.filter(s => 
        s.name.toLowerCase().includes(queryText) || 
        s.display_name.toLowerCase().includes(queryText)
      ).map(s => ({
        display_name: s.display_name,
        customName: s.name // Penanda custom name
      }))

      // 2. Fetch dari Nominatim OpenStreetMap
      const query = encodeURIComponent(form.value.name)
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&countrycodes=id&limit=5`, {
        headers: { 'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7' }
      })
      
      let apiResults = []
      if (res.ok) {
        apiResults = await res.json()
      }

      // Gabungkan hasil lokal dan API
      schoolSuggestions.value = [...localMatches, ...apiResults].slice(0, 7)
      
    } catch (e) {
      console.error("Gagal mencari sekolah", e)
    } finally {
      isSearchingSchool.value = false
    }
  }, 500)
}

const selectSchool = (suggestion) => {
  if (suggestion.customName) {
    form.value.name = suggestion.customName
  } else {
    form.value.name = extractSchoolName(suggestion.display_name)
  }
  form.value.address = suggestion.display_name
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
    const res = await fetch('/api/v1/super/schools')
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
    const res = await fetch('/api/v1/super/schools', {
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
      const res = await fetch(`/api/v1/super/schools/${id}/block`, { method: 'PUT' })
      if (res.ok) {
        fetchSchools()
      } else {
        alert("Gagal memblokir klien.")
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.")
    }
  }
}

const deleteSchool = async (id, name) => {
  if (confirm(`Peringatan Keras!\nApakah Anda benar-benar yakin ingin menghapus klien "${name}" secara PERMANEN?\n\nSemua data milik klien ini (profil, guru, mata pelajaran, jadwal, dll) akan lenyap dan tidak bisa dikembalikan.`)) {
    try {
      const res = await fetch(`/api/v1/super/schools/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchSchools()
      } else {
        alert("Gagal menghapus klien.")
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan saat menghapus klien.")
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

onMounted(() => {
  fetchSchools()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
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
