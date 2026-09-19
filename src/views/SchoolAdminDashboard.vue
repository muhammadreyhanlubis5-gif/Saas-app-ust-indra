<template>
  <div class="p-6 bg-gray-50 min-h-screen font-sans">
    <h1 class="text-3xl font-bold mb-2 text-indigo-700">Dashboard Admin Sekolah (Tenant)</h1>
    <p class="text-gray-600 mb-6">Mengelola Data Master & Kredensial Guru Khusus Instansi Anda</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div class="bg-indigo-600 text-white p-6 rounded-lg shadow-md">
        <h3 class="text-lg font-semibold opacity-80 uppercase tracking-wider">Status Kontrak Sistem</h3>
        <p class="text-3xl font-bold mt-2">Aktif s/d 31 Des 2026</p>
      </div>
      <div class="bg-white border-l-4 border-indigo-600 p-6 rounded-lg shadow-md text-gray-800">
        <h3 class="text-lg font-semibold opacity-80 uppercase tracking-wider">Total Guru Terdaftar</h3>
        <p class="text-3xl font-bold mt-2 text-indigo-700">44 <span class="text-lg text-gray-500 font-normal">Guru</span></p>
      </div>
    </div>

    <!-- Kredensial Guru -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-800">Manajemen Kredensial Guru</h2>
        <button class="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 font-medium">
          + Buat Akun Guru
        </button>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white border border-gray-200">
          <thead>
            <tr class="bg-indigo-50 text-indigo-800 text-left">
              <th class="py-3 px-4 font-bold text-sm uppercase tracking-wider">Nama Guru</th>
              <th class="py-3 px-4 font-bold text-sm uppercase tracking-wider">Username (Login)</th>
              <th class="py-3 px-4 font-bold text-sm uppercase tracking-wider">Status Akun</th>
              <th class="py-3 px-4 font-bold text-sm uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="text-gray-700">
            <tr class="border-b hover:bg-gray-50">
              <td class="py-3 px-4 font-medium">Budi Santoso, S.Pd</td>
              <td class="py-3 px-4"><span class="font-mono bg-gray-100 px-2 py-1 rounded text-sm text-gray-800 border">guru.budi</span></td>
              <td class="py-3 px-4"><span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Aktif</span></td>
              <td class="py-3 px-4">
                <button class="text-indigo-600 hover:text-indigo-800 font-medium hover:underline">Reset Password</button>
              </td>
            </tr>
            <tr class="border-b hover:bg-gray-50">
              <td class="py-3 px-4 font-medium">Siti Aminah, M.Pd</td>
              <td class="py-3 px-4"><span class="font-mono bg-gray-100 px-2 py-1 rounded text-sm text-gray-800 border">guru.siti</span></td>
              <td class="py-3 px-4"><span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Aktif</span></td>
              <td class="py-3 px-4">
                <button class="text-indigo-600 hover:text-indigo-800 font-medium hover:underline">Reset Password</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
