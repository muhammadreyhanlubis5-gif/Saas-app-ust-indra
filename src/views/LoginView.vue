<template>
  <!-- Loading Animation Overlay (Menyiapkan Workspace) -->
  <div v-if="showAnimation" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/95 backdrop-blur-sm transition-opacity duration-300">
    <div class="relative flex flex-col items-center">
      <img :src="animasiImg" alt="Loading..." class="w-48 h-48 object-contain z-10" />
      <h2 class="mt-8 text-2xl font-semibold text-white tracking-wide z-10">Menyiapkan Ruang Kerja Anda...</h2>
      <p class="mt-3 text-blue-300 text-sm font-medium z-10 animate-pulse transition-all duration-300">{{ loadingText }}</p>
    </div>
  </div>

  <!-- Main Background Container (Responsif di semua ukuran layar) -->
  <div class="min-h-screen w-full flex items-center justify-center bg-[#eaedf7] font-sans p-3 sm:p-6 lg:p-8">
    
    <!-- Central Modern Card (Split Two-Column Layout) -->
    <div class="w-full max-w-sm sm:max-w-md md:max-w-4xl bg-white rounded-3xl md:rounded-[36px] shadow-[0_25px_70px_-15px_rgba(20,35,90,0.22)] overflow-hidden flex flex-col md:flex-row border border-slate-200/60 my-auto transition-all duration-300">
      
      <!-- LEFT PANEL: Slider Otomatis (Interval 5 detik, Latar Royal Blue Mewah) -->
      <div 
        class="w-full md:w-[48%] bg-[#263D9B] text-white p-6 sm:p-8 md:p-10 flex flex-col justify-between items-center relative overflow-hidden select-none min-h-[360px] sm:min-h-[420px] md:min-h-[520px]"
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

        <!-- Konten Slide Tengah dengan transisi halus -->
        <div class="relative z-10 w-full flex flex-col items-center justify-center my-auto text-center py-2 sm:py-4">
          
          <!-- Wadah Grafis Slide (Ketinggian terukur agar tidak goyang) -->
          <div class="h-36 sm:h-44 md:h-56 flex items-center justify-center mb-3 sm:mb-4 transition-all duration-500">
            
            <!-- SLIDE 1: Ilustrasi Astronot -->
            <div v-if="currentSlide === 0" class="relative animate-fade-scale flex items-center justify-center">
              <div class="w-36 h-36 sm:w-44 sm:h-44 md:w-56 md:h-56 flex items-center justify-center">
                <img 
                  src="/astronaut.png" 
                  alt="Selamat Datang" 
                  class="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]" 
                />
              </div>
            </div>

            <!-- SLIDE 2: Ilustrasi Matriks Jadwal Anti-Bentrok -->
            <div v-else-if="currentSlide === 1" class="relative animate-fade-scale flex items-center justify-center">
              <div class="w-36 h-36 sm:w-44 sm:h-44 md:w-56 md:h-56 flex items-center justify-center">
                <svg class="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <!-- Papan Utama -->
                  <rect x="20" y="25" width="160" height="150" rx="16" fill="#1E2F79" stroke="#3D56C5" stroke-width="2.5"/>
                  <rect x="20" y="25" width="160" height="32" rx="16" fill="#283FA8"/>
                  <circle cx="38" cy="41" r="4" fill="#60A5FA"/>
                  <circle cx="50" cy="41" r="4" fill="#93C5FD"/>
                  <circle cx="62" cy="41" r="4" fill="#BFDBFE"/>
                  <rect x="80" y="37" width="55" height="8" rx="4" fill="#ffffff" fill-opacity="0.6"/>
                  
                  <!-- Indikator Hari -->
                  <rect x="32" y="66" width="30" height="6" rx="3" fill="#60A5FA" fill-opacity="0.9"/>
                  <rect x="68" y="66" width="30" height="6" rx="3" fill="#ffffff" fill-opacity="0.4"/>
                  <rect x="104" y="66" width="30" height="6" rx="3" fill="#ffffff" fill-opacity="0.4"/>
                  <rect x="140" y="66" width="28" height="6" rx="3" fill="#ffffff" fill-opacity="0.4"/>
                  
                  <!-- Baris 1 -->
                  <rect x="32" y="80" width="136" height="24" rx="8" fill="#2563EB" fill-opacity="0.4" stroke="#3B82F6" stroke-width="1.5"/>
                  <rect x="42" y="87" width="45" height="10" rx="3" fill="#93C5FD"/>
                  <rect x="94" y="88" width="30" height="8" rx="2" fill="#ffffff" fill-opacity="0.6"/>
                  <circle cx="152" cy="92" r="5" fill="#10B981"/>

                  <!-- Baris 2 -->
                  <rect x="32" y="110" width="136" height="24" rx="8" fill="#4F46E5" fill-opacity="0.4" stroke="#6366F1" stroke-width="1.5"/>
                  <rect x="42" y="117" width="52" height="10" rx="3" fill="#C7D2FE"/>
                  <rect x="101" y="118" width="26" height="8" rx="2" fill="#ffffff" fill-opacity="0.6"/>
                  <circle cx="152" cy="122" r="5" fill="#10B981"/>

                  <!-- Baris 3 -->
                  <rect x="32" y="140" width="136" height="24" rx="8" fill="#0D9488" fill-opacity="0.4" stroke="#14B8A6" stroke-width="1.5"/>
                  <rect x="42" y="147" width="40" height="10" rx="3" fill="#99F6E4"/>
                  <rect x="89" y="148" width="35" height="8" rx="2" fill="#ffffff" fill-opacity="0.6"/>
                  <circle cx="152" cy="152" r="5" fill="#10B981"/>

                  <!-- Badge Anti-Bentrok -->
                  <rect x="98" y="15" width="86" height="26" rx="13" fill="#10B981"/>
                  <path d="M110 28L114 32L122 24" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                  <text x="127" y="32" fill="white" font-size="8.5" font-weight="bold" font-family="sans-serif">Anti Bentrok</text>
                </svg>
              </div>
            </div>

            <!-- SLIDE 3: Ilustrasi Sinkronisasi Master Data -->
            <div v-else-if="currentSlide === 2" class="relative animate-fade-scale flex items-center justify-center">
              <div class="w-36 h-36 sm:w-44 sm:h-44 md:w-56 md:h-56 flex items-center justify-center">
                <svg class="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <!-- Garis Penghubung -->
                  <path d="M100 55 L50 135 M100 55 L150 135 M50 135 L150 135" stroke="#4C65D6" stroke-width="2.5" stroke-dasharray="4 3"/>
                  
                  <!-- Titik Pusat -->
                  <circle cx="100" cy="108" r="22" fill="#1E2F79" stroke="#60A5FA" stroke-width="2.5"/>
                  <path d="M93 108 L98 103 L98 106 C105 106 109 108 111 113 C109 110 106 109 98 109 L98 113 Z" fill="#60A5FA"/>

                  <!-- Simpul Guru -->
                  <circle cx="100" cy="50" r="24" fill="#2563EB" stroke="#93C5FD" stroke-width="2"/>
                  <path d="M100 42 A5 5 0 1 0 100 52 A5 5 0 1 0 100 42 M90 59 C90 55 94 54 100 54 C106 54 110 55 110 59" stroke="white" stroke-width="2" stroke-linecap="round"/>

                  <!-- Simpul Kelas -->
                  <circle cx="48" cy="140" r="24" fill="#4F46E5" stroke="#A5B4FC" stroke-width="2"/>
                  <path d="M40 134 H56 V148 H40 Z M44 134 V148 M48 134 V148 M52 134 V148" stroke="white" stroke-width="1.8" stroke-linecap="round"/>

                  <!-- Simpul 24 JP -->
                  <circle cx="152" cy="140" r="24" fill="#059669" stroke="#6EE7B7" stroke-width="2"/>
                  <text x="141" y="143" fill="white" font-size="9" font-weight="extrabold" font-family="sans-serif">24</text>
                  <text x="154" y="143" fill="#A7F3D0" font-size="7" font-weight="bold" font-family="sans-serif">JP</text>
                  <path d="M145 149 L159 149" stroke="#6EE7B7" stroke-width="1.5" stroke-linecap="round"/>

                  <!-- Lencana Sinkron -->
                  <rect x="58" y="166" width="84" height="24" rx="12" fill="#1E2F79" stroke="#3B82F6" stroke-width="1.5"/>
                  <circle cx="70" cy="178" r="3.5" fill="#10B981"/>
                  <text x="79" y="181" fill="white" font-size="8" font-weight="bold" font-family="sans-serif">Sinkron Otomatis</text>
                </svg>
              </div>
            </div>

            <!-- SLIDE 4: Ilustrasi Dokumen Ekspor & Matriks Cetak -->
            <div v-else-if="currentSlide === 3" class="relative animate-fade-scale flex items-center justify-center">
              <div class="w-36 h-36 sm:w-44 sm:h-44 md:w-56 md:h-56 flex items-center justify-center">
                <svg class="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="50" y="24" width="112" height="142" rx="10" fill="#1E2F79" stroke="#3D56C5" stroke-width="2"/>
                  <rect x="38" y="34" width="112" height="142" rx="10" fill="#FFFFFF"/>
                  <rect x="48" y="44" width="40" height="6" rx="3" fill="#2563EB"/>
                  <rect x="48" y="53" width="70" height="4" rx="2" fill="#94A3B8"/>
                  <line x1="48" y1="62" x2="140" y2="62" stroke="#E2E8F0" stroke-width="1.5"/>
                  
                  <rect x="48" y="68" width="92" height="16" rx="4" fill="#F1F5F9"/>
                  <rect x="52" y="73" width="14" height="6" rx="2" fill="#3B82F6"/>
                  <rect x="70" y="73" width="20" height="6" rx="2" fill="#64748B"/>
                  <rect x="94" y="73" width="20" height="6" rx="2" fill="#64748B"/>
                  <rect x="118" y="73" width="18" height="6" rx="2" fill="#10B981"/>

                  <rect x="48" y="88" width="92" height="16" rx="4" fill="#F8FAFC"/>
                  <rect x="52" y="93" width="14" height="6" rx="2" fill="#3B82F6"/>
                  <rect x="70" y="93" width="20" height="6" rx="2" fill="#64748B"/>
                  <rect x="94" y="93" width="20" height="6" rx="2" fill="#64748B"/>
                  <rect x="118" y="93" width="18" height="6" rx="2" fill="#10B981"/>

                  <rect x="48" y="108" width="92" height="16" rx="4" fill="#F1F5F9"/>
                  <rect x="52" y="113" width="14" height="6" rx="2" fill="#3B82F6"/>
                  <rect x="70" y="113" width="20" height="6" rx="2" fill="#64748B"/>
                  <rect x="94" y="113" width="20" height="6" rx="2" fill="#64748B"/>
                  <rect x="118" y="113" width="18" height="6" rx="2" fill="#10B981"/>

                  <!-- Cap Resmi -->
                  <circle cx="126" cy="150" r="14" fill="#FEF2F2" stroke="#EF4444" stroke-width="1.5" stroke-dasharray="2 1"/>
                  <text x="112" y="152" fill="#DC2626" font-size="5" font-weight="bold" font-family="sans-serif">TERVALIDASI</text>

                  <!-- Badge Ekspor -->
                  <rect x="114" y="20" width="66" height="24" rx="6" fill="#10B981"/>
                  <text x="120" y="34" fill="white" font-size="8" font-weight="bold" font-family="sans-serif">FORMAT RESMI</text>
                </svg>
              </div>
            </div>

          </div>

          <!-- Teks Judul & Subjudul Slide -->
          <h3 class="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white mb-1.5 transition-all duration-300">
            {{ slides[currentSlide].title }}
          </h3>
          <p class="text-[11px] sm:text-xs md:text-sm text-blue-100/80 max-w-xs leading-relaxed transition-all duration-300">
            {{ slides[currentSlide].subtitle }}
          </p>
        </div>

        <!-- Titik Indikator Slide (Pagination Dots) -->
        <div class="relative z-10 flex items-center justify-center gap-2.5 pt-2">
          <button 
            v-for="(slide, index) in slides" 
            :key="slide.id"
            @click="goToSlide(index)"
            :title="slide.title"
            class="transition-all duration-300 focus:outline-none cursor-pointer"
            :class="currentSlide === index 
              ? 'w-3 h-3 bg-white rounded-full ring-4 ring-indigo-300/40 shadow-sm scale-110' 
              : 'w-2 h-2 bg-white/40 hover:bg-white/70 rounded-full'"
          >
          </button>
        </div>

      </div>

      <!-- RIGHT PANEL: Formulir Masuk (Clean & Bahasa Indonesia Penuh) -->
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
          
          <!-- Judul "Selamat Datang" -->
          <div class="text-center mb-6 sm:mb-8">
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

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import animasiImg from '../assets/animasi.png'

