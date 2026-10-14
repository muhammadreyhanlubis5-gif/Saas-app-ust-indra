<template>
  <!-- Loading Animation Overlay (Menyiapkan Ruang Kerja) -->
  <div v-if="showAnimation" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/95 backdrop-blur-sm transition-opacity duration-300">
    <div class="relative flex flex-col items-center">
      <img :src="animasiImg" alt="Loading..." class="w-48 h-48 object-contain z-10" />
      <h2 class="mt-8 text-2xl font-semibold text-white tracking-wide z-10">Menyiapkan Ruang Kerja Anda...</h2>
      <p class="mt-3 text-blue-300 text-sm font-medium z-10 animate-pulse transition-all duration-300">{{ loadingText }}</p>
    </div>
  </div>

  <!-- Container Utama (Responsif di semua ukuran layar) -->
  <div class="min-h-screen w-full flex items-center justify-center bg-[#eaedf7] font-sans p-3 sm:p-6 lg:p-8 relative">
    
    <!-- Tombol Bantuan Bulat (?) di Kanan Atas Layar -->
    <div class="fixed top-5 right-5 sm:top-6 sm:right-6 z-40">
      <button 
        type="button" 
        @click="showHelpModal = true" 
        class="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-[#263D9B] shadow-xl hover:shadow-2xl border border-slate-200/90 flex items-center justify-center font-bold text-lg transition-all hover:scale-110 active:scale-95 group relative cursor-pointer"
        title="Pusat Bantuan & Layanan Aduan"
      >
        <svg class="w-6 h-6 text-[#263D9B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="absolute right-full mr-3 px-3 py-1.5 bg-slate-900/90 text-white text-xs font-bold rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Pusat Bantuan & Aduan
        </span>
      </button>
    </div>

    <!-- Kartu Terpusat Modern (Dua Kolom Split) -->
    <div class="w-full max-w-sm sm:max-w-md md:max-w-4xl lg:max-w-4xl bg-white rounded-3xl md:rounded-[36px] shadow-[0_25px_70px_-15px_rgba(20,35,90,0.22)] overflow-hidden flex flex-col md:flex-row border border-slate-200/60 my-auto transition-all duration-300">
      
      <!-- PANEL KIRI: Slider Otomatis 8 Slide (Interval 5 detik, Bingkai Rapi & Mewah) -->
      <div 
        class="group w-full md:w-[48%] bg-[#263D9B] text-white p-6 sm:p-8 md:p-10 flex flex-col justify-between items-center relative overflow-hidden select-none min-h-[460px] sm:min-h-[500px] md:min-h-[540px]"
        @mouseenter="pauseSlider"
        @mouseleave="resumeSlider"
      >
        <!-- Efek pencahayaan ambient radial halus -->
        <div class="absolute -top-20 -left-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/15 rounded-full blur-2xl pointer-events-none"></div>

        <!-- Tag branding atas (Bahasa Indonesia) -->
        <div class="relative z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold tracking-wider text-blue-100 uppercase">
          <svg class="w-3.5 h-3.5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          <span>Penjadwalan Cerdas GuruKu</span>
        </div>

        <!-- Konten Slide Tengah dengan Bingkai Kokoh & Rapi -->
        <div class="relative z-10 w-full flex flex-col items-center justify-center my-auto text-center py-2">
          
          <!-- BINGKAI FOTO TERUKUR: Menyesuaikan seluruh aspek rasio 8 slide agar tidak berantakan -->
          <div class="w-full flex items-center justify-center mb-3 sm:mb-4">
            <div class="relative w-full max-w-[270px] sm:max-w-[300px] md:max-w-[320px] h-44 sm:h-52 md:h-56 rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 bg-white/15 backdrop-blur-md border border-white/30 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.35)] flex items-center justify-center overflow-hidden">
              
              <!-- Wadah dalam putih dengan bayangan inset halus -->
              <div class="w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-white flex items-center justify-center relative p-1 shadow-inner">
                <img 
                  :key="slides[currentSlide].id"
                  :src="slides[currentSlide].image" 
                  :alt="slides[currentSlide].title" 
                  class="max-h-full max-w-full object-contain transition-all duration-700 select-none animate-fade-scale" 
                />
              </div>

              <!-- Tombol Navigasi Cepat Sisi Kiri & Kanan (Muncul saat hover) -->
              <button 
                type="button" 
                @click.stop="prevSlide" 
                class="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 hover:scale-110 focus:opacity-100 cursor-pointer shadow-md"
                title="Slide Sebelumnya"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <button 
                type="button" 
                @click.stop="nextSlideManual" 
                class="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 hover:scale-110 focus:opacity-100 cursor-pointer shadow-md"
                title="Slide Selanjutnya"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
              </button>

            </div>
          </div>

          <!-- Teks Judul & Subjudul Slide (Ketinggian terkendali agar stabil) -->
          <div class="min-h-[64px] sm:min-h-[70px] flex flex-col justify-center">
            <h3 class="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white mb-1 transition-all duration-300">
              {{ slides[currentSlide].title }}
            </h3>
            <p class="text-[11px] sm:text-xs text-blue-100/80 max-w-xs leading-relaxed transition-all duration-300 line-clamp-2">
              {{ slides[currentSlide].subtitle }}
            </p>
          </div>

        </div>

        <!-- Titik Indikator 8 Slide (Pagination Dots) -->
        <div class="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2 pt-1 flex-wrap max-w-[280px]">
          <button 
            v-for="(slide, index) in slides" 
            :key="slide.id"
            @click="goToSlide(index)"
            :title="slide.title"
            class="transition-all duration-300 focus:outline-none cursor-pointer"
            :class="currentSlide === index 
              ? 'w-3 h-3 bg-white rounded-full ring-4 ring-indigo-300/40 shadow-sm scale-110' 
              : 'w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/40 hover:bg-white/70 rounded-full'"
          >
          </button>
        </div>

      </div>

      <!-- PANEL KANAN: Formulir Masuk (Clean & Bahasa Indonesia Penuh) -->
      <div class="w-full md:w-[52%] bg-white p-6 sm:p-8 md:p-12 flex flex-col justify-center relative">
        
        <!-- Notifikasi Password Baru Disetujui -->
        <div v-if="approvedNotification" class="mb-5 sm:mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 animate-fade-in shadow-sm">
          <svg class="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <p class="text-xs font-bold text-emerald-800">Password Baru Disetujui</p>
            <p class="text-xs text-emerald-700 mt-0.5">Password Anda telah dikonfirmasi oleh Super Admin. Silakan masuk menggunakan password baru.</p>
          </div>
        </div>

        <!-- Mode Masuk Standar -->
        <div v-if="!showForgotPassword" class="animate-fade-in">
          
          <!-- Logo Aplikasi GuruKu (Rapi dan Elegan) -->
          <div class="flex justify-center mb-3 sm:mb-4">
            <div class="p-1 rounded-2xl bg-white shadow-md shadow-slate-200/60 border border-slate-100 ring-2 ring-slate-100/50">
              <img 
                :src="logoApk" 
                alt="Logo GuruKu" 
                class="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover"
              />
            </div>
          </div>

          <!-- Judul "Selamat Datang" -->
          <div class="text-center mb-5 sm:mb-7">
            <h2 class="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">Selamat Datang</h2>
            <p class="text-xs text-gray-400 mt-1.5 font-medium">Masuk ke portal administrasi GuruKu</p>
          </div>

          <!-- Formulir Masuk -->
          <form @submit.prevent="handleLogin" class="space-y-4">
            
            <!-- Input Username dengan Ikon Avatar Pengguna -->
            <div>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <input 
                  type="text" 
                  id="username" 
                  v-model.trim="username" 
                  placeholder="Username" 
                  class="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#263D9B] focus:ring-4 focus:ring-[#263D9B]/10 transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            <!-- Input Password dengan Ikon Gembok & Tombol Mata Interaktif -->
            <div>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  id="password" 
                  v-model="password" 
                  placeholder="Password" 
                  class="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#263D9B] focus:ring-4 focus:ring-[#263D9B]/10 transition-all shadow-sm"
                  required
                />
                <!-- Tombol Mata (Tampilkan / Sembunyikan Password) -->
                <button 
                  type="button" 
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors cursor-pointer"
                  :title="showPassword ? 'Sembunyikan password' : 'Lihat password'"
                >
                  <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Tautan Lupa Password -->
            <div class="flex justify-end pt-0.5">
              <button 
                type="button" 
                @click="showForgotPassword = true" 
                class="text-xs font-semibold text-gray-400 hover:text-[#263D9B] transition-colors cursor-pointer"
              >
                Lupa password?
              </button>
            </div>

            <!-- Tombol Masuk (Biru Royal Kapsul) -->
            <div class="pt-2">
              <button 
                type="submit" 
                :disabled="isSubmitting"
                class="w-full py-3.5 px-6 rounded-full bg-[#263D9B] hover:bg-[#1d3080] text-white font-bold text-sm shadow-md shadow-[#263D9B]/30 hover:shadow-lg hover:shadow-[#263D9B]/40 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
              >
                <span v-if="!isSubmitting">Masuk</span>
                <span v-else class="flex items-center gap-2">
                  <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Memverifikasi...
                </span>
              </button>
            </div>

          </form>

          <!-- Catatan Keamanan Sistem -->
          <div class="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-gray-100 flex flex-col items-center text-center">
            <div class="flex items-center gap-1.5 text-[11px] font-medium text-gray-400">
              <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              <span>Sistem Akses Internal Terproteksi & Terenkripsi</span>
            </div>
            <p class="text-[10px] text-gray-300 mt-1">© 2026 GuruKu • Sistem Penjadwalan Cerdas Sekolah</p>
          </div>

        </div>

        <!-- Formulir Ajukan Reset Password -->
        <div v-else class="animate-fade-in">
          
          <div class="mb-5 flex items-center justify-between">
            <button 
              type="button" 
              @click="showForgotPassword = false" 
              class="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#263D9B] transition-colors cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              <span>Kembali ke Halaman Masuk</span>
            </button>
            <span class="text-[11px] font-bold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">Bantuan Akses</span>
          </div>

          <div class="mb-5">
            <h3 class="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">Atur Ulang Password</h3>
            <p class="text-xs text-gray-400 mt-1">Ajukan permohonan penggantian password ke Pusat Komando Super Admin.</p>
          </div>

          <form @submit.prevent="submitForgotPassword" class="space-y-4">
            
            <div>
              <label class="block text-xs font-bold text-gray-600 mb-1">Username Klien</label>
              <input 
                type="text" 
                v-model.trim="forgotForm.username"
                placeholder="Masukkan username Anda"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 text-sm focus:outline-none focus:border-[#263D9B] focus:ring-4 focus:ring-[#263D9B]/10 transition-all shadow-sm"
                required
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-600 mb-1">Password Baru Yang Diajukan</label>
              <input 
                type="text" 
                v-model.trim="forgotForm.newPassword"
                placeholder="Ketik password baru"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 text-sm focus:outline-none focus:border-[#263D9B] focus:ring-4 focus:ring-[#263D9B]/10 transition-all shadow-sm"
                required
              />
            </div>

            <div class="flex items-center gap-3 bg-blue-50/70 p-3.5 rounded-xl border border-blue-100">
              <input 
                type="checkbox" 
                id="minta_izin" 
                v-model="forgotForm.requestPermission" 
                required 
                class="w-4 h-4 text-[#263D9B] border-gray-300 rounded focus:ring-[#263D9B] cursor-pointer"
              />
              <label for="minta_izin" class="text-xs font-semibold text-blue-900 cursor-pointer select-none">
                Minta izin ubah password ke Super Admin
              </label>
            </div>

            <div class="pt-2 flex gap-3">
              <button 
                type="button" 
                @click="showForgotPassword = false"
                class="w-1/3 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button 
                type="submit" 
                class="w-2/3 py-3 px-4 rounded-xl bg-[#263D9B] hover:bg-[#1d3080] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Ajukan Perubahan
              </button>
            </div>

          </form>

        </div>

      </div>

    </div>

    <!-- Modal Layanan Bantuan, Saran & Aduan -->
    <div v-if="showHelpModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div class="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        <!-- Header Modal -->
        <div class="px-6 py-5 bg-[#263D9B] text-white flex items-center justify-between flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-white leading-tight">Pusat Bantuan & Aduan</h3>
              <p class="text-xs text-blue-200 mt-0.5">Ada masalah login atau saran? Hubungi admin kami.</p>
            </div>
          </div>
          <button @click="showHelpModal = false" class="text-blue-200 hover:text-white transition-colors cursor-pointer p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="submitHelpTicket" class="p-6 overflow-y-auto space-y-4 text-xs">
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
              <input 
                type="text" 
                v-model.trim="helpForm.name" 
                placeholder="Nama lengkap Anda"
                required
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#263D9B] focus:ring-2 focus:ring-[#263D9B]/10 transition-all bg-white"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Nomor WhatsApp / HP *</label>
              <input 
                type="text" 
                v-model.trim="helpForm.contact" 
                placeholder="Nomor WhatsApp aktif"
                required
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#263D9B] focus:ring-2 focus:ring-[#263D9B]/10 transition-all bg-white"
              />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Asal Sekolah / Lembaga (Opsional)</label>
            <input 
              type="text" 
              v-model.trim="helpForm.school" 
              placeholder="Nama sekolah atau lembaga"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#263D9B] focus:ring-2 focus:ring-[#263D9B]/10 transition-all bg-white"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Kategori Masalah / Pengaduan *</label>
            <select 
              v-model="helpForm.category" 
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#263D9B] bg-white"
            >
              <option value="Kendala Login / Akun Terkunci">Kendala Login / Akun Terkunci</option>
              <option value="Lupa Username / Password">Lupa Username / Password</option>
              <option value="Akun Belum Terdaftar / Masa Kontrak">Akun Belum Terdaftar / Masa Kontrak</option>
              <option value="Laporan Bug / Error Sistem">Laporan Bug / Error Sistem</option>
              <option value="Saran & Masukan Pengembangan">Saran & Masukan Pengembangan</option>
              <option value="Pertanyaan Teknis Lainnya">Pertanyaan Teknis Lainnya</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Pesan / Keluhan / Saran Anda *</label>
            <textarea 
              v-model.trim="helpForm.message" 
              rows="4" 
              placeholder="Ceritakan kendala yang Anda alami secara detail..."
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

    <!-- MODAL POPUP SUKSES ADUAN DENGAN ANIMASI MEGAPON -->
    <div 
      v-if="showSuccessModal" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 pt-20 bg-slate-950/70 backdrop-blur-md animate-fade-in"
      @click.self="showSuccessModal = false"
    >
      <div class="w-full max-w-sm sm:max-w-md relative animate-pop-in mt-16 sm:mt-20">
        
        <!-- Ilustrasi Animasi Megafon Berdiri Di Atas Popup (100% Utuh Bebas Terpotong) -->
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

        <!-- Kartu Putih Popup (Tanpa overflow-hidden agar animasi bebas) -->
        <div class="bg-white rounded-[32px] shadow-2xl border border-slate-100 text-center p-6 sm:p-8 pt-12 sm:pt-14 relative overflow-visible">
          <!-- Tombol Tutup X -->
          <button 
            @click="showSuccessModal = false" 
            class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors cursor-pointer z-10"
            title="Tutup"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <!-- Konten Teks -->
          <div class="space-y-3 px-1 sm:px-2">
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-black uppercase tracking-wider border border-emerald-100">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
              <span>Aduan Berhasil Terkirim</span>
            </div>

            <h3 class="text-lg font-black text-slate-800 tracking-tight">
              Pusat Bantuan Telah Menerima Pesan Anda
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import animasiImg from '../assets/animasi.png'
import aduanSuksesImg from '../assets/aduan-sukses.png'
import logoApk from '../assets/logo-apk.jpg'

// Import 8 Gambar Slide dari folder assets/slides-login
import slide1 from '../assets/slides-login/1.jpg'
import slide2 from '../assets/slides-login/2.jpg'
import slide3 from '../assets/slides-login/3.jpg'
import slide4 from '../assets/slides-login/4.jpg'
import slide5 from '../assets/slides-login/5.jpg'
import slide6 from '../assets/slides-login/6.jpg'
import slide7 from '../assets/slides-login/7.jpg'
import slide8 from '../assets/slides-login/8.jpg'

const router = useRouter()
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const isSubmitting = ref(false)

const showAnimation = ref(false)
const loadingText = ref('Sinkronisasi dengan server...')

// Modal Bantuan & Layanan Aduan
const showHelpModal = ref(false)
const showSuccessModal = ref(false)
const isSubmittingHelp = ref(false)
const helpForm = ref({
  name: '',
  contact: '',
  school: '',
  category: 'Kendala Login / Akun Terkunci',
  message: ''
})

const submitHelpTicket = () => {
  if (isSubmittingHelp.value) return
  isSubmittingHelp.value = true

  const payload = {
    name: helpForm.value.name,
    contact: helpForm.value.contact,
    school: helpForm.value.school || 'Pengguna Login',
    category: helpForm.value.category,
    message: helpForm.value.message
  }

  const now = new Date()
  const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + 
                  now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  const localTicket = {
    id: 'TICK-' + Date.now().toString().slice(-4),
    name: helpForm.value.name,
    contact: helpForm.value.contact,
    school: helpForm.value.school || 'Pengguna Login',
    category: helpForm.value.category,
    message: helpForm.value.message,
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

  // Tutup modal input dan buka popup sukses animasi megafon secara instan (0ms)
  helpForm.value = {
    name: '',
    contact: '',
    school: '',
    category: 'Kendala Login / Akun Terkunci',
    message: ''
  }
  showHelpModal.value = false
  showSuccessModal.value = true
  isSubmittingHelp.value = false

  // Background sync ke API serverless tanpa menahan antarmuka
  try {
    fetch('/api/v1/support-tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {})
  } catch (e) {}
}

// Konfigurasi 8 Slide Login dengan teks Bahasa Indonesia
const currentSlide = ref(0)
let sliderTimer = null
let isPaused = false

const slides = [
  {
    id: 1,
    image: slide1,
    title: 'Perencanaan KBM Cerdas',
    subtitle: 'Kemudahan menyusun dan mengelola seluruh jadwal pembelajaran sekolah secara otomatis.'
  },
  {
    id: 2,
    image: slide2,
    title: 'Proses Belajar Menyenangkan',
    subtitle: 'Distribusi jam teratur mendukung kegiatan belajar mengajar yang efektif dan terstruktur.'
  },
  {
    id: 3,
    image: slide3,
    title: 'Menyambut Masa Depan Siswa',
    subtitle: 'Waktu belajar yang tertata rapi memberi ruang terbaik bagi tumbuh kembang anak.'
  },
  {
    id: 4,
    image: slide4,
    title: 'Kolaborasi Tim Kurikulum',
    subtitle: 'Sinergi kepala sekolah, waka kurikulum, dan dewan guru dalam satu ekosistem sistem terintegrasi.'
  },
  {
    id: 5,
    image: slide5,
    title: 'Ruang Kelas yang Produktif',
    subtitle: 'Deteksi bentrok otomatis memastikan setiap kelas memiliki pengampu yang tepat pada setiap jam.'
  },
  {
    id: 6,
    image: slide6,
    title: 'Otomasi Jadwal Anti Bentrok',
    subtitle: 'Sistem cerdas memetakan jam mengajar guru, ruang kelas, dan mata pelajaran dalam sekejap.'
  },
  {
    id: 7,
    image: slide7,
    title: 'Generasi Penuh Prestasi',
    subtitle: 'Mendukung prestasi generasi sekolah dengan kedisiplinan dan jadwal belajar yang tepat sasaran.'
  },
  {
    id: 8,
    image: slide8,
    title: 'Harmoni Seluruh Warga Sekolah',
    subtitle: 'Transparansi beban mengajar 24 JP sertifikasi dan keadilan distribusi jam guru terjamin.'
  }
]

const startSliderTimer = () => {
  if (sliderTimer) clearInterval(sliderTimer)
  sliderTimer = setInterval(() => {
    if (!isPaused) {
      currentSlide.value = (currentSlide.value + 1) % slides.length
    }
  }, 5000)
}

const pauseSlider = () => {
  isPaused = true
}

const resumeSlider = () => {
  isPaused = false
}

const goToSlide = (index) => {
  currentSlide.value = index
  startSliderTimer() // Reset timer setelah klik manual
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length
  startSliderTimer()
}

const nextSlideManual = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length
  startSliderTimer()
}

// Logika Lupa Password
const showForgotPassword = ref(false)
const approvedNotification = ref(false)
const forgotForm = ref({ username: '', newPassword: '', requestPermission: false })

const submitForgotPassword = async () => {
  if (!forgotForm.value.requestPermission) {
    alert("Mohon centang kotak permintaan izin ke admin.")
    return
  }
  
  try {
    const res = await fetch('/api/v1/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: forgotForm.value.username, 
        new_password: forgotForm.value.newPassword 
      })
    })

    const data = await res.json()
    if (!res.ok) {
      alert("Error: " + (data.error || "Gagal mengajukan permintaan"))
      return
    }

    alert("Pengajuan perubahan password telah dikirim ke Pusat Komando Super Admin. Silakan tunggu konfirmasi!")
    showForgotPassword.value = false
    forgotForm.value = { username: '', newPassword: '', requestPermission: false }
  } catch (err) {
    alert("Terjadi kesalahan jaringan.")
  }
}

