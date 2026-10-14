<template>
  <div class="space-y-6 animate-fade-in font-sans pb-12">
    
    <!-- HEADER & BANNER UTAMA -->
    <div class="bg-gradient-to-br from-[#263D9B] via-[#1f3282] to-[#182664] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-950/20 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <!-- Ornamen Latar -->
      <div class="absolute -top-16 -right-16 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-16 -left-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 max-w-xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-200 mb-3">
          <svg class="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          <span>Pusat Layanan & Dukungan Sistem</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-black tracking-tight leading-tight">Pusat Bantuan, Saran & Aduan</h1>
        <p class="text-sm text-blue-100/90 mt-2 leading-relaxed font-medium">
          Kelola laporan kendala login, masukan dan saran dari guru atau warga sekolah, serta konsultasi langsung dengan tim teknis SaaS GuruKu.
        </p>
      </div>

      <div class="relative z-10 flex flex-wrap gap-3">
        <a 
          href="https://wa.me/6281234567890?text=Halo%20Admin%20GuruKu,%20saya%20membutuhkan%20bantuan%20teknis%20aplikasi%20jadwal." 
          target="_blank" 
          rel="noopener noreferrer"
          class="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
          <span>Hubungi Bantuan WhatsApp</span>
        </a>
      </div>
    </div>

    <!-- STATISTIK KARTU IKHTISAR -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      
      <div class="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Aduan & Saran</p>
          <p class="text-2xl sm:text-3xl font-black text-slate-800 mt-1">{{ tickets.length }}</p>
          <p class="text-[11px] text-blue-600 font-semibold mt-1">Laporan dari Login & Internal</p>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        </div>
      </div>

      <div class="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Menunggu Ditinjau</p>
          <p class="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{{ pendingTicketsCount }}</p>
          <p class="text-[11px] text-amber-600 font-semibold mt-1">Perlu tindak lanjut admin</p>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
      </div>

      <div class="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Sedang Diproses</p>
          <p class="text-2xl sm:text-3xl font-black text-indigo-600 mt-1">{{ inProgressTicketsCount }}</p>
          <p class="text-[11px] text-indigo-600 font-semibold mt-1">Dalam penanganan</p>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
        </div>
      </div>

      <div class="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Terselesaikan</p>
          <p class="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{{ resolvedTicketsCount }}</p>
          <p class="text-[11px] text-emerald-600 font-semibold mt-1">Solusi telah diberikan</p>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
      </div>

    </div>

    <!-- TABS NAVIGASI MENU BANTUAN -->
    <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      
      <div class="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-2">
        <button 
          @click="activeSubTab = 'aduan'" 
          :class="activeSubTab === 'aduan' ? 'bg-[#263D9B] text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/60'"
          class="px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          <span>Daftar Aduan & Saran Masuk</span>
          <span v-if="pendingTicketsCount > 0" class="ml-1 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
            {{ pendingTicketsCount }}
          </span>
        </button>

        <button 
          @click="activeSubTab = 'faq'" 
          :class="activeSubTab === 'faq' ? 'bg-[#263D9B] text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/60'"
          class="px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span>Panduan Cepat & Solusi Masalah (FAQ)</span>
        </button>

        <button 
          @click="activeSubTab = 'kirim'" 
          :class="activeSubTab === 'kirim' ? 'bg-[#263D9B] text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/60'"
          class="px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
          <span>Kirim Aduan / Permintaan Baru</span>
        </button>
      </div>

      <!-- KONTEN TAB 1: DAFTAR ADUAN & SARAN -->
      <div v-if="activeSubTab === 'aduan'" class="p-6">
        
        <!-- Filter & Pencarian -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div class="relative w-full sm:w-80">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Cari pelapor, kontak, atau pesan..." 
              class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#263D9B] focus:ring-2 focus:ring-[#263D9B]/10 transition-all bg-white"
            />
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <select v-model="filterStatus" class="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#263D9B]">
              <option value="ALL">Semua Status</option>
              <option value="MENUNGGU">Menunggu</option>
              <option value="DIPROSES">Diproses</option>
              <option value="SELESAI">Selesai</option>
            </select>
            
            <button 
              @click="loadTickets" 
              class="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title="Perbarui Data"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            </button>
          </div>
        </div>

        <!-- Tabel Daftar Aduan -->
        <div class="overflow-x-auto rounded-2xl border border-slate-100">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 text-slate-400 uppercase text-[11px] font-black tracking-wider border-b border-slate-100">
                <th class="py-3.5 px-4">Tanggal & Pelapor</th>
                <th class="py-3.5 px-4">Kategori & Asal</th>
                <th class="py-3.5 px-4">Uraian Aduan / Saran</th>
                <th class="py-3.5 px-4 text-center">Status</th>
                <th class="py-3.5 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs text-slate-700">
              <tr v-if="filteredTickets.length === 0">
                <td colspan="5" class="py-12 text-center text-slate-400 font-medium">
                  <svg class="w-12 h-12 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  Tidak ada aduan atau saran yang sesuai dengan filter.
                </td>
              </tr>
              <tr v-for="item in filteredTickets" :key="item.id" class="hover:bg-slate-50/80 transition-colors">
                
                <!-- Pelapor & Kontak -->
                <td class="py-4 px-4">
                  <p class="font-bold text-slate-800 text-sm">{{ item.name }}</p>
                  <p class="text-[11px] text-indigo-600 font-semibold mt-0.5">{{ item.contact || '-' }}</p>
                  <p class="text-[10px] text-slate-400 mt-1">{{ item.date }}</p>
                </td>

                <!-- Kategori & Asal -->
                <td class="py-4 px-4">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold"
                    :class="{
                      'bg-rose-50 text-rose-700 border border-rose-200': item.category === 'Kendala Login / Akun Terkunci',
                      'bg-amber-50 text-amber-700 border border-amber-200': item.category === 'Lupa Username / Password',
                      'bg-purple-50 text-purple-700 border border-purple-200': item.category === 'Laporan Bug / Error Sistem',
                      'bg-blue-50 text-blue-700 border border-blue-200': item.category === 'Saran & Masukan Pengembangan',
                      'bg-slate-100 text-slate-700': !item.category
                    }"
                  >
                    {{ item.category || 'Umum' }}
                  </span>
                  <p class="text-[11px] text-slate-500 font-medium mt-1">{{ item.school || 'Pengguna Mandiri' }}</p>
                </td>

                <!-- Uraian Pesan -->
                <td class="py-4 px-4 max-w-xs md:max-w-md">
                  <p class="text-xs text-slate-700 leading-relaxed font-medium line-clamp-3">
                    "{{ item.message }}"
                  </p>
                </td>

                <!-- Status Badge -->
                <td class="py-4 px-4 text-center">
                  <span 
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide"
                    :class="{
                      'bg-amber-100 text-amber-800': item.status === 'MENUNGGU',
                      'bg-blue-100 text-blue-800': item.status === 'DIPROSES',
                      'bg-emerald-100 text-emerald-800': item.status === 'SELESAI'
                    }"
                  >
                    <span class="w-1.5 h-1.5 rounded-full"
                      :class="{
                        'bg-amber-500': item.status === 'MENUNGGU',
                        'bg-blue-500': item.status === 'DIPROSES',
                        'bg-emerald-500': item.status === 'SELESAI'
                      }"
                    ></span>
                    {{ item.status }}
                  </span>
                </td>

                <!-- Aksi -->
                <td class="py-4 px-4 text-right space-x-1 whitespace-nowrap">
                  <button 
                    v-if="item.contact"
                    @click="contactWhatsApp(item.contact, item.name)" 
                    class="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition-colors border border-emerald-200 cursor-pointer"
                    title="Hubungi Via WhatsApp"
                  >
                    WhatsApp
                  </button>
                  <button 
                    v-if="item.status !== 'SELESAI'"
                    @click="updateStatus(item.id, 'SELESAI')" 
                    class="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#263D9B] font-bold text-[11px] transition-colors border border-blue-200 cursor-pointer"
                    title="Tandai Selesai"
                  >
                    Selesaikan
                  </button>
                  <button 
                    @click="deleteTicket(item.id)" 
                    class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Hapus Aduan"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </td>

              </tr>
            </tbody>
          </table>
        </div>

      </div>

      <!-- KONTEN TAB 2: PANDUAN CEPAT (FAQ) -->
      <div v-else-if="activeSubTab === 'faq'" class="p-6 space-y-4">
        
        <div class="mb-4">
          <h2 class="text-lg font-bold text-slate-800">Pertanyaan yang Sering Diajukan (FAQ)</h2>
          <p class="text-xs text-slate-500">Panduan solusi cepat atas kendala umum penyusunan jadwal sekolah.</p>
        </div>

        <div class="space-y-3">
          
          <div v-for="(item, idx) in faqList" :key="idx" class="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <button 
              type="button" 
              @click="item.open = !item.open"
              class="w-full p-4 text-left flex items-center justify-between font-bold text-sm text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <span class="flex items-center gap-2.5">
                <span class="w-6 h-6 rounded-full bg-blue-50 text-[#263D9B] text-xs flex items-center justify-center flex-shrink-0 font-bold">{{ idx + 1 }}</span>
                <span>{{ item.question }}</span>
              </span>
              <svg class="w-5 h-5 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': item.open }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div v-show="item.open" class="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
              <p>{{ item.answer }}</p>
            </div>
          </div>

        </div>

      </div>

      <!-- KONTEN TAB 3: KIRIM ADUAN / TIKET BARU -->
      <div v-else-if="activeSubTab === 'kirim'" class="p-6 max-w-2xl">
        
        <div class="mb-6">
          <h2 class="text-lg font-bold text-slate-800">Kirim Tiket Masalah / Saran Internal</h2>
          <p class="text-xs text-slate-500">Tiket akan langsung diteruskan ke Pusat Komando Super Admin GuruKu.</p>
        </div>

        <form @submit.prevent="submitDirectTicket" class="space-y-4">
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Nama Pelapor / Pengirim</label>
              <input 
                type="text" 
                v-model.trim="newTicket.name" 
                placeholder="Nama Anda / Guru"
                required
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#263D9B] focus:ring-2 focus:ring-[#263D9B]/10 transition-all bg-white"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp / HP</label>
              <input 
                type="text" 
                v-model.trim="newTicket.contact" 
                placeholder="Contoh: 081234567890"
                required
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#263D9B] focus:ring-2 focus:ring-[#263D9B]/10 transition-all bg-white"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Kategori Masalah / Permintaan</label>
            <select 
              v-model="newTicket.category" 
              required
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#263D9B] bg-white"
            >
              <option value="Kendala Login / Akun Terkunci">Kendala Login / Akun Terkunci</option>
              <option value="Lupa Username / Password">Lupa Username / Password</option>
              <option value="Laporan Bug / Error Sistem">Laporan Bug / Error Sistem</option>
              <option value="Saran & Masukan Pengembangan">Saran & Masukan Pengembangan</option>
              <option value="Pertanyaan Teknis Lainnya">Pertanyaan Teknis Lainnya</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Isi Laporan / Saran / Pertanyaan</label>
            <textarea 
              v-model.trim="newTicket.message" 
              rows="4" 
              placeholder="Jelaskan kendala atau saran Anda secara rinci agar admin dapat memberikan bantuan yang tepat..."
              required
              class="w-full p-4 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#263D9B] focus:ring-2 focus:ring-[#263D9B]/10 transition-all bg-white leading-relaxed"
            ></textarea>
          </div>

          <div class="pt-2 flex justify-end">
            <button 
              type="submit" 
              class="px-6 py-3 rounded-xl bg-[#263D9B] hover:bg-[#1d3080] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              <span>Kirim Tiket Aduan</span>
            </button>
          </div>

        </form>

      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { SafeFlow } from '../core/SafeFlow.js'

