<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
      <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
      <h1 class="text-2xl font-bold text-gray-800 mb-2">Akses Diblokir</h1>
      <p class="text-gray-600 mb-6">
        Masa aktif kontrak sekolah Anda telah habis. Seluruh fitur sistem dinonaktifkan sementara.
      </p>
      <div class="flex flex-col sm:flex-row justify-center gap-3">
        <button @click="backToLogin" class="bg-gray-100 text-gray-700 px-6 py-2 rounded-full font-medium hover:bg-gray-200 border border-gray-300 transition-colors">
          Kembali ke Login
        </button>
        <button @click="handleUpgrade" class="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 shadow-md transition-colors">
          Upgrade Akses
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const backToLogin = () => {
  localStorage.clear()
  router.push('/')
}

const handleUpgrade = () => {
  // Arahkan ke WhatsApp Super Admin atau halaman pembayaran
  const pesan = encodeURIComponent("Halo Admin Pusat, akun institusi kami telah kedaluwarsa. Kami ingin melakukan Upgrade / Perpanjangan masa aktif kontrak.")
  window.open(`https://wa.me/6281234567890?text=${pesan}`, '_blank')
}
</script>