const handleLogin = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    const response = await fetch('/api/v1/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      showAnimation.value = true
      
      // Decode JWT token untuk mendapatkan peran akun
      const token = data.token
      localStorage.setItem('token', token)
      
      const payloadBase64 = token.split('.')[1]
      const decodedPayload = JSON.parse(atob(payloadBase64))
      
      localStorage.setItem('user_role', decodedPayload.role)
      if (decodedPayload.school_id) {
        localStorage.setItem('school_id', decodedPayload.school_id)
      }
      if (decodedPayload.valid_until) {
        localStorage.setItem('valid_until', decodedPayload.valid_until)
      }

      // Ambil nama sekolah khusus untuk teks animasi (jika bukan super admin)
      let schoolName = "sekolah yang tervalidasi"
      if (decodedPayload.school_id) {
        try {
          const profileRes = await fetch('/api/v1/school/profile', {
            headers: { 'X-School-ID': decodedPayload.school_id }
          })
          if (profileRes.ok) {
            const profileData = await profileRes.json()
            if (profileData.name) {
              schoolName = profileData.name
            }
          }
        } catch(e) {}
      }

      // Animasi pergantian teks kilat & responsif
      setTimeout(() => {
        loadingText.value = 'Data berhasil tervalidasi...'
      }, 350)
      
      setTimeout(() => {
        loadingText.value = `Siap mengunggah data (${schoolName})...`
      }, 700)

      // Redirect cepat (total 1.1 detik)
      setTimeout(() => {
        if (decodedPayload.role === 'SUPER_ADMIN') {
          router.push('/super-admin')
        } else if (decodedPayload.role === 'SCHOOL_ADMIN') {
          router.push('/admin-sekolah')
        } else {
          router.push('/guru')
        }
      }, 1100)
      
    } else {
      alert("Login Gagal: " + (data.error || "Password salah atau username tidak ditemukan"))
    }
  } catch (error) {
    alert("Terjadi kesalahan jaringan saat masuk.")
  } finally {
    isSubmitting.value = false
  }
}

