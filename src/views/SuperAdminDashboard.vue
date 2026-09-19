<template>
  <div class="p-6 bg-gray-100 min-h-screen font-sans">
    <h1 class="text-3xl font-bold mb-6 text-gray-800">Super Admin Dashboard (Multi-Tenant)</h1>
    
    <!-- Table of Tenants (Schools) -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-700">Daftar Klien Sekolah (Tenants)</h2>
        <button class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-medium">
          + Tambah Klien Baru
        </button>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white border border-gray-200">
          <thead>
            <tr class="bg-gray-800 text-white text-left">
              <th class="py-3 px-4 uppercase font-semibold text-sm rounded-tl-lg">Nama Sekolah</th>
              <th class="py-3 px-4 uppercase font-semibold text-sm">Status Kontrak</th>
              <th class="py-3 px-4 uppercase font-semibold text-sm">Batas Waktu (valid_until)</th>
              <th class="py-3 px-4 uppercase font-semibold text-sm">Jumlah Guru</th>
              <th class="py-3 px-4 uppercase font-semibold text-sm rounded-tr-lg">Aksi</th>
            </tr>
          </thead>
          <tbody class="text-gray-700">
            <tr class="border-b hover:bg-gray-50">
              <td class="py-3 px-4 font-medium">SMA Negeri 1 Jakarta</td>
              <td class="py-3 px-4"><span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">Aktif</span></td>
              <td class="py-3 px-4">31 Des 2026</td>
              <td class="py-3 px-4">44 Guru</td>
              <td class="py-3 px-4">
                <button class="text-blue-500 hover:text-blue-700 font-medium mr-3">Edit</button>
                <button class="text-red-500 hover:text-red-700 font-medium">Blokir</button>
              </td>
            </tr>
            <tr class="border-b hover:bg-gray-50 bg-red-50">
              <td class="py-3 px-4 font-medium">SMP Harapan Bangsa</td>
              <td class="py-3 px-4"><span class="bg-red-200 text-red-800 px-3 py-1 rounded-full text-xs font-bold">Expired</span></td>
              <td class="py-3 px-4 text-red-600 font-semibold">01 Jan 2026</td>
              <td class="py-3 px-4">20 Guru</td>
              <td class="py-3 px-4">
                <button class="text-blue-500 hover:text-blue-700 font-medium mr-3">Perpanjang</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
