<template>
  <div class="animate-fade-in-up p-4 md:p-8 max-w-[1440px] mx-auto space-y-6 font-sans">
    
    <!-- Header Halaman -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <router-link :to="ROUTES.SCHOOL_ADMIN" class="text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
            Dashboard
          </router-link>
          <span class="text-xs text-slate-300">/</span>
          <span class="text-xs font-bold text-slate-600">Keuangan & Aset</span>
        </div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          Keuangan & Aset
        </h1>
        <p class="text-xs md:text-sm text-slate-400 font-medium mt-1">
          Buku kas operasional, pemantauan omzet penjualan, laba kotor, dan inventarisasi aset sekolah.
        </p>
      </div>

      <div class="flex items-center gap-2.5 flex-wrap">
        <button @click="showAddTxModal = true" class="inline-flex items-center gap-2 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          <span>Catat Transaksi</span>
        </button>
        <button @click="showAddAssetModal = true" class="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer">
          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
          <span>Tambah Aset</span>
        </button>
      </div>
    </div>

    <!-- 4 Kartu Statistik Keuangan (Sesuai Dashboard Utama) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      
      <!-- Card 1: Penjualan Bulan Ini -->
      <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Penjualan Bulan Ini</p>
          <span class="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          </span>
        </div>
        <div class="text-2xl font-black text-slate-900 tracking-tight">
          {{ formatRupiah(financialData.penjualanBulanIni) }}
        </div>
        <p class="text-[11px] text-slate-400 font-medium mt-1 truncate">
          semua channel • {{ totalTransactionsCount }} pesanan / pemasukan
        </p>
      </div>

      <!-- Card 2: Pengeluaran Bulan Ini -->
      <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pengeluaran Bulan Ini</p>
          <span class="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
          </span>
        </div>
        <div class="text-2xl font-black text-slate-900 tracking-tight text-rose-600">
          {{ formatRupiah(financialData.pengeluaranBulanIni) }}
        </div>
        <p class="text-[11px] text-slate-400 font-medium mt-1 truncate">
          belanja operasional & HPP
        </p>
      </div>

      <!-- Card 3: Laba Kotor Bulan Ini -->
      <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Laba Kotor Bulan Ini</p>
          <span class="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </span>
        </div>
        <div class="text-2xl font-black text-slate-900 tracking-tight text-blue-700">
          {{ formatRupiah(financialData.labaKotorBulanIni) }}
        </div>
        <p class="text-[11px] text-slate-400 font-medium mt-1 truncate">
          setelah HPP & potongan operasional
        </p>
      </div>

      <!-- Card 4: Saldo Kas Aktif -->
      <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Saldo Kas</p>
          <span class="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
          </span>
        </div>
        <div class="text-2xl font-black text-slate-900 tracking-tight">
          {{ formatRupiah(financialData.saldoKas) }}
        </div>
        <p class="text-[11px] text-slate-400 font-medium mt-1 truncate">
          kas lancar & simpanan resmi
        </p>
      </div>

    </div>

    <!-- Navigasi Tab Internal -->
    <div class="flex items-center gap-2 border-b border-slate-200/80 pb-3">
      <button @click="activeTab = 'ledger'" 
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
        :class="activeTab === 'ledger' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'">
        Buku Kas & Transaksi
      </button>
      <button @click="activeTab = 'assets'" 
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
        :class="activeTab === 'assets' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'">
        Inventaris Aset ({{ assetsList.length }})
      </button>
      <button @click="activeTab = 'summary'" 
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
        :class="activeTab === 'summary' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'">
        Ringkasan & HPP Terhubung
      </button>
    </div>

    <!-- TAB 1: BUKU KAS & TRANSAKSI -->
    <div v-if="activeTab === 'ledger'" class="space-y-4">
      <div class="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-xs">
        
        <!-- Filter & Pencarian -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div class="flex items-center gap-2">
            <button @click="filterType = 'all'" 
              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              :class="filterType === 'all' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-500 hover:bg-slate-50'">
              Semua ({{ transactions.length }})
            </button>
            <button @click="filterType = 'in'" 
              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              :class="filterType === 'in' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-500 hover:bg-slate-50'">
              Pemasukan
            </button>
            <button @click="filterType = 'out'" 
              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              :class="filterType === 'out' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'text-slate-500 hover:bg-slate-50'">
              Pengeluaran
            </button>
          </div>

          <div class="relative w-full sm:w-64">
            <input v-model="searchKeyword" type="text" placeholder="Cari transaksi..." 
              class="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400">
            <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>

        <!-- Tabel Transaksi -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th class="py-3 px-3">Tanggal</th>
                <th class="py-3 px-3">No. Referensi</th>
                <th class="py-3 px-3">Kategori</th>
                <th class="py-3 px-3">Keterangan</th>
                <th class="py-3 px-3">Jenis</th>
                <th class="py-3 px-3 text-right">Nominal</th>
                <th class="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="item in filteredTransactions" :key="item.id" class="hover:bg-slate-50/60 transition-colors">
                <td class="py-3 px-3 text-slate-500 font-medium whitespace-nowrap">{{ item.date }}</td>
                <td class="py-3 px-3 font-mono text-slate-700 font-semibold">{{ item.ref }}</td>
                <td class="py-3 px-3 font-medium text-slate-800">{{ item.category }}</td>
                <td class="py-3 px-3 text-slate-500 max-w-xs truncate">{{ item.description }}</td>
                <td class="py-3 px-3">
                  <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                    :class="item.type === 'in' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'">
                    <span class="w-1.5 h-1.5 rounded-full" :class="item.type === 'in' ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                    {{ item.type === 'in' ? 'Masuk' : 'Keluar' }}
                  </span>
                </td>
                <td class="py-3 px-3 text-right font-bold font-mono"
                  :class="item.type === 'in' ? 'text-emerald-600' : 'text-rose-600'">
                  {{ item.type === 'in' ? '+' : '-' }} {{ formatRupiah(item.amount) }}
                </td>
                <td class="py-3 px-3 text-center">
                  <button @click="deleteTransaction(item.id)" class="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors" title="Hapus Transaksi">
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

    <!-- TAB 2: INVENTARIS ASET -->
    <div v-if="activeTab === 'assets'" class="space-y-4">
      <div class="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-xs">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-bold text-slate-900">Daftar Aset & Fasilitas KBM</h3>
            <p class="text-xs text-slate-400 mt-0.5">Seluruh perangkat keras, infrastruktur server, dan perangkat penunjang.</p>
          </div>
          <div class="text-right">
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Valuasi Aset:</span>
            <p class="text-lg font-black text-slate-900">{{ formatRupiah(totalAssetValuation) }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="asset in assetsList" :key="asset.id" class="border border-slate-200/80 rounded-xl p-4 hover:border-blue-300 transition-colors flex flex-col justify-between bg-slate-50/40">
            <div>
              <div class="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 class="font-bold text-slate-900 text-sm">{{ asset.name }}</h4>
                  <span class="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                    {{ asset.category }}
                  </span>
                </div>
                <span class="text-xs font-black text-slate-800 font-mono">{{ formatRupiah(asset.value) }}</span>
              </div>
              <p class="text-xs text-slate-500 mt-1">{{ asset.spec }}</p>
            </div>
            
            <div class="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
              <span class="text-slate-400 font-medium">Pengadaan: {{ asset.acquisitionDate }}</span>
              <span class="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {{ asset.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: RINGKASAN & KALKULATOR HPP TERHUBUNG -->
    <div v-if="activeTab === 'summary'" class="space-y-4">
      <div class="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-xs">
        <h3 class="text-sm font-bold text-slate-900 mb-2">Sinkronisasi Keuangan & Kalkulator HPP</h3>
        <p class="text-xs text-slate-500 mb-6">
          Setiap perhitungan Harga Pokok Penjualan (HPP) dan estimasi margin laba dapat langsung dihubungkan dengan transaksi di buku kas.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">HPP Standar Terhitung</span>
            <p class="text-xl font-black text-slate-900 mt-1 font-mono">Rp 104.205</p>
            <p class="text-[10px] text-slate-400 mt-0.5">Biaya cloud server & operasional/paket</p>
          </div>
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Harga Jual Rekomendasi</span>
            <p class="text-xl font-black text-slate-900 mt-1 font-mono">Rp 254.205</p>
            <p class="text-[10px] text-slate-400 mt-0.5">Tercermin di Penjualan Bulan Ini</p>
          </div>
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Margin Laba Bersih</span>
            <p class="text-xl font-black text-emerald-600 mt-1 font-mono">Rp 150.000 (59%)</p>
            <p class="text-[10px] text-slate-400 mt-0.5">Laba kotor bersih per unit layanan</p>
          </div>
        </div>

        <router-link :to="ROUTES.KALKULATOR_HPP" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors">
          <span>Buka Kalkulator HPP Lengkap</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </router-link>
      </div>
    </div>

    <!-- MODAL CATAT TRANSAKSI -->
    <div v-if="showAddTxModal" class="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200">
        <h3 class="text-base font-bold text-slate-900 mb-4">Catat Transaksi Baru</h3>
        
        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Jenis Transaksi</label>
            <div class="grid grid-cols-2 gap-2">
              <button @click="newTx.type = 'in'" type="button" 
                class="py-2 rounded-xl font-bold border transition-colors"
                :class="newTx.type === 'in' ? 'bg-emerald-50 text-emerald-700 border-emerald-400' : 'border-slate-200 text-slate-600'">
                + Pemasukan (Omzet)
              </button>
              <button @click="newTx.type = 'out'" type="button" 
                class="py-2 rounded-xl font-bold border transition-colors"
                :class="newTx.type === 'out' ? 'bg-rose-50 text-rose-700 border-rose-400' : 'border-slate-200 text-slate-600'">
                - Pengeluaran (Belanja)
              </button>
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Kategori</label>
            <input v-model="newTx.category" type="text" placeholder="Cth: Penjualan Lisensi / Biaya Server" 
              class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nominal (Rp)</label>
            <input v-model.number="newTx.amount" type="number" placeholder="Cth: 150000" 
              class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono">
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Keterangan</label>
            <textarea v-model="newTx.description" rows="2" placeholder="Catatan transaksi..." 
              class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
          <button @click="showAddTxModal = false" class="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800">Batal</button>
          <button @click="saveNewTransaction" class="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs">Simpan Transaksi</button>
        </div>
      </div>
    </div>

    <!-- MODAL TAMBAH ASET -->
    <div v-if="showAddAssetModal" class="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200">
        <h3 class="text-base font-bold text-slate-900 mb-4">Tambah Aset Baru</h3>
        
        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nama Aset</label>
            <input v-model="newAsset.name" type="text" placeholder="Cth: Komputer Server Jadwal" 
              class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Kategori</label>
            <input v-model="newAsset.category" type="text" placeholder="Cth: Perangkat Keras / Server" 
              class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nilai Aset (Rp)</label>
            <input v-model.number="newAsset.value" type="number" placeholder="Cth: 15000000" 
              class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Spesifikasi / Keterangan</label>
            <input v-model="newAsset.spec" type="text" placeholder="Cth: Intel i7, RAM 32GB, SSD NVMe" 
              class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
          <button @click="showAddAssetModal = false" class="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800">Batal</button>
          <button @click="saveNewAsset" class="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs">Simpan Aset</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ROUTES } from '../config/routePaths.js'

