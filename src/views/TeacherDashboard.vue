<template>
  <div class="p-6 bg-blue-50 min-h-screen font-sans">
    <div class="max-w-4xl mx-auto">
      <header class="mb-8 flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border-b-4 border-blue-500">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Selamat Datang, Bapak Budi Santoso!</h1>
          <p class="text-gray-500 mt-1">Portal Guru - SMA Negeri 1 Jakarta</p>
        </div>
        <button class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded border">
          Keluar (Logout)
        </button>
      </header>

      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold mb-4 text-blue-800 flex items-center">
          <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          Jadwal Mengajar Saya (Semester Genap)
        </h2>
        
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr class="bg-blue-600 text-white text-left">
                <th class="py-3 px-4 font-bold text-sm uppercase tracking-wider">Hari</th>
                <th class="py-3 px-4 font-bold text-sm uppercase tracking-wider">Jam Ke-</th>
                <th class="py-3 px-4 font-bold text-sm uppercase tracking-wider">Kelas</th>
                <th class="py-3 px-4 font-bold text-sm uppercase tracking-wider">Mata Pelajaran</th>
              </tr>
            </thead>
            <tbody class="text-gray-700">
              <tr class="border-b hover:bg-blue-50 transition">
                <td class="py-4 px-4 font-bold text-blue-900 bg-blue-50/50">Senin</td>
                <td class="py-4 px-4"><span class="bg-gray-100 px-2 py-1 rounded text-sm font-medium border">1 - 2</span> (07:00 - 08:30)</td>
                <td class="py-4 px-4 font-bold">X MIPA 1</td>
                <td class="py-4 px-4">Matematika Wajib</td>
              </tr>
              <tr class="border-b hover:bg-blue-50 transition">
                <td class="py-4 px-4 font-bold text-blue-900 bg-blue-50/50">Senin</td>
                <td class="py-4 px-4"><span class="bg-gray-100 px-2 py-1 rounded text-sm font-medium border">4 - 5</span> (09:45 - 11:15)</td>
                <td class="py-4 px-4 font-bold">XI IPS 2</td>
                <td class="py-4 px-4">Matematika Lanjut</td>
              </tr>
              <tr class="border-b hover:bg-blue-50 transition">
                <td class="py-4 px-4 font-bold text-blue-900 bg-blue-50/50 border-t-2 border-gray-200">Selasa</td>
                <td class="py-4 px-4"><span class="bg-gray-100 px-2 py-1 rounded text-sm font-medium border">3 - 4</span> (08:30 - 10:00)</td>
                <td class="py-4 px-4 font-bold">XII MIPA 1</td>
                <td class="py-4 px-4">Matematika Wajib</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