const activeSubTab = ref('aduan')
const searchQuery = ref('')
const filterStatus = ref('ALL')

const tickets = ref([])

const initialSampleTickets = [
  {
    id: 'TICK-101',
    name: 'Drs. Hendro Wibowo',
    contact: '081298765432',
    school: 'SMP Negeri 1 Surabaya',
    category: 'Kendala Login / Akun Terkunci',
    message: 'Saya tidak bisa masuk ke akun guru karena password salah setelah reset kemarin. Mohon bantuannya admin.',
    status: 'MENUNGGU',
    date: '14 Okt 2026, 17:30'
  },
  {
    id: 'TICK-102',
    name: 'Siti Aminah, M.Pd',
    contact: '085712345678',
    school: 'SMA Budi Luhur',
    category: 'Saran & Masukan Pengembangan',
    message: 'Aplikasi jadwalnya sudah sangat bagus. Apakah bisa ditambahkan warna khusus pada saat cetak PDF jadwal guru agar lebih menarik?',
    status: 'DIPROSES',
    date: '14 Okt 2026, 15:10'
  },
  {
    id: 'TICK-103',
    name: 'Ahmad Fauzi',
    contact: '081399887766',
    school: 'MTs Al-Ikhlas',
    category: 'Laporan Bug / Error Sistem',
    message: 'Data nama guru di daftar kelas sudah otomatis sinkron, terima kasih banyak atas fitur otomatisnya!',
    status: 'SELESAI',
    date: '13 Okt 2026, 09:25'
  }
]