const router = useRouter()
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const isSubmitting = ref(false)

const showAnimation = ref(false)
const loadingText = ref('Sinkronisasi dengan server...')

// Logika Slider: 4 slide mewah berganti setiap 5 detik
const currentSlide = ref(0)
let sliderTimer = null
let isPaused = false

const slides = [
  {
    id: 1,
    title: 'Selamat Datang di GuruKu',
    subtitle: 'Hanya dengan beberapa klik, jadwal KBM sekolah siap disusun dan diterbitkan.'
  },
  {
    id: 2,
    title: 'Penyusunan Bebas Bentrok',
    subtitle: 'Sistem cerdas otomatis menyusun jadwal KBM tanpa tumpang tindih.'
  },
  {
    id: 3,
    title: 'Sinkronisasi Master Data',
    subtitle: 'Wali kelas, beban mengajar guru, dan 24 JP sertifikasi terhubung seketika.'
  },
  {
    id: 4,
    title: 'Laporan & Matriks Siap Cetak',
    subtitle: 'Cetak jadwal kelas mingguan dan matriks guru berformat resmi sekali klik.'
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
  startSliderTimer() // Reset timer setelah interaksi manual
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

      // Animasi pergantian teks
      setTimeout(() => {
        loadingText.value = 'Data berhasil tervalidasi...'
      }, 1500)
      
      setTimeout(() => {
        loadingText.value = `Siap mengunggah data (${schoolName})...`
      }, 3000)

      // Redirect setelah semua teks selesai terbaca (total 4.5 detik)
      setTimeout(() => {
        if (decodedPayload.role === 'SUPER_ADMIN') {
          router.push('/super-admin')
        } else if (decodedPayload.role === 'SCHOOL_ADMIN') {
          router.push('/admin-sekolah')
        } else {
          router.push('/guru')
        }
      }, 4500)
      
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
  // Preload gambar animasi
  const img = new Image()
  img.src = animasiImg

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
    transform: scale(0.92);
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
</style>