const activeTab = ref('ledger')
const filterType = ref('all')
const searchKeyword = ref('')
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
    description: 'Perpanjangan cloud server database & SSL GuruKu',
    type: 'out',
    amount: 104205
  },
  {
    id: 3,
    date: '28 Okt 2026',
    ref: 'TRX-202610-098',
    category: 'Saldo Awal Kas',
    description: 'Saldo kas awal bulan operasional',
    type: 'in',
    amount: 8215958
  }
]

const transactions = ref([])

// Default Aset Riil
const defaultAssets = [
  {
    id: 1,
    name: 'Server Cloud & Database GuruKu',
    category: 'Infrastruktur Cloud',
    value: 12000000,
    spec: 'Cloud Dedicated Cluster & Automated Backup',
    acquisitionDate: '15 Jan 2026',
    status: 'Aktif & Optimal'
  },
  {
    id: 2,
    name: 'Komputer Server Jadwal KBM',
    category: 'Perangkat Keras',
    value: 18500000,
    spec: 'Intel Core i7 Gen-13, 32GB RAM DDR5, 1TB NVMe',
    acquisitionDate: '02 Mar 2026',
    status: 'Aktif & Optimal'
  },
  {
    id: 3,
    name: 'Printer Matriks & Kartu Jadwal',
    category: 'Perangkat Kantor',
    value: 6200000,
    spec: 'Epson High-Speed Color InkTank Duplex',
    acquisitionDate: '10 Mei 2026',
    status: 'Aktif & Terawat'
  },
  {
    id: 4,
    name: 'Smart Projector Ruang Guru',
    category: 'Fasilitas Akademik',
    value: 8500000,
    spec: '4K Wireless Projection System 4000 Lumens',
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

const formatRupiah = (val) => {
  return 'Rp ' + Number(val || 0).toLocaleString('id-ID')
}

onMounted(() => {
  loadData()
})
</script>