const loadTickets = async () => {
  try {
    const res = await SafeFlow.fetch('/api/v1/support-tickets')
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        tickets.value = data
        localStorage.setItem('guruKu_support_tickets', JSON.stringify(data))
        return
      }
    }
  } catch (e) {
    console.warn("Gagal memuat tiket dari database:", e)
  }

  try {
    const raw = localStorage.getItem('guruKu_support_tickets')
    if (raw) {
      tickets.value = JSON.parse(raw)
    } else {
      tickets.value = initialSampleTickets
      localStorage.setItem('guruKu_support_tickets', JSON.stringify(initialSampleTickets))
    }
  } catch (e) {
    tickets.value = initialSampleTickets
  }
}

const saveTickets = () => {
  localStorage.setItem('guruKu_support_tickets', JSON.stringify(tickets.value))
}

const pendingTicketsCount = computed(() => {
  return tickets.value.filter(t => t.status === 'MENUNGGU').length
})

const inProgressTicketsCount = computed(() => {
  return tickets.value.filter(t => t.status === 'DIPROSES').length
})

const resolvedTicketsCount = computed(() => {
  return tickets.value.filter(t => t.status === 'SELESAI').length
})

const filteredTickets = computed(() => {
  return tickets.value.filter(t => {
    const matchStatus = filterStatus.value === 'ALL' || t.status === filterStatus.value
    const q = searchQuery.value.toLowerCase()
    const matchQuery = !q || 
      t.name.toLowerCase().includes(q) || 
      (t.contact && t.contact.toLowerCase().includes(q)) || 
      (t.school && t.school.toLowerCase().includes(q)) || 
      t.message.toLowerCase().includes(q) ||
      (t.category && t.category.toLowerCase().includes(q))
    return matchStatus && matchQuery
  })
})