let approvalInterval = null

const checkApproval = async () => {
  if (!username.value && !forgotForm.value.username) return
  const uname = username.value || forgotForm.value.username
  if (!uname) return

  try {
    const res = await fetch(`/api/v1/forgot-password/status?username=${encodeURIComponent(uname)}`)
    const data = await res.json()
    if (res.ok && data.status === 'APPROVED') {
      approvedNotification.value = true
      
      // Stop polling karena sudah disetujui
      if (approvalInterval) {
        clearInterval(approvalInterval)
        approvalInterval = null
      }

      // Auto-hilangkan notifikasi setelah 10 detik
      setTimeout(() => {
        approvedNotification.value = false
      }, 10000)
    }
  } catch(e) {}
}

onMounted(() => {
  // Preload gambar animasi agar instan tanpa loading
  const img = new Image()
  img.src = animasiImg
  const img2 = new Image()
  img2.src = aduanSuksesImg

  // Mulai perputaran slide 5 detik
  startSliderTimer()

  // Cek langsung status persetujuan
  checkApproval()
  
  approvalInterval = setInterval(() => {
    checkApproval()
  }, 1000)
})

onUnmounted(() => {
  if (sliderTimer) clearInterval(sliderTimer)
  if (approvalInterval) clearInterval(approvalInterval)
})
</script>

<style scoped>
@keyframes fadeScale {
  0% {
    opacity: 0;
    transform: scale(0.94);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-scale {
  animation: fadeScale 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(6px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes bounceGentle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.animate-bounce-gentle {
  animation: bounceGentle 2.4s ease-in-out infinite;
}

@keyframes popIn {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(24px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-pop-in {
  animation: popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
</style>
