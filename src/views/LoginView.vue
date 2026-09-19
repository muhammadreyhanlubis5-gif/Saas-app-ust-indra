<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 font-sans">
    
    <!-- Login Card -->
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
      
      <!-- Card Header -->
      <div class="bg-indigo-600 p-6 text-center">
        <h1 class="text-2xl sm:text-3xl font-bold text-white tracking-wide">
          JadwalApp
        </h1>
        <p class="text-indigo-100 mt-2 text-sm sm:text-base">
          Sistem Penjadwalan Sekolah Pintar
        </p>
      </div>

      <!-- Card Body (Form) -->
      <div class="p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          
          <!-- Username Input -->
          <div>
            <label for="username" class="block text-sm font-semibold text-gray-700 mb-2">
              Username
            </label>
            <input 
              type="text" 
              id="username" 
              v-model="username"
              placeholder="Masukkan username Anda"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-800"
              required
            />
          </div>

          <!-- Password Input -->
          <div>
            <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input 
              type="password" 
              id="password" 
              v-model="password"
              placeholder="••••••••"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-800"
              required
            />
          </div>

          <!-- Lupa Password & Submit -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <a href="#" class="text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline transition-colors text-center sm:text-left">
              Lupa Password?
            </a>
            <button 
              type="submit" 
              class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Masuk
            </button>
          </div>

        </form>

        <!-- Divider & Help text -->
        <div class="mt-8 pt-6 border-t border-gray-100 text-center">
          <p class="text-xs text-gray-500">
            © 2026 SaaS Jadwal Sekolah.<br class="sm:hidden" /> Seluruh Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')

const handleLogin = () => {
  // --- MOCK LOGIN LOGIC ---
  // Ini hanya untuk keperluan testing UI sebelum dihubungkan ke backend Go.
  
  const user = username.value.toLowerCase()
  
  if (user === 'admin') {
    localStorage.setItem('token', 'dummy-token')
    localStorage.setItem('user_role', 'SUPER_ADMIN')
    router.push('/super-admin')
  } 
  else if (user === 'sekolah') {
    localStorage.setItem('token', 'dummy-token')
    localStorage.setItem('user_role', 'SCHOOL_ADMIN')
    router.push('/admin-sekolah')
  } 
  else if (user === 'guru') {
    localStorage.setItem('token', 'dummy-token')
    localStorage.setItem('user_role', 'TEACHER')
    router.push('/guru')
  }
  else if (user === 'expired') {
    localStorage.setItem('token', 'dummy-token')
    localStorage.setItem('user_role', 'SCHOOL_ADMIN')
    // Set valid_until ke bulan lalu agar expired
    localStorage.setItem('valid_until', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) 
    router.push('/admin-sekolah') // Router guard akan otomatis melempar ke /expired
  }
  else {
    alert("Coba ketik 'admin', 'sekolah', atau 'guru' untuk melihat dashboard masing-masing.")
  }
}
</script>