const updateStatus = async (id, newStatus) => {
  const item = tickets.value.find(t => t.id === id)
  if (item) {
    item.status = newStatus
    saveTickets()
  }

  try {
    await SafeFlow.fetch(`/api/v1/support-tickets/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
  } catch (err) {
    console.error("Gagal update status tiket:", err)
  }
}

const deleteTicket = async (id) => {
  if (confirm("Hapus aduan ini dari daftar?")) {
    tickets.value = tickets.value.filter(t => t.id !== id)
    saveTickets()

    try {
      await SafeFlow.fetch(`/api/v1/support-tickets/${id}`, {
        method: 'DELETE'
      })
    } catch (err) {
      console.error("Gagal menghapus tiket:", err)
    }
  }
}

const contactWhatsApp = (phone, name) => {
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  const intlPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone
  const msg = encodeURIComponent(`Halo Bpk/Ibu ${name}, kami dari Tim Layanan GuruKu menindaklanjuti aduan/saran Anda mengenai aplikasi jadwal.`)
  window.open(`https://wa.me/${intlPhone}?text=${msg}`, '_blank')
}

// Form Tiket Baru
const newTicket = ref({
  name: '',
  contact: '',
  category: 'Kendala Login / Akun Terkunci',
  message: ''
})

const submitDirectTicket = async () => {
  const schoolName = localStorage.getItem('school_name') || 'Admin Sekolah'
  const payload = {
    name: newTicket.value.name,
    contact: newTicket.value.contact,
    school: schoolName,
    category: newTicket.value.category,
    message: newTicket.value.message
  }

  let createdTicket = null
  try {
    const res = await SafeFlow.fetch('/api/v1/support-tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      const data = await res.json()
      createdTicket = data.ticket
    }
  } catch (err) {
    console.warn("API support tickets fallback:", err)
  }

  const now = new Date()
  const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + 
                  now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  const ticketObj = createdTicket || {
    id: 'TICK-' + Date.now().toString().slice(-4),
    name: newTicket.value.name,
    contact: newTicket.value.contact,
    school: schoolName,
    category: newTicket.value.category,
    message: newTicket.value.message,
    status: 'MENUNGGU',
    date: dateStr
  }

  tickets.value.unshift(ticketObj)
  saveTickets()

  alert("Aduan berhasil disimpan dan diteruskan ke Tim Administrator.")
  newTicket.value = {
    name: '',
    contact: '',
    category: 'Kendala Login / Akun Terkunci',
    message: ''
  }
  activeSubTab.value = 'aduan'
}

// Daftar FAQ
const faqList = ref([
  {
    question: 'Bagaimana cara mengatasi jadwal guru atau kelas yang bentrok?',
    answer: 'Sistem GuruKu secara otomatis mendeteksi bentrok saat Anda menyusun pengampu dan alokasi sesi KBM. Pastikan guru tidak ditugaskan pada jam yang sama di kelas berbeda, atau gunakan fitur deteksi otomatis di menu Jadwal Kelas untuk melihat sel berwarna merah.',
    open: false
  },
  {
    question: 'Bagaimana jika nama wali kelas di Daftar Kelas belum muncul di Daftar Guru?',
    answer: 'Sistem telah dilengkapi fitur auto-sinkronisasi. Ketika Anda menambahkan atau mengunggah data kelas beserta wali kelasnya, sistem secara cerdas akan langsung mendaftarkan guru tersebut ke Daftar Guru dan menambahkan tugas tambahan Wali Kelas secara linier.',
    open: false
  },
  {
    question: 'Bagaimana cara menghitung linieritas 24 JP untuk pencairan sertifikasi guru?',
    answer: 'Masuk ke menu Tugas Tambahan dan Tunjangan Sertifikasi. Beban mengajar tatap muka akan digabungkan secara otomatis dengan tugas tambahan yang diakui (misal: Wali Kelas dihitung 2 JP linier) hingga memenuhi syarat minimal 24 JP.',
    open: false
  },
  {
    question: 'Apakah jadwal kelas dan guru bisa dicetak langsung atau diekspor ke Excel / PDF?',
    answer: 'Ya! Buka menu Jadwal Guru atau Jadwal Kelas, lalu klik tombol "Cetak Matriks" atau "Ekspor Excel/PDF" di bagian atas tabel untuk mendapatkan format resmi berstempel siap pakai.',
    open: false
  }
])

onMounted(() => {
  loadTickets()
})
</script>

<style scoped>
@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(6px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
